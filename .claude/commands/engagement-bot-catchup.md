# Engagement Bot Catchup

Seeds realistic dummy user accounts with annotations, edits, comments, and
Daebak Points for the 30 leaderboard contributors. Run this occasionally until
real users start generating engagement organically.

## Quick run

```bash
DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
DIRECT_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-engagement-bot.ts
```

**Safe to re-run** — skips users that already exist (checks by email).

## What it creates

For each of the 30 Daebak Leaderboard contributors:

| Record type | Table | Detail |
|------------|-------|--------|
| User account | `User` | email `{username}@aegyo.fan`, password `AegyoBot2024!`, `emailVerified: true` |
| Annotations | `LyricAnnotation` | Distributed across the user's focus artist songs |
| Edits | `SuggestedEdit` | `status: "approved"` on song lyrics/bio fields |
| Comments | `Comment` | 70% on song pages, 30% on artist pages |
| Points | `PointEvent` | signup + annotation + edit_approved + comment + annotation_upvoted events totalling exact leaderboard score |

## Contributor roster (30 users)

### Mexico City 🇲🇽

| Username | Annotations | Edits | Comments | Points | Focus |
|----------|-------------|-------|----------|--------|-------|
| SofiaRM_CDMX | 42 | 31 | 210 | 8,450 | RM / BTS |
| ValeriaBangtanMX | 36 | 27 | 188 | 7,180 | BTS |
| Fernanda_V_Stan | 29 | 22 | 167 | 6,340 | V / Kiiikiii |
| KiiikiiFanMX_Jorge | 31 | 18 | 142 | 5,920 | Kiiikiii |
| JiminCDMX_Lupita | 24 | 20 | 131 | 5,110 | Jimin / BTS |
| LisaMexico_Daniela | 20 | 19 | 118 | 4,680 | Lisa / BLACKPINK |
| JungkookARMY_Ana | 18 | 14 | 109 | 3,970 | Jungkook / BTS |
| BlackpinkMX_Carolina | 16 | 12 | 97 | 3,450 | BLACKPINK |
| IndieMX_Carlos | 13 | 11 | 85 | 2,890 | Kiiikiii / TWICE |
| SugaCDMX_Yolanda | 10 | 9 | 74 | 2,310 | Suga / BTS |

### New York 🇺🇸

| Username | Annotations | Edits | Comments | Points | Focus |
|----------|-------------|-------|----------|--------|-------|
| NYCArmy_Jasmine | 9 | 8 | 68 | 2,070 | j-hope / BTS |
| JennieNYC_Mia | 8 | 8 | 62 | 1,920 | Jennie / BLACKPINK |
| SugaBarclays_Tyler | 8 | 7 | 57 | 1,760 | Suga / BTS |
| KiiikiiBrooklyn_Sam | 7 | 7 | 53 | 1,640 | Kiiikiii |
| RMsBookClub_Priya | 6 | 7 | 49 | 1,510 | RM / BTS |
| PinkVenomNY_Zoe | 6 | 6 | 44 | 1,390 | BLACKPINK |
| JhopeHarlem_Marcus | 5 | 6 | 40 | 1,240 | j-hope / BTS |
| EpikHighNYC_DeShawn | 5 | 5 | 36 | 1,080 | BTS / NewJeans |
| IndieCityKpop_Lily | 4 | 4 | 30 | 870 | Kiiikiii / NewJeans |
| K2NYC_Alexia | 3 | 4 | 28 | 760 | BTS / NewJeans |

### Paris 🇫🇷

| Username | Annotations | Edits | Comments | Points | Focus |
|----------|-------------|-------|----------|--------|-------|
| ARMYParis_Camille | 4 | 4 | 32 | 980 | BTS |
| RoséParis_Sophie | 4 | 3 | 28 | 870 | Rosé / BLACKPINK |
| KiiikiiFrance_Hugo | 3 | 4 | 25 | 780 | Kiiikiii |
| BangtanParis_Théo | 3 | 3 | 22 | 680 | Jungkook / BTS |
| JinFanParis_Marie | 3 | 3 | 19 | 610 | Jin / BTS |
| SeoulVibesParis_Emma | 2 | 3 | 18 | 540 | IU |
| HyukohParis_Inès | 2 | 3 | 15 | 470 | BTS / aespa |
| SoyeonFan_Maxime | 2 | 2 | 14 | 410 | (G)I-DLE |
| CrushParis_Léa | 2 | 2 | 11 | 360 | BTS / IU |
| NewJeansParis_Florian | 1 | 2 | 10 | 310 | NewJeans |

