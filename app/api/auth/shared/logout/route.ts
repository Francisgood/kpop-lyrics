import { NextRequest, NextResponse } from "next/server";
import { resolveAuthMode } from "@/lib/shared-auth/mode";
import { clearCookies, SESSION_COOKIE } from "@/lib/shared-auth/http";
import { prisma } from "@/lib/prisma";
export async function POST(request: NextRequest) {
 const mode = await resolveAuthMode(); if (mode.kind !== "shared") return NextResponse.json({ code: mode.kind === "legacy" ? "not_found" : "service_unavailable" }, { status: mode.kind === "legacy" ? 404 : 503 }); const config = mode.config;
 const origin = request.headers.get("origin"); if (origin && origin !== config.appOrigin) return NextResponse.json({ code: "bad_origin" }, { status: 403 });
 const token = request.cookies.get(SESSION_COOKIE)?.value; if (token) await prisma.session.deleteMany({ where: { token } });
 const response = NextResponse.json({ ok: true }); clearCookies(response); return response;
}
