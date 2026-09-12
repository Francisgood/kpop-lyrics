const MAX_RESPONSE_BYTES = 1024 * 1024;

export function createProviderFetch(
  baseUrl: string,
  transport: typeof fetch = fetch,
): typeof fetch {
  const origin = new URL(baseUrl).origin;
  return async (input, init = {}) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    if (
      url.protocol !== "https:" ||
      url.origin !== origin ||
      url.username ||
      url.password
    )
      throw new Error("provider_request_target_rejected");
    const timeout = AbortSignal.timeout(5000);
    const response = await transport(input, {
      ...init,
      redirect: "error",
      signal: init.signal ? AbortSignal.any([init.signal, timeout]) : timeout,
    });
    if (response.status >= 300 && response.status < 400) {
      await response.body?.cancel().catch(() => {});
      throw new Error("provider_redirect_rejected");
    }
    const declared = Number(response.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > MAX_RESPONSE_BYTES) {
      await response.body?.cancel().catch(() => {});
      throw new Error("provider_response_too_large");
    }
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    if (response.body) {
      const reader = response.body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          bytes += value.byteLength;
          if (bytes > MAX_RESPONSE_BYTES)
            throw new Error("provider_response_too_large");
          chunks.push(value);
        }
      } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
    }
    return new Response(
      [204, 205, 304].includes(response.status)
        ? null
        : Buffer.concat(chunks, bytes),
      {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      },
    );
  };
}
