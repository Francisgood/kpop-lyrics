#!/usr/bin/env node
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import {
  atomicWrite,
  parseCsv,
  parseArgs,
  readJson,
  requireArg,
  validateDrawSpec,
  validateManifest,
  validatePrivateRoster,
} from "../lib.mjs";
import {
  BASE_CHAIN_ID,
  BASE_EXPLORER,
  DRAW_CONTRACT,
  LIVE_CONFIRMATION,
  assertPrivateFile,
  assertPasswordFile,
  createInitialState,
  defaultStatePath,
  findTransactionByNonce,
  parseCommandJson,
  parseUintOutput,
  readOperatorState,
  requireAddress,
  requireEnvironment,
  requireHash,
  rpc,
  run,
  validateOperatorState,
  writeOperatorState,
} from "./operator-lib.mjs";

const args = parseArgs(process.argv.slice(2));
if (requireArg(args, "confirm") !== LIVE_CONFIRMATION) {
  throw new Error(`Live broadcast refused. --confirm must exactly equal: ${LIVE_CONFIRMATION}`);
}

const rpcUrl = requireEnvironment("BASE_RPC_URL");
if (new URL(rpcUrl).protocol !== "https:") throw new Error("BASE_RPC_URL must use HTTPS");
const keystorePath = resolve(requireEnvironment("DRAW_KEYSTORE"));
if (!existsSync(keystorePath)) throw new Error("DRAW_KEYSTORE does not exist");
await assertPrivateFile(keystorePath, "Draw keystore");
const passwordFile = await assertPasswordFile(requireEnvironment("DRAW_PASSWORD_FILE"));
const privateManifestPath = resolve(requireArg(args, "private-manifest"));
const privateCandidateOutput = resolve(requireArg(args, "private-output"));
const canonicalProofOutput = resolve("public/giveaway/bts-2026/production-proof.json");
const proofOutput = resolve(args["proof-output"] ?? canonicalProofOutput);
if (proofOutput !== canonicalProofOutput) throw new Error("Production proof must use the canonical tracked output path");
const statePath = resolve(args["state-path"] ?? defaultStatePath());
const manifestPath = resolve("public/giveaway/bts-2026/manifest.json");
const drawSpecPath = resolve("public/giveaway/bts-2026/draw-spec.json");
const manifest = validateManifest(await readJson(manifestPath));
const drawSpec = validateDrawSpec(await readJson(drawSpecPath), manifest);
const repositoryRoot = resolve(run("git", ["rev-parse", "--show-toplevel"], { label: "git root" }));

function assertOutsideRepository(path, label) {
  const repoRelative = relative(repositoryRoot, path);
  if (repoRelative === "" || (!repoRelative.startsWith("..") && !isAbsolute(repoRelative))) {
    throw new Error(`${label} must live outside the Git repository`);
  }
}

for (const [path, label] of [
  [keystorePath, "Draw keystore"],
  [passwordFile, "Keystore password file"],
  [privateManifestPath, "Private manifest"],
  [privateCandidateOutput, "Private candidate output"],
  [statePath, "Operator recovery state"],
]) assertOutsideRepository(path, label);
if (privateManifestPath === privateCandidateOutput) throw new Error("Private manifest and candidate output paths must differ");
await assertPrivateFile(privateManifestPath, "Private manifest");
validatePrivateRoster(manifest, parseCsv(await readFile(privateManifestPath, "utf8")));

function cast(args_, label) {
  return run("cast", [...args_, "--rpc-url", rpcUrl], { label });
}

function call(address, signature, ...callArgs) {
  return cast(["call", address, signature, ...callArgs], `cast call ${signature}`);
}

function signerArgs() {
  return ["--keystore", keystorePath, "--password-file", passwordFile];
}

function transactionHashFrom(value, label) {
  return requireHash(value?.transactionHash ?? value?.hash, `${label} transaction hash`);
}

async function assertPublicCommittedCode() {
  if (run("git", ["status", "--porcelain=v1"], { label: "git status" }) !== "") {
    throw new Error("Live draw refused: commit every tracked draw change and start from a clean working tree");
  }
  const head = run("git", ["rev-parse", "HEAD"], { label: "git rev-parse" });
  const remoteBranches = run("git", ["branch", "-r", "--contains", head], { label: "git branch --contains" });
  if (!remoteBranches.split("\n").some((line) => line.trim().startsWith("origin/"))) {
    throw new Error("Live draw refused: the exact contract commit must be pushed to the public fork first");
  }
  return head;
}

