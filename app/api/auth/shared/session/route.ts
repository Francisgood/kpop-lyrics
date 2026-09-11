import { NextRequest, NextResponse } from "next/server";
import { getSharedAuthConfig } from "@/lib/shared-auth/config";
import { authorizeSharedSession } from "@/lib/shared-auth/session";
import { clearCookies, SESSION_COOKIE } from "@/lib/shared-auth/http";
export async function GET(request: NextRequest) {
 const config = getSharedAuthConfig(); if (!config) return NextResponse.json({ code: "not_found" }, { status: 404 });
 const token = request.cookies.get(SESSION_COOKIE)?.value; if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });
 const result = await authorizeSharedSession(token, config, { sensitive: false });
 if (result.kind === "unavailable") return NextResponse.json({ code: "identity_provider_unavailable" }, { status: 503 });
 if (result.kind !== "allowed") { const response = NextResponse.json({ authenticated: false }, { status: 401 }); clearCookies(response); return response; }
 return NextResponse.json({ authenticated: true, user: { id: result.session.user.id, email: result.session.user.email, displayName: result.session.user.displayName } });
}
