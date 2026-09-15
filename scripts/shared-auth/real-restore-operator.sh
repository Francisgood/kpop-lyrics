#!/bin/sh
set -eu
set -o pipefail
umask 077

required() {
  eval "value=\${$1-}"
  [ -n "$value" ] || { echo "operator_error=missing_configuration" >&2; exit 2; }
}

for name in SOURCE_DATABASE_URL TARGET_DATABASE_URL SOURCE_DATABASE_NAME \
  TARGET_DATABASE_NAME SOURCE_READ_ONLY_ROLE TARGET_OWNER_ROLE \
  SOURCE_DATABASE_CA_CERT TARGET_DATABASE_CA_CERT AEGYO_REAL_RESTORE_CONFIRM; do
  required "$name"
done

[ "$AEGYO_REAL_RESTORE_CONFIRM" = "private-read-only-source-to-empty-clone" ] || {
  echo "operator_error=confirmation_missing" >&2
  exit 2
}
[ "$SOURCE_DATABASE_NAME" != "$TARGET_DATABASE_NAME" ] || {
  echo "operator_error=database_names_must_differ" >&2
  exit 2
}

workdir="$(mktemp -d /tmp/aegyo-real-restore.XXXXXX)"
error_log="$workdir/tool-errors"
source_ca="$workdir/source-ca.pem"
target_ca="$workdir/target-ca.pem"
printf '%s\n' "$SOURCE_DATABASE_CA_CERT" >"$source_ca"
printf '%s\n' "$TARGET_DATABASE_CA_CERT" >"$target_ca"
chmod 0600 "$source_ca" "$target_ca"
case "$SOURCE_DATABASE_URL$TARGET_DATABASE_URL" in
  *\?*) echo "operator_error=database_url_options_refused" >&2; exit 2;;
esac

fail_phase() {
  echo "operator_error=$1" >&2
  exit "${2:-4}"
}

prepare_connection() {
  original="$1"
  tls_host="$2"
  authority="${original#*://}"
  [ "$authority" != "$original" ] || fail_phase invalid_private_database_url 2
  authority="${authority%%/*}"
  network_host="${authority##*@}"
  network_host="${network_host%%:*}"
  case "$network_host" in
    *.railway.internal) ;;
    *) fail_phase non_private_database_host 2;;
  esac
  if [ -n "$tls_host" ]; then
    [ "$tls_host" = "localhost" ] || fail_phase invalid_tls_host 2
    host_address="$(getent ahosts "$network_host" 2>>"$error_log" | awk 'NR==1{print $1}')"
    [ -n "$host_address" ] || fail_phase private_database_resolution_failed 2
    printf '%s?host=localhost&hostaddr=%s' "$original" "$host_address"
  else
    printf '%s' "$original"
  fi
}

source_connection="$(prepare_connection "$SOURCE_DATABASE_URL" "${SOURCE_DATABASE_TLS_HOST-}")"
target_connection="$(prepare_connection "$TARGET_DATABASE_URL" "${TARGET_DATABASE_TLS_HOST-}")"
snapshot_keeper=""
cleanup() {
  touch "$workdir/release" 2>/dev/null || true
  if [ -n "$snapshot_keeper" ]; then
    kill "$snapshot_keeper" 2>/dev/null || true
    wait "$snapshot_keeper" 2>/dev/null || true
  fi
  rm -rf "$workdir"
}
trap cleanup EXIT HUP INT TERM

scalar() {
  if [ "$1" = "$source_connection" ]; then cert="$source_ca"; else cert="$target_ca"; fi
  PGOPTIONS='-c lock_timeout=5s -c statement_timeout=300s' \
    PGSSLMODE=verify-full PGSSLROOTCERT="$cert" \
    psql -X -qAt -v ON_ERROR_STOP=1 "$1" -c "$2" 2>>"$error_log" ||
    fail_phase catalog_query_failed 3
}

source_db="$(scalar "$source_connection" 'select current_database()')"
target_db="$(scalar "$target_connection" 'select current_database()')"
[ "$source_db" = "$SOURCE_DATABASE_NAME" ] || { echo "operator_error=unexpected_source_database" >&2; exit 3; }
[ "$target_db" = "$TARGET_DATABASE_NAME" ] || { echo "operator_error=unexpected_target_database" >&2; exit 3; }

source_user="$(scalar "$source_connection" 'select current_user')"
[ "$source_user" = "$SOURCE_READ_ONLY_ROLE" ] || { echo "operator_error=unexpected_source_role" >&2; exit 3; }
source_role_ok="$(scalar "$source_connection" "select not rolsuper and not rolcreatedb and not rolcreaterole and coalesce(rolconfig @> array['default_transaction_read_only=on'], false) from pg_roles where rolname=current_user")"
[ "$source_role_ok" = "t" ] || { echo "operator_error=source_role_not_durable_read_only" >&2; exit 3; }
[ "$(scalar "$source_connection" 'show default_transaction_read_only')" = "on" ] || { echo "operator_error=source_session_not_read_only" >&2; exit 3; }

target_user="$(scalar "$target_connection" 'select current_user')"
[ "$target_user" = "$TARGET_OWNER_ROLE" ] || { echo "operator_error=unexpected_target_role" >&2; exit 3; }
target_relations="$(scalar "$target_connection" "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname not in ('pg_catalog','information_schema') and n.nspname not like 'pg_toast%' and c.relkind in ('r','p','v','m','S')")"
[ "$target_relations" = "0" ] || { echo "operator_error=target_not_empty" >&2; exit 3; }

