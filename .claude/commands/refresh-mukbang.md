Refresh the Mukbang Corner section on song pages with new K-pop eating/mukbang video content.

## What this updates

`components/MukbangSection.tsx` — the `MUKBANG_CLIPS` array. This is hardcoded static data (not DB-driven). Each entry has:
- `id` — unique string key
- `artistSlug` — must match Artist.slug in DB
- `artistName` — display name
- `title` — clip title shown on card
- `description` — 1-2 sentence blurb (tone: fun, stan-voice)
- `foods` — array of 2-3 food items shown as tags
- `ytSearch` — YouTube search URL (use `https://www.youtube.com/results?search_query=...`)
- `artistImg` — Wikipedia Commons image URL for the thumbnail
- `color` — hex accent color for the badge
- `badge` — short all-caps label (e.g. "ONCE TESTED", "BLINK CONTENT")

## Steps

1. Read the current clips in `components/MukbangSection.tsx` to see what's already there and avoid duplicates.

2. Come up with 2–4 new clip entries using artists that are currently trending or recently active. Good sources of ideas:
   - Artists who had recent comebacks or tours (check `ArtistNews` table for recents)
   - Groups with active YouTube channels known for eating content: aespa, SEVENTEEN, NewJeans, LE SSERAFIM, ENHYPEN, TXT, ATEEZ, (G)I-DLE, IVE, BABYMONSTER
   - Common mukbang formats: convenience store runs, late-night ramen, foreign food reactions, birthday party eating, post-concert feast

3. For each new clip, pick a real Wikipedia Commons image URL from the artist's existing `imageUrl` in the DB:
   ```
   DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
   node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.artist.findMany({where:{type:{in:['GROUP','SOLOIST']}},select:{slug:true,stageName:true,imageUrl:true}}).then(a=>a.forEach(x=>console.log(x.slug,x.imageUrl))).finally(()=>p.\$disconnect())"
   ```

4. Edit `components/MukbangSection.tsx` — append the new entries to `MUKBANG_CLIPS`. Keep total count between 6–12 clips (remove the oldest/stalest if over 12).

5. Deploy:
   ```
   cd /Users/francis/kpop-lyrics && railway up --detach
   ```

## Tone guide

Write descriptions in enthusiastic fan voice — not corporate. Examples:
- Good: "Hoshi orders for everyone and somehow ends up with 14 dishes. No one complains."
- Bad: "This video features SEVENTEEN members eating Korean food together."

Badge ideas by group: use fandom name + food adjective (BLINK CONTENT, ONCE TESTED, STAY APPROVED, DIVE CONTENT, FEARNOT EATS, ATINY KITCHEN, CARAT TABLE, NSWER HOUR, MENT SNACK, etc.)

## Frequency

Run weekly or whenever a major comeback/tour event happens (idols always do eating content around comebacks).
