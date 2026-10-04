import { createHash } from "node:crypto";
import {
  atomicWrite, canonicalJson, drawSpecCommitment, hashCanonical,
  manifestCommitment, normalizeRandomWord, parseArgs, parseCsv,
  proofCommitment, readJson, requireArg, sha256, stringifyCsv,
} from "../giveaway/lib.mjs";

export {
  atomicWrite, canonicalJson, drawSpecCommitment, hashCanonical,
  manifestCommitment, normalizeRandomWord, parseArgs, parseCsv,
  proofCommitment, readJson, requireArg, sha256, stringifyCsv,
};

export const CAMPAIGN_ID = "le-sserafim-giveaway-2026";
export const MANIFEST_VERSION = "aegyo-weighted-giveaway-manifest-v1";
export const PROOF_VERSION = "aegyo-weighted-vrf-draw-v1";
export const DRAW_SPEC_VERSION = "aegyo-chainlink-draw-spec-v1";
export const ALGORITHM_VERSION = "sha256-ticket-rank-deduplicate-v1";
export const DOMAIN_SEPARATOR = "AEGYO_ARENA_LE_SSERAFIM_GIVEAWAY_2026_V1";
export const BASE_CHAIN_ID = 8453;
export const BASE_CHAIN_NAME = "Base Mainnet";
export const BASE_EXPLORER = "https://basescan.org";
export const BASE_VRF_WRAPPER = "0xb0407dbe851f8318bd31404A49e658143C982F23";
export const TEST_RANDOM_WORD = `0x${createHash("sha256").update("AEGYO LE SSERAFIM DRAW REHEARSAL — NEVER PRODUCTION").digest("hex")}`;

function isId(value, prefix) {
  return typeof value === "string" && new RegExp(`^${prefix}-[0-9a-f]{32}$`).test(value);
}

export function validateManifest(manifest) {
  if (manifest.manifestVersion !== MANIFEST_VERSION || manifest.campaignId !== CAMPAIGN_ID) {
    throw new Error("Unexpected campaign or manifest version");
  }
  if (!Array.isArray(manifest.entries) || manifest.entries.length !== manifest.ticketCount) {
    throw new Error("Manifest ticket count mismatch");
  }
  const ticketIds = new Set();
  const entrantIds = new Set();
  for (const entry of manifest.entries) {
    if (!isId(entry.ticketId, "LSF-T") || !isId(entry.entrantId, "LSF-E")) {
      throw new Error("Malformed public ticket or entrant ID");
    }
    if (ticketIds.has(entry.ticketId)) throw new Error("Duplicate public ticket ID");
    ticketIds.add(entry.ticketId);
    entrantIds.add(entry.entrantId);
  }
  if (entrantIds.size !== manifest.eligibleCount || entrantIds.size < 10) {
    throw new Error("Manifest entrant count mismatch or fewer than ten entrants");
  }
  if (!/^[0-9a-f]{64}$/.test(manifest.privateRosterHash ?? "")
    || !/^[0-9a-f]{64}$/.test(manifest.source?.sha256 ?? "")
    || manifest.source?.rowCount !== manifest.ticketCount) {
    throw new Error("Manifest source or private commitment is invalid");
  }
  if (manifestCommitment(manifest) !== manifest.manifestHash) throw new Error("Manifest hash mismatch");
  return manifest;
}

export function validatePrivateRoster(manifest, rows) {
  validateManifest(manifest);
  if (!Array.isArray(rows) || rows.length !== manifest.ticketCount) {
    throw new Error("Private roster ticket count mismatch");
  }
  if (hashCanonical(rows) !== manifest.privateRosterHash) throw new Error("Private roster hash mismatch");
  for (let i = 0; i < rows.length; i += 1) {
    if (rows[i].ticketId !== manifest.entries[i].ticketId
      || rows[i].entrantId !== manifest.entries[i].entrantId) {
      throw new Error("Private roster ticket mapping mismatch");
    }
  }
  return rows;
}

export function rankTickets(manifest, wordInput) {
  validateManifest(manifest);
  const word = normalizeRandomWord(wordInput);
  return manifest.entries.map(({ ticketId, entrantId }) => ({
    ticketId,
    entrantId,
    score: sha256(`${DOMAIN_SEPARATOR}\n${manifest.manifestHash}\n${word}\n${ticketId}`),
  })).sort((a, b) => a.score.localeCompare(b.score) || a.ticketId.localeCompare(b.ticketId));
}

export function distinctEntrantOrder(ticketOrder) {
  const seen = new Set();
  return ticketOrder.filter(({ entrantId }) => {
    if (seen.has(entrantId)) return false;
    seen.add(entrantId);
    return true;
  });
}

