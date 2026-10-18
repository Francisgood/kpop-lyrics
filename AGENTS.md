# Agent notes

## Mobile parity (read before changing APIs, auth, chat, polls, news, or shared components)

The Aegyo mobile app (`Myosin-xyz/aegyo-mobile`) consumes this site's APIs, auth flow, and some pages. Production deploys from `main` on push, so a silent change breaks shipped phones.

- Before touching `app/api/news/**`, `app/api/polls/**`, `app/api/chat/**`, `app/api/auth/shared/**`, `app/api/auth/logout/**`, `lib/chat-*`, `lib/polls*`, `lib/shared-auth/**`, `components/FanChatbox.tsx`, `components/ChatRegionGate.tsx`, `components/PollCard.tsx`, `app/chat/**`, or `middleware.ts`, read `docs/MOBILE_CONTRACT.md`.
- Keep response fields, status codes, error codes, cookies, redirects, and mirrored copy backward compatible. Add, do not rename or remove. Version anything that must break.
- Update `docs/MOBILE_CONTRACT.md` and `tests/mobile-contract.test.ts` in the same PR.
- Open a mirror issue: `gh issue create --repo Myosin-xyz/aegyo-mobile --label web-parity --title "web-parity: <change>"`, and link it in the PR.
- For new user-facing features, state in the PR whether mobile ships it, skips it, or follows up.
- Fill the "Mobile parity" section of `.github/pull_request_template.md`.
