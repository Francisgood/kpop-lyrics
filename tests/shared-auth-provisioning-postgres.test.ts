import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "../lib/prisma";
import {
  createSharedSession,
  EXTERNAL_PASSWORD_SENTINEL,
} from "../lib/shared-auth/session";

const enabled = process.env.AEGYO_PROVISIONING_POSTGRES_PROOF === "1";
const issuer = "https://accounts.example.test/api/auth";
const resetState = {
  version: 1 as const,
  kind: "database" as const,
  lastPasswordReset: null,
};
function input(subject: string, email: string) {
  return {
    issuer,
    subject,
    email,
    emailVerified: true,
    name: "Synthetic member",
    picture: null,
    providerSessionId: `sid-${randomUUID()}`,
    authenticatedAtMs: Date.now(),
    securityVersion: 1,
    resetState,
  };
}

describe.runIf(enabled)("shared provisioning on disposable PostgreSQL", () => {
  afterAll(async () => prisma.$disconnect());

  it("creates one user and identity but two valid sessions for simultaneous callbacks", async () => {
    const subject = `same-${randomUUID()}`;
    const email = `same-${randomUUID()}@example.invalid`;
    const sessions = await Promise.all([
      createSharedSession(input(subject, email)),
      createSharedSession(input(subject, email.toUpperCase())),
    ]);
    const identity = await prisma.sharedAuthIdentity.findUniqueOrThrow({
      where: { issuer_subject: { issuer, subject } },
      include: { user: true },
    });
    expect(identity.user.passwordHash).toBe(EXTERNAL_PASSWORD_SENTINEL);
    expect(
      await prisma.user.count({ where: { email: email.toLowerCase() } }),
    ).toBe(1);
    expect(
      await prisma.session.count({
        where: {
          userId: identity.userId,
          token: { in: sessions.map(({ token }) => token) },
          providerSessionId: { not: null },
        },
      }),
    ).toBe(2);
  });

  it("allows one winner for different subjects sharing a normalized email", async () => {
    const email = `contested-${randomUUID()}@example.invalid`;
    const results = await Promise.allSettled([
      createSharedSession(input(`first-${randomUUID()}`, email)),
      createSharedSession(input(`second-${randomUUID()}`, email.toUpperCase())),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(
      1,
    );
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(
      1,
    );
    expect(
      await prisma.user.count({ where: { email: email.toLowerCase() } }),
    ).toBe(1);
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: email.toLowerCase() },
      include: { sharedIdentity: true },
    });
    expect(user.sharedIdentity).not.toBeNull();
  });

  it("leaves a mixed-case legacy email and its lack of mapping unchanged", async () => {
    const id = `legacy-${randomUUID()}`;
    const email = `Legacy-${randomUUID()}@Example.Invalid`;
    await prisma.$executeRaw`
      INSERT INTO "User" ("id", "email", "passwordHash", "role")
      VALUES (${id}, ${email}, ${"a".repeat(64)}, 'moderator')
    `;
    await expect(
      createSharedSession(input(`legacy-sub-${randomUUID()}`, email.toLowerCase())),
    ).rejects.toThrow("local_email_collision");
    const rows = await prisma.$queryRaw<
      Array<{ email: string; passwordHash: string; role: string }>
    >`SELECT "email", "passwordHash", "role" FROM "User" WHERE "id" = ${id}`;
    expect(rows).toEqual([
      { email, passwordHash: "a".repeat(64), role: "moderator" },
    ]);
    expect(
      await prisma.sharedAuthIdentity.count({ where: { userId: id } }),
    ).toBe(0);
  });
});
