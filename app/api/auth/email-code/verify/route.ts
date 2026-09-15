import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { consumeCode, handleFromEmail, NO_PASSWORD } from "@/lib/email-code";
import { subscribeToBeehiiv } from "@/lib/beehiiv";

export const dynamic = "force-dynamic";

const INVALID = "That code is invalid or has expired. Ask for a new one.";
const SESSION_DAYS = 30;

// Step 2 of passwordless registration: exchange a verified code for a session.
//
// A first-time address gets an account created here with emailVerified = true
// and no usable password (they can set one later via /forgot). An address that
// already has an account is simply signed in, so an existing member is never
// dead-ended out of the chat.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const code = String(body?.code ?? "").replace(/\D/g, "");
    const subscribe = body?.subscribe === true;

    if (!email.includes("@") || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: INVALID }, { status: 400 });
    }
    if (!(await consumeCode(email, code))) {
      return NextResponse.json({ error: INVALID }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    const isNew = !user;
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          displayName: handleFromEmail(email),
          passwordHash: NO_PASSWORD(),
          emailVerified: true,
        },
      });
    } else if (!user.emailVerified) {
      user = await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
    }

    const token = generateToken();
    await prisma.session.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000) },
    });

    // Newsletter opt-in is explicit here (unlike /signup, which defaults on) —
    // joining a chat is not consent to be mailed. Best-effort, never blocks.
    if (isNew && subscribe) {
      await subscribeToBeehiiv({ email, source: "live-chat", sendWelcome: true });
    }

    const res = NextResponse.json({
      ok: true,
      isNew,
      user: { id: user.id, displayName: user.displayName, email: user.email },
    });
    res.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DAYS * 86_400,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
