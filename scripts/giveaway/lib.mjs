import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export const CAMPAIGN_ID = "bts-giveaway-2026";
export const MANIFEST_VERSION = "aegyo-giveaway-manifest-v1";
export const PROOF_VERSION = "aegyo-vrf-draw-v1";
export const DRAW_SPEC_VERSION = "aegyo-chainlink-draw-spec-v1";
export const ALGORITHM_VERSION = "sha256-rank-v1";
export const DOMAIN_SEPARATOR = "AEGYO_ARENA_BTS_GIVEAWAY_2026_V1";
export const BASE_CHAIN_ID = 8453;
export const BASE_CHAIN_NAME = "Base Mainnet";
export const BASE_EXPLORER = "https://basescan.org";
export const BASE_VRF_WRAPPER = "0xb0407dbe851f8318bd31404A49e658143C982F23";
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

export function drawSpecCommitment(drawSpec) {
  const { drawSpecHash: _drawSpecHash, ...payload } = drawSpec;
  return hashCanonical(payload);
}

export function validateDrawSpec(drawSpec, manifest) {
  validateManifest(manifest);
  if (drawSpec.drawSpecVersion !== DRAW_SPEC_VERSION) throw new Error("Unsupported draw spec version");
  if (drawSpec.campaignId !== CAMPAIGN_ID || drawSpec.manifestHash !== manifest.manifestHash) {
    throw new Error("Draw spec is for a different campaign or manifest");
  }
  if (drawSpec.eligibleCount !== manifest.eligibleCount) throw new Error("Draw spec eligible count mismatch");
  if (drawSpecCommitment(drawSpec) !== drawSpec.drawSpecHash) throw new Error("Draw spec hash mismatch");
  if (
    drawSpec.randomness?.provider !== "Chainlink VRF v2.5"
    || drawSpec.randomness?.chainName !== BASE_CHAIN_NAME
    || drawSpec.randomness?.chainId !== BASE_CHAIN_ID
    || drawSpec.randomness?.paymentMode !== "native-direct-funding"
    || drawSpec.randomness?.wrapperAddress?.toLowerCase() !== BASE_VRF_WRAPPER.toLowerCase()
    || drawSpec.randomness?.numWords !== 1
    || drawSpec.randomness?.requestConfirmations !== 20
    || drawSpec.randomness?.callbackGasLimit !== 100000
    || drawSpec.randomness?.fulfillmentPublicationConfirmations !== 20
    || !/^0x[0-9a-fA-F]{40}$/.test(drawSpec.randomness?.wrapperAddress ?? "")
  ) {
    throw new Error("Draw spec Chainlink configuration mismatch");
  }
  if (
    drawSpec.selection?.algorithmVersion !== ALGORITHM_VERSION
    || drawSpec.selection?.domainSeparator !== DOMAIN_SEPARATOR
    || canonicalJson(drawSpec.selection?.grandPrizePositions) !== canonicalJson([1, 2, 3, 4, 5])
    || canonicalJson(drawSpec.selection?.runnerUpPositions) !== canonicalJson([6, 7, 8, 9, 10])
    || drawSpec.selection?.rerollsAllowed !== false
  ) {
    throw new Error("Draw spec selection policy mismatch");
  }
  return drawSpec;
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

export function validatePrivateRoster(manifest, privateRows) {
  validateManifest(manifest);
  if (!Array.isArray(privateRows) || privateRows.length !== manifest.eligibleCount) {
    throw new Error("Private manifest count mismatch");
  }
  if (hashCanonical(privateRows) !== manifest.privateRosterHash) {
    throw new Error("Private manifest does not match the committed privateRosterHash");
  }
  const privateIds = privateRows.map((row) => row.publicId);
  const publicIds = manifest.entries.map((entry) => entry.publicId);
  if (new Set(privateIds).size !== privateIds.length || canonicalJson(privateIds) !== canonicalJson(publicIds)) {
    throw new Error("Private manifest public IDs do not exactly match the frozen manifest");
  }
  return privateRows;
}

export function validateProof(manifest, proof, drawSpec) {
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
    if (!drawSpec) throw new Error("Production proof validation requires the committed draw spec");
    validateDrawSpec(drawSpec, manifest);
    if (proof.randomness.source !== "chainlink-vrf-v2.5" || proof.randomness.testOnly !== false) {
      throw new Error("Production proof must contain Chainlink VRF v2.5 evidence");
    }
    const requestId = normalizeRandomWord(proof.randomness.requestId ?? "invalid");
    const randomWord = normalizeRandomWord(proof.randomness.randomWord);
    const transactionHashes = [
      proof.randomness.deploymentTx,
      proof.randomness.requestTx,
      proof.randomness.fulfillmentTx,
    ];
    if (
      proof.randomness.chainId !== drawSpec.randomness.chainId
      || proof.randomness.chainName !== drawSpec.randomness.chainName
      || proof.randomness.wrapperAddress?.toLowerCase() !== drawSpec.randomness.wrapperAddress.toLowerCase()
      || proof.randomness.drawSpecHash !== drawSpec.drawSpecHash
      || !/^0x[0-9a-fA-F]{40}$/.test(proof.randomness.consumerAddress ?? "")
      || !/^(?:0x[0-9a-fA-F]+|[0-9]+)$/.test(proof.randomness.requestId ?? "")
      || !/^0x[0-9a-fA-F]{64}$/.test(proof.randomness.deploymentTx ?? "")
      || !/^0x[0-9a-fA-F]{64}$/.test(proof.randomness.requestTx ?? "")
      || !/^0x[0-9a-fA-F]{64}$/.test(proof.randomness.fulfillmentTx ?? "")
      || !/^[0-9a-f]{40}$/.test(proof.randomness.codeCommit ?? "")
      || proof.randomness.explorerBaseUrl !== BASE_EXPLORER
      || requestId === normalizeRandomWord("0")
      || randomWord === TEST_RANDOM_WORD
      || proof.randomness.consumerAddress?.toLowerCase() === proof.randomness.wrapperAddress?.toLowerCase()
      || new Set(transactionHashes.map((hash) => hash?.toLowerCase())).size !== transactionHashes.length
    ) {
      throw new Error("Production proof Chainlink evidence is incomplete or invalid");
    }
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
