# Refresh Lyrics from Genius API

Fetch and update song lyrics for the Aegyo Arena catalog using the Genius API as the authoritative source. Runs incrementally — skips songs already updated, resumes from where it left off on crash.

**Never generates or infers lyrics.** Only stores text returned directly by Genius.

## What it does

1. Queries songs with missing `lyricsKo` / `lyricsEn` from the DB
2. Searches Genius API by artist name + song title
3. Validates the match using title + artist similarity (≥40% confidence required)
4. Scrapes the Genius song page for `data-lyrics-container` elements
5. Detects language: Hangul → `lyricsKo`, English-only → `lyricsEn`
6. Writes to DB; appends every decision to `public/scraped/lyrics-audit.json`

For specific songs (e.g. Hype Boy), also pull the **Romanized** and **English Translation** pages from Genius and update all three fields.

## Credentials

| Variable | Value |
|---|---|
| `GENIUS_TOKEN` | `cwf7vDQbKWyVJTX0GFqnVu2Weh_o13qcoYz5gBBVA5Fs6U0qmJGc4MyMCvz5M6Vj` |
| `GENIUS_CLIENT_ID` | `1WQUGyxP1CoBWf6was2Uc3Q5p2mTLyXd_B_CFlwNpvLYNcs3znjGI9Ar6R8dNrxL` |
| `GENIUS_CLIENT_SECRET` | `yq3NWajBKi7dvRpScADWenhLDpYP5bWRCRD2kNbIOrnjhPYz8yVpqA0z7tdsfbmY0flwH_K5-TLrahHgI2EtyA` |

All three are set as Railway env vars on the `kpop-lyrics` service.

## Genius URL patterns

| Version | URL pattern |
|---|---|
| Korean original | `https://genius.com/[Artist-slug]-[song-slug]-lyrics` |
| Romanized | `https://genius.com/Genius-romanizations-[artist]-[song]-romanized-lyrics` |
| English translation | `https://genius.com/Genius-english-translations-[artist]-[song]-english-translation-lyrics` |

## Run: full catalog sweep

```bash
DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
DIRECT_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
GENIUS_TOKEN="cwf7vDQbKWyVJTX0GFqnVu2Weh_o13qcoYz5gBBVA5Fs6U0qmJGc4MyMCvz5M6Vj" \
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/fetch-lyrics-genius.ts
```

Processes ~1,400 songs at ~1.1s per song (~25 min). Audit log flushed every 25 songs.

## Run: single artist

```bash
... scripts/fetch-lyrics-genius.ts --artist newjeans
... scripts/fetch-lyrics-genius.ts --artist blackpink
... scripts/fetch-lyrics-genius.ts --artist bts
```

## Run: dry-run preview

```bash
... scripts/fetch-lyrics-genius.ts --artist stray-kids --limit 10 --dry-run
```

## Run: single song (Korean + Romanized + English)

For songs where you want all three versions from Genius (Korean original page + translation pages):

```bash
node -e "
async function scrape(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9,ko;q=0.8'
    }
  });
  const html = await res.text();
  const parts = [];
  let depth = 0, inContainer = false, buf = '';
  const tokens = html.split(/(<[^>]+>)/);
  for (const tok of tokens) {
    if (tok.startsWith('<') && /data-lyrics-container=\"true\"/.test(tok)) { inContainer = true; depth = 1; buf = ''; continue; }
    if (inContainer) {
      if (tok.startsWith('</div')) { depth--; if (depth <= 0) { const t = buf.replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&#x27;/g,\"'\").trim(); if (t) parts.push(t); inContainer=false; buf=''; continue; } }
      else if (tok.startsWith('<div')) depth++;
      buf += tok;
    }
  }
  const raw = parts.join('\n\n');
  const firstSection = raw.indexOf('\n[');
  return firstSection > 0 ? raw.slice(firstSection + 1) : raw;
}

// Replace these three URLs for the target song
const KO_URL   = 'https://genius.com/Newjeans-hype-boy-lyrics';
const ROM_URL  = 'https://genius.com/Genius-romanizations-newjeans-hype-boy-romanized-lyrics';
const EN_URL   = 'https://genius.com/Genius-english-translations-newjeans-hype-boy-english-translation-lyrics';
const SLUG     = 'newjeans-hype-boy';

const DB = require('@prisma/client');
const p = new DB.PrismaClient();

(async () => {
  const [ko, rom, en] = await Promise.all([scrape(KO_URL), scrape(ROM_URL), scrape(EN_URL)]);
  await p.song.update({ where: { slug: SLUG }, data: { lyricsKo: ko, lyricsRomanized: rom, lyricsEn: en } });
  console.log('Updated:', SLUG, '| ko:', ko.split('\n').filter(Boolean).length, 'lines | rom:', rom.split('\n').filter(Boolean).length, 'lines | en:', en.split('\n').filter(Boolean).length, 'lines');
  await p.\$disconnect();
})();
"
```

## Daily schedule (Railway Cron)

Set up a Railway cron job to run the full sweep nightly:

**Cron expression:** `0 2 * * *` (2am UTC daily)

**Command:**
```bash
GENIUS_TOKEN="cwf7vDQbKWyVJTX0GFqnVu2Weh_o13qcoYz5gBBVA5Fs6U0qmJGc4MyMCvz5M6Vj" \
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/fetch-lyrics-genius.ts
```

The script is **idempotent** — songs already with lyrics are skipped automatically. Only newly added songs get processed each day.

## Audit log

All decisions are written to `public/scraped/lyrics-audit.json`:

```json
{
  "generated": "2026-06-02T...",
  "stats": { "updated": 385, "no_match": 106, "failed": 28 },
  "validation_sources": ["Genius API — artist name + title similarity ≥ 40%", "..."],
  "entries": [
    {
      "songSlug": "newjeans-hype-boy",
      "status": "updated",
      "geniusUrl": "https://genius.com/Newjeans-hype-boy-lyrics",
      "confidence": 1.0,
      "linesKo": 72,
      "linesEn": 0
    }
  ]
}
```

Review `failed` and `no_match` entries manually. Common causes:
- **Instrumentals** — correctly skipped, no lyrics exist
- **Low confidence** — song title is too generic (e.g., "Intro", "Skit")
- **Scrape empty** — Genius page is JS-rendered; fetch manually

## DB query: check coverage

```bash
DATABASE_URL="..." npx ts-node --compiler-options '{"module":"CommonJS"}' -e "
import { prisma } from './lib/prisma';
async function main() {
  const total   = await prisma.song.count();
  const hasEither = await prisma.song.count({ where: { OR: [{ lyricsKo: { not: null } }, { lyricsEn: { not: null } }] } });
  const missing = await prisma.song.count({ where: { lyricsKo: null, lyricsEn: null } });
  console.log('Total:', total, '| With lyrics:', hasEither, '| Missing:', missing);
}
main().finally(() => prisma.\$disconnect());
"
```
