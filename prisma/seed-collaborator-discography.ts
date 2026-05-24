/**
 * seed-collaborator-discography.ts
 *
 * Expands discographies and song credits for four collaborators:
 *   - Slushii (Julian Scanlan) — full album/EP catalogue + K-pop remix credits
 *   - Teddy Park (Park Hong-jun) — BLACKPINK + solo songwriting credits
 *   - Danny Chung (24) — BLACKPINK songwriting credits
 *   - Maxx Song — NewJeans songwriting credits (supplements existing)
 *
 * Also creates Ariana Grande as a new SOLOIST artist and adds
 * "Side To Side (Slushii Remix)" as a single under her name.
 *
 * Run:
 *   DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-collaborator-discography.ts
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

/** Add an album + tracks for a given artistId. Skips if album already exists by title. */
async function addAlbum(
  artistId: string,
  artistSlug: string,
  title: string,
  type: string,
  year: number,
  tracks: string[],
  coverArt?: string | null,
): Promise<void> {
  const existing = await prisma.album.findFirst({
    where: { artistId, title: { equals: title, mode: "insensitive" } },
  });
  if (existing) {
    process.stdout.write(".");
    return;
  }
  const slug = await uniqueSlug("album", slugify(`${artistSlug}-${title}`));
  const album = await prisma.album.create({
    data: { slug, title, artistId, releaseYear: year, type, coverArt: coverArt ?? null },
  });
  for (const trackTitle of tracks) {
    if (!trackTitle.trim()) continue;
    const songSlug = await uniqueSlug("song", slugify(`${slug}-${trackTitle}`));
    const song = await prisma.song.create({
      data: { slug: songSlug, title: trackTitle, albumId: album.id, releaseYear: year },
    });
    await prisma.songCredit.create({
      data: { songId: song.id, artistId, role: "main" },
    }).catch(() => {});
  }
  console.log(`  ✓ Album: ${title} (${year}, ${tracks.length} tracks)`);
}

/** Add a SongCredit for a collaborator on a song found by title + main artist slug. */
async function addCredit(
  collaboratorId: string,
  songTitle: string,
  mainArtistSlug: string,
  role: string,
): Promise<void> {
  const song = await prisma.song.findFirst({
    where: {
      title: { equals: songTitle, mode: "insensitive" },
      album: { artist: { slug: mainArtistSlug } },
    },
  });
  if (!song) {
    console.warn(`  ⚠️  Song not found: "${songTitle}" by ${mainArtistSlug}`);
    return;
  }
  const existing = await prisma.songCredit.findFirst({
    where: { songId: song.id, artistId: collaboratorId },
  });
  if (!existing) {
    await prisma.songCredit.create({
      data: { songId: song.id, artistId: collaboratorId, role },
    });
    console.log(`  ✓ Credit [${role}]: "${songTitle}" → ${mainArtistSlug}`);
  }
}

