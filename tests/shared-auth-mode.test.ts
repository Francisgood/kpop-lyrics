import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ latch: vi.fn() }));
vi.mock("../lib/prisma", () => ({ prisma: { authCutoverLatch: { findUnique: mocks.latch } } }));
import { resolveAuthMode, ACCOUNTS_CUTOVER_LATCH_ID } from "../lib/shared-auth/mode";
const valid = { AEGYO_AUTH_BASE_URL: "https://accounts.example.test", AEGYO_APP_ORIGIN: "https://aegyo.example.test", AEGYO_AUTH_CLIENT_ID: "aegyo", AEGYO_AUTH_CLIENT_SECRET: "secret", AEGYO_AUTH_TRANSACTION_SECRET: "x".repeat(32), AEGYO_AUTH_STATE_READER_KEY: "reader" };
beforeEach(() => { vi.clearAllMocks(); for (const [key,value] of Object.entries(valid)) process.env[key]=value; delete process.env.AEGYO_SHARED_AUTH_ENABLED; mocks.latch.mockResolvedValue(null); });
describe("monotonic authentication cutover", () => {
  it("preserves legacy auth only before a latch exists", async () => { await expect(resolveAuthMode()).resolves.toEqual({ kind: "legacy" }); expect(mocks.latch).toHaveBeenCalledWith({ where: { id: ACCOUNTS_CUTOVER_LATCH_ID }, select: { id: true } }); });
  it("never revives legacy auth when the flag is turned off after activation", async () => { mocks.latch.mockResolvedValue({id:ACCOUNTS_CUTOVER_LATCH_ID}); await expect(resolveAuthMode()).resolves.toEqual({kind:"closed",reason:"latched_flag_off"}); });
  it("requires both a valid config and the durable latch for shared mode", async () => { process.env.AEGYO_SHARED_AUTH_ENABLED="true"; await expect(resolveAuthMode()).resolves.toEqual({kind:"closed",reason:"missing_latch"}); mocks.latch.mockResolvedValue({id:ACCOUNTS_CUTOVER_LATCH_ID}); const mode=await resolveAuthMode(); expect(mode.kind).toBe("shared"); delete process.env.AEGYO_AUTH_CLIENT_SECRET; await expect(resolveAuthMode()).resolves.toEqual({kind:"closed",reason:"invalid_config"}); });
  it("fails closed when latch state cannot be read", async () => { mocks.latch.mockRejectedValue(new Error("database unavailable")); await expect(resolveAuthMode()).resolves.toEqual({kind:"closed",reason:"state_unavailable"}); });
});
