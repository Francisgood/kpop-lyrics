#!/bin/sh
# Disposable proof only. This script never reads DATABASE_URL and never connects
# to an existing database. It creates a uniquely named local Docker container,
# applies only the shared-auth migration to a minimal pre-cutover fixture, and
# removes the container on every exit.
set -eu

container="aegyo-shared-auth-proof-$$"
cleanup() {
  docker stop "$container" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

docker run --rm -d \
  --name "$container" \
  -e POSTGRES_PASSWORD=proof \
  -e POSTGRES_DB=proof \
  postgres:16-alpine >/dev/null

until docker exec "$container" pg_isready -U postgres -d proof >/dev/null 2>&1; do
  sleep 1
done

docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d proof >/dev/null <<'SQL'
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "role" TEXT
);
CREATE TABLE "Session" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id"),
  "token" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "Favorite" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id"),
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "User" ("id", "email", "passwordHash", "role")
VALUES ('stable-user', 'proof@example.invalid', 'legacy-hash', 'moderator');
INSERT INTO "Session" ("id", "userId", "token", "expiresAt")
VALUES ('legacy-session', 'stable-user', 'legacy-token', CURRENT_TIMESTAMP + INTERVAL '1 day');
INSERT INTO "Favorite" ("id", "userId", "entityType", "entityId")
VALUES ('favorite', 'stable-user', 'artist', 'artist-1');
SQL

docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d proof \
  < prisma/migrations/20260911200000_add_shared_auth/migration.sql >/dev/null

docker exec -i "$container" psql -v ON_ERROR_STOP=1 -U postgres -d proof >/dev/null <<'SQL'
CREATE ROLE proof_app;
GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON "AuthCutoverLatch" TO proof_app;
INSERT INTO "AuthCutoverLatch" ("id", "mappingDigest")
VALUES ('accounts-shared-auth-v1', repeat('a', 64));
SET ROLE proof_app;
DO $$
BEGIN
  BEGIN
    UPDATE "AuthCutoverLatch" SET "mappingDigest" = repeat('b', 64);
    RAISE EXCEPTION 'update unexpectedly succeeded';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'update unexpectedly%' THEN RAISE; END IF;
  END;
  BEGIN
    DELETE FROM "AuthCutoverLatch";
    RAISE EXCEPTION 'delete unexpectedly succeeded';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'delete unexpectedly%' THEN RAISE; END IF;
  END;
  BEGIN
    EXECUTE 'TRUNCATE TABLE "AuthCutoverLatch"';
    RAISE EXCEPTION 'truncate unexpectedly succeeded';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM LIKE 'truncate unexpectedly%' THEN RAISE; END IF;
  END;
END $$;
RESET ROLE;
SQL

result=$(docker exec "$container" psql -At -U postgres -d proof -c \
  "SELECT
    (SELECT count(*) FROM \"User\" WHERE id = 'stable-user' AND \"passwordHash\" = 'legacy-hash' AND role = 'moderator'),
    (SELECT count(*) FROM \"Session\" WHERE id = 'legacy-session' AND \"providerSessionId\" IS NULL),
    (SELECT count(*) FROM \"Favorite\" WHERE id = 'favorite'),
    (SELECT count(*) FROM \"AuthCutoverLatch\" WHERE id = 'accounts-shared-auth-v1' AND \"mappingDigest\" = repeat('a', 64));")

if [ "$result" != "1|1|1|1" ]; then
  echo "preservation proof failed: $result" >&2
  exit 1
fi

echo "PASS user/hash/role, legacy session, favorite, and immutable latch preserved"
