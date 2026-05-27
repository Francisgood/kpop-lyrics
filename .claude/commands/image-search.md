# Aegyo Arena — Image Search

Fetches and refreshes artist/album images from multiple sources, then pushes to the live DB.

## Source priority

| Tier | Source | Script | Notes |
|------|--------|--------|-------|
| 1 | Wikipedia API | `fetch-images.ts` | Fast, high-quality; covers most major acts |
| 2 | K-pop Fandom Wiki API | `fetch-images.ts` | Same MediaWiki protocol; covers K-pop-specific artists Wikipedia misses |
| 3 | Scrapling cache | `fetch-images-scrape.py` → `fetch-images.ts` reads cache | Python scraper: Fandom API + Kprofiles.com + AllKpop |
| 4 | iTunes Search API | `fetch-images.ts` | Album cover art only |

## Quick run (most common)

```bash
# 1. Run TypeScript fetcher (Wikipedia + Fandom API + Scrapling cache + iTunes)
DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
DIRECT_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/fetch-images.ts

# 2. Push updates to the live site
curl -s -X POST https://kpop-lyrics-production.up.railway.app/api/image-refresh
```

## When there are still "no image" results

Run the Python Scrapling scraper to rebuild the cache, then re-run the TypeScript fetcher:

```bash
# Scrape only the slugs that had no image (fastest)
python3 scripts/fetch-images-scrape.py --slugs slug1,slug2,slug3

# Or scrape every artist fresh
python3 scripts/fetch-images-scrape.py

# Or skip slugs already in the cache
python3 scripts/fetch-images-scrape.py --only-missing

# Limit to a single source
python3 scripts/fetch-images-scrape.py --source fandom
python3 scripts/fetch-images-scrape.py --source kprofiles

# Then re-run the TypeScript fetcher to apply the cache to the DB
DATABASE_URL="..." npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/fetch-images.ts
```

## How it works

### `fetch-images.ts` (TypeScript — runs against DB)
- Reads `ARTIST_WIKI` → calls Wikipedia `pageimages` API
- Falls back to `ARTIST_FANDOM` → calls K-pop Fandom `pageimages` API (same protocol)
- Falls back to `scripts/scrapling-images-cache.json` if present
- For albums: tries `ALBUM_ITUNES` → iTunes Search API, then `ALBUM_WIKI` → Wikipedia
- Writes `imageUrl` on `Artist` and `coverArt` on `Album` + `Song` records

### `fetch-images-scrape.py` (Python — Scrapling)
- **Fandom API** — `kpop.fandom.com/api.php?action=query&prop=pageimages` (no browser required)
- **Kprofiles.com** — Scrapling `Fetcher` (static HTML), extracts `og:image` from group profile pages
- **AllKpop.com** — Scrapling `StealthyFetcher` (JS-rendered), for artists not on Fandom or Kprofiles
- Outputs `scripts/scrapling-images-cache.json` — picked up automatically by `fetch-images.ts`

## Adding a new artist

### Add to `ARTIST_WIKI` in `fetch-images.ts`:
```ts
"artist-slug": "Wikipedia page title",
```

### If Wikipedia has no image, add to `ARTIST_FANDOM` in `fetch-images.ts`:
```ts
"artist-slug": "Fandom wiki page title",  // exact title, case-sensitive
```

### If Fandom also has no image, add to `ARTIST_KPROFILES` in `fetch-images-scrape.py`:
```python
"artist-slug": "kprofiles-url-path",  # e.g. "the-boyz-members-profile"
```
Then run `python3 scripts/fetch-images-scrape.py --slugs artist-slug` to populate the cache.

## Adding album art

Add to `ALBUM_ITUNES` in `fetch-images.ts`:
```ts
"album-slug": "Artist Album Name",  // iTunes search term
```

Or add to `ALBUM_WIKI`:
```ts
"album-slug": "Wikipedia album page title",
```

## Installing Scrapling (one-time)

```bash
pip install "scrapling[fetchers]"
scrapling install   # downloads Chromium and GeoIP database
```

## After a successful run

The DB is updated immediately. The live Railway site re-reads images from DB on each request
(pages use `force-dynamic`). You can also manually bust the cache:

```bash
curl -s -X POST https://kpop-lyrics-production.up.railway.app/api/image-refresh
```

## Current source labels in output

| Label | Meaning |
|-------|---------|
| `[wiki]` | Resolved from Wikipedia API |
| `[fandom]` | Resolved from K-pop Fandom Wiki API |
| `[scrapling]` | Resolved from Scrapling cache (kprofiles, allkpop) |
| `[itunes]` | Resolved from iTunes Search API (albums only) |
