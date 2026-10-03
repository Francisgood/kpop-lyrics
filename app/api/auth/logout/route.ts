import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveAuthMode } from "@/lib/shared-auth/mode";
import { canonicalRequestUrl } from "@/lib/shared-auth/request-url";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("session")?.value;
  const authMode = await resolveAuthMode();
  if (token && authMode.kind !== "closed") {
    await prisma.session.deleteMany({ where: { token } }).catch(() => null);
  }
  const res = NextResponse.json(
    authMode.kind === "shared" &&
    authMode.config.appOrigin === "https://aegyoarena.com" &&
    canonicalRequestUrl(req, authMode.config.appOrigin)
      ? {
          ok: true,
          next: new URL(
            "/sign-out?return=aegyo",
            authMode.config.providerBaseUrl,
          ).href,
        }
      : { ok: true },
  );
  res.cookies.set("session", "", { maxAge: 0, path: "/" });
  return res;
}
