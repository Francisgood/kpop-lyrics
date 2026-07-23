# BTS Giveaway — one-shot Chainlink draw handoff

This repository now owns the complete technical draw: the frozen roster commitment, a one-shot Chainlink VRF v2.5 consumer on Base, the deterministic 5 + 5 selection algorithm, the private email mapping, and the public proof page. Simon does not need MetaMask or contract tooling. His only post-draw job is candidate outreach.

## Frozen facts

- Eligible entries: `186`
- Manifest: `public/giveaway/bts-2026/manifest.json`
- Manifest hash: `9fddd6971f8bb7c94a0b4e7705c0cbfab58d545fa4e26316221e8d853b6cad7b`
- Draw spec: `public/giveaway/bts-2026/draw-spec.json`
- Draw-spec hash: `14b3e4f19ec1723664d8f26e5c370eec248c105a361f4738f649fe959b5cd46a`
- Network: Base Mainnet (`8453`)
- Chainlink VRF v2.5 native direct-funding wrapper: `0xb0407dbe851f8318bd31404A49e658143C982F23`
- Request: one word, 20 request confirmations, 100,000 callback gas, then 20 more Base blocks before publication
- Selection: positions 1–5 are the grand-prize queue; positions 6–10 are the runner-up queue
- Rerolls: forbidden and impossible in the consumer contract
- Draw wallet: `0xD21a29405560C91927F50988D8E78FCaa8990187`

The separate Railway raffle demo is not the randomness source. Its old 188 placeholder IDs and local “Run demo draw” control must not be used for production.

## What the operator script does

`npm run giveaway:chainlink:draw` performs the full sequence:

1. Re-validates the 186-entry manifest, draw spec, private mapping, Git commit, Base chain, Chainlink wrapper, wallet balance, and live wrapper quote.
2. Writes a private recovery record **before** either transaction is broadcast.
3. Deploys an immutable consumer bound to the manifest hash and draw-spec hash.
4. Verifies the deployed owner, wrapper, and both hashes from on-chain state.
5. Sends exactly one VRF request and stores its request ID.
6. Waits for the authenticated Chainlink callback, reads the raw word and fulfillment event, then waits 20 additional Base blocks and rechecks the receipt/state before publication.
7. Reproduces the two five-person queues, writes the public proof, and writes the private email mapping outside Git.
8. Runs the independent verifier and returns any unused request buffer to the draw wallet.

The contract has no reset, retry, cancellation, owner-transfer, or second-request function. If the process is interrupted, rerun the **same command**. The recovery file and wallet nonce locate any already-sent transaction; the script will not create another request.

## Preconditions — stop if any fail

1. This exact implementation commit is pushed to the public fork and the working tree is clean.
2. The public manifest and draw spec above are deployed and downloadable.
3. The private mapping exists outside Git at:

   ```text
   /Users/mateodazab/.local/share/aegyo-giveaway/bts-2026.private.csv
   ```

   It must reproduce the source, private-roster, and manifest hashes recorded above. Never print, upload, or commit it.
4. The encrypted keystore exists outside Git at:

   ```text
   /Users/mateodazab/.foundry/keystores/aegyo-draw
   ```

   Its password remains in macOS Keychain under service `aegyo-draw-keystore`; never paste the password or private key into chat or source control.
5. A reliable HTTPS Base Mainnet RPC is available. Confirm `cast chain-id` returns `8453`.
6. The funded wallet balance covers the live wrapper quote plus deployment/request gas.
7. The Administrator has reconciled the public Official Rules with the July 17 cutoff and the supplied $2,200 grand-prize / $300 runner-up agreements. This does not change the random draw, but it must be resolved before outreach or award.

## Rehearsal — no transaction

```bash
npm install
npm run test:giveaway
npm run giveaway:chainlink:build
npm run giveaway:chainlink:test
BASE_RPC_URL="$BASE_RPC_URL" npm run giveaway:chainlink:test:fork
npm run giveaway:verify -- \
  --manifest public/giveaway/bts-2026/manifest.json \
  --proof public/giveaway/bts-2026/test-proof.json
```

Expected: every test passes; the fork test uses the real Base wrapper; the rehearsal proof verifies 186 entries and two non-overlapping five-person queues. Rehearsal IDs are never contacted.

## Live command — run once, or rerun only to recover

Create a temporary password file from Keychain without printing it, then run:

```bash
DRAW_PASSWORD_FILE="$(mktemp /tmp/aegyo-draw-password.XXXXXX)"
chmod 600 "$DRAW_PASSWORD_FILE"
trap 'unlink "$DRAW_PASSWORD_FILE" 2>/dev/null || true' EXIT INT TERM
security find-generic-password -a "$USER" -s aegyo-draw-keystore -w > "$DRAW_PASSWORD_FILE"

BASE_RPC_URL="$BASE_RPC_URL" \
DRAW_KEYSTORE=/Users/mateodazab/.foundry/keystores/aegyo-draw \
DRAW_PASSWORD_FILE="$DRAW_PASSWORD_FILE" \
npm run giveaway:chainlink:draw -- \
  --confirm "I AUTHORIZE ONE BASE MAINNET VRF DRAW" \
  --private-manifest /Users/mateodazab/.local/share/aegyo-giveaway/bts-2026.private.csv \
  --private-output /Users/mateodazab/.local/share/aegyo-giveaway/bts-2026.candidates.csv

unlink "$DRAW_PASSWORD_FILE"
unset DRAW_PASSWORD_FILE
trap - EXIT INT TERM
```

If the command exits after a transaction may have been sent, do not improvise and do not delete the recovery state. Fix the connectivity/tooling issue and rerun the exact command. If the request is mined but fulfillment remains pending, preserve the state and wait; never request another word.

The private recovery file defaults to:

```text
~/.local/share/aegyo-giveaway/base-draw-state.json
```

## Publication

After the command reports `status: complete`:

1. Confirm `public/giveaway/bts-2026/production-proof.json` verifies.
2. Confirm the private candidate CSV contains exactly five grand-prize and five runner-up rows and no repeated public ID.
3. Review Git status. Only the public proof may enter Git; private CSVs, keystore material, recovery state, RPC credentials, and passwords must remain outside it.
4. Commit and push the public proof, deploy the site, and verify `/bts-giveaway/draw` shows links for the source commit, contract deployment, consumer, request, and fulfillment.
5. Archive the original CSV, private mapping, candidate mapping, recovery summary, public proof, verifier output, commit SHA, and transaction links in Myosin-controlled storage.

## Simon's only step

After the rules check is resolved, Simon contacts position 1 in each queue. If that person is ineligible, unreachable, declines, misses the response window, or cannot complete KYC/terms, he advances to position 2 in that **same** queue, then position 3, and so on. He does not contact all ten at once and does not move candidates between prize queues.

Candidate selection is not the final award. KYC, eligibility, attendance, response timing, and the applicable signed agreement still control acceptance. Public reports use anonymous entry IDs only; names, emails, KYC data, and tax data never enter GitHub, Slack, or the draw page.
