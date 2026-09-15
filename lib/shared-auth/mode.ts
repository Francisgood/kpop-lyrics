import { prisma } from "@/lib/prisma";
import {
  getSharedAuthConfig,
  sharedAuthEnabled,
  type SharedAuthConfig,
} from "./config";

export const ACCOUNTS_CUTOVER_LATCH_ID = "accounts-shared-auth-v1";
export function authCutoverFrozen() {
  return process.env.AEGYO_AUTH_CUTOVER_FREEZE === "true";
}

export type AuthMode =
  | { kind: "legacy" }
  | { kind: "shared"; config: SharedAuthConfig }
  | {
      kind: "closed";
      reason:
        | "cutover_freeze"
        | "latched_flag_off"
        | "missing_latch"
        | "invalid_config"
        | "state_unavailable";
    };

export async function resolveAuthMode(): Promise<AuthMode> {
  if (authCutoverFrozen())
    return { kind: "closed", reason: "cutover_freeze" };

  let latch: { id: string } | null;
  try {
    latch = await prisma.authCutoverLatch.findUnique({
      where: { id: ACCOUNTS_CUTOVER_LATCH_ID },
      select: { id: true },
    });
  } catch {
    return { kind: "closed", reason: "state_unavailable" };
  }
  if (!sharedAuthEnabled())
    return latch
      ? { kind: "closed", reason: "latched_flag_off" }
      : { kind: "legacy" };
  const config = getSharedAuthConfig();
  if (!config) return { kind: "closed", reason: "invalid_config" };
  if (!latch) return { kind: "closed", reason: "missing_latch" };
  return { kind: "shared", config };
}
