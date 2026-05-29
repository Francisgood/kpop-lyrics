/**
 * Generate and refresh ContentSignals for Aegyo Arena.
 * Runs from real DB data — no external scraping required.
 *
 * Usage:
 *   DATABASE_URL="..." DIRECT_URL="..." \
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/sync-signals.ts
 */
import { prisma } from "../lib/prisma";

const NOW = new Date();
const SEVEN_DAYS_AGO = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000);
const FOURTEEN_DAYS_AGO = new Date(NOW.getTime() - 14 * 24 * 60 * 60 * 1000);
const THIRTY_DAYS_AGO = new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function hasRecentSignal(entityType: string, entityId: string, days = 7): Promise<boolean> {
  const cutoff = new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000);
  const existing = await prisma.contentSignal.findFirst({
    where: { entityType, entityId, createdAt: { gte: cutoff } },
  });
  return !!existing;
}

async function generateArtistSignals() {
  const artists = await prisma.artist.findMany({
    where: { type: { in: ["GROUP", "SOLOIST"] } },
    select: {
      id: true,
      slug: true,
      stageName: true,
      albums: {
        select: { title: true, releaseYear: true, songs: { select: { title: true } } },
        orderBy: { releaseYear: "desc" },
        take: 2,
      },
      songs: {
        select: { song: { select: { id: true, title: true, viewCount: true } } },
        orderBy: { song: { viewCount: "desc" } },
        take: 3,
      },
      cities: { include: { city: true }, take: 2 },
      news: { where: { publishedAt: { gte: THIRTY_DAYS_AGO } }, select: { headline: true }, take: 1 },
    },
  });

  let created = 0;
  for (const artist of artists) {
    if (await hasRecentSignal("artist", artist.id, 7)) continue;

    const latestAlbum = artist.albums[0];
    const topSong = artist.songs[0]?.song;
    const city = artist.cities[0]?.city;
    const recentNews = artist.news[0];

    let headline = "";
    let body = "";
    let category = "community";

    if (latestAlbum && latestAlbum.releaseYear === 2025) {
      category = "release";
      headline = `${artist.stageName} Drop ${latestAlbum.title} — Fans Dig Deep Into the Lyrics`;
      body = `The ${latestAlbum.songs.length}-track project is generating serious annotation energy on Aegyo Arena. Fans are racing to document every lyrical reference and cultural hook before the weekend streaming push.`;
    } else if (latestAlbum && latestAlbum.releaseYear === 2024) {
      category = "release";
      headline = `${artist.stageName}'s ${latestAlbum.title} Still Moving Charts a Year Later`;
      body = `Longtail streaming on ${latestAlbum.title} proves the album's staying power. The lyrics continue to generate discussion in annotation threads — particularly the bridge of ${latestAlbum.songs[0]?.title ?? "the title track"}.`;
    } else if (topSong && topSong.viewCount > 500) {
      category = "trending";
      headline = `"${topSong.title}" by ${artist.stageName} Trending on Aegyo Arena This Week`;
      body = `View counts are spiking on the song page. Annotation contributors are adding cultural context as new fans arrive via streaming platform playlists. Worth checking the expanded notes section.`;
    } else if (recentNews) {
      category = "collab";
      headline = `${artist.stageName} In the Headlines: ${recentNews.headline.slice(0, 80)}`;
      body = `The recent news cycle is bringing new listeners to ${artist.stageName}'s Aegyo Arena page. A good moment to revisit the annotations on their catalog and add fresh context.`;
    } else if (city) {
      category = "community";
      headline = `${city.name} ${artist.stageName} Fans Building Out the Wiki Pages`;
      body = `Contributors from ${city.name} are among the most active annotators this week. The local fan scene is adding city-specific context to ${artist.stageName}'s lyrics that global fans are rating highly.`;
    } else {
      headline = `${artist.stageName} Catalog: Community Annotation Drive Underway`;
      body = `Aegyo Arena contributors are working through ${artist.stageName}'s discography to surface hidden lyrical references, Korean cultural context, and fan-theory connections. Join the conversation on the song pages.`;
    }

    await prisma.contentSignal.create({
      data: {
        entityType: "artist",
        entityId: artist.id,
        headline,
        body,
        category,
        publishedAt: NOW,
      },
    });
    created++;
  }
  return created;
}

