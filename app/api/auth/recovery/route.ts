import { NextRequest, NextResponse } from "next/server";
import { resolveAuthMode } from "@/lib/shared-auth/mode";
import { canonicalRequestUrl } from "@/lib/shared-auth/request-url";
export async function GET(request: NextRequest) {
  const mode = await resolveAuthMode();
  if (mode.kind === "closed")
    return NextResponse.json({ code: "service_unavailable" }, { status: 503 });
  if (mode.kind === "legacy")
    return NextResponse.redirect(new URL("/forgot-password", request.url));
  if (!canonicalRequestUrl(request, mode.config.appOrigin))
    return NextResponse.json(
      { code: "invalid_request_origin" },
      { status: 400 },
    );
  return NextResponse.redirect(
    new URL("/api/auth/shared/login", mode.config.appOrigin),
  );
}
