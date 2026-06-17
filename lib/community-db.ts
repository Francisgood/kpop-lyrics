import { prisma } from "@/lib/prisma";
import { generateCommunity } from "@/lib/community";

// Self-contained community store (annotations + comments), created and seeded
// additively on first use. Never touches the existing Prisma-managed tables.

export type AnnRow = {
  id: string;
  authorSlug: string;
  authorName: string;
  songTitle: string;
  word: string;
  romanization: string;
  note: string;
  status: "approved" | "rejected" | "pending";
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
};

export type CommentRow = {
  id: string;
  authorSlug: string;
  authorName: string;
  context: string;
  body: string;
  createdAt: Date;
};

let ready = false;

function placeholders(rowIndex: number, cols: number): string {
  return "(" + Array.from({ length: cols }, (_, k) => `$${rowIndex * cols + k + 1}`).join(",") + ")";
}

async function createCommunityTables(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "CommunityAnnotation" (
      "id"           TEXT PRIMARY KEY,
      "authorSlug"   TEXT NOT NULL,
      "authorName"   TEXT NOT NULL,
      "songTitle"    TEXT NOT NULL,
      "word"         TEXT NOT NULL,
      "romanization" TEXT NOT NULL,
      "note"         TEXT NOT NULL,
      "status"       TEXT NOT NULL DEFAULT 'pending',
      "reviewedBy"   TEXT,
      "reviewedAt"   TIMESTAMP,
      "createdAt"    TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "CommunityAnnotation_author_idx" ON "CommunityAnnotation" ("authorSlug")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "CommunityAnnotation_status_idx" ON "CommunityAnnotation" ("status")`);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "CommunityComment" (
      "id"         TEXT PRIMARY KEY,
      "authorSlug" TEXT NOT NULL,
      "authorName" TEXT NOT NULL,
      "context"    TEXT NOT NULL,
      "body"       TEXT NOT NULL,
      "createdAt"  TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "CommunityComment_author_idx" ON "CommunityComment" ("authorSlug")`);
}

// Insert the deterministic showcase seed (annotations + comments). Idempotent via
// ON CONFLICT DO NOTHING, so it's safe to call repeatedly.
async function insertCommunitySeed(): Promise<{ annotations: number; comments: number }> {
    const { annotations, comments } = generateCommunity();
    const base = Date.now();

    // Seeded annotations are pre-moderated (~90% approved / ~10% rejected) — the
    // "cleared queue" end state. Real submissions arrive later as status='pending'.
    const aCols = 11;
    const aVals: unknown[] = [];
    const aTuples: string[] = [];
    annotations.forEach((a, idx) => {
      const createdAt = new Date(base - idx * 90 * 60 * 1000);
      const reviewedAt = new Date(createdAt.getTime() + 2 * 60 * 60 * 1000);
      aTuples.push(placeholders(idx, aCols));
      aVals.push(a.id, a.authorSlug, a.authorName, a.songTitle, a.word, a.romanization, a.note, a.status, "Aegyo Moderation", reviewedAt, createdAt);
    });
    if (aTuples.length) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "CommunityAnnotation" ("id","authorSlug","authorName","songTitle","word","romanization","note","status","reviewedBy","reviewedAt","createdAt") VALUES ${aTuples.join(",")} ON CONFLICT ("id") DO NOTHING`,
        ...aVals,
      );
    }

    const cCols = 6;
    const cVals: unknown[] = [];
    const cTuples: string[] = [];
    comments.forEach((m, idx) => {
      const createdAt = new Date(base - idx * 70 * 60 * 1000);
      cTuples.push(placeholders(idx, cCols));
      cVals.push(m.id, m.authorSlug, m.authorName, m.context, m.body, createdAt);
    });
    if (cTuples.length) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "CommunityComment" ("id","authorSlug","authorName","context","body","createdAt") VALUES ${cTuples.join(",")} ON CONFLICT ("id") DO NOTHING`,
        ...cVals,
      );
    }
  return { annotations: annotations.length, comments: comments.length };
}

