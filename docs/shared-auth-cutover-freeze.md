# Shared-auth cutover freeze

Keep `AEGYO_SHARED_AUTH_ENABLED=true` with valid shared-auth configuration while
the activation latch is absent. In this state authentication is closed: legacy
credential endpoints and shared sign-in reject requests, authenticated product
writes cannot obtain a session, and logout clears the browser cookie without
deleting the stored legacy session.

The closed application mode is only one part of the writer freeze. Before the
final snapshot:

1. Pause direct database writers, operator jobs, and any external process that
   can change users, credentials, roles, sessions, profiles, or user-linked
   records.
2. Wait for the previous deployment and already-authorized requests to drain.
3. Verify representative credential and authenticated write endpoints reject
   writes.
4. Take two canonical database snapshots of the protected rows after a quiet
   interval and proceed only when their counts and hashes are identical.

Keep the freeze active through the source snapshot, Accounts import, mapping
installation/status check, linked-record reconciliation, and latch activation.
If the reconciliation fingerprint covers all poll votes rather than only
profile-linked votes, block anonymous poll writes at the edge for the same
window. Lift the writer pause only after the shared-auth deployment is healthy
and the post-activation ownership snapshot matches.
