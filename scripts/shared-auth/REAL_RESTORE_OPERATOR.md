# Private real-data restore operator

This one-shot image copies a consistent custom-format PostgreSQL snapshot directly
between two databases reachable on Railway's private network. The dump exists only
in the process pipe. The operator prints booleans and aggregate counts, never rows,
URLs, credentials, or fingerprints.
Database-tool diagnostics stay in the operator's private `0600` temporary workspace.
On failure, logs receive only a stable phase code; cleanup stops the snapshot keeper
before removing that workspace.

Build from the repository root with:

```sh
docker build -f scripts/shared-auth/Dockerfile.real-restore -t aegyo-real-restore .
```

Run it as a private, non-restarting Railway service in the same project and
environment as both databases. Give it no domain or TCP proxy. Configure secrets
through Railway references, never image build arguments:

- `SOURCE_DATABASE_URL`: a connection for a dedicated non-superuser source role
  whose role setting includes `default_transaction_read_only=on`.
- `SOURCE_DATABASE_NAME`: exact expected production database name.
- `SOURCE_READ_ONLY_ROLE`: exact dedicated source role name.
- `TARGET_DATABASE_URL`: owner connection for a newly created empty clone database.
- `TARGET_DATABASE_NAME`: exact expected clone database name, different from source.
- `TARGET_OWNER_ROLE`: exact target owner role name.
- `SOURCE_DATABASE_CA_CERT` and `TARGET_DATABASE_CA_CERT`: PEM-encoded public
  certificate authorities obtained through the corresponding private database
  service. The operator writes them as private `0600` temporary files and forces
  `verify-full`; database URLs containing TLS overrides are refused.
- `AEGYO_REAL_RESTORE_CONFIRM=private-read-only-source-to-empty-clone`.

The source and target must both run PostgreSQL 18, matching the pinned client image.
The operator refuses a privileged or insufficiently constrained source role, a
non-empty target, mismatched identities, or mismatched major versions. Restore uses
`pg_restore --single-transaction`; a failure leaves the initially empty target
without partially restored objects. A before/after fingerprint covers every column
of every ordinary and partitioned non-system table, including ownership relations.
Database statements and lock acquisition are bounded to 300 seconds and five
seconds respectively.

This proves backup and restore only. Do not run migrations, Accounts import,
mapping installation, activation, email, or password reset in this job. A later
real import still needs an authorized canary password and the separately reviewed
credential-writer freeze.
