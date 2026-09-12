#!/bin/sh
set -eu
set -o pipefail

required() {
  eval "value=\${$1-}"
  [ -n "$value" ] || { echo "operator_error=missing_configuration" >&2; exit 2; }
}

for name in SOURCE_DATABASE_URL TARGET_DATABASE_URL SOURCE_DATABASE_NAME \
  TARGET_DATABASE_NAME SOURCE_READ_ONLY_ROLE TARGET_OWNER_ROLE \
  AEGYO_REAL_RESTORE_CONFIRM; do
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
trap 'touch "$workdir/release" 2>/dev/null || true; rm -rf "$workdir"' EXIT HUP INT TERM

scalar() { psql -X -qAt -v ON_ERROR_STOP=1 "$1" -c "$2"; }

source_db="$(scalar "$SOURCE_DATABASE_URL" 'select current_database()')"
target_db="$(scalar "$TARGET_DATABASE_URL" 'select current_database()')"
[ "$source_db" = "$SOURCE_DATABASE_NAME" ] || { echo "operator_error=unexpected_source_database" >&2; exit 3; }
[ "$target_db" = "$TARGET_DATABASE_NAME" ] || { echo "operator_error=unexpected_target_database" >&2; exit 3; }

source_user="$(scalar "$SOURCE_DATABASE_URL" 'select current_user')"
[ "$source_user" = "$SOURCE_READ_ONLY_ROLE" ] || { echo "operator_error=unexpected_source_role" >&2; exit 3; }
source_role_ok="$(scalar "$SOURCE_DATABASE_URL" "select not rolsuper and not rolcreatedb and not rolcreaterole and coalesce(rolconfig @> array['default_transaction_read_only=on'], false) from pg_roles where rolname=current_user")"
[ "$source_role_ok" = "t" ] || { echo "operator_error=source_role_not_durable_read_only" >&2; exit 3; }
[ "$(scalar "$SOURCE_DATABASE_URL" 'show default_transaction_read_only')" = "on" ] || { echo "operator_error=source_session_not_read_only" >&2; exit 3; }

target_user="$(scalar "$TARGET_DATABASE_URL" 'select current_user')"
[ "$target_user" = "$TARGET_OWNER_ROLE" ] || { echo "operator_error=unexpected_target_role" >&2; exit 3; }
target_relations="$(scalar "$TARGET_DATABASE_URL" "select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname not in ('pg_catalog','information_schema') and n.nspname not like 'pg_toast%' and c.relkind in ('r','p','v','m','S')")"
[ "$target_relations" = "0" ] || { echo "operator_error=target_not_empty" >&2; exit 3; }

source_major="$(scalar "$SOURCE_DATABASE_URL" "select current_setting('server_version_num')::int / 10000")"
target_major="$(scalar "$TARGET_DATABASE_URL" "select current_setting('server_version_num')::int / 10000")"
tool_major="$(pg_dump --version | sed -E 's/.* ([0-9]+).*/\1/')"
[ "$source_major" = "$target_major" ] && [ "$source_major" = "$tool_major" ] || {
  echo "operator_error=postgres_major_mismatch" >&2
  exit 3
}

fingerprint_sql="$workdir/fingerprint.sql"
PGOPTIONS='-c default_transaction_read_only=on' psql -X -qAt -v ON_ERROR_STOP=1 \
  "$SOURCE_DATABASE_URL" >"$fingerprint_sql" <<'SQL'
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
PGOPTIONS='-c default_transaction_read_only=on' psql -X -qAt -v ON_ERROR_STOP=1 \
  "$SOURCE_DATABASE_URL" -f "$workdir/export-snapshot.sql" &
snapshot_keeper=$!
tries=0
while [ ! -s "$workdir/snapshot" ]; do
  kill -0 "$snapshot_keeper" 2>/dev/null || { echo "operator_error=snapshot_export_failed" >&2; exit 4; }
  tries=$((tries + 1))
  [ "$tries" -lt 300 ] || { echo "operator_error=snapshot_export_timeout" >&2; exit 4; }
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
PGOPTIONS='-c default_transaction_read_only=on' psql -X -qAt -v ON_ERROR_STOP=1 \
  "$SOURCE_DATABASE_URL" -f "$workdir/source-fingerprint.sql" >"$workdir/source.fingerprint"

PGOPTIONS='-c default_transaction_read_only=on' pg_dump --format=custom \
  --snapshot="$snapshot" --no-owner --no-acl --dbname="$SOURCE_DATABASE_URL" |
  pg_restore --exit-on-error --single-transaction --no-owner --no-acl \
    --dbname="$TARGET_DATABASE_URL"
touch "$workdir/release"
wait "$snapshot_keeper"

psql -X -qAt -v ON_ERROR_STOP=1 "$TARGET_DATABASE_URL" \
  -f "$fingerprint_sql" >"$workdir/target.fingerprint"

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
