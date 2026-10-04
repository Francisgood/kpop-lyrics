import assert from "node:assert/strict";
import test from "node:test";
import {
  ALGORITHM_VERSION, CAMPAIGN_ID, DOMAIN_SEPARATOR, MANIFEST_VERSION,
  PROOF_VERSION, TEST_RANDOM_WORD, distinctEntrantOrder, manifestCommitment,
  normalizeRandomWord, proofCommitment, rankTickets, readJson, sha256,
  validateDrawSpec, validateManifest, validateProof,
} from "./lib.mjs";

function fixtureManifest() {
  const entries = [];
  for (let entrant = 1; entrant <= 10; entrant += 1) {
    for (let ticket = 1; ticket <= (entrant === 1 ? 3 : 1); ticket += 1) {
      entries.push({
        ticketId: `LSF-T-${entries.length.toString(16).padStart(32, "0")}`,
        entrantId: `LSF-E-${entrant.toString(16).padStart(32, "0")}`,
      });
    }
  }
  const payload = {
    campaignId: CAMPAIGN_ID, manifestVersion: MANIFEST_VERSION,
    ticketCount: entries.length, eligibleCount: 10, entries,
    source: { sha256: "a".repeat(64), rowCount: entries.length },
    privateRosterHash: "b".repeat(64),
  };
  return { ...payload, manifestHash: manifestCommitment(payload) };
}

function fixtureProof(manifest, word = TEST_RANDOM_WORD) {
  const ticketOrder = rankTickets(manifest, word);
  const entrantOrder = distinctEntrantOrder(ticketOrder);
  const payload = {
    proofVersion: PROOF_VERSION, campaignId: CAMPAIGN_ID, status: "complete", mode: "test",
    manifestHash: manifest.manifestHash, ticketCount: manifest.ticketCount,
    eligibleCount: manifest.eligibleCount,
    completeTicketOrderHash: sha256(ticketOrder.map((x) => x.ticketId).join("\n")),
    distinctEntrantOrderHash: sha256(entrantOrder.map((x) => x.entrantId).join("\n")),
    grandPrizeCandidates: entrantOrder.slice(0, 5).map((x, i) => ({ ...x, position: i + 1 })),
    runnerUpCandidates: entrantOrder.slice(5, 10).map((x, i) => ({ ...x, position: i + 1 })),
    randomness: { randomWord: word, source: "fixture", testOnly: true },
  };
  return { ...payload, proofHash: proofCommitment(payload) };
}

test("weighted tickets rank first, then each entrant appears only once across both queues", () => {
  const manifest = validateManifest(fixtureManifest());
  const word = normalizeRandomWord("42");
  const ticketOrder = rankTickets(manifest, word);
  const entrantOrder = distinctEntrantOrder(ticketOrder);
  assert.equal(ticketOrder.length, 12);
  assert.equal(entrantOrder.length, 10);
  assert.equal(entrantOrder[0].entrantId, ticketOrder[0].entrantId);
  assert.equal(new Set(entrantOrder.map((x) => x.entrantId)).size, 10);
  const proof = fixtureProof(manifest, word);
  validateProof(manifest, proof);
});

test("multiple tickets increase an entrant's first-place probability", () => {
  const manifest = fixtureManifest();
  const weightedId = manifest.entries[0].entrantId;
  let firstCount = 0;
  for (let i = 0; i < 512; i += 1) {
    const word = normalizeRandomWord(String(i));
    if (distinctEntrantOrder(rankTickets(manifest, word))[0].entrantId === weightedId) firstCount += 1;
  }
  // Three of twelve tickets should be first around one quarter of the time.
  assert.ok(firstCount > 80 && firstCount < 180, `unexpected weighted count: ${firstCount}`);
});

test("tampering with a ticket, duplicate entrant, or candidate order fails closed", () => {
  const manifest = fixtureManifest();
  const proof = fixtureProof(manifest);
  const badTicket = structuredClone(manifest);
  badTicket.entries[1].ticketId = badTicket.entries[0].ticketId;
  badTicket.manifestHash = manifestCommitment(badTicket);
  assert.throws(() => validateManifest(badTicket), /Duplicate/);
  const badProof = structuredClone(proof);
  badProof.runnerUpCandidates[0].entrantId = proof.grandPrizeCandidates[0].entrantId;
  badProof.proofHash = proofCommitment(badProof);
  assert.throws(() => validateProof(manifest, badProof), /reproduce/);
});

test("frozen weighted roster and draw spec are internally valid", async () => {
  const manifest = validateManifest(await readJson("public/giveaway/le-sserafim-2026/manifest.json"));
  const spec = await readJson("public/giveaway/le-sserafim-2026/draw-spec.json");
  validateDrawSpec(spec, manifest);
  assert.equal(manifest.eligibleCount, 416);
  assert.equal(manifest.ticketCount, 552);
  assert.equal(spec.selection.algorithmVersion, ALGORITHM_VERSION);
  assert.equal(spec.selection.domainSeparator, DOMAIN_SEPARATOR);
  const proof = await readJson("public/giveaway/le-sserafim-2026/production-proof.json");
  if (proof.status === "complete") {
    validateProof(manifest, proof, spec);
  } else {
    assert.deepEqual(proof, {
      campaignId: CAMPAIGN_ID, mode: "production", proofVersion: PROOF_VERSION, status: "pending",
    });
  }
});
