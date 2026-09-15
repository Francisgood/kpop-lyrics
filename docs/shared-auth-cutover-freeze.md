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
activation, post-activation ownership snapshot, and private acceptance. While
the flag is set, use only the reviewed private operator for pre-release identity
and ownership checks; public login and callback routes are intentionally closed
and cannot serve as canary evidence. Remove the explicit freeze flag only after
the shared-auth deployment is healthy and private ownership acceptance passes,
then run the public sign-in canary immediately as a post-release gate.
Profile-linked poll votes are required reconciliation state, and the collector
always includes the IDs and full-row digest for `anonymousPollVotes`. The auth
freeze makes signed-in requests anonymous, but it does not stop the public poll
vote route from writing device votes. Block that route at the edge or pause its
database writes for the same window, and keep it paused until the post-cutover
anonymous digest matches.
