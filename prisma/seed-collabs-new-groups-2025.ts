/**
 * seed-collabs-new-groups-2025.ts
 * Adds notable collaborator / producer profiles and cross-credits
 * for the 25 new K-pop groups added in the May 2025 cross-reference.
 *
 * Key credits covered:
 *  - Hui (PENTAGON) — produced Wanna One "Energetic", Pentagon catalog
 *  - Zico (Block B) — solo artist + produced for multiple acts
 *  - Black Eyed Pilseung — produced STAYC, TWICE ("Cheer Up", "TT")
 *  - E.Dawn (PENTAGON / HyunA) — solo + credits
 *  - Lee Chanhyuk (AKMU) — producer credits for own group + IU collabs
 *
 * Run AFTER fetch-discogs-new-groups-2025.ts completes so songs exist in DB.
 *
 * Usage:
 *   DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
 *   DIRECT_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' \
 *   prisma/seed-collabs-new-groups-2025.ts
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function slugify(text: string): string {
  return text.toLowerCase().replace(/['']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function uniqueSlug(model: "album" | "song", base: string): Promise<string> {
  let slug = base; let n = 0;
  while (true) {
    const ex = model === "album"
      ? await prisma.album.findUnique({ where: { slug } })
      : await prisma.song.findUnique({ where: { slug } });
    if (!ex) return slug;
    n++; slug = `${base}-${n}`;
  }
}

async function addAlbum(
  artistId: string, artistSlug: string, title: string,
  type: string, year: number, tracks: string[], coverArt?: string
) {
  const exists = await prisma.album.findFirst({
    where: { artistId, title: { equals: title, mode: "insensitive" } }
  });
  if (exists) { console.log(`  · Skip album: ${title}`); return exists; }

  const slug = await uniqueSlug("album", slugify(`${artistSlug}-${title}`));
  const album = await prisma.album.create({
    data: { slug, title, artistId, releaseYear: year, type, coverArt: coverArt ?? null }
  });

  for (const track of tracks) {
    const songSlug = await uniqueSlug("song", slugify(`${slug}-${track}`));
    const song = await prisma.song.create({
      data: { slug: songSlug, title: track, albumId: album.id, releaseYear: year }
    });
    await prisma.songCredit.create({ data: { songId: song.id, artistId, role: "main" } }).catch(() => {});
  }
  console.log(`  ✓ Album: ${title} (${year}, ${tracks.length} tracks)`);
  return album;
}

async function addCredit(
  collaboratorId: string, songTitle: string, mainArtistSlug: string, role: string
) {
  const song = await prisma.song.findFirst({
    where: {
      title: { equals: songTitle, mode: "insensitive" },
      album: { artist: { slug: mainArtistSlug } },
    }
  });
  if (!song) {
    console.warn(`  ⚠ Not found: "${songTitle}" by ${mainArtistSlug}`);
    return;
  }
  const exists = await prisma.songCredit.findFirst({
    where: { songId: song.id, artistId: collaboratorId }
  });
  if (!exists) {
    await prisma.songCredit.create({ data: { songId: song.id, artistId: collaboratorId, role } });
    console.log(`  ✓ Credit [${role}]: "${songTitle}" → ${mainArtistSlug}`);
  } else {
    console.log(`  · Credit exists: "${songTitle}"`);
  }
}

async function main() {
  const cube = await prisma.label.findUnique({ where: { slug: "cube-entertainment" } });
  const yg   = await prisma.label.findUnique({ where: { slug: "yg-entertainment" } });

  // ── 1. Hui (PENTAGON) — songwriter/producer ──────────────────────────────
  // Produced Wanna One's debut single "Energetic" and PENTAGON's discography
  console.log("\n── Hui (PENTAGON) ──");
  const hui = await prisma.artist.upsert({
    where:  { slug: "hui" },
    update: {},
    create: {
      slug:      "hui",
      type:      "MEMBER",
      stageName: "Hui",
      realName:  "Lee Hoe-taek",
      debutYear: 2016,
      labelId:   cube?.id,
      bio:       "Hui (휘, Lee Hoe-taek) is the leader and main vocalist of PENTAGON. He is one of K-pop's most prolific idol producers — his production credit on Wanna One's debut 'Energetic' (2017) earned him industry-wide recognition as a hitmaker. He also produces much of PENTAGON's catalog under the pen name HUI.",
    },
  });

  // Wire Hui as a PENTAGON member
  const pentagon = await prisma.artist.findUnique({ where: { slug: "pentagon" } });
  if (pentagon) {
    const existing = await prisma.groupMembership.findFirst({
      where: { groupId: pentagon.id, memberId: hui.id }
    });
    if (!existing) {
      await prisma.groupMembership.create({
        data: { groupId: pentagon.id, memberId: hui.id, role: "leader / main vocalist", position: 1 }
      });
      console.log("  ✓ GroupMembership: Hui → PENTAGON");
    }
  }

  await addCredit(hui.id, "Energetic", "wanna-one", "producer");
  await addCredit(hui.id, "Energetic", "wanna-one", "songwriter");

  // ── 2. Zico (Block B) — solo artist & prolific producer ─────────────────
  console.log("\n── Zico (Block B) ──");
  const zico = await prisma.artist.upsert({
    where:  { slug: "zico" },
    update: {},
    create: {
      slug:      "zico",
      type:      "MEMBER",
      stageName: "Zico",
      realName:  "Woo Ji-ho",
      debutYear: 2011,
      bio:       "Zico (지코, Woo Ji-ho) is the leader and main rapper of Block B. One of K-pop's most accomplished idol-producers, he founded KOZ Entertainment (now HYBE label), produced for BOYNEXTDOOR and other acts, and has an extensive solo discography. His 2020 single 'Any Song' topped charts for weeks and sparked the '#AnySongChallenge' trend on TikTok.",
    },
  });

  // Zico's key solo singles (albums added via Discogs separately; these are his most famous credits)
  await addAlbum(zico.id, "zico", "Any Song", "Single", 2020, ["Any Song"]);
  await addAlbum(zico.id, "zico", "Summer Hate", "Single", 2021, ["Summer Hate (feat. Rain)"]);

  // Block B connection
  const blockB = await prisma.artist.findUnique({ where: { slug: "block-b" } });
  if (blockB) {
    const existing = await prisma.groupMembership.findFirst({
      where: { groupId: blockB.id, memberId: zico.id }
    });
    if (!existing) {
      await prisma.groupMembership.create({
        data: { groupId: blockB.id, memberId: zico.id, role: "leader / main rapper", position: 1 }
      });
      console.log("  ✓ GroupMembership: Zico → Block B");
    }
  }

  // ── 3. Black Eyed Pilseung — production team behind STAYC ───────────────
  console.log("\n── Black Eyed Pilseung ──");
  const bep = await prisma.artist.upsert({
    where:  { slug: "black-eyed-pilseung" },
    update: {},
    create: {
      slug:      "black-eyed-pilseung",
      type:      "COLLAB",
      stageName: "Black Eyed Pilseung",
      debutYear: 2013,
      bio:       "Black Eyed Pilseung (블랙아이드필승) is a South Korean songwriting and production duo — Choi Kyu-sung and Hwang Hyun — responsible for some of K-pop's biggest hits. They produced TWICE's breakthrough singles 'Cheer Up' and 'TT', and founded High Up Entertainment specifically to launch and produce STAYC, whose entire discography they have written and produced.",
    },
  });

  // STAYC credits (Black Eyed Pilseung produced all STAYC music)
  const staycSongs = ["ASAP", "So Bad", "Stereotype", "BEAUTIFUL MONSTER", "POPPY", "RUN2U", "WORLDSTAR?"];
  for (const song of staycSongs) {
    await addCredit(bep.id, song, "stayc", "producer");
    await addCredit(bep.id, song, "stayc", "songwriter");
  }

  // TWICE credits
  await addCredit(bep.id, "Cheer Up", "twice", "producer");
  await addCredit(bep.id, "Cheer Up", "twice", "songwriter");
  await addCredit(bep.id, "TT", "twice", "producer");
  await addCredit(bep.id, "TT", "twice", "songwriter");

  // ── 4. Lee Chanhyuk (AKMU) — songwriter / producer ──────────────────────
  console.log("\n── Lee Chanhyuk (AKMU) ──");
  const chanhyuk = await prisma.artist.upsert({
    where:  { slug: "lee-chanhyuk" },
    update: {},
    create: {
      slug:      "lee-chanhyuk",
      type:      "MEMBER",
      stageName: "Lee Chanhyuk",
      realName:  "Lee Chan-hyuk",
      debutYear: 2014,
      labelId:   yg?.id,
      bio:       "Lee Chanhyuk (이찬혁) is the older sibling and producer half of AKMU (Akdong Musician). He writes and produces virtually all of AKMU's music, known for witty wordplay and acoustic-forward production. He completed mandatory military service in 2020–2022. He has also produced tracks for IU and other YG artists.",
    },
  });

  // AKMU self-produced credits
  const akmuSongs = ["200%", "Melted", "Give Love", "Dinosaur", "How People Move", "HAPPENING", "NAKKA (with IU)"];
  for (const song of akmuSongs) {
    await addCredit(chanhyuk.id, song, "akmu", "songwriter");
    await addCredit(chanhyuk.id, song, "akmu", "producer");
  }

  // ── 5. E.Dawn (PENTAGON member) ─────────────────────────────────────────
  console.log("\n── E.Dawn (PENTAGON) ──");
  const edawn = await prisma.artist.upsert({
    where:  { slug: "edawn" },
    update: {},
    create: {
      slug:      "edawn",
      type:      "MEMBER",
      stageName: "E'Dawn",
      realName:  "Kim Hyojong",
      debutYear: 2016,
      labelId:   null,
      bio:       "E'Dawn (이던, Kim Hyojong) is a rapper and former member of PENTAGON who departed Cube Entertainment in 2018 following public controversy over his relationship with HyunA. He subsequently signed with HyunA's label P Nation and continues solo work. Known for experimental hip-hop and close creative collaboration with HyunA.",
    },
  });

  // ── 6. HyunA (4Minute / solo) — connects to new groups ─────────────────
  console.log("\n── HyunA ──");
  const hyuna = await prisma.artist.upsert({
    where:  { slug: "hyuna" },
    update: {},
    create: {
      slug:      "hyuna",
      type:      "SOLOIST",
      stageName: "HyunA",
      realName:  "Kim Hyun-ah",
      debutYear: 2007,
      bio:       "HyunA (현아, Kim Hyun-ah) is a South Korean solo artist and former member of 4Minute and Wonder Girls. Known for provocative, self-directed artistry and hits like 'Bubble Pop!', 'Red', and 'Flower Shower'. She and E'Dawn (PENTAGON) are a public couple and have released music together as 'HyunA&Dawn'.",
    },
  });

  await addAlbum(hyuna.id, "hyuna", "Flower Shower", "Single", 2019, ["Flower Shower"]);

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log("\n✅ Collaborator seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
