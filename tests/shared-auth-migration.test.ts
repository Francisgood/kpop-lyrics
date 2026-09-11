import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const sql = readFileSync(new URL("../prisma/migrations/20260911200000_add_shared_auth/migration.sql", import.meta.url), "utf8");
describe("additive shared-auth migration", () => {
 it("keeps User IDs and owned data untouched while adding an explicit one-to-one mapping", () => {
  expect(sql).toContain('CREATE TABLE "SharedAuthIdentity"');
  expect(sql).toContain('CREATE TABLE "AuthCutoverLatch"');
  expect(sql).not.toContain('INSERT INTO "AuthCutoverLatch"');
  expect(sql).toContain('UNIQUE INDEX "SharedAuthIdentity_userId_key"');
  expect(sql).toContain('UNIQUE INDEX "SharedAuthIdentity_issuer_subject_key"');
  expect(sql).not.toMatch(/ALTER TABLE "User"/);
  expect(sql).not.toMatch(/DROP TABLE|DELETE FROM|UPDATE \"/);
 });
 it("adds only nullable security metadata to legacy sessions", () => {
  for (const column of ["providerSessionId", "authenticatedAt", "providerCheckedAt", "securityVersion", "passwordResetAt"]) expect(sql).toContain(`ADD COLUMN "${column}"`);
  expect(sql).not.toMatch(/ADD COLUMN "(?:providerSessionId|authenticatedAt|providerCheckedAt|securityVersion|passwordResetAt)"[^,;]*NOT NULL/);
 });
});