source_major="$(scalar "$source_connection" "select current_setting('server_version_num')::int / 10000")"
target_major="$(scalar "$target_connection" "select current_setting('server_version_num')::int / 10000")"
tool_major="$(pg_dump --version | sed -E 's/.* ([0-9]+).*/\1/')"
[ "$source_major" = "$target_major" ] && [ "$source_major" = "$tool_major" ] || {
  echo "operator_error=postgres_major_mismatch" >&2
  exit 3
}

fingerprint_sql="$workdir/fingerprint.sql"
PGOPTIONS='-c default_transaction_read_only=on -c lock_timeout=5s -c statement_timeout=300s' \
  PGSSLMODE=verify-full PGSSLROOTCERT="$source_ca" \
  psql -X -qAt -v ON_ERROR_STOP=1 "$source_connection" \
  >"$fingerprint_sql" 2>>"$error_log" <<'SQL' || fail_phase fingerprint_plan_failed
SELECT format(
  'SELECT %L || E''\t'' || count(*) || E''\t'' || encode(sha256(convert_to(coalesce(string_agg(to_jsonb(t)::text, E''\n'' ORDER BY to_jsonb(t)::text), ''''), ''UTF8'')), ''hex'') FROM %I.%I t;',
  n.nspname || '.' || c.relname, n.nspname, c.relname
)
FROM pg_class c
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname NOT IN ('pg_catalog','information_schema')
  AND n.nspname NOT LIKE 'pg_toast%'
  AND c.relkind IN ('r','p')
ORDER BY n.nspname, c.relname;
SQL

# Hold one exported repeatable-read snapshot open while both the source
# fingerprint and pg_dump consume it. This makes the comparison independent of
# concurrent application writes without taking a writer freeze.
cat >"$workdir/export-snapshot.sql" <<SQL
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
\\o $workdir/snapshot
SELECT pg_export_snapshot();
\\o
\\! while [ ! -e "$workdir/release" ]; do sleep 0.1; done
ROLLBACK;
SQL
PGOPTIONS='-c default_transaction_read_only=on -c lock_timeout=5s -c statement_timeout=300s' \
  PGSSLMODE=verify-full PGSSLROOTCERT="$source_ca" \
  psql -X -qAt -v ON_ERROR_STOP=1 "$source_connection" \
  -f "$workdir/export-snapshot.sql" >>"$error_log" 2>&1 &
snapshot_keeper=$!
tries=0
while [ ! -s "$workdir/snapshot" ]; do
  kill -0 "$snapshot_keeper" 2>/dev/null || fail_phase snapshot_export_failed
  tries=$((tries + 1))
  [ "$tries" -lt 300 ] || fail_phase snapshot_export_timeout
  sleep 0.1
done
snapshot="$(tr -d '[:space:]' <"$workdir/snapshot")"
case "$snapshot" in *[!A-Za-z0-9-]*|'') echo "operator_error=invalid_snapshot_identifier" >&2; exit 4;; esac

{
  printf '%s\n' 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;'
  printf "SET TRANSACTION SNAPSHOT '%s';\n" "$snapshot"
  cat "$fingerprint_sql"
  printf '%s\n' 'ROLLBACK;'
} >"$workdir/source-fingerprint.sql"
PGOPTIONS='-c default_transaction_read_only=on -c lock_timeout=5s -c statement_timeout=300s' \
  PGSSLMODE=verify-full PGSSLROOTCERT="$source_ca" \
  psql -X -qAt -v ON_ERROR_STOP=1 "$source_connection" \
  -f "$workdir/source-fingerprint.sql" >"$workdir/source.fingerprint" 2>>"$error_log" ||
  fail_phase source_fingerprint_failed

if ! PGOPTIONS='-c default_transaction_read_only=on -c lock_timeout=5s -c statement_timeout=300s' \
  PGSSLMODE=verify-full PGSSLROOTCERT="$source_ca" \
  pg_dump --format=custom --snapshot="$snapshot" --no-owner --no-acl \
    --dbname="$source_connection" 2>>"$error_log" |
  PGOPTIONS='-c lock_timeout=5s -c statement_timeout=300s' \
  PGSSLMODE=verify-full PGSSLROOTCERT="$target_ca" \
  pg_restore --exit-on-error --single-transaction --no-owner --no-acl \
    --dbname="$target_connection" 2>>"$error_log"; then
  fail_phase dump_restore_failed
fi
touch "$workdir/release"
wait "$snapshot_keeper" || fail_phase snapshot_keeper_failed
snapshot_keeper=""

PGOPTIONS='-c lock_timeout=5s -c statement_timeout=300s' \
  PGSSLMODE=verify-full PGSSLROOTCERT="$target_ca" \
  psql -X -qAt -v ON_ERROR_STOP=1 "$target_connection" \
  -f "$fingerprint_sql" >"$workdir/target.fingerprint" 2>>"$error_log" ||
  fail_phase target_fingerprint_failed

if ! cmp -s "$workdir/source.fingerprint" "$workdir/target.fingerprint"; then
  echo "operator_error=restored_content_mismatch" >&2
  exit 4
fi

table_count="$(wc -l <"$workdir/source.fingerprint" | tr -d ' ')"
echo "source_guard=true"
echo "target_was_empty=true"
echo "postgres_major_match=true"
echo "restore_single_transaction=true"
echo "full_row_fingerprints_match=true"
echo "verified_table_count=$table_count"
echo "operator_complete=true"
