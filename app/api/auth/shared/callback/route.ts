import { NextRequest, NextResponse } from "next/server";
import { resolveAuthMode } from "@/lib/shared-auth/mode";
import {
  authorizationRedirect,
  clearTransaction,
  setSessionCookie,
  TX_COOKIE,
} from "@/lib/shared-auth/http";
import {
  finishAuthorization,
  isAuthenticationAgeError,
} from "@/lib/shared-auth/provider";
import { fetchProviderSecurityState } from "@/lib/shared-auth/security-state";
import {
  evaluateFreshness,
  parseResetInstant,
  type ResetState,
} from "@/lib/shared-auth/freshness";
import { createSharedSession } from "@/lib/shared-auth/session";
import { openTransaction } from "@/lib/shared-auth/transaction";
import { canonicalRequestUrl } from "@/lib/shared-auth/request-url";
function fail(code: string, status = 400, message?: string) {
  const response = NextResponse.json(
    message ? { code, message } : { code },
    { status },
  );
  clearTransaction(response);
  return response;
}
function provisioningFailure(
  code: string,
  status: number,
  title: string,
  message: string,
) {
  const response = new NextResponse(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;background:#17131f;color:#fff;font-family:system-ui,sans-serif"><main style="min-height:80vh;display:flex;align-items:center;justify-content:center;padding:48px 24px"><section style="max-width:440px;background:#241d30;border:8px solid #fff;border-radius:18px;padding:34px 30px;box-shadow:0 18px 50px rgba(0,0,0,.35)"><h1 style="margin:0 0 12px">${title}</h1><p style="line-height:1.55;color:#ddd">${message}</p><a href="/api/auth/shared/login" style="display:inline-block;margin-top:12px;color:#17131f;background:#ffd84d;border-radius:9px;padding:12px 16px;font-weight:700;text-decoration:none">Try Accounts sign-in again</a><p style="margin-top:18px"><a href="/" style="color:#ff9fbd">Return to Aegyo</a></p><small style="color:#aaa">Reference: ${code}</small></section></main></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } },
  );
  clearTransaction(response);
  return response;
}
function resetMatches(claim: unknown, current: ResetState) {
  if (!claim || typeof claim !== "object" || Array.isArray(claim)) return false;
  const value = claim as Record<string, unknown>;
  return (
    value.version === 1 &&
    value.kind === "database" &&
    value.lastPasswordReset === current.lastPasswordReset
  );
}
export async function GET(request: NextRequest) {
  const mode = await resolveAuthMode();
  if (mode.kind !== "shared")
    return NextResponse.json(
      { code: mode.kind === "legacy" ? "not_found" : "service_unavailable" },
      { status: mode.kind === "legacy" ? 404 : 503 },
    );
  const config = mode.config;
  const callbackUrl = canonicalRequestUrl(request, config.appOrigin);
  if (
    !callbackUrl ||
    callbackUrl.origin !== config.appOrigin ||
    callbackUrl.pathname !== "/api/auth/shared/callback"
  )
    return fail("invalid_callback_url");
  const tx = openTransaction(
    request.cookies.get(TX_COOKIE)?.value,
    config.transactionSecret,
  );
  if (!tx) return fail("invalid_authorization_transaction");
  try {
    const identity = await finishAuthorization(config, callbackUrl, tx);
    if (
      identity.issuer !== config.issuer ||
      !Number.isSafeInteger(identity.securityVersion) ||
      (identity.securityVersion as number) < 0
    )
      return fail("invalid_identity_claims");
    const stateResult = await fetchProviderSecurityState(
      config,
      identity.subject,
      identity.providerSessionId,
    );
    if (stateResult.kind === "unavailable")
      return fail("identity_provider_unavailable", 503);
    if (stateResult.kind !== "ok")
      return fail("invalid_provider_security_state");
    const state = stateResult.state;
    const decision = evaluateFreshness({
      authTime: identity.authTime,
      resetState: state.passwordResetState,
      operatorCutoffMs:
        state.operatorCutoff === null
          ? null
          : parseResetInstant(state.operatorCutoff),
      transaction: tx,
      nowMs: Date.now(),
    });
    const signedMatches =
      identity.securityVersion === state.securityVersion &&
      identity.operatorCutoff === state.operatorCutoff &&
      resetMatches(identity.resetState, state.passwordResetState);
    if (
      !state.active ||
      state.subject !== identity.subject ||
      state.providerSessionId !== identity.providerSessionId ||
      !signedMatches ||
      decision.kind === "reauthenticate"
    ) {
      if (tx.reauthenticationAttempt === 1)
        return fail("reauthentication_failed");
      const notBeforeMs =
        decision.kind === "reauthenticate" ? decision.notBeforeMs : Date.now();
      const waitMs = Math.max(0, notBeforeMs - Date.now());
      if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
      return await authorizationRedirect(config, {
        maxAgeSeconds: 0,
        reauthenticationAttempt: 1,
        nowMs: Math.max(Date.now(), notBeforeMs),
      });
    }
    if (decision.kind !== "allow") return fail(decision.reason);
    const created = await createSharedSession({
      issuer: identity.issuer,
      subject: identity.subject,
      email: identity.email,
      emailVerified: identity.emailVerified,
      name: identity.name,
      picture: identity.picture,
      providerSessionId: identity.providerSessionId,
      authenticatedAtMs: decision.authenticatedAtMs,
      securityVersion: state.securityVersion,
      resetState: state.passwordResetState,
    });
    const response = NextResponse.redirect(new URL("/", config.appOrigin));
    clearTransaction(response);
    setSessionCookie(response, created.token);
    return response;
  } catch (error) {
    if (isAuthenticationAgeError(error)) {
      if (tx.reauthenticationAttempt === 1)
        return fail("reauthentication_failed");
      try {
        return await authorizationRedirect(config, {
          maxAgeSeconds: 0,
          reauthenticationAttempt: 1,
        });
      } catch {
        return fail("identity_provider_unavailable", 503);
      }
    }
    if (error instanceof Error && error.message === "verified_email_required")
      return provisioningFailure(
        "verified_email_required",
        403,
        "Email verification required",
        "Verify your email in Accounts, then try signing in again.",
      );
    if (error instanceof Error && error.message === "local_email_collision")
      return provisioningFailure(
        "existing_account_requires_import_mapping",
        409,
        "Your existing Aegyo account needs linking",
        "This email already belongs to an Aegyo account. Ask support to import its Accounts mapping; no account data was changed.",
      );
    return fail("authorization_failed");
  }
}
