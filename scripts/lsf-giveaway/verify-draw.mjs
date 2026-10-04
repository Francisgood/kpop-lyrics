#!/usr/bin/env node
import { resolve } from "node:path";
import { parseArgs, readJson, requireArg, validateDrawSpec, validateManifest, validateProof } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const manifestPath = resolve(requireArg(args, "manifest"));
const proofPath = resolve(requireArg(args, "proof"));
const manifest = validateManifest(await readJson(manifestPath));
const proof = await readJson(proofPath);
const drawSpec = proof.mode === "production"
  ? validateDrawSpec(
      await readJson(resolve(args["draw-spec"] ?? "public/giveaway/le-sserafim-2026/draw-spec.json")),
      manifest,
    )
  : undefined;
const verified = validateProof(manifest, proof, drawSpec);

process.stdout.write(
  `${JSON.stringify({
    verified: true,
    mode: proof.mode,
    manifestHash: manifest.manifestHash,
    drawSpecHash: drawSpec?.drawSpecHash,
    proofHash: proof.proofHash,
    eligibleCount: manifest.eligibleCount,
    ticketCount: manifest.ticketCount,
    grandPrizePublicIds: verified.grandPrizeCandidates.map((candidate) => candidate.entrantId),
    runnerUpPublicIds: verified.runnerUpCandidates.map((candidate) => candidate.entrantId),
  }, null, 2)}\n`,
);
