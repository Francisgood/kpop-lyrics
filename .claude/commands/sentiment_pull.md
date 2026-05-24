# Sentiment Pull — Artist Sentiment Cache + Lyric Annotation Injection

Fetches the last 30 days of public sentiment, news, chart data, and fan discourse for any K-pop artist in Aegyo Arena, caches it to `public/scraped/sentiment/`, and generates culturally grounded annotation suggestions for their lyrics.

## Usage

```
/sentiment_pull <artist-slug> [song:<song-slug>]
```

**Examples:**
- `/sentiment_pull bts` — pull + cache BTS sentiment
- `/sentiment_pull bts song:bts-run-bts` — pull + generate annotation suggestions for Run BTS
- `/sentiment_pull blackpink song:blackpink-pink-venom` — pull BLACKPINK + annotate Pink Venom

---

## Step 1 — Look up the artist in the DB

```bash
DB=$(railway variables --json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('DIRECT_URL',''))"); DATABASE_URL="$DB" DIRECT_URL="$DB" node -e "
const {PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
p.artist.findUnique({where:{slug:'<ARTIST_SLUG>'},select:{id:true,stageName:true,slug:true}})
 .then(a=>console.log(JSON.stringify(a)))
 .finally(()=>p.\$disconnect());
"
```

If `song:<song-slug>` was specified, also fetch the song's lyrics:

```bash
DB=$(railway variables --json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('DIRECT_URL',''))"); DATABASE_URL="$DB" DIRECT_URL="$DB" node -e "
const {PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
p.song.findUnique({where:{slug:'<SONG_SLUG>'},select:{id:true,title:true,lyricsKo:true,lyricsEn:true}})
 .then(s=>{
   const ko=(s.lyricsKo||'').split('\n');
   const en=(s.lyricsEn||'').split('\n');
   ko.forEach((l,i)=>{ if(l.trim()) console.log(i+'|'+l+'|||'+(en[i]||'')); });
   console.log('SONG_ID='+s.id);
 })
 .finally(()=>p.\$disconnect());
"
```

---

## Step 2 — Pull recent sentiment (last 30 days)

Use WebSearch + WebFetch in parallel to gather signals. **Date window:** today minus 30 days. Substitute `<ARTIST_STAGE_NAME>` with the artist's actual name (e.g. "BTS", "BLACKPINK", "TWICE").

### Required searches (run all, skip gracefully if blocked):

| Signal | Search query |
|--------|-------------|
| Chart performance | `<ARTIST_STAGE_NAME> spotify chart 2026` |
| News headlines | `<ARTIST_STAGE_NAME> news May 2026` |
| Fan sentiment | `<ARTIST_STAGE_NAME> reddit kpop 2026` |
| Comeback / activity | `<ARTIST_STAGE_NAME> comeback release 2026` |
| Controversy or milestone | `<ARTIST_STAGE_NAME> milestone achievement 2026` |
| Collaborations | `<ARTIST_STAGE_NAME> collab feat 2026` |

For BTS specifically, also search individual member names if relevant (Jungkook, Jimin, V, j-hope, Suga, Jin, RM).

Also check the cached Obsidian reference if available:
- `/Users/francis/Documents/Documents - Francis's Mac mini/obsidian/franciss/Franciss/08 - Research and Notes/` — look for any `K-pop Signals` file dated within the last 30 days.

---

## Step 3 — Analyze themes

From the gathered content, extract and score the following:

```json
{
  "artist": "<stageName>",
  "slug": "<artistSlug>",
  "pulled_at": "<ISO date>",
  "window_days": 30,
  "dominant_sentiment": "positive | mixed | negative",
  "sentiment_score": 0.0,
  "trending_themes": [
    {
      "theme": "string",
      "sentiment": "positive | negative | neutral",
      "evidence": "1–2 sentence summary",
      "sources": ["url or source name"]
    }
  ],
  "chart_signals": {
    "spotify_monthly_listeners": null,
    "charting_songs": [],
    "notable_movements": []
  },
  "key_phrases": [],
  "annotation_hooks": [
    "Cultural/lyrical connection between current sentiment and the artist's catalog"
  ],
  "raw_headlines": []
}
```

