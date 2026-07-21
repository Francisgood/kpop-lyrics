# BTS Giveaway — Chainlink VRF draw runbook

This repository owns the frozen roster commitment, deterministic selection algorithm, public proof, and independent verifier. PII remains in local gitignored CSV files. The production draw is write-once.

## Frozen policy

- Source: `aegyo-arena-basic_subscriber-2026-07-21.csv` supplied as the final roster.
- Eligibility: one entry per unique normalized email created on or before Friday, July 17, 2026 at 11:59:59 p.m. EDT.
- Current subscription status does not remove an entry; the rule is based on having subscribed by the cutoff.
- Selection: five ordered grand-prize candidate positions followed by five ordered runner-up-prize candidate positions, with no overlap.
- Public output contains IDs only. Email mapping remains private.
- Test output is never a winner selection and cannot be reused in production.

## What the VRF value is

Chainlink VRF fulfills a request with one or more `uint256` random words. This draw needs one word. The finalizer accepts the word as decimal or `0x` hex and normalizes it to 32-byte hex. It ranks every frozen public ID by:

```text
SHA-256(
  domain separator + "\n" +
  frozen manifest hash + "\n" +
  normalized VRF random word + "\n" +
  public entry ID
)
```

Scores sort ascending. Positions 1–5 form the grand-prize candidate queue and positions 6–10 form the runner-up-prize candidate queue. The first eligible accepter in each queue receives that queue's prize. The remaining deterministic order is committed by `completeOrderHash`. A different roster, word, or ID changes the result.

## Rules reconciliation before outreach

The repository's existing Official Rules page predates the supplied winner agreements and current operating direction. It describes a July 15 cutoff and one combined $2,500 prize, while the final CSV instruction uses July 17 and the agreements split the $2,200 grand prize from the $300 runner-up prize. The draw tooling implements the final CSV and current two-queue direction, but the Administrator must reconcile the controlling public rules before contacting or awarding candidates. This is a legal/operations check, not a randomness reroll.

## Rehearsal already included in the PR

The committed `test-proof.json` uses a deterministic, visibly test-only 256-bit word. Reproduce it with:

```bash
npm run giveaway:verify -- \
  --manifest public/giveaway/bts-2026/manifest.json \
  --proof public/giveaway/bts-2026/test-proof.json
```

Never contact anyone from the rehearsal list.

## Production: agent steps 1–7

### 1. Merge and deploy the frozen manifest

The manifest must be committed and clean before requesting VRF. Record its `manifestHash`, `source.sha256`, `privateRosterHash`, and `eligibleCount` in the operations log.

### 2. Request one Chainlink VRF v2.5 random word

Use the existing funded consumer and the intended production network. Request exactly one word after Step 1. Do not cancel, reroll, or request a replacement because of the result. Save:

- chain name and numeric chain ID;
- consumer contract address;
- request ID;
- request transaction hash;
- fulfillment transaction hash;
- fulfilled random word;
- block explorer base URL.

### 3. Finalize the draw once

Keep the private files outside the repository. Replace the example values with the fulfilled evidence:

```bash
npm run giveaway:finalize -- \
  --mode production \
  --manifest public/giveaway/bts-2026/manifest.json \
  --private-manifest /secure/path/bts-2026.private.csv \
  --private-output /secure/path/bts-2026.candidates.csv \
  --proof-output public/giveaway/bts-2026/production-proof.json \
  --random-word "$VRF_RANDOM_WORD" \
  --chain-name "$CHAIN_NAME" \
  --chain-id "$CHAIN_ID" \
  --consumer-address "$VRF_CONSUMER_ADDRESS" \
  --request-id "$VRF_REQUEST_ID" \
  --request-tx "$VRF_REQUEST_TX" \
  --fulfillment-tx "$VRF_FULFILLMENT_TX" \
  --explorer-base-url "$BLOCK_EXPLORER_BASE_URL"
```

The command refuses an uncommitted manifest, the rehearsal word, invalid chain evidence, a mismatched private manifest, or overwriting a completed production proof.

### 4. Independently reproduce it

```bash
npm run giveaway:verify -- \
  --manifest public/giveaway/bts-2026/manifest.json \
  --proof public/giveaway/bts-2026/production-proof.json
```

Have a second operator run the same command from a clean checkout and compare the ten public IDs and proof hash.

### 5. Check the private mapping

Open `/secure/path/bts-2026.candidates.csv` privately. Confirm it contains exactly five `grand-prize` rows and five `runner-up` rows and that every public ID matches the public proof. Never commit or paste this file into chat.

### 6. Publish the proof

Commit only `public/giveaway/bts-2026/production-proof.json`, push, and deploy. Verify `/bts-giveaway/draw` shows “Production draw complete,” the same ten public IDs, and working transaction links.

### 7. Archive the evidence

Archive the original private CSV, private manifest, candidate mapping, manifest/proof JSON, commit SHA, request/fulfillment transactions, and verifier output in Myosin-controlled storage.

## Step 8 — Simon only

After the Administrator confirms the rules reconciliation above, Simon contacts position 1 in the grand-prize queue and position 1 in the runner-up queue. If either candidate is ineligible, unreachable, unable to attend, or declines within the applicable response window, move to the next position in that same queue. Candidate selection is not final prize award; KYC and the applicable agreement still control acceptance.
