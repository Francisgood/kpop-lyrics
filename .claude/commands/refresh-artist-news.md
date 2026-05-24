Add fresh ArtistNews records to the DB for K-pop artists. These appear in the "Recent News" section on song pages and the "News & Gossip" section on artist pages.

## What this updates

`ArtistNews` table in PostgreSQL. Each record has:
- `artistId` — FK to Artist.id (look up by slug)
- `headline` — punchy news headline (under 120 chars)
- `body` — 2–4 sentence body with context and fan impact (150–300 chars)
- `category` — one of: `milestone`, `comeback`, `award`, `collab`, `drama`, `member`, `legal`, `label`
- `source` — publication name (Billboard, Soompi, Weverse, etc.)
- `sourceUrl` — optional URL
- `publishedAt` — ISO date string of when it happened

## Category badge colors (for reference)
- `milestone` → yellow
- `comeback` → black/yellow
- `award` → green
- `collab` → light blue
- `drama` → red
- `member` → gray
- `legal` → red
- `label` → dark navy

## Steps

1. Check what news already exists to avoid duplicates — get the 10 most recent headlines:
   ```
   DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
   node -e "
   const {PrismaClient}=require('@prisma/client');
   const p=new PrismaClient();
   p.artistNews.findMany({orderBy:{publishedAt:'desc'},take:10,include:{artist:{select:{stageName:true}}}})
     .then(n=>n.forEach(x=>console.log(x.publishedAt?.toISOString().slice(0,10), x.artist.stageName, '—', x.headline)))
     .finally(()=>p.\$disconnect())
   "
   ```

2. Research current K-pop news from these sources (check them in order):
   - Soompi (soompi.com) — most reliable for official announcements
   - Billboard K-pop (billboard.com/t/k-pop/) — for chart milestones and US coverage
   - Weverse Magazine — for label-official news
   - Allkpop (allkpop.com) — for fan events, drama, member news
   - Naver Entertainment (entertain.naver.com) — Korean-language original source

3. Write a seed script (or inline node command) to insert the new items. Template:
   ```ts
   // prisma/seed-news-refresh-YYYY-MM-DD.ts
   import { PrismaClient } from "@prisma/client";
   const prisma = new PrismaClient();
   async function main() {
     const items = [
       { slug: "bts", headline: "...", body: "...", category: "comeback", source: "Billboard", publishedAt: new Date("2026-05-22") },
       // ... more items
     ];
     for (const item of items) {
       const artist = await prisma.artist.findUnique({ where: { slug: item.slug } });
       if (!artist) { console.warn("Not found:", item.slug); continue; }
       const exists = await prisma.artistNews.findFirst({ where: { artistId: artist.id, headline: item.headline } });
       if (exists) { console.log("Skip:", item.headline); continue; }
       await prisma.artistNews.create({ data: { artistId: artist.id, headline: item.headline, body: item.body, category: item.category, source: item.source ?? null, publishedAt: item.publishedAt } });
       console.log("✓", artist.stageName, "—", item.headline);
     }
   }
   main().catch(console.error).finally(() => prisma.$disconnect());
   ```

4. Run it:
   ```
   DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-news-refresh-YYYY-MM-DD.ts
   ```

5. No deploy needed — the site is `force-dynamic` so the new news items appear immediately on the live DB.

## News writing guide

- **Headline**: Present tense, active voice. "BTS Announces World Tour Extension" not "BTS has announced..."
- **Body**: Who + what + fan impact. Include a concrete detail (number, quote, city, date). End with why fans care.
- **Aim for 5–10 new items per daily run**, spread across different artists and categories.
- **Do not repeat headlines** that already exist (the dedup check in step 1 covers this).
- **Avoid speculation** — only write about confirmed events.

## Good artist slugs to monitor daily

High-activity artists worth checking every run:
`bts`, `blackpink`, `twice`, `aespa`, `newjeans`, `seventeen`, `ive`, `stray-kids`, `txt`, `enhypen`, `le-sserafim`, `g-i-dle`, `ateez`, `nct-127`, `nct-dream`, `babymonster`, `riize`, `illit`

## Frequency

Run daily. News items older than 90 days can be left as-is (they naturally scroll off the top of the "Recent News" section since it's sorted by `publishedAt desc`).
