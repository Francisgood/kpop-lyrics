/**
 * seed-missing-groups-2025.ts
 * Creates Artist records for K-pop groups from kpop-groups-2010-2025.xlsx
 * that were not already in the Aegyo Arena database.
 *
 * Usage:
 *   DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' \
 *   prisma/seed-missing-groups-2025.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ── Look up labels already in DB ─────────────────────────────────────────
  const sm       = await prisma.label.findUnique({ where: { slug: "sm-entertainment" } });
  const yg       = await prisma.label.findUnique({ where: { slug: "yg-entertainment" } });
  const cube     = await prisma.label.findUnique({ where: { slug: "cube-entertainment" } });
  const source   = await prisma.label.findUnique({ where: { slug: "source-music" } });
  const starship = await prisma.label.findUnique({ where: { slug: "starship-entertainment" } });
  const hybe     = await prisma.label.findUnique({ where: { slug: "hybe-entertainment" } });
  const ist      = await prisma.label.findUnique({ where: { slug: "ist-entertainment" } });

  const artists: Array<{
    slug: string;
    stageName: string;
    debutYear: number;
    labelId: string | null | undefined;
    bio: string;
  }> = [
    // ── HIGH confidence — active ──────────────────────────────────────────
    {
      slug:      "dreamcatcher",
      stageName: "Dreamcatcher",
      debutYear: 2017,
      labelId:   null,
      bio:       "Dreamcatcher (드림캐쳐) is a seven-member K-pop girl group under Dreamcatcher Company (formerly Happyface Entertainment). Known for their dark, rock-influenced concept rooted in the recurring nightmare world of their 'Nightmare' series.",
    },
    {
      slug:      "everglow",
      stageName: "EVERGLOW",
      debutYear: 2019,
      labelId:   null,
      bio:       "EVERGLOW (에버글로우) is a six-member South Korean girl group under Yuehua Entertainment. Known for powerful choreography and edgy visuals, they debuted with 'Bon Bon Chocolat' in March 2019.",
    },
    {
      slug:      "boynextdoor",
      stageName: "BOYNEXTDOOR",
      debutYear: 2023,
      labelId:   hybe?.id ?? null,
      bio:       "BOYNEXTDOOR (보이넥스트도어) is a five-member K-pop boy group under KOZ Entertainment (a HYBE label). They debuted in May 2023 with the single 'WHO!' and are known for relatable, everyday emotion-driven storytelling.",
    },
    {
      slug:      "kiss-of-life",
      stageName: "Kiss of Life",
      debutYear: 2023,
      labelId:   null,
      bio:       "Kiss of Life (키스오브라이프) is a four-member South Korean girl group under KISS OF LIFE label. They debuted in July 2023 and are celebrated for their retro neo-soul sound, vintage choreography, and throwback 70s–90s aesthetic.",
    },
    {
      slug:      "tws",
      stageName: "TWS",
      debutYear: 2024,
      labelId:   hybe?.id ?? null,
      bio:       "TWS (투어스) is a six-member K-pop boy group under Pledis Entertainment (HYBE). They debuted in January 2024 with 'Plot Twist' and are known for their bright, youthful 'boyhood' concept celebrating the joys of everyday life.",
    },
    // ── HIGH confidence — disbanded / hiatus ─────────────────────────────
    {
      slug:      "nuest",
      stageName: "NU'EST",
      debutYear: 2012,
      labelId:   hybe?.id ?? null,
      bio:       "NU'EST (뉴이스트) was a five-member K-pop boy group under Pledis Entertainment (now HYBE). Active 2012–2022, they are known for their artistic evolution from teen pop to sophisticated concept, with hits like 'Hello', 'Overcome', and 'Love Me'.",
    },
    {
      slug:      "gfriend",
      stageName: "GFriend",
      debutYear: 2015,
      labelId:   source?.id ?? null,
      bio:       "GFriend (여자친구) was a six-member K-pop girl group under Source Music (HYBE). Known for precise, intricate choreography and a warm, school-life concept, they were one of 4th-generation's most acclaimed girl groups before disbanding in 2021.",
    },
    {
      slug:      "lovelyz",
      stageName: "Lovelyz",
      debutYear: 2014,
      labelId:   null,
      bio:       "Lovelyz (러블리즈) was an eight-member K-pop girl group under Woolim Entertainment. Known for their elegant, fairy-tale concept and synchronized performances, they were active 2014–2021 with hits like 'Ah-Choo' and 'Destiny'.",
    },
    {
      slug:      "izone",
      stageName: "IZ*ONE",
      debutYear: 2018,
      labelId:   null,
      bio:       "IZ*ONE (아이즈원) was a 12-member K-pop girl group formed through Produce 48, comprising members from South Korea and Japan. Active 2018–2021, they released albums under Off The Record Entertainment and were known for tracks like 'La Vie en Rose' and 'Fiesta'.",
    },
    {
      slug:      "wanna-one",
      stageName: "Wanna One",
      debutYear: 2017,
      labelId:   null,
      bio:       "Wanna One (워너원) was an 11-member K-pop boy group formed through the survival show Produce 101 Season 2. Active 2017–2019, they sold out arenas across Asia and are credited with expanding the global reach of K-pop boy groups.",
    },
    // ── MEDIUM confidence — active ────────────────────────────────────────
    {
      slug:      "fromis-9",
      stageName: "fromis_9",
      debutYear: 2018,
      labelId:   ist?.id ?? null,
      bio:       "fromis_9 (프로미스나인) is a nine-member K-pop girl group under IST Entertainment. Formed through the Idol School survival program, they are known for bright, addictive pop with hits like 'To Heart', 'We Go', and 'Stay This Way'.",
    },
    {
      slug:      "block-b",
      stageName: "Block B",
      debutYear: 2011,
      labelId:   null,
      bio:       "Block B (블락비) is a seven-member K-pop hip-hop group under Seven Seasons. Known for their unconventional, irreverent style and leader Zico's producing prowess, they blended hip-hop, pop, and performance art in a way that set them apart from their peers.",
    },
    {
      slug:      "exid",
      stageName: "EXID",
      debutYear: 2012,
      labelId:   null,
      bio:       "EXID (이엑스아이디) is a K-pop girl group under Banana Culture Entertainment. Famous for 'Up & Down' going viral via fan-cam in 2014 — one of the earliest and most dramatic examples of a social media rescue of a flopping song — before the group went on extended hiatus in 2019.",
    },
    {
      slug:      "btob",
      stageName: "BTOB",
      debutYear: 2012,
      labelId:   cube?.id ?? null,
      bio:       "BTOB (비투비, Born to Beat) is a seven-member K-pop boy group under Cube Entertainment. Acclaimed for exceptional vocal talent and emotional ballads, they are one of the most decorated 3rd-generation groups with hits like 'It's Okay', 'Missing You', and 'Only One for Me'.",
    },
    {
      slug:      "ladies-code",
      stageName: "Ladies' Code",
      debutYear: 2013,
      labelId:   null,
      bio:       "Ladies' Code (레이디스 코드) is a K-pop girl group under Polaris Entertainment. They debuted in 2013 and tragically lost two members (EunB and RiSe) in a car accident in 2014. The surviving members Ashley, Sojung, and Zuny have continued as a trio.",
    },
    {
      slug:      "akmu",
      stageName: "AKMU",
      debutYear: 2014,
      labelId:   yg?.id ?? null,
      bio:       "AKMU (악동뮤지션, Akdong Musician) is a South Korean sibling duo — Lee Chanhyuk and Lee Suhyun — under YG Entertainment. Known for their acoustic-pop sound and witty, introspective songwriting, they won K-pop Star Season 2 before debuting. Chanhyuk has completed military service; the duo remains active.",
    },
    {
      slug:      "oh-my-girl",
      stageName: "Oh My Girl",
      debutYear: 2015,
      labelId:   null,
      bio:       "Oh My Girl (오마이걸) is a seven-member K-pop girl group under WM Entertainment. Known for their dreamy, fantasy concept and strong vocal lineup, they had a breakout year in 2021 with 'Dun Dun Dance' and 'Dolphin'.",
    },
    {
      slug:      "cravity",
      stageName: "CRAVITY",
      debutYear: 2020,
      labelId:   starship?.id ?? null,
      bio:       "CRAVITY (크래비티) is a nine-member K-pop boy group under Starship Entertainment. They debuted in April 2020 with 'Break All the Rules' and are known for sharp choreography and a bold, adventurous performance style.",
    },
    {
      slug:      "stayc",
      stageName: "STAYC",
      debutYear: 2020,
      labelId:   null,
      bio:       "STAYC (스테이씨) is a six-member K-pop girl group under High Up Entertainment, produced by hitmakers Black Eyed Pilseung. Known for ultra-catchy, minimalist pop production, their 'teenfresh' concept and tracks like 'ASAP' and 'So Bad' earned them 4th-gen acclaim.",
    },
    {
      slug:      "bap",
      stageName: "B.A.P",
      debutYear: 2012,
      labelId:   null,
      bio:       "B.A.P (비에이피, Best Absolute Perfect) was a six-member K-pop boy group under TS Entertainment. Active 2012–2019, they were known for their intense hip-hop concept and politically conscious lyrics, including 'No Mercy', 'Power', and 'Young, Wild & Free'. The group filed a landmark contract dispute lawsuit against TS Entertainment in 2014.",
    },
    {
      slug:      "pentagon",
      stageName: "PENTAGON",
      debutYear: 2016,
      labelId:   cube?.id ?? null,
      bio:       "PENTAGON (펜타곤) is a K-pop boy group under Cube Entertainment. Currently active as an eight-member group, they are known for member Hui's prolific songwriting and producing credits (including Wanna One's 'Energetic') and a wide stylistic range from powerful concepts to quirky pop.",
    },
    {
      slug:      "the-boyz",
      stageName: "The Boyz",
      debutYear: 2017,
      labelId:   null,
      bio:       "The Boyz (더보이즈) is an 11-member K-pop boy group under Cre.Ker Entertainment. Known as 'The Performance Kings' for their concert stage presence, they won Mnet's Road to Kingdom in 2021 and are celebrated for synchronized, high-energy choreography.",
    },
    {
      slug:      "treasure",
      stageName: "TREASURE",
      debutYear: 2020,
      labelId:   yg?.id ?? null,
      bio:       "TREASURE (트레저) is a K-pop boy group under YG Entertainment, formed through the YG Treasure Box survival program. Currently active with 10 members, they are known for high-energy performances and tracks like 'BOY', 'MMM', and 'JIKJIN'.",
    },
    {
      slug:      "plave",
      stageName: "PLAVE",
      debutYear: 2023,
      labelId:   null,
      bio:       "PLAVE (플레이브) is a virtual K-pop boy group under VLAST, comprised of five performers using motion capture technology. They debuted in March 2023 and quickly broke records for a virtual artist, known for their webtoon-style visuals and tracks like 'WAY 4 LUV' and 'Asterum: 134-1'.",
    },
    {
      slug:      "hearts2hearts",
      stageName: "Hearts2Hearts",
      debutYear: 2025,
      labelId:   sm?.id ?? null,
      bio:       "Hearts2Hearts (하츠투하츠) is an eight-member K-pop girl group under SM Entertainment, debuting in February 2025. Positioned as the next-generation SM girl group following aespa, they are known for a hybrid concept blending real and virtual performance elements.",
    },
  ];

  console.log(`Seeding ${artists.length} missing K-pop groups…\n`);

  let created = 0;
  let skipped = 0;

  for (const a of artists) {
    const result = await prisma.artist.upsert({
      where:  { slug: a.slug },
      update: {},
      create: {
        slug:      a.slug,
        type:      "GROUP",
        stageName: a.stageName,
        debutYear: a.debutYear,
        labelId:   a.labelId ?? undefined,
        bio:       a.bio,
      },
    });

    const wasNew = result.createdAt.getTime() > Date.now() - 5000;
    if (wasNew) {
      console.log(`  ✓ Created: ${a.stageName} (${a.slug})`);
      created++;
    } else {
      console.log(`  · Skipped: ${a.stageName} (already exists)`);
      skipped++;
    }
  }

  console.log(`\nDone. ${created} created, ${skipped} already existed.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
