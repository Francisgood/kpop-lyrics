import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveAuthMode } from "@/lib/shared-auth/mode";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const authMode = await resolveAuthMode();
  if (token && authMode.kind !== "closed") {
    await prisma.session.deleteMany({ where: { token } }).catch(() => null);
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", "", { maxAge: 0, path: "/" });
  return res;
}
