-- Spanish content columns, shown when the site-wide EN/ES toggle is set to ES.
-- IF NOT EXISTS keeps the deploy safe if a column was added out-of-band first.
ALTER TABLE "Artist" ADD COLUMN IF NOT EXISTS "bioEs" TEXT;
ALTER TABLE "TermDefinition" ADD COLUMN IF NOT EXISTS "bodyEs" TEXT;
ALTER TABLE "TermDefinition" ADD COLUMN IF NOT EXISTS "exampleEs" TEXT;
