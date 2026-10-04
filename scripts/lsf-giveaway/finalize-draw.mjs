#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import {
  ALGORITHM_VERSION,
  CAMPAIGN_ID,
  DOMAIN_SEPARATOR,
  PROOF_VERSION,
  TEST_RANDOM_WORD,
  atomicWrite,
  distinctEntrantOrder,
  normalizeRandomWord,
  parseArgs,
  parseCsv,
  proofCommitment,
  rankTickets,
  readJson,
  requireArg,
  sha256,
  stringifyCsv,
  validateDrawSpec,
  validateManifest,
  validatePrivateRoster,
  validateProof,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const mode = requireArg(args, "mode");
if (mode !== "test" && mode !== "production") throw new Error("--mode must be test or production");

const manifestPath = resolve(args.manifest ?? "public/giveaway/le-sserafim-2026/manifest.json");
const drawSpecPath = resolve(args["draw-spec"] ?? "public/giveaway/le-sserafim-2026/draw-spec.json");
const proofOutputPath = resolve(requireArg(args, "proof-output"));
const privateManifestPath = resolve(requireArg(args, "private-manifest"));
const privateOutputPath = resolve(requireArg(args, "private-output"));
const manifest = validateManifest(await readJson(manifestPath));
const drawSpec = validateDrawSpec(await readJson(drawSpecPath), manifest);

if (mode === "production") {
  const manifestRepoPath = relative(process.cwd(), manifestPath);
  if (manifestRepoPath.startsWith("..")) {
    throw new Error("Production draw refused: the frozen manifest must be inside the repository");
  }
  const tracked = spawnSync("git", ["ls-files", "--error-unmatch", "--", manifestRepoPath], { encoding: "utf8" });
  const clean = spawnSync("git", ["diff", "--quiet", "HEAD", "--", manifestRepoPath]);
  const worktree = spawnSync("git", ["status", "--porcelain=v1"], { encoding: "utf8" });
  if (tracked.status !== 0 || clean.status !== 0 || worktree.status !== 0 || worktree.stdout.trim() !== "") {
    throw new Error("Production draw refused: the manifest and draw implementation must be committed and the worktree clean");
  }
}

if (existsSync(proofOutputPath)) {
  const existing = await readJson(proofOutputPath);
  if (existing.status === "complete" && existing.mode === "production") {
    throw new Error("Production proof is write-once and is already complete");
  }
}

const randomWord = normalizeRandomWord(
  mode === "test" ? (args["random-word"] ?? TEST_RANDOM_WORD) : requireArg(args, "random-word"),
);
if (mode === "production" && randomWord === TEST_RANDOM_WORD) {
  throw new Error("Production draw refused: the rehearsal random word cannot be reused");
}

const privateRows = validatePrivateRoster(manifest, parseCsv(await readFile(privateManifestPath, "utf8")));
const privateByTicket = new Map(privateRows.map((row) => [row.ticketId, row]));

let randomness;
if (mode === "test") {
  randomness = {
    randomWord,
    source: "deterministic-rehearsal-fixture",
    testOnly: true,
  };
} else {
  const chainId = Number(requireArg(args, "chain-id"));
  const consumerAddress = requireArg(args, "consumer-address");
  const wrapperAddress = requireArg(args, "wrapper-address");
  const deploymentTx = requireArg(args, "deployment-tx");
  const drawSpecHash = requireArg(args, "draw-spec-hash");
  const codeCommit = requireArg(args, "code-commit");
  const requestId = requireArg(args, "request-id");
  const requestTx = requireArg(args, "request-tx");
  const fulfillmentTx = requireArg(args, "fulfillment-tx");
  const explorerBaseUrl = requireArg(args, "explorer-base-url").replace(/\/$/, "");
  if (!Number.isInteger(chainId) || chainId <= 0) throw new Error("Invalid --chain-id");
  normalizeRandomWord(requestId);
  if (!/^0x[0-9a-fA-F]{40}$/.test(consumerAddress)) throw new Error("Invalid --consumer-address");
  if (!/^0x[0-9a-fA-F]{40}$/.test(wrapperAddress)) throw new Error("Invalid --wrapper-address");
  if (!/^0x[0-9a-fA-F]{64}$/.test(deploymentTx)) throw new Error("Invalid --deployment-tx");
  if (!/^[0-9a-f]{64}$/.test(drawSpecHash)) throw new Error("Invalid --draw-spec-hash");
  if (!/^[0-9a-f]{40}$/.test(codeCommit)) throw new Error("Invalid --code-commit");
  const currentCommit = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
  if (currentCommit.status !== 0 || currentCommit.stdout.trim() !== codeCommit) {
    throw new Error("--code-commit must equal the currently checked-out draw implementation commit");
  }
  if (!/^0x[0-9a-fA-F]{64}$/.test(requestTx)) throw new Error("Invalid --request-tx");
  if (!/^0x[0-9a-fA-F]{64}$/.test(fulfillmentTx)) throw new Error("Invalid --fulfillment-tx");
  if (new URL(explorerBaseUrl).protocol !== "https:") throw new Error("--explorer-base-url must use HTTPS");
  randomness = {
    chainId,
    chainName: requireArg(args, "chain-name"),
    codeCommit,
    consumerAddress,
    deploymentTx,
    drawSpecHash,
    explorerBaseUrl,
    fulfillmentTx,
    randomWord,
    requestId,
    requestTx,
    source: "chainlink-vrf-v2.5",
    testOnly: false,
    wrapperAddress,
  };
}

