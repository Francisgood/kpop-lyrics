# Collaborator / Producer Discography Expansion

Cross-reference a producer or collaborator's public discography against the Aegyo Arena DB, then add:
1. Their own albums/EPs/singles (if they're a performing artist like Slushii)
2. `SongCredit` rows linking them to K-pop songs they produced or wrote

## What this updates

- `Artist` table — create if the collaborator/artist doesn't exist yet
- `Album` + `Song` tables — the collaborator's own releases (for artists with standalone output)
- `SongCredit` table — links `(songId, artistId, role)` so the producer appears on song/artist pages

### SongCredit roles used
| role | meaning |
|------|---------|
| `songwriter` | wrote lyrics and/or melody |
| `producer` | beat/production credit |
| `lyricist` | lyrics only |
| `remix` | official remix (remixer credited on the primary artist's release) |
| `featured` | guest vocal/rap appearance |
| `main` | primary credited artist on the song |

## Steps

### 1 — Check what's already in the DB

```bash
DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
node -e "
const {PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
p.artist.findFirst({where:{slug:'SLUG_HERE'},include:{albums:{include:{songs:true}}}})
  .then(a=>{
    if(!a){console.log('NOT FOUND'); return;}
    console.log(a.stageName, a.type);
    console.log('Albums:',a.albums.length);
    a.albums.forEach(al=>console.log(' -',al.title,'('+al.releaseYear+',',al.songs.length,'tracks)'));
  }).finally(()=>p.\$disconnect())
"
```

Check existing credits:
```bash
DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
node -e "
const {PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
p.songCredit.findMany({
  where:{artist:{slug:'SLUG_HERE'}},
  include:{song:{select:{title:true,releaseYear:true,album:{select:{title:true,artist:{select:{stageName:true}}}}}}}
}).then(credits=>credits.forEach(c=>
  console.log(c.role,'|',c.song.title,'|',c.song.album?.artist?.stageName,'('+c.song.releaseYear+')')
)).finally(()=>p.\$disconnect())
"
```

### 2 — Research sources (in priority order)

For **producers/songwriters** (K-pop focus):
1. `genius.com/artists/{Name}` — full credited song list with role metadata
2. `rateyourmusic.com/artist/{name}/credits/` — structured credit database
3. Wikipedia production discography page (search: `"{Name} production discography" site:wikipedia.org`)
4. `readdork.com/credits/{name}/{artist}` — artist-specific cross-reference

For **performing artists** (own discography):
1. `discogs.com/artist/{id}` — master releases, tracklists, cover art
2. `en.wikipedia.org/wiki/{Name}_discography`
3. `rateyourmusic.com/artist/{name}` — album ratings + tracklists

For **Spotify links**: `open.spotify.com/artist/{id}` → check "Discography" tab

### 3 — Create the artist if new

```ts
const artist = await prisma.artist.upsert({
  where: { slug: "their-slug" },
  update: {},
  create: {
    slug:      "their-slug",
    type:      "SOLOIST", // or COLLAB for pure producers
    stageName: "Stage Name",
    realName:  "Real Name",
    debutYear: 2020,
    bio:       "...",
  },
});
```

Artist `type` guide:
- `SOLOIST` — releases music under their own name (Ariana Grande, Slushii, G-Dragon)
- `COLLAB` — primarily a behind-the-scenes producer/writer (Teddy Park, Maxx Song)
- `GROUP` — K-pop group
- `MEMBER` — member of a K-pop group

### 4 — Seed script template

```ts
// prisma/seed-collab-SLUG.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function slugify(text: string): string {
  return text.toLowerCase().replace(/['']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function uniqueSlug(model: "album" | "song", base: string): Promise<string> {
  let slug = base; let n = 0;
  while (true) {
    const ex = model === "album"
      ? await prisma.album.findUnique({ where: { slug } })
      : await prisma.song.findUnique({ where: { slug } });
    if (!ex) return slug;
    n++; slug = `${base}-${n}`;
  }
}

async function addAlbum(artistId: string, artistSlug: string, title: string, type: string, year: number, tracks: string[]) {
  const exists = await prisma.album.findFirst({ where: { artistId, title: { equals: title, mode: "insensitive" } } });
  if (exists) { console.log("Skip:", title); return; }
  const slug = await uniqueSlug("album", slugify(`${artistSlug}-${title}`));
  const album = await prisma.album.create({ data: { slug, title, artistId, releaseYear: year, type, coverArt: null } });
  for (const track of tracks) {
    const songSlug = await uniqueSlug("song", slugify(`${slug}-${track}`));
    const song = await prisma.song.create({ data: { slug: songSlug, title: track, albumId: album.id, releaseYear: year } });
    await prisma.songCredit.create({ data: { songId: song.id, artistId, role: "main" } }).catch(() => {});
  }
  console.log("✓ Album:", title, `(${tracks.length} tracks)`);
}

async function addCredit(collaboratorId: string, songTitle: string, mainArtistSlug: string, role: string) {
  const song = await prisma.song.findFirst({
    where: { title: { equals: songTitle, mode: "insensitive" }, album: { artist: { slug: mainArtistSlug } } }
  });
  if (!song) { console.warn("Not found:", songTitle, "by", mainArtistSlug); return; }
  const exists = await prisma.songCredit.findFirst({ where: { songId: song.id, artistId: collaboratorId } });
  if (!exists) {
    await prisma.songCredit.create({ data: { songId: song.id, artistId: collaboratorId, role } });
    console.log(`✓ Credit [${role}]: "${songTitle}" → ${mainArtistSlug}`);
  }
}

async function main() {
  const artist = await prisma.artist.findUnique({ where: { slug: "their-slug" } });
  if (!artist) throw new Error("Artist not found");

  // Their own albums
  await addAlbum(artist.id, "their-slug", "Album Title", "Album", 2022, ["Track 1", "Track 2"]);

  // Credits on K-pop songs
  await addCredit(artist.id, "Song Title", "main-artist-slug", "songwriter");
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

Run it:
```bash
DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-collab-SLUG.ts
```

### 5 — Deploy (only needed if adding new albums/songs, not just credits)

```bash
railway up --detach
```

Credits (`SongCredit` only) show up immediately via `force-dynamic` — no deploy needed.
Albums/songs require a deploy to warm the Next.js cache on the artist page.

## Current collaborator profiles in DB

| Slug | Stage Name | Type | Albums in DB |
|------|-----------|------|-------------|
| `slushii` | Slushii | COLLAB | Brain Freeze, Out of Light, Dream, Dream II, Dream III, E.L.E., A Slushii Summer |
| `teddy-park` | Teddy Park | COLLAB | 0 (pure songwriter — credits only) |
| `danny-chung` | Danny Chung (24) | COLLAB | 0 (pure songwriter — credits only) |
| `maxx-song` | Maxx Song | COLLAB | 0 (pure songwriter — credits only) |
| `ariana-grande` | Ariana Grande | SOLOIST | Yours Truly, My Everything, Dangerous Woman, Thank U, Next, Positions, Side To Side (Slushii Remix) |

## Ariana Grande — Slushii connection

- **Song**: "Side To Side (Slushii Remix)" (2017) — Ariana Grande × Nicki Minaj × Slushii
- In DB: single album under `ariana-grande`, with Slushii credited as `remix`
- Ariana Grande slug: `ariana-grande`, artist page: `/artists/ariana-grande`

## Adding more collabs / new remixed artist

Pattern for any new Western artist who appears on a K-pop remix:
1. Create the artist with `type: "SOLOIST"` and a short bio
2. Create a `"Song Title (Remix)"` Single album under them
3. `addCredit(producerId, "Song Title (Remix)", "artist-slug", "remix")`
4. If the original K-pop artist should also be credited on the remix: `addCredit(kpopArtistId, "Song Title (Remix)", "western-artist-slug", "featured")`

## Frequency

Run when:
- A major K-pop producer releases new songs — check their Genius credits page
- A Western artist collaborates with or remixes a K-pop group
- A new artist is added to the DB whose collaboration history hasn't been backfilled
