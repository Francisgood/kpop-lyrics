# Shared-auth cutover freeze

Set `AEGYO_AUTH_CUTOVER_FREEZE=true` before beginning the cutover. This explicit
freeze takes priority over the shared-auth flag, provider configuration, and
activation latch. Authentication remains closed after the latch is inserted:
legacy credential endpoints and shared sign-in reject requests, authenticated
product writes cannot obtain a session, and logout clears the browser cookie
without deleting the stored legacy session. An absent value and every value
other than the exact string `true` preserve normal authentication behavior.

The closed application mode is only one part of the writer freeze. Before the
final snapshot:

1. Set the explicit freeze flag and wait for the freeze deployment to become
   healthy.
2. Pause direct database writers, operator jobs, and any external process that
   can change users, credentials, roles, sessions, profiles, or user-linked
   records.
3. Wait for the previous deployment and already-authorized requests to drain.
4. Verify representative credential and authenticated write endpoints reject
   writes.
5. Take two canonical database snapshots of the protected rows after a quiet
   interval and proceed only when their counts and hashes are identical.

Keep the explicit flag active through the source snapshot, Accounts import,
mapping installation/status check, linked-record reconciliation, latch
activation, post-activation ownership snapshot, and canary acceptance. Run any
canary that must precede reopening through the reviewed private operator because
the public callback remains closed. Remove the explicit freeze flag only after
the shared-auth deployment is healthy and ownership acceptance passes. The
reconciliation fingerprint covers profile-linked poll votes, so anonymous poll
writes do not need to be paused for this invariant.
