# QA Image Sweep — Daily Missing Thumbnail Audit

Finds every artist, album, and song with a missing or broken image URL, attempts to resolve them from Wikipedia / iTunes, patches the DB, and triggers a live-site refresh.

## Usage

```
/qa-images
```

Run once daily. Safe to re-run — all lookups are idempotent.

---

## Step 1 — Identify broken and missing images

Get the Railway production `DIRECT_URL`:

```bash
DB=$(railway variables --json 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('DIRECT_URL',''))")
```

Then query for three categories of broken images:

```bash
DATABASE_URL="$DB" DIRECT_URL="$DB" node -e "
const {PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
const isFake=(u)=>u && (u.includes('11223344') || u.includes('placeholder'));
Promise.all([
  p.artist.findMany({where:{imageUrl:null},select:{id:true,stageName:true,slug:true,type:true}}),
  p.album.findMany({where:{coverArt:null},select:{id:true,title:true,slug:true,artist:{select:{stageName:true}}}}),
  p.song.findMany({select:{id:true,title:true,slug:true,coverArt:true,album:{select:{id:true,title:true,slug:true,coverArt:true,artist:{select:{stageName:true}}}}}}),
]).then(([artists,albums,songs])=>{
  console.log('=== ARTISTS: imageUrl IS NULL ===');
  artists.forEach(a=>console.log(a.slug,'|',a.stageName,'|',a.type));
  console.log('\n=== ALBUMS: coverArt IS NULL ===');
  albums.forEach(a=>console.log(a.slug,'|',a.title,'|',a.artist.stageName));
  console.log('\n=== SONGS+ALBUMS: fake/broken URLs ===');
  songs.filter(s=>isFake(s.coverArt)||isFake(s.album?.coverArt)||(s.albumId && !s.coverArt && !s.album?.coverArt))
    .forEach(s=>console.log(s.slug,'|',s.title,'|',s.album?.artist?.stageName,'| songImg:',s.coverArt?'set':'null','albumImg:',s.album?.coverArt?'set':'null'));
}).finally(()=>p.\$disconnect());
"
```

Collect all slugs. Log count for each category:
- `ARTISTS_MISSING` — slugs with null imageUrl
- `ALBUMS_MISSING` — slugs with null coverArt
- `BROKEN_URLS` — slugs with fake/404 art

---

## Step 2 — Resolve images

### 2a. Wikipedia lookup (artists)

For each artist slug in `ARTISTS_MISSING`, check if it appears in `ARTIST_WIKI` in `scripts/fetch-images.ts`:

- **If it has a mapping** → the title is wrong. Search Wikipedia with alternate titles:
  - Try the artist's full Korean name (e.g. "Park Ji-min" for Jimin)
  - Try `"<Stage Name> (singer)"` or `"<Stage Name> (rapper)"`
  - Use WebSearch: `<artist name> wikipedia site:en.wikipedia.org` to find the correct page title

- **If it has no mapping** → add one. Common patterns:
  - K-pop groups: `"<GroupName> (South Korean band)"` or `"<GroupName> (group)"`
  - Solo artists: `"<Name> (singer)"` or look up their real name on Wikipedia
  - Western producers: their standard Wikipedia name (e.g. "Pharrell Williams", "Diplo")

Verify any new title works:
```bash
curl -s "https://en.wikipedia.org/w/api.php?action=query&titles=TITLE&prop=pageimages&format=json&pithumbsize=600&redirects=1" | python3 -c "import sys,json; d=json.load(sys.stdin); p=list(d['query']['pages'].values())[0]; print(p.get('thumbnail',{}).get('source','NO IMAGE'))"
```

### 2b. iTunes lookup (albums)

For each album slug in `ALBUMS_MISSING` or `BROKEN_URLS`, check `ALBUM_ITUNES` in `scripts/fetch-images.ts`:

- **If no mapping** → add one with the format `"ARTIST ALBUM_TITLE"` (e.g. `"Doja Cat Hot Pink"`)
- **Test it first:**
```bash
curl -s "https://itunes.apple.com/search?term=ARTIST+ALBUM&media=music&entity=album&limit=1" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('results',[]); art=r[0].get('artworkUrl100','NO RESULT') if r else 'NO RESULT'; print(art.replace('100x100bb','600x600bb'))"
```