export function validateDrawSpec(spec, manifest) {
  validateManifest(manifest);
  if (spec.drawSpecVersion !== DRAW_SPEC_VERSION || spec.campaignId !== CAMPAIGN_ID
    || spec.manifestHash !== manifest.manifestHash || spec.eligibleCount !== manifest.eligibleCount
    || spec.ticketCount !== manifest.ticketCount || drawSpecCommitment(spec) !== spec.drawSpecHash) {
    throw new Error("Draw spec campaign, counts, or hash mismatch");
  }
  if (spec.randomness?.provider !== "Chainlink VRF v2.5"
    || spec.randomness?.chainName !== BASE_CHAIN_NAME
    || spec.randomness?.chainId !== BASE_CHAIN_ID
    || spec.randomness?.paymentMode !== "native-direct-funding"
    || spec.randomness?.wrapperAddress?.toLowerCase() !== BASE_VRF_WRAPPER.toLowerCase()
    || spec.randomness?.numWords !== 1
    || spec.randomness?.requestConfirmations !== 20
    || spec.randomness?.callbackGasLimit !== 100000
    || spec.randomness?.fulfillmentPublicationConfirmations !== 20) {
    throw new Error("Draw spec Chainlink configuration mismatch");
  }
  if (spec.selection?.algorithmVersion !== ALGORITHM_VERSION
    || spec.selection?.domainSeparator !== DOMAIN_SEPARATOR
    || spec.selection?.uniqueEntrants !== true
    || canonicalJson(spec.selection?.grandPrizePositions) !== canonicalJson([1, 2, 3, 4, 5])
    || canonicalJson(spec.selection?.runnerUpPositions) !== canonicalJson([6, 7, 8, 9, 10])
    || spec.selection?.rerollsAllowed !== false) {
    throw new Error("Draw spec selection policy mismatch");
  }
  return spec;
}

export function validateProof(manifest, proof, drawSpec) {
  validateManifest(manifest);
  if (proof.proofVersion !== PROOF_VERSION || proof.status !== "complete"
    || proof.campaignId !== CAMPAIGN_ID || proof.manifestHash !== manifest.manifestHash
    || proof.eligibleCount !== manifest.eligibleCount || proof.ticketCount !== manifest.ticketCount
    || proofCommitment(proof) !== proof.proofHash) {
    throw new Error("Proof campaign, counts, status, or hash mismatch");
  }
  if (proof.mode !== "test" && proof.mode !== "production") throw new Error("Invalid proof mode");
  const word = normalizeRandomWord(proof.randomness?.randomWord ?? "invalid");
  if (proof.mode === "test") {
    if (proof.randomness.testOnly !== true) throw new Error("Test proof must be marked test-only");
  } else {
    if (!drawSpec) throw new Error("Production proof requires the frozen draw spec");
    validateDrawSpec(drawSpec, manifest);
    const r = proof.randomness;
    if (r.source !== "chainlink-vrf-v2.5" || r.testOnly !== false
      || r.chainId !== drawSpec.randomness.chainId || r.chainName !== drawSpec.randomness.chainName
      || r.wrapperAddress?.toLowerCase() !== drawSpec.randomness.wrapperAddress.toLowerCase()
      || r.drawSpecHash !== drawSpec.drawSpecHash || r.explorerBaseUrl !== BASE_EXPLORER
      || !/^0x[0-9a-fA-F]{40}$/.test(r.consumerAddress ?? "")
      || !/^0x[0-9a-fA-F]{64}$/.test(r.deploymentTx ?? "")
      || !/^0x[0-9a-fA-F]{64}$/.test(r.requestTx ?? "")
      || !/^0x[0-9a-fA-F]{64}$/.test(r.fulfillmentTx ?? "")
      || !/^[0-9a-f]{40}$/.test(r.codeCommit ?? "")
      || normalizeRandomWord(r.requestId ?? "invalid") === normalizeRandomWord("0")
      || word === TEST_RANDOM_WORD
      || new Set([r.deploymentTx, r.requestTx, r.fulfillmentTx].map((x) => x.toLowerCase())).size !== 3) {
      throw new Error("Production Chainlink evidence is incomplete or invalid");
    }
  }
  const ticketOrder = rankTickets(manifest, word);
  const entrantOrder = distinctEntrantOrder(ticketOrder);
  const grandPrizeCandidates = entrantOrder.slice(0, 5).map((entry, i) => ({ ...entry, position: i + 1 }));
  const runnerUpCandidates = entrantOrder.slice(5, 10).map((entry, i) => ({ ...entry, position: i + 1 }));
  if (canonicalJson(proof.grandPrizeCandidates) !== canonicalJson(grandPrizeCandidates)
    || canonicalJson(proof.runnerUpCandidates) !== canonicalJson(runnerUpCandidates)) {
    throw new Error("Candidate queues do not reproduce");
  }
  if (proof.completeTicketOrderHash !== sha256(ticketOrder.map((x) => x.ticketId).join("\n"))
    || proof.distinctEntrantOrderHash !== sha256(entrantOrder.map((x) => x.entrantId).join("\n"))) {
    throw new Error("Complete ordering hash mismatch");
  }
  return { ticketOrder, entrantOrder, grandPrizeCandidates, runnerUpCandidates };
}
