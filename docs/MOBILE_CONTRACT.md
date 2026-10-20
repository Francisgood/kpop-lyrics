# Mobile contract

The Aegyo mobile app (private repo `Myosin-xyz/aegyo-mobile`, Expo / React Native) reads the surfaces below from this site. Production deploys from `main`, and the app on users' phones updates slower than the site does, so a breaking change here breaks shipped clients.

Inventory verified against this repo's code on October 18, 2026. `tests/mobile-contract.test.ts` pins the response shapes; it fails when one of them drifts.

## News

### `GET /api/news?limit&offset`
Owner: `app/api/news/route.ts`

- `limit` is clamped to 1..30 (default 20), `offset` to 0 or more.
- 200 `{ posts, nextOffset, hasMore }`. `nextOffset = offset + posts.length`; `hasMore` is true when a full page came back.
- Post fields: `id, slug, headline, subheadline, body, esHeadline, esSubheadline, imageUrl, imageCredit, category, tag, artistSlug, artistName, sourceName, sourceUrl, readMins, publishedAt`. Only `status = 'live'` posts, newest first.
- `bodyEs`: pending #26, not on `main` yet.
- On any query failure the route returns 200 `{ posts: [], nextOffset: offset, hasMore: false }`. The app treats that as an empty feed, so never turn it into a 5xx.
- `body` paragraphs are separated by blank lines. The web article page splits on `/\n{2,}/` (`app/news/[artist]/[slug]/page.tsx`) and the app does the same.
- `category` values: `news, comeback, chart, award, collab, gossip, controversy, debut, rumor`. The admin writer's allowed set is `CATS` in `app/api/admin/news-posts/route.ts`. The web falls back to the "News" pill for unknown values; a new category also needs EN/ES labels in the app.

### `GET /api/news/[slug]` (pending #26)
Owner: `app/api/news/[slug]/route.ts` once #26 merges.

- Same post fields plus `bodyEs` and `pollSlug`; 404 and 503 return JSON bodies.

## Polls

Owners: `app/api/polls/[slug]/route.ts`, `app/api/polls/[slug]/vote/route.ts`, `lib/polls.ts` (seeds, shapes, `LOW_VOLUME_FLOOR`), `lib/polls-db.ts` (ledger), `components/PollCard.tsx` (web UI and copy).

### `GET /api/polls/[slug]`
- `[slug]` may be a poll id or an article slug. `getPollSeed` resolves poll id first, then `ARTICLE_POLLS`, then a deterministic fallback poll, so in practice almost every slug returns a poll. `poll.slug` is always the poll id, never the article slug.
- 200 `{ ok: true, poll, deviceToken }`.
- `poll`: `{ slug, question, questionEs, options[{ key, label, labelEs }], counts{ a, b, c, d, total }, myVote, closed, policy, voterName }`, plus optional `daebakUrl`. `policy` is `"anonymous_allowed" | "registered_only"`. `myVote` is a key or `null`.
- Device identity: the `aa_vid` cookie wins, then `?deviceId=`. With neither and no session, the route mints a token, returns it as `deviceToken`, and sets `aa_vid` (httpOnly, lax, 1 year).
- Errors: 404 `{ error }` only when no seed resolves; 500 `{ error }` on failure.

### `POST /api/polls/[slug]/vote`
- Body `{ option, deviceId }`. No Origin check. The app relies on that.
- 200 `{ ok: true, myVote, counts, deviceToken }`. Idempotent per (poll id, voter): a repeat vote returns the original pick.
- Closed poll: 200 `{ ok: false, closed: true, counts }`.
- Errors: 400 `{ error }` for a bad option, 404 unknown poll, 503 with `retry-after: 60` during the auth cutover freeze, 500 on failure.

### Copy mirrored in the app
- Early-voting rule: percentages show only at 50+ total votes (`LOW_VOLUME_FLOOR` in `lib/polls.ts`); below that the card reads "Early voting… · N votes so far" (`components/PollCard.tsx`).

