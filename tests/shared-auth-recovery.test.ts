import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ mode: vi.fn() }));
vi.mock("../lib/shared-auth/mode", () => ({ resolveAuthMode: mocks.mode }));
import { GET } from "../app/api/auth/recovery/route";
describe("password recovery cutover", () => {
  it("keeps the legacy recovery page before cutover", async () => {
    mocks.mode.mockResolvedValue({ kind: "legacy" });
    const response = await GET(
      new NextRequest("https://aegyo.example.test/api/auth/recovery"),
    );
    expect(response.headers.get("location")).toBe(
      "https://aegyo.example.test/forgot-password",
    );
  });
  it("enters the signed provider continuation in shared mode", async () => {
    mocks.mode.mockResolvedValue({
      kind: "shared",
      config: { appOrigin: "https://aegyo.example.test" },
    });
    const response = await GET(
      new NextRequest("https://aegyo.example.test/api/auth/recovery"),
    );
    expect(response.headers.get("location")).toBe(
      "https://aegyo.example.test/api/auth/shared/login",
    );
  });
  it("shows a recoverable outage instead of reviving legacy recovery", async () => {
    mocks.mode.mockResolvedValue({
      kind: "closed",
      reason: "latched_flag_off",
    });
    expect(
      (
        await GET(
          new NextRequest("https://aegyo.example.test/api/auth/recovery"),
        )
      ).status,
    ).toBe(503);
  });
});
