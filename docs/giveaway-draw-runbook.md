# BTS Giveaway — Chainlink VRF draw runbook

The authoritative operator procedure is [`docs/giveaway-agent-handoff.md`](giveaway-agent-handoff.md). This page explains the design and the evidence an independent reviewer should expect.

## Frozen policy

- The final source is `aegyo-arena-basic_subscriber-2026-07-21.csv`.
- Eligibility is one entry per unique normalized email created by July 17, 2026 at 11:59:59 p.m. EDT.
- The frozen manifest contains 186 anonymous public IDs. Emails remain in a mode-`0600` CSV outside Git.
- One Chainlink VRF v2.5 word creates one complete deterministic ordering.
- Positions 1–5 are the ordered grand-prize candidate queue; positions 6–10 are the ordered runner-up queue.
- Candidates never overlap, and the contract cannot request a second word.
- A candidate is not a confirmed winner until private eligibility, response, KYC, and agreement checks pass.

## How one VRF word selects ten candidates

For every frozen public ID, the verifier computes:

```text
SHA-256(
  domain separator + "\n" +
  frozen manifest hash + "\n" +
  normalized uint256 VRF word + "\n" +
  public entry ID
)
```

Scores sort ascending, with the public ID as a deterministic tie-break. Taking the first ten produces two disjoint ordered queues. The public proof also commits the complete 186-entry ordering by hash. Anyone can download the manifest, raw VRF word, and verifier and reproduce the result.

## Why this is one-shot

`chainlink/src/AegyoBtsGiveawayDraw.sol` is deployed with four immutable facts: the fixed owner, the official Base VRF v2.5 wrapper, the roster manifest hash, and the draw-spec hash. Its state moves only:

```text
Open → Requested → Fulfilled
```

Only the fixed owner can call `requestDraw()`. The authenticated wrapper callback stores exactly one raw word. There is deliberately no reset, cancellation, reroll, owner transfer, arbitrary callback, or second-request path. Unexpected or duplicate callbacks cannot overwrite the accepted word.

The committed draw spec fixes Base Mainnet (`8453`), native direct funding, one word, 20 request confirmations, 100,000 callback gas, 20 additional Base blocks before publication, the official wrapper address, the selection algorithm, and the no-reroll policy. Its hash is stored in the contract and published with the proof.

## Public evidence chain

A completed proof publishes no personal data. It contains:

- manifest and draw-spec hashes;
- exact public source commit;
- Base chain ID and official Chainlink wrapper;
- consumer address and deployment transaction;
- request ID and request transaction;
- fulfillment transaction and raw word;
- proof hash and complete-order hash;
- five grand-prize public IDs and five runner-up public IDs.

The draw page links the source commit and all three BaseScan records. `scripts/giveaway/verify-draw.mjs` rejects any proof whose roster, spec, wrapper, chain, evidence shape, rankings, complete-order hash, or proof hash does not reproduce.

## Recovery boundary

The operator writes private state before deployment and before the request. If a process crashes after signing, it recovers the exact transaction by wallet nonce and checks on-chain contract state before doing anything else. A mined request is final even if the local process did not see its response. Rerunning the same command resumes; it does not reroll.

The final public proof is write-once. The private candidate mapping is generated only after fulfillment, stored outside Git, and never shown on the public page.

## Rules reconciliation before outreach

The repository's older Official Rules describe a July 15 cutoff and one combined $2,500 prize. Current operating materials use the July 17 cutoff and separate $2,200 grand-prize / $300 runner-up agreements. The tooling implements the final roster and two-queue instruction, but the Administrator must reconcile the controlling rules before contacting or awarding candidates. That is a legal/operations correction, never a reason to rerun the random draw.
