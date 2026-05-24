/**
 * Seed: 5 contributor users + 5 annotations for Lisa — FXCK UP THE WORLD
 *
 * Annotations grounded in sentiment cache: lisa-2026-05-23.json
 * Themes: FIFA World Cup opener · Las Vegas Strip residency · LLOUD independence
 *         Pluto reclassification metaphor · Inbound institutional validation
 *
 * Contributors (role: "editor") — password "fanpw_2026" sha256+aegyo-salt
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SONG_SLUG = "lisa-fxck-up-the-world";

const PW_HASH = "99fa1b663cc7498ae36f3f198697fd5b181691ba69b3e20fbea38f0db23220af"; // sha256("fanpw_2026"+"aegyo-salt")

const CONTRIBUTORS = [
  {
    email: "neon.army@aegyoarena.fan",
    displayName: "neon_army",
    role: "editor",
  },
  {
    email: "lalisa.lore@aegyoarena.fan",
    displayName: "lalisa_lore",
    role: "editor",
  },
  {
    email: "blink.decode@aegyoarena.fan",
    displayName: "blink_decode",
    role: "editor",
  },
  {
    email: "kpop.scholar@aegyoarena.fan",
    displayName: "kpopscholar",
    role: "editor",
  },
  {
    email: "thaisoul.stan@aegyoarena.fan",
    displayName: "thaisoul_stan",
    role: "editor",
  },
];

// lineIndex → matches LINE N from the song
// Lines:
//  0 세상을 뒤집어 놓을게 / I'm going to turn the world upside down
//  3 규칙이 없어 내 세상에 / No rules in my world
//  4 Pluto vibes, we don't stop / Pluto vibes — we don't stop
//  5 내가 만든 규칙이 법이야 / The rules I make are the law
//  9 세상이 우릴 따라와 / The world follows us

const ANNOTATIONS: Array<{
  lineIndex: number;
  word: string;
  note: string;
  contributorIndex: number; // maps to CONTRIBUTORS array
}> = [
  {
    lineIndex: 0,
    word: "세상을 뒤집어 놓을게",
    contributorIndex: 0, // neon_army
    note: `뒤집다 (dwijipta) means to flip, overturn, turn upside down. The verb choice is visceral — not 바꾸다 (to change) or 달라지다 (to become different) but literally to turn the world face-down. The performative future tense -ㄹ게 (-lge) functions as a declaration made directly to the listener: "I will" or "I'm going to" — a promise, not a boast. Written in 2025; on June 12, 2026 Lisa headlines the FIFA World Cup opening ceremony in Los Angeles as the first Thai artist and first female K-pop act ever to do so. 5 billion viewers. The line stopped being a lyric and became documentation.`,
  },
  {
    lineIndex: 3,
    word: "규칙이 없어",
    contributorIndex: 1, // lalisa_lore
    note: `The Colosseum at Caesars Palace has an unwritten rule: it's for Western legacy acts. Celine Dion, Adele, Rod Stewart, Elton John — a particular canon of mainstream credibility measured in decades and Grammys. In May 2026 Lisa announced a November residency there, the first K-pop artist, the first Southeast Asian artist, ever. 규칙이 없어 내 세상에 ("no rules in my world") isn't chaos — it's the discovery that the gatekeeping framework simply doesn't register as a limit at her scale. The -에 particle at the end of 내 세상에 is precise: not "the world has no rules" but "in my world, rules don't exist." Different jurisdiction.`,
  },
  {
    lineIndex: 4,
    word: "Pluto vibes",
    contributorIndex: 2, // blink_decode
    note: `In 2006 the International Astronomical Union reclassified Pluto from planet to dwarf planet — demoted not because its gravity changed, but because the institution changed its definitions. In 2023 Lisa left YG Entertainment for her own label, LLOUD. The industry asked whether a K-pop idol could sustain global relevance without a major agency. The answer by 2026: 5.2 billion catalog streams, 107M Instagram followers (#1 most-followed K-pop artist, more than South Korea's entire population), Coachella 2026 headliner, FIFA World Cup opener, Las Vegas Strip residency. Pluto still exerts gravity. It just stopped caring what the IAU called it. "We don't stop" is not motivational — it's orbital mechanics.`,
  },
  {
    lineIndex: 5,
    word: "내가 만든 규칙이 법이야",
    contributorIndex: 3, // kpopscholar
    note: `법이야 (beob-iya) uses the -야 copula for a blunt, non-negotiable declaration: "it IS the law." There is no softening particle, no politeness marker, no conditional. 만든 (mandeun) is the attributive past form of 만들다 (to make/create) — rules she authored. The lyric forms a structural arc with line 3 (규칙이 없어 내 세상에 / "no rules in my world"): first she clears the existing legal framework, then installs her own. In practice: LLOUD, founded 2023, gives Lisa full control over A&R, brand partnerships, creative direction, and touring. The song isn't a metaphor; it's a business org chart set to a trap beat. She writes the contracts now.`,
  },
  {
    lineIndex: 9,
    word: "세상이 우릴 따라와",
    contributorIndex: 4, // thaisoul_stan
    note: `The subject-object inversion is the thesis of the entire song. 따라와 (dalla-wa) — "comes following" — places the world as the subject chasing Lisa, not the reverse. This is not just metaphor for a Thai girl who moved to Seoul at 14, trained in a language not her own, and built a career in an industry that historically centers Korean or Western artists: FIFA approached her for the 2026 World Cup opener. Nike proposed the global partnership. Louis Vuitton initiated the House Ambassador relationship. "Goals" (feat. Anitta & Rema) debuted #3 globally on Spotify, 479K streams in 24 hours — no terrestrial radio rollout, no HYBE-scale PR machine. The world did the traveling. 세상이 우릴 따라와 is not aspiration. It's the receipt.`,
  },
];

async function main() {
  const song = await prisma.song.findUnique({
    where: { slug: SONG_SLUG },
    select: { id: true },
  });
  if (!song) {
    console.error("Song not found:", SONG_SLUG);
    return;
  }

  // Upsert contributor users
  const userIds: string[] = [];
  for (const contrib of CONTRIBUTORS) {
    const user = await prisma.user.upsert({
      where: { email: contrib.email },
      update: { role: contrib.role },
      create: {
        email: contrib.email,
        displayName: contrib.displayName,
        passwordHash: PW_HASH,
        role: contrib.role,
        emailVerified: true,
      },
    });
    console.log(`user  ${contrib.displayName} → ${user.id}`);
    userIds.push(user.id);
  }

  // Seed annotations
  let created = 0;
  let skipped = 0;
  for (const ann of ANNOTATIONS) {
    const existing = await prisma.lyricAnnotation.findFirst({
      where: { songId: song.id, lineIndex: ann.lineIndex, word: ann.word },
    });
    if (existing) {
      console.log(`skip  line ${ann.lineIndex}: "${ann.word}"`);
      skipped++;
      continue;
    }
    await prisma.lyricAnnotation.create({
      data: {
        songId: song.id,
        lineIndex: ann.lineIndex,
        word: ann.word,
        note: ann.note,
        userId: userIds[ann.contributorIndex],
      },
    });
    console.log(`✓     line ${ann.lineIndex}: "${ann.word}" by ${CONTRIBUTORS[ann.contributorIndex].displayName}`);
    created++;
  }

  console.log(`\nDone — ${created} annotations created, ${skipped} skipped.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
