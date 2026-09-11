import type { NextRequest } from "next/server";
export function canonicalRequestUrl(
  request: NextRequest,
  expectedOrigin: string,
): URL | null {
  const expected = new URL(expectedOrigin);
  const observed = new URL(request.url);
  const direct =
    request.headers.get("host") === expected.host ||
    observed.host === expected.host;
  const forwarded =
    request.headers.get("x-forwarded-host") === expected.host &&
    request.headers.get("x-forwarded-proto") === expected.protocol.slice(0, -1);
  if (!direct && !forwarded) return null;
  const result = new URL(expected.href);
  result.pathname = observed.pathname;
  result.search = observed.search;
  return result;
}
