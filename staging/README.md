# Aegyo staging image

`Dockerfile.staging` pins Node 24.21.0 and uses explicit `prisma generate` plus `next build`. Its runtime command is only `next start`; it never runs Prisma migration or seed commands. `Dockerfile.staging.dockerignore` allowlists the application sources and public assets, excluding `.env*`, `.proof`, tests, operator scripts, Git data and local credentials.

For a Railway staging service, set `RAILWAY_DOCKERFILE_PATH=Dockerfile.staging` as documented by Railway. Do not configure a pre-deploy command. Supply runtime variables through the staging service only; do not bake them into the image. The image runs as UID 1001 and honors Railway's runtime `PORT`.

The explicit synthetic initializer is separate from the image and application startup. It refuses the ordinary `DATABASE_URL`, accepts only a loopback PostgreSQL connection to an empty database whose exact name contains `staging`, checks the connection's `current_database()`, and requires the literal confirmation below. It creates the current Prisma schema, adds the runtime `User.role` column and immutable latch guards, then inserts one synthetic existing mapped member and activates only that synthetic mapping digest. The second fixture identity remains absent locally so its first verified callback exercises new-user provisioning.

```sh
AEGYO_STAGING_CONFIRM=initialize-empty-synthetic-staging-database \
AEGYO_STAGING_DATABASE_URL='postgresql://postgres:proof@127.0.0.1:5432/aegyo_auth_staging' \
AEGYO_STAGING_DATABASE_NAME='aegyo_auth_staging' \
AEGYO_AUTH_BASE_URL='https://accounts-staging.example.test' \
AEGYO_STAGING_FIXTURE=staging/fixtures.example.json \
node scripts/staging/initialize-synthetic.mjs
```

The tracked fixture contains synthetic identifiers and no password, token, client secret, or database credential. Replace its issuer and subjects with separately created staging Accounts identities before initialization. Never run this helper against an existing database; it deliberately refuses any public table. For a remote staging database, initialize and rehearse locally, export schema-only, and use the separately reviewed CA/pin-aware PostgreSQL operator path; never weaken TLS verification to make Prisma connect through a public proxy. The initializer is operator DDL and seed tooling, not a runtime migration path.
