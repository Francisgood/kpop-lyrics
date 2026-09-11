import { NextResponse } from "next/server";
import { getSharedAuthConfig, NORMAL_MAX_AGE_SECONDS } from "@/lib/shared-auth/config";
import { authorizationRedirect } from "@/lib/shared-auth/http";
export async function GET() {
  const config = getSharedAuthConfig(); if (!config) return NextResponse.json({ code: "not_found" }, { status: 404 });
  try { return await authorizationRedirect(config, { maxAgeSeconds: NORMAL_MAX_AGE_SECONDS, reauthenticationAttempt: 0 }); }
  catch { return NextResponse.json({ code: "identity_provider_unavailable" }, { status: 503 }); }
}
