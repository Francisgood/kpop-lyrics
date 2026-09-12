#!/bin/sh
# Rehearses the additive shared-auth migration against an explicit schema-only
# pg_dump in a disposable local PostgreSQL 18 container. It never reads
# DATABASE_URL, mounts a host path, or connects to an existing database.
set -eu

if [ "$#" -ne 1 ] || [ ! -f "$1" ] || [ ! -r "$1" ]; then
  echo "Usage: $0 /absolute/path/to/schema-only.sql" >&2
  exit 2
fi
schema_file=$1
case "$schema_file" in
  /*) ;;
  *) echo "schema path must be absolute" >&2; exit 2 ;;
esac
if grep -Eq '^(COPY |INSERT INTO |CREATE DATABASE|\\connect)' "$schema_file"; then
  echo "refusing a schema file containing data or database-switching statements" >&2
  exit 2
fi

container="aegyo-production-schema-proof-$$"
container_created=0
cleanup() {
  if [ "$container_created" -eq 1 ]; then
    docker stop "$container" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

docker run --rm -d \
  --name "$container" \
  --network none \
  -e POSTGRES_PASSWORD=proof \
  -e POSTGRES_DB=proof \
  postgres:18-alpine >/dev/null
container_created=1

attempt=0
until docker exec "$container" pg_isready -U postgres -d proof >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "disposable PostgreSQL did not become ready within 30 seconds" >&2
    exit 1
  fi
  sleep 1
done

docker exec -i "$container" psql -X -P pager=off -v ON_ERROR_STOP=1 -U postgres -d proof \
  < "$schema_file" >/dev/null

# These are synthetic values only. They exercise runtime columns absent from the
# checked-in Prisma schema and representative ownership edges from the restored
# production catalog.
docker exec -i "$container" psql -X -P pager=off -v ON_ERROR_STOP=1 -U postgres -d proof >/dev/null <<'SQL'
INSERT INTO "User" (
  id, email, "displayName", "avatarUrl", bio, "passwordHash",
  "emailVerified", is_owner, role, "mailingAddress", phone,
  "rewardsEnrolled", "webPushEnabled", "zipCode"
) VALUES
  ('synthetic-local-owner', 'owner@example.invalid', 'Synthetic Owner', '/avatar-owner.png', 'owner profile', repeat('a', 64), true, true, 'admin', 'Synthetic address', '+10000000000', true, true, '00000'),
  ('synthetic-local-member', 'member@example.invalid', 'Synthetic Member', '/avatar-member.png', 'member profile', repeat('b', 64), false, false, 'user', NULL, NULL, false, false, NULL);
INSERT INTO "Session" (id, "userId", token, "expiresAt")
VALUES ('synthetic-session', 'synthetic-local-owner', 'synthetic-session-token', CURRENT_TIMESTAMP + INTERVAL '1 day');
INSERT INTO "Favorite" (id, "userId", "entityType", "entityId")
VALUES ('synthetic-favorite', 'synthetic-local-owner', 'artist', 'synthetic-artist');
INSERT INTO "PointEvent" (id, "userId", type, points, reason, "refId")
VALUES ('synthetic-points', 'synthetic-local-owner', 'proof', 17, 'synthetic migration proof', 'proof-ref');
INSERT INTO "Follow" (id, "followerId", "targetSlug")
VALUES ('synthetic-follow', 'synthetic-local-owner', 'synthetic-target');
INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, applied_steps_count)
SELECT
  '00000000-0000-0000-0000-00000000000' || n,
  repeat(n::text, 64),
  CURRENT_TIMESTAMP,
  'synthetic_historical_' || n,
  1
FROM generate_series(1, 4) AS n;
SQL

migration_checksum=$(shasum -a 256 prisma/migrations/20260911200000_add_shared_auth/migration.sql | awk '{print $1}')
mapping_digest=$(node - <<'NODE'
import { readFileSync } from "node:fs";
import { buildReconciliation } from "./scripts/shared-auth/reconciliation-lib.mjs";
const root = "tests/fixtures/shared-auth-rehearsal/";
const read = (name) => JSON.parse(readFileSync(`${root}${name}.json`, "utf8"));
process.stdout.write(buildReconciliation(read("local-before"), read("accounts"), read("mapping")).mappingDigest);
NODE
)

docker exec -i "$container" psql -X -P pager=off -v ON_ERROR_STOP=1 -U postgres -d proof \
  < prisma/migrations/20260911200000_add_shared_auth/migration.sql >/dev/null

docker exec -i "$container" psql -X -P pager=off -v ON_ERROR_STOP=1 \
  -v migration_checksum="$migration_checksum" -v mapping_digest="$mapping_digest" \
  -U postgres -d proof >/dev/null <<'SQL'
INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, applied_steps_count)
VALUES ('10000000-0000-0000-0000-000000000000', :'migration_checksum', CURRENT_TIMESTAMP, '20260911200000_add_shared_auth', 1);
INSERT INTO "SharedAuthIdentity" (id, "userId", issuer, subject, "updatedAt") VALUES
  ('synthetic-identity-owner', 'synthetic-local-owner', 'https://accounts.example.test/api/auth', 'opaque-subject-owner', CURRENT_TIMESTAMP),
  ('synthetic-identity-member', 'synthetic-local-member', 'https://accounts.example.test/api/auth', 'opaque-subject-member', CURRENT_TIMESTAMP);

DO $$
BEGIN
  BEGIN
    INSERT INTO "SharedAuthIdentity" (id, "userId", issuer, subject, "updatedAt")
    VALUES ('duplicate-user', 'synthetic-local-owner', 'https://accounts.example.test/api/auth', 'different-subject', CURRENT_TIMESTAMP);
    RAISE EXCEPTION 'duplicate local user mapping unexpectedly succeeded';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  BEGIN
    INSERT INTO "SharedAuthIdentity" (id, "userId", issuer, subject, "updatedAt")
    VALUES ('duplicate-subject', 'synthetic-unmapped-user', 'https://accounts.example.test/api/auth', 'opaque-subject-owner', CURRENT_TIMESTAMP);
    RAISE EXCEPTION 'duplicate issuer/subject mapping unexpectedly succeeded';
  EXCEPTION WHEN unique_violation THEN NULL; END;
  BEGIN
    INSERT INTO "SharedAuthIdentity" (id, "userId", issuer, subject, "updatedAt")
    VALUES ('missing-user', 'not-a-local-user', 'https://accounts.example.test/api/auth', 'opaque-subject-new', CURRENT_TIMESTAMP);
    RAISE EXCEPTION 'missing local user mapping unexpectedly succeeded';
  EXCEPTION WHEN foreign_key_violation THEN NULL; END;
END $$;

DO $$
BEGIN
  BEGIN
    INSERT INTO "AuthCutoverLatch" (id, "mappingDigest")
    VALUES ('wrong-cutover-id', repeat('a', 64));
    RAISE EXCEPTION 'invalid latch ID unexpectedly succeeded';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    INSERT INTO "AuthCutoverLatch" (id, "mappingDigest")
    VALUES ('accounts-shared-auth-v1', 'not-a-reviewed-digest');
    RAISE EXCEPTION 'invalid mapping digest unexpectedly succeeded';
  EXCEPTION WHEN check_violation THEN NULL; END;
END $$;

INSERT INTO "AuthCutoverLatch" (id, "mappingDigest")
VALUES ('accounts-shared-auth-v1', :'mapping_digest');
CREATE ROLE proof_app;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON "AuthCutoverLatch" TO proof_app;
SET ROLE proof_app;
DO $$
BEGIN
  BEGIN UPDATE "AuthCutoverLatch" SET "mappingDigest" = repeat('c', 64); RAISE EXCEPTION 'update unexpectedly succeeded';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM LIKE 'update unexpectedly%' THEN RAISE; END IF; END;
  BEGIN DELETE FROM "AuthCutoverLatch"; RAISE EXCEPTION 'delete unexpectedly succeeded';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM LIKE 'delete unexpectedly%' THEN RAISE; END IF; END;
  BEGIN EXECUTE 'TRUNCATE TABLE "AuthCutoverLatch"'; RAISE EXCEPTION 'truncate unexpectedly succeeded';
  EXCEPTION WHEN raise_exception THEN IF SQLERRM LIKE 'truncate unexpectedly%' THEN RAISE; END IF; END;
END $$;
RESET ROLE;
SQL

result=$(docker exec "$container" psql -X -P pager=off -At -U postgres -d proof -c \
  "SELECT
    (SELECT count(*) FROM \"User\" WHERE id='synthetic-local-owner' AND role='admin' AND is_owner AND \"displayName\"='Synthetic Owner' AND \"avatarUrl\"='/avatar-owner.png' AND bio='owner profile' AND \"mailingAddress\"='Synthetic address' AND phone='+10000000000' AND \"rewardsEnrolled\" AND \"webPushEnabled\" AND \"zipCode\"='00000' AND \"passwordHash\"=repeat('a',64)),
    (SELECT count(*) FROM \"Session\" WHERE id='synthetic-session' AND \"userId\"='synthetic-local-owner' AND \"providerSessionId\" IS NULL),
    (SELECT count(*) FROM \"Favorite\" WHERE id='synthetic-favorite' AND \"userId\"='synthetic-local-owner'),
    (SELECT count(*) FROM \"PointEvent\" WHERE id='synthetic-points' AND \"userId\"='synthetic-local-owner' AND points=17),
    (SELECT count(*) FROM \"Follow\" WHERE id='synthetic-follow' AND \"followerId\"='synthetic-local-owner'),
    (SELECT count(*) FROM \"SharedAuthIdentity\" WHERE \"userId\" IN ('synthetic-local-owner','synthetic-local-member')),
    (SELECT count(*) FROM \"AuthCutoverLatch\" WHERE \"mappingDigest\"='$mapping_digest'),
    (SELECT count(*) FROM _prisma_migrations WHERE migration_name LIKE 'synthetic_historical_%' OR (migration_name='20260911200000_add_shared_auth' AND checksum='$migration_checksum'));"
)
expected="1|1|1|1|1|2|1|5"
if [ "$result" != "$expected" ]; then
  echo "production-schema rehearsal failed: $result" >&2
  exit 1
fi

echo "PASS production schema: profile/role/owner, ownership, mappings, latch, and migration hash preserved"