async function chainPreflight(walletAddress) {
  const chainId = Number(parseUintOutput(cast(["chain-id"], "Base chain ID"), "chain ID"));
  if (chainId !== BASE_CHAIN_ID) throw new Error(`Wrong network: expected ${BASE_CHAIN_ID}, got ${chainId}`);

  const wrapperAddress = requireAddress(drawSpec.randomness.wrapperAddress, "VRF wrapper");
  const wrapperCode = cast(["code", wrapperAddress], "VRF wrapper code");
  if (!/^0x[0-9a-fA-F]+$/.test(wrapperCode) || wrapperCode === "0x") throw new Error("VRF wrapper has no code");

  const gasPrice = parseUintOutput(cast(["gas-price"], "Base gas price"), "gas price");
  const quoted = parseUintOutput(
    cast([
      "call",
      wrapperAddress,
      "calculateRequestPriceNative(uint32,uint32)(uint256)",
      String(drawSpec.randomness.callbackGasLimit),
      String(drawSpec.randomness.numWords),
      "--gas-price",
      gasPrice.toString(),
    ], "VRF native quote"),
    "VRF quote",
  );
  if (quoted <= 0n) throw new Error("VRF wrapper returned a zero request quote");

  const balance = parseUintOutput(cast(["balance", walletAddress], "draw-wallet balance"), "balance");
  const minimumReserve = quoted * 2n + 300_000_000_000_000n;
  if (balance < minimumReserve) {
    throw new Error(`Draw wallet underfunded: balance ${balance} wei; require at least ${minimumReserve} wei`);
  }
  process.stdout.write(`${JSON.stringify({ phase: "preflight", walletAddress, balanceWei: balance.toString(), wrapperQuoteWei: quoted.toString(), chainId }, null, 2)}\n`);
}

async function recoverBroadcast(state, kind) {
  const nonceKey = kind === "deployment" ? "deploymentNonce" : "requestNonce";
  const blockKey = kind === "deployment" ? "deploymentStartBlock" : "requestStartBlock";
  const recovered = await findTransactionByNonce({
    rpcUrl,
    sender: state.walletAddress,
    nonce: state[nonceKey],
    fromBlock: state[blockKey],
  });
  if (!recovered) return null;
  if (!recovered.receipt) throw new Error(`Recovered ${kind} transaction is still pending; wait and rerun`);
  return recovered;
}

async function deployIfNeeded(state) {
  if (["deployed", "requesting", "requested", "fulfilled", "finalized"].includes(state.status)) return state;

  if (state.status === "deploying") {
    const recovered = await recoverBroadcast(state, "deployment");
    if (recovered) {
      if (BigInt(recovered.receipt.status) !== 1n) {
        await writeOperatorState(statePath, {
          ...state,
          status: "prepared",
          failedDeploymentTxs: [...(state.failedDeploymentTxs ?? []), recovered.transaction.hash],
          deploymentNonce: undefined,
          deploymentStartBlock: undefined,
        });
        throw new Error(`Deployment transaction reverted without creating a contract. It is safe to rerun: ${recovered.transaction.hash}`);
      }
      state = await writeOperatorState(statePath, {
        ...state,
        status: "deployed",
        consumerAddress: requireAddress(recovered.receipt.contractAddress, "recovered consumer"),
        deploymentTx: requireHash(recovered.transaction.hash, "recovered deployment transaction"),
        deploymentBlock: Number(BigInt(recovered.receipt.blockNumber)),
      });
      return state;
    }
    const currentNonce = BigInt(await rpc(rpcUrl, "eth_getTransactionCount", [state.walletAddress, "pending"]));
    if (currentNonce !== BigInt(state.deploymentNonce)) {
      throw new Error("Deployment nonce advanced but its transaction could not be recovered; stop before broadcasting anything");
    }
  } else {
    const nonce = BigInt(await rpc(rpcUrl, "eth_getTransactionCount", [state.walletAddress, "pending"]));
    const startBlock = Number(BigInt(await rpc(rpcUrl, "eth_blockNumber")));
    state = await writeOperatorState(statePath, {
      ...state,
      status: "deploying",
      deploymentNonce: nonce.toString(),
      deploymentStartBlock: startBlock,
    });
  }

  const deployment = parseCommandJson(
    run(
      "forge",
      [
        "create",
        DRAW_CONTRACT,
        "--rpc-url",
        rpcUrl,
        ...signerArgs(),
        "--nonce",
        state.deploymentNonce,
        "--constructor-args",
        state.walletAddress,
        state.wrapperAddress,
        `0x${state.manifestHash}`,
        `0x${state.drawSpecHash}`,
        "--json",
      ],
      { label: "contract deployment" },
    ),
    "contract deployment",
  );
  const consumerAddress = requireAddress(deployment.deployedTo ?? deployment.contractAddress, "consumer address");
  const deploymentTx = transactionHashFrom(deployment, "deployment");
  const receipt = await rpc(rpcUrl, "eth_getTransactionReceipt", [deploymentTx]);
  if (!receipt || BigInt(receipt.status) !== 1n) throw new Error("Deployment transaction was not successful");

  state = await writeOperatorState(statePath, {
    ...state,
    status: "deployed",
    consumerAddress,
    deploymentTx,
    deploymentBlock: Number(BigInt(receipt.blockNumber)),
  });
  return state;
}

