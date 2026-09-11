# Shared Accounts adapter

The adapter is disabled unless `AEGYO_SHARED_AUTH_ENABLED=true` and every setting below is valid. With the flag off, existing login, signup, password reset, cookie, session lookup, roles, and user-owned data behave as before.

## Provider contract

Register this confidential OIDC client with Accounts:

- redirect URI: `${AEGYO_APP_ORIGIN}/api/auth/shared/callback`
- authorization code flow with S256 PKCE
- scopes: `openid profile email`
- client authentication: `client_secret_basic`
- signed ID-token claims: `sid`, `auth_time`, `https://aegyoarena.com/claims/password-reset-state`, `https://aegyoarena.com/claims/security-version`, and `https://aegyoarena.com/claims/operator-cutoff`

Set `AEGYO_AUTH_BASE_URL`, `AEGYO_APP_ORIGIN`, `AEGYO_AUTH_CLIENT_ID`, `AEGYO_AUTH_CLIENT_SECRET`, `AEGYO_AUTH_TRANSACTION_SECRET` (at least 32 characters), and the separate `AEGYO_AUTH_STATE_READER_KEY`. Accounts must expose authenticated `POST /api/internal/session-state` with the contract used by Arcade.

## Migration and mapping gate

Apply `prisma/migrations/20260911200000_add_shared_auth/migration.sql` through the normal reviewed deployment before enabling the flag. It only adds `SharedAuthIdentity` and nullable provider metadata to `Session`; existing local user IDs, roles, relations, and legacy sessions remain intact.

Import mappings explicitly with stable local IDs. Each row contains a local `userId`, the exact issuer (`${AEGYO_AUTH_BASE_URL}/api/auth`), and Accounts `subject`. Both `userId` and `(issuer, subject)` are unique. Reconcile and review conflicts before insertion. The callback never queries or maps by email and never creates a user. Any future reviewed provisioning job must store the exported `EXTERNAL_PASSWORD_SENTINEL` in `passwordHash`; normal password hashing cannot produce it. An unmapped subject, including one whose email matches an existing user, receives `account_not_mapped` and no session.

## Cutover and forward recovery

Before enabling, prove mappings against a synthetic database, register the exact callback, and verify provider state reader credentials. With the flag on, legacy login/signup/forgot/reset endpoints stop before credential reads or writes. Login submissions and the stable `/api/auth/recovery` entry continue into `/api/auth/shared/login`, so Accounts sign-in owns the visible recovery path. Signup remains closed until reviewed unmapped-user provisioning exists. Legacy `Session` rows are retained for rollback and preserve all user data, but rows without shared provider metadata are not authorized after flag-on. Cutover therefore forces existing users through Accounts sign-in; rehearse that real-user UX before rollout and never silently promote legacy sessions. Shared sessions retain the `session` cookie and `getSession()` shape expected by current consumers. Ordinary reads cache provider state for at most 30 seconds; authenticated writes always check Accounts and fail closed during outage.

After any real user transitions, disabling the flag is unsafe: it would reactivate legacy password hashes and sessions that Accounts resets cannot revoke. Production acceptance therefore requires a durable legacy-auth cutoff plus a rehearsed forward-recovery procedure. Until that exists, treat flag-on as irreversible for transitioned users and do not enable production shared auth. The additive schema may remain during an incident; never restore access through old hashes or legacy session rows.

The rollout still needs a final UX pass to label Accounts sign-in and recovery directly rather than relying on the compatibility redirects. This does not block protocol or mapping proof.

### Irreversible activation latch

After the mapping import is reconciled and legacy credential writes are frozen, an operator activates cutover once with an audited mapping digest:

```sql
INSERT INTO "AuthCutoverLatch" ("id", "mappingDigest")
VALUES ('accounts-shared-auth-v1', '<sha256-of-reviewed-mapping-manifest>')
ON CONFLICT ("id") DO NOTHING;
```

The application only reads this row and has no route that creates, updates, or deletes it. Before the row exists, flag-off uses legacy auth and flag-on stays unavailable. After it exists, valid flag-on configuration uses shared auth; flag-off, malformed configuration, and database lookup failure all fail closed with a recoverable unavailable response. Never delete this row.
