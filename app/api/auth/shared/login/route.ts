import { NextResponse } from "next/server";
import { NORMAL_MAX_AGE_SECONDS } from "@/lib/shared-auth/config";
import { resolveAuthMode } from "@/lib/shared-auth/mode";
import { authorizationRedirect } from "@/lib/shared-auth/http";
export async function GET() {
  const mode = await resolveAuthMode(); if (mode.kind !== "shared") return NextResponse.json({ code: mode.kind === "legacy" ? "not_found" : "service_unavailable" }, { status: mode.kind === "legacy" ? 404 : 503 }); const config = mode.config;
  try { return await authorizationRedirect(config, { maxAgeSeconds: NORMAL_MAX_AGE_SECONDS, reauthenticationAttempt: 0 }); }
  catch { return NextResponse.json({ code: "identity_provider_unavailable" }, { status: 503 }); }
}
