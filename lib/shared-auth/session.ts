import { prisma } from "@/lib/prisma";
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
// Reserved for a future reviewed provisioning job. No password input can hash to it.
export const EXTERNAL_PASSWORD_SENTINEL = "!shared-auth-only!";
export async function createMappedSession(input: {
  issuer: string;
  subject: string;
  providerSessionId: string;
  authenticatedAtMs: number;
  securityVersion: number;
  resetState: ResetState;
}) {
  return prisma.$transaction(async (tx) => {
    const identity = await tx.sharedAuthIdentity.findUnique({
      where: {
        issuer_subject: { issuer: input.issuer, subject: input.subject },
      },
      include: { user: true },
    });
    if (!identity) throw new Error("unmapped_identity");
    const token = generateToken();
    const now = new Date();
    const session = await tx.session.create({
      data: {
        userId: identity.userId,
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
  });
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
