import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashResetCode } from "@/lib/auth";
import { sendMail } from "@/lib/email";
import crypto from "crypto";

export const dynamic = "force-dynamic";

let ready = false;
async function ensureTable() {
  if (ready) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PasswordReset" (
      "id"        TEXT PRIMARY KEY,
      "email"     TEXT NOT NULL,
      "codeHash"  TEXT NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "used"      BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PasswordReset_email_idx" ON "PasswordReset" ("email")`);
  ready = true;
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const email = String((await req.json().catch(() => ({})))?.email ?? "").trim().toLowerCase();
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    // Only generate + send for a real account, but always return ok so the
    // endpoint never reveals whether an email is registered.
    if (user) {
      const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await prisma.$executeRaw`DELETE FROM "PasswordReset" WHERE "email" = ${email}`;
      await prisma.$executeRaw`
        INSERT INTO "PasswordReset" ("id","email","codeHash","expiresAt")
        VALUES (${crypto.randomUUID()}, ${email}, ${hashResetCode(email, code)}, ${expiresAt})`;
      await sendMail({
        to: email,
        subject: "Your Aegyo Arena password reset code",
        text: `Your Aegyo Arena password reset code is ${code}. It expires in 15 minutes. If you didn't request this, you can safely ignore this email.`,
        html: `<div style="font-family:system-ui,sans-serif;line-height:1.6;color:#222">
          <p>Hey — here's your Aegyo Arena password reset code:</p>
          <p style="font-size:30px;font-weight:800;letter-spacing:6px;color:#d6336c;margin:18px 0">${code}</p>
          <p>Enter it on the reset page within <strong>15 minutes</strong>. If you didn't request a reset, you can safely ignore this email — your password won't change.</p>
          <p style="color:#888;font-size:13px">— The Aegyo Arena Team 💜</p>
        </div>`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
