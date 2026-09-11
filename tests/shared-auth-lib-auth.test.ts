import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ cookies: vi.fn(), legacy: vi.fn(), authorize: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("../lib/prisma", () => ({ prisma: { session: { findUnique: mocks.legacy, delete: vi.fn() } } }));
vi.mock("../lib/shared-auth/session", () => ({ authorizeSharedSession: mocks.authorize }));
import { getSession } from "../lib/auth";
beforeEach(() => { vi.clearAllMocks(); mocks.cookies.mockResolvedValue({ get: () => ({ value: "legacy-token" }) }); process.env.AEGYO_SHARED_AUTH_ENABLED="true"; delete process.env.AEGYO_AUTH_BASE_URL; });
describe("getSession cutover", () => {
 it("fails closed on malformed flag-on configuration without legacy lookup", async () => { await expect(getSession()).resolves.toBeNull(); expect(mocks.legacy).not.toHaveBeenCalled(); expect(mocks.authorize).not.toHaveBeenCalled(); });
 it("preserves legacy session lookup while the flag is off", async () => { process.env.AEGYO_SHARED_AUTH_ENABLED="false"; const legacy={id:"s", expiresAt:new Date(Date.now()+60_000), user:{id:"u"}}; mocks.legacy.mockResolvedValue(legacy); await expect(getSession()).resolves.toBe(legacy); expect(mocks.legacy).toHaveBeenCalled(); });
});
