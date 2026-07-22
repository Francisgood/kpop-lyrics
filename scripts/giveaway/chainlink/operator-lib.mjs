import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { BASE_CHAIN_ID, BASE_EXPLORER, atomicWrite, readJson } from "../lib.mjs";

export const LIVE_CONFIRMATION = "I AUTHORIZE ONE BASE MAINNET VRF DRAW";
export const OPERATOR_STATE_VERSION = "aegyo-chainlink-operator-state-v1";
export const DRAW_CONTRACT = "chainlink/src/AegyoBtsGiveawayDraw.sol:AegyoBtsGiveawayDraw";
export { BASE_CHAIN_ID, BASE_EXPLORER };

export function requireEnvironment(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

export function parseUintOutput(output, label) {
  const value = String(output).trim().split(/\s+/)[0];
  if (!/^(?:0x[0-9a-fA-F]+|[0-9]+)$/.test(value)) throw new Error(`Invalid ${label}: ${value}`);
  return BigInt(value);
}

export function requireAddress(value, label) {
  const normalized = String(value).trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(normalized)) throw new Error(`Invalid ${label}`);
  return normalized;
}

export function requireHash(value, label) {
  const normalized = String(value).trim();
  if (!/^0x[0-9a-fA-F]{64}$/.test(normalized)) throw new Error(`Invalid ${label}`);
  return normalized;
}

export function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? process.cwd(),
    encoding: "utf8",
    env: options.env ?? process.env,
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`${options.label ?? command} failed${detail ? `:\n${detail}` : ""}`);
  }
  return result.stdout.trim();
}

export function parseCommandJson(output, label) {
  const text = String(output).trim();
  const candidates = [text, ...text.split("\n").reverse()];
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Some Foundry versions print compile messages before their final JSON line.
    }
  }
  throw new Error(`${label} did not return JSON`);
}

export async function rpc(rpcUrl, method, params = []) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`RPC ${method} failed with HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error(`RPC ${method} failed: ${payload.error.message ?? "unknown error"}`);
  return payload.result;
}

export async function findTransactionByNonce({ rpcUrl, sender, nonce, fromBlock }) {
  const latestHex = await rpc(rpcUrl, "eth_blockNumber");
  const latest = Number(BigInt(latestHex));
  const floor = Math.max(Number(fromBlock), latest - 5_000);
  const wantedSender = sender.toLowerCase();
  const wantedNonce = BigInt(nonce);

  for (let block = latest; block >= floor; block -= 1) {
    const value = await rpc(rpcUrl, "eth_getBlockByNumber", [`0x${block.toString(16)}`, true]);
    const transaction = value?.transactions?.find(
      (candidate) => candidate.from?.toLowerCase() === wantedSender && BigInt(candidate.nonce) === wantedNonce,
    );
    if (transaction) {
      const receipt = await rpc(rpcUrl, "eth_getTransactionReceipt", [transaction.hash]);
      return { transaction, receipt };
    }
  }
  return null;
}

export function createInitialState({
  manifest,
  drawSpec,
  walletAddress,
  codeCommit,
  privateManifestPath,
  privateCandidateOutput,
  proofOutput,
}) {
  return {
    stateVersion: OPERATOR_STATE_VERSION,
    campaignId: manifest.campaignId,
    chainId: BASE_CHAIN_ID,
    walletAddress,
    codeCommit,
    manifestHash: manifest.manifestHash,
    drawSpecHash: drawSpec.drawSpecHash,
    wrapperAddress: drawSpec.randomness.wrapperAddress,
    privateManifestPath,
    privateCandidateOutput,
    proofOutput,
    status: "prepared",
    updatedAt: new Date().toISOString(),
  };
}

export function validateOperatorState(
  state,
  { manifest, drawSpec, walletAddress, privateManifestPath, privateCandidateOutput, proofOutput },
) {
  const statuses = ["prepared", "deploying", "deployed", "requesting", "requested", "fulfilled", "finalized"];
  if (
    state.stateVersion !== OPERATOR_STATE_VERSION
    || state.campaignId !== manifest.campaignId
    || state.chainId !== BASE_CHAIN_ID
    || state.walletAddress?.toLowerCase() !== walletAddress.toLowerCase()
    || state.manifestHash !== manifest.manifestHash
    || state.drawSpecHash !== drawSpec.drawSpecHash
    || state.wrapperAddress?.toLowerCase() !== drawSpec.randomness.wrapperAddress.toLowerCase()
    || !/^[0-9a-f]{40}$/.test(state.codeCommit ?? "")
    || !statuses.includes(state.status)
    || state.privateManifestPath !== privateManifestPath
    || state.privateCandidateOutput !== privateCandidateOutput
    || state.proofOutput !== proofOutput
  ) {
    throw new Error("Local operator state does not match the frozen wallet, manifest, or draw spec");
  }
  if (["deployed", "requesting", "requested", "fulfilled", "finalized"].includes(state.status)) {
    requireAddress(state.consumerAddress, "state consumer address");
    requireHash(state.deploymentTx, "state deployment transaction");
  }
  if (state.status === "deploying") {
    parseUintOutput(state.deploymentNonce, "state deployment nonce");
    if (!Number.isInteger(state.deploymentStartBlock) || state.deploymentStartBlock < 0) {
      throw new Error("Invalid state deployment start block");
    }
  }
  if (state.status === "requesting") {
    parseUintOutput(state.requestNonce, "state request nonce");
    if (!Number.isInteger(state.requestStartBlock) || state.requestStartBlock < 0) {
      throw new Error("Invalid state request start block");
    }
  }
  if (["requested", "fulfilled", "finalized"].includes(state.status)) {
    requireHash(state.requestTx, "state request transaction");
    parseUintOutput(state.requestId, "state request ID");
  }
  if (["fulfilled", "finalized"].includes(state.status)) {
    requireHash(state.fulfillmentTx, "state fulfillment transaction");
    parseUintOutput(state.randomWord, "state random word");
  }
  return state;
}

export async function readOperatorState(path) {
  return existsSync(path) ? readJson(path) : null;
}

export async function writeOperatorState(path, state) {
  const next = { ...state, updatedAt: new Date().toISOString() };
  await atomicWrite(path, `${JSON.stringify(next, null, 2)}\n`, 0o600);
  return next;
}

export async function assertPasswordFile(path) {
  return assertPrivateFile(path, "Keystore password file");
}

export async function assertPrivateFile(path, label) {
  const resolved = resolve(path);
  const contents = await readFile(resolved, "utf8");
  if (!contents.trim()) throw new Error(`${label} is empty`);
  const metadata = await stat(resolved);
  if (!metadata.isFile() || (metadata.mode & 0o077) !== 0) {
    throw new Error(`${label} must be a regular file with mode 0600`);
  }
  return resolved;
}

export function defaultStatePath() {
  const home = process.env.HOME;
  if (!home) throw new Error("HOME is unavailable");
  return resolve(home, ".local", "share", "aegyo-giveaway", "base-draw-state.json");
}