async function main() {
  // ────────────────────────────────────────────────────────────────────────────
  // 1. Load existing collab artist records
  // ────────────────────────────────────────────────────────────────────────────
  const slushii = await prisma.artist.findUnique({ where: { slug: "slushii" } });
  const teddyPark = await prisma.artist.findUnique({ where: { slug: "teddy-park" } });
  const dannyChung = await prisma.artist.findUnique({ where: { slug: "danny-chung" } });
  const maxxSong = await prisma.artist.findUnique({ where: { slug: "maxx-song" } });

  if (!slushii) throw new Error("slushii not found in DB — run seed.ts first");
  if (!teddyPark) throw new Error("teddy-park not found in DB — run seed.ts first");
  if (!dannyChung) throw new Error("danny-chung not found in DB — run seed.ts first");
  if (!maxxSong) throw new Error("maxx-song not found in DB — run seed.ts first");

  // ────────────────────────────────────────────────────────────────────────────
  // 2. Ariana Grande — create as SOLOIST if not present
  // ────────────────────────────────────────────────────────────────────────────
  const arianaGrande = await prisma.artist.upsert({
    where: { slug: "ariana-grande" },
    update: {},
    create: {
      slug:      "ariana-grande",
      type:      "SOLOIST",
      stageName: "Ariana Grande",
      realName:  "Ariana Grande-Butera",
      debutYear: 2013,
      bio:       "Ariana Grande-Butera is an American singer, songwriter, and actress from Boca Raton, Florida. Known for her four-octave vocal range, she rose to fame with the 2013 debut album 'Yours Truly' and has remained one of the most-streamed artists in the world. Her track 'Side To Side' (from 'Dangerous Woman', featuring Nicki Minaj) received an official EDM remix by Slushii in 2017, bridging her fanbase with the electronic dance music community.",
    },
  });
  console.log("✅ Artist:", arianaGrande.stageName);

  // ────────────────────────────────────────────────────────────────────────────
  // 3. Ariana Grande discography — key albums + Slushii remix single
  // ────────────────────────────────────────────────────────────────────────────
  await addAlbum(arianaGrande.id, "ariana-grande", "Yours Truly", "Album", 2013, [
    "Honeymoon Avenue", "Baby I", "Right There", "Tattooed Heart", "Inexperienced", "Problem",
    "Bear", "Lovin' It", "Piano", "Daydreamin'", "The Way", "Almost Is Never Enough",
  ]);
  await addAlbum(arianaGrande.id, "ariana-grande", "My Everything", "Album", 2014, [
    "Intro", "Problem", "One Last Time", "Why Try", "Break Free", "Best Mistake",
    "Be My Baby", "Break Your Heart Right Back", "Love Me Harder", "Just a Little Bit of Your Heart",
    "Hands on Me", "My Everything",
  ]);
  await addAlbum(arianaGrande.id, "ariana-grande", "Dangerous Woman", "Album", 2016, [
    "Moonlight", "Dangerous Woman", "Be Alright", "Into You", "Side To Side",
    "Let Me Love You", "Greedy", "Sometimes", "Knew Better / Forever Boy", "Leave Me Lonely",
    "Everyday", "Touch It", "Jason's Song (Gave It Away)", "Thinking 'Bout You",
  ]);
  await addAlbum(arianaGrande.id, "ariana-grande", "Thank U, Next", "Album", 2019, [
    "Imagine", "Needy", "NASA", "Bloodline", "Fake Smile", "Bad Idea", "Make Up",
    "Ghostin", "In My Head", "7 Rings", "Thank U, Next", "Break Up with Your Girlfriend, I'm Bored",
  ]);
  await addAlbum(arianaGrande.id, "ariana-grande", "Positions", "Album", 2020, [
    "Shut Up", "34+35", "Motive", "Just Like Magic", "Off the Table", "Six Thirty",
    "Safety Net", "My Hair", "Nasty", "West Side", "Love Language", "Positions",
    "Obvious", "POV",
  ]);

  // Slushii remix single — cross-links the two artists
  await addAlbum(
    arianaGrande.id,
    "ariana-grande",
    "Side To Side (Slushii Remix)",
    "Single",
    2017,
    ["Side To Side (Slushii Remix)"],
  );
  console.log("  ✅ Ariana Grande discography complete");

  // Add Slushii credit on the remix track
  const sideToSideRemix = await prisma.song.findFirst({
    where: {
      title: { contains: "Side To Side", mode: "insensitive" },
      album: { artistId: arianaGrande.id, title: { contains: "Slushii", mode: "insensitive" } },
    },
  });
  if (sideToSideRemix) {
    const existing = await prisma.songCredit.findFirst({
      where: { songId: sideToSideRemix.id, artistId: slushii.id },
    });
    if (!existing) {
      await prisma.songCredit.create({
        data: { songId: sideToSideRemix.id, artistId: slushii.id, role: "remix" },
      });
      console.log('  ✓ Credit [remix]: Slushii → "Side To Side (Slushii Remix)"');
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 4. Slushii — full album/EP catalogue
  // ────────────────────────────────────────────────────────────────────────────
  console.log("\n📀 Slushii discography");

  await addAlbum(slushii.id, "slushii", "Brain Freeze", "EP", 2016, [
    "Sapient Dream", "Make Me Feel", "Closer", "Some More", "Statik Shock", "Destiny", "Take My Hand",
  ]);

  await addAlbum(slushii.id, "slushii", "Out of Light", "Album", 2017, [
    "Into the Light", "Step by Step", "Fly High", "Someone Else", "Melting over You",
    "Forever", "Reason", "I Still Recall", "My Senses", "Hold On", "Dear Me",
    "I'll Be There", "Out of Light",
  ]);

  await addAlbum(slushii.id, "slushii", "Dream", "Album", 2018, [
    "Close To Me", "Feel It", "Find", "Stay", "Fly (On the Wall)", "Come Closer",
    "Underwater", "For You", "Stargazing", "Sleep", "Overflow", "i saw u in a dream",
    "Some Nights", "Conquer (Victory for All)", "Goodbye Star Girl", "WALLS",
  ]);

  await addAlbum(slushii.id, "slushii", "Dream II", "Album", 2019, [
    "Take Care", "Remedy", "In the Stars", "Counting", "Another Chance",
    "Circles", "Far Away", "Dreaming of You", "Watch Yo Back", "Sandcastles",
  ]);

  await addAlbum(slushii.id, "slushii", "Dream III", "Album", 2020, [
    "Fall for You", "In Her Eyes", "Imu", "Never Coming Back", "Colors",
    "Waiting for You", "Surrender", "Hold Me", "Lost in You", "Enough",
    "Over Again", "Through the Night", "Signals", "One More Time",
    "Where Are You Now", "Goodbye", "Dawn",
  ]);

  await addAlbum(slushii.id, "slushii", "E.L.E (Extinction Level Event)", "Album", 2022, [
    "E.R.U Emergency Broadcast (Intro)", "Do That", "ICE", "Carousel",
    "Cry For U", "Turn It Up", "After Midnight", "All I Need", "Valhalla",
    "Invaders From Mars", "ACID HAUS", "Wait For Me", "Secrets", "Sweet Illusion",
  ]);

  await addAlbum(slushii.id, "slushii", "A Slushii Summer", "Album", 2022, [
    "Forever With U", "Feels Like", "I Don't Miss U", "Smoke", "H8 December",
    "Push It", "We're Falling", "Home 2 Me", "Pick Yourself Up", "Like I Used To",
    "Summer Lasts Forever", "Forgive Me", "Through the Night", "Never Let You Go",
    "One True Love",
  ]);

  // Slushii credits on K-pop songs
  console.log("\n🎛️  Slushii K-pop credits");
  await addCredit(slushii.id, "Make It Right", "bts", "remix");

  // ────────────────────────────────────────────────────────────────────────────
  // 5. Teddy Park — BLACKPINK production credits
  // ────────────────────────────────────────────────────────────────────────────
  console.log("\n🎹 Teddy Park song credits");
  const teddyBPSongs = [
    // 2016 debut era
    "Whistle", "Boombayah", "Playing With Fire", "Stay",
    // 2017
    "As If It's Your Last",
    // 2018
    "DDU-DU DDU-DU", "Forever Young", "Really", "See U Later",
    // 2019
    "Kill This Love", "Don't Know What To Do", "Kick It", "Hope Not",
    // 2020
    "How You Like That", "Ice Cream", "Pretty Savage", "Lovesick Girls", "Crazy Over You",
    // 2022
    "Pink Venom", "Hard to Love",
    // 2026
    "Go", "Fxxxboy",
  ];
  for (const title of teddyBPSongs) {
    await addCredit(teddyPark.id, title, "blackpink", "songwriter");
  }

  // Teddy Park credits on solo member songs
  const teddySoloCredits: Array<{ title: string; artistSlug: string }> = [
    { title: "Solo",      artistSlug: "jennie" },
    { title: "You & Me",  artistSlug: "jennie" },
    { title: "On the Ground", artistSlug: "rose" },
    { title: "Gone",      artistSlug: "rose" },
    { title: "Lalisa",    artistSlug: "lisa" },
    { title: "Flower",    artistSlug: "jisoo" },
  ];
  for (const { title, artistSlug } of teddySoloCredits) {
    await addCredit(teddyPark.id, title, artistSlug, "songwriter");
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 6. Danny Chung — BLACKPINK lyricist credits
  // ────────────────────────────────────────────────────────────────────────────
  console.log("\n✍️  Danny Chung song credits");
  const dannyBPSongs = [
    "Kick It",         // 2019
    "How You Like That",  // 2020
    "Lovesick Girls",  // 2020
    "Pink Venom",      // 2022
  ];
  for (const title of dannyBPSongs) {
    await addCredit(dannyChung.id, title, "blackpink", "lyricist");
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 7. Maxx Song — NewJeans supplemental credits
  // ────────────────────────────────────────────────────────────────────────────
  console.log("\n🎵 Maxx Song supplemental credits");
  const maxxNJSongs = [
    "Hype Boy", "Cookie", "Hurt", "Ditto",
  ];
  for (const title of maxxNJSongs) {
    await addCredit(maxxSong.id, title, "newjeans", "songwriter");
  }

  console.log("\n✅ Collaborator discography seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