function assertConsumerConfiguration(state) {
  const onchainOwner = requireAddress(call(state.consumerAddress, "owner()(address)"), "onchain owner");
  const onchainManifest = requireHash(call(state.consumerAddress, "manifestHash()(bytes32)"), "onchain manifest hash");
  const onchainSpec = requireHash(call(state.consumerAddress, "drawSpecHash()(bytes32)"), "onchain draw spec hash");
  const onchainWrapper = requireAddress(call(state.consumerAddress, "vrfWrapper()(address)"), "onchain wrapper");
  const callbackGasLimit = Number(parseUintOutput(call(state.consumerAddress, "CALLBACK_GAS_LIMIT()(uint32)"), "callback gas limit"));
  const requestConfirmations = Number(parseUintOutput(call(state.consumerAddress, "REQUEST_CONFIRMATIONS()(uint16)"), "request confirmations"));
  const numWords = Number(parseUintOutput(call(state.consumerAddress, "NUM_WORDS()(uint32)"), "word count"));
  if (
    onchainOwner.toLowerCase() !== state.walletAddress.toLowerCase()
    || onchainManifest.toLowerCase() !== `0x${state.manifestHash}`.toLowerCase()
    || onchainSpec.toLowerCase() !== `0x${state.drawSpecHash}`.toLowerCase()
    || onchainWrapper.toLowerCase() !== state.wrapperAddress.toLowerCase()
    || callbackGasLimit !== drawSpec.randomness.callbackGasLimit
    || requestConfirmations !== drawSpec.randomness.requestConfirmations
    || numWords !== drawSpec.randomness.numWords
  ) {
    throw new Error("Deployed consumer configuration does not match the frozen local commitments");
  }
}

