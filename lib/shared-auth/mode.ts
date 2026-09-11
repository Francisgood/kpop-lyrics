import { prisma } from "@/lib/prisma";
import { getSharedAuthConfig, sharedAuthEnabled, type SharedAuthConfig } from "./config";

export const ACCOUNTS_CUTOVER_LATCH_ID = "accounts-shared-auth-v1";
export type AuthMode =
  | { kind: "legacy" }
  | { kind: "shared"; config: SharedAuthConfig }
  | { kind: "closed"; reason: "latched_flag_off" | "missing_latch" | "invalid_config" | "state_unavailable" };

export async function resolveAuthMode(): Promise<AuthMode> {
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
    return latch ? { kind: "closed", reason: "latched_flag_off" } : { kind: "legacy" };
  const config = getSharedAuthConfig();
  if (!config) return { kind: "closed", reason: "invalid_config" };
  if (!latch) return { kind: "closed", reason: "missing_latch" };
  return { kind: "shared", config };
}