## Fan chat

Owners: `app/api/chat/route.ts`, `app/api/chat/participation/route.ts`, `app/api/chat/report/route.ts`, `lib/chat-policy.ts`, `lib/chat-participation.ts`, `lib/chat-report-policy.ts`, `lib/chat-request.ts`, `lib/chat-auth.ts`.

Every chat route returns 404 `{ error }` when `AEGYO_CHAT_ENABLED` is not `"true"`.

**Origin rule.** Every chat mutation (`POST /api/chat`, `POST /api/chat/participation`, `POST /api/chat/report`) returns 403 unless the `Origin` header matches `AEGYO_APP_ORIGIN` (`sameOrigin` in `lib/chat-policy.ts`; `aegyoarena.com` and `www.aegyoarena.com` are interchangeable, and the request host must match too). A request with no `Origin` header is rejected. The app sends this header deliberately; do not tighten the rule without a mobile release.

Write routes need an Aegyo Accounts session (`getChatSession`). When `AEGYO_CHAT_WRITE_ALLOWLIST` is set, non-listed emails get 403.

### `GET /api/chat`
- Anonymous. 200 `{ messages: [{ id, body, createdAt, authorName }] }`, oldest first, at most 60 visible messages from the last 30 days. `createdAt` is an ISO string. `Cache-Control: no-store`.
- 503 `{ error }` on failure.

### `POST /api/chat`
- Body `{ body }`, at most 2048 bytes.
- 201 `{ status: "visible" | "held", message }`; `message` is `null` when held.
- 401 not signed in. 403 bad origin, preview-tester limit, `code: "chat_agreement_required"`, or muted. 413 over 2048 bytes. 422 `{ error }` with the validation text (2–500 characters or one emoji, no links). 429 rate limits and duplicates. 503 when moderation, participation check, or storage is unavailable.

### `GET /api/chat/participation` and `POST /api/chat/participation`
- GET needs a session: 200 `{ accepted, rulesVersion }`; 401, 403, 503 otherwise.
- POST body `{ acceptRules: true, confirmAge16: true }` (256 bytes max): 200 `{ accepted: true, rulesVersion }`; 413, 422, 503 otherwise.
- `CHAT_RULES_VERSION` in `lib/chat-participation.ts` (currently `"2026-09-28.1"`). Bumping it forces every user, on web and in the app, to re-accept.

### `POST /api/chat/report`
- Body `{ messageId, reason }` (512 bytes max). Reasons are `chatReportReasons` in `lib/chat-report-policy.ts`: `abuse, sexual, spam, personal_info, underage, other`. The app shows the same list.
- 200 `{ ok: true }`, also when the user already reported that message.
- 400 bad reason, unknown or non-visible message, or own message. 401 not signed in. 403 bad origin, tester limit, or muted. 413 too large. 429 after 5 reports a day. 503 on failure.

### Region visibility (mirrored client-side)
- `lib/chat-region.ts`: chat UI is hidden for the EU-27 plus GB (28 codes, exported as `chatHiddenCountries`). This controls visibility only; it is not access control.
- `components/ChatRegionGate.tsx`: country lookup via `https://api.country.is/` (4 s timeout, credentials omitted), cached in `sessionStorage` for 1 hour. Unknown country means hidden. The full-page notice text lives here.

### Copy mirrored in the app
- Chat gate (rules checkbox, 16+ confirmation, "Public chat · no links or personal details"): `components/FanChatbox.tsx`.
- Rules: `app/chat/rules/page.tsx`.
- Region notice: `components/ChatRegionGate.tsx`.

## Shared auth (Aegyo Accounts)

Owners: `app/api/auth/shared/*/route.ts`, `lib/shared-auth/**`, `app/api/auth/logout/route.ts`, `middleware.ts` (cutover freeze, preview read-only rule).

