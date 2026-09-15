import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  frozen: vi.fn(),
  session: vi.fn(),
  getPollSeed: vi.fn(),
  optionOf: vi.fn(),
  castVote: vi.fn(),
  getCounts: vi.fn(),
  checkIpRate: vi.fn(),
  hashIp: vi.fn(),
  newDeviceToken: vi.fn(),
}));

vi.mock("../lib/shared-auth/mode", () => ({
  authCutoverFrozen: mocks.frozen,
}));
vi.mock("../lib/auth", () => ({ getSession: mocks.session }));
vi.mock("../lib/polls", () => ({
  getPollSeed: mocks.getPollSeed,
  optionOf: mocks.optionOf,
}));
vi.mock("../lib/polls-db", () => ({
  castVote: mocks.castVote,
  getCounts: mocks.getCounts,
  checkIpRate: mocks.checkIpRate,
  hashIp: mocks.hashIp,
  newDeviceToken: mocks.newDeviceToken,
}));

import { POST } from "../app/api/polls/[slug]/vote/route";

function request() {
  return new NextRequest("https://aegyo.example.test/api/polls/monthly/vote", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ option: "a" }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.frozen.mockReturnValue(false);
  mocks.getPollSeed.mockReturnValue({ slug: "monthly", options: [{ key: "a" }] });
  mocks.optionOf.mockReturnValue(true);
  mocks.session.mockResolvedValue(null);
  mocks.newDeviceToken.mockReturnValue("device-token");
  mocks.hashIp.mockReturnValue(null);
  mocks.checkIpRate.mockResolvedValue(true);
  mocks.castVote.mockResolvedValue("a");
  mocks.getCounts.mockResolvedValue({ a: 1, b: 0, c: 0, d: 0 });
});

describe("anonymous poll writes during auth cutover", () => {
  it("returns retryable unavailable before poll state or device issuance", async () => {
    mocks.frozen.mockReturnValue(true);

    const response = await POST(request(), {
      params: Promise.resolve({ slug: "monthly" }),
    });

    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("60");
    expect(mocks.getPollSeed).not.toHaveBeenCalled();
    expect(mocks.session).not.toHaveBeenCalled();
    expect(mocks.newDeviceToken).not.toHaveBeenCalled();
    expect(mocks.checkIpRate).not.toHaveBeenCalled();
    expect(mocks.castVote).not.toHaveBeenCalled();
    expect(mocks.getCounts).not.toHaveBeenCalled();
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("preserves anonymous voting when the freeze is absent", async () => {
    const response = await POST(request(), {
      params: Promise.resolve({ slug: "monthly" }),
    });

    expect(response.status).toBe(200);
    expect(mocks.castVote).toHaveBeenCalledWith(
      "monthly",
      "a",
      expect.objectContaining({ voterRef: "device-token", voterType: "device" }),
    );
    expect(response.headers.get("set-cookie")).toContain("aa_vid=device-token");
  });
});
