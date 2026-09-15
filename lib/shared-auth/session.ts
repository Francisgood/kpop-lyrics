import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { generateToken } from "@/lib/auth";
import {
  PROVIDER_STATE_MAX_AGE_MS,
  SESSION_TTL_SECONDS,
  type SharedAuthConfig,
} from "./config";
import {
  fetchProviderSecurityState,
  stateAllowsSession,
} from "./security-state";
import type { ResetState } from "./freshness";

export const sharedSessionInclude = {
  user: { include: { sharedIdentity: true } },
} as const;
// No password input can hash to this value because legacy hashes are lowercase hex.
export const EXTERNAL_PASSWORD_SENTINEL = "!shared-auth-only!";
type SessionInput = {
  issuer: string;
  subject: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  picture: string | null;
  providerSessionId: string;
  authenticatedAtMs: number;
  securityVersion: number;
  resetState: ResetState;
};
function normalizedVerifiedEmail(input: SessionInput): string | null {
  if (!input.emailVerified || input.email === null) return null;
  const email = input.email.trim().toLowerCase();
  return email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? email
    : null;
}
function isUniqueConflict(error: unknown) {
  return (
    !!error &&
    typeof error === "object" &&
    (error as { code?: unknown }).code === "P2002"
  );
}
async function createSessionForIdentity(
  tx: Prisma.TransactionClient,
  userId: string,
  input: SessionInput,
) {
  const token = generateToken();
  const now = new Date();
  const session = await tx.session.create({
    data: {
      userId,
      token,
      expiresAt: new Date(now.getTime() + SESSION_TTL_SECONDS * 1000),
      providerSessionId: input.providerSessionId,
      authenticatedAt: new Date(input.authenticatedAtMs),
      providerCheckedAt: now,
      securityVersion: input.securityVersion,
      passwordResetAt:
        input.resetState.lastPasswordReset === null
          ? null
          : new Date(input.resetState.lastPasswordReset),
    },
    include: { user: true },
  });
  return { token, session };
}
export async function createSharedSession(input: SessionInput) {
  const run = () =>
    prisma.$transaction(async (tx) => {
      const identity = await tx.sharedAuthIdentity.findUnique({
        where: {
          issuer_subject: { issuer: input.issuer, subject: input.subject },
        },
        select: { userId: true },
      });
      if (identity)
        return createSessionForIdentity(tx, identity.userId, input);

      const email = normalizedVerifiedEmail(input);
      if (!email) throw new Error("verified_email_required");
      const collisions = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT "id" FROM "User"
        WHERE lower(btrim("email")) = ${email}
        LIMIT 1
      `;
      if (collisions.length > 0) throw new Error("local_email_collision");
      const user = await tx.user.create({
        data: {
          email,
          displayName: input.name?.trim() || email.split("@")[0],
          avatarUrl: input.picture,
          passwordHash: EXTERNAL_PASSWORD_SENTINEL,
          emailVerified: true,
          sharedIdentity: {
            create: { issuer: input.issuer, subject: input.subject },
          },
        },
        select: { id: true },
      });
      return createSessionForIdentity(tx, user.id, input);
    });
  try {
    return await run();
  } catch (error) {
    if (!isUniqueConflict(error)) throw error;
    // A concurrent callback for this exact provider identity may have won.
    // Re-read only by issuer/sub; an email match never establishes ownership.
    const winner = await prisma.sharedAuthIdentity.findUnique({
      where: {
        issuer_subject: { issuer: input.issuer, subject: input.subject },
      },
      select: { userId: true },
    });
    if (!winner) throw new Error("local_email_collision");
    return prisma.$transaction((tx) =>
      createSessionForIdentity(tx, winner.userId, input),
    );
  }
}
export async function authorizeSharedSession(
  token: string,
  config: SharedAuthConfig,
  options: { sensitive: boolean },
  now = new Date(),
) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: sharedSessionInclude,
  });
  if (
    !session ||
    session.expiresAt <= now ||
    session.user.sharedIdentity?.issuer !== config.issuer ||
    !session.providerSessionId ||
    !session.authenticatedAt ||
    session.securityVersion === null ||
    !session.user.sharedIdentity
  )
    return { kind: "invalid" as const };
  if (
    !options.sensitive &&
    session.providerCheckedAt &&
    now.getTime() - session.providerCheckedAt.getTime() >= 0 &&
    now.getTime() - session.providerCheckedAt.getTime() <=
      PROVIDER_STATE_MAX_AGE_MS
  )
    return { kind: "allowed" as const, session };
  const result = await fetchProviderSecurityState(
    config,
    session.user.sharedIdentity.subject,
    session.providerSessionId,
  );
  if (result.kind !== "ok") return result;
  if (!stateAllowsSession(session, result.state, now.getTime())) {
    await prisma.session.deleteMany({ where: { token } });
    return { kind: "invalid" as const };
  }
  const refreshed = await prisma.session.update({
    where: { id: session.id },
    data: { providerCheckedAt: now },
    include: { user: true },
  });
  return { kind: "allowed" as const, session: refreshed };
}
