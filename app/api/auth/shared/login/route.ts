import { NextRequest, NextResponse } from "next/server";
import {
  NORMAL_MAX_AGE_SECONDS,
  parseSessionClient,
} from "@/lib/shared-auth/config";
import { resolveAuthMode } from "@/lib/shared-auth/mode";
import { authorizationRedirect } from "@/lib/shared-auth/http";
import { canonicalRequestUrl } from "@/lib/shared-auth/request-url";
export async function GET(request: NextRequest) {
  const mode = await resolveAuthMode();
  if (mode.kind !== "shared")
    return NextResponse.json(
      { code: mode.kind === "legacy" ? "not_found" : "service_unavailable" },
      { status: mode.kind === "legacy" ? 404 : 503 },
    );
  const config = mode.config;
  // ?client=mobile (exact value) asks for the mobile session lifetime. It is
  // a convenience signal, not a security boundary; anything else means web.
  const client = parseSessionClient(
    request.nextUrl.searchParams.get("client"),
  );
  // The temporary OAuth cookie is host-only. Start the transaction on the
  // same host that receives the callback, including visits through www.
  if (!canonicalRequestUrl(request, config.appOrigin)) {
    const canonical = new URL("/api/auth/shared/login", config.appOrigin);
    if (client === "mobile") canonical.searchParams.set("client", "mobile");
    return NextResponse.redirect(canonical);
  }
  try {
    return await authorizationRedirect(config, {
      maxAgeSeconds: NORMAL_MAX_AGE_SECONDS,
      reauthenticationAttempt: 0,
      client,
    });
  } catch {
    return NextResponse.json(
      { code: "identity_provider_unavailable" },
      { status: 503 },
    );
  }
}
