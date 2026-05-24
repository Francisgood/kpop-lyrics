/**
 * Seed: annotations for 6 homepage songs
 *
 * Songs: MONEY · LALISA · RAPUNZEL · Say So · 봄날 (Spring Day) · ROCKSTAR
 * Contributors: the 5 existing editor users (neon_army, lalisa_lore, blink_decode, kpopscholar, thaisoul_stan)
 * ~3 annotations per song, 18 total
 *
 * Note: LALISA line 9 already annotated — skip it
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// contributor emails — these already exist in the DB
const CONTRIBUTOR_EMAILS = [
  "neon.army@aegyoarena.fan",       // 0 neon_army
  "lalisa.lore@aegyoarena.fan",     // 1 lalisa_lore
  "blink.decode@aegyoarena.fan",    // 2 blink_decode
  "kpop.scholar@aegyoarena.fan",    // 3 kpopscholar
  "thaisoul.stan@aegyoarena.fan",   // 4 thaisoul_stan
];

type AnnSpec = {
  slug: string;
  lineIndex: number;
  word: string;
  note: string;
  contributorIndex: number;
};

const ANNOTATIONS: AnnSpec[] = [
  // ──────────────────────────────────────────────
  // MONEY by Lisa  (slug: lisa-money)
  // ──────────────────────────────────────────────
  {
    slug: "lisa-money",
    lineIndex: 0,
    word: "내 손엔 돈이 가득해",
    contributorIndex: 2, // blink_decode
    note: `내 손엔 (nae son-en) compresses two particles: 에 (locative: "in") + 는 (topic marker), contracted to 엔. The result is not just "in my hands" but "in my hands specifically" — the topic marker draws the camera close. 가득해 (gadeukae) = overflowing, abundantly full, from 가득하다. The image is hands that cannot contain what they hold, which is not a boast about wealth but a statement about capacity outgrowing its vessel. Lisa released MONEY in September 2021 as a pre-release single before her solo debut — released under YG Entertainment while she was already in the process of reconceiving her artistic future. The song documents what she was already building before the label knew she was leaving.`,
  },
  {
    slug: "lisa-money",
    lineIndex: 5,
    word: "내가 움직이면 세상이 봐",
    contributorIndex: 3, // kpopscholar
    note: `The grammatical architecture of this line does the work: 내가 (I, subject) + 움직이면 (when I move, conditional) → 세상이 (the world, subject) + 봐 (watches). Two independent subjects — Lisa and the world — with the world's gaze made conditional on her motion. She does not perform for the world; the world's attention is triggered by her movement. This is structurally identical to FXCK UP THE WORLD's 세상이 우릴 따라와 ("the world follows us") — a recurring grammar of spectatorship in Lisa's catalog where the audience is always reactive, never prescriptive. By Coachella 2026, where she headlined the main stage, the lyric had become a literal description of the preceding four years.`,
  },
  {
    slug: "lisa-money",
    lineIndex: 8,
    word: "나 혼자여도 빛나",
    contributorIndex: 4, // thaisoul_stan
    note: `혼자여도 (honjayeodo) uses the -여도 / -이어도 concessive suffix: "even though / even if [subject condition]." Crucially this is not 나 혼자 빛나 ("I shine alone") but "even alone, I still shine" — the concessive frame acknowledges the structural disadvantage of solitude as a real condition, then asserts that it doesn't extinguish the light. 빛나 (bitna) = to shine, to be radiant, to gleam (from 빛나다). In K-pop, solo activities without a full group behind you carry institutional risk — the industry is built around collective momentum. MONEY was released before Lisa's solo debut, before LLOUD, before FIFA. The line reads now as a load-bearing prediction.`,
  },

  // ──────────────────────────────────────────────
  // LALISA by Lisa  (slug: lisa-lalisa)
  // line 9 already annotated — skip
  // ──────────────────────────────────────────────
  {
    slug: "lisa-lalisa",
    lineIndex: 1,
    word: "방콕 소녀 여기 왔어",
    contributorIndex: 0, // neon_army
    note: `방콕 소녀 (Bangkok girl) is a geographic declaration embedded inside a K-pop song — an industry whose trainee pipeline historically filtered through Seoul. Lisa was recruited from Thailand at 14, trained entirely in Korean, and debuted as the only Southeast Asian member of BLACKPINK. The word order places origin before arrival: Bangkok → here. 여기 (yeogi) = "here" — not named, not defined, which makes it mean everything: the stage, the industry, the global spotlight. 왔어 (wass-eo) is informal past tense — the register of speaking to a close friend, not a formal announcement. The line isn't a press release; it's what she'd say to someone who knew what the journey cost.`,
  },
  {
    slug: "lisa-lalisa",
    lineIndex: 3,
    word: "포기 안 했어 절대로",
    contributorIndex: 1, // lalisa_lore
    note: `절대로 (jeoldae-ro) means absolutely, unconditionally, under no circumstances — it is one of the strongest Korean adverbs of negation. Its placement at the end of the line (postpositive emphasis) makes it the emotional weight-bearing word rather than a preamble. The line is completed past tense: this is not a vow going forward but a documented fact about the past. 포기 (pogi) = giving up, abandoning. 안 했어 = did not [do it]. The sentence structure is: the thing never done + the absolute that prevented it. For Lisa, the period covered includes multiple years of trainee culture where she would have been the statistically unlikely pick — the foreign recruit, non-Korean-native, competing against hundreds in an industry that had never had a Thai member of a top-tier group.`,
  },
  {
    slug: "lisa-lalisa",
    lineIndex: 6,
    word: "혼자서 이 길 왔어",
    contributorIndex: 2, // blink_decode
    note: `혼자서 (honjaseo) vs 혼자 (honja): 혼자 = alone (state of being); 혼자서 = by oneself, using -서 as an instrumental suffix that emphasizes self-reliance — acting through one's own agency rather than merely existing without companions. The 서 transforms solitude from a condition into a method. 이 길 (this path) is unspecified — it is not the trainee years, or the debut, or the solo career; it is all of it, pointed at together. 왔어 = came / have come (informal past). The path wasn't navigated with a map someone handed her. No other Thai K-pop idol had charted the route ahead of her. This line is the entire song compressed to six syllables.`,
  },

  // ──────────────────────────────────────────────
  // RAPUNZEL by Lisa  (slug: lisa-rapunzel)
  // ──────────────────────────────────────────────
  {
    slug: "lisa-rapunzel",
    lineIndex: 0,
    word: "탑에서 뛰어내려",
    contributorIndex: 3, // kpopscholar
    note: `뛰어내리다 (dwieo-naerimda) = to jump down from (a high place). The verb is not 탈출하다 (to escape), not 내려가다 (to go down), not 자유로워지다 (to become free) — it is the visceral, physical act of leaping off. The Rapunzel archetype waits in the tower, passive, for external rescue. Lisa's version of Rapunzel doesn't unlock the door or climb down her own hair — she jumps. 에서 (eseo) marks the origin point of the action (from the tower), which makes the tower a launchpad rather than a prison. What the original tale treats as the problem — height — becomes the condition of flight. The song was released in collaboration with Megan Thee Stallion: two artists who have each publicly reconceived the boundaries of their label contracts as launch conditions, not ceilings.`,
  },
  {
    slug: "lisa-rapunzel",
    lineIndex: 7,
    word: "내 스스로 탑을 부숴",
    contributorIndex: 4, // thaisoul_stan
    note: `스스로 (seuseu-ro) = by oneself, of one's own accord — more emphatic than 혼자서. Where 혼자서 means "using only myself as the instrument," 스스로 adds volition: the action originates from within, unconditioned by anything external. 부수다 (busu-da) = to break, smash, demolish. Not 나가다 (to leave) or 열다 (to open) — total structural destruction. The line reads as a sequence: line 0 she jumps from the tower; line 7 she destroys it. This forecloses the option of return. In practice: Lisa founded LLOUD in 2023. The label is not an exit from the K-pop industry — it is the architecture that she built to replace the prior structure. The tower is down.`,
  },
  {
    slug: "lisa-rapunzel",
    lineIndex: 9,
    word: "무서운 게 없어 우린",
    contributorIndex: 0, // neon_army
    note: `Standard Korean phrasing for fearlessness would be 우리는 무섭지 않아 ("we are not afraid") — the subject fears, and the negation is a quality of the subject. Lisa's lyric inverts this: 무서운 게 없어 우린 makes fear itself the subject that does not exist. 무서운 게 (museo-un ge) = "the thing that is scary" — nominalized adjective. 없어 = doesn't exist. 우린 = for us (topic-marked "우리," informal contraction). The grammar enacts the fearlessness rather than reporting it: there is no scary thing in the space they occupy, rather than they themselves being brave. The distinction is ontological. The -은/-는 topic marker on 우린 places it at the end as a scope limiter: "for us [specifically], this absence of fear holds." It is not a universal claim. It is a jurisdictional one.`,
  },

  // ──────────────────────────────────────────────
  // Say So by Doja Cat  (slug: doja-cat-say-so)
  // ──────────────────────────────────────────────
  {
    slug: "doja-cat-say-so",
    lineIndex: 0,
    word: "Day to night to morning",
    contributorIndex: 1, // lalisa_lore
    note: `The progression "day to night to morning" is a temporal loop, not a linear advance. A standard day-cycle would proceed: morning → day → night → (next) morning. Doja Cat's version omits the reset: night leads back to morning without completing the cycle's return — the lyric holds time in the state of unresolved attraction. It is the structure of a sleepless night spent thinking about someone: day collapses into night, night collapses into morning, and morning doesn't feel like a new day because nothing was resolved. The preposition "to" used three times functions as both journey and surrender — it doesn't arrive, it keeps transitioning. Say So (2019) spent 5 weeks at #1 on the Billboard Hot 100 in 2020 and became the defining "soft groove pop" hit of that year — a song about waiting for the other person to speak, sung by someone who had been waiting since at least the night before.`,
  },
  {
    slug: "doja-cat-say-so",
    lineIndex: 2,
    word: "Say so, 말해줘",
    contributorIndex: 2, // blink_decode
    note: `말해줘 (malhae-jwo) is the Korean informal imperative-request form of 말하다 (to speak/say) + 주다 (to give/do for someone). The -아/어 줘 construction carries an implicit beneficiary: "say it, for my sake / as a gift to me." English "say so" is casual, almost off-hand — barely a request. The Korean translation restores the emotional vulnerability: this isn't indifferent; this is need. The bilingual doubling at the hook is the song's central device: the same request made in two registers, two emotional temperatures. The English version keeps the cool surface; the Korean translation exposes the longing underneath. When Nicki Minaj's remix placed "Say So" at #1 on the Hot 100, the Korean lines were already written into the pop ecosystem — a K-pop fan's native register embedded in an American #1.`,
  },
  {
    slug: "doja-cat-say-so",
    lineIndex: 6,
    word: "도자 캣이 물어봐",
    contributorIndex: 3, // kpopscholar
    note: `도자 캣이 물어봐 = "Doja Cat is asking." The third-person self-reference — using her own stage name as the grammatical subject — is a specific hip-hop rhetorical device: it treats the performing persona as an entity separate from the person speaking, which simultaneously makes the question more public (it's Doja Cat asking, not just a private person) and more theatrical (the frame of the question is not confession but spectacle). 물어봐 (mureo-bwa) combines 물어보다 (to ask, inquire) + 봐 (imperative/casual form of 보다, to look/try) — it is an asking-and-checking gesture, the -봐 implying "see if you can answer." The -이 subject marker after 도자 캣 is Korean grammar formalizing her as a grammatical agent: she is not just present, she is the one doing the asking. The meta-move makes the listener the one being asked, named or not.`,
  },

  // ──────────────────────────────────────────────
  // 봄날 (Spring Day) by BTS  (slug: bts-spring-day)
  // ──────────────────────────────────────────────
  {
    slug: "bts-spring-day",
    lineIndex: 1,
    word: "이렇게 말하니까 더 보고 싶다",
    contributorIndex: 4, // thaisoul_stan
    note: `보고 싶다 (bogo sipda) = I miss you, literally "I want to see [you]." Korean encodes longing as a visual desire rather than an abstract absence — missing is the wish to look. 이렇게 말하니까 = "because I say it like this / because I'm saying it this way." The line acknowledges that the act of speaking the longing — performing the lyric — compounds the longing itself. This is an auto-referential loop: singing "I miss you" makes the missing more acute. The verse performs its own grief escalation in real time. Spring Day (봄날, 2017) was released on February 13, a day before Valentine's Day, and has been widely interpreted in relation to the 2014 Sewol ferry disaster, where 304 people — mostly high school students — did not return. The lyric's first line (line 0, 보고 싶다) and this escalation establish the song's thesis: that wanting to say something doesn't discharge it, it deepens it.`,
  },
  {
    slug: "bts-spring-day",
    lineIndex: 5,
    word: "너무 야속한 시간",
    contributorIndex: 0, // neon_army
    note: `야속하다 (yasok-hada) is a specifically Korean emotional register with no clean English equivalent. It describes the feeling of being wronged or let down by something that cannot be reasoned with — the bitterness of circumstances rather than people. You feel 야속함 toward the rain that ruins an important day, toward a bus that left one minute early, toward a law that can't be changed. 야속한 시간 — "time that is 야속한" — places the blame for grief precisely on the entity that keeps moving when everything inside you has stopped. 너무 (neomoo) = too / excessively, adding a quality of overwhelm: the cruelty of time has exceeded what can be borne. In the Sewol context, time was the instrument of the tragedy: every hour that rescue didn't arrive was an hour 야속 했다. The lyric does not name the event but it names the feeling, which is more durable.`,
  },
  {
    slug: "bts-spring-day",
    lineIndex: 9,
    word: "겨울이 지나 봄이 오면",
    contributorIndex: 1, // lalisa_lore
    note: `봄 (bom) in Korean is spring — and near-homophonous with 봄, the nominalised form of 보다 (to see): 보다 → 봄 = "the act of seeing." This phonetic overlap is not accidental in Korean literature. When 봄 (spring) arrives after 겨울 (winter), seeing becomes possible again — literally and figuratively. The conditional structure 겨울이 지나 봄이 오면 = "when winter passes and spring comes" requires winter's completion before spring is conditional: the prerequisite is endured cold, not just the passage of time. This structure mirrors Korean classical sijo (시조) poetry, where seasonal transition encodes emotional states — winter for absence and grief, spring for reunion and new growth. 봄날 (Spring Day) as a title plays on both meanings simultaneously: a day of the season, and a day of seeing. The final three lines (우리 다시 만나자 / Let's meet again / 봄날처럼) resolve the song as conditional hope, not certainty.`,
  },

  // ──────────────────────────────────────────────
  // ROCKSTAR by Lisa  (slug: lisa-rockstar)
  // ──────────────────────────────────────────────
  {
    slug: "lisa-rockstar",
    lineIndex: 4,
    word: "방콕에서 여기까지",
    contributorIndex: 2, // blink_decode
    note: `에서 (eseo) marks origin; 까지 (kkaji) marks endpoint or extent. 방콕에서 여기까지 = "from Bangkok all the way to here." The phrase compresses Lisa's entire biography into a prepositional span. Bangkok: where she was born, where she auditioned for YG at 14, where she is now a national cultural figure (Thailand issued a commemorative stamp series featuring Lisa in 2022). 여기 (here): the global stage — unspecified, which is the point. The same geographic arc appears in LALISA line 1 (방콕 소녀 여기 왔어) but the grammar shifts: LALISA uses arrived (왔어, past tense completed journey); ROCKSTAR uses a bare prepositional phrase with no verb — the distance itself is the statement. By 2026: FIFA World Cup opener, Caesars Palace Las Vegas residency, Coachella headline. 방콕에서 여기까지 fits on a postage stamp and holds the entire story.`,
  },
  {
    slug: "lisa-rockstar",
    lineIndex: 7,
    word: "무대 위에 핀 꽃처럼",
    contributorIndex: 3, // kpopscholar
    note: `피다 (pida) = to bloom, to come into flower. The verb applies to flowers that emerge according to their own seasonal nature — it is not chosen, it is arrived at. 핀 (pin) is the attributive past form: "a flower that has bloomed." 처럼 (cheoreom) = like, similar to (simile marker). The complete phrase 무대 위에 핀 꽃처럼 = "like a flower that has bloomed on stage." The displacement is the figure: flowers bloom in soil, in fields, in nature — not on stages. Lisa's image places natural inevitable emergence inside constructed spectacle, proposing that her stardom is not manufactured but botanical — arrived at by the same mechanism as spring blooming. In Korean poetic tradition, 꽃 (flower) imagery carries millennia of usage in lyrics and literature; 꽃다운 나이 (flower-like age) refers to youth. The rockstar image is built from a living thing, not a machine.`,
  },
  {
    slug: "lisa-rockstar",
    lineIndex: 9,
    word: "꺼지지 않을 불꽃",
    contributorIndex: 4, // thaisoul_stan
    note: `꺼지다 (kkeojida) = to go out, to be extinguished — applied to flames and lights. 않을 = will not (negative future attributive, from 않다). 불꽃 (bulkkot) = flame, blaze, spark (불 = fire + 꽃 = flower; the compound literally means "fire-flower"). The double-negated phrase 꺼지지 않을 = "that will not be extinguished" deploys a grammatical structure stronger than simply 영원한 불꽃 (eternal flame). "Eternal" is a passive quality; "will not be extinguished" is active resistance to extinction. The flame does not simply persist — it refuses to stop. 불꽃 as a word contains its own metaphor: fire named after flowers, destruction named after bloom. The song's final image holds both: something radiant, living, and categorically resistant to going out. As LLOUD's catalog continues to compound post-2023, the lyric functions less as aspiration and more as operational description.`,
  },
];

async function main() {
  // Resolve contributor user IDs
  const userIds: string[] = [];
  for (const email of CONTRIBUTOR_EMAILS) {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, displayName: true } });
    if (!user) {
      console.error(`Contributor not found: ${email}`);
      process.exit(1);
    }
    console.log(`contributor  ${user.displayName} → ${user.id}`);
    userIds.push(user.id);
  }

  // Group annotations by song slug
  const bySong: Record<string, AnnSpec[]> = {};
  for (const ann of ANNOTATIONS) {
    (bySong[ann.slug] ??= []).push(ann);
  }

  let created = 0;
  let skipped = 0;

  for (const [slug, anns] of Object.entries(bySong)) {
    const song = await prisma.song.findUnique({ where: { slug }, select: { id: true, title: true } });
    if (!song) {
      console.error(`Song not found: ${slug}`);
      continue;
    }
    console.log(`\n── ${song.title} (${slug}) ──`);

    for (const ann of anns) {
      const existing = await prisma.lyricAnnotation.findFirst({
        where: { songId: song.id, lineIndex: ann.lineIndex, word: ann.word },
      });
      if (existing) {
        console.log(`  skip  line ${ann.lineIndex}: "${ann.word}"`);
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
      console.log(`  ✓     line ${ann.lineIndex}: "${ann.word}" (${CONTRIBUTOR_EMAILS[ann.contributorIndex].split("@")[0]})`);
      created++;
    }
  }

  console.log(`\nDone — ${created} annotations created, ${skipped} skipped.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
