#!/usr/bin/env node
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { basename, isAbsolute, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import {
  ALGORITHM_VERSION, BASE_CHAIN_ID, BASE_CHAIN_NAME, BASE_VRF_WRAPPER,
  CAMPAIGN_ID, DOMAIN_SEPARATOR, DRAW_SPEC_VERSION, MANIFEST_VERSION,
  PROOF_VERSION, atomicWrite, drawSpecCommitment, hashCanonical,
  manifestCommitment, parseArgs, parseCsv, requireArg, sha256, stringifyCsv,
  validateDrawSpec, validateManifest, validatePrivateRoster,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const inputPath = resolve(requireArg(args, "input"));
const publicPath = resolve(requireArg(args, "public-output"));
const privatePath = resolve(requireArg(args, "private-output"));
const specPath = resolve(requireArg(args, "draw-spec-output"));
const proofPath = resolve(requireArg(args, "proof-output"));
const rootResult = spawnSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" });
if (rootResult.status !== 0) throw new Error("Git root unavailable");
const root = rootResult.stdout.trim();
const insideRepo = (path) => {
  const rel = relative(root, path);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
};
if (insideRepo(inputPath) || insideRepo(privatePath)) {
  throw new Error("Source CSV and private roster must stay outside Git");
}
if (![publicPath, specPath, proofPath].every(insideRepo)) {
  throw new Error("Public manifest, spec, and proof must be inside Git");
}
for (const path of [publicPath, privatePath, specPath, proofPath]) {
  if (existsSync(path)) throw new Error(`Output already exists; refusing overwrite: ${path}`);
}

const sourceBytes = await readFile(inputPath);
const sourceRows = parseCsv(sourceBytes.toString("utf8"));
const required = ["ticket_no", "firstName", "lastName", "email", "entrant_no", "ticket_of_entrant", "source"];
if (!sourceRows.length || !required.every((key) => sourceRows.every((row) => Object.hasOwn(row, key)))) {
  throw new Error("Weighted source CSV lacks required columns or rows");
}
const tickets = sourceRows.map((row, index) => {
  const ticketNo = Number(row.ticket_no);
  const entrantNo = Number(row.entrant_no);
  const position = /^(\d+) of (\d+)$/.exec(row.ticket_of_entrant.trim());
  const email = row.email.trim().toLowerCase();
  if (!Number.isSafeInteger(ticketNo) || !Number.isSafeInteger(entrantNo)
    || ticketNo < 1 || entrantNo < 1 || !position || !email.includes("@")
    || !row.firstName.trim() || !row.lastName.trim()
    || !["base entry", "referral bonus"].includes(row.source.trim())) {
    throw new Error(`Invalid weighted source row ${index + 2}`);
  }
  return {
    ticketNo, entrantNo, position: Number(position[1]), total: Number(position[2]),
    firstName: row.firstName.trim(), lastName: row.lastName.trim(), email,
    source: row.source.trim(),
  };
}).sort((a, b) => a.ticketNo - b.ticketNo);
for (let i = 0; i < tickets.length; i += 1) {
  if (tickets[i].ticketNo !== i + 1) throw new Error("Ticket numbers are not exactly 1..N");
}
const byEntrant = new Map();
const emailToEntrant = new Map();
for (const ticket of tickets) {
  const previous = emailToEntrant.get(ticket.email);
  if (previous !== undefined && previous !== ticket.entrantNo) {
    throw new Error("One email maps to multiple entrants");
  }
  emailToEntrant.set(ticket.email, ticket.entrantNo);
  const group = byEntrant.get(ticket.entrantNo) ?? [];
  if (group.length && (group[0].email !== ticket.email
    || group[0].firstName !== ticket.firstName || group[0].lastName !== ticket.lastName)) {
    throw new Error("One entrant has conflicting contact details");
  }
  group.push(ticket);
  byEntrant.set(ticket.entrantNo, group);
}
const entrantNumbers = [...byEntrant.keys()].sort((a, b) => a - b);
for (let i = 0; i < entrantNumbers.length; i += 1) {
  if (entrantNumbers[i] !== i + 1) throw new Error("Entrant numbers are not exactly 1..N");
  const group = byEntrant.get(entrantNumbers[i]);
  if (group.filter((t) => t.source === "base entry").length !== 1 || group.length !== group[0].total) {
    throw new Error("Entrant does not have one base ticket and the declared number of tickets");
  }
  const positions = group.map((t) => t.position).sort((a, b) => a - b);
  if (positions.some((position, index) => position !== index + 1)
    || group.some((t) => t.total !== group.length
      || (t.position === 1) !== (t.source === "base entry"))) {
    throw new Error("Entrant ticket sequence or source is inconsistent");
  }
}
if (byEntrant.size < 10) throw new Error("At least ten distinct entrants are required");

const entrantIds = new Map(entrantNumbers.map((number) => [number, `LSF-E-${randomBytes(16).toString("hex")}`]));
const privateRows = tickets.map((ticket) => ({
  ticketId: `LSF-T-${randomBytes(16).toString("hex")}`,
  entrantId: entrantIds.get(ticket.entrantNo),
  ticketNo: String(ticket.ticketNo),
  entrantNo: String(ticket.entrantNo),
  firstName: ticket.firstName,
  lastName: ticket.lastName,
  email: ticket.email,
  source: ticket.source,
}));
const frozenAt = args["frozen-at"] ?? new Date().toISOString();
if (!Number.isFinite(Date.parse(frozenAt))) throw new Error("Invalid frozen timestamp");
const manifestPayload = {
  campaignId: CAMPAIGN_ID,
  manifestVersion: MANIFEST_VERSION,
  frozenAt,
  eligibleCount: byEntrant.size,
  ticketCount: tickets.length,
  eligibilityRule: "The supplied weighted CSV is the frozen source: one base ticket per distinct normalized email, plus its listed referral-bonus tickets. Private eligibility and cutoff checks occur before award.",
  entries: privateRows.map(({ ticketId, entrantId }) => ({ ticketId, entrantId })),
  privateRosterHash: hashCanonical(privateRows),
  source: { filename: basename(inputPath), rowCount: sourceRows.length, sha256: sha256(sourceBytes) },
};
const manifest = { ...manifestPayload, manifestHash: manifestCommitment(manifestPayload) };
const specPayload = {
  campaignId: CAMPAIGN_ID,
  drawSpecVersion: DRAW_SPEC_VERSION,
  manifestHash: manifest.manifestHash,
  eligibleCount: manifest.eligibleCount,
  ticketCount: manifest.ticketCount,
  randomness: {
    provider: "Chainlink VRF v2.5", chainName: BASE_CHAIN_NAME, chainId: BASE_CHAIN_ID,
    paymentMode: "native-direct-funding", wrapperAddress: BASE_VRF_WRAPPER,
    numWords: 1, requestConfirmations: 20, callbackGasLimit: 100000,
    fulfillmentPublicationConfirmations: 20,
  },
  selection: {
    algorithmVersion: ALGORITHM_VERSION, domainSeparator: DOMAIN_SEPARATOR,
    uniqueEntrants: true, grandPrizePositions: [1, 2, 3, 4, 5],
    runnerUpPositions: [6, 7, 8, 9, 10], rerollsAllowed: false,
  },
};
const spec = { ...specPayload, drawSpecHash: drawSpecCommitment(specPayload) };
validateManifest(manifest);
validatePrivateRoster(manifest, privateRows);
validateDrawSpec(spec, manifest);
await atomicWrite(privatePath, stringifyCsv(privateRows,
  ["ticketId", "entrantId", "ticketNo", "entrantNo", "firstName", "lastName", "email", "source"]), 0o600);
await atomicWrite(publicPath, `${JSON.stringify(manifest, null, 2)}\n`);
await atomicWrite(specPath, `${JSON.stringify(spec, null, 2)}\n`);
await atomicWrite(proofPath, `${JSON.stringify({
  campaignId: CAMPAIGN_ID, mode: "production", proofVersion: PROOF_VERSION, status: "pending",
}, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({
  eligibleCount: manifest.eligibleCount, ticketCount: manifest.ticketCount,
  sourceSha256: manifest.source.sha256, manifestHash: manifest.manifestHash,
  drawSpecHash: spec.drawSpecHash, publicPath, specPath, privatePath,
}, null, 2)}\n`);