export async function ensureCommunity(): Promise<void> {
  if (ready) return;
  await createCommunityTables();
  const existing = await prisma.$queryRaw<{ c: number }[]>`SELECT COUNT(*)::int AS c FROM "CommunityAnnotation"`;
  if (Number(existing[0]?.c ?? 0) === 0) await insertCommunitySeed();
  ready = true;
}

// Rebuild the showcase seed after the contributor usernames/slugs change. Drops the
// generated rows but KEEPS real user submissions (createAnnotation ids start with "u-").
export async function reseedCommunity(): Promise<{ annotations: number; comments: number }> {
  await createCommunityTables();
  await prisma.$executeRawUnsafe(`DELETE FROM "CommunityAnnotation" WHERE "id" NOT LIKE 'u-%'`);
  await prisma.$executeRawUnsafe(`DELETE FROM "CommunityComment"`);
  const counts = await insertCommunitySeed();
  ready = true;
  return counts;
}

export async function getUserAnnotations(slug: string, limit = 5): Promise<AnnRow[]> {
  await ensureCommunity();
  return prisma.$queryRawUnsafe<AnnRow[]>(
    `SELECT * FROM "CommunityAnnotation" WHERE "authorSlug" = $1 ORDER BY "createdAt" DESC LIMIT $2`,
    slug, limit,
  );
}

export async function getUserComments(slug: string, limit = 10): Promise<CommentRow[]> {
  await ensureCommunity();
  return prisma.$queryRawUnsafe<CommentRow[]>(
    `SELECT * FROM "CommunityComment" WHERE "authorSlug" = $1 ORDER BY "createdAt" DESC LIMIT $2`,
    slug, limit,
  );
}

export async function getAnnotation(id: string): Promise<AnnRow | null> {
  await ensureCommunity();
  const r = await prisma.$queryRawUnsafe<AnnRow[]>(`SELECT * FROM "CommunityAnnotation" WHERE "id" = $1 LIMIT 1`, id);
  return r[0] ?? null;
}

export async function getModerationQueue(): Promise<{ pending: AnnRow[]; recent: AnnRow[] }> {
  await ensureCommunity();
  const pending = await prisma.$queryRawUnsafe<AnnRow[]>(`SELECT * FROM "CommunityAnnotation" WHERE "status" = 'pending' ORDER BY "createdAt" ASC`);
  const recent = await prisma.$queryRawUnsafe<AnnRow[]>(`SELECT * FROM "CommunityAnnotation" WHERE "status" <> 'pending' ORDER BY "reviewedAt" DESC NULLS LAST LIMIT 40`);
  return { pending, recent };
}

export async function getModerationStats(): Promise<{ approved: number; rejected: number; pending: number; total: number }> {
  await ensureCommunity();
  const r = await prisma.$queryRawUnsafe<{ status: string; c: number }[]>(`SELECT "status", COUNT(*)::int AS c FROM "CommunityAnnotation" GROUP BY "status"`);
  const m: Record<string, number> = {};
  for (const row of r) m[row.status] = Number(row.c);
  const approved = m.approved ?? 0, rejected = m.rejected ?? 0, pending = m.pending ?? 0;
  return { approved, rejected, pending, total: approved + rejected + pending };
}

export async function moderate(id: string, decision: "approved" | "rejected", reviewer: string): Promise<void> {
  await ensureCommunity();
  await prisma.$executeRaw`UPDATE "CommunityAnnotation" SET "status" = ${decision}, "reviewedBy" = ${reviewer}, "reviewedAt" = now() WHERE "id" = ${id}`;
}

export async function createAnnotation(a: { authorSlug: string; authorName: string; songTitle: string; word: string; note: string }): Promise<string> {
  await ensureCommunity();
  const id = `u-${a.authorSlug}-${Date.now().toString(36)}`;
  await prisma.$executeRaw`
    INSERT INTO "CommunityAnnotation" ("id","authorSlug","authorName","songTitle","word","romanization","note","status")
    VALUES (${id}, ${a.authorSlug}, ${a.authorName}, ${a.songTitle}, ${a.word}, ${""}, ${a.note}, 'pending')`;
  return id;
}
