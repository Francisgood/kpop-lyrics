import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";
import { subscribeToBeehiiv } from "@/lib/beehiiv";

export async function POST(req: NextRequest) {
  const { email, password, displayName, subscribe } = await req.json().catch(() => ({})) as {
    email?: string; password?: string; displayName?: string; subscribe?: boolean;
  };

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      displayName: displayName?.trim() || email.split("@")[0],
      passwordHash: hashPassword(password),
    },
  });

  const token = generateToken();
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // When the user ticks "email me K-pop rumors" on the form, add them to the
  // Beehiiv newsletter audience and send Beehiiv's welcome email. Best-effort
  // (never throws, so it never blocks account creation). Defaults to true so an
  // older client that doesn't send the flag still opts in.
  if (subscribe !== false) {
    await subscribeToBeehiiv({ email: email.toLowerCase(), source: "account-signup", sendWelcome: true });
  }

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