## Point calculation

Points are seeded exactly to match leaderboard totals:

```
total_points = 100 (signup)
             + annotations × 30
             + edits × 50
             + comments × 10
             + upvote_events × 5   ← filled in to reach exact total
```

## Content details

- **Annotations**: `LyricAnnotation.word` taken from song title words; `note` is language-appropriate K-pop commentary (Spanish/English/French based on city)
- **Edits**: `SuggestedEdit` on song `lyricsRomanized`, `lyricsEn`, `bio`, or `lyricsKo` fields with `status: "approved"`
- **Comments**: Language-appropriate K-pop commentary; 70% on song pages, 30% on artist pages
- **Bot password**: `AegyoBot2024!` (sha256 + `aegyo-salt`)

## Content language by city

| City | Language | Tone |
|------|----------|------|
| Mexico City | Spanish (mostly) | ARMY CDMX culture, fancafés, streaming parties |
| New York | English | NYC venues (Barclays Center), Brooklyn stans, Koreatown |
| Paris | French (mostly) | La Défense, K-indie Paris scene, Fashion Week |

## Artist song pools by focus

The script queries songs from the focus artist's albums at runtime. Fallback to BTS + BLACKPINK songs if the artist has no seeded songs.

| Focus | DB artist slug(s) |
|-------|------------------|
| RM / BTS | `rm`, `bts` |
| V / Kiiikiii | `kiiikiii`, `v` |
| Lisa / BLACKPINK | `lisa`, `blackpink` |
| Jimin | `jimin`, `bts` |
| Jungkook | `jungkook`, `bts` |
| Suga | `suga`, `bts` |
| j-hope | `j-hope`, `bts` |
| Jennie | `jennie`, `blackpink` |
| Rosé | `rose`, `blackpink` |
| Jin | `jin`, `bts` |
| IU | `iu` |
| (G)I-DLE | `g-i-dle` |
| NewJeans | `newjeans` |
| Kiiikiii | `kiiikiii` |

## When to run

- **Initial seed**: once, to populate the leaderboard with realistic engagement data
- **Catchup runs**: occasionally as new songs/albums are seeded — the bot will add fresh annotations to new content (users are skipped if already existing; to re-run a user, delete them from the DB first)

## Checking results

```bash
# Verify user count and point totals
DATABASE_URL="..." npx ts-node --compiler-options '{"module":"CommonJS"}' -e "
import { prisma } from './lib/prisma';
async function main() {
  const users = await prisma.user.count({ where: { email: { endsWith: '@aegyo.fan' } } });
  const anns  = await prisma.lyricAnnotation.count({ where: { user: { email: { endsWith: '@aegyo.fan' } } } });
  const edits = await prisma.suggestedEdit.count({ where: { user: { email: { endsWith: '@aegyo.fan' } } } });
  const cmts  = await prisma.comment.count({ where: { user: { email: { endsWith: '@aegyo.fan' } } } });
  const pts   = await prisma.pointEvent.aggregate({ where: { user: { email: { endsWith: '@aegyo.fan' } } }, _sum: { points: true } });
  console.log({ users, anns, edits, cmts, totalPoints: pts._sum.points });
}
main().finally(() => prisma.\$disconnect());
"
```

## Resetting all bot data

```bash
# Delete all @aegyo.fan users and their cascaded data
DATABASE_URL="..." npx ts-node --compiler-options '{"module":"CommonJS"}' -e "
import { prisma } from './lib/prisma';
prisma.user.deleteMany({ where: { email: { endsWith: '@aegyo.fan' } } })
  .then(r => console.log('Deleted', r.count, 'users'))
  .finally(() => prisma.\$disconnect());
"
```
