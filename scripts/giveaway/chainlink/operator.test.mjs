import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { sha256 } from "../lib.mjs";
import {
  LIVE_CONFIRMATION,
  createInitialState,
  findTransactionByNonce,
  parseCommandJson,
  parseUintOutput,
  requireAddress,
  requireHash,
  validateOperatorState,
} from "./operator-lib.mjs";

const walletAddress = "0xD21a29405560C91927F50988D8E78FCaa8990187";
const wrapperAddress = "0xb0407dbe851f8318bd31404A49e658143C982F23";
const manifest = {
  campaignId: "bts-giveaway-2026",
  manifestHash: "9fddd6971f8bb7c94a0b4e7705c0cbfab58d545fa4e26316221e8d853b6cad7b",
};
const drawSpec = {
  drawSpecHash: "14b3e4f19ec1723664d8f26e5c370eec248c105a361f4738f649fe959b5cd46a",
  randomness: { wrapperAddress },
};
const operatorPaths = {
  privateManifestPath: "/private/roster.csv",
  privateCandidateOutput: "/private/candidates.csv",
  proofOutput: "/public/proof.json",
};

test("operator parsers accept Foundry values and reject malformed evidence", () => {
  assert.equal(parseUintOutput("42 [4.2e1]", "number"), 42n);
  assert.equal(parseUintOutput("0x2a", "number"), 42n);
  assert.equal(requireAddress(walletAddress, "wallet"), walletAddress);
  assert.equal(requireHash(`0x${"a".repeat(64)}`, "tx"), `0x${"a".repeat(64)}`);
  assert.deepEqual(parseCommandJson(`Compiling...\n{"transactionHash":"0x${"a".repeat(64)}"}`, "receipt"), {
    transactionHash: `0x${"a".repeat(64)}`,
  });
  assert.throws(() => parseUintOutput("-1", "number"), /Invalid number/);
  assert.throws(() => requireAddress("0x1234", "wallet"), /Invalid wallet/);
  assert.throws(() => requireHash("0x1234", "tx"), /Invalid tx/);
});

test("operator state is bound to wallet, roster, draw spec, and source commit", () => {
  const state = createInitialState({
    manifest,
    drawSpec,
    walletAddress,
    codeCommit: "a".repeat(40),
    ...operatorPaths,
  });
  assert.equal(validateOperatorState(state, { manifest, drawSpec, walletAddress, ...operatorPaths }), state);
  assert.throws(
    () => validateOperatorState(
      { ...state, manifestHash: "b".repeat(64) },
      { manifest, drawSpec, walletAddress, ...operatorPaths },
    ),
    /does not match/,
  );
  assert.throws(
    () => validateOperatorState(
      { ...state, walletAddress: wrapperAddress },
      { manifest, drawSpec, walletAddress, ...operatorPaths },
    ),
    /does not match/,
  );
});

test("nonce recovery matches the exact sender and nonce", async () => {
  const originalFetch = globalThis.fetch;
  const transactionHash = `0x${"c".repeat(64)}`;
  const calls = [];
  globalThis.fetch = async (_url, options) => {
    const request = JSON.parse(options.body);
    calls.push(request.method);
    let result;
    if (request.method === "eth_blockNumber") result = "0x10";
    else if (request.method === "eth_getBlockByNumber") {
      result = {
        transactions: [
          { from: wrapperAddress, nonce: "0x7", hash: `0x${"d".repeat(64)}` },
          { from: walletAddress, nonce: "0x8", hash: transactionHash },
        ],
      };
    } else if (request.method === "eth_getTransactionReceipt") {
      result = { status: "0x1", transactionHash };
    } else throw new Error(`Unexpected method ${request.method}`);
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const recovered = await findTransactionByNonce({
      rpcUrl: "https://rpc.example.test",
      sender: walletAddress,
      nonce: "8",
      fromBlock: 16,
    });
    assert.equal(recovered.transaction.hash, transactionHash);
    assert.equal(recovered.receipt.status, "0x1");
    assert.deepEqual(calls, ["eth_blockNumber", "eth_getBlockByNumber", "eth_getTransactionReceipt"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("live runner refuses anything except the exact irreversible confirmation", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/giveaway/chainlink/run-draw.mjs", "--confirm", `${LIVE_CONFIRMATION} AGAIN`],
    { encoding: "utf8" },
  );
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /Live broadcast refused/);
});

test("vendored Chainlink 1.5.0 sources remain byte-for-byte pinned", async () => {
  const expected = new Map([
    ["chainlink/vendor/chainlink/src/v0.8/vrf/dev/VRFV2PlusWrapperConsumerBase.sol", "8cf045f295b8c6035d14012a9bc2e8ab2b5ce24749a199ca0190519c4bf2dcc0"],
    ["chainlink/vendor/chainlink/src/v0.8/vrf/dev/interfaces/IVRFV2PlusWrapper.sol", "a48aaaeaed60e65f04f6c8772e5673dda663dcfa7913fdadd14b412300b9d5f1"],
    ["chainlink/vendor/chainlink/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol", "f3b89bb466c2a79b10c1816d342fbfbec49fe82695cba92bd46e7d31af698011"],
    ["chainlink/vendor/chainlink/src/v0.8/shared/interfaces/LinkTokenInterface.sol", "f81ec96e909daa2cd27536274a30d916b26d5fc91261bed8d7a6a3e157f3825c"],
  ]);
  for (const [path, hash] of expected) assert.equal(sha256(await readFile(path)), hash, path);
});
