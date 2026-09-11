import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  findUser: vi.fn(),
  createUser: vi.fn(),
  createSession: vi.fn(),
}));
vi.mock("../lib/shared-auth/mode", () => ({
  resolveAuthMode: vi.fn(async () => ({ kind: "shared", config: {} })),
}));
vi.mock("../lib/prisma", () => ({
  prisma: {
    user: { findUnique: mocks.findUser, create: mocks.createUser },
    session: { create: mocks.createSession },
  },
}));
import { POST as login } from "../app/api/auth/login/route";
import { POST as signup } from "../app/api/auth/signup/route";
beforeEach(() => {
  vi.clearAllMocks();
  process.env.AEGYO_SHARED_AUTH_ENABLED = "true";
});
describe("flag-on credential cutover", () => {
  it.each([
    ["login", login],
    ["signup", signup],
  ] as const)(
    "closes legacy %s before any database write",
    async (_name, handler) => {
      const response = await handler(
        new Request("https://aegyo.example.test", {
          method: "POST",
          body: "{}",
        }) as never,
      );
      expect(response.status).toBe(409);
      expect(await response.json()).toMatchObject({
        redirect: "/api/auth/shared/login",
      });
      expect(mocks.findUser).not.toHaveBeenCalled();
      expect(mocks.createUser).not.toHaveBeenCalled();
      expect(mocks.createSession).not.toHaveBeenCalled();
    },
  );
});
