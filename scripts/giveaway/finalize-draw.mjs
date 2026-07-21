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
  hashCanonical,
  normalizeRandomWord,
  parseArgs,
  parseCsv,
  proofCommitment,
  rankEntries,
  readJson,
  requireArg,
  sha256,
  stringifyCsv,
  validateManifest,
  validateProof,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const mode = requireArg(args, "mode");
if (mode !== "test" && mode !== "production") throw new Error("--mode must be test or production");

const manifestPath = resolve(args.manifest ?? "public/giveaway/bts-2026/manifest.json");
const proofOutputPath = resolve(requireArg(args, "proof-output"));
const privateManifestPath = resolve(requireArg(args, "private-manifest"));
const privateOutputPath = resolve(requireArg(args, "private-output"));
const manifest = validateManifest(await readJson(manifestPath));

if (mode === "production") {
  const manifestRepoPath = relative(process.cwd(), manifestPath);
  if (manifestRepoPath.startsWith("..")) {
    throw new Error("Production draw refused: the frozen manifest must be inside the repository");
  }
  const tracked = spawnSync("git", ["ls-files", "--error-unmatch", "--", manifestRepoPath], { encoding: "utf8" });
  const clean = spawnSync("git", ["diff", "--quiet", "HEAD", "--", manifestRepoPath]);
  if (tracked.status !== 0 || clean.status !== 0) {
    throw new Error("Production draw refused: the frozen manifest must be committed and clean before VRF fulfillment");
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

const privateRows = parseCsv(await readFile(privateManifestPath, "utf8"));
if (hashCanonical(privateRows) !== manifest.privateRosterHash) {
  throw new Error("Private manifest does not match the committed privateRosterHash");
}
const privateById = new Map(privateRows.map((row) => [row.publicId, row]));
if (privateById.size !== manifest.eligibleCount) throw new Error("Private manifest count mismatch");

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
  const requestId = requireArg(args, "request-id");
  const requestTx = requireArg(args, "request-tx");
  const fulfillmentTx = requireArg(args, "fulfillment-tx");
  const explorerBaseUrl = requireArg(args, "explorer-base-url").replace(/\/$/, "");
  if (!Number.isInteger(chainId) || chainId <= 0) throw new Error("Invalid --chain-id");
  normalizeRandomWord(requestId);
  if (!/^0x[0-9a-fA-F]{40}$/.test(consumerAddress)) throw new Error("Invalid --consumer-address");
  if (!/^0x[0-9a-fA-F]{64}$/.test(requestTx)) throw new Error("Invalid --request-tx");
  if (!/^0x[0-9a-fA-F]{64}$/.test(fulfillmentTx)) throw new Error("Invalid --fulfillment-tx");
  if (new URL(explorerBaseUrl).protocol !== "https:") throw new Error("--explorer-base-url must use HTTPS");
  randomness = {
    chainId,
    chainName: requireArg(args, "chain-name"),
    consumerAddress,
    explorerBaseUrl,
    fulfillmentTx,
    randomWord,
    requestId,
    requestTx,
    source: "chainlink-vrf-v2.5",
    testOnly: false,
  };
}

const order = rankEntries(manifest, randomWord);
const grandPrizeCandidates = order.slice(0, 5).map((entry, index) => ({ ...entry, position: index + 1 }));
const runnerUpCandidates = order.slice(5, 10).map((entry, index) => ({ ...entry, position: index + 1 }));
const proofPayload = {
  algorithm: {
    description: "For every public entry ID, SHA-256(domain separator, manifest hash, normalized uint256 random word, public ID); sort ascending by score then public ID.",
    domainSeparator: DOMAIN_SEPARATOR,
    version: ALGORITHM_VERSION,
  },
  campaignId: CAMPAIGN_ID,
  completeOrderHash: sha256(order.map((entry) => entry.publicId).join("\n")),
  eligibleCount: manifest.eligibleCount,
  manifestHash: manifest.manifestHash,
  mode,
  grandPrizeCandidates,
  producedAt: mode === "test" ? "2026-07-21T00:00:00.000Z" : new Date().toISOString(),
  proofVersion: PROOF_VERSION,
  randomness,
  runnerUpCandidates,
  status: "complete",
};
const proof = { ...proofPayload, proofHash: proofCommitment(proofPayload) };
validateProof(manifest, proof);

const contactRows = [
  ...grandPrizeCandidates.map((candidate) => ({ group: "grand-prize", ...candidate })),
  ...runnerUpCandidates.map((candidate) => ({ group: "runner-up", ...candidate })),
].map((candidate) => {
  const privateRow = privateById.get(candidate.publicId);
  if (!privateRow) throw new Error(`Private mapping missing ${candidate.publicId}`);
  return {
    group: candidate.group,
    position: candidate.position,
    publicId: candidate.publicId,
    email: privateRow.email,
    subscriberId: privateRow.subscriberId,
    status: privateRow.status,
    createdAt: privateRow.createdAt,
  };
});

await atomicWrite(proofOutputPath, `${JSON.stringify(proof, null, 2)}\n`);
await atomicWrite(
  privateOutputPath,
  stringifyCsv(contactRows, ["group", "position", "publicId", "email", "subscriberId", "status", "createdAt"]),
  0o600,
);

process.stdout.write(
  `${JSON.stringify({
    mode,
    manifestHash: manifest.manifestHash,
    proofHash: proof.proofHash,
    eligibleCount: manifest.eligibleCount,
    grandPrizePublicIds: grandPrizeCandidates.map((candidate) => candidate.publicId),
    runnerUpPublicIds: runnerUpCandidates.map((candidate) => candidate.publicId),
    proofOutput: proofOutputPath,
    privateCandidateOutput: privateOutputPath,
  }, null, 2)}\n`,
);
