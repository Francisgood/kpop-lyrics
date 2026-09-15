#!/usr/bin/env node
import { readFile, writeFile, chmod } from "node:fs/promises";
import { resolve } from "node:path";
import {
  buildReconciliation,
  assertLocalStatePreserved,
} from "./reconciliation-lib.mjs";

const [localPath, accountsPath, mappingPath, afterPath, outputPath] =
  process.argv.slice(2);
if (!localPath || !accountsPath || !mappingPath || !afterPath || !outputPath) {
  console.error(
    "Usage: reconcile.mjs LOCAL.json ACCOUNTS.json MAPPING.json LOCAL_AFTER.json OUTPUT.json",
  );
  process.exit(2);
}
const readJson = async (path) =>
  JSON.parse(await readFile(resolve(path), "utf8"));
const [local, accounts, mapping, after] = await Promise.all(
  [localPath, accountsPath, mappingPath, afterPath].map(readJson),
);
const manifest = buildReconciliation(local, accounts, mapping);
assertLocalStatePreserved(local, after, manifest);
await writeFile(resolve(outputPath), `${JSON.stringify(manifest, null, 2)}\n`, {
  mode: 0o600,
  flag: "wx",
});
await chmod(resolve(outputPath), 0o600);
console.log(
  `PASS ${manifest.rows.length} explicit mappings; digest ${manifest.mappingDigest}`,
);