async function requestIfNeeded(state) {
  assertConsumerConfiguration(state);
  const onchainState = Number(parseUintOutput(call(state.consumerAddress, "state()(uint8)"), "consumer state"));

  if (onchainState >= 1) {
    if (!state.requestTx && state.requestNonce !== undefined) {
      const recovered = await recoverBroadcast(state, "request");
      if (!recovered) throw new Error("Consumer has a request but its request transaction could not be recovered");
      state.requestTx = requireHash(recovered.transaction.hash, "recovered request transaction");
    }
    state.requestId = parseUintOutput(call(state.consumerAddress, "requestId()(uint256)"), "request ID").toString();
    return writeOperatorState(statePath, { ...state, status: onchainState === 2 ? "fulfilled" : "requested" });
  }

  if (state.status === "requesting") {
    const recovered = await recoverBroadcast(state, "request");
    if (recovered) {
      if (BigInt(recovered.receipt.status) !== 1n) {
        await writeOperatorState(statePath, {
          ...state,
          status: "deployed",
          failedRequestTxs: [...(state.failedRequestTxs ?? []), recovered.transaction.hash],
          requestNonce: undefined,
          requestStartBlock: undefined,
        });
        throw new Error(`VRF request transaction reverted and created no request. It is safe to rerun: ${recovered.transaction.hash}`);
      }
      await writeOperatorState(statePath, {
        ...state,
        status: "deployed",
        unexpectedNonceTxs: [...(state.unexpectedNonceTxs ?? []), recovered.transaction.hash],
        requestNonce: undefined,
        requestStartBlock: undefined,
      });
      throw new Error(`Reserved request nonce was used by a transaction that did not create the VRF request. It is safe to rerun after inspection: ${recovered.transaction.hash}`);
    } else {
      const currentNonce = BigInt(await rpc(rpcUrl, "eth_getTransactionCount", [state.walletAddress, "pending"]));
      if (currentNonce !== BigInt(state.requestNonce)) {
        throw new Error("Request nonce advanced but its transaction could not be recovered; stop before broadcasting anything");
      }
    }
  } else {
    const nonce = BigInt(await rpc(rpcUrl, "eth_getTransactionCount", [state.walletAddress, "pending"]));
    const startBlock = Number(BigInt(await rpc(rpcUrl, "eth_blockNumber")));
    state = await writeOperatorState(statePath, {
      ...state,
      status: "requesting",
      requestNonce: nonce.toString(),
      requestStartBlock: startBlock,
    });
  }

  const gasPrice = parseUintOutput(cast(["gas-price"], "Base gas price"), "gas price");
  const quote = parseUintOutput(
    cast(["call", state.consumerAddress, "quoteRequestPrice()(uint256)", "--gas-price", gasPrice.toString()], "consumer quote"),
    "consumer quote",
  );
  const buffer = quote / 4n > 10_000_000_000_000n ? quote / 4n : 10_000_000_000_000n;
  const requestValue = quote + buffer;
  const balance = parseUintOutput(cast(["balance", state.walletAddress], "draw-wallet balance"), "balance");
  if (balance < requestValue + 150_000_000_000_000n) throw new Error("Insufficient wallet balance for request plus gas reserve");

  const requestReceipt = parseCommandJson(
    cast(
      [
        "send",
        state.consumerAddress,
        "requestDraw()",
        "--value",
        requestValue.toString(),
        "--nonce",
        state.requestNonce,
        ...signerArgs(),
        "--json",
      ],
      "one-shot VRF request",
    ),
    "VRF request",
  );
  const requestTx = transactionHashFrom(requestReceipt, "request");
  if (requestReceipt.status !== undefined && BigInt(requestReceipt.status) !== 1n) {
    throw new Error(`VRF request transaction reverted: ${requestTx}`);
  }
  const requestId = parseUintOutput(call(state.consumerAddress, "requestId()(uint256)"), "request ID");
  if (requestId === 0n) throw new Error("VRF request mined but consumer stored request ID zero");

  return writeOperatorState(statePath, {
    ...state,
    status: "requested",
    requestTx,
    requestId: requestId.toString(),
    requestValueWei: requestValue.toString(),
    quotedPriceWei: quote.toString(),
  });
}

async function waitForFulfillment(state) {
  const deadline = Date.now() + 20 * 60 * 1000;
  while (Date.now() < deadline) {
    const onchainState = Number(parseUintOutput(call(state.consumerAddress, "state()(uint8)"), "consumer state"));
    if (onchainState === 2) return state;
    if (onchainState !== 1) throw new Error(`Unexpected consumer state ${onchainState} after request`);
    process.stdout.write("Waiting for Chainlink fulfillment…\n");
    await delay(10_000);
  }
  throw new Error("VRF request remains pending after 20 minutes; preserve state and inspect it—do not request again");
}

async function collectFulfillment(state) {
  const requestId = parseUintOutput(call(state.consumerAddress, "requestId()(uint256)"), "request ID");
  const randomWord = parseUintOutput(call(state.consumerAddress, "randomWord()(uint256)"), "random word");
  const fulfillmentBlock = parseUintOutput(call(state.consumerAddress, "fulfillmentBlock()(uint256)"), "fulfillment block");
  if (requestId.toString() !== String(state.requestId)) throw new Error("Stored request ID changed");
  if (fulfillmentBlock === 0n) throw new Error("Fulfillment block is zero");

  const eventTopic = run(
    "cast",
    ["keccak", "DrawFulfilled(uint256,uint256,bytes32,bytes32)"],
    { label: "fulfillment event topic" },
  );
  const logs = await rpc(rpcUrl, "eth_getLogs", [{
    address: state.consumerAddress,
    fromBlock: `0x${fulfillmentBlock.toString(16)}`,
    toBlock: `0x${fulfillmentBlock.toString(16)}`,
    topics: [eventTopic, `0x${requestId.toString(16).padStart(64, "0")}`],
  }]);
  if (logs.length !== 1) throw new Error(`Expected one fulfillment event; found ${logs.length}`);
  const fulfillmentTx = requireHash(logs[0].transactionHash, "fulfillment transaction");
  const expectedManifestTopic = `0x${state.manifestHash}`.toLowerCase();
  const expectedSpecTopic = `0x${state.drawSpecHash}`.toLowerCase();
  const expectedWordData = `0x${randomWord.toString(16).padStart(64, "0")}`.toLowerCase();
  if (
    logs[0].topics?.[2]?.toLowerCase() !== expectedManifestTopic
    || logs[0].topics?.[3]?.toLowerCase() !== expectedSpecTopic
    || logs[0].data?.toLowerCase() !== expectedWordData
  ) {
    throw new Error("Fulfillment event does not match the frozen hashes and stored raw word");
  }

  return writeOperatorState(statePath, {
    ...state,
    status: "fulfilled",
    fulfillmentTx,
    fulfillmentBlock: Number(fulfillmentBlock),
    randomWord: `0x${randomWord.toString(16).padStart(64, "0")}`,
  });
}

