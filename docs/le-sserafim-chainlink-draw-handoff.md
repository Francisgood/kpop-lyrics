# LE SSERAFIM giveaway — Chainlink draw handoff

This is the technical draw only. Simon's agent builds the public page from the files under `public/giveaway/le-sserafim-2026/`; Simon handles private outreach and eligibility review. Do not place names, email addresses, the weighted source CSV, or the private candidate mapping in Git, the page, or a public chat.

## Frozen roster and selection

- The supplied weighted CSV has 416 distinct normalized emails and 552 tickets. Each entrant has exactly one base ticket; 136 additional tickets are listed as referral bonuses.
- A read-only comparison against the live Aegyo entrant export found 416 entrants, 552 total tickets, no missing emails, no weight mismatches, and no entry created after the October 1 11:59:59 p.m. ET cutoff. The exported personal data was processed in memory and not committed.
- Public ticket and entrant IDs are random pseudonyms. The manifest commits their one-to-many mapping, the source CSV hash, and the hash of a separate private roster. The private roster is stored outside Git with mode `0600`.
- One Chainlink VRF v2.5 word on Base Mainnet ranks all 552 tickets by `SHA-256(domain separator + "\n" + manifest hash + "\n" + normalized uint256 word + "\n" + ticket ID)`, breaking ties by ticket ID. Scan this order and retain the first ticket for each unique entrant. The first five distinct entrants form the ordered grand-prize candidate queue; the next five form the runner-up queue. There is no reroll or overlap.
- A candidate is not a confirmed winner. Simon contacts position 1 in each queue and advances only within that same queue if the person fails the applicable eligibility, response, identity, or acceptance checks. Do not contact all ten at once.

## Public artifacts

- `manifest.json`: frozen pseudonymous ticket-to-entrant roster and source commitment.
- `draw-spec.json`: exact Base VRF settings, selection policy, and no-reroll commitment.
- `test-proof.json`: rehearsal only. Never use these candidates for outreach.
- `production-proof.json`: the completed one-shot production draw. Both the repository verifier and a separate Python implementation reproduced the 5 + 5 order from the on-chain word. The private candidate file contains ten distinct emails and is mode `0600` outside Git.

## Completed on-chain draw

- Proof finalized October 4, 2026 at 14:35 UTC. This is the actual draw date, later than the date currently printed in the campaign terms.
- Source implementation commit: `9d32478` (full SHA is recorded in the proof).
- Consumer: [`0x8646E890faE384fBaC952A497DafB314Af12EE92`](https://basescan.org/address/0x8646E890faE384fBaC952A497DafB314Af12EE92)
- [Deployment transaction](https://basescan.org/tx/0x958e04b8cc03f8759d71d27216136c129a48e1636e05184fbb7b679280bec1e1)
- [One-shot request transaction](https://basescan.org/tx/0x64c514387f0a1dbb9e130f4052b242615f2180c0b68dc54ca11bd359a86d3441)
- [Fulfillment transaction](https://basescan.org/tx/0xc4178fffd0c3b86088b5dd70d2253106839e9ed02dd5228e4851727385b5e23b)
- Manifest hash: `83d8527d506c5fda1e028111a4bc2800dc2d41d9b90f965f08956353d2b3531b`
- Draw-spec hash: `46fbb2171bb8f0519af8b7a3f1d6d5d102a1ea7c7b7326623df55900c370f146`
- Proof hash: `71493b1c154e0cd7b2f62e581c9f95fea33f02170961eaf1611adcb77b551e61`

The draw page should show only the ten public entrant IDs, ordered by group and position, plus the manifest/spec/proof hashes and BaseScan links for the consumer, deployment, request, and fulfillment. It should derive its state from `production-proof.json` and never perform its own draw.

## Operator notes

The draw reused the tested one-shot BTS design with a new LE SSERAFIM consumer and campaign-specific weighted selection. The live command was `npm run lsf:chainlink:draw` with the same keystore and Chainlink wrapper but a campaign-specific recovery file. The operator verified the source commit, roster/spec commitments, wallet, wrapper, native funding quote, on-chain contract state, fulfillment transaction, and publication depth before finalizing. The first run stopped after a successful deployment because a public RPC node had not yet served the new contract code; the second run recovered that exact deployment and created only one VRF request. Do not start a second draw.

The private files are under `~/.local/share/aegyo-giveaway/le-sserafim-2026/`. Their exact contents and the draw-wallet password stay outside Git and all public logs. To check the public proof independently:

```bash
npm run lsf:verify -- --manifest public/giveaway/le-sserafim-2026/manifest.json --draw-spec public/giveaway/le-sserafim-2026/draw-spec.json --proof public/giveaway/le-sserafim-2026/production-proof.json
```

The live public terms currently promise an October 2 draw, which was missed. The actual on-chain date and transaction records must be reported truthfully. The Administrator should correct the public timing before outreach or publication; a date correction does not change or justify rerunning the random selection.
