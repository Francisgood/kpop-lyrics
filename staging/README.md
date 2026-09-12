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

## Isolated Railway preview used for the shared-auth proof

The source-only preview was prepared for Railway service `1691aae2-36f4-4af3-997e-94552d1e8b09` in the non-production environment `279e0a09-8ba3-42dc-8d44-a2598d1f3fe9`. Its canonical origin is `https://aegyo-auth-preview-accounts-staging.up.railway.app`, and it uses the separate logical database `aegyo_auth_staging`. These identifiers record the isolated staging proof that was actually used; they are not production deployment instructions.

The database role used by this preview has `USAGE` and `CREATE` on the `public` schema, while PostgreSQL continues to own the schema. It owns only the `User` table because `lib/access.ts` currently runs `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role"`; PostgreSQL requires table ownership even when the column already exists. The role can read all existing tables, insert immutable identity mappings, manage local sessions, and insert or delete favorites. PostgreSQL retains ownership of `SharedAuthIdentity`, `AuthCutoverLatch`, and the latch guard function. The latch is read-only to the application, and the application has no mapping update or delete privilege.

The staging grants correspond to this shape, with `aegyo_app` replaced by the separately created staging runtime role:

```sql
GRANT CONNECT ON DATABASE aegyo_auth_staging TO aegyo_app;
GRANT USAGE, CREATE ON SCHEMA public TO aegyo_app;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO aegyo_app;
ALTER TABLE public."User" OWNER TO aegyo_app;
GRANT INSERT ON TABLE public."SharedAuthIdentity" TO aegyo_app;
GRANT INSERT, UPDATE, DELETE ON TABLE public."Session" TO aegyo_app;
GRANT INSERT, DELETE ON TABLE public."Favorite" TO aegyo_app;
REVOKE UPDATE, DELETE, TRUNCATE ON TABLE public."SharedAuthIdentity" FROM aegyo_app;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON TABLE public."AuthCutoverLatch" FROM aegyo_app;
```

`CREATE` on `public` is an existing application limitation: the homepage and several feature paths still create or alter their own auxiliary tables at runtime. Objects created by the application role are owned by that role; the role does not own `public` itself. This staging grant should not be copied into a production permission design without first removing or explicitly migrating that runtime DDL.

The private Railway connection uses strict TLS with `sslmode=require&sslaccept=strict&sslcert=/tmp/railway-ca.pem`. The CA is supplied only through the runtime variable `AEGYO_DATABASE_CA_CERT` and materialized with mode `0600` immediately before Next starts. A Railway start command can do that without embedding the certificate or any database credential:

```sh
sh -c 'umask 077; printf "%s" "$AEGYO_DATABASE_CA_CERT" > /tmp/railway-ca.pem; exec ./node_modules/.bin/next start -p "${PORT:-3000}"'
```

Set `DATABASE_URL` separately so its query includes the strict TLS options above. Do not print either variable, place the CA in the image, or add it to a tracked file.
