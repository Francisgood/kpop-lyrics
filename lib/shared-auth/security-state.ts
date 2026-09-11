import type { SharedAuthConfig } from "./config";
import { evaluateFreshness, parseResetInstant, type ResetState } from "./freshness";
export type ProviderSecurityState = { version: 1; subject: string; providerSessionId: string; active: boolean; passwordResetState: ResetState; operatorCutoff: string | null; securityVersion: number };
export type StateResult = { kind: "ok"; state: ProviderSecurityState } | { kind: "invalid" } | { kind: "unavailable" };
export function parseProviderSecurityState(value: unknown): ProviderSecurityState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>; const reset = row.passwordResetState as Record<string, unknown> | null;
  if (row.version !== 1 || typeof row.subject !== "string" || typeof row.providerSessionId !== "string" || typeof row.active !== "boolean" || !Number.isSafeInteger(row.securityVersion) || (row.securityVersion as number) < 0 || (row.operatorCutoff !== null && parseResetInstant(row.operatorCutoff) === null)) return null;
  if (!reset || reset.version !== 1 || reset.kind !== "database" || !Object.hasOwn(reset, "lastPasswordReset") || (reset.lastPasswordReset !== null && parseResetInstant(reset.lastPasswordReset) === null)) return null;
  return value as ProviderSecurityState;
}
export async function fetchProviderSecurityState(config: SharedAuthConfig, subject: string, providerSessionId: string): Promise<StateResult> {
  try {
    const response = await fetch(`${config.providerBaseUrl}/api/internal/session-state`, { method: "POST", cache: "no-store", headers: { authorization: `Bearer ${config.stateReaderKey}`, "content-type": "application/json" }, body: JSON.stringify({ subject, providerSessionId }), redirect: "error", signal: AbortSignal.timeout(5000) });
    if (!response.ok) return { kind: response.status >= 500 ? "unavailable" : "invalid" };
    const state = parseProviderSecurityState(await response.json().catch(() => null));
    return state ? { kind: "ok", state } : { kind: "invalid" };
  } catch { return { kind: "unavailable" }; }
}
export function stateAllowsSession(session: { user: { sharedIdentity: { subject: string } | null }; providerSessionId: string | null; authenticatedAt: Date | null; securityVersion: number | null; passwordResetAt: Date | null }, state: ProviderSecurityState, nowMs = Date.now()) {
  const currentResetMs = state.passwordResetState.lastPasswordReset === null ? null : parseResetInstant(state.passwordResetState.lastPasswordReset);
  if (!session.user.sharedIdentity || !session.providerSessionId || !session.authenticatedAt || session.securityVersion === null || !state.active || state.subject !== session.user.sharedIdentity.subject || state.providerSessionId !== session.providerSessionId || state.securityVersion !== session.securityVersion) return false;
  if ((session.passwordResetAt?.getTime() ?? null) !== currentResetMs) return false;
  return evaluateFreshness({ authTime: session.authenticatedAt.getTime() / 1000, resetState: state.passwordResetState, operatorCutoffMs: state.operatorCutoff === null ? null : parseResetInstant(state.operatorCutoff), transaction: { requestedAtMs: session.authenticatedAt.getTime(), maxAgeSeconds: 0, reauthenticationAttempt: 1 }, nowMs }).kind === "allow";
}
