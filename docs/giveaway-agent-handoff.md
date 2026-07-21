# BTS Giveaway — live draw agent handoff

This is the exact production handoff for the agent operating the Chainlink draw. The goal is one irreversible VRF request, two reproducible five-person candidate queues, a private email mapping, and a public proof page. Simon performs outreach only after the technical steps are complete.

## Non-negotiable facts

- Canonical public manifest: `public/giveaway/bts-2026/manifest.json`
- Eligible entries: `186`
- Manifest hash: `9fddd6971f8bb7c94a0b4e7705c0cbfab58d545fa4e26316221e8d853b6cad7b`
- Source CSV SHA-256: `900ebc4ad3ef9013da5bb78c739214021c07dbf66891b59f62335e46ea9b4b53`
- Production publication target: `/bts-giveaway/draw` in this repository.
- The separate Railway raffle demo currently displays 188 placeholder IDs (`1001`–`1188`). Its Admin page can consume a pasted seed, but it does not obtain the Chainlink word. Do not use its local “Run demo draw” result as the production draw, and do not publish its placeholder roster.
- One Chainlink VRF v2.5 `uint256` word is sufficient. This repository expands it into one deterministic full ordering. Positions 1–5 become the grand-prize candidate queue; positions 6–10 become the runner-up candidate queue.
- Never request multiple production words, choose among outputs, cancel because of the result, or modify the roster after requesting randomness.

