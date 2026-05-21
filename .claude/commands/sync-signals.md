Generate and refresh daily ContentSignals for Aegyo Arena. Run this daily to keep the signal feed fresh across artists, songs, terms, and cities.

## What ContentSignals are

ContentSignals are cross-entity news items stored in the `ContentSignal` table. Unlike `ArtistNews` (which is artist-only), ContentSignals can be linked to any entity type: `"song"`, `"artist"`, `"album"`, `"term"`, `"city"`, or `"collab"`.

Categories: `"collab"` | `"chart"` | `"release"` | `"tour"` | `"community"` | `"trending"`

## Steps

### 1. Identify stale entities
Query for entities that haven't had a signal in 7+ days:
```sql
-- Artists with no recent signals
SELECT a.id, a.stageName, a.slug FROM Artist a
WHERE NOT EXISTS (
  SELECT 1 FROM ContentSignal cs
  WHERE cs.entityType = 'artist' AND cs.entityId = a.id
  AND cs.createdAt > datetime('now', '-7 days')
)
AND a.type IN ('GROUP', 'SOLOIST')
LIMIT 10;
```

### 2. Generate artist signals
For each stale artist, look at their data and generate a signal:
- If they have a recent Album (releaseYear = current year): generate a `"release"` signal
- If they have SongCredits shared with a `COLLAB`-type artist: generate a `"collab"` signal
- If their songs rank highly in TrendingCache: generate a `"trending"` signal
- If they have upcoming CityEvents: generate a `"tour"` signal

Write realistic, editorial-quality headlines and 2-3 sentence body text grounded in real data from the DB (actual song titles, real collab names, actual cities).

### 3. Generate term signals
For each CodedTerm that has ≥3 annotations but no signal in 14 days:
- Summarize what the term means and where it appears in the discography
- Link it to a song where it appears (`entityType: "term"`, `entityId: term.id`)
- Category: `"community"`

### 4. Generate city signals
For each City with upcoming CityEvents in the next 60 days that has no signal in 30 days:
- Write a `"tour"` signal noting the upcoming event
- Include venue, approximate date, and link to ticket URL

### 5. Insert signals
Use `prisma.contentSignal.create()` for each new signal. Never duplicate: check for existing signals on the same entity in the last 7 days before inserting.

## Script location

`scripts/sync-signals.ts` — run with:
```
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/sync-signals.ts
```

## Output

Report:
- How many signals were created (by category)
- Which artists/terms/cities received new signals
- Any entities that could not generate a signal due to missing data

After running, redeploy with `railway up --detach` so the Railway SQLite gets rebuilt with the new signals on next seed run.
