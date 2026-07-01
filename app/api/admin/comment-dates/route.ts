import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Inspect + re-date the two comment stores:
//   • Comment            — real/seeded comments rendered on artist/song pages (CommentsSection)
//   • CommunityComment   — seeded comments rendered on user profiles
// GET returns both, with entity names + the ArtistNews dates (for the "comment can't
// predate the news it references" consistency check). POST updates createdAt in bulk.
function authed(req: NextRequest): boolean {
  const s = process.env.IMAGE_REFRESH_SECRET;
  return !!s && req.headers.get("authorization") === `Bearer ${s}`;
}

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, body: true, entityType: true, entityId: true, createdAt: true, user: { select: { displayName: true } } },
  });
  const artistIds = comments.filter((c) => c.entityType === "artist").map((c) => c.entityId);
  const songIds = comments.filter((c) => c.entityType === "song").map((c) => c.entityId);
  const [artists, songs, community, news] = await Promise.all([
    prisma.artist.findMany({ where: { id: { in: artistIds } }, select: { id: true, stageName: true, slug: true } }),
    prisma.song.findMany({ where: { id: { in: songIds } }, select: { id: true, title: true, slug: true } }),
    prisma.$queryRawUnsafe<{ id: string; authorName: string; context: string; body: string; createdAt: Date }[]>(
      `SELECT "id","authorName","context","body","createdAt" FROM "CommunityComment" ORDER BY "createdAt" ASC`,
    ),
    prisma.artistNews.findMany({
      orderBy: { publishedAt: "asc" },
      select: { headline: true, category: true, publishedAt: true, artist: { select: { stageName: true } } },
    }),
  ]);
  const aMap = Object.fromEntries(artists.map((a) => [a.id, a]));
  const sMap = Object.fromEntries(songs.map((s) => [s.id, s]));

  return NextResponse.json({
    counts: { comment: comments.length, community: community.length, news: news.length },
    comment: comments.map((c) => ({
      id: c.id,
      entityType: c.entityType,
      entity: c.entityType === "artist" ? aMap[c.entityId]?.stageName ?? c.entityId
        : c.entityType === "song" ? sMap[c.entityId]?.title ?? c.entityId : c.entityId,
      slug: c.entityType === "artist" ? aMap[c.entityId]?.slug : c.entityType === "song" ? sMap[c.entityId]?.slug : undefined,
      user: c.user?.displayName,
      createdAt: c.createdAt,
      body: c.body,
    })),
    community: community.map((c) => ({ id: c.id, author: c.authorName, context: c.context, createdAt: c.createdAt, body: c.body })),
    news: news.map((n) => ({ artist: n.artist?.stageName, category: n.category, publishedAt: n.publishedAt, headline: n.headline })),
  });
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const table = String(b?.table ?? "");
  const updates: { id: string; createdAt: string }[] = Array.isArray(b?.updates) ? b.updates : [];
  let updated = 0;

  if (table === "comment") {
    for (const u of updates) {
      await prisma.comment.update({ where: { id: String(u.id) }, data: { createdAt: new Date(u.createdAt) } });
      updated++;
    }
  } else if (table === "community") {
    for (const u of updates) {
      await prisma.$executeRawUnsafe(`UPDATE "CommunityComment" SET "createdAt" = $1 WHERE "id" = $2`, new Date(u.createdAt), String(u.id));
      updated++;
    }
  } else {
    return NextResponse.json({ error: "table must be comment|community" }, { status: 400 });
  }
  return NextResponse.json({ ok: true, table, updated });
}
