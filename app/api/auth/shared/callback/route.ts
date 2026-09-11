import { NextRequest, NextResponse } from "next/server";
import { resolveAuthMode } from "@/lib/shared-auth/mode";
import { authorizationRedirect, clearTransaction, setSessionCookie, TX_COOKIE } from "@/lib/shared-auth/http";
import { finishAuthorization } from "@/lib/shared-auth/provider";
import { fetchProviderSecurityState } from "@/lib/shared-auth/security-state";
import { evaluateFreshness, parseResetInstant, type ResetState } from "@/lib/shared-auth/freshness";
import { createMappedSession } from "@/lib/shared-auth/session";
import { openTransaction } from "@/lib/shared-auth/transaction";
import { canonicalRequestUrl } from "@/lib/shared-auth/request-url";
function fail(code: string, status = 400) { const response = NextResponse.json({ code }, { status }); clearTransaction(response); return response; }
function resetMatches(claim: unknown, current: ResetState) { if (!claim || typeof claim !== "object" || Array.isArray(claim)) return false; const value = claim as Record<string, unknown>; return value.version === 1 && value.kind === "database" && value.lastPasswordReset === current.lastPasswordReset; }
export async function GET(request: NextRequest) {
  const mode = await resolveAuthMode(); if (mode.kind !== "shared") return NextResponse.json({ code: mode.kind === "legacy" ? "not_found" : "service_unavailable" }, { status: mode.kind === "legacy" ? 404 : 503 }); const config = mode.config;
  const callbackUrl = canonicalRequestUrl(request, config.appOrigin); if (!callbackUrl || callbackUrl.origin !== config.appOrigin || callbackUrl.pathname !== "/api/auth/shared/callback") return fail("invalid_callback_url");
  const tx = openTransaction(request.cookies.get(TX_COOKIE)?.value, config.transactionSecret); if (!tx) return fail("invalid_authorization_transaction");
  try {
    const identity = await finishAuthorization(config, callbackUrl, tx);
    if (identity.issuer !== config.issuer || !Number.isSafeInteger(identity.securityVersion) || (identity.securityVersion as number) < 0) return fail("invalid_identity_claims");
    const stateResult = await fetchProviderSecurityState(config, identity.subject, identity.providerSessionId);
    if (stateResult.kind === "unavailable") return fail("identity_provider_unavailable", 503);
    if (stateResult.kind !== "ok") return fail("invalid_provider_security_state");
    const state = stateResult.state;
    const decision = evaluateFreshness({ authTime: identity.authTime, resetState: state.passwordResetState, operatorCutoffMs: state.operatorCutoff === null ? null : parseResetInstant(state.operatorCutoff), transaction: tx, nowMs: Date.now() });
    const signedMatches = identity.securityVersion === state.securityVersion && identity.operatorCutoff === state.operatorCutoff && resetMatches(identity.resetState, state.passwordResetState);
    if (!state.active || state.subject !== identity.subject || state.providerSessionId !== identity.providerSessionId || !signedMatches || decision.kind === "reauthenticate") {
      if (tx.reauthenticationAttempt === 1) return fail("reauthentication_failed");
      const notBeforeMs = decision.kind === "reauthenticate" ? decision.notBeforeMs : Date.now(); const waitMs = Math.max(0, notBeforeMs - Date.now()); if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
      return authorizationRedirect(config, { maxAgeSeconds: 0, reauthenticationAttempt: 1, nowMs: Math.max(Date.now(), notBeforeMs) });
    }
    if (decision.kind !== "allow") return fail(decision.reason);
    const created = await createMappedSession({ issuer: identity.issuer, subject: identity.subject, providerSessionId: identity.providerSessionId, authenticatedAtMs: decision.authenticatedAtMs, securityVersion: state.securityVersion, resetState: state.passwordResetState });
    const response = NextResponse.redirect(new URL("/", config.appOrigin)); clearTransaction(response); setSessionCookie(response, created.token); return response;
  } catch (error) { return fail(error instanceof Error && error.message === "unmapped_identity" ? "account_not_mapped" : "authorization_failed", error instanceof Error && error.message === "unmapped_identity" ? 403 : 400); }
}