async function generateTermSignals() {
  const terms = await prisma.codedTerm.findMany({
    where: {
      annotations: { some: {} },
    },
    select: {
      id: true,
      term: true,
      slug: true,
      annotations: { select: { id: true, song: { select: { title: true, album: { select: { artist: { select: { stageName: true } } } } } } }, take: 3 },
      definitions: { select: { body: true }, take: 1, orderBy: { votesUp: "desc" } },
    },
  });

  let created = 0;
  for (const term of terms) {
    if (await hasRecentSignal("term", term.id, 14)) continue;
    if (term.annotations.length < 1) continue;

    const songExamples = term.annotations
      .map(a => `"${a.song?.title}" (${a.song?.album?.artist?.stageName ?? "?"})`)
      .slice(0, 2)
      .join(", ");

    await prisma.contentSignal.create({
      data: {
        entityType: "term",
        entityId: term.id,
        termId: term.id,
        headline: `"${term.term}" — Community Annotations Growing`,
        body: `This K-pop term now appears in annotations across ${term.annotations.length} lyric${term.annotations.length !== 1 ? "s" : ""}, including ${songExamples}. ${term.definitions[0]?.body?.slice(0, 120) ?? "Check the definition page for cultural context."}.`,
        category: "community",
        publishedAt: NOW,
      },
    });
    created++;
  }
  return created;
}

async function generateCitySignals() {
  const cities = await prisma.city.findMany({
    include: {
      events: { where: { eventDate: { gt: NOW.toISOString().slice(0, 7) } }, orderBy: { eventDate: "asc" }, take: 2 },
      artists: { include: { artist: { select: { stageName: true } } }, take: 3 },
    },
  });

  let created = 0;
  for (const city of cities) {
    if (await hasRecentSignal("city", city.id, 30)) continue;

    const upcomingEvent = city.events[0];
    const artistNames = city.artists.map(ac => ac.artist.stageName).join(", ");

    if (upcomingEvent) {
      await prisma.contentSignal.create({
        data: {
          entityType: "city",
          entityId: city.id,
          headline: `${city.name}: ${upcomingEvent.title} Coming ${upcomingEvent.eventDate}`,
          body: `${city.flag ?? ""} K-pop fans in ${city.name} have an upcoming event to look forward to. Check the city page for venue details${upcomingEvent.venue ? ` at ${upcomingEvent.venue}` : ""} and connect with local stans.`,
          category: "tour",
          publishedAt: NOW,
        },
      });
      created++;
    } else if (artistNames) {
      await prisma.contentSignal.create({
        data: {
          entityType: "city",
          entityId: city.id,
          headline: `${city.flag ?? ""} ${city.name} K-pop Scene: ${artistNames} Most Followed`,
          body: `The ${city.name} fan community is active on Aegyo Arena, with ${artistNames} leading local engagement. Check the city page to connect with stans in your area and see which songs are charting locally.`,
          category: "community",
          publishedAt: NOW,
        },
      });
      created++;
    }
  }
  return created;
}

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  Aegyo Arena — Sync Content Signals");
  console.log("═══════════════════════════════════════════════════\n");

  const [artistCount, termCount, cityCount] = await Promise.all([
    generateArtistSignals(),
    generateTermSignals(),
    generateCitySignals(),
  ]);

  console.log(`Artist signals created: ${artistCount}`);
  console.log(`Term signals created:   ${termCount}`);
  console.log(`City signals created:   ${cityCount}`);
  console.log(`Total:                  ${artistCount + termCount + cityCount}`);
  console.log("\n✅  Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
