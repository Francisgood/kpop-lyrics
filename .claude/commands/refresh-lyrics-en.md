# Refresh English Translations from Genius API

Fetch English translations for songs that have Korean lyrics but no English translation. Runs **after** `refresh-lyrics` — depends on `lyricsKo` being populated first.

**Never generates or infers translations.** Only stores text returned directly from Genius English Translations pages.

## What it does

1. Queries songs with `lyricsKo != null AND lyricsEn = null`
2. Searches Genius API: `"{artist} {title} English Translation"`
3. Accepts only hits attributed to "Genius English Translations" (primary artist filter)
4. Validates title match using word-overlap similarity ≥ 40%
5. Scrapes the translation page — full entity decoding including `&quot;`
6. Writes `lyricsEn` to DB; appends every decision to `public/scraped/lyrics-en-audit.json`

## Credentials

| Variable | Value |
|---|---|
| `GENIUS_TOKEN` | `cwf7vDQbKWyVJTX0GFqnVu2Weh_o13qcoYz5gBBVA5Fs6U0qmJGc4MyMCvz5M6Vj` |

Set as a Railway env var on the `kpop-lyrics` service.

## Run: full catalog sweep

```bash
DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
DIRECT_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
GENIUS_TOKEN="cwf7vDQbKWyVJTX0GFqnVu2Weh_o13qcoYz5gBBVA5Fs6U0qmJGc4MyMCvz5M6Vj" \
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/fetch-lyrics-en.ts
```

Processes songs at ~1.1s each. Audit flushed every 25 songs. Safe to re-run — already-done songs are skipped.

## Run: single artist

```bash
... scripts/fetch-lyrics-en.ts --artist newjeans
... scripts/fetch-lyrics-en.ts --artist blackpink
... scripts/fetch-lyrics-en.ts --artist bts
```

## Run: dry-run preview

```bash
... scripts/fetch-lyrics-en.ts --artist newjeans --limit 5 --dry-run
```

## Run: single song

```bash
... scripts/fetch-lyrics-en.ts --slug newjeans-hype-boy
```

Ignores the audit skip-list for the specified slug — always re-fetches.

## Run order (daily pipeline)

Run `refresh-lyrics` first, then `refresh-lyrics-en`:

```bash
# Step 1 — Korean originals + Romanized
DATABASE_URL="..." GENIUS_TOKEN="..." \
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/fetch-lyrics-genius.ts

# Step 2 — English translations (requires lyricsKo to be populated)
DATABASE_URL="..." GENIUS_TOKEN="..." \
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/fetch-lyrics-en.ts
```

## Daily schedule (Railway Cron)

Run 30 minutes after `refresh-lyrics` finishes:

**Cron expression:** `30 2 * * *` (2:30am UTC daily — 30 min after lyrics sweep at 2:00am)

**Command:**
```bash
GENIUS_TOKEN="cwf7vDQbKWyVJTX0GFqnVu2Weh_o13qcoYz5gBBVA5Fs6U0qmJGc4MyMCvz5M6Vj" \
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/fetch-lyrics-en.ts
```

## Audit log

All decisions written to `public/scraped/lyrics-en-audit.json`:

```json
{
  "generated": "2026-06-02T...",
  "stats": { "updated": 120, "no_match": 80, "failed": 5 },
  "entries": [
    {
      "songSlug": "newjeans-hype-boy",
      "songTitle": "Hype Boy",
      "artist": "NewJeans",
      "status": "updated",
      "geniusUrl": "https://genius.com/Genius-english-translations-newjeans-hype-boy-english-translation-lyrics",
      "lines": 65
    }
  ]
}
```

**Status values:**
- `updated` — lyricsEn written to DB
- `no_match` — no Genius English Translation page found (expected for many songs)
- `failed` — translation page found but scrape returned empty
- `dry_run` — match found, no DB write (preview mode)
- `skipped` — reserved for future use

`no_match` is normal — not all K-pop songs have community English translations on Genius. Review `failed` entries manually.

## DB query: check English coverage

```bash
DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
npx ts-node --compiler-options '{"module":"CommonJS"}' -e "
import { prisma } from './lib/prisma';
async function main() {
  const total    = await prisma.song.count();
  const hasKo    = await prisma.song.count({ where: { lyricsKo: { not: null } } });
  const hasEn    = await prisma.song.count({ where: { lyricsEn: { not: null } } });
  const hasBoth  = await prisma.song.count({ where: { lyricsKo: { not: null }, lyricsEn: { not: null } } });
  const needsEn  = await prisma.song.count({ where: { lyricsKo: { not: null }, lyricsEn: null } });
  console.log('Total:', total);
  console.log('Has Korean:', hasKo);
  console.log('Has English:', hasEn);
  console.log('Has both:', hasBoth);
  console.log('Has Ko, needs En:', needsEn);
}
main().finally(() => prisma.\$disconnect());
"
```
