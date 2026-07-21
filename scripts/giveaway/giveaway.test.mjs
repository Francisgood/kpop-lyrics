import assert from "node:assert/strict";
import test from "node:test";
import {
  CAMPAIGN_ID,
  MANIFEST_VERSION,
  PROOF_VERSION,
  TEST_RANDOM_WORD,
  canonicalJson,
  manifestCommitment,
  normalizeRandomWord,
  parseCsv,
  proofCommitment,
  rankEntries,
  sha256,
  validateManifest,
  validateProof,
} from "./lib.mjs";

function fixtureManifest(count = 20) {
  const payload = {
    campaignId: CAMPAIGN_ID,
    cutoff: "2026-07-17T23:59:59-04:00",
    eligibilityRule: "fixture",
    eligibleCount: count,
    entries: Array.from({ length: count }, (_, index) => ({ publicId: `AA-${String(index + 1).padStart(4, "0")}` })),
    excludedAfterCutoffCount: 2,
    frozenAt: "2026-07-21T00:00:00.000Z",
    manifestVersion: MANIFEST_VERSION,
    privateRosterHash: "a".repeat(64),
    source: { filename: "fixture.csv", rowCount: count + 2, sha256: "b".repeat(64) },
    statusCounts: { active: count },
  };
  return { ...payload, manifestHash: manifestCommitment(payload) };
}

function fixtureProof(manifest) {
  const order = rankEntries(manifest, TEST_RANDOM_WORD);
  const payload = {
    algorithm: { description: "fixture", domainSeparator: "fixture", version: "sha256-rank-v1" },
    campaignId: CAMPAIGN_ID,
    completeOrderHash: sha256(order.map((entry) => entry.publicId).join("\n")),
    eligibleCount: manifest.eligibleCount,
    manifestHash: manifest.manifestHash,
    mode: "test",
    grandPrizeCandidates: order.slice(0, 5).map((entry, index) => ({ ...entry, position: index + 1 })),
    producedAt: "2026-07-21T00:00:00.000Z",
    proofVersion: PROOF_VERSION,
    randomness: { randomWord: TEST_RANDOM_WORD, source: "fixture", testOnly: true },
    runnerUpCandidates: order.slice(5, 10).map((entry, index) => ({ ...entry, position: index + 1 })),
    status: "complete",
  };
  return { ...payload, proofHash: proofCommitment(payload) };
}

test("CSV parser handles quoted commas, escaped quotes, CRLF, and BOM", () => {
  const rows = parseCsv('\uFEFFemail,tags,created_at\r\n"fan@example.com","army, \"\"vip\"\"",2026-07-17T01:00:00Z\r\n');
  assert.deepEqual(rows, [{ email: "fan@example.com", tags: 'army, "vip"', created_at: "2026-07-17T01:00:00Z" }]);
});

test("random words normalize identically from decimal and hex", () => {
  assert.equal(normalizeRandomWord("42"), normalizeRandomWord("0x2a"));
  assert.throws(() => normalizeRandomWord(`0x1${"0".repeat(64)}`), /uint256/);
});

test("same manifest and VRF word always produce one unique ordering", () => {
  const manifest = validateManifest(fixtureManifest());
  const first = rankEntries(manifest, TEST_RANDOM_WORD);
  const second = rankEntries(manifest, TEST_RANDOM_WORD);
  assert.deepEqual(first, second);
  assert.equal(new Set(first.map((entry) => entry.publicId)).size, manifest.eligibleCount);
  assert.equal(new Set(first.slice(0, 10).map((entry) => entry.publicId)).size, 10);
});

test("five grand-prize and five runner-up candidates reproduce without overlap", () => {
  const manifest = fixtureManifest();
  const proof = fixtureProof(manifest);
  const verified = validateProof(manifest, proof);
  assert.equal(verified.grandPrizeCandidates.length, 5);
  assert.equal(verified.runnerUpCandidates.length, 5);
  const grandPrize = new Set(verified.grandPrizeCandidates.map((candidate) => candidate.publicId));
  assert.equal(verified.runnerUpCandidates.some((candidate) => grandPrize.has(candidate.publicId)), false);
});

test("manifest or proof tampering fails verification", () => {
  const manifest = fixtureManifest();
  const proof = fixtureProof(manifest);
  assert.throws(() => validateManifest({ ...manifest, eligibleCount: 19 }), /count|hash/);
  const changed = structuredClone(proof);
  changed.grandPrizeCandidates[0].publicId = "AA-9999";
  assert.throws(() => validateProof(manifest, changed), /hash|reproduce/);
});

test("production proofs fail closed without complete Chainlink evidence", () => {
  const manifest = fixtureManifest();
  const proof = fixtureProof(manifest);
  proof.mode = "production";
  proof.randomness = { randomWord: TEST_RANDOM_WORD, source: "fixture", testOnly: false };
  proof.proofHash = proofCommitment(proof);
  assert.throws(() => validateProof(manifest, proof), /Chainlink VRF v2.5 evidence/);
});

test("canonical JSON ignores object insertion order", () => {
  assert.equal(canonicalJson({ b: 2, a: { d: 4, c: 3 } }), canonicalJson({ a: { c: 3, d: 4 }, b: 2 }));
});
