import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// One vote per user per slang definition (toggleable). Adjusts the seeded
// TermDefinition.votesUp/votesDown incrementally so existing counts are preserved.
let ready = false;
async function ensureTable() {
  if (ready) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SlangVote" (
      "id"           TEXT PRIMARY KEY,
      "userId"       TEXT NOT NULL,
      "definitionId" TEXT NOT NULL,
      "value"        INTEGER NOT NULL,
      "createdAt"    TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "SlangVote_user_def_key" ON "SlangVote" ("userId","definitionId")`);
  ready = true;
}

// Returns the current user's votes so the UI can highlight them.
export async function GET() {
  try {
    await ensureTable();
    const session = await getSession();
    if (!session) return NextResponse.json({ votes: {} });
    const rows = await prisma.$queryRawUnsafe<{ definitionId: string; value: number }[]>(
      `SELECT "definitionId","value" FROM "SlangVote" WHERE "userId" = $1`, session.user.id,
    );
    const votes: Record<string, number> = {};
    for (const r of rows) votes[r.definitionId] = Number(r.value);
    return NextResponse.json({ votes });
  } catch {
    return NextResponse.json({ votes: {} });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "auth_required" }, { status: 401 });
    const b = await req.json().catch(() => ({}));
    const definitionId = String(b?.definitionId ?? "");
    const value = b?.value === 1 ? 1 : b?.value === -1 ? -1 : 0;
    if (!definitionId || !value) return NextResponse.json({ error: "bad_request" }, { status: 400 });

    const prior = await prisma.$queryRawUnsafe<{ value: number }[]>(
      `SELECT "value" FROM "SlangVote" WHERE "userId" = $1 AND "definitionId" = $2 LIMIT 1`, session.user.id, definitionId,
    );
    const prev = Number(prior[0]?.value ?? 0);

    let dUp = 0, dDown = 0;
    let finalVote: number | null;
    if (prev === value) {
      // same button pressed again → remove the vote
      if (value === 1) dUp = -1; else dDown = -1;
      finalVote = null;
    } else {
      if (prev === 1) dUp -= 1; else if (prev === -1) dDown -= 1;
      if (value === 1) dUp += 1; else dDown += 1;
      finalVote = value;
    }

    if (finalVote === null) {
      await prisma.$executeRaw`DELETE FROM "SlangVote" WHERE "userId" = ${session.user.id} AND "definitionId" = ${definitionId}`;
    } else {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "SlangVote" ("id","userId","definitionId","value") VALUES ($1,$2,$3,$4)
         ON CONFLICT ("userId","definitionId") DO UPDATE SET "value" = EXCLUDED."value"`,
        randomUUID(), session.user.id, definitionId, finalVote,
      );
    }

    const updated = await prisma.termDefinition.update({
      where: { id: definitionId },
      data: { votesUp: { increment: dUp }, votesDown: { increment: dDown } },
      select: { votesUp: true, votesDown: true },
    });
    return NextResponse.json({ ok: true, votesUp: updated.votesUp, votesDown: updated.votesDown, myVote: finalVote ?? 0 });
  } catch {
    return NextResponse.json({ error: "error" }, { status: 500 });
  }
}
