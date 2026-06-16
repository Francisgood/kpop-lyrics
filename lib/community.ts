import { CONTRIBUTORS } from "@/app/leaderboard/data";

// Deterministically generated community activity (annotations + comments) attributed
// to the leaderboard contributors. The leaderboard is a curated showcase dataset, so
// this content is generated from each contributor's focus/city — stable across runs
// (index-based, no randomness) so the lazy DB seed is idempotent.

export type GenAnnotation = {
  id: string;
  authorSlug: string;
  authorName: string;
  songTitle: string;
  word: string;
  romanization: string;
  note: string;
  status: "approved" | "rejected";
  orderIndex: number;
};

export type GenComment = {
  id: string;
  authorSlug: string;
  authorName: string;
  context: string;
  body: string;
  orderIndex: number;
};

const SONGS: Record<string, string[]> = {
  BTS: ["Spring Day", "Dynamite", "Butter", "Life Goes On", "Blood Sweat & Tears", "Fake Love", "DNA", "Black Swan"],
  BLACKPINK: ["Kill This Love", "DDU-DU DDU-DU", "How You Like That", "Pink Venom", "Shut Down", "Lovesick Girls"],
  Kiiikiii: ["BORN AGAIN", "RAPUNZEL", "I DO ME", "FXCK UP THE WORLD", "ELASTIGIRL"],
  NewJeans: ["Ditto", "OMG", "Hype Boy", "Super Shy", "ETA"],
  "G)I-DLE": ["TOMBOY", "Queencard", "Nxde", "Woman"],
  Indie: ["Antifreeze", "TOMBOY", "Eight", "Lay Me Down", "Comet"],
  NYC: ["Dynamite", "MONEY", "On the Street"],
  default: ["Spring Day", "Dynamite", "Kill This Love", "BORN AGAIN"],
};

const SLANG: { ko: string; ro: string; meaning: string }[] = [
  { ko: "화이팅", ro: "hwaiting", meaning: "“you got this / let's go” — a cheer of encouragement" },
  { ko: "대박", ro: "daebak", meaning: "“jackpot / amazing” — total awe" },
  { ko: "진짜", ro: "jinjja", meaning: "“really / for real” — dialing up any reaction" },
  { ko: "최애", ro: "choae", meaning: "your absolute favorite member (your bias)" },
  { ko: "짱", ro: "jjang", meaning: "“the best / the greatest”" },
  { ko: "애교", ro: "aegyo", meaning: "performed cuteness and charm" },
  { ko: "막내", ro: "maknae", meaning: "the youngest member of a group" },
  { ko: "심쿵", ro: "simkung", meaning: "“heart attack” from something unbearably cute" },
  { ko: "인정", ro: "injeong", meaning: "“agreed / facts” — emphatic co-sign" },
  { ko: "갬성", ro: "gamseong", meaning: "a specific aesthetic mood or feels" },
];

const COMMENT_TEMPLATES: ((city: string, tag: string, focus: string, song: string) => string)[] = [
  (city, tag, _f, s) => `${s} still lives in my head rent-free. ${city} ${tag} fandom, where you at? 🔥`,
  (_c, _t, _f, s) => `Cleaned up a couple of romanization lines on ${s} — ping me if anything still reads off.`,
  (_c, tag, _f, s) => `The ${tag} era was a cultural reset and ${s} is the proof.`,
  (_c, _t, _f, s) => `Hot take: ${s} has the best bridge in the whole discography. Fight me 😤`,
  (_c, _t, _f, s) => `Whoever annotated ${s} — daebak. Exactly the context new fans need.`,
  (_c, _t, focus, s) => `Saw ${focus.split(" · ")[0]} live and ${s} hit completely different in person.`,
  (city, _t, _f, s) => `Adding ${city} fan-spot notes to the ${s} page this week. Stay tuned.`,
  (_c, _t, _f, s) => `${s} got me into K-pop. Still the gateway drug fr.`,
];

function songsFor(tag: string): string[] {
  return SONGS[tag] ?? SONGS.default;
}

export function generateCommunity(): { annotations: GenAnnotation[]; comments: GenComment[] } {
  const annotations: GenAnnotation[] = [];
  const comments: GenComment[] = [];
  let g = 0; // global counter drives the ~90% approved / ~10% rejected split

  for (const c of CONTRIBUTORS) {
    const songs = songsFor(c.focusTag);

    const nAnn = Math.min(6, Math.max(2, Math.round(c.annotations / 7)));
    for (let i = 0; i < nAnn; i++) {
      const slang = SLANG[(c.rank + i) % SLANG.length];
      const song = songs[(c.rank + i) % songs.length];
      const note =
        i === 0
          ? c.recentAct
          : `“${slang.ro}” (${slang.ko}) — ${slang.meaning}. In ${song} it carries the ${c.focusTag} energy ${c.city} fans live for, a nuance most English translations drop.`;
      const status: "approved" | "rejected" = g % 10 === 6 ? "rejected" : "approved";
      annotations.push({
        id: `${c.slug}-ann-${i}`,
        authorSlug: c.slug,
        authorName: c.username,
        songTitle: song,
        word: slang.ko,
        romanization: slang.ro,
        note,
        status,
        orderIndex: i,
      });
      g++;
    }

    const nCmt = Math.min(10, Math.max(3, Math.round(c.comments / 18)));
    for (let i = 0; i < nCmt; i++) {
      const tmpl = COMMENT_TEMPLATES[(c.rank + i) % COMMENT_TEMPLATES.length];
      const song = songs[(c.rank + i + 1) % songs.length];
      comments.push({
        id: `${c.slug}-cmt-${i}`,
        authorSlug: c.slug,
        authorName: c.username,
        context: song,
        body: tmpl(c.city, c.focusTag, c.focus, song),
        orderIndex: i,
      });
    }
  }

  return { annotations, comments };
}