- **If iTunes returns nothing** → try Cover Art Archive:
```bash
curl -s "https://coverartarchive.org/release-group/MBID/front" -L -o /dev/null -w "%{url_effective}" 2>/dev/null
```
  Find the MBID via: `https://musicbrainz.org/search?query=ARTIST+ALBUM&type=release-group`

### 2c. Direct DB patch for confirmed URLs

Once a valid URL is confirmed (HTTP 200 verified), patch it:

```bash
DATABASE_URL="$DB" DIRECT_URL="$DB" node -e "
const {PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
async function main() {
  // Artist
  await p.artist.updateMany({where:{slug:'SLUG'},data:{imageUrl:'URL'}});
  // Album + propagate to songs
  const album = await p.album.findFirst({where:{slug:'SLUG'}});
  if (album) {
    await p.album.update({where:{id:album.id},data:{coverArt:'URL'}});
    await p.song.updateMany({where:{albumId:album.id},data:{coverArt:'URL'}});
  }
}
main().catch(console.error).finally(()=>p.\$disconnect());
"
```

---

## Step 3 — Update scripts/fetch-images.ts

For every fix applied, update the corresponding mapping in `scripts/fetch-images.ts` so the correction persists on future runs:

- **Wrong Wikipedia title** → fix the value in `ARTIST_WIKI`
- **Missing artist** → add a new entry to `ARTIST_WIKI`
- **Missing album** → add a new entry to `ALBUM_ITUNES`

Commit the changes:

```bash
git add scripts/fetch-images.ts
git commit -m "fix: update image mappings — <brief description of what changed>"
git push origin staging
```

---

## Step 4 — Run the full fetch script to verify

```bash
DATABASE_URL="$DB" DIRECT_URL="$DB" npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/fetch-images.ts 2>&1
```

Confirm:
- All previously-broken artists now show `✓` (not `no image`)
- Updated count increased vs. previous run
- No new `no image` entries appeared

---

## Step 5 — Trigger live-site refresh

```bash
curl -s -X POST https://kpop-lyrics-production.up.railway.app/api/image-refresh
```

Expected response: `{"ok":true,"updated":N,"skipped":N}`

---

## Step 6 — Report

Summarise the sweep:

```
QA Image Sweep — YYYY-MM-DD
─────────────────────────────
Artists fixed:   N  (slugs: ...)
Albums fixed:    N  (slugs: ...)
Still missing:   N  (slugs: ...) — reason: no Wikipedia page / no iTunes result
fetch-images.ts: N new/updated mappings
Live refresh:    ✓ updated=N skipped=N
```

If anything is **still missing after the sweep**, note the slug and reason so it can be tracked across runs. Add a `# KNOWN MISSING` section at the bottom of `scripts/fetch-images.ts` as a comment block listing unresolvable slugs and why.

---

## Known unresolvable as of 2026-05-25

The following have no usable Wikipedia page image and no iTunes result. Monitor periodically — Wikipedia coverage improves over time.

| Slug | Artist | Reason |
|------|--------|--------|
| `mingyu-svt` | Mingyu (SEVENTEEN) | Wikipedia page exists but no thumbnail |
| `jeonghan-svt` | Jeonghan | No Wikipedia page |
| `joshua-svt` | Joshua | No Wikipedia page |
| `jun-svt` | Jun | No Wikipedia page |
| `wonwoo-svt` | Wonwoo | No Wikipedia page |
| `the8-svt` | The 8 | No Wikipedia page |
| `dokyeom-svt` | DK | No Wikipedia page |
| `seungkwan-svt` | Seungkwan | No Wikipedia page |
| `vernon-svt` | Vernon | No Wikipedia page |
| `dino-svt` | Dino | No Wikipedia page |
| `teddy-park` | Teddy Park | No image on Wikipedia page |
| `danny-chung` | Danny Chung | No Wikipedia page |
| `ryan-tedder` | Ryan Tedder | Check "Ryan Tedder" on next run |
| `maxx-song` | Maxx Song | No Wikipedia page |
| `250-producer` | 250 (Producer) | No Wikipedia page |
| `slushii` | Slushii | No Wikipedia page |
| `tobias-jesso-jr` | Tobias Jesso Jr. | Check "Tobias Jesso Jr." on next run |
| `nile-rodgers` | Nile Rodgers | Check "Nile Rodgers" on next run |
