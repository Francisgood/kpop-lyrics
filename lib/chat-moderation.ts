// Content rules for the live chat.
//
// The room exists so K-pop fans can hype each other up, so the rules target the
// things that actually drive people out of a fandom space: slurs, threats,
// telling someone to hurt themselves, and insults aimed at a person. They
// deliberately do NOT police swearing — "this song killed me", "I'm dead",
// "they ate", "that's fucking insane" are the native dialect here.
//
// VOCABULARY SOURCE: lib/data/profane-words.json is a verbatim copy of
// github.com/zautumnz/profane-words (2,725 entries, WTFPL). Its real value is
// coverage of obfuscated spellings — a55, n1gg3r, "a s s", f.u.c.k — which a
// hand-written list never keeps up with. It is used in three tiers, because
// blocking the whole thing would block "fuck", "shit", "sexy", "wtf" and even
// "gays", and a room where fans can't swear or name themselves is not the goal:
//
//   SLUR      identity slurs → blocked outright.
//   INSULT    personal-insult nouns → blocked when aimed at someone
//             ("you're a ___", "she's such a ___", "fuck you"), not otherwise.
//   PROFANITY everything else → never blocks on its own. Only a short message
//             made mostly of it is refused, which is abuse-spam, not swearing.
//
// The tiers are derived in code rather than pre-baked, so the classification is
// reviewable here and survives a refresh of the upstream list.
//
// None of this catches everything. It is the cheap first pass; reader reports
// (three distinct reporters auto-hide a message) and moderator hides in
// lib/chat-db.ts are what catch the rest.
import RAW_WORDS from "./data/profane-words.json";

export type Verdict =
  | { ok: true }
  | { ok: false; category: Category; reason: string };

export type Category = "self_harm" | "threat" | "slur" | "attack" | "doxx";

// Shown back to the sender. Phrased as a nudge, not a scolding: most people who
// trip this are venting, and the goal is to keep them in the room.
export const CATEGORY_MESSAGE: Record<Category, string> = {
  self_harm: "That one reads as telling someone to hurt themselves. Let's not.",
  threat: "Threats aren't allowed here, even as a joke.",
  slur: "That word doesn't fly in this room.",
  attack: "Keep it about the music, not tearing a person down.",
  doxx: "Don't post personal details like that here.",
};

export const CATEGORY_MESSAGE_ES: Record<Category, string> = {
  self_harm: "Eso suena a decirle a alguien que se lastime. Mejor no.",
  threat: "Aquí no se permiten amenazas, ni en broma.",
  slur: "Esa palabra no va en esta sala.",
  attack: "Habla de la música, no destruyas a una persona.",
  doxx: "No publiques datos personales aquí.",
};

// ── Normalisation ───────────────────────────────────────────────────────────

const LEET: Record<string, string> = {
  "0": "o", "1": "i", "2": "z", "3": "e", "4": "a", "5": "s", "6": "g",
  "7": "t", "8": "b", "9": "g", "@": "a", $: "s", "!": "i", "|": "i", "+": "t",
};

/**
 * Folds a word to a comparable form: lowercase, leetspeak resolved, anything
 * that isn't a letter dropped, and runs of 3+ identical letters clipped to 2.
 *
 * Clipping to 2 rather than 1 is deliberate — "asssss" folds onto "ass" while
 * the ordinary word "as" stays "as" and never collides with it.
 */
export function fold(word: string): string {
  let out = "";
  let run = 0;
  let last = "";
  for (const raw of word.toLowerCase()) {
    const ch = LEET[raw] ?? raw;
    if (ch < "a" || ch > "z") continue;
    run = ch === last ? run + 1 : 0;
    last = ch;
    if (run >= 2) continue;
    out += ch;
  }
  return out;
}

/** The whole message folded into one run of letters, for "a s s h o l e". */
function squash(text: string): string {
  return fold(text.replace(/\s+/g, ""));
}

// ── Tiering the vocabulary ──────────────────────────────────────────────────

