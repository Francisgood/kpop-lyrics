import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Idempotent catalog/news ingest used by the daily content skills
 * (image-finder, latest-news, discography). Runs inside the deployed app, so it
 * can write to the production DB (which is unreachable locally). Everything
 * upserts by slug / natural key, so re-running with the same data is a no-op —
 * safe to run every day.
 *
 * Auth: Bearer ${IMAGE_REFRESH_SECRET} header (same automation secret as
 * /api/image-refresh). The secret MUST be set, or the endpoint rejects.
 */
function authed(req: NextRequest): boolean {
  const secret = process.env.IMAGE_REFRESH_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

type LabelIn = { slug: string; name: string; country?: string; foundedYear?: number; bio?: string; website?: string; logoUrl?: string };
type ArtistIn = { slug: string; type?: string; stageName: string; realName?: string; debutYear?: number; bio?: string; imageUrl?: string; labelSlug?: string };
type AlbumIn = { slug: string; title: string; artistSlug: string; releaseYear?: number; coverArt?: string; type?: string };
type SongIn = { slug: string; title: string; albumSlug?: string; releaseYear?: number; coverArt?: string; lyricsKo?: string; lyricsEn?: string; lyricsRomanized?: string; credits?: { artistSlug: string; role: string }[] };
type MembershipIn = { groupSlug: string; memberSlug: string; role?: string; position?: number };
type NewsIn = { artistSlug: string; headline: string; body: string; source?: string; sourceUrl?: string; category: string; publishedAt?: string };
type Payload = { labels?: LabelIn[]; artists?: ArtistIn[]; albums?: AlbumIn[]; songs?: SongIn[]; memberships?: MembershipIn[]; news?: NewsIn[] };

async function artistId(slug: string) {
  const a = await prisma.artist.findUnique({ where: { slug }, select: { id: true } });
  return a?.id ?? null;
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const p = (await req.json().catch(() => ({}))) as Payload;
    const counts = { labels: 0, artists: 0, albums: 0, songs: 0, memberships: 0, credits: 0, news: 0 };

    for (const l of p.labels ?? []) {
      const data = { name: l.name, country: l.country, foundedYear: l.foundedYear, bio: l.bio, website: l.website, logoUrl: l.logoUrl };
      await prisma.label.upsert({ where: { slug: l.slug }, create: { slug: l.slug, ...data }, update: data });
      counts.labels++;
    }

    for (const a of p.artists ?? []) {
      const labelId = a.labelSlug ? (await prisma.label.findUnique({ where: { slug: a.labelSlug }, select: { id: true } }))?.id : undefined;
      const data = { type: a.type ?? "soloist", stageName: a.stageName, realName: a.realName, debutYear: a.debutYear, bio: a.bio, imageUrl: a.imageUrl, labelId };
      await prisma.artist.upsert({ where: { slug: a.slug }, create: { slug: a.slug, ...data }, update: data });
      counts.artists++;
    }

    for (const al of p.albums ?? []) {
      const aid = await artistId(al.artistSlug);
      if (!aid) continue;
      const data = { title: al.title, artistId: aid, releaseYear: al.releaseYear, coverArt: al.coverArt, type: al.type ?? "album" };
      await prisma.album.upsert({ where: { slug: al.slug }, create: { slug: al.slug, ...data }, update: data });
      counts.albums++;
    }

    for (const s of p.songs ?? []) {
      const albumId = s.albumSlug ? (await prisma.album.findUnique({ where: { slug: s.albumSlug }, select: { id: true } }))?.id : undefined;
      const data = { title: s.title, albumId, releaseYear: s.releaseYear, coverArt: s.coverArt, lyricsKo: s.lyricsKo, lyricsEn: s.lyricsEn, lyricsRomanized: s.lyricsRomanized };
      const song = await prisma.song.upsert({ where: { slug: s.slug }, create: { slug: s.slug, ...data }, update: data });
      counts.songs++;
      for (const c of s.credits ?? []) {
        const aid = await artistId(c.artistSlug);
        if (!aid) continue;
        const existing = await prisma.songCredit.findFirst({ where: { songId: song.id, artistId: aid, role: c.role } });
        if (!existing) { await prisma.songCredit.create({ data: { songId: song.id, artistId: aid, role: c.role } }); counts.credits++; }
      }
    }

    for (const m of p.memberships ?? []) {
      const gid = await artistId(m.groupSlug);
      const mid = await artistId(m.memberSlug);
      if (!gid || !mid) continue;
      const existing = await prisma.groupMembership.findFirst({ where: { groupId: gid, memberId: mid } });
      if (existing) await prisma.groupMembership.update({ where: { id: existing.id }, data: { role: m.role, position: m.position ?? 0 } });
      else await prisma.groupMembership.create({ data: { groupId: gid, memberId: mid, role: m.role, position: m.position ?? 0 } });
      counts.memberships++;
    }

    for (const n of p.news ?? []) {
      const aid = await artistId(n.artistSlug);
      if (!aid) continue;
      const dupe = await prisma.artistNews.findFirst({ where: n.sourceUrl ? { sourceUrl: n.sourceUrl } : { artistId: aid, headline: n.headline } });
      if (dupe) continue;
      await prisma.artistNews.create({ data: { artistId: aid, headline: n.headline, body: n.body, source: n.source, sourceUrl: n.sourceUrl, category: n.category, publishedAt: n.publishedAt ? new Date(n.publishedAt) : null } });
      counts.news++;
    }

    return NextResponse.json({ ok: true, counts });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// Snapshot of catalog sizes — handy for the skills to verify before/after.
export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [labels, artists, albums, songs, news] = await Promise.all([
    prisma.label.count(), prisma.artist.count(), prisma.album.count(), prisma.song.count(), prisma.artistNews.count(),
  ]);
  return NextResponse.json({ labels, artists, albums, songs, news });
}
