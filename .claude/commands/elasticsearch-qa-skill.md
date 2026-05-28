# Aegyo Arena — Search QA Skill

Tests the site's search function against a standard suite of queries, reports
`ERROR_SEARCH_NO_RESULTS` events, and identifies content or logic gaps.

> **Note:** The search engine is Prisma/PostgreSQL (not a hosted Elasticsearch
> cluster). The `elasticsearch-qa-skill` name reflects the QA workflow, not the
> underlying technology.

---

## Quick run

```bash
DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
DIRECT_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/search-qa-test.ts
```

## Check recent empty-search events (production)

```bash
curl -s https://kpop-lyrics-production.up.railway.app/api/search-misses | jq .
# Optional query params:
#   ?since=1d|7d|30d|all    (default: 7d)
#   ?limit=100               (default: 50)
```

Example response:
```json
{
  "errorCode": "ERROR_SEARCH_NO_RESULTS",
  "period": "7d",
  "total": 12,
  "uniqueTerms": 8,
  "rows": [
    { "query": "melbourne", "count": 3, "lastSeen": "2026-05-27T..." },
    { "query": "saesang",   "count": 1, "lastSeen": "..." }
  ]
}
```

---

## Standard QA query suite (19 queries)

### Category 1 — Artist / Song / Album (10 queries)

| Query | Expected hits |
|-------|--------------|
| BLACKPINK | artist + credit songs |
| BTS | artist + songs |
| Dynamite | song (exact) |
| LALISA | song + artist + album |
| Map of the Soul | albums (BTS) |
| TWICE | artist + songs |
| aespa | artist + songs |
| Stray Kids | artist + songs |
| MAMAMOO | artist + songs |
| Butter | exact song; falls back to Butterfly if not seeded |

### Category 2 — Localized city search (3 queries)

| Query | Expected |
|-------|---------|
| New York | City page + popular artists |
| Melbourne | **data gap** — not in city DB; logs `ERROR_SEARCH_NO_RESULTS` |
| Seoul | City page + album mentions |

> To add Melbourne: seed a `City` record (`slug: "melbourne"`, `name: "Melbourne"`,
> `country: "Australia"`) and link artists via `ArtistCity`.

### Category 3 — Long-tail / discography (3 queries)

| Query | Resolution strategy |
|-------|-------------------|
| SEVENTEEN vocal unit | credit search → fallback to "SEVENTEEN" (longest word) |
| BTS DNA lyrics universe | fallback to "universe" → lyric/album match |
| produced by Teddy BLACKPINK | credit search for "Teddy" + "BLACKPINK" words |

### Category 4 — Slang (3 queries)

| Query | Resolution strategy |
|-------|-------------------|
| bias wrecker | direct term match |
| saesang | synonym map → resolves to "sasaeng" |
| aegyo | direct term match |

**Result before improvements:** 5/19 empty  
**Result after improvements:** 2/19 empty (Melbourne data gap; saesang fixed via synonym)

---

## How the search works

### Source priority (per result type)

**Songs:**
1. Exact title match (highest priority — fixes "Butter" vs "Butterfly" confusion)
2. Contains title match
3. Credit search (songs where a credited artist matches the query or any meaningful word)
4. Lyrics search — English + Romanized (long-tail queries ≥ 3 words only)
5. Long-tail word fallback (if total results < 3)

**Artists:**
1. Exact stage name match
2. Contains stage name or real name

**Terms / Slang:**
1. Term text (contains)
2. Slug (contains) — catches romanization variants
3. Synonym map — `SLANG_SYNONYMS` in `app/search/page.tsx`

**Albums:**
1. Exact title match
2. Contains title match

**Cities (localized):**
- Matches city name, returns linked artists (`ArtistCity`) and charting songs (`SongCity`)

### Long-tail fallback

If total results < 3 for a multi-word query, the search retries using the
**longest meaningful word** in the query (stop words excluded):

```
"SEVENTEEN vocal unit" → fallback word: "SEVENTEEN"
"produced by Teddy BLACKPINK" → fallback word: "BLACKPINK"
"BTS DNA lyrics universe" → fallback word: "universe"
```

A yellow notice appears in the UI: _Showing results related to "SEVENTEEN" — no
exact match for "SEVENTEEN vocal unit"_

### Synonym map

Located in `app/search/page.tsx` → `SLANG_SYNONYMS`:

```typescript
const SLANG_SYNONYMS: Record<string, string> = {
  "saesang":  "sasaeng",
  "hwaiting": "fighting",
  "aigoo":    "aigo",
  "maknea":   "maknae",
  "unni":     "unnie",
  // ...
};
```

When a synonym is resolved, the header shows:
> _1 result → showing results for "sasaeng"_

---

## Error tracking

### `ERROR_SEARCH_NO_RESULTS`

When a query returns zero results across all categories, it is logged to the
`SearchMiss` table (PostgreSQL) **non-blocking** (fire-and-forget, does not
delay render):

```typescript
prisma.searchMiss.create({ data: { query: rawUserQuery } }).catch(() => {});
```

The error code is also displayed in the UI:
```
ERROR_SEARCH_NO_RESULTS
```

### Schema

```prisma
model SearchMiss {
  id        String   @id @default(cuid())
  query     String               // what the user typed (before synonym resolution)
  errorCode String   @default("ERROR_SEARCH_NO_RESULTS")
  createdAt DateTime @default(now())

  @@index([createdAt])
  @@index([query])
}
```

### API

`GET /api/search-misses?since=7d&limit=50`

Returns aggregated miss counts sorted by frequency. Use this to prioritise:
- Missing city records (Melbourne, Sydney, Toronto…)
- Missing artist/song seeds
- New slang entries for the K-pop dictionary

---

## Known data gaps (as of 2026-05-27)

| Gap | Fix |
|-----|-----|
| Melbourne not in city DB | Seed `City` + `ArtistCity` records |
| "Butter" by BTS not seeded | Add via Discogs discography script |
| City–artist links empty (New York, Seoul) | Run `ArtistCity` seeding script or add manually |
| No sub-group data (SEVENTEEN vocal/hip-hop/performance units) | Requires `GroupMembership` role tagging |

---

## Adding new synonym entries

Edit `SLANG_SYNONYMS` in `app/search/page.tsx`:

```typescript
const SLANG_SYNONYMS: Record<string, string> = {
  "new-variant": "canonical-term",
  // ...
};
```

Then commit and deploy (`railway up --detach --service kpop-lyrics`).

---

## Files changed by this skill

| File | Change |
|------|--------|
| `app/search/page.tsx` | Major rewrite: exact-match priority, album UI, city UI, credits search, lyrics search, long-tail fallback, synonym map, SearchMiss logging |
| `app/api/search-misses/route.ts` | New endpoint: GET aggregated error report |
| `prisma/schema.prisma` | Added `SearchMiss` model |
| `scripts/search-qa-test.ts` | Full QA test script mirroring page logic |
