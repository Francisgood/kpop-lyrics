// One-tap polls (see the "One-Tap K-Pop Polls" PRD). A poll is a 2–4 option
// question shown on an article page; fans vote in one tap (no account), see live
// results, then get offered a profile claim. The vote ledger + APIs live in
// `lib/polls-db.ts`; this file is the pure, shared config (imported by both the
// server DB layer and the client-safe render path — keep it free of DB imports).
//
// A poll id is the vote-ledger key, and it is NOT the article slug: one audience
// question is placed on several articles (see ARTICLE_POLLS) and every placement
// feeds the SAME tally, so the result reads as one audience-wide answer rather
// than a dozen thin per-article ones. The original Daebak polls predate this and
// happen to use their article slug as their id; that still resolves.

export type OptionKey = "a" | "b" | "c" | "d";
export const OPTION_KEYS: OptionKey[] = ["a", "b", "c", "d"];

export type PollOption = { key: OptionKey; label: string; labelEs: string };

export type PollSeed = {
  slug: string; // poll id — the key every vote is filed under
  question: string;
  questionEs: string;
  options: PollOption[]; // 2–4, keyed a…d in display order
  daebakUrl?: string; // "wager real points" upsell shown on results
  closeAt?: string; // ISO; omitted = open indefinitely
};

// Below this many total votes we hide the percentage split (show counts + an
// "Early voting…" note) so a 1–0 poll can't be screenshotted as "100% – 0%".
export const LOW_VOLUME_FLOOR = 50;

const yesNo: PollOption[] = [
  { key: "a", label: "Yes", labelEs: "Sí" },
  { key: "b", label: "No", labelEs: "No" },
];

export const POLL_SEEDS: Record<string, PollSeed> = {
  // ── Daebak prediction polls (id == the single article they run on) ──────────
  "jennie-is-vaselines-global-ambassador": {
    slug: "jennie-is-vaselines-global-ambassador",
    question: "Will another K-pop idol sign with Vaseline as a brand ambassador by October 31, 2026?",
    questionEs: "¿Otra idol del K-pop firmará con Vaseline como embajadora de marca antes del 31 de octubre de 2026?",
    options: yesNo,
    daebakUrl: "https://www.daebakmarkets.com/markets/0x54820de5d91d2dfe94ec63110c5ca24528202198ca65fbea8e12478df4091c3c",
  },
  "g-i-dle-soyeon-solo-comeback-september": {
    slug: "g-i-dle-soyeon-solo-comeback-september",
    question: "Will Soyeon's solo album break 1 million monthly visitors on Spotify before the end of 2026?",
    questionEs: "¿El álbum solista de Soyeon superará el millón de visitas mensuales en Spotify antes de que termine 2026?",
    options: yesNo,
    daebakUrl: "https://www.daebakmarkets.com/markets/0xef702a6d8feb5a83b1db2974815c3112bc0bc3e817c4aeeabac9f40df8185ddb",
  },
  "nct-127-to-perform-on-americas-got-talent": {
    slug: "nct-127-to-perform-on-americas-got-talent",
    question: "Will NCT 127's America's Got Talent performance collect over 30 million YouTube views by December 31, 2026?",
    questionEs: "¿La presentación de NCT 127 en America's Got Talent superará los 30 millones de reproducciones en YouTube antes del 31 de diciembre de 2026?",
    options: yesNo,
    daebakUrl: "https://www.daebakmarkets.com/markets/0xfc52ef05355f805349dcf5ef2eb3933a092d5b91998e07e313d1b90bfd55fdda",
  },
  "chaewon-photocards-620-ebay-resale": {
    slug: "chaewon-photocards-620-ebay-resale",
    question: "Will Chaewon photocard sales exceed $50 million in 2026?",
    questionEs: "¿Las ventas de photocards de Chaewon superarán los 50 millones de dólares en 2026?",
    options: yesNo,
    daebakUrl: "https://www.daebakmarkets.com/markets/0xb1bc04f4d679c1ef6973dbaa453476dbca845eec2bed534af5953acf0faf1154",
  },

  // ── Audience-preference polls ──────────────────────────────────────────────
  // Taste questions, placed across many articles so each one builds a single
  // sample big enough to say something about what this audience actually wants.
  "bts-era-preference": {
    slug: "bts-era-preference",
    question: "Which BTS era do you prefer?",
    questionEs: "¿Qué era de BTS prefieres?",
    options: [
      { key: "a", label: "Debut & Breakthrough (2013–2016)", labelEs: "Debut y despegue (2013–2016)" },
      { key: "b", label: "Psychological & Self-Love (2016–2020)", labelEs: "Psicológica y de amor propio (2016–2020)" },
      { key: "c", label: "Westernization / Pre-Military (2020–2022)", labelEs: "Occidentalización / antes del servicio militar (2020–2022)" },
      { key: "d", label: "Arirang / Post-Military (2026– )", labelEs: "Arirang / después del servicio militar (2026– )" },
    ],
  },
  "male-idol-hair-color": {
    slug: "male-idol-hair-color",
    question: "What hair colour suits male idols best?",
    questionEs: "¿Qué color de pelo les queda mejor a los idols hombres?",
    options: [
      { key: "a", label: "Their original colour (black)", labelEs: "Su color original (negro)" },
      { key: "b", label: "Natural human colours (blonde, brown…)", labelEs: "Colores naturales (rubio, castaño…)" },
      { key: "c", label: "Subtle unnatural (silver, light orange, blends)", labelEs: "Irreales pero sutiles (plateado, naranja claro, degradados)" },
      { key: "d", label: "In-your-face colour (neon, dark green…)", labelEs: "Colores que gritan (neón, verde oscuro…)" },
    ],
  },
  "katseye-song-style": {
    slug: "katseye-song-style",
    question: "What type of KATSEYE songs do you prefer?",
    questionEs: "¿Qué tipo de canciones de KATSEYE prefieres?",
    options: [
      { key: "a", label: "Touch / Debut / My Way", labelEs: "Touch / Debut / My Way" },
      { key: "b", label: "Gabriela / Animal", labelEs: "Gabriela / Animal" },
      { key: "c", label: "Gnarly / Pinky Up / Hootie Frootie", labelEs: "Gnarly / Pinky Up / Hootie Frootie" },
    ],
  },
  "non-music-idol-content": {
    slug: "non-music-idol-content",
    question: "What's your favourite type of non-music idol content?",
    questionEs: "¿Cuál es tu tipo favorito de contenido de idols fuera de la música?",
    options: [
      { key: "a", label: "Variety shows", labelEs: "Programas de variedades" },
      { key: "b", label: "Livestreams", labelEs: "Transmisiones en vivo" },
      { key: "c", label: "Groups' own shows on YouTube", labelEs: "Los programas propios de los grupos en YouTube" },
      { key: "d", label: "Mukbangs", labelEs: "Mukbangs" },
    ],
  },
  "kpop-listeners-2026-spotify": {
    slug: "kpop-listeners-2026-spotify",
    question: "How many people will listen to K-pop worldwide in 2026, according to Spotify?",
    questionEs: "Según Spotify, ¿cuántas personas escucharán K-pop en el mundo en 2026?",
    options: [
      { key: "a", label: "1 billion", labelEs: "1000 millones" },
      { key: "b", label: "1.5 billion", labelEs: "1500 millones" },
      { key: "c", label: "2 billion", labelEs: "2000 millones" },
      { key: "d", label: "2.5 billion", labelEs: "2500 millones" },
    ],
  },
};

