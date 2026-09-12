import * as oidc from "openid-client";
import { createHash } from "node:crypto";
import { createProviderFetch } from "./network";
import type { SharedAuthConfig } from "./config";
import { PROVIDER_CLOCK_SKEW_MS } from "./freshness";
import type { OidcTransaction } from "./transaction";

const configs = new Map<string, Promise<oidc.Configuration>>();
async function provider(config: SharedAuthConfig): Promise<oidc.Configuration> {
  const key = `${config.issuer}\0${config.clientId}\0${createHash("sha256").update(config.clientSecret).digest("hex")}`;
  let pending = configs.get(key);
  if (!pending) {
    const boundedFetch = createProviderFetch(config.providerBaseUrl);
    pending = oidc
      .discovery(
        new URL(config.issuer),
        config.clientId,
        {
          client_secret: config.clientSecret,
          [oidc.clockTolerance]: PROVIDER_CLOCK_SKEW_MS / 1000,
        },
        oidc.ClientSecretBasic(config.clientSecret),
        {
          [oidc.customFetch]: (url, options) =>
            boundedFetch(url, {
              ...options,
              body:
                options.body instanceof Uint8Array
                  ? new Uint8Array(options.body)
                  : options.body,
            }),
        },
      )
      .then((value) => {
        const metadata = value.serverMetadata();
        for (const endpoint of [
          metadata.authorization_endpoint,
          metadata.token_endpoint,
          metadata.jwks_uri,
        ]) {
          if (typeof endpoint !== "string")
            throw new Error("invalid_provider_endpoint");
          const url = new URL(endpoint);
          if (
            url.protocol !== "https:" ||
            url.origin !== config.providerBaseUrl ||
            url.username ||
            url.password ||
            url.hash
          )
            throw new Error("invalid_provider_endpoint");
        }
        oidc.enableNonRepudiationChecks(value);
        return value;
      })
      .catch((error) => {
        configs.delete(key);
        throw error;
      });
    configs.set(key, pending);
  }
  return pending;
}
/** Only the SDK's authentication-age failure permits the bounded login retry. */
export function isAuthenticationAgeError(error: unknown): boolean {
  if (
    !(error instanceof oidc.ClientError) ||
    error.code !== "OAUTH_JWT_TIMESTAMP_CHECK_FAILED"
  )
    return false;
  let cause: unknown = error.cause;
  for (
    let depth = 0;
    depth < 3 && cause && typeof cause === "object";
    depth++
  ) {
    if ((cause as { claim?: unknown }).claim === "auth_time") return true;
    cause = (cause as { cause?: unknown }).cause;
  }
  return false;
}
export type VerifiedIdentity = {
  issuer: string;
  subject: string;
  providerSessionId: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  authTime: unknown;
  resetState: unknown;
  securityVersion: unknown;
  operatorCutoff: unknown;
};
export async function beginAuthorization(
  config: SharedAuthConfig,
  input: {
    maxAgeSeconds: number;
    reauthenticationAttempt: 0 | 1;
    nowMs?: number;
  },
) {
  const codeVerifier = oidc.randomPKCECodeVerifier();
  const transaction: OidcTransaction = {
    state: oidc.randomState(),
    nonce: oidc.randomNonce(),
    codeVerifier,
    requestedAtMs: input.nowMs ?? Date.now(),
    maxAgeSeconds: input.maxAgeSeconds,
    reauthenticationAttempt: input.reauthenticationAttempt,
  };
  const url = oidc.buildAuthorizationUrl(await provider(config), {
    redirect_uri: `${config.appOrigin}/api/auth/shared/callback`,
    response_type: "code",
    scope: "openid profile email",
    code_challenge: await oidc.calculatePKCECodeChallenge(codeVerifier),
    code_challenge_method: "S256",
    state: transaction.state,
    nonce: transaction.nonce,
    max_age: String(transaction.maxAgeSeconds),
    ...(transaction.reauthenticationAttempt === 1 ? { prompt: "login" } : {}),
  });
  return { url, transaction };
}
export async function finishAuthorization(
  config: SharedAuthConfig,
  callbackUrl: URL,
  tx: OidcTransaction,
): Promise<VerifiedIdentity> {
  const tokens = await oidc.authorizationCodeGrant(
    await provider(config),
    callbackUrl,
    {
      pkceCodeVerifier: tx.codeVerifier,
      expectedState: tx.state,
      expectedNonce: tx.nonce,
      maxAge: tx.maxAgeSeconds,
      idTokenExpected: true,
    },
  );
  const claims = tokens.claims();
  if (
    !claims ||
    typeof claims.iss !== "string" ||
    typeof claims.sub !== "string" ||
    typeof claims.sid !== "string" ||
    !claims.sid
  )
    throw new Error("invalid_identity_claims");
  return {
    issuer: claims.iss,
    subject: claims.sub,
    providerSessionId: claims.sid,
    email: typeof claims.email === "string" ? claims.email.toLowerCase() : null,
    name: typeof claims.name === "string" ? claims.name : null,
    picture: typeof claims.picture === "string" ? claims.picture : null,
    authTime: claims.auth_time,
    resetState: claims["https://aegyoarena.com/claims/password-reset-state"],
    securityVersion: claims["https://aegyoarena.com/claims/security-version"],
    operatorCutoff: claims["https://aegyoarena.com/claims/operator-cutoff"],
  };
}