Chainlink references: [VRF v2.5 request/receive flow](https://docs.chain.link/vrf/v2-5/getting-started) and [security considerations](https://docs.chain.link/vrf/v2-5/security).

## Preconditions — stop if any fail

1. The manifest above is merged, deployed, and publicly downloadable from `/giveaway/bts-2026/manifest.json`.
2. The checked-out manifest is tracked and clean:

   ```bash
   git ls-files --error-unmatch -- public/giveaway/bts-2026/manifest.json
   git diff --quiet HEAD -- public/giveaway/bts-2026/manifest.json
   ```

3. The private manifest exists outside Git and hashes to the public `privateRosterHash`. For the current operator machine it is:

   ```text
   /Users/mateodazab/Documents/myosin/giveaway-private/bts-2026.private.csv
   ```

   If the live agent runs elsewhere, Mateo must transfer this file through Myosin-controlled private storage. The public manifest alone cannot map selected IDs back to emails. Set the two private paths before finalization:

   ```bash
   export PRIVATE_MANIFEST_PATH=/secure/path/bts-2026.private.csv
   export PRIVATE_CANDIDATE_OUTPUT=/secure/path/bts-2026.candidates.csv
   ```

4. The Administrator has reconciled the current Official Rules with the supplied two-prize agreements and July 17 roster cutoff.
5. You have authorized access to the already-deployed VRF v2.5 consumer and its owner/requester wallet or production automation.
6. You know the consumer's network, numeric chain ID, contract address, request function, payment mode, and block explorer.
7. The consumer is funded for one request and configured for exactly `numWords = 1` with a valid confirmation count and callback gas limit.
8. The consumer stores or emits both the `requestId` and the raw fulfilled `randomWords[0]` value. If it transforms the word without retaining the raw value, stop and fix that observability before requesting production randomness.

## A. Rehearse without touching Chainlink

Run the committed rehearsal verifier:

```bash
npm install
npm run test:giveaway
npm run giveaway:verify -- \
  --manifest public/giveaway/bts-2026/manifest.json \
  --proof public/giveaway/bts-2026/test-proof.json
```

Expected: `verified: true`, `mode: test`, 186 eligible entries, five grand-prize IDs, five runner-up IDs, and no overlap. These rehearsal IDs are never contacted.

## B. Obtain the one production VRF word

The Railway Admin field labeled “VRF seed” is an input field, not a Chainlink requester. Obtain the word from the deployed consumer:

1. Open the source/configuration for the deployed raffle consumer.
2. Record these values before sending anything:

   ```text
   CHAIN_NAME=
   CHAIN_ID=
   VRF_CONSUMER_ADDRESS=
   BLOCK_EXPLORER_BASE_URL=
   REQUEST_FUNCTION=
   PAYMENT_MODE=direct-funding-or-subscription
   ```

3. Confirm the manifest hash shown above is already public. No entry can be added, removed, reordered, or renamed after this point.
4. Call the consumer's authorized randomness-request function exactly once with `numWords = 1`. Wait for the request transaction to be mined. Record:

   ```text
   VRF_REQUEST_TX=
   VRF_REQUEST_ID=
   ```

5. Wait for Chainlink fulfillment. Match the fulfillment to the exact `VRF_REQUEST_ID`; do not assume the next callback belongs to this draw. Confirm the callback succeeded, then record:

   ```text
   VRF_FULFILLMENT_TX=
   VRF_RANDOM_WORD=the raw uint256 randomWords[0], decimal or 0x-hex
   ```

6. Open both transactions in the explorer and independently confirm:

   - both are on `CHAIN_ID`;
   - the request came from `VRF_CONSUMER_ADDRESS`;
   - the fulfillment matches `VRF_REQUEST_ID`;
   - fulfillment reports success;
   - the recorded raw word is the value delivered to the consumer.

If the request reverts, no request exists; fix funding/configuration and retry the transaction. If a request is mined but fulfillment or its callback fails, stop and preserve all evidence. Do not submit a second request merely to obtain a different word.

## C. Finalize the ten candidates once

Export the evidence values in the operator shell, then run:

```bash
npm run giveaway:finalize -- \
  --mode production \
  --manifest public/giveaway/bts-2026/manifest.json \
  --private-manifest "$PRIVATE_MANIFEST_PATH" \
  --private-output "$PRIVATE_CANDIDATE_OUTPUT" \
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

The finalizer must return:

- `mode: production`;
- `eligibleCount: 186`;
- five `grandPrizePublicIds`;
- five `runnerUpPublicIds`;
- one public `proofHash`;
- a private candidate CSV path.

It refuses a dirty/untracked manifest, the rehearsal word, malformed Chainlink evidence, a private-manifest mismatch, or overwriting a completed production proof.

## D. Independently verify before publishing

```bash
npm run giveaway:verify -- \
  --manifest public/giveaway/bts-2026/manifest.json \
  --proof public/giveaway/bts-2026/production-proof.json
```

Have a second operator or clean checkout run the same command. Both outputs must show the same manifest hash, proof hash, and ten public IDs.

Privately inspect `bts-2026.candidates.csv` and confirm:

- exactly five `grand-prize` rows;
- exactly five `runner-up` rows;
- all ten public IDs match the proof;
- no email appears in any Git-tracked file.

## E. Publish

1. Commit only the public proof JSON. Never commit the private manifest or candidate CSV.
2. Push and deploy this application.
3. Verify `/bts-giveaway/draw` says “Production draw complete.”
4. Verify it shows the same two ordered queues and working request/fulfillment explorer links.
5. Download the public manifest and re-run the verifier against the deployed proof.
6. Archive the original CSV, private manifest, private candidate CSV, proof, verifier output, commit SHA, and both transaction links in Myosin-controlled storage.

## F. Simon's only step: outreach

Simon starts with position 1 in each prize queue. If that candidate is ineligible, unreachable, declines, misses the applicable deadline, or cannot complete KYC/terms, Simon advances to position 2 in the same queue, then position 3, and so on. Do not contact all ten simultaneously and do not move a grand-prize candidate into the runner-up queue.

## Completion report — no PII

The operating agent reports only:

```text
Manifest hash:
Proof hash:
Chain / chain ID:
Consumer address:
Request ID:
Request transaction:
Fulfillment transaction:
Grand-prize public IDs (ordered):
Runner-up public IDs (ordered):
Verifier result:
Deployment URL:
Private candidate CSV stored at: [path only]
```

Never paste names, emails, KYC data, the private manifest, or the private candidate CSV into GitHub, Slack, or a public draw page.
