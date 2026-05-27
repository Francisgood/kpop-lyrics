Refresh artist discographies from the Discogs API. Fetches master releases (canonical editions — no regional duplicates) for every artist in DISCOGS_ARTIST_MAP and upserts Albums + Songs into the DB.

## How it works

**Discogs API flow (no account needed):**
1. `GET /artists/{discogs_id}/releases?sort=year&sort_order=desc` — paginated list of an artist's releases
2. Filter to `type = "master"` and `role = "Main"` (excludes guest appearances and regional re-presses)
3. `GET /masters/{master_id}` — full record with tracklist, cover art URL, year
4. Upsert Album + Songs; skip if album title already exists for that artist

**Rate limits:**
- Unauthenticated: 25 req/min → script enforces 2.6 s delay
- With `DISCOGS_TOKEN`: 60 req/min → 1.1 s delay (significantly faster)
- Get a free token at https://www.discogs.com/settings/developers → "Generate new token"

**DB writes:**
- `Album`: slug, title, artistId, releaseYear, type (Single/EP/Mini Album/Album), coverArt
- `Song`: slug, title, albumId, releaseYear
- `SongCredit`: songId, artistId, role="main" (so songs appear on artist page)

## Steps

1. Run the script against production DB:
```
DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
npx ts-node --compiler-options '{"module":"CommonJS"}' \
scripts/fetch-discogs-discography.ts
```

2. With a Discogs token (faster, recommended):
```
DATABASE_URL="..." DISCOGS_TOKEN="your_token_here" \
npx ts-node --compiler-options '{"module":"CommonJS"}' \
scripts/fetch-discogs-discography.ts
```

3. Report total albums created vs skipped per artist.

4. After a successful run, deploy to push updated cover art and song counts live:
```
railway up --detach
```

## Adding a new artist

Find their Discogs ID by searching: `https://www.discogs.com/search/?type=artist&q={name}`
Or via API: `curl "https://api.discogs.com/database/search?q={name}&type=artist&per_page=5" -H "User-Agent: AegyoArena/1.0"`

Then add to `DISCOGS_ARTIST_MAP` in `scripts/fetch-discogs-discography.ts`:
```ts
"artist-slug": 1234567,
```

The slug must match `Artist.slug` exactly in the DB.

## Tuning

- `MIN_TRACKS` (default 2): minimum tracklist length to include a release. Raise to 3 to skip 2-track singles.
- `MAX_MASTERS_PER_ARTIST` (default 40): cap on masters fetched per artist. Lower for faster runs on well-known artists.
- `year >= 2010` filter: the script skips pre-2010 releases. Remove this check for legacy groups like Girls' Generation or SHINee if you want full back-catalogues.

## Known artist → Discogs ID map

| Artist slug        | Discogs ID |
|--------------------|-----------|
| bts                | 5034422   |
| blackpink          | 5210284   |
| twice              | 4786543   |
| aespa              | 8724412   |
| newjeans           | 11594273  |
| seventeen          | 5071504   |
| ive                | 7122521   |
| itzy               | 7296238   |
| stray-kids         | 6838809   |
| enhypen            | 8303009   |
| le-sserafim        | 11171795  |
| txt                | 7164941   |
| g-i-dle            | 6605933   |
| ateez              | 7164694   |
| red-velvet         | 4390346   |
| nct-127            | 5181064   |
| nct-dream          | 6284600   |
| mamamoo            | 4722103   |
| babymonster        | 14457941  |
| zerobaseone        | 13233045  |
| riize              | 13421259  |
| nmixx              | 10946579  |
| illit              | 14486810  |
| girls-generation   | 1584084   |
| exo                | 4038105   |
| shinee             | 1882255   |
| katseye            | 14911211  |
| dreamcatcher       | 5644676   |
| everglow           | 8274255   |
| boynextdoor        | 13051656  |
| kiss-of-life       | 13262367  |
| tws                | 15583911  |
| nuest              | 4037139   |
| gfriend            | 4245423   |
| lovelyz            | 4752865   |
| izone              | 7070777   |
| wanna-one          | 6562516   |
| fromis-9           | 6714332   |
| block-b            | 2736097   |
| exid               | 4205258   |
| btob               | 5662517   |
| ladies-code        | 4248746   |
| akmu               | 4690557   |
| oh-my-girl         | 5303926   |
| cravity            | 8687494   |
| stayc              | 8399658   |
| bap                | 5034363   |
| pentagon           | 5657969   |
| the-boyz           | 6790967   |
| treasure           | 324281    |
| plave              | 15385692  |
| hearts2hearts      | 16058616  |