**Sentiment scoring:** +1.0 = uniformly positive, 0.0 = neutral, -1.0 = uniformly negative.

---

## Step 4 — Cache the result

Write the analysis to:
```
public/scraped/sentiment/<artist-slug>-YYYY-MM-DD.json
```

Use the Write tool (not Bash echo) to create the file. If a file for today already exists, overwrite it. Also write/update an index file:

```
public/scraped/sentiment/_index.json
```

The index maps `artist-slug → latest cache file path + pulled_at`.

---

## Step 5 — Generate annotation suggestions (only if `song:` was specified)

For each lyric line that:
- Has no existing annotation, **and**
- Contains a word, phrase, or theme that connects to the cached sentiment data (themes, key phrases, chart signals, cultural hooks)

Output annotation suggestions in this exact format:

```
LINE <index> | "<korean text>" | EN: "<english text>"
  word: "<phrase to annotate>"
  note: "<150-300 word annotation covering: literal meaning, cultural/literary motif (symbolism/metaphor/simile/analogy), and connection to current fan sentiment or artist trajectory>"
```

**Quality bar for annotations:**
- Literary motif identification is required (what writing device is being used?)
- Korean etymology or cultural context required for Korean-language phrases
- Avoid generic praise; favor specific, verifiable cultural claims
- Cross-reference the sentiment cache: if the artist just had a major milestone, connect it
- For BTS: draw on their 방탄 (bulletproof) ethos, UN speech themes, and the 우리 (collective we) framework

**Do not suggest annotations for:**
- Lines that already have annotations (check Step 1 output)
- Blank/instrumental lines
- Lines that are purely phonetic filler with no semantic content

---

## Step 6 — Seed approved annotations (optional)

If the user approves the suggested annotations, seed them using:

```bash
DB=$(railway variables --json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('DIRECT_URL',''))"); DATABASE_URL="$DB" DIRECT_URL="$DB" npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-annotations-<artist>-<song>.ts
```

Create the seed file at `prisma/seed-annotations-<artist>-<song>.ts` using this template:

```ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SONG_SLUG = "<song-slug>";

const ANNOTATIONS = [
  { lineIndex: N, word: "phrase", note: "..." },
];

async function main() {
  const song = await prisma.song.findUnique({ where: { slug: SONG_SLUG }, select: { id: true } });
  if (!song) { console.error("Not found:", SONG_SLUG); return; }
  for (const ann of ANNOTATIONS) {
    const exists = await prisma.lyricAnnotation.findFirst({
      where: { songId: song.id, lineIndex: ann.lineIndex, word: ann.word },
    });
    if (exists) { console.log("skip", ann.lineIndex, ann.word); continue; }
    await prisma.lyricAnnotation.create({ data: { songId: song.id, ...ann } });
    console.log("✓", ann.lineIndex, ann.word);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
```

---

## Applying to other artists

This skill works for any artist slug in Aegyo Arena. The following artists are currently seeded:

| Artist | Slug |
|--------|------|
| BTS | `bts` |
| BLACKPINK | `blackpink` |
| TWICE | `twice` |
| aespa | `aespa` |
| NewJeans | `newjeans` |
| SEVENTEEN | `seventeen` |
| Kiiikiii | `kiiikiii` |

For member-specific sentiment (solo activities), use the member's artist slug if they have one seeded (e.g., for BTS solos, search for the individual member name in Step 2 regardless of slug).

---

## Cache lifespan

Sentiment caches are valid for **30 days** from `pulled_at`. If a cached file exists and is within the window, offer to use it instead of re-pulling. Always display the cache age to the user.

Check for existing cache before pulling:
```bash
ls -la public/scraped/sentiment/<artist-slug>-*.json 2>/dev/null | sort -r | head -3
```
