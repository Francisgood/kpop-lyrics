import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  identity: vi.fn(),
  queryRaw: vi.fn(),
  create: vi.fn(),
  createUser: vi.fn(),
  transaction: vi.fn(),
  findSession: vi.fn(),
  update: vi.fn(),
  deleteMany: vi.fn(),
  fetchState: vi.fn(),
}));
vi.mock("../lib/prisma", () => ({
  prisma: {
    $transaction: mocks.transaction,
    session: {
      findUnique: mocks.findSession,
      update: mocks.update,
      deleteMany: mocks.deleteMany,
    },
    sharedAuthIdentity: { findUnique: mocks.identity },
  },
}));
vi.mock("../lib/shared-auth/security-state", async (original) => ({
  ...(await original<typeof import("../lib/shared-auth/security-state")>()),
  fetchProviderSecurityState: mocks.fetchState,
}));
import {
  authorizeSharedSession,
  createSharedSession,
  EXTERNAL_PASSWORD_SENTINEL,
} from "../lib/shared-auth/session";
const config = {
  providerBaseUrl: "https://accounts.example.test",
  issuer: "https://accounts.example.test/api/auth",
  clientId: "a",
  clientSecret: "b",
  appOrigin: "https://aegyo.example.test",
  transactionSecret: "x".repeat(32),
  stateReaderKey: "reader",
};
const reset = {
  version: 1 as const,
  kind: "database" as const,
  lastPasswordReset: null,
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.transaction.mockImplementation((fn) =>
    fn({
      sharedAuthIdentity: { findUnique: mocks.identity },
      user: { create: mocks.createUser },
      $queryRaw: mocks.queryRaw,
      session: { create: mocks.create },
    }),
  );
});
describe("mapped local identity and sessions", () => {
  it("preserves the explicitly mapped stable local user ID and never maps by email", async () => {
    mocks.identity.mockResolvedValue({
      userId: "stable-user-7",
      user: { id: "stable-user-7", email: "old@example.test" },
    });
    mocks.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: "session", ...data }),
    );
    const result = await createSharedSession({
      issuer: config.issuer,
      subject: "provider-sub",
      email: "changed@example.test",
      emailVerified: true,
      name: "Changed name",
      picture: "https://example.test/changed.png",
      providerSessionId: "sid",
      authenticatedAtMs: Date.now(),
      securityVersion: 1,
      resetState: reset,
    });
    expect(mocks.queryRaw).not.toHaveBeenCalled();
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "stable-user-7" }),
      }),
    );
    expect(result.session.userId).toBe("stable-user-7");
  });
  it("refuses an existing normalized local email without claiming it", async () => {
    mocks.identity.mockResolvedValue(null);
    mocks.queryRaw.mockResolvedValue([{ id: "must-not-claim" }]);
    await expect(
      createSharedSession({
        issuer: config.issuer,
        subject: "new-sub",
        email: "SAME@example.test",
        emailVerified: true,
        name: null,
        picture: null,
        providerSessionId: "sid",
        authenticatedAtMs: Date.now(),
        securityVersion: 1,
        resetState: reset,
      }),
    ).rejects.toThrow("local_email_collision");
    expect(mocks.queryRaw).toHaveBeenCalledOnce();
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("creates and maps one new user from a verified provider email without newsletter side effects", async () => {
    mocks.identity.mockResolvedValue(null);
    mocks.queryRaw.mockResolvedValue([]);
    mocks.createUser.mockResolvedValue({ id: "new-local" });
    mocks.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: "session", ...data }),
    );
    const result = await createSharedSession({
      issuer: config.issuer,
      subject: "new-sub",
      email: " New.User@Example.test ",
      emailVerified: true,
      name: " New User ",
      picture: "https://images.example.test/avatar.png",
      providerSessionId: "sid",
      authenticatedAtMs: Date.now(),
      securityVersion: 1,
      resetState: reset,
    });
    expect(mocks.createUser).toHaveBeenCalledOnce();
    expect(mocks.createUser).toHaveBeenCalledWith({
      data: {
        email: "new.user@example.test",
        displayName: "New User",
        avatarUrl: "https://images.example.test/avatar.png",
        passwordHash: EXTERNAL_PASSWORD_SENTINEL,
        emailVerified: true,
        sharedIdentity: {
          create: { issuer: config.issuer, subject: "new-sub" },
        },
      },
      select: { id: true },
    });
    expect(result.session.userId).toBe("new-local");
  });
  it("refuses provisioning without a verified usable provider email", async () => {
    mocks.identity.mockResolvedValue(null);
    for (const email of [null, "bad-address"]) {
      await expect(
        createSharedSession({
          issuer: config.issuer,
          subject: "new-sub",
          email,
          emailVerified: email !== null,
          name: null,
          picture: null,
          providerSessionId: "sid",
          authenticatedAtMs: Date.now(),
          securityVersion: 1,
          resetState: reset,
        }),
      ).rejects.toThrow("verified_email_required");
    }
    expect(mocks.queryRaw).not.toHaveBeenCalled();
    expect(mocks.createUser).not.toHaveBeenCalled();
  });
  it("resolves a same-subject provisioning race through the winning explicit mapping", async () => {
    mocks.identity
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ userId: "race-winner" });
    mocks.queryRaw.mockResolvedValue([]);
    mocks.createUser.mockRejectedValue({ code: "P2002" });
    mocks.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: "session", ...data }),
    );
    const result = await createSharedSession({
      issuer: config.issuer,
      subject: "racing-sub",
      email: "race@example.test",
      emailVerified: true,
      name: null,
      picture: null,
      providerSessionId: "sid",
      authenticatedAtMs: Date.now(),
      securityVersion: 1,
      resetState: reset,
    });
    expect(mocks.createUser).toHaveBeenCalledOnce();
    expect(mocks.create).toHaveBeenCalledOnce();
    expect(result.session.userId).toBe("race-winner");
  });
  it("does not convert a different-subject email race into a mapping", async () => {
    mocks.identity.mockResolvedValue(null);
    mocks.queryRaw.mockResolvedValue([]);
    mocks.createUser.mockRejectedValue({ code: "P2002" });
    await expect(
      createSharedSession({
        issuer: config.issuer,
        subject: "losing-sub",
        email: "race@example.test",
        emailVerified: true,
        name: null,
        picture: null,
        providerSessionId: "sid",
        authenticatedAtMs: Date.now(),
        securityVersion: 1,
        resetState: reset,
      }),
    ).rejects.toThrow("local_email_collision");
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("revocation winning the access race deletes the local shared session", async () => {
    const session = {
      id: "local-session",
      token: "token",
      expiresAt: new Date(Date.now() + 60_000),
      providerSessionId: "sid",
      authenticatedAt: new Date(),
      providerCheckedAt: new Date(0),
      securityVersion: 2,
      passwordResetAt: null,
      user: {
        id: "stable",
        sharedIdentity: { issuer: config.issuer, subject: "sub" },
      },
    };
    mocks.findSession.mockResolvedValue(session);
    mocks.fetchState.mockResolvedValue({
      kind: "ok",
      state: {
        version: 1,
        subject: "sub",
        providerSessionId: "sid",
        active: false,
        passwordResetState: reset,
        operatorCutoff: null,
        securityVersion: 3,
      },
    });
    await expect(
      authorizeSharedSession("token", config, { sensitive: true }),
    ).resolves.toEqual({ kind: "invalid" });
    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: { token: "token" },
    });
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("rejects a cached session mapped under a different issuer", async () => {
    mocks.findSession.mockResolvedValue({
      id: "s",
      expiresAt: new Date(Date.now() + 60_000),
      providerSessionId: "sid",
      authenticatedAt: new Date(),
      providerCheckedAt: new Date(),
      securityVersion: 2,
      passwordResetAt: null,
      user: {
        sharedIdentity: {
          issuer: "https://old.example.test/api/auth",
          subject: "sub",
        },
      },
    });
    await expect(
      authorizeSharedSession("token", config, { sensitive: false }),
    ).resolves.toEqual({ kind: "invalid" });
    expect(mocks.fetchState).not.toHaveBeenCalled();
  });
  it("fails closed without deleting the session during a provider outage", async () => {
    mocks.findSession.mockResolvedValue({
      id: "s",
      expiresAt: new Date(Date.now() + 60_000),
      providerSessionId: "sid",
      authenticatedAt: new Date(),
      providerCheckedAt: new Date(0),
      securityVersion: 2,
      passwordResetAt: null,
      user: { sharedIdentity: { issuer: config.issuer, subject: "sub" } },
    });
    mocks.fetchState.mockResolvedValue({ kind: "unavailable" });
    await expect(
      authorizeSharedSession("token", config, { sensitive: true }),
    ).resolves.toEqual({ kind: "unavailable" });
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.deleteMany).not.toHaveBeenCalled();
  });
});
