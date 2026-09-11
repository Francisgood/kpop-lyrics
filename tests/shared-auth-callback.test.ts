import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { sealTransaction } from "../lib/shared-auth/transaction";
const mocks = vi.hoisted(() => ({ finish: vi.fn(), state: vi.fn(), create: vi.fn(), redirect: vi.fn() }));
vi.mock("../lib/shared-auth/provider", () => ({ finishAuthorization: mocks.finish }));
vi.mock("../lib/shared-auth/security-state", () => ({ fetchProviderSecurityState: mocks.state }));
vi.mock("../lib/shared-auth/session", () => ({ createMappedSession: mocks.create }));
vi.mock("../lib/shared-auth/http", async (original) => ({ ...(await original<typeof import("../lib/shared-auth/http")>()), authorizationRedirect: mocks.redirect }));
import { GET } from "../app/api/auth/shared/callback/route";
const secret = "x".repeat(32); const origin = "https://aegyo.example.test";
const tx = { state: "state-state-state", nonce: "nonce-nonce-nonce", codeVerifier: "v".repeat(43), requestedAtMs: Date.now(), maxAgeSeconds: 3600, reauthenticationAttempt: 0 as const };
const reset = { version: 1 as const, kind: "database" as const, lastPasswordReset: null };
function request(path = "/api/auth/shared/callback?code=c&state=state-state-state") { return new NextRequest(`${origin}${path}`, { headers: { cookie: `__Host-aegyo_oidc_tx=${sealTransaction(tx, secret)}` } }); }
beforeEach(() => {
 vi.clearAllMocks(); process.env.AEGYO_SHARED_AUTH_ENABLED="true"; process.env.AEGYO_AUTH_BASE_URL="https://accounts.example.test"; process.env.AEGYO_APP_ORIGIN=origin; process.env.AEGYO_AUTH_CLIENT_ID="aegyo"; process.env.AEGYO_AUTH_CLIENT_SECRET="secret"; process.env.AEGYO_AUTH_TRANSACTION_SECRET=secret; process.env.AEGYO_AUTH_STATE_READER_KEY="reader";
 mocks.finish.mockResolvedValue({ issuer:"https://accounts.example.test/api/auth", subject:"sub", providerSessionId:"sid", email:"same@example.test", name:null, picture:null, authTime:Math.floor(Date.now()/1000), resetState:reset, securityVersion:2, operatorCutoff:null });
 mocks.redirect.mockResolvedValue(NextResponse.redirect(`${origin}/api/auth/shared/login`));
});
describe("shared callback", () => {
 it("rejects adjacent callback paths before token exchange", async () => { const response=await GET(request("/api/auth/shared/callback/extra?code=c")); expect(response.status).toBe(400); expect(mocks.finish).not.toHaveBeenCalled(); });
 it("does not mint when a signed token was revoked before callback", async () => { mocks.state.mockResolvedValue({ kind:"ok", state:{ version:1, subject:"sub", providerSessionId:"sid", active:false, passwordResetState:reset, operatorCutoff:null, securityVersion:3 } }); const response=await GET(request()); expect(response.status).toBe(307); expect(mocks.redirect).toHaveBeenCalledTimes(1); expect(mocks.create).not.toHaveBeenCalled(); });
 it("fails closed and never mints when provider state is unavailable", async () => { mocks.state.mockResolvedValue({kind:"unavailable"}); const response=await GET(request()); expect(response.status).toBe(503); expect(mocks.create).not.toHaveBeenCalled(); });
});
