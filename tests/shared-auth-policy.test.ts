import { describe, expect, it } from "vitest";
import { getSharedAuthConfig, sharedAuthEnabled, PROVIDER_STATE_MAX_AGE_MS } from "../lib/shared-auth/config";
import { evaluateFreshness } from "../lib/shared-auth/freshness";
import { parseProviderSecurityState, stateAllowsSession } from "../lib/shared-auth/security-state";
const reset = { version: 1 as const, kind: "database" as const, lastPasswordReset: null };
const env = { AEGYO_SHARED_AUTH_ENABLED: "true", AEGYO_AUTH_BASE_URL: "https://accounts.example.test", AEGYO_APP_ORIGIN: "https://aegyo.example.test", AEGYO_AUTH_CLIENT_ID: "aegyo", AEGYO_AUTH_CLIENT_SECRET: "secret", AEGYO_AUTH_TRANSACTION_SECRET: "x".repeat(32), AEGYO_AUTH_STATE_READER_KEY: "reader" };
describe("shared auth policy", () => {
 it("is disabled by default and rejects partial or non-origin config", () => {
  expect(sharedAuthEnabled({})).toBe(false); expect(getSharedAuthConfig({})).toBeNull();
  expect(getSharedAuthConfig({ ...env, AEGYO_APP_ORIGIN: "https://aegyo.example.test/callback" })).toBeNull();
  expect(getSharedAuthConfig({ ...env, AEGYO_AUTH_BASE_URL: "ftp://localhost" })).toBeNull();
 });
 it("uses the Accounts issuer and a 30 second absolute state bound", () => {
  expect(getSharedAuthConfig(env)).toMatchObject({ issuer: "https://accounts.example.test/api/auth", appOrigin: "https://aegyo.example.test" });
  expect(PROVIDER_STATE_MAX_AGE_MS).toBe(30_000);
 });
 it("rejects inactive, mismatched, malformed, and stale provider state", () => {
  const state = { version: 1 as const, subject: "sub-1", providerSessionId: "sid-1", active: true, passwordResetState: reset, operatorCutoff: null, securityVersion: 4, passwordResetAt: null };
  expect(parseProviderSecurityState({ ...state, securityVersion: "4" })).toBeNull();
  const session = { user: { sharedIdentity: { subject: "sub-1" } }, providerSessionId: "sid-1", authenticatedAt: new Date("2026-09-11T12:00:00Z"), securityVersion: 4, passwordResetAt: null };
  expect(stateAllowsSession(session, state, Date.parse("2026-09-11T12:00:01Z"))).toBe(true);
  expect(stateAllowsSession(session, { ...state, active: false }, Date.parse("2026-09-11T12:00:01Z"))).toBe(false);
  expect(stateAllowsSession(session, { ...state, securityVersion: 5 }, Date.parse("2026-09-11T12:00:01Z"))).toBe(false);
  expect(stateAllowsSession(session, { ...state, passwordResetState: { ...reset, lastPasswordReset: "2026-09-11T11:00:00.000Z" } }, Date.parse("2026-09-11T12:00:01Z"))).toBe(false);
 });
 it("permits only one bounded fresh-auth retry after reset", () => {
  const common = { authTime: Date.parse("2026-09-11T12:00:00Z") / 1000, resetState: { ...reset, lastPasswordReset: "2026-09-11T12:00:00.500Z" }, operatorCutoffMs: null, nowMs: Date.parse("2026-09-11T12:00:02Z") };
  expect(evaluateFreshness({ ...common, transaction: { requestedAtMs: Date.parse("2026-09-11T12:00:01Z"), maxAgeSeconds: 3600, reauthenticationAttempt: 0 } }).kind).toBe("reauthenticate");
  expect(evaluateFreshness({ ...common, transaction: { requestedAtMs: Date.parse("2026-09-11T12:00:01Z"), maxAgeSeconds: 0, reauthenticationAttempt: 1 } })).toMatchObject({ kind: "deny", reason: "reauthentication_failed" });
 });
});
