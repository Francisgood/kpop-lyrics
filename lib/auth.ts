import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import crypto from "crypto";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + (process.env.AUTH_SECRET ?? "aegyo-salt")).digest("hex");
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashResetCode(email: string, code: string): string {
  return crypto.createHash("sha256").update(`${email}:${code}:${process.env.AUTH_SECRET ?? "aegyo-salt"}`).digest("hex");
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  return session;
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  return session;
}
