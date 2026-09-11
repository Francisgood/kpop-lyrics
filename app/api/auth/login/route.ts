import { NextRequest, NextResponse } from "next/server";
import { resolveAuthMode } from "@/lib/shared-auth/mode";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const authMode = await resolveAuthMode();
  if (authMode.kind === "closed") return NextResponse.json({ error: "Sign-in is temporarily unavailable" }, { status: 503 });
  if (authMode.kind === "shared") return NextResponse.json({ error: "Shared sign-in required", redirect: "/api/auth/shared/login" }, { status: 409 });
  const { email, password } = await req.json().catch(() => ({})) as {
    email?: string; password?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || user.passwordHash !== hashPassword(password)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = generateToken();
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, displayName: user.displayName } });
  res.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
  return res;
}