async function waitForPublicationDepth(state) {
  const confirmations = drawSpec.randomness.fulfillmentPublicationConfirmations;
  const targetBlock = state.fulfillmentBlock + confirmations;
  const deadline = Date.now() + 10 * 60 * 1000;
  while (Date.now() < deadline) {
    const latestBlock = Number(BigInt(await rpc(rpcUrl, "eth_blockNumber")));
    if (latestBlock >= targetBlock) {
      const receipt = await rpc(rpcUrl, "eth_getTransactionReceipt", [state.fulfillmentTx]);
      if (!receipt || BigInt(receipt.status) !== 1n || Number(BigInt(receipt.blockNumber)) !== state.fulfillmentBlock) {
        throw new Error("Fulfillment transaction changed before publication depth; stop and inspect the possible reorg");
      }
      const onchainState = Number(parseUintOutput(call(state.consumerAddress, "state()(uint8)"), "consumer state"));
      const randomWord = parseUintOutput(call(state.consumerAddress, "randomWord()(uint256)"), "random word");
      if (onchainState !== 2 || `0x${randomWord.toString(16).padStart(64, "0")}` !== state.randomWord) {
        throw new Error("Consumer fulfillment state changed before publication");
      }
      return writeOperatorState(statePath, { ...state, publicationConfirmedBlock: latestBlock });
    }
    process.stdout.write(`Waiting for fulfillment publication depth (${latestBlock}/${targetBlock})…\n`);
    await delay(4_000);
  }
  throw new Error("Fulfillment did not reach the frozen publication depth within 10 minutes; preserve state and rerun");
}

async function finalize(state) {
  if (state.status === "finalized") return state;
  if (existsSync(proofOutput)) {
    const existingProof = await readJson(proofOutput);
    if (existingProof.status === "complete" && existingProof.mode === "production") {
      const evidence = existingProof.randomness ?? {};
      if (
        evidence.consumerAddress?.toLowerCase() !== state.consumerAddress.toLowerCase()
        || evidence.wrapperAddress?.toLowerCase() !== state.wrapperAddress.toLowerCase()
        || evidence.deploymentTx?.toLowerCase() !== state.deploymentTx.toLowerCase()
        || String(evidence.requestId) !== String(state.requestId)
        || evidence.requestTx?.toLowerCase() !== state.requestTx.toLowerCase()
        || evidence.fulfillmentTx?.toLowerCase() !== state.fulfillmentTx.toLowerCase()
        || evidence.randomWord?.toLowerCase() !== state.randomWord.toLowerCase()
        || evidence.drawSpecHash !== state.drawSpecHash
        || evidence.codeCommit !== state.codeCommit
        || !existsSync(privateCandidateOutput)
      ) {
        throw new Error("Existing completed proof or private mapping does not match the recovered on-chain draw state");
      }
      run(process.execPath, [
        "scripts/giveaway/verify-draw.mjs",
        "--manifest", manifestPath,
        "--proof", proofOutput,
        "--draw-spec", drawSpecPath,
      ], { label: "recovered production proof verifier" });
      return writeOperatorState(statePath, { ...state, status: "finalized", proofOutput });
    }
  }
  run(
    process.execPath,
    [
      "scripts/giveaway/finalize-draw.mjs",
      "--mode", "production",
      "--manifest", manifestPath,
      "--draw-spec", drawSpecPath,
      "--private-manifest", privateManifestPath,
      "--private-output", privateCandidateOutput,
      "--proof-output", proofOutput,
      "--random-word", state.randomWord,
      "--chain-name", drawSpec.randomness.chainName,
      "--chain-id", String(BASE_CHAIN_ID),
      "--consumer-address", state.consumerAddress,
      "--request-id", state.requestId,
      "--request-tx", state.requestTx,
      "--fulfillment-tx", state.fulfillmentTx,
      "--explorer-base-url", BASE_EXPLORER,
      "--wrapper-address", state.wrapperAddress,
      "--deployment-tx", state.deploymentTx,
      "--draw-spec-hash", state.drawSpecHash,
      "--code-commit", state.codeCommit,
    ],
    { label: "production draw finalizer" },
  );
  run(process.execPath, [
    "scripts/giveaway/verify-draw.mjs",
    "--manifest", manifestPath,
    "--proof", proofOutput,
    "--draw-spec", drawSpecPath,
  ], { label: "production proof verifier" });
  return writeOperatorState(statePath, { ...state, status: "finalized", proofOutput });
}