// Identity-slur roots. Every entry is at least four folded letters and is not a
// substring of an ordinary English or Spanish word, because these block on
// sight. Notable exclusions, all deliberate: "negro" and "negra" (everyday
// colour words for this site's Spanish readers), "cracker", "gringo", "whitey"
// and "cripple" (either food, mild, or ordinary verbs).
const SLUR_ROOTS = [
  "nigg", "nigr", "jigaboo", "coon", "sambo", "mandingo",
  "kike", "heeb", "hymie", "shylock",
  "chink", "chinaman", "chingchong", "gook", "zipperhead",
  "spick", "beaner", "wetback", "mojado",
  "paki", "towelhead", "raghead", "sandnig", "cameljockey",
  "kraut", "dago", "polack", "gyppo", "guido",
  "fag", "faggot", "dyke", "lesbo", "poofter", "fudgepack", "shirtlift",
  "pillowbiter", "tranny", "shemale", "ladyboy", "heshe",
  "retard", "spastic", "mongoloid",
  "redskin", "injun", "squaw",
  "pedophile", "paedophile", "rapist", "molester",
];

// Personal-insult nouns. These only block when aimed at somebody, so the list
// can be broad without touching ordinary swearing.
const INSULT_ROOTS = [
  "asshole", "arsehole", "asswipe", "assclown", "dumbass", "jackass", "asshat",
  "bitch", "cunt", "twat", "prick", "wanker", "tosser", "bastard",
  "slut", "whore", "skank", "hoe", "tramp",
  "dickhead", "dick", "cock", "knob", "douche", "douchebag",
  "scumbag", "shitbag", "shithead", "shitface", "fuckface", "fucktard",
  "fuckwit", "motherfucker", "moron", "imbecile", "cretin", "loser",
  "freak", "creep", "psycho", "pig", "parasite", "leech",
];

// Never treated as profanity, whatever the upstream list says. Identity words
// and ordinary fan vocabulary: a room that flags "gays" or "sexy" is broken.
const ALLOW = new Set(
  ["gay", "gays", "lesbian", "lesbians", "bisexual", "bi", "trans", "transgender",
   "queer", "homosexual", "sex", "sexy", "sexual", "horny", "nude", "naked",
   "breast", "breasts", "boob", "boobs", "tit", "tits", "butt", "damn", "hell",
   "wtf", "omfg", "lmao", "lmfao", "crap", "suck", "sucks", "sucked", "god",
   "jesus", "negro", "negra"].map(fold),
);

type Vocab = { slurs: Set<string>; insults: Set<string>; profanity: Set<string>; slurPhrases: string[] };

function buildVocab(): Vocab {
  const slurs = new Set<string>();
  const insults = new Set<string>();
  const profanity = new Set<string>();
  const slurPhrases: string[] = [];

  for (const raw of RAW_WORDS as string[]) {
    const folded = fold(raw);
    if (folded.length < 3 || ALLOW.has(folded)) continue;

    if (SLUR_ROOTS.some((r) => folded.includes(r))) {
      slurs.add(folded);
      // Multi-word slurs can't be caught token by token, so keep the folded
      // phrase for a substring pass. Length-gated to avoid Scunthorpe hits.
      if (raw.includes(" ") && folded.length >= 6) slurPhrases.push(folded);
      continue;
    }
    if (INSULT_ROOTS.some((r) => folded.includes(r))) {
      insults.add(folded);
      continue;
    }
    profanity.add(folded);
  }

  // Single-word slurs are also matched against the squashed message, which is
  // how "n i g g e r" and "f-a-g-g-o-t" get caught. Six letters minimum so no
  // ordinary word can contain one by accident.
  for (const s of slurs) if (s.length >= 6) slurPhrases.push(s);

  return { slurs, insults, profanity, slurPhrases };
}

const VOCAB = buildVocab();

/** Exposed for the test suite and for auditing the tiering. */
export function vocabularySizes() {
  return {
    total: (RAW_WORDS as string[]).length,
    slurs: VOCAB.slurs.size,
    insults: VOCAB.insults.size,
    profanity: VOCAB.profanity.size,
  };
}

// ── Hand-written rules ──────────────────────────────────────────────────────

type Rule = { category: Category; re: RegExp };

