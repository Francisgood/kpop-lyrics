-- Spanish lyric translations, shown when the site-wide EN/ES toggle is set to ES.
-- IF NOT EXISTS keeps the deploy safe if the column was already added out-of-band.
ALTER TABLE "Song" ADD COLUMN IF NOT EXISTS "lyricsEs" TEXT;
