#!/bin/sh
set -eu
[ "$#" -eq 2 ] || { echo "Usage: $0 /absolute/schema.sql /absolute/seed.sql" >&2; exit 2; }
case "$1:$2" in /*:/*) ;; *) echo 'proof inputs must be absolute' >&2; exit 2;; esac
[ -r "$1" ] && [ -r "$2" ] || { echo 'proof input unreadable' >&2; exit 2; }
[ -z "${DATABASE_URL:-}" ] || { echo 'DATABASE_URL is forbidden' >&2; exit 2; }
container="aegyo-auth-schema-installer-proof-$$"
cleanup() { docker stop "$container" >/dev/null 2>&1 || true; [ -z "${rerun_error:-}" ] || rm -f "$rerun_error"; }
trap cleanup EXIT INT TERM
docker run --rm -d --name "$container" --network none -e POSTGRES_PASSWORD=proof -e POSTGRES_USER=kpop -e POSTGRES_DB=kpopdb postgres:18-alpine >/dev/null
tries=0
until docker exec "$container" pg_isready -U kpop -d kpopdb >/dev/null 2>&1; do
  tries=$((tries+1)); [ "$tries" -lt 30 ] || exit 1; sleep 1
done
docker exec -i "$container" psql -X -q -v ON_ERROR_STOP=1 -U kpop -d kpopdb <"$1"
docker exec -i "$container" psql -X -q -v ON_ERROR_STOP=1 -U kpop -d kpopdb <"$2"
# Exercise the preservation digest with multiple rows. A one-row table cannot
# detect a mismatch in the separator produced by the two SQL heredocs.
docker exec "$container" psql -X -q -v ON_ERROR_STOP=1 -U kpop -d kpopdb -c \
  'INSERT INTO "Album" (id, slug, title, "artistId", "releaseYear", "coverArt", type, "createdAt") SELECT '\''installer-proof-album-'\'' || g, '\''installer-proof-album-'\'' || g, '\''Installer proof '\'' || g, id, 2026, NULL, '\''single'\'', CURRENT_TIMESTAMP FROM "Artist" CROSS JOIN generate_series(1, 2) g LIMIT 2' >/dev/null
before="$(docker exec "$container" psql -X -qAt -U kpop -d kpopdb -c "SELECT count(*) || '|' || encode(sha256(convert_to(coalesce(string_agg(to_jsonb(t)::text,E'\\n' ORDER BY to_jsonb(t)::text),''),'UTF8')),'hex') FROM \"User\" t")"
docker cp scripts/shared-auth/install-auth-schema.sh "$container":/tmp/install-auth-schema.sh
docker cp prisma/migrations/20260911200000_add_shared_auth/migration.sql "$container":/tmp/migration.sql
output="$(docker exec \
  -e AEGYO_AUTH_SCHEMA_CONFIRM=install-reviewed-additive-schema-only \
  -e RAILWAY_PROJECT_ID=a719c26e-33b9-4a1c-8759-d5401c1e181a \
  -e RAILWAY_ENVIRONMENT_ID=27e2f29a-5846-48f8-9727-694a97c36ef6 \
  -e RAILWAY_SERVICE_ID=726d0c13-88e6-4167-b1ac-521b4a7b1216 \
  -e POSTGRES_USER=kpop -e POSTGRES_DB=kpopdb \
  "$container" /tmp/install-auth-schema.sh /tmp/migration.sql)"
after="$(docker exec "$container" psql -X -qAt -U kpop -d kpopdb -c "SELECT count(*) || '|' || encode(sha256(convert_to(coalesce(string_agg(to_jsonb(t)::text,E'\\n' ORDER BY to_jsonb(t)::text),''),'UTF8')),'hex') FROM \"User\" t")"
[ "$before" = "$after" ] || { echo 'user rows changed' >&2; exit 1; }
state="$(docker exec "$container" psql -X -qAt -U kpop -d kpopdb -c 'SELECT (SELECT count(*) FROM "SharedAuthIdentity"),(SELECT count(*) FROM "AuthCutoverLatch"),(SELECT count(*) FROM "AegyoAuthOperatorJournal"),(SELECT count(*) FROM _prisma_migrations)')"
[ "$state" = '0|0|1|3' ] || { echo "unexpected installed state: $state" >&2; exit 1; }
case "$output" in *'preexisting_catalog_preserved=true'*'latch_created=false'*'mappings_created=0'*) ;; *) exit 1;; esac
rerun_error="/tmp/$container-rerun-error"
if docker exec \
  -e AEGYO_AUTH_SCHEMA_CONFIRM=install-reviewed-additive-schema-only \
  -e RAILWAY_PROJECT_ID=a719c26e-33b9-4a1c-8759-d5401c1e181a \
  -e RAILWAY_ENVIRONMENT_ID=27e2f29a-5846-48f8-9727-694a97c36ef6 \
  -e RAILWAY_SERVICE_ID=726d0c13-88e6-4167-b1ac-521b4a7b1216 \
  -e POSTGRES_USER=kpop -e POSTGRES_DB=kpopdb \
  "$container" /tmp/install-auth-schema.sh /tmp/migration.sql >/dev/null 2>"$rerun_error"; then
  echo 'rerun unexpectedly succeeded' >&2; exit 1
fi
grep -q '^schema_installer_sqlstate=P0001$' "$rerun_error" || { echo 'rerun SQLSTATE was not preserved' >&2; exit 1; }
grep -q '^schema_installer_failure=preexisting_or_partial_schema$' "$rerun_error" || { echo 'rerun failure phase was not preserved' >&2; exit 1; }
rm -f "$rerun_error"
echo 'PASS additive schema installer: full catalog preservation, empty latch/mappings, custom journal, rerun refusal'
