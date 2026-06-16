import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, hashResetCode } from "@/lib/auth";

export const dynamic = "force-dynamic";

const INVALID = "That code is invalid or has expired. Please request a new one.";

export async function POST(req: NextRequest) {
  try {
    const b = await req.json().catch(() => ({}));
    const email = String(b?.email ?? "").trim().toLowerCase();
    const code = String(b?.code ?? "").trim();
    const newPassword = String(b?.newPassword ?? "");

    if (!email.includes("@") || !/^\d{6}$/.test(code) || newPassword.length < 6) {
      return NextResponse.json({ error: "Enter the 6-digit code and a new password (at least 6 characters)." }, { status: 400 });
    }

    const rows = await prisma.$queryRaw<{ id: string; expiresAt: Date; used: boolean }[]>`
      SELECT "id","expiresAt","used" FROM "PasswordReset"
      WHERE "email" = ${email} AND "codeHash" = ${hashResetCode(email, code)}
      ORDER BY "createdAt" DESC LIMIT 1`;
    const row = rows[0];
    if (!row || row.used || new Date(row.expiresAt) < new Date()) {
      return NextResponse.json({ error: INVALID }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: INVALID }, { status: 400 });

    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(newPassword) } });
    await prisma.$executeRaw`UPDATE "PasswordReset" SET "used" = true WHERE "id" = ${row.id}`;
    // Security: invalidate all existing sessions so a stolen session can't persist.
    await prisma.session.deleteMany({ where: { userId: user.id } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