/**
 * Article slug → poll id. The five audience-preference polls are dealt
 * round-robin across the twenty stories on the homepage feed, so each poll sits
 * at a mix of feed positions rather than in one block near the top.
 */
export const ARTICLE_POLLS: Record<string, string> = {
  "le-sserafim-spaghetti-viral-dance-challenge": "bts-era-preference",
  "hearts2hearts-spotify-closer-special-concert": "male-idol-hair-color",
  "exo-do-red-velvet-joy-the-seasons": "katseye-song-style",
  "cravity-sonorous-comeback-scheduler": "non-music-idol-content",
  "plave-keep-it-manic-first-world-tour": "kpop-listeners-2026-spotify",

  "pentagon-coward-10th-anniversary-comeback": "bts-era-preference",
  "aespa-synk-complaexity-solo-tracks": "male-idol-hair-color",
  "monsta-x-magic-first-win-music-bank": "katseye-song-style",
  "enhypen-bloody-paradise-triple-crown": "non-music-idol-content",
  "ateez-mysterious-teasers-comeback": "kpop-listeners-2026-spotify",

  "blackpink-lisa-dating-rumors-actor-instagram-backlash": "bts-era-preference",
  "girls-generation-hyorisoo-skibidi-controversy": "male-idol-hair-color",
  "the-boyz-hyunjae-actor-profile-photos-lee-jae-hyun": "katseye-song-style",
  "blackpink-fan-meetup-national-museum-korea-apology": "non-music-idol-content",
  "mamamoo-solar-attacked-los-angeles": "kpop-listeners-2026-spotify",

  "stray-kids-this-and-that-third-week-billboard-200-top-10": "bts-era-preference",
  "enhypen-first-no-1-billboard-200-the-sin-bliss": "male-idol-hair-color",
  "ive-i-am-400-million-views-first-mv": "katseye-song-style",
  "stray-kids-lee-know-nepal-flood-donation": "non-music-idol-content",
  "txt-fifth-world-tour-steal-the-wind": "kpop-listeners-2026-spotify",
};

/** Resolves either a poll id (API routes) or an article slug (article page). */
export function getPollSeed(slugOrId: string): PollSeed | null {
  const direct = POLL_SEEDS[slugOrId];
  if (direct) return direct;
  const mapped = ARTICLE_POLLS[slugOrId];
  return mapped ? POLL_SEEDS[mapped] ?? null : null;
}

export function optionOf(seed: PollSeed, key: string): PollOption | null {
  return seed.options.find((o) => o.key === key) ?? null;
}

// ---- Shared shapes returned by the API / passed to the client ----
export type PollCounts = { a: number; b: number; c: number; d: number; total: number };
export const ZERO_COUNTS: PollCounts = { a: 0, b: 0, c: 0, d: 0, total: 0 };

export type PollState = {
  slug: string;
  question: string;
  questionEs: string;
  options: PollOption[];
  daebakUrl?: string;
  counts: PollCounts;
  myVote: OptionKey | null; // the caller's own pick, if recognized
  closed: boolean;
  policy: "anonymous_allowed" | "registered_only";
  voterName: string | null; // handle when the caller is a claimed/logged-in user
};
export type TimeBucket = { t: string; a: number; b: number; c: number; d: number };
