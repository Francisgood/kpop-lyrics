import { afterEach, describe, expect, it, vi } from "vitest";
import { createProviderFetch } from "../lib/shared-auth/network";
import { beginAuthorization } from "../lib/shared-auth/provider";
import {
  fetchProviderSecurityState,
  stateAllowsSession,
} from "../lib/shared-auth/security-state";

const origin = "https://accounts.example.test";
const config = {
  providerBaseUrl: origin,
  issuer: origin + "/api/auth",
  clientId: "network-proof",
  clientSecret: "synthetic-secret",
  appOrigin: "https://aegyo.example.test",
  transactionSecret: "x".repeat(32),
  stateReaderKey: "r".repeat(32),
};
const metadata = {
  issuer: config.issuer,
  authorization_endpoint: origin + "/api/auth/oauth2/authorize",
  token_endpoint: origin + "/api/auth/oauth2/token",
  jwks_uri: origin + "/api/auth/jwks",
  response_types_supported: ["code"],
  subject_types_supported: ["public"],
  id_token_signing_alg_values_supported: ["RS256"],
};
const reset = {
  version: 1 as const,
  kind: "database" as const,
  lastPasswordReset: null,
};
afterEach(() => vi.unstubAllGlobals());

describe("provider request boundary", () => {
  it("refuses unsafe destinations before sending credentials and disables redirects", async () => {
    const transport = vi.fn(async () => Response.json({ ok: true }));
    const bounded = createProviderFetch(origin, transport);
    for (const url of [
      "https://other.example/token",
      "http://accounts.example.test/token",
      "https://user:pass@accounts.example.test/token",
    ])
      await expect(bounded(url)).rejects.toThrow(
        "provider_request_target_rejected",
      );
    expect(transport).not.toHaveBeenCalled();
    await bounded(origin + "/token", {
      headers: { authorization: "synthetic" },
    });
    expect(transport).toHaveBeenCalledWith(
      origin + "/token",
      expect.objectContaining({
        redirect: "error",
        signal: expect.any(AbortSignal),
      }),
    );
    await expect(
      createProviderFetch(
        origin,
        async () =>
          new Response(null, {
            status: 302,
            headers: { location: "https://other.example" },
          }),
      )(origin),
    ).rejects.toThrow("provider_redirect_rejected");
  });
  it("caps declared and streamed bodies and cancels rejected responses", async () => {
    const declaredCancelled = vi.fn();
    const declared = new Response(
      new ReadableStream({ cancel: declaredCancelled }),
      { headers: { "content-length": "1048577" } },
    );
    await expect(
      createProviderFetch(origin, async () => declared)(origin),
    ).rejects.toThrow("provider_response_too_large");
    expect(declaredCancelled).toHaveBeenCalledOnce();
    const streamedCancelled = vi.fn();
    const streamed = new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(1048577));
        },
        cancel: streamedCancelled,
      }),
    );
    await expect(
      createProviderFetch(origin, async () => streamed)(origin),
    ).rejects.toThrow("provider_response_too_large");
    expect(streamedCancelled).toHaveBeenCalledOnce();
  });
  it("rejects off-origin discovery endpoints and evicts the failed configuration", async () => {
    const transport = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          ...metadata,
          token_endpoint: "https://other.example/token",
        }),
      )
      .mockImplementation(async () => Response.json(metadata));
    vi.stubGlobal("fetch", transport);
    const input = { maxAgeSeconds: 3600, reauthenticationAttempt: 0 as const };
    await expect(beginAuthorization(config, input)).rejects.toThrow(
      "invalid_provider_endpoint",
    );
    const result = await beginAuthorization(config, input);
    expect(result.url.origin).toBe(origin);
    expect(result.url.searchParams.get("max_age")).toBe("3600");
    expect(result.url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(transport).toHaveBeenCalledTimes(2);
    await beginAuthorization(
      { ...config, clientSecret: "rotated-synthetic-secret" },
      input,
    );
    expect(transport).toHaveBeenCalledTimes(3);
  });
  it("rejects a security response for another subject or session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          version: 1,
          subject: "wrong",
          providerSessionId: "sid",
          active: true,
          passwordResetState: reset,
          operatorCutoff: null,
          securityVersion: 0,
        }),
      ),
    );
    expect(await fetchProviderSecurityState(config, "subject", "sid")).toEqual({
      kind: "invalid",
    });
  });
  it("retains allowed forward clock skew on session use without weakening reset cutoff", () => {
    const now = 1800000000000;
    const session = {
      user: { sharedIdentity: { subject: "subject" } },
      providerSessionId: "sid",
      authenticatedAt: new Date(now + 1000),
      securityVersion: 0,
      passwordResetAt: null,
    };
    const state = {
      version: 1 as const,
      subject: "subject",
      providerSessionId: "sid",
      active: true,
      passwordResetState: reset,
      operatorCutoff: null,
      securityVersion: 0,
    };
    expect(stateAllowsSession(session, state, now)).toBe(true);
    const resetDate = new Date(now + 1500);
    expect(
      stateAllowsSession(
        { ...session, passwordResetAt: resetDate },
        {
          ...state,
          passwordResetState: {
            ...reset,
            lastPasswordReset: resetDate.toISOString(),
          },
        },
        now + 2000,
      ),
    ).toBe(false);
  });
});