Outside shared mode, the login, callback, session, and logout routes return 404 `{ code: "not_found" }` (legacy mode) or 503 `{ code: "service_unavailable" }` (closed / frozen).

- `GET /api/auth/shared/login`: 307 to the provider's authorization endpoint (in production `https://account.aegyoarena.com/api/auth/oauth2/authorize`; the URL comes from OIDC discovery against `AEGYO_AUTH_BASE_URL`, not from this repo). Sets `__Host-aegyo_oidc_tx` (10 minutes). A request on a non-canonical host first redirects to `/api/auth/shared/login` on `AEGYO_APP_ORIGIN`, keeping `?client=mobile` when it was sent. 503 `{ code: "identity_provider_unavailable" }` if discovery fails.
  - `?client=mobile` (exact, case-sensitive value) asks for a mobile session. Any other value, or no parameter, means web. The choice is stored in the signed transaction cookie and carried through the one interactive re-authentication retry and the "Try Accounts sign-in again" link on callback failure pages. The app must start sign-in at `/api/auth/shared/login?client=mobile`.
- `GET /api/auth/shared/callback`: on success sets cookie `session`, clears the transaction cookie, and redirects to `new URL("/", AEGYO_APP_ORIGIN)`, which in production is exactly `https://aegyoarena.com/`. The app detects sign-in completion by that exact landing URL. Failures return JSON `{ code }` or a small HTML page.
  - Session lifetime is fixed at creation and the `session` cookie `maxAge` equals it: mobile 90 days (`MOBILE_SESSION_TTL_SECONDS` in `lib/shared-auth/config.ts`), web 1 day (`WEB_SESSION_TTL_SECONDS`). There is no sliding renewal. Revocation does not change: every authorized request rechecks provider `session-state` at least every 30 seconds, so a sign-out or revocation in Accounts still ends the local session. A local session longer than the Accounts provider session only holds once the provider session is also long (Accounts is moving to 90 days fixed in `Myosin-xyz/aegyo-arcade#31`).
  - `client=mobile` is a convenience signal, not a security boundary. A browser user who adds it gets a 90-day session on their own account, with the same revocation checks.
  - The app's WebView also appends `AegyoArenaMobile/<version>` to its user agent. That is informational only: the site may log it but never requires it, and it does not select the session lifetime.
