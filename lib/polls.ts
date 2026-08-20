// One-tap binary polls (see the "One-Tap K-Pop Polls" PRD). A poll is an A/B
// question shown on an article page; fans vote in one tap (no account), see live
// results, then get offered a profile claim. The vote ledger + APIs live in
// `lib/polls-db.ts`; this file is the pure, shared config (imported by both the
// server DB layer and the client-safe render path — keep it free of DB imports).
//
// Each of these mirrors a Daebak points market: the native poll is the one-tap
// engagement surface, and Daebak is the "wager real points" upsell on the results
// view. `daebakUrl` is that link. Options are Yes/No for these "Will X?" questions
// (option "a" = Yes, "b" = No), but the model is general A/B.

export type PollSeed = {
  slug: string; // == the article slug it renders on
  question: string;
  questionEs: string;
  optionA: string;
  optionB: string;
  optionAEs: string;
  optionBEs: string;
  daebakUrl?: string; // "wager real points" upsell shown on results
  closeAt?: string; // ISO; omitted = open indefinitely
};

// Below this many total votes we hide the percentage split (show counts + an
// "Early voting…" note) so a 1–0 poll can't be screenshotted as "100% – 0%".
export const LOW_VOLUME_FLOOR = 50;

export const POLL_SEEDS: Record<string, PollSeed> = {
  "jennie-is-vaselines-global-ambassador": {
    slug: "jennie-is-vaselines-global-ambassador",
    question: "Will another K-pop idol sign with Vaseline as a brand ambassador by October 31, 2026?",
    questionEs: "¿Otra idol del K-pop firmará con Vaseline como embajadora de marca antes del 31 de octubre de 2026?",
    optionA: "Yes", optionB: "No", optionAEs: "Sí", optionBEs: "No",
    daebakUrl: "https://www.daebakmarkets.com/markets/0x54820de5d91d2dfe94ec63110c5ca24528202198ca65fbea8e12478df4091c3c",
  },
  "g-i-dle-soyeon-solo-comeback-september": {
    slug: "g-i-dle-soyeon-solo-comeback-september",
    question: "Will Soyeon's solo album break 1 million monthly visitors on Spotify before the end of 2026?",
    questionEs: "¿El álbum solista de Soyeon superará el millón de visitas mensuales en Spotify antes de que termine 2026?",
    optionA: "Yes", optionB: "No", optionAEs: "Sí", optionBEs: "No",
    daebakUrl: "https://www.daebakmarkets.com/markets/0xef702a6d8feb5a83b1db2974815c3112bc0bc3e817c4aeeabac9f40df8185ddb",
  },
  "nct-127-to-perform-on-americas-got-talent": {
    slug: "nct-127-to-perform-on-americas-got-talent",
    question: "Will NCT 127's America's Got Talent performance collect over 30 million YouTube views by December 31, 2026?",
    questionEs: "¿La presentación de NCT 127 en America's Got Talent superará los 30 millones de reproducciones en YouTube antes del 31 de diciembre de 2026?",
    optionA: "Yes", optionB: "No", optionAEs: "Sí", optionBEs: "No",
    daebakUrl: "https://www.daebakmarkets.com/markets/0xfc52ef05355f805349dcf5ef2eb3933a092d5b91998e07e313d1b90bfd55fdda",
  },
  "chaewon-photocards-620-ebay-resale": {
    slug: "chaewon-photocards-620-ebay-resale",
    question: "Will Chaewon photocard sales exceed $50 million in 2026?",
    questionEs: "¿Las ventas de photocards de Chaewon superarán los 50 millones de dólares en 2026?",
    optionA: "Yes", optionB: "No", optionAEs: "Sí", optionBEs: "No",
    daebakUrl: "https://www.daebakmarkets.com/markets/0xb1bc04f4d679c1ef6973dbaa453476dbca845eec2bed534af5953acf0faf1154",
  },
};

export function getPollSeed(slug: string): PollSeed | null {
  return POLL_SEEDS[slug] ?? null;
}

// ---- Shared shapes returned by the API / passed to the client ----
export type PollCounts = { a: number; b: number; total: number };
export type PollState = {
  slug: string;
  question: string;
  questionEs: string;
  optionA: string; optionB: string; optionAEs: string; optionBEs: string;
  daebakUrl?: string;
  counts: PollCounts;
  myVote: "a" | "b" | null; // the caller's own pick, if recognized
  closed: boolean;
  policy: "anonymous_allowed" | "registered_only";
  voterName: string | null; // handle when the caller is a claimed/logged-in user
};
export type TimeBucket = { t: string; a: number; b: number };
