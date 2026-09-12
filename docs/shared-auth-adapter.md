# Shared Accounts adapter

Authentication mode depends on both `AEGYO_SHARED_AUTH_ENABLED` and the durable database latch. Before activation, flag-off preserves the existing login, signup, password reset, cookie, session, role, and user-data behavior. Flag-on remains unavailable until the latch exists and configuration is valid. After activation, only valid flag-on shared auth works; flag-off or invalid configuration fails closed and never reactivates legacy passwords or sessions.

## Provider contract

Register this confidential OIDC client with Accounts:

- redirect URI: `${AEGYO_APP_ORIGIN}/api/auth/shared/callback`
- authorization code flow with S256 PKCE
- scopes: `openid profile email`
- client authentication: `client_secret_basic`
- signed ID-token claims: `sid`, `auth_time`, `https://aegyoarena.com/claims/password-reset-state`, `https://aegyoarena.com/claims/security-version`, and `https://aegyoarena.com/claims/operator-cutoff`

Set `AEGYO_AUTH_BASE_URL`, `AEGYO_APP_ORIGIN`, `AEGYO_AUTH_CLIENT_ID`, `AEGYO_AUTH_CLIENT_SECRET`, `AEGYO_AUTH_TRANSACTION_SECRET` (at least 32 characters), and the separate `AEGYO_AUTH_STATE_READER_KEY`. Accounts must expose authenticated `POST /api/internal/session-state` with the contract used by Arcade.

## Migration and mapping gate

Apply `prisma/migrations/20260911200000_add_shared_auth/migration.sql` through a separate reviewed migration step before enabling the flag. The current Railway build and start overrides do not run `prisma migrate deploy`, so application deployment must not be treated as migration evidence. Verify the migration record and empty latch directly after the explicit step. The migration adds `SharedAuthIdentity`, nullable provider metadata to `Session`, and an initially empty `AuthCutoverLatch`. Existing local user IDs, roles, relations, hashes, and session rows remain intact.

Import mappings explicitly with stable local IDs. Each row contains a local `userId`, the exact issuer (`${AEGYO_AUTH_BASE_URL}/api/auth`), and Accounts `subject`. Both `userId` and `(issuer, subject)` are unique. Reconcile and review conflicts before insertion. The callback never queries or maps by email and never creates a user. Any future reviewed provisioning job must store the exported `EXTERNAL_PASSWORD_SENTINEL` in `passwordHash`; normal password hashing cannot produce it. An unmapped subject, including one whose email matches an existing user, receives `account_not_mapped` and no session.

### Local reconciliation rehearsal

Run the source-only validator with five local JSON paths:

```sh
npm run auth:reconcile -- local-before.json accounts-subjects.json mapping.json local-after.json reviewed-manifest.json
```

The tool has no database or network client. It requires:

- a version-1 local snapshot containing every stable `User.id`, its raw `User.role`, and sorted linked record IDs grouped by table;
- a version-1 Accounts snapshot containing the exact issuer and opaque `public.user.id` values emitted as OIDC `sub`;
- explicit version-1 pairs `{localUserId, subject}` prepared through a reviewed import journal; and
- a second local snapshot taken after the rehearsal.

Email fields are rejected at every input depth. Accounts currently has no dedicated legacy source-ID field, so the tool never assumes equal IDs and cannot derive a pair. A real import needs either an external reviewed journal recording created Accounts IDs or a reviewed additive Accounts source-identity table.

The local snapshot must cover Prisma-owned `Favorite`, `Comment`, and `SuggestedEdit` IDs plus runtime-owned records keyed by the user, including `SlangVote`, profile `PollVote`, and `Follow`, when those tables exist. The before/after digest fails if a user ID, raw role, or linked record owner changes. `reviewed-manifest.json` is created with mode `0600` and exclusive-create semantics. Its `mappingDigest` is SHA-256 over canonical JSON of the manifest core, excluding the digest field itself; use that exact lowercase 64-hex value for latch activation.

### Production-schema rehearsal

A schema-only production dump can be rehearsed without copying any production rows:

```sh
npm run auth:production-schema-proof -- /absolute/path/to/schema-only.sql
```

The runner requires an explicit absolute file, rejects dumps containing `COPY`, `INSERT`, database creation, or database switching, and never reads `DATABASE_URL`. It streams the schema through stdin into a uniquely named PostgreSQL 18 container with `--network none`, no host mounts, bounded startup, and cleanup on exit. The committed synthetic fixture then exercises actual non-null/default columns and verifies stable user IDs, 64-hex password hashes, raw role, `is_owner`, profile/reward fields, legacy sessions, favorites, points, follows, explicit issuer/subject mappings, migration checksum journaling, latch digest constraints, and rejected latch update/delete/truncate operations.

This is a production-schema rehearsal with synthetic data, not a production-data restore. Keep the schema dump and generated manifests private and ignored. The historical checked-in SQLite-style migration chain remains untouched; the restored catalog and migration history still require operator review before applying the additive migration to any remote database.

## Cutover and recovery

Before activation, prove the mappings, register the exact callback, verify provider-state reader credentials, freeze legacy credential writes operationally, and rehearse the forced sign-in UX. Activation keeps old rows for audit and data integrity, but legacy sessions lack provider metadata and are never authorized afterward. They are not a rollback mechanism.

With shared mode active, legacy login, signup, forgot, and reset endpoints stop before credential reads or writes. Login submissions and `/api/auth/recovery` continue into Accounts sign-in, where Accounts owns password recovery. Signup remains closed until reviewed unmapped-user provisioning exists. Shared sessions retain the `session` cookie and `getSession()` shape expected by current consumers. Ordinary reads cache provider state for at most 30 seconds; authenticated writes always check Accounts and fail closed during outage.

The remaining rollout gates are provider client registration and secrets, a reconciled mapping import and digest, migration-history review, real browser and recovery rehearsal, and a final UX pass that labels Accounts sign-in and recovery directly.

## Irreversible activation latch

After every gate above passes, an operator runs this idempotent procedure with the lowercase SHA-256 digest of the reviewed mapping manifest:

```sql
INSERT INTO "AuthCutoverLatch" ("id", "mappingDigest")
VALUES ('accounts-shared-auth-v1', '<64-lowercase-hex-digest>')
ON CONFLICT ("id") DO NOTHING;
```

“Operator-only” describes the deployment procedure; this migration does not create or assign database roles. The application only reads the latch and exposes no create, update, delete, truncate, or reset route. Database constraints allow only the fixed ID and a 64-character lowercase hexadecimal digest. Triggers reject ordinary update, delete, and truncate statements. A privileged schema owner can deliberately remove or disable those DDL guards, so production database privileges and change review remain part of the control.

Before the row exists, flag-off uses legacy auth and flag-on stays unavailable. After it exists, valid flag-on configuration uses shared auth; flag-off, malformed configuration, and database lookup failure return a recoverable unavailable response. Never delete or alter the row, and never restore access through old hashes or legacy session rows.
