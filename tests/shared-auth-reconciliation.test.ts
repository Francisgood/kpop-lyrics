import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  buildReconciliation,
  assertLocalStatePreserved,
  canonicalJson,
} from "../scripts/shared-auth/reconciliation-lib.mjs";
const fixture = (name: string) =>
  JSON.parse(
    readFileSync(
      new URL(`./fixtures/shared-auth-rehearsal/${name}.json`, import.meta.url),
      "utf8",
    ),
  );
const local = () => fixture("local-before");
const accounts = () => fixture("accounts");
const mapping = () => fixture("mapping");
describe("shared-auth reconciliation manifest", () => {
  it("builds a deterministic issuer/subject to stable local ID manifest without email", () => {
    const first = buildReconciliation(local(), accounts(), mapping());
    const reversed = mapping();
    reversed.pairs.reverse();
    const second = buildReconciliation(local(), accounts(), reversed);
    expect(second).toEqual(first);
    expect(first.mappingDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(first.mappingDigest).toBe(
      "4cc7d1c32d9317b5ac4045515c4b4d15557db7bf1e771467c42c10febdb7c7c9",
    );
    expect(canonicalJson(first)).not.toMatch(/email/i);
    expect(
      first.rows.map((row: { localUserId: string }) => row.localUserId),
    ).toEqual(["synthetic-local-member", "synthetic-local-owner"]);
  });
  it.each([
    [
      "email-bearing mapping",
      () => ({
        ...mapping(),
        pairs: [
          { ...mapping().pairs[0], email: "unsafe@example.test" },
          mapping().pairs[1],
        ],
      }),
    ],
    [
      "duplicate local ID",
      () => ({
        version: 1,
        pairs: [
          mapping().pairs[0],
          { ...mapping().pairs[0], subject: "opaque-subject-member" },
        ],
      }),
    ],
    [
      "duplicate subject",
      () => ({
        version: 1,
        pairs: [
          mapping().pairs[0],
          {
            localUserId: "synthetic-local-member",
            subject: mapping().pairs[0].subject,
          },
        ],
      }),
    ],
    [
      "unknown subject",
      () => ({
        version: 1,
        pairs: [
          mapping().pairs[0],
          { localUserId: "synthetic-local-member", subject: "not-exported" },
        ],
      }),
    ],
    [
      "incomplete local coverage",
      () => ({ version: 1, pairs: [mapping().pairs[0]] }),
    ],
  ])("rejects %s", (_name, makeMapping) => {
    expect(() =>
      buildReconciliation(local(), accounts(), makeMapping()),
    ).toThrow();
  });
  it("proves local IDs, roles, and linked ownership stayed byte-semantically stable", () => {
    const manifest = buildReconciliation(local(), accounts(), mapping());
    expect(
      assertLocalStatePreserved(local(), fixture("local-after"), manifest),
    ).toBe(true);
    const changed = local();
    changed.users[0].linkedRecords.Favorite = ["fav-reparented"];
    expect(() => assertLocalStatePreserved(local(), changed, manifest)).toThrow(
      /ownership changed/,
    );
    const roleChanged = local();
    roleChanged.users[0].role = "contributor";
    expect(() =>
      assertLocalStatePreserved(local(), roleChanged, manifest),
    ).toThrow(/roles/);
  });
});
