import { NextRequest, NextResponse } from "next/server";
import { getSharedAuthConfig, sharedAuthEnabled } from "@/lib/shared-auth/config";
import { canonicalRequestUrl } from "@/lib/shared-auth/request-url";
export function GET(request: NextRequest) {
  if (!sharedAuthEnabled()) return NextResponse.redirect(new URL("/forgot-password", request.url));
  const config = getSharedAuthConfig();
  if (!config) return NextResponse.json({ code: "service_unavailable" }, { status: 503 });
  if (!canonicalRequestUrl(request, config.appOrigin)) return NextResponse.json({ code: "invalid_request_origin" }, { status: 400 });
  return NextResponse.redirect(new URL("/api/auth/shared/login", config.appOrigin));
}
