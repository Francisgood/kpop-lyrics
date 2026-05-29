/**
 * Refresh TrendingCache for songs, artists, and terms.
 * Run daily. Prunes stale daily entries older than 2 days.
 *
 * Usage:
 *   DATABASE_URL="..." DIRECT_URL="..." \
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/refresh-trending.ts
 */
import { prisma } from "../lib/prisma";

const NOW = new Date();
const ONE_YEAR_AGO = new Date(NOW.getFullYear() - 1, NOW.getMonth(), NOW.getDate());
const SEVEN_DAYS_AGO = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000);
const TWO_DAYS_AGO = new Date(NOW.getTime() - 2 * 24 * 60 * 60 * 1000);

async function scoreSongs() {
  const songs = await prisma.song.findMany({
    select: {
      id: true,
      title: true,
      viewCount: true,
      releaseYear: true,
      annotations: { select: { id: true } },
      album: { select: { artist: { select: { stageName: true } } } },
    },
  });

  // Recent comment counts per song
  const recentComments = await prisma.comment.groupBy({
    by: ["entityId"],
    where: { entityType: "song", createdAt: { gte: SEVEN_DAYS_AGO } },
    _count: { id: true },
  });
  const commentMap = new Map(recentComments.map(r => [r.entityId, r._count.id]));

  const scored = songs.map(s => {
    let score = s.viewCount;
    if (s.releaseYear && new Date(s.releaseYear, 0, 1) >= ONE_YEAR_AGO) score *= 1.5;
    if (s.annotations.length >= 1) score += 200;
    score += (commentMap.get(s.id) ?? 0) * 50;
    return { id: s.id, title: s.title, artist: s.album?.artist?.stageName ?? "?", score };
  });

  for (const s of scored) {
    for (const period of ["daily", "weekly", "monthly"] as const) {
      await prisma.trendingCache.upsert({
        where: { entityType_entityId_period: { entityType: "song", entityId: s.id, period } },
        create: { entityType: "song", entityId: s.id, score: s.score, period, computedAt: NOW },
        update: { score: s.score, computedAt: NOW },
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

async function scoreArtists() {
  const artists = await prisma.artist.findMany({
    where: { type: { in: ["GROUP", "SOLOIST"] } },
    select: {
      id: true,
      stageName: true,
      songs: { select: { song: { select: { viewCount: true } } } },
      news: { where: { publishedAt: { gte: new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000) } }, select: { id: true } },
      memberships: { select: { id: true } },
    },
  });

  const scored = artists.map(a => {
    const viewSum = a.songs.reduce((sum, sc) => sum + sc.song.viewCount, 0);
    const newsBoost = a.news.length > 0 ? 500 : 0;
    const memberBoost = a.memberships.length * 200;
    const score = viewSum + newsBoost + memberBoost;
    return { id: a.id, name: a.stageName, score };
  });

  for (const a of scored) {
    for (const period of ["daily", "weekly", "monthly"] as const) {
      await prisma.trendingCache.upsert({
        where: { entityType_entityId_period: { entityType: "artist", entityId: a.id, period } },
        create: { entityType: "artist", entityId: a.id, score: a.score, period, computedAt: NOW },
        update: { score: a.score, computedAt: NOW },
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

async function scoreTerms() {
  const terms = await prisma.codedTerm.findMany({
    select: {
      id: true,
      term: true,
      annotations: { select: { id: true } },
      definitions: { select: { votesUp: true, votesDown: true } },
    },
  });

  const scored = terms.map(t => {
    const annScore = t.annotations.length * 100;
    const voteScore = t.definitions.reduce((sum, d) => sum + (d.votesUp - d.votesDown) * 10, 0);
    const score = annScore + voteScore;
    return { id: t.id, term: t.term, score };
  });

  for (const t of scored) {
    for (const period of ["daily", "weekly", "monthly"] as const) {
      await prisma.trendingCache.upsert({
        where: { entityType_entityId_period: { entityType: "term", entityId: t.id, period } },
        create: { entityType: "term", entityId: t.id, score: t.score, period, computedAt: NOW },
        update: { score: t.score, computedAt: NOW },
      });
    }
  }

  return scored.sort((a, b) => b.score - a.score);
}

async function pruneStaleDaily() {
  const { count } = await prisma.trendingCache.deleteMany({
    where: { period: "daily", computedAt: { lt: TWO_DAYS_AGO } },
  });
  return count;
}

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("  Aegyo Arena — Refresh Trending Cache");
  console.log("═══════════════════════════════════════════════\n");

  const [songs, artists, terms, pruned] = await Promise.all([
    scoreSongs(),
    scoreArtists(),
    scoreTerms(),
    pruneStaleDaily(),
  ]);

  console.log(`Songs scored:   ${songs.length}`);
  console.log(`Artists scored: ${artists.length}`);
  console.log(`Terms scored:   ${terms.length}`);
  console.log(`Stale daily entries pruned: ${pruned}\n`);

  console.log("Top 5 songs (daily score):");
  songs.slice(0, 5).forEach((s, i) => console.log(`  ${i + 1}. "${s.title}" — ${s.artist} (${s.score.toFixed(0)})`));

  console.log("\nTop 3 artists:");
  artists.slice(0, 3).forEach((a, i) => console.log(`  ${i + 1}. ${a.name} (${a.score.toFixed(0)})`));

  console.log("\n✅  Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
