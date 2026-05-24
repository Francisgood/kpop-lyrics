# Lyrics Import

Seed `lyricsKo`, `lyricsEn`, and `lyricsRomanized` for songs in the Aegyo Arena DB.

## Schema

Three plain-text fields on the `Song` model:

| Field | Content |
|-------|---------|
| `lyricsKo` | Original lyrics — Korean characters where Korean, English where the line is English (mixed is common in K-pop) |
| `lyricsEn` | Full English translation, line for line |
| `lyricsRomanized` | Romanized pronunciation of Korean lines; English lines repeated as-is |

Format: plain newline-separated text. No HTML, no JSON, no markup. Empty lines between verses are fine.

## Step 1 — Identify songs missing lyrics

```bash
DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
node -e "
const {PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
p.song.findMany({
  where:{
    album:{artist:{slug:'ARTIST_SLUG'}},
    lyricsKo:null,
    NOT:[
      {title:{contains:'Inst',mode:'insensitive'}},
      {title:{contains:'VCR',mode:'insensitive'}},
      {title:{contains:'Ment',mode:'insensitive'}},
    ]
  },
  select:{slug:true,title:true,releaseYear:true,album:{select:{title:true}}},
  orderBy:{releaseYear:'asc'},
}).then(songs=>{
  const seen=new Set();
  const unique=songs.filter(s=>{
    const key=s.title.toLowerCase().replace(/[^a-z0-9\uac00-\ud7a3]/g,'');
    if(seen.has(key)){return false;}
    seen.add(key);
    return true;
  });
  unique.forEach(s=>console.log(s.slug,'|',s.title,'|',s.album?.title,'(',s.releaseYear,')'));
  console.log('Total:',unique.length);
}).finally(()=>p.\$disconnect())
"
```

## Step 2 — Find lyrics (source priority)

Most automated sources block scraping. Lyrics must be **manually obtained** from these sources:

### Primary sources (open in browser)
1. **Genius** — `genius.com/[Artist-Name]-[song-title]-lyrics`
   - Best for: original Korean + English mixed lines
   - Limitation: blocks automated fetch (403), must visit manually
   - Example: `genius.com/Blackpink-pink-venom-lyrics`

2. **Color Coded Lyrics** — `colorcodedlyrics.com`
   - Best for: Korean + Romanization + English translation in one page
   - Limitation: blocks automated fetch (403), must visit manually
   - Search: `colorcodedlyrics.com [artist] [song title]`

3. **lyricstranslate.com** — has Korean + Romanization + translation
   - Some pages accessible; vary by song

### Fallback (if above are unavailable)
- Wikipedia lyrics sections (rare but unblocked)
- Official fan wikis (e.g., `kpop.fandom.com`)

### Format notes when copying
- Keep Korean lines as-is (including embedded English words in Korean verses)
- For `lyricsRomanized`: repeat English-only lines unchanged; only romanize Korean portions
- One verse per blank line is readable but not required

## Step 3 — Seed script template

```ts
// prisma/seed-lyrics-ARTIST.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const LYRICS: Array<{
  slug: string;
  lyricsKo: string;
  lyricsEn: string;
  lyricsRomanized: string;
}> = [
  {
    slug: "blackpink-square-one-whistle",
    lyricsKo: `휘파람을 불어봐
...`,
    lyricsEn: `Let me hear your whistle baby
...`,
    lyricsRomanized: `Hwipareumul bureo bwa
...`,
  },
  // add more songs here
];

async function main() {
  for (const entry of LYRICS) {
    const song = await prisma.song.findUnique({ where: { slug: entry.slug } });
    if (!song) { console.warn("Not found:", entry.slug); continue; }
    if (song.lyricsKo) { console.log("Skip (has lyrics):", entry.slug); continue; }
    await prisma.song.update({
      where: { slug: entry.slug },
      data: {
        lyricsKo:        entry.lyricsKo.trim(),
        lyricsEn:        entry.lyricsEn.trim(),
        lyricsRomanized: entry.lyricsRomanized.trim(),
      },
    });
    console.log("✓", entry.slug);
  }
  console.log("Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

Run:
```bash
DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-lyrics-ARTIST.ts
```

## Step 4 — Deploy

Lyrics are stored in the DB and rendered server-side. No deploy needed — changes are live immediately via `force-dynamic`.

Verify on the song page: `https://kpop-lyrics-production.up.railway.app/artists/[artist-slug]` → click a song → lyrics section should appear.

## BLACKPINK — canonical songs missing lyrics

Priority targets (unique studio tracks, no KR/JP variants or live versions):

| Slug | Title | Album | Year |
|------|-------|-------|------|
| `blackpink-square-one` | 휘파람 | Square One | 2016 |
| `blackpink-square-one-1` | 붐바야 | Square One | 2016 |
| `blackpink-square-two` | 불장난 | Square Two | 2016 |
| `blackpink-square-two-stay` | Stay | Square Two | 2016 |
| `blackpink-blackpink-whistle` | Whistle | Blackpink | 2017 |
| `blackpink-blackpink-playing-with-fire` | Playing With Fire | Blackpink | 2017 |
| `blackpink-blackpink-as-if-its-your-last` | As If It's Your Last | Blackpink | 2017 |
| `blackpink-blackpink-in-your-area-forever-young` | Forever Young | Blackpink In Your Area | 2018 |
| `blackpink-blackpink-in-your-area-really` | Really | Blackpink In Your Area | 2018 |
| `blackpink-blackpink-in-your-area-see-u-later` | See U Later | Blackpink In Your Area | 2018 |
| `blackpink-deadline-go` | Go | Deadline | 2026 |
| `blackpink-deadline-fxxxboy` | Fxxxboy | Deadline | 2026 |
| `blackpink-deadline-champion` | Champion | Deadline | 2026 |
| `blackpink-deadline-me-and-my` | Me And My | Deadline | 2026 |
| `blackpink-deadline-jump` | 뛰어(JUMP) | Deadline | 2026 |

Songs already with lyrics — do not overwrite:

| Slug | Title |
|------|-------|
| `blackpink-ddu-du-ddu-du` | DDU-DU DDU-DU |
| `blackpink-kill-this-love` | Kill This Love |
| `blackpink-how-you-like-that` | How You Like That |
| `blackpink-selena-gomez-ice-cream` | Ice Cream |
| `blackpink-cardi-b-bet-you-wanna` | Bet You Wanna |
| `blackpink-pink-venom` | Pink Venom |
| `blackpink-lovesick-girls` | Lovesick Girls |

## Applying to other artists

Same workflow for any artist. Replace `ARTIST_SLUG` in the Step 1 query.
Songs with lyrics render in the `lyricsKo` / `lyricsEn` / `lyricsRomanized` tabs on the artist's song detail page.

When lyrics already exist for a song, the seed script skips it (checked by `song.lyricsKo` being non-null).
