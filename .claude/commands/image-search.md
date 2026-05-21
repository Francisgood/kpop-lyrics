Run the image search for Aegyo Annotate. This fetches real artist and album photos from Wikipedia and updates the database.

Steps:
1. Run `cd /Users/francis/kpop-lyrics && npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/fetch-images.ts` and capture the output.
2. Report how many artists and albums were updated vs skipped.
3. If any artist in the DB has no wiki mapping in ARTIST_WIKI (scripts/fetch-images.ts), suggest adding one based on their slug and stageName.
4. If significant new images were found, commit the changes: `git add -A && git commit -m "chore: refresh artist/album images from Wikipedia"` then `railway up --detach` to redeploy.

The script updates `imageUrl` on Artist records and `coverArt` on Album + Song records in the local SQLite DB. On Railway, the DB resets each deploy and gets reseeded — so run this AFTER deploying, or trigger via `POST /api/image-refresh` on the live URL.
