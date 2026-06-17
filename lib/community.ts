import { CONTRIBUTORS } from "@/app/leaderboard/data";

// Deterministically generated community activity (annotations + comments) attributed
// to the leaderboard contributors, anchored to REAL songs from the catalog (passed in
// as a pool by the DB layer) so every annotation lands on an actual song page. Stable
// across runs (index-based, no randomness) so the lazy DB seed is idempotent.

export type PoolSong = { title: string; slug: string };

export type GenAnnotation = {
  id: string;
  authorSlug: string;
  authorName: string;
  songTitle: string;
  songSlug: string;
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
  context: string; // song title the comment is about
  body: string;
  orderIndex: number;
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

// Note templates — each references the actual song + slang term so the annotation reads
// coherently on whatever song page it lands on.
const NOTE_TEMPLATES: ((song: string, s: { ko: string; ro: string; meaning: string }, tag: string, city: string) => string)[] = [
  (song, s, tag, city) => `“${s.ro}” (${s.ko}) — ${s.meaning}. In ${song} it carries the ${tag} energy ${city} fans live for, a nuance most English translations flatten.`,
  (song, s, _tag, city) => `Caught “${s.ro}” (${s.ko}) in ${song}: ${s.meaning}. Context the ${city} fandom always points new listeners to.`,
  (song, s, tag) => `The way “${s.ro}” lands in ${song} is peak ${tag}. ${s.ro} = ${s.meaning} — keep it in mind on the next listen.`,
  (song, s) => `Annotation on ${song}: “${s.ro}” (${s.ko}). ${s.meaning}. Small word, whole mood.`,
  (song, s, tag, city) => `${city} ${tag} stans know — “${s.ro}” in ${song} means ${s.meaning}. The subs never quite get it.`,
  (song, s, _tag, city) => `Pinned this for new fans: “${s.ro}” (${s.ko}) in ${song} = ${s.meaning}. ${city} taught me that one.`,
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

const FALLBACK: PoolSong[] = [{ title: "Spring Day", slug: "bts-spring-day" }];

export function generateCommunity(pool: { trending: PoolSong[]; popular: PoolSong[] }): {
  annotations: GenAnnotation[];
  comments: GenComment[];
} {
  const annotations: GenAnnotation[] = [];
  const comments: GenComment[] = [];
  const anyPool = [...(pool.trending ?? []), ...(pool.popular ?? [])];
  const popular = pool.popular?.length ? pool.popular : anyPool.length ? anyPool : FALLBACK;
  const trending = pool.trending?.length ? pool.trending : popular;
  let g = 0; // global counter drives the ~90% approved / ~10% rejected split

  for (const c of CONTRIBUTORS) {
    // Generate the contributor's full annotation count so the profile stat is truthful.
    const nAnn = Math.max(1, c.annotations);
    for (let i = 0; i < nAnn; i++) {
      // ~40% of each contributor's annotations land on the trending (aespa) comeback,
      // the rest spread across the popular catalog — like a real wiki.
      const useTrending = (c.rank + i) % 5 < 2;
      const arr = useTrending ? trending : popular;
      const song = arr[(c.rank * 7 + i * 13) % arr.length];
      const slang = SLANG[(c.rank + i) % SLANG.length];
      const note = NOTE_TEMPLATES[(c.rank + i) % NOTE_TEMPLATES.length](song.title, slang, c.focusTag, c.city);
      const status: "approved" | "rejected" = g % 10 === 6 ? "rejected" : "approved";
      annotations.push({
        id: `${c.slug}-ann-${i}`,
        authorSlug: c.slug,
        authorName: c.username,
        songTitle: song.title,
        songSlug: song.slug,
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
      const song = popular[(c.rank * 5 + i * 7) % popular.length];
      comments.push({
        id: `${c.slug}-cmt-${i}`,
        authorSlug: c.slug,
        authorName: c.username,
        context: song.title,
        body: tmpl(c.city, c.focusTag, c.focus, song.title),
        orderIndex: i,
      });
    }
  }

  return { annotations, comments };
}
