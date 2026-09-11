import { NextRequest, NextResponse } from "next/server";
import { resolveAuthMode } from "@/lib/shared-auth/mode";
import { authorizeSharedSession } from "@/lib/shared-auth/session";
import { clearCookies, SESSION_COOKIE } from "@/lib/shared-auth/http";
export async function GET(request: NextRequest) {
 const mode = await resolveAuthMode(); if (mode.kind !== "shared") return NextResponse.json({ code: mode.kind === "legacy" ? "not_found" : "service_unavailable" }, { status: mode.kind === "legacy" ? 404 : 503 }); const config = mode.config;
 const token = request.cookies.get(SESSION_COOKIE)?.value; if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });
 const result = await authorizeSharedSession(token, config, { sensitive: false });
 if (result.kind === "unavailable") return NextResponse.json({ code: "identity_provider_unavailable" }, { status: 503 });
 if (result.kind !== "allowed") { const response = NextResponse.json({ authenticated: false }, { status: 401 }); clearCookies(response); return response; }
 return NextResponse.json({ authenticated: true, user: { id: result.session.user.id, email: result.session.user.email, displayName: result.session.user.displayName } });
}
