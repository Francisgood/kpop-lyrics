Refresh the TrendingCache table in the Aegyo Arena database. Run this daily to keep trending scores current for songs, artists, and terms.

## What to do

1. **Compute song trending scores** — Query all Songs ordered by viewCount. For each song, calculate a weighted score:
   - Base = `song.viewCount`
   - Recency boost = songs released in the last 365 days get a 1.5× multiplier
   - Activity boost = songs with ≥1 LyricAnnotation get +200 points
   - Comment activity = +50 per Comment on this song in the last 7 days
   - Upsert into `TrendingCache` for periods: `"daily"`, `"weekly"`, `"monthly"`

2. **Compute artist trending scores** — Query all Artists. For each artist, score =
   - Sum of viewCounts from all songs they have a SongCredit on
   - + 500 if they have ArtistNews published in the last 30 days
   - + 200 per GroupMembership (active groups are more visible)
   - Upsert into `TrendingCache` with `entityType: "artist"`

3. **Compute term trending scores** — Query all CodedTerms. For each term:
   - Score = count of LyricAnnotations referencing this term × 100
   - + count of TermDefinition votes (votesUp − votesDown) × 10
   - Upsert into `TrendingCache` with `entityType: "term"`

4. **Prune stale daily entries** — Delete TrendingCache rows where `period = "daily"` and `computedAt < now() - 2 days` to keep the table lean.

## Implementation

Write a TypeScript script at `scripts/refresh-trending.ts` using Prisma. Run it with:
```
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/refresh-trending.ts
```

Then commit the updated DB state and report:
- How many songs, artists, terms were scored
- Top 5 trending songs (by daily score)
- Top 3 trending artists
- Any errors encountered

If significant trending shifts occurred (a previously low-ranked item jumped to top 5), note it explicitly so the editorial team can surface it on the homepage.
