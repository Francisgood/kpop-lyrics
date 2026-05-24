/**
 * Annotations for BTS — Run BTS (Proof, 2022)
 * Lines 2-7 (lines 0-1 already seeded)
 * Covers: etymology, cultural context, anniversary significance,
 *         fan-artist dynamics, streaming/chart signals from Obsidian K-pop Signals 2026-05-20
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SONG_SLUG = "bts-run-bts";

const ANNOTATIONS: Array<{
  lineIndex: number;
  word: string;
  note: string;
}> = [
  {
    lineIndex: 2,
    word: "방탄처럼",
    note: `방탄 (Bangtan) is Korean for "bulletproof" — the first word in BTS's full name, 방탄소년단 (Bangtan Sonyeondan / Bulletproof Boy Scouts). To run 방탄처럼 ("like Bangtan / bulletproof") collapses the group's name and their founding philosophy into a single command. BTS chose the name to represent youth who are bulletproof against social pressures and criticism — at debut they were dismissed by the industry as a small-label act with no chance at longevity. By 2022 (this song's release), they had 23.7M Spotify monthly listeners as a group and members individually charting on Billboard Hot 100. The line asks listeners to adopt that same impermeability: run not just fast, but unstoppable.`,
  },
  {
    lineIndex: 3,
    word: "온 세상을 향해서",
    note: `온 세상 (on sesang) = "the whole world / all the world." Released on Proof (2022), this line maps the full arc of BTS's trajectory — from a debut on a mid-tier agency (Big Hit Entertainment was financially stressed in 2013 and nearly disbanded) to becoming the most-streamed K-pop group globally. 향해서 (hyanghae-seo) means "toward / in the direction of," framing the world not as a destination reached but as a direction still being run toward. Even at peak global success — having spoken at the UN General Assembly in 2021 — the lyric encodes continued motion, refusing arrival as a concept.`,
  },
  {
    lineIndex: 4,
    word: "9년 만에",
    note: `The most precisely time-stamped line in the song. 9년 만에 (9-nyeon mane) means "after 9 years" — specifically, the interval since BTS debuted on June 13, 2013. "Run BTS" was released on June 10, 2022, three days before their 9th anniversary. The Korean grammatical particle 만에 marks the completion of an entire time period — it doesn't just say "9 years later" but "having gone the full span of 9 years." For longtime ARMYs who watched every stage from debut, this line carries the weight of a decade of growth: from being told they'd never make it, to two members charting solo on the Billboard Hot 100, to Jimin's "Like Crazy" entering at #1.`,
  },
  {
    lineIndex: 5,
    word: "아미야",
    note: `야 (-ya) is an informal Korean address particle — the most intimate register, used only between very close friends, older addressing younger, or between people of equal standing with deep familiarity. Koreans do not use -ya with strangers or even casual acquaintances. "아미야" (Amiya) is the most affectionate way BTS can address ARMY. Compare to "아미 여러분" (formal: "ARMY, everyone") or just "아미" (neutral). The deliberate choice of -ya flattens the idol-fan hierarchy that K-pop culture often enforces, positioning ARMY not as a fanbase but as trusted peers running alongside the group. It's the vocal equivalent of reaching a hand back during a sprint.`,
  },
  {
    lineIndex: 6,
    word: "우리",
    note: `우리 (uri) is one of Korean's most culturally distinct pronouns. Where English "we" is simply plural first person, 우리 encodes collective identity and belonging. Koreans say 우리 엄마 ("our mom" — meaning my mom), 우리나라 ("our country"), 우리 팀 ("our team"). The pronoun blurs individual and collective into a single unit. 달리자 (-ja) is the Korean propositive/volitional verb ending — not a command ("run!") but an invitation to act together ("let's run"). The combination 우리 함께 달리자 is the emotional center of the song: BTS is not leading, not following, but proposing that the group and its fans are already the same "we" and always have been.`,
  },
  {
    lineIndex: 7,
    word: "go go go",
    note: `The code-switch from Korean to English "go go go" is a BTS signature — but it also carries an intertextual echo. In 2017, BTS released "GO GO" (고 Go), a satirical commentary on Korea's 욜로 (YOLO) generation: young people spending recklessly because they've given up on traditional milestones (housing, marriage, savings) that feel unachievable. "지를게 yo / I'll just spend it all" was the ironic hook. Here in 2022, "go go go" strips the irony entirely — it's pure kinetic energy, a pivot from BTS as social commentators to BTS as celebrants of the very generation they once gently roasted. The word hasn't changed; the decade has.`,
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

  let created = 0;
  let skipped = 0;

  for (const ann of ANNOTATIONS) {
    // Don't duplicate if word+line already exists
    const existing = await prisma.lyricAnnotation.findFirst({
      where: { songId: song.id, lineIndex: ann.lineIndex, word: ann.word },
    });
    if (existing) {
      console.log(`skip  line ${ann.lineIndex}: "${ann.word}" (already exists)`);
      skipped++;
      continue;
    }
    await prisma.lyricAnnotation.create({
      data: { songId: song.id, lineIndex: ann.lineIndex, word: ann.word, note: ann.note },
    });
    console.log(`✓     line ${ann.lineIndex}: "${ann.word}"`);
    created++;
  }

  console.log(`\nDone — ${created} created, ${skipped} skipped.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
