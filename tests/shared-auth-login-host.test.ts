import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const mocks = vi.hoisted(() => ({
  mode: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("../lib/shared-auth/mode", () => ({ resolveAuthMode: mocks.mode }));
vi.mock("../lib/shared-auth/http", () => ({
  authorizationRedirect: mocks.redirect,
}));

import { GET } from "../app/api/auth/shared/login/route";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.mode.mockResolvedValue({
    kind: "shared",
    config: { appOrigin: "https://aegyo.example.test" },
  });
  mocks.redirect.mockResolvedValue(
    NextResponse.redirect("https://accounts.example.test/sign-in"),
  );
});

describe("shared login host", () => {
  it("moves a www visitor to the callback host before starting OAuth", async () => {
    const response = await GET(
      new NextRequest("https://www.aegyo.example.test/api/auth/shared/login"),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://aegyo.example.test/api/auth/shared/login",
    );
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("starts OAuth directly on the callback host", async () => {
    const response = await GET(
      new NextRequest("https://aegyo.example.test/api/auth/shared/login"),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://accounts.example.test/sign-in",
    );
    expect(mocks.redirect).toHaveBeenCalledOnce();
  });
});
