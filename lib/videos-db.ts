// Server-only DB layer for per-entity videos. Self-healing raw table (NewsPost /
// Poll pattern — no migration). Idempotent upsert keyed on (entityType, entitySlug,
// kind, ref) so re-ingesting the same video is a no-op.
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import type { VideoItem, VideoKind } from "@/lib/videos";

let ready = false;
async function ensure() {
  if (ready) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Video" (
      "id"         TEXT PRIMARY KEY,
      "entityType" TEXT NOT NULL,
      "entitySlug" TEXT NOT NULL,
      "kind"       TEXT NOT NULL,
      "ref"        TEXT NOT NULL,
      "title"      TEXT,
      "titleEs"    TEXT,
      "note"       TEXT,
      "noteEs"     TEXT,
      "sortOrder"  INTEGER NOT NULL DEFAULT 0,
      "createdAt"  TIMESTAMP NOT NULL DEFAULT now()
    )`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Video_entity_idx" ON "Video" ("entityType","entitySlug")`);
  ready = true;
}

export type VideoIn = {
  entityType: "artist" | "song";
  entitySlug: string;
  kind: VideoKind;
  ref: string;
  title?: string | null;
  titleEs?: string | null;
  note?: string | null;
  noteEs?: string | null;
  sortOrder?: number;
};

export async function ingestVideos(vids: VideoIn[]): Promise<number> {
  await ensure();
  let n = 0;
  for (const v of vids) {
    const kind = v?.kind;
    if (!v?.entitySlug || !v?.ref || (kind !== "youtube" && kind !== "instagram" && kind !== "tiktok")) continue;
    const entityType = v.entityType === "song" ? "song" : "artist";
    const id = createHash("sha256").update(`${entityType}|${v.entitySlug}|${kind}|${v.ref}`).digest("hex").slice(0, 24);
    await prisma.$executeRaw`
      INSERT INTO "Video" ("id","entityType","entitySlug","kind","ref","title","titleEs","note","noteEs","sortOrder")
      VALUES (${id}, ${entityType}, ${v.entitySlug}, ${kind}, ${v.ref}, ${v.title ?? null}, ${v.titleEs ?? null}, ${v.note ?? null}, ${v.noteEs ?? null}, ${Number(v.sortOrder) || 0})
      ON CONFLICT ("id") DO UPDATE SET
        "title" = EXCLUDED."title", "titleEs" = EXCLUDED."titleEs",
        "note" = EXCLUDED."note", "noteEs" = EXCLUDED."noteEs", "sortOrder" = EXCLUDED."sortOrder"`;
    n++;
  }
  return n;
}

export async function getVideos(entityType: "artist" | "song", entitySlug: string): Promise<VideoItem[]> {
  try {
    await ensure();
    const rows = await prisma.$queryRaw<{ kind: string; ref: string; title: string | null; titleEs: string | null; note: string | null; noteEs: string | null }[]>`
      SELECT "kind","ref","title","titleEs","note","noteEs" FROM "Video"
      WHERE "entityType" = ${entityType} AND "entitySlug" = ${entitySlug}
      ORDER BY "sortOrder" ASC, "createdAt" ASC`;
    return rows.map((r): VideoItem => ({
      kind: (r.kind === "instagram" || r.kind === "tiktok" ? r.kind : "youtube") as VideoKind,
      ref: r.ref, title: r.title, titleEs: r.titleEs, note: r.note, noteEs: r.noteEs,
    }));
  } catch { return []; }
}