- `GET /api/auth/shared/session`: 200 `{ authenticated: true, user: { id, email, displayName } }`; 401 `{ authenticated: false }` (also clears cookies when the session is rejected); 503 `{ code: "identity_provider_unavailable" }`.
- `POST /api/auth/shared/logout`: POST only. `Origin` is optional but must equal `AEGYO_APP_ORIGIN` when present (403 `{ code: "bad_origin" }`). Returns 200 `{ ok: true }` and clears both `session` and `__Host-aegyo_oidc_tx`. It does not return a provider sign-out URL.
- `POST /api/auth/logout` (the web menu's sign-out): returns `{ ok: true, next }` where `next` is `<provider>/sign-out?return=aegyo`, only in shared mode with `AEGYO_APP_ORIGIN = https://aegyoarena.com` on the canonical host; otherwise `{ ok: true }`.

## Pages loaded in the app's WebView

- `/chat/status` (`app/chat/status/page.tsx`). The app injects CSS that hides `aside[data-chat-dock]`, the floating dock rendered by `components/FanChatbox.tsx`. Keep that attribute on the dock.
- `/privacy-policy` (`app/privacy-policy/`), `/cookie-policy` (`app/cookie-policy/`).
- Provider pages (not in this repo): `/sign-in`, `/consent`, and `/sign-out?return=aegyo`, which hops through daebakmarkets and the arcade `browser-sign-out` and lands on `https://aegyoarena.com/`.

## Copy mirrored in the app

- Feed header "The Feed · Updated daily" / "El Feed · Actualizado a diario": `components/NewsFeed.tsx` (`COPY`).
- Category labels EN/ES: `CAT` in `components/NewsFeed.tsx` and the article page map in `app/news/[artist]/[slug]/page.tsx`.
- Chat gate, rules, region notice, and the poll early-voting rule: see the chat and polls sections above.

## How to change something here

1. Keep it backward compatible: add fields, never rename or remove them, and keep status codes and error `code` values stable. If a break is unavoidable, version it (a new route or a new field) and keep the old shape until the app has shipped and adoption allows removal.
2. Update this doc in the same PR, and update `tests/mobile-contract.test.ts` if a pinned shape changes.
3. Open a mirror issue in the app repo and link it in the PR:
   ```sh
   gh issue create --repo Myosin-xyz/aegyo-mobile --label web-parity --title "web-parity: <change>"
   ```
4. For a new user-facing feature, say in the PR whether mobile ships it, skips it, or follows up later.

The `mobile-parity` workflow (`.github/workflows/mobile-parity.yml`) labels PRs that touch these paths and posts the checklist as a comment.

## Oct 20 shared chat enforcement and deletion (pending rollout)

Chat policy now belongs to the server. `GET /api/chat/availability` returns `{country:string|null,allowed:boolean}` with private/no-store caching. EU-27 and GB are blocked. Unknown country (including lookup failure) is allowed by the owner's explicit decision. Message GET/POST, participation GET/POST, reports and `/chat/status` enforce the same rule. API denial is **403**, `code:"chat_region_restricted"`. Web clears stale messages; mobile must suppress cached messages on that code. Existing disabled-chat 404, session, moderation and 16+ rules remain.

`AEGYO_CHAT_RAILWAY_IP_VERIFIED=true` is required to trust `x-real-ip`; set it only after proving the production proxy overwrites incoming client values. Forwarded country headers are not accepted. The server queries `https://api.country.is/<verified-ip>` with a two-second timeout, caching a country for 60 seconds or unknown for five seconds. Without verified ingress configuration, country is unknown, so EU/UK enforcement is **not proven active**. Raw IPs are held only in a bounded in-memory cache and are not logged by this module. Update privacy disclosures for server geolocation.

Shared account deletion uses dedicated server-only `AEGYO_ACCOUNT_DELETION_KEY` (minimum 32 characters). `GET /api/internal/account-deletion` checks migration readiness and returns `{ready:true,version:1,product:"social"}`. POST accepts `{requestId:UUID,issuer,subject}`, where issuer must exactly equal `${AEGYO_AUTH_BASE_URL}/api/auth`. Neither endpoint accepts ordinary user cookies as authorization.

Apply `20261020170000_account_deletion` before new code. The participant deletes securely associated identity/profile/session, chat/content/vote/follow records, plus email-matched local registration/tip/giveaway/notification records. Other users' content is preserved. Display-name-only CommunityAnnotation/CommunityComment ownership is ambiguous; private receipt `reviewRecords` records matching IDs rather than deleting someone else's content. External newsletter copies receive a private reconciliation reference before local email records are erased. The public response contains counts/category names, not those references. Operator access to this table must be restricted; clear resolved review references under the approved retention policy.

The receipt is a permanent identity tombstone for stale OAuth callbacks, including `no_link` requests. Raw account-owned tables now enforce account existence under a row lock, including tables created later at runtime. This prevents a previously authenticated request from recreating content after the User deletion commits. The coordinator processes other products and scrubs central credentials even when this participant returns `needs_review`.

Local proof: `AEGYO_DELETION_PG_TEST=1 npx vitest run tests/account-deletion-postgres.test.ts tests/chat-region-server.test.ts tests/chat-region.test.ts`. It creates a unique local `/tmp` PostgreSQL database, applies the current schema and deletion migration, and tests peer preservation, private review references, replay and stale-write rejection. Production contract probes must remain anonymous GET/HEAD only.
