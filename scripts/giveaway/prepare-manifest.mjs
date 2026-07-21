#!/usr/bin/env node
import { basename, resolve } from "node:path";
import { readFile } from "node:fs/promises";
import {
  CAMPAIGN_ID,
  MANIFEST_VERSION,
  atomicWrite,
  canonicalJson,
  hashCanonical,
  manifestCommitment,
  parseArgs,
  parseCsv,
  requireArg,
  sha256,
  stringifyCsv,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const inputPath = resolve(requireArg(args, "input"));
const publicOutputPath = resolve(requireArg(args, "public-output"));
const privateOutputPath = resolve(requireArg(args, "private-output"));
const cutoff = args.cutoff ?? "2026-07-17T23:59:59-04:00";
const cutoffMs = Date.parse(cutoff);
if (!Number.isFinite(cutoffMs)) throw new Error(`Invalid cutoff: ${cutoff}`);
if (publicOutputPath === privateOutputPath) throw new Error("Public and private outputs must differ");

const sourceBytes = await readFile(inputPath);
const sourceRows = parseCsv(sourceBytes.toString("utf8"));
const requiredColumns = ["subscriber_id", "api_subscription_id", "email", "status", "created_at"];
for (const column of requiredColumns) {
  if (!sourceRows.every((row) => Object.hasOwn(row, column))) throw new Error(`Source CSV is missing ${column}`);
}

const eligible = [];
let excludedAfterCutoffCount = 0;
for (const [index, row] of sourceRows.entries()) {
  const email = row.email.trim().toLowerCase();
  const createdAtMs = Date.parse(row.created_at);
  if (!email.includes("@")) throw new Error(`Invalid email at source row ${index + 2}`);
  if (!Number.isFinite(createdAtMs)) throw new Error(`Invalid created_at at source row ${index + 2}`);
  if (createdAtMs > cutoffMs) {
    excludedAfterCutoffCount += 1;
    continue;
  }
  eligible.push({
    subscriberId: row.subscriber_id.trim(),
    apiSubscriptionId: row.api_subscription_id.trim(),
    email,
    tags: row.tags ?? "",
    status: row.status.trim(),
    premium: row["premium?"] ?? "",
    createdAt: new Date(createdAtMs).toISOString(),
  });
}

eligible.sort(
  (a, b) => a.createdAt.localeCompare(b.createdAt) || a.subscriberId.localeCompare(b.subscriberId),
);
const normalizedEmails = eligible.map((row) => row.email);
if (new Set(normalizedEmails).size !== normalizedEmails.length) {
  throw new Error("Eligible roster contains duplicate normalized emails; resolve them before freezing");
}
if (eligible.length < 10) throw new Error("At least ten eligible entries are required");

const privateRows = eligible.map((row, index) => ({
  publicId: `AA-${String(index + 1).padStart(4, "0")}`,
  ...row,
}));
const privateRosterHash = hashCanonical(privateRows);
const statusCounts = Object.fromEntries(
  [...new Set(privateRows.map((row) => row.status))]
    .sort()
    .map((status) => [status, privateRows.filter((row) => row.status === status).length]),
);
const frozenAt = args["frozen-at"] ?? new Date().toISOString();
const manifestPayload = {
  campaignId: CAMPAIGN_ID,
  cutoff,
  eligibilityRule: "One entry per unique normalized email with created_at on or before the cutoff; current subscription status does not remove an entry.",
  eligibleCount: privateRows.length,
  entries: privateRows.map(({ publicId }) => ({ publicId })),
  excludedAfterCutoffCount,
  frozenAt,
  manifestVersion: MANIFEST_VERSION,
  privateRosterHash,
  source: {
    filename: basename(inputPath),
    rowCount: sourceRows.length,
    sha256: sha256(sourceBytes),
  },
  statusCounts,
};
const manifest = { ...manifestPayload, manifestHash: manifestCommitment(manifestPayload) };

const privateColumns = [
  "publicId",
  "subscriberId",
  "apiSubscriptionId",
  "email",
  "tags",
  "status",
  "premium",
  "createdAt",
];
await atomicWrite(publicOutputPath, `${JSON.stringify(manifest, null, 2)}\n`);
await atomicWrite(privateOutputPath, stringifyCsv(privateRows, privateColumns), 0o600);

process.stdout.write(
  `${JSON.stringify({
    campaignId: CAMPAIGN_ID,
    sourceRows: sourceRows.length,
    eligibleCount: privateRows.length,
    excludedAfterCutoffCount,
    statusCounts,
    sourceSha256: manifest.source.sha256,
    privateRosterHash,
    manifestHash: manifest.manifestHash,
    publicOutput: publicOutputPath,
    privateOutput: privateOutputPath,
    canonicalBytes: Buffer.byteLength(canonicalJson(manifestPayload)),
  }, null, 2)}\n`,
);
