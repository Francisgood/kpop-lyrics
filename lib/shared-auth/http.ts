import { NextResponse } from "next/server";
import { beginAuthorization } from "./provider";
import { sealTransaction } from "./transaction";
import { SESSION_TTL_SECONDS, type SharedAuthConfig } from "./config";
export const TX_COOKIE = "__Host-aegyo_oidc_tx";
export const SESSION_COOKIE = "session";
const secure = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
};
export async function authorizationRedirect(
  config: SharedAuthConfig,
  input: {
    maxAgeSeconds: number;
    reauthenticationAttempt: 0 | 1;
    nowMs?: number;
  },
) {
  const auth = await beginAuthorization(config, input);
  const response = NextResponse.redirect(auth.url);
  response.cookies.set({
    name: TX_COOKIE,
    value: sealTransaction(auth.transaction, config.transactionSecret),
    ...secure,
    maxAge: 600,
  });
  return response;
}
export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    ...secure,
    maxAge: SESSION_TTL_SECONDS,
  });
}
export function clearCookies(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    ...secure,
    maxAge: 0,
  });
  response.cookies.set({ name: TX_COOKIE, value: "", ...secure, maxAge: 0 });
}
export function clearTransaction(response: NextResponse) {
  response.cookies.set({ name: TX_COOKIE, value: "", ...secure, maxAge: 0 });
}