const ticketOrder = rankTickets(manifest, randomWord);
const entrantOrder = distinctEntrantOrder(ticketOrder);
const grandPrizeCandidates = entrantOrder.slice(0, 5).map((entry, index) => ({ ...entry, position: index + 1 }));
const runnerUpCandidates = entrantOrder.slice(5, 10).map((entry, index) => ({ ...entry, position: index + 1 }));
const proofPayload = {
  algorithm: {
    description: "Score each public ticket with SHA-256(domain separator, manifest hash, normalized uint256 VRF word, ticket ID); sort by score then ticket ID; retain the first ticket for each unique entrant.",
    domainSeparator: DOMAIN_SEPARATOR,
    version: ALGORITHM_VERSION,
  },
  campaignId: CAMPAIGN_ID,
  completeTicketOrderHash: sha256(ticketOrder.map((entry) => entry.ticketId).join("\n")),
  distinctEntrantOrderHash: sha256(entrantOrder.map((entry) => entry.entrantId).join("\n")),
  eligibleCount: manifest.eligibleCount,
  ticketCount: manifest.ticketCount,
  manifestHash: manifest.manifestHash,
  mode,
  grandPrizeCandidates,
  producedAt: mode === "test" ? "2026-10-04T00:00:00.000Z" : new Date().toISOString(),
  proofVersion: PROOF_VERSION,
  randomness,
  runnerUpCandidates,
  status: "complete",
};
const proof = { ...proofPayload, proofHash: proofCommitment(proofPayload) };
validateProof(manifest, proof, drawSpec);

const contactRows = [
  ...grandPrizeCandidates.map((candidate) => ({ group: "grand-prize", ...candidate })),
  ...runnerUpCandidates.map((candidate) => ({ group: "runner-up", ...candidate })),
].map((candidate) => {
  const privateRow = privateByTicket.get(candidate.ticketId);
  if (!privateRow || privateRow.entrantId !== candidate.entrantId) {
    throw new Error(`Private mapping missing ${candidate.ticketId}`);
  }
  return {
    group: candidate.group,
    position: candidate.position,
    ticketId: candidate.ticketId,
    entrantId: candidate.entrantId,
    firstName: privateRow.firstName,
    lastName: privateRow.lastName,
    email: privateRow.email,
    sourceTicketNo: privateRow.ticketNo,
  };
});

await atomicWrite(
  privateOutputPath,
  stringifyCsv(contactRows, ["group", "position", "ticketId", "entrantId", "firstName", "lastName", "email", "sourceTicketNo"]),
  0o600,
);
// The public write-once proof is the final marker. If the process crashes after this
// write, the private mapping is already durable and a recovery run can verify both.
await atomicWrite(proofOutputPath, `${JSON.stringify(proof, null, 2)}\n`);

process.stdout.write(
  `${JSON.stringify({
    mode,
    manifestHash: manifest.manifestHash,
    proofHash: proof.proofHash,
    eligibleCount: manifest.eligibleCount,
    grandPrizePublicIds: grandPrizeCandidates.map((candidate) => candidate.entrantId),
    runnerUpPublicIds: runnerUpCandidates.map((candidate) => candidate.entrantId),
    proofOutput: proofOutputPath,
    privateCandidateOutput: privateOutputPath,
  }, null, 2)}\n`,
);
