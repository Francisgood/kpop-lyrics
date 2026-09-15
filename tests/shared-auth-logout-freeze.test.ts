import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  deleteSessions: vi.fn(),
  resolveAuthMode: vi.fn(),
}));

vi.mock("../lib/prisma", () => ({
  prisma: { session: { deleteMany: mocks.deleteSessions } },
}));
vi.mock("../lib/shared-auth/mode", () => ({
  resolveAuthMode: mocks.resolveAuthMode,
}));

import { POST } from "../app/api/auth/logout/route";

function logoutRequest() {
  return new NextRequest("https://aegyo.example.test/api/auth/logout", {
    method: "POST",
    headers: { cookie: "session=existing-session" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.deleteSessions.mockResolvedValue({ count: 1 });
});

describe("logout during the cutover freeze", () => {
  it.each([
    ["legacy", { kind: "legacy" }],
    ["shared", { kind: "shared", config: {} }],
  ])("deletes the local session in %s mode", async (_name, mode) => {
    mocks.resolveAuthMode.mockResolvedValue(mode);

    const response = await POST(logoutRequest());

    expect(response.status).toBe(200);
    expect(mocks.deleteSessions).toHaveBeenCalledOnce();
    expect(mocks.deleteSessions).toHaveBeenCalledWith({
      where: { token: "existing-session" },
    });
  });

  it.each([
    "cutover_freeze",
    "missing_latch",
    "invalid_config",
    "state_unavailable",
  ])(
    "expires the browser cookie without changing the database when closed: %s",
    async (reason) => {
      mocks.resolveAuthMode.mockResolvedValue({ kind: "closed", reason });

      const response = await POST(logoutRequest());

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ ok: true });
      expect(response.headers.get("set-cookie")).toContain("session=");
      expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
      expect(mocks.deleteSessions).not.toHaveBeenCalled();
    },
  );
});
