import { NextRequest, NextResponse } from "next/server";
import { NORMAL_MAX_AGE_SECONDS } from "@/lib/shared-auth/config";
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
  // The temporary OAuth cookie is host-only. Start the transaction on the
  // same host that receives the callback, including visits through www.
  if (!canonicalRequestUrl(request, config.appOrigin))
    return NextResponse.redirect(
      new URL("/api/auth/shared/login", config.appOrigin),
    );
  try {
    return await authorizationRedirect(config, {
      maxAgeSeconds: NORMAL_MAX_AGE_SECONDS,
      reauthenticationAttempt: 0,
    });
  } catch {
    return NextResponse.json(
      { code: "identity_provider_unavailable" },
      { status: 503 },
    );
  }
}
