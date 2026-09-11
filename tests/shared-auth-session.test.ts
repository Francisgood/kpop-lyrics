import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ identity: vi.fn(), email: vi.fn(), create: vi.fn(), transaction: vi.fn(), findSession: vi.fn(), update: vi.fn(), deleteMany: vi.fn(), fetchState: vi.fn() }));
vi.mock("../lib/prisma", () => ({ prisma: { $transaction: mocks.transaction, session: { findUnique: mocks.findSession, update: mocks.update, deleteMany: mocks.deleteMany } } }));
vi.mock("../lib/shared-auth/security-state", async (original) => ({ ...(await original<typeof import("../lib/shared-auth/security-state")>()), fetchProviderSecurityState: mocks.fetchState }));
import { authorizeSharedSession, createMappedSession } from "../lib/shared-auth/session";
const config = { providerBaseUrl: "https://accounts.example.test", issuer: "https://accounts.example.test/api/auth", clientId: "a", clientSecret: "b", appOrigin: "https://aegyo.example.test", transactionSecret: "x".repeat(32), stateReaderKey: "reader" };
const reset = { version: 1 as const, kind: "database" as const, lastPasswordReset: null };
beforeEach(() => { vi.clearAllMocks(); mocks.transaction.mockImplementation((fn) => fn({ sharedAuthIdentity: { findUnique: mocks.identity }, user: { findUnique: mocks.email }, session: { create: mocks.create } })); });
describe("mapped local identity and sessions", () => {
 it("preserves the explicitly mapped stable local user ID and never maps by email", async () => {
  mocks.identity.mockResolvedValue({ userId: "stable-user-7", user: { id: "stable-user-7", email: "old@example.test" } }); mocks.create.mockImplementation(({ data }) => Promise.resolve({ id: "session", ...data }));
  const result = await createMappedSession({ issuer: config.issuer, subject: "provider-sub", providerSessionId: "sid", authenticatedAtMs: Date.now(), securityVersion: 1, resetState: reset });
  expect(mocks.email).not.toHaveBeenCalled(); expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: "stable-user-7" }) })); expect(result.session.userId).toBe("stable-user-7");
 });
 it("refuses an unmapped external identity even when its email matches a local user", async () => {
  mocks.identity.mockResolvedValue(null); mocks.email.mockResolvedValue({ id: "must-not-claim" });
  await expect(createMappedSession({ issuer: config.issuer, subject: "new-sub", providerSessionId: "sid", authenticatedAtMs: Date.now(), securityVersion: 1, resetState: reset })).rejects.toThrow("unmapped_identity");
  expect(mocks.email).not.toHaveBeenCalled(); expect(mocks.create).not.toHaveBeenCalled();
 });
 it("revocation winning the access race deletes the local shared session", async () => {
  const session = { id: "local-session", token: "token", expiresAt: new Date(Date.now()+60_000), providerSessionId: "sid", authenticatedAt: new Date(), providerCheckedAt: new Date(0), securityVersion: 2, passwordResetAt: null, user: { id: "stable", sharedIdentity: { issuer: config.issuer, subject: "sub" } } };
  mocks.findSession.mockResolvedValue(session); mocks.fetchState.mockResolvedValue({ kind: "ok", state: { version: 1, subject: "sub", providerSessionId: "sid", active: false, passwordResetState: reset, operatorCutoff: null, securityVersion: 3 } });
  await expect(authorizeSharedSession("token", config, { sensitive: true })).resolves.toEqual({ kind: "invalid" });
  expect(mocks.deleteMany).toHaveBeenCalledWith({ where: { token: "token" } }); expect(mocks.update).not.toHaveBeenCalled();
 });
 it("rejects a cached session mapped under a different issuer", async () => {
  mocks.findSession.mockResolvedValue({ id: "s", expiresAt: new Date(Date.now()+60_000), providerSessionId: "sid", authenticatedAt: new Date(), providerCheckedAt: new Date(), securityVersion: 2, passwordResetAt: null, user: { sharedIdentity: { issuer: "https://old.example.test/api/auth", subject: "sub" } } });
  await expect(authorizeSharedSession("token", config, { sensitive: false })).resolves.toEqual({ kind: "invalid" });
  expect(mocks.fetchState).not.toHaveBeenCalled();
 });
 it("fails closed without deleting the session during a provider outage", async () => {
  mocks.findSession.mockResolvedValue({ id: "s", expiresAt: new Date(Date.now()+60_000), providerSessionId: "sid", authenticatedAt: new Date(), providerCheckedAt: new Date(0), securityVersion: 2, passwordResetAt: null, user: { sharedIdentity: { issuer: config.issuer, subject: "sub" } } }); mocks.fetchState.mockResolvedValue({ kind: "unavailable" });
  await expect(authorizeSharedSession("token", config, { sensitive: true })).resolves.toEqual({ kind: "unavailable" }); expect(mocks.update).not.toHaveBeenCalled(); expect(mocks.deleteMany).not.toHaveBeenCalled();
 });
});
