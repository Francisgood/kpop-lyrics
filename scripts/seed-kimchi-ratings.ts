/**
 * Seed dummy Kimchi Ratings for 100 songs and 30 artists.
 * Distributes ratings of 3, 4, or 5 kimchis from existing bot users.
 *
 * Usage:
 *   DATABASE_URL="..." DIRECT_URL="..." \
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-kimchi-ratings.ts
 *
 * Flags:
 *   --dry-run   Preview counts without writing to DB
 */

import { prisma } from "../lib/prisma";

const DRY_RUN = process.argv.includes("--dry-run");

// Weighted random pick of 3, 4, or 5 — skewed positive as requested
function pickRating(): number {
  const r = Math.random();
  if (r < 0.15) return 3;   // 15% get 3 kimchis
  if (r < 0.50) return 4;   // 35% get 4 kimchis
  return 5;                  // 50% get 5 kimchis
}

// Pick a random subset of `n` items from array without replacement
function sample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

async function main() {
  console.log("══════════════════════════════════════════════════");
  console.log("  Aegyo Arena — Seed Kimchi Ratings");
  if (DRY_RUN) console.log("  [DRY RUN]");
  console.log("══════════════════════════════════════════════════\n");

  // All user IDs available
  const allUsers = await prisma.user.findMany({ select: { id: true } });
  if (allUsers.length === 0) throw new Error("No users found — run seed-users first");
  const userIds = allUsers.map((u) => u.id);
  console.log(`Found ${userIds.length} users to distribute ratings\n`);

  // ── Songs: 100 top-viewed songs ──────────────────────────────────────────────
  const songs = await prisma.song.findMany({
    orderBy: { viewCount: "desc" },
    take: 100,
    select: { id: true, title: true, album: { select: { artist: { select: { stageName: true } } } } },
  });
  console.log(`Seeding ${songs.length} songs...\n`);

  let songRatingsCreated = 0;
  for (const song of songs) {
    // Each song rated by 8–28 random users
    const raterCount = 8 + Math.floor(Math.random() * 21);
    const raters = sample(userIds, raterCount);

    if (!DRY_RUN) {
      for (const userId of raters) {
        await prisma.kimchiRating.upsert({
          where: { entityType_entityId_userId: { entityType: "song", entityId: song.id, userId } },
          create: { entityType: "song", entityId: song.id, userId, rating: pickRating() },
          update: {},
        });
      }
    }
    songRatingsCreated += raters.length;
    const artist = song.album?.artist?.stageName ?? "—";
    console.log(`  ✓ "${song.title}" by ${artist} — ${raters.length} ratings`);
  }

  // ── Artists: 30 — must include BTS, NewJeans, BLACKPINK, Lisa ───────────────
  const REQUIRED_SLUGS = ["bts", "newjeans", "blackpink", "lisa"];
  const requiredArtists = await prisma.artist.findMany({
    where: { slug: { in: REQUIRED_SLUGS } },
    select: { id: true, stageName: true, slug: true },
  });

  // Fill remaining 26 spots from popular artists (by album count as proxy)
  const otherArtists = await prisma.artist.findMany({
    where: { slug: { notIn: REQUIRED_SLUGS } },
    orderBy: { albums: { _count: "desc" } },
    take: 26,
    select: { id: true, stageName: true, slug: true },
  });

  const artistsToSeed = [...requiredArtists, ...otherArtists];
  console.log(`\nSeeding ${artistsToSeed.length} artists...\n`);

  let artistRatingsCreated = 0;
  for (const artist of artistsToSeed) {
    // Each artist rated by 10–32 random users (artists get more votes)
    const raterCount = 10 + Math.floor(Math.random() * 23);
    const raters = sample(userIds, raterCount);

    if (!DRY_RUN) {
      for (const userId of raters) {
        await prisma.kimchiRating.upsert({
          where: { entityType_entityId_userId: { entityType: "artist", entityId: artist.id, userId } },
          create: { entityType: "artist", entityId: artist.id, userId, rating: pickRating() },
          update: {},
        });
      }
    }
    artistRatingsCreated += raters.length;
    console.log(`  ✓ ${artist.stageName} (${artist.slug}) — ${raters.length} ratings`);
  }

  console.log("\n────────────────────────────────────────────────");
  console.log(`Song ratings:   ${songRatingsCreated} (across ${songs.length} songs)`);
  console.log(`Artist ratings: ${artistRatingsCreated} (across ${artistsToSeed.length} artists)`);
  console.log(`Total:          ${songRatingsCreated + artistRatingsCreated}`);
  if (DRY_RUN) console.log("\n[DRY RUN] — no changes written to DB");
  console.log("\n✅  Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
