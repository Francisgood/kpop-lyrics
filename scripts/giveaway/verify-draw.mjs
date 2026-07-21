#!/usr/bin/env node
import { resolve } from "node:path";
import { parseArgs, readJson, requireArg, validateManifest, validateProof } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const manifestPath = resolve(requireArg(args, "manifest"));
const proofPath = resolve(requireArg(args, "proof"));
const manifest = validateManifest(await readJson(manifestPath));
const proof = await readJson(proofPath);
const verified = validateProof(manifest, proof);

process.stdout.write(
  `${JSON.stringify({
    verified: true,
    mode: proof.mode,
    manifestHash: manifest.manifestHash,
    proofHash: proof.proofHash,
    eligibleCount: manifest.eligibleCount,
    grandPrizePublicIds: verified.grandPrizeCandidates.map((candidate) => candidate.publicId),
    runnerUpPublicIds: verified.runnerUpCandidates.map((candidate) => candidate.publicId),
  }, null, 2)}\n`,
);
