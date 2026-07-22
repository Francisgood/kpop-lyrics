import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export const CAMPAIGN_ID = "bts-giveaway-2026";
export const MANIFEST_VERSION = "aegyo-giveaway-manifest-v1";
export const PROOF_VERSION = "aegyo-vrf-draw-v1";
export const ALGORITHM_VERSION = "sha256-rank-v1";
export const DOMAIN_SEPARATOR = "AEGYO_ARENA_BTS_GIVEAWAY_2026_V1";
export const TEST_SEED_PHRASE = "AEGYO BTS GIVEAWAY REHEARSAL 2026-07-21 — NOT FOR PRODUCTION";
export const TEST_RANDOM_WORD = `0x${createHash("sha256").update(TEST_SEED_PHRASE).digest("hex")}`;

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

export function hashCanonical(value) {
  return sha256(canonicalJson(value));
}

export function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) throw new Error(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    args[key] = value;
    i += 1;
  }
  return args;
}

export function requireArg(args, name) {
  const value = args[name];
  if (!value) throw new Error(`Missing required --${name}`);
  return value;
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error("CSV ended inside a quoted field");
  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  while (rows.length > 0 && rows.at(-1).every((cell) => cell === "")) rows.pop();
  if (rows.length === 0) return [];

  const headers = rows.shift().map((header, index) =>
    (index === 0 ? header.replace(/^\uFEFF/, "") : header).trim(),
  );
  if (new Set(headers).size !== headers.length) throw new Error("CSV contains duplicate headers");

  return rows.map((cells, index) => {
    if (cells.length !== headers.length) {
      throw new Error(`CSV row ${index + 2} has ${cells.length} cells; expected ${headers.length}`);
    }
    return Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex]]));
  });
}

export function stringifyCsv(rows, columns) {
  const encode = (value) => {
    const string = String(value ?? "");
    return /[",\r\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
  };
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => encode(row[column])).join(",")),
  ].join("\n") + "\n";
}

export async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export async function atomicWrite(path, contents, mode = 0o644) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.tmp-${process.pid}`;
  await writeFile(temporary, contents, { mode });
  await rename(temporary, path);
}

export function normalizeRandomWord(input) {
  const value = String(input).trim();
  if (!/^(?:0x[0-9a-fA-F]+|[0-9]+)$/.test(value)) {
    throw new Error("Random word must be an unsigned decimal integer or 0x-prefixed hex integer");
  }
  const number = BigInt(value);
  if (number < 0n || number >= 2n ** 256n) throw new Error("Random word must fit uint256");
  return `0x${number.toString(16).padStart(64, "0")}`;
}

export function manifestCommitment(manifest) {
  const { manifestHash: _manifestHash, ...payload } = manifest;
  return hashCanonical(payload);
}

export function proofCommitment(proof) {
  const { proofHash: _proofHash, ...payload } = proof;
  return hashCanonical(payload);
}

export function rankEntries(manifest, randomWordInput) {
  const randomWord = normalizeRandomWord(randomWordInput);
  const entries = manifest.entries.map(({ publicId }) => ({
    publicId,
    score: sha256(`${DOMAIN_SEPARATOR}\n${manifest.manifestHash}\n${randomWord}\n${publicId}`),
  }));
  entries.sort((a, b) => a.score.localeCompare(b.score) || a.publicId.localeCompare(b.publicId));
  return entries;
}

export function validateManifest(manifest) {
  if (manifest.manifestVersion !== MANIFEST_VERSION) throw new Error("Unsupported manifest version");
  if (manifest.campaignId !== CAMPAIGN_ID) throw new Error("Unexpected campaign ID");
  if (!Array.isArray(manifest.entries) || manifest.entries.length !== manifest.eligibleCount) {
    throw new Error("Manifest entry count does not match eligibleCount");
  }
  const ids = manifest.entries.map((entry) => entry.publicId);
  if (new Set(ids).size !== ids.length) throw new Error("Manifest contains duplicate public IDs");
  const expected = manifestCommitment(manifest);
  if (expected !== manifest.manifestHash) throw new Error("Manifest hash mismatch");
  return manifest;
}

export function validateProof(manifest, proof) {
  validateManifest(manifest);
  if (proof.proofVersion !== PROOF_VERSION) throw new Error("Unsupported proof version");
  if (proof.status !== "complete") throw new Error("Draw proof is not complete");
  if (proof.campaignId !== CAMPAIGN_ID || proof.manifestHash !== manifest.manifestHash) {
    throw new Error("Proof is for a different manifest or campaign");
  }
  if (proof.eligibleCount !== manifest.eligibleCount) throw new Error("Proof eligible count mismatch");
  if (proofCommitment(proof) !== proof.proofHash) throw new Error("Proof hash mismatch");
  if (!proof.randomness || (proof.mode !== "test" && proof.mode !== "production")) {
    throw new Error("Proof mode or randomness evidence is invalid");
  }
  normalizeRandomWord(proof.randomness.randomWord);
  if (proof.mode === "test") {
    if (proof.randomness.testOnly !== true) throw new Error("Test proof must be marked test-only");
  } else {
    if (proof.randomness.source !== "chainlink-vrf-v2.5" || proof.randomness.testOnly !== false) {
      throw new Error("Production proof must contain Chainlink VRF v2.5 evidence");
    }
    if (
      !Number.isInteger(proof.randomness.chainId)
      || proof.randomness.chainId <= 0
      || typeof proof.randomness.chainName !== "string"
      || !/^0x[0-9a-fA-F]{40}$/.test(proof.randomness.consumerAddress ?? "")
      || !/^(?:0x[0-9a-fA-F]+|[0-9]+)$/.test(proof.randomness.requestId ?? "")
      || !/^0x[0-9a-fA-F]{64}$/.test(proof.randomness.requestTx ?? "")
      || !/^0x[0-9a-fA-F]{64}$/.test(proof.randomness.fulfillmentTx ?? "")
      || typeof proof.randomness.explorerBaseUrl !== "string"
      || !proof.randomness.explorerBaseUrl.startsWith("https://")
    ) {
      throw new Error("Production proof Chainlink evidence is incomplete or invalid");
    }
    normalizeRandomWord(proof.randomness.requestId);
  }

  const order = rankEntries(manifest, proof.randomness.randomWord);
  const expectedGrandPrize = order.slice(0, 5).map((entry, index) => ({ ...entry, position: index + 1 }));
  const expectedRunnerUp = order.slice(5, 10).map((entry, index) => ({ ...entry, position: index + 1 }));
  if (canonicalJson(proof.grandPrizeCandidates) !== canonicalJson(expectedGrandPrize)) {
    throw new Error("Grand-prize candidate list does not reproduce");
  }
  if (canonicalJson(proof.runnerUpCandidates) !== canonicalJson(expectedRunnerUp)) {
    throw new Error("Runner-up candidate list does not reproduce");
  }
  if (proof.completeOrderHash !== sha256(order.map((entry) => entry.publicId).join("\n"))) {
    throw new Error("Complete order hash mismatch");
  }
  return { order, grandPrizeCandidates: expectedGrandPrize, runnerUpCandidates: expectedRunnerUp };
}
