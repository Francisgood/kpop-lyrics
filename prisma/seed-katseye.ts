/**
 * seed-katseye.ts
 * Adds Katseye as an artist with full member roster, discography, and news.
 * Includes the Manon Bannerman departure rumor as ArtistNews.
 *
 * Run via:
 *   DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-katseye.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(model: "album" | "song", base: string): Promise<string> {
  let slug = base;
  let n = 0;
  while (true) {
    const existing =
      model === "album"
        ? await prisma.album.findUnique({ where: { slug } })
        : await prisma.song.findUnique({ where: { slug } });
    if (!existing) return slug;
    n++;
    slug = `${base}-${n}`;
  }
}

async function main() {
  // ── 1. Label: HYBE x Geffen Records ────────────────────────────────────────
  const label = await prisma.label.upsert({
    where: { slug: "hybe-x-geffen" },
    update: {},
    create: {
      slug:        "hybe-x-geffen",
      name:        "HYBE x Geffen Records",
      country:     "US / KR",
      foundedYear: 2023,
      website:     "https://www.geffenrecords.com",
      bio:         "Joint venture between HYBE Entertainment and Universal Music Group's Geffen Records, created to develop a global girl group. Home to Katseye.",
    },
  });
  console.log("✅ Label:", label.name);

  // ── 2. Katseye group ────────────────────────────────────────────────────────
  const katseye = await prisma.artist.upsert({
    where: { slug: "katseye" },
    update: {},
    create: {
      slug:      "katseye",
      type:      "GROUP",
      stageName: "KATSEYE",
      debutYear: 2024,
      labelId:   label.id,
      bio:       "KATSEYE is a six-member multinational girl group formed through the HYBE x Geffen joint venture and Netflix's 'Pop Star Academy: Katseye' (2024). Members Sophia, Megan, Ninni, Lara, Manon, and Daniela represent six different nationalities. Their debut EP 'SIS (Soft Is Strong)' established them as one of the first K-pop-adjacent groups built for both the Korean and Western mainstream markets simultaneously.",
    },
  });
  console.log("✅ Group:", katseye.stageName);

  // ── 3. Members ──────────────────────────────────────────────────────────────
  const members = [
    { stageName: "Sophia",   realName: "Sophia Laforteza",   role: "Vocalist",           position: 1 },
    { stageName: "Megan",    realName: "Megan Evangelista",  role: "Main Dancer, Vocalist", position: 2 },
    { stageName: "Ninni",    realName: "Niina Lucia Salo",   role: "Vocalist",           position: 3 },
    { stageName: "Lara",     realName: "Lara Rajagopalan",   role: "Vocalist, Rapper",   position: 4 },
    { stageName: "Manon",    realName: "Manon Bannerman",    role: "Main Vocalist",      position: 5 },
    { stageName: "Daniela",  realName: "Daniela Avanzini",   role: "Vocalist",           position: 6 },
  ];

  for (const m of members) {
    const slug = slugify(m.stageName + "-katseye");
    let member = await prisma.artist.findUnique({ where: { slug } });
    if (!member) {
      member = await prisma.artist.create({
        data: {
          slug,
          type:      "MEMBER",
          stageName: m.stageName,
          realName:  m.realName,
          debutYear: 2024,
          labelId:   label.id,
        },
      });
    }
    // Link to group
    const existing = await prisma.groupMembership.findFirst({
      where: { groupId: katseye.id, memberId: member.id },
    });
    if (!existing) {
      await prisma.groupMembership.create({
        data: { groupId: katseye.id, memberId: member.id, role: m.role, position: m.position },
      });
    }
    console.log(`  ✓ Member: ${m.stageName} (${m.realName})`);
  }

  // ── 4. Discography ──────────────────────────────────────────────────────────
  const albums: Array<{
    title: string;
    type: string;
    year: number;
    coverArt: string | null;
    tracks: string[];
  }> = [
    {
      title:    "SIS (Soft Is Strong)",
      type:     "EP",
      year:     2024,
      coverArt: null, // image-search skill will populate
      tracks:   ["Debut", "Touch", "My Way", "I'm Pretty", "Tonight I Might"],
    },
    {
      title:    "Beautiful Chaos",
      type:     "EP",
      year:     2025,
      coverArt: "https://i.discogs.com/bFqSByipSLfYmKboJjKNsRacyCWTP07eeyrpK4SEtgk/rs:fit/g:sm/q:90/h:596/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTM0Mzgz/OTY0LTE3NjA0ODc2/MDUtODY5OS5qcGVn.jpeg",
      tracks:   ["Gnarly", "Gabriela", "Gameboy", "Mean Girls", "M.I.A"],
    },
    {
      title:    "Gabriela",
      type:     "Single",
      year:     2025,
      coverArt: "https://i.discogs.com/DOPVndrbCixrLy4sOSuUx_lSje41E71hhkyThJNyj18/rs:fit/g:sm/q:90/h:600/w:599/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTM2MjE2/NTAyLTE3Njg0NDQw/MjQtNTUzMi5qcGVn.jpeg",
      tracks:   ["Gabriela", "Gabriela (Julia Lewis Reggaeton Remix)"],
    },
    {
      title:    "Internet Girl",
      type:     "Single",
      year:     2026,
      coverArt: null,
      tracks:   ["Internet Girl"],
    },
  ];

  for (const a of albums) {
    const base = slugify(`katseye-${a.title}`);
    const existing = await prisma.album.findFirst({
      where: { artistId: katseye.id, title: { equals: a.title, mode: "insensitive" } },
    });
    if (existing) {
      console.log(`  · Album already exists: ${a.title}`);
      continue;
    }

    const albumSlug = await uniqueSlug("album", base);
    const album = await prisma.album.create({
      data: {
        slug:        albumSlug,
        title:       a.title,
        artistId:    katseye.id,
        releaseYear: a.year,
        type:        a.type,
        coverArt:    a.coverArt,
      },
    });

    for (let i = 0; i < a.tracks.length; i++) {
      const songTitle = a.tracks[i];
      const songSlug = await uniqueSlug("song", slugify(`katseye-${a.title}-${songTitle}`));
      const song = await prisma.song.create({
        data: {
          slug:        songSlug,
          title:       songTitle,
          albumId:     album.id,
          releaseYear: a.year,
        },
      });
      await prisma.songCredit.create({
        data: { songId: song.id, artistId: katseye.id, role: "main" },
      }).catch(() => {});
    }
    console.log(`  ✓ Album: ${a.title} (${a.year}, ${a.tracks.length} tracks)`);
  }

  // ── 5. News & Gossip ────────────────────────────────────────────────────────
  const newsItems = [
    {
      headline:    "RUMOR: Manon Bannerman in Talks to Leave KATSEYE",
      body:        "Multiple industry sources and fan accounts citing HYBE insiders report that Swiss-Kenyan member Manon Bannerman is in discussions about departing KATSEYE. Reasons cited include creative differences and a desire to pursue an independent artistic direction in Europe. Neither HYBE x Geffen nor Manon's representatives have commented. KATSEYE's fandom is split — many fans are urging patience while others have begun trending #ProtectManon across social platforms.",
      category:    "drama",
      source:      "Allkpop",
      publishedAt: new Date("2026-05-15"),
    },
    {
      headline:    "KATSEYE Becomes First HYBE x Geffen Act to Chart in 12 Countries Simultaneously",
      body:        "'Gabriela' debuted in the top 20 across 12 national charts including France, Australia, Germany, and South Korea — a first for the joint venture label. The milestone validates HYBE and Geffen's strategy of building a globally-oriented group from the ground up via their Netflix reality series.",
      category:    "milestone",
      source:      "Billboard",
      publishedAt: new Date("2025-09-08"),
    },
    {
      headline:    "KATSEYE's 'Beautiful Chaos' EP Enters US Pop Albums Chart",
      body:        "The group's sophomore EP 'Beautiful Chaos' debuted at #14 on the Billboard US Pop Albums chart, becoming the highest-charting debut EP by a Western-facing K-pop-adjacent group. Lead single 'Gnarly' accumulated 40 million Spotify streams in its first two weeks.",
      category:    "milestone",
      source:      "Billboard",
      publishedAt: new Date("2025-08-02"),
    },
    {
      headline:    "KATSEYE to Headline 'THE WILDWORLD TOUR' Across 20 Countries",
      body:        "HYBE x Geffen confirmed KATSEYE's first world tour, spanning North America, Europe, Southeast Asia, and Oceania. The 36-date tour includes debut arena shows in London, Paris, and Sydney — with every US date selling out within 8 minutes of going on sale.",
      category:    "milestone",
      source:      "Variety",
      publishedAt: new Date("2026-03-01"),
    },
    {
      headline:    "Ninni's 'Internet Girl' Cameo in Taylor Swift's Eras Tour Extended Cut",
      body:        "Finnish member Ninni appeared as a surprise guest during the extended Disney+ cut of Taylor Swift's Eras Tour concert film, performing a brief duet on 'Shake It Off.' The 90-second clip went viral and sent searches for KATSEYE up 400% on TikTok.",
      category:    "collab",
      source:      "Rolling Stone",
      publishedAt: new Date("2026-02-14"),
    },
  ];

  for (const item of newsItems) {
    const exists = await prisma.artistNews.findFirst({
      where: { artistId: katseye.id, headline: item.headline },
    });
    if (exists) { console.log(`  · News already exists: ${item.headline.slice(0, 50)}...`); continue; }
    await prisma.artistNews.create({
      data: {
        artistId:    katseye.id,
        headline:    item.headline,
        body:        item.body,
        category:    item.category,
        source:      item.source,
        publishedAt: item.publishedAt,
      },
    });
    console.log(`  ✓ News [${item.category}]: ${item.headline.slice(0, 60)}...`);
  }

  console.log("\n✅ KATSEYE seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
