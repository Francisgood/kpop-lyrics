# One-shot draw security review

Scope: `AegyoBtsGiveawayDraw.sol`, its four byte-pinned Chainlink 1.5.0 dependencies, the Base fork test, and the local operator/finalizer pipeline.

## Required invariants

- The 186-entry manifest and draw policy are frozen before the request.
- Only the dedicated owner wallet can request randomness.
- The consumer is permanently bound to the official Base VRF v2.5 direct-funding wrapper.
- Exactly one word can be requested and accepted.
- Only the wrapper can fulfill; wrong, malformed, or duplicate callbacks cannot overwrite evidence.
- The raw word is stored without transformation.
- The public 5 + 5 candidate order is a deterministic function of the frozen manifest and raw word.
- A crashed operator resumes the same deployment/request by pre-recorded wallet nonce; it never silently rerolls.
- PII, keystore material, passwords, RPC credentials, and recovery state remain outside Git.

## Trust assumptions

- Base Mainnet and Chainlink VRF v2.5 remain live and behave according to their published contracts.
- The official wrapper at `0xb0407dbe851f8318bd31404A49e658143C982F23` is the only external contract trusted by the consumer. The wrapper address is immutable and is also pinned in the committed draw spec and operator checks.
- The dedicated encrypted owner key is not compromised before the one request. Compromise after the successful request cannot change the stored word or request another.
- The public source commit and deployed bytecode are reviewed before the irreversible request.

## Automated evidence

- Unit tests cover authorization, underpayment rollback, exact VRF parameters, zero request-ID rollback, no second request before/after fulfillment, wrapper-only callbacks, duplicate/wrong callback handling, exact raw-word storage across 512 fuzz cases, callback completion inside the frozen 100,000-gas limit, owner-only post-fulfillment refund, failed refund preservation, and direct funding.
- The Base fork test deploys the consumer against the live wrapper, obtains a nonzero native quote, and proves the real wrapper accepts exactly the configured one-word request.
- Node tests cover manifest/spec/proof commitments, 5 + 5 non-overlap, production-evidence fail-closed behavior, wrapper/spec/deployment/source binding, operator-state binding, exact-nonce recovery, irreversible confirmation, and byte-for-byte vendor hashes.
- A local Anvil rehearsal exercised the actual installed `forge create --json` and `cast send --json` interfaces through deployment, immutable reads, and one request.
- Slither was run against the consumer. Its reports were triaged below.

## Static-analysis triage

- **Wrapper call reentrancy warnings:** expected for Chainlink's upstream consumer base. The wrapper is immutable and pinned to the official Base deployment; `state` changes to `Requested` before the call; reentry cannot create a second request. Request ID zero is rejected atomically.
- **Refund low-level call / event-order warning:** intentional. Refund is available only after fulfillment, only to the immutable owner, and reads the entire remaining balance before the call. Reentry cannot modify the accepted word or create another request; a failed owner receive preserves the balance.
- **Strict equality on zero balance:** a safe availability check, not an authorization or price comparison.
- **Unused LINK path, return value, pragma/style, and dead-code warnings:** originate in byte-for-byte upstream Chainlink files. This consumer uses only native direct funding and compiles the entire graph with pinned Solidity 0.8.24.

No untriaged high- or medium-severity contract finding remains.

## Operational stop conditions

- Wrong chain, missing wrapper code, mismatched hashes/configuration, insufficient balance, dirty/unpushed source, malformed private roster, or insecure password-file permissions: stop before broadcast.
- Reverted deployment/request: record the failed transaction. Because the transaction reverted atomically, rerunning is safe after fixing the cause.
- Unknown or pending transaction after nonce advancement: stop and recover it; do not broadcast another transaction.
- Successful request with delayed/failed local observation: preserve state and wait/recover. Never request another word.
- Fulfillment event inconsistent with contract state, manifest hash, draw-spec hash, or raw word: stop publication and investigate.
- Rules/eligibility disagreement after fulfillment: resolve it operationally against the already-selected deterministic queue; never reroll.
