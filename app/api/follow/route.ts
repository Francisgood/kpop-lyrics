import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// Self-contained follow store, created additively on first use. A follow is
// (followerId = the authenticated user, targetSlug = the profile being followed).
let ready = false;
async function ensureTable() {
  if (ready) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Follow" (
      "id"         TEXT PRIMARY KEY,
      "followerId" TEXT NOT NULL,
      "targetSlug" TEXT NOT NULL,
      "createdAt"  TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Follow_follower_target_key" ON "Follow" ("followerId","targetSlug")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Follow_target_idx" ON "Follow" ("targetSlug")`);
  ready = true;
}

async function countFollowers(targetSlug: string): Promise<number> {
  const r = await prisma.$queryRaw<{ c: number }[]>`SELECT COUNT(*)::int AS c FROM "Follow" WHERE "targetSlug" = ${targetSlug}`;
  return Number(r[0]?.c ?? 0);
}

// Public: anyone can read a target's follower count; logged-in users also learn
// whether they personally follow it.
export async function GET(req: NextRequest) {
  try {
    await ensureTable();
    const slug = (new URL(req.url).searchParams.get("targetSlug") ?? "").trim();
    if (!slug) return NextResponse.json({ error: "missing targetSlug" }, { status: 400 });
    const session = await getSession();
    let following = false;
    if (session) {
      const r = await prisma.$queryRaw<{ id: string }[]>`SELECT "id" FROM "Follow" WHERE "followerId" = ${session.user.id} AND "targetSlug" = ${slug} LIMIT 1`;
      following = !!r[0];
    }
    return NextResponse.json({ followers: await countFollowers(slug), following });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}

// Following is an engagement action — requires login (spec §2/§4.4).
export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "auth_required" }, { status: 401 });
    const slug = String((await req.json().catch(() => ({})))?.targetSlug ?? "").trim();
    if (!slug) return NextResponse.json({ error: "missing targetSlug" }, { status: 400 });
    await prisma.$executeRaw`
      INSERT INTO "Follow" ("id","followerId","targetSlug")
      VALUES (${randomUUID()}, ${session.user.id}, ${slug})
      ON CONFLICT ("followerId","targetSlug") DO NOTHING`;
    return NextResponse.json({ following: true, followers: await countFollowers(slug) });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureTable();
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "auth_required" }, { status: 401 });
    const slug = String((await req.json().catch(() => ({})))?.targetSlug ?? "").trim();
    if (!slug) return NextResponse.json({ error: "missing targetSlug" }, { status: 400 });
    await prisma.$executeRaw`DELETE FROM "Follow" WHERE "followerId" = ${session.user.id} AND "targetSlug" = ${slug}`;
    return NextResponse.json({ following: false, followers: await countFollowers(slug) });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
