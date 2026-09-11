import { NextRequest, NextResponse } from "next/server";
import { getSharedAuthConfig } from "@/lib/shared-auth/config";
import { clearCookies, SESSION_COOKIE } from "@/lib/shared-auth/http";
import { prisma } from "@/lib/prisma";
export async function POST(request: NextRequest) {
 const config = getSharedAuthConfig(); if (!config) return NextResponse.json({ code: "not_found" }, { status: 404 });
 const origin = request.headers.get("origin"); if (origin && origin !== config.appOrigin) return NextResponse.json({ code: "bad_origin" }, { status: 403 });
 const token = request.cookies.get(SESSION_COOKIE)?.value; if (token) await prisma.session.deleteMany({ where: { token } });
 const response = NextResponse.json({ ok: true }); clearCookies(response); return response;
}
