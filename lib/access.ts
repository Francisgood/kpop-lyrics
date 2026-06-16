import { prisma } from "@/lib/prisma";
import { RANK, type Role } from "@/lib/roles";

// Effective role for authenticated users. Role is stored on a lazily-added
// User.role column (raw SQL only, so Prisma's getSession never selects a column
// that might not exist yet). The OWNER_EMAIL account is always Superadmin.

let roleColReady = false;
async function ensureRoleColumn(): Promise<void> {
  if (roleColReady) return;
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT`);
  roleColReady = true;
}

function normalize(role: string | null | undefined, email: string): Role {
  const owner = process.env.OWNER_EMAIL?.toLowerCase();
  if (owner && email.toLowerCase() === owner) return "superadmin";
  return (role && role in RANK ? role : "contributor") as Role;
}

export async function getRole(user: { id: string; email: string } | null | undefined): Promise<Role> {
  if (!user) return "public";
  await ensureRoleColumn();
  const r = await prisma.$queryRawUnsafe<{ role: string | null }[]>(`SELECT "role" FROM "User" WHERE "id" = $1 LIMIT 1`, user.id);
  return normalize(r[0]?.role, user.email);
}

export async function setRole(userId: string, role: Role): Promise<void> {
  await ensureRoleColumn();
  await prisma.$executeRaw`UPDATE "User" SET "role" = ${role} WHERE "id" = ${userId}`;
}

export async function listUsersWithRoles(): Promise<{ id: string; email: string; displayName: string | null; role: Role }[]> {
  await ensureRoleColumn();
  const rows = await prisma.$queryRawUnsafe<{ id: string; email: string; displayName: string | null; role: string | null }[]>(
    `SELECT "id","email","displayName","role" FROM "User" ORDER BY "createdAt" DESC LIMIT 200`,
  );
  return rows.map((u) => ({ id: u.id, email: u.email, displayName: u.displayName, role: normalize(u.role, u.email) }));
}