async function withdrawBuffer(state) {
  const balance = parseUintOutput(cast(["balance", state.consumerAddress], "consumer balance"), "consumer balance");
  if (balance === 0n || state.refundTx) return state;
  const receipt = parseCommandJson(
    cast(["send", state.consumerAddress, "withdrawExcess()", ...signerArgs(), "--json"], "buffer withdrawal"),
    "buffer withdrawal",
  );
  return writeOperatorState(statePath, {
    ...state,
    refundTx: transactionHashFrom(receipt, "refund"),
    refundedWei: balance.toString(),
  });
}

const walletAddress = requireAddress(
  run("cast", ["wallet", "address", "--keystore", keystorePath, "--password-file", passwordFile], {
    label: "draw-wallet decryption",
  }),
  "draw-wallet address",
);
const codeCommit = run("git", ["rev-parse", "HEAD"], { label: "git commit" });
let state = await readOperatorState(statePath);

if (!state) {
  if (existsSync(privateCandidateOutput)) {
    throw new Error("Fresh draw refused: private candidate output already exists; archive it and verify whether a prior draw ran");
  }
  const existingProof = await readJson(proofOutput);
  if (existingProof.status === "complete") {
    throw new Error("Fresh draw refused: the canonical production proof is already complete");
  }
  const publicCommit = await assertPublicCommittedCode();
  if (publicCommit !== codeCommit) throw new Error("Git commit changed during preflight");
  await chainPreflight(walletAddress);
  state = await writeOperatorState(
    statePath,
    createInitialState({
      manifest,
      drawSpec,
      walletAddress,
      codeCommit,
      privateManifestPath,
      privateCandidateOutput,
      proofOutput,
    }),
  );
} else {
  state = validateOperatorState(state, {
    manifest,
    drawSpec,
    walletAddress,
    privateManifestPath,
    privateCandidateOutput,
    proofOutput,
  });
  if (state.codeCommit !== codeCommit) throw new Error("Check out the original draw implementation commit before resuming");
}

state = await deployIfNeeded(state);
assertConsumerConfiguration(state);
if (state.status !== "finalized") {
  state = await requestIfNeeded(state);
  state = await waitForFulfillment(state);
  state = await collectFulfillment(state);
  state = await waitForPublicationDepth(state);
  state = await finalize(state);
}
state = await withdrawBuffer(state);

await atomicWrite(
  `${statePath}.public-summary.json`,
  `${JSON.stringify({
    campaignId: state.campaignId,
    chainId: state.chainId,
    walletAddress: state.walletAddress,
    consumerAddress: state.consumerAddress,
    deploymentTx: state.deploymentTx,
    requestId: state.requestId,
    requestTx: state.requestTx,
    fulfillmentTx: state.fulfillmentTx,
    randomWord: state.randomWord,
    manifestHash: state.manifestHash,
    drawSpecHash: state.drawSpecHash,
    proofOutput,
  }, null, 2)}\n`,
  0o600,
);

process.stdout.write(`${JSON.stringify({
  status: "complete",
  consumerAddress: state.consumerAddress,
  deploymentTx: state.deploymentTx,
  requestId: state.requestId,
  requestTx: state.requestTx,
  fulfillmentTx: state.fulfillmentTx,
  proofOutput,
  privateCandidateOutput,
}, null, 2)}\n`);