const RULES: Rule[] = [
  // Telling someone to hurt themselves.
  { category: "self_harm", re: /\bk+y+s+\b/i },
  { category: "self_harm", re: /\b(?:kill|off|neck)\s*(?:your|ur|yo)\s*self\b/i },
  { category: "self_harm", re: /\b(?:go|just|please|pls)\s+(?:and\s+)?(?:die|unalive)\b/i },
  { category: "self_harm", re: /\b(?:hope|wish)\s+(?:you|u|she|he|they)\s+(?:would\s+)?die\b/i },
  { category: "self_harm", re: /\b(?:you|u|she|he|they)\s+(?:should|deserve\s+to)\s+die\b/i },
  { category: "self_harm", re: /\bdrink\s+bleach\b/i },

  // Threats. A target is required, so "this beat kills" stays fine.
  { category: "threat", re: /\b(?:i(?:'|’)?m|im|i\s+am|i(?:'|’)?ll|ill|i\s+will|gonna|going\s+to)\s+(?:gonna\s+|going\s+to\s+)?(?:kill|murder|stab|shoot|beat|jump|hurt|choke|strangle)\s+(?:you|u|him|her|them|that\s+\w+)\b/i },
  { category: "threat", re: /\b(?:watch|catch)\s+(?:your|ur)\s+back\b/i },
  { category: "threat", re: /\bi\s+know\s+where\s+(?:you|u)\s+live\b/i },
  { category: "threat", re: /\b(?:you|u)(?:'|’)?re?\s+dead\s+(?:meat|when)\b/i },

  // Attacks on a person: appearance, worth, existence. Directed forms only, so
  // "that outfit is ugly" and "this ship is trash" pass. Bare pronouns are
  // included so "she is so fat" is caught as well as "she's so fat"; the
  // connector list stays closed, which keeps "the outfit she is wearing is
  // ugly" out of it.
  {
    category: "attack",
    re: /\b(?:you|u|ur|you(?:'|’)?re|youre|she|she(?:'|’)?s|shes|he|he(?:'|’)?s|hes|they|they(?:'|’)?re)\s+(?:is\s+|are\s+|so\s+|such\s+|a\s+|really\s+|too\s+|literally\s+|just\s+)*(?:ugly|fat|obese|hideous|disgusting|worthless|pathetic|nobody|untalented|talentless|braindead|brain\s*dead|stupid|dumb|idiot|useless|trash|garbage)\b/i,
  },
  { category: "attack", re: /\b(?:no\s?one|nobody)\s+(?:likes|wants|loves)\s+(?:you|u|her|him|them)\b/i },
  { category: "attack", re: /\b(?:needs?|should)\s+to\s+lose\s+(?:some\s+)?weight\b/i },
  { category: "attack", re: /\beat\s+a\s+salad\b/i },
  { category: "attack", re: /\b(?:eat|starve)\s+(?:something|yourself|urself)\b/i },
  { category: "attack", re: /\bplastic\s+surgery\s+(?:freak|monster)\b/i },

  // Personal data.
  { category: "doxx", re: /\b\d{3}-\d{2}-\d{4}\b/ },                 // SSN-shaped
  { category: "doxx", re: /\b(?:\d[ .-]?){13,16}\b/ },               // card-shaped
  { category: "doxx", re: /\b\d{1,5}\s+\w+(?:\s+\w+)?\s+(?:st|street|ave|avenue|rd|road|blvd|lane|ln|dr|drive)\b/i },
];

// ── The directed-insult frame ───────────────────────────────────────────────

// An insult noun only counts when it is pointed at somebody. The article is the
// discriminator that a regex can actually rely on: a noun insult takes one
// ("she's a bitch") while the same word used as an intensifier does not
// ("she's fucking talented"), so the second stays legal.
// Pronouns only. "this song is a bitch to learn" is an idiom about a song, and
// widening the target to "this/that <noun>" swept idioms like it up. A slur or
// insult aimed at a named person instead of a pronoun is left to reader reports.
const TARGET = String.raw`(?:you|u|ur|yall|youre|she|shes|he|hes|they|theyre)`;
const COPULA = String.raw`(?:\s+(?:is|are|was|were|r|being|seems?|sounds?))?`;
const ARTICLE = String.raw`(?:\s+such)?\s+(?:a|an|the)\s+(?:\w+\s+){0,2}`;

// "she's a bad bitch" is admiration in stan vocabulary, so a positive qualifier
// immediately before the noun clears it.
const POSITIVE_QUALIFIER = new Set(["bad", "baddie", "boss", "my", "iconic", "certified"]);

const DIRECTED_FRAMES: RegExp[] = [
  new RegExp(String.raw`\b${TARGET}${COPULA}${ARTICLE}$`, "i"),
  new RegExp(String.raw`\bwhat\s+(?:a|an)\s+(?:\w+\s+){0,2}$`, "i"),
  new RegExp(String.raw`\bcall(?:ed|ing)?\s+(?:you|u|her|him|them)\s+(?:a|an)\s+$`, "i"),
];

// Insults thrown straight at someone with no article at all.
const DIRECT_ABUSE: RegExp[] = [
  /\b(?:fuck|f\W*u\W*c\W*k)\s+(?:you|u|off|urself|yourself|em|her|him|them)\b/i,
  /\b(?:stfu|shut\s+the\s+fuck\s+up)\b/i,
  /\b(?:screw|damn)\s+(?:you|u)\b/i,
];

// The same phrases against the fully squashed message, which is how the
// letter-by-letter spellings ("f u c k  y o u") get caught.
const SQUASHED_ABUSE = ["fuckyou", "fucku", "fuckoff", "shutthefuckup", "killyourself", "killurself"];

// ── Screening ───────────────────────────────────────────────────────────────

/** Screens one message. Cheap enough to call on every send. */
export function screen(body: string): Verdict {
  const text = String(body ?? "");

  // 1. Hand-written rules first — they carry the most specific wording.
  const hit = RULES.find((r) => r.re.test(text));
  if (hit) return deny(hit.category);

  // 2. Identity slurs: token match, then a squashed pass for spaced-out spellings.
  const tokens = text.split(/[^\p{L}\p{N}@$!|+]+/u).filter(Boolean);
  const folded = tokens.map(fold);
  if (folded.some((f) => f && VOCAB.slurs.has(f))) return deny("slur");
  const flat = squash(text);
  if (VOCAB.slurPhrases.some((p) => flat.includes(p))) return deny("slur");

  // 3. Insult nouns, but only pointed at a person.
  for (const re of DIRECT_ABUSE) if (re.test(text)) return deny("attack");
  if (SQUASHED_ABUSE.some((p) => flat.includes(p))) return deny("attack");
  for (let i = 0; i < folded.length; i++) {
    if (!folded[i] || !VOCAB.insults.has(folded[i])) continue;
    if (POSITIVE_QUALIFIER.has(folded[i - 1] ?? "")) continue;
    // The run-up is folded too, so "y0u are a wh0re" reads as "you are a whore".
    const lead = folded.slice(Math.max(0, i - 6), i).join(" ") + " ";
    if (DIRECTED_FRAMES.some((re) => re.test(lead))) return deny("attack");
    // "bitch" as the entire message is aimed at whoever just spoke.
    if (tokens.length === 1) return deny("attack");
  }

  // 4. Abuse spam: a short message that is mostly profanity, of any tier.
  if (tokens.length >= 3) {
    const dirty = folded.filter(
      (f) => f && (VOCAB.profanity.has(f) || VOCAB.insults.has(f) || VOCAB.slurs.has(f)),
    ).length;
    if (dirty >= 3 && dirty / tokens.length > 0.5) return deny("attack");
  }

  return { ok: true };
}

function deny(category: Category): Verdict {
  return { ok: false, category, reason: CATEGORY_MESSAGE[category] };
}

/** Kept for older call sites and for tests. */
export function isBlocked(body: string): boolean {
  return !screen(body).ok;
}

/** Reader-facing report reasons. Short list — a long one just slows people down. */
export const REPORT_REASONS = ["bullying", "violence", "hate", "spam"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

/** Distinct reporters needed before a message hides itself pending review. */
export const AUTO_HIDE_REPORTS = 3;
