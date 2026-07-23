import assert from "node:assert/strict";
import test from "node:test";
import {
  ALGORITHM_VERSION,
  BASE_CHAIN_ID,
  BASE_CHAIN_NAME,
  BASE_EXPLORER,
  BASE_VRF_WRAPPER,
  CAMPAIGN_ID,
  DRAW_SPEC_VERSION,
  MANIFEST_VERSION,
  PROOF_VERSION,
  TEST_RANDOM_WORD,
  canonicalJson,
  drawSpecCommitment,
  hashCanonical,
  manifestCommitment,
  normalizeRandomWord,
  parseCsv,
  proofCommitment,
  rankEntries,
  readJson,
  sha256,
  validateManifest,
  validatePrivateRoster,
  validateProof,
  validateDrawSpec,
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

function fixtureDrawSpec(manifest) {
  const payload = {
    campaignId: CAMPAIGN_ID,
    drawSpecVersion: DRAW_SPEC_VERSION,
    eligibleCount: manifest.eligibleCount,
    manifestHash: manifest.manifestHash,
    randomness: {
      callbackGasLimit: 100000,
      chainId: BASE_CHAIN_ID,
      chainName: BASE_CHAIN_NAME,
      fulfillmentPublicationConfirmations: 20,
      numWords: 1,
      paymentMode: "native-direct-funding",
      provider: "Chainlink VRF v2.5",
      requestConfirmations: 20,
      wrapperAddress: BASE_VRF_WRAPPER,
    },
    selection: {
      algorithmVersion: ALGORITHM_VERSION,
      domainSeparator: "AEGYO_ARENA_BTS_GIVEAWAY_2026_V1",
      grandPrizePositions: [1, 2, 3, 4, 5],
      rerollsAllowed: false,
      runnerUpPositions: [6, 7, 8, 9, 10],
    },
  };
  return { ...payload, drawSpecHash: drawSpecCommitment(payload) };
}

function fixtureProductionProof(manifest, drawSpec) {
  const randomWord = normalizeRandomWord("42");
  const order = rankEntries(manifest, randomWord);
  const payload = {
    algorithm: { description: "fixture", domainSeparator: "fixture", version: ALGORITHM_VERSION },
    campaignId: CAMPAIGN_ID,
    completeOrderHash: sha256(order.map((entry) => entry.publicId).join("\n")),
    eligibleCount: manifest.eligibleCount,
    grandPrizeCandidates: order.slice(0, 5).map((entry, index) => ({ ...entry, position: index + 1 })),
    manifestHash: manifest.manifestHash,
    mode: "production",
    producedAt: "2026-07-22T00:00:00.000Z",
    proofVersion: PROOF_VERSION,
    randomness: {
      chainId: BASE_CHAIN_ID,
      chainName: BASE_CHAIN_NAME,
      codeCommit: "a".repeat(40),
      consumerAddress: "0x1111111111111111111111111111111111111111",
      deploymentTx: `0x${"b".repeat(64)}`,
      drawSpecHash: drawSpec.drawSpecHash,
      explorerBaseUrl: BASE_EXPLORER,
      fulfillmentTx: `0x${"c".repeat(64)}`,
      randomWord,
      requestId: "123",
      requestTx: `0x${"d".repeat(64)}`,
      source: "chainlink-vrf-v2.5",
      testOnly: false,
      wrapperAddress: BASE_VRF_WRAPPER,
    },
    runnerUpCandidates: order.slice(5, 10).map((entry, index) => ({ ...entry, position: index + 1 })),
    status: "complete",
  };
  return { ...payload, proofHash: proofCommitment(payload) };
}

test("CSV parser handles quoted commas, escaped quotes, CRLF, and BOM", () => {
  const rows = parseCsv('\uFEFFemail,tags,created_at\r\n"fan@example.test","army, \"\"vip\"\"",2026-07-17T01:00:00Z\r\n');
  assert.deepEqual(rows, [{ email: "fan@example.test", tags: 'army, "vip"', created_at: "2026-07-17T01:00:00Z" }]);
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

test("private roster must match the committed hash, count, and public-ID order", () => {
  const privateRows = Array.from({ length: 20 }, (_, index) => ({
    publicId: `AA-${String(index + 1).padStart(4, "0")}`,
    email: `fan-${index + 1}@example.test`,
  }));
  const manifest = fixtureManifest();
  manifest.privateRosterHash = hashCanonical(privateRows);
  manifest.manifestHash = manifestCommitment(manifest);
  validatePrivateRoster(manifest, privateRows);

  const reordered = structuredClone(privateRows);
  [reordered[0], reordered[1]] = [reordered[1], reordered[0]];
  assert.throws(() => validatePrivateRoster(manifest, reordered), /privateRosterHash|public IDs/);
});

test("production proofs fail closed without complete Chainlink evidence", () => {
  const manifest = fixtureManifest();
  const drawSpec = fixtureDrawSpec(manifest);
  const proof = fixtureProof(manifest);
  proof.mode = "production";
  proof.randomness = { randomWord: TEST_RANDOM_WORD, source: "fixture", testOnly: false };
  proof.proofHash = proofCommitment(proof);
  assert.throws(() => validateProof(manifest, proof, drawSpec), /Chainlink VRF v2.5 evidence/);
});

test("production proof binds the wrapper, draw spec, deployment, and source commit", () => {
  const manifest = fixtureManifest();
  const drawSpec = fixtureDrawSpec(manifest);
  const proof = fixtureProductionProof(manifest, drawSpec);
  validateProof(manifest, proof, drawSpec);

  const tampered = structuredClone(proof);
  tampered.randomness.wrapperAddress = "0x2222222222222222222222222222222222222222";
  tampered.proofHash = proofCommitment(tampered);
  assert.throws(() => validateProof(manifest, tampered, drawSpec), /evidence is incomplete/);

  const rehearsalWord = structuredClone(proof);
  rehearsalWord.randomness.randomWord = TEST_RANDOM_WORD;
  rehearsalWord.proofHash = proofCommitment(rehearsalWord);
  assert.throws(() => validateProof(manifest, rehearsalWord, drawSpec), /evidence is incomplete/);
});

test("canonical JSON ignores object insertion order", () => {
  assert.equal(canonicalJson({ b: 2, a: { d: 4, c: 3 } }), canonicalJson({ a: { c: 3, d: 4 }, b: 2 }));
});

test("committed manifest and rehearsal proof reproduce", async () => {
  const manifest = validateManifest(await readJson("public/giveaway/bts-2026/manifest.json"));
  const proof = await readJson("public/giveaway/bts-2026/test-proof.json");
  const verified = validateProof(manifest, proof);
  assert.equal(manifest.eligibleCount, 186);
  assert.equal(proof.mode, "test");
  assert.equal(verified.grandPrizeCandidates.length, 5);
  assert.equal(verified.runnerUpCandidates.length, 5);
});

test("committed production proof is pending or independently valid", async () => {
  const manifest = validateManifest(await readJson("public/giveaway/bts-2026/manifest.json"));
  const proof = await readJson("public/giveaway/bts-2026/production-proof.json");
  if (proof.status === "pending") {
    assert.deepEqual(proof, {
      campaignId: CAMPAIGN_ID,
      mode: "production",
      proofVersion: PROOF_VERSION,
      status: "pending",
    });
    return;
  }
  assert.equal(proof.mode, "production");
  const drawSpec = validateDrawSpec(await readJson("public/giveaway/bts-2026/draw-spec.json"), manifest);
  const verified = validateProof(manifest, proof, drawSpec);
  assert.equal(verified.grandPrizeCandidates.length, 5);
  assert.equal(verified.runnerUpCandidates.length, 5);
});

test("committed one-shot draw spec binds Base VRF and the frozen selection policy", async () => {
  const manifest = validateManifest(await readJson("public/giveaway/bts-2026/manifest.json"));
  const drawSpec = await readJson("public/giveaway/bts-2026/draw-spec.json");
  assert.equal(drawSpec.drawSpecVersion, DRAW_SPEC_VERSION);
  assert.equal(drawSpec.drawSpecHash, drawSpecCommitment(drawSpec));
  validateDrawSpec(drawSpec, manifest);

  const rerollable = structuredClone(drawSpec);
  rerollable.selection.rerollsAllowed = true;
  assert.throws(() => validateDrawSpec(rerollable, manifest), /hash|policy/);
});
