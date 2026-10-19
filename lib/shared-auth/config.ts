export const NORMAL_MAX_AGE_SECONDS = 3600;
export const PROVIDER_STATE_MAX_AGE_MS = 30_000;
// Session lifetimes, fixed at creation (owner policy, October 19, 2026).
// The client is a convenience signal from /api/auth/shared/login?client=mobile,
// not a security boundary: anyone may request the mobile lifetime for their
// own account. Revocation still applies through provider session-state checks.
export const WEB_SESSION_TTL_SECONDS = 24 * 60 * 60;
export const MOBILE_SESSION_TTL_SECONDS = 90 * 24 * 60 * 60;
export type SessionClient = "web" | "mobile";
/** Exactly "mobile" selects the mobile client; anything else is web. */
export function parseSessionClient(value: unknown): SessionClient {
  return value === "mobile" ? "mobile" : "web";
}
export function sessionTtlSeconds(client: SessionClient): number {
  return client === "mobile"
    ? MOBILE_SESSION_TTL_SECONDS
    : WEB_SESSION_TTL_SECONDS;
}

export type SharedAuthConfig = {
  providerBaseUrl: string;
  issuer: string;
  clientId: string;
  clientSecret: string;
  appOrigin: string;
  transactionSecret: string;
  stateReaderKey: string;
};
type Env = Readonly<Record<string, string | undefined>>;
export const sharedAuthEnabled = (env: Env = process.env) =>
  env.AEGYO_SHARED_AUTH_ENABLED === "true";

function origin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      return null;
    if (
      url.protocol !== "https:" &&
      !(url.protocol === "http:" && url.hostname === "localhost")
    )
      return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getSharedAuthConfig(
  env: Env = process.env,
): SharedAuthConfig | null {
  if (!sharedAuthEnabled(env)) return null;
  const providerBaseUrl = origin(env.AEGYO_AUTH_BASE_URL);
  const appOrigin = origin(env.AEGYO_APP_ORIGIN);
  const clientId = env.AEGYO_AUTH_CLIENT_ID;
  const clientSecret = env.AEGYO_AUTH_CLIENT_SECRET;
  const transactionSecret = env.AEGYO_AUTH_TRANSACTION_SECRET;
  const stateReaderKey = env.AEGYO_AUTH_STATE_READER_KEY;
  if (
    !providerBaseUrl ||
    !appOrigin ||
    !clientId ||
    !clientSecret ||
    !transactionSecret ||
    transactionSecret.length < 32 ||
    !stateReaderKey
  )
    return null;
  return {
    providerBaseUrl,
    issuer: `${providerBaseUrl}/api/auth`,
    clientId,
    clientSecret,
    appOrigin,
    transactionSecret,
    stateReaderKey,
  };
}
