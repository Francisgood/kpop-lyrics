#!/usr/bin/env bash
# supabase-setup.sh
# Run this ONCE after creating your Supabase project.
# It creates the schema and seeds all 214 songs.
#
# Usage:
#   DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true" \
#   DIRECT_URL="postgresql://postgres:[pass]@db.[ref].supabase.co:5432/postgres" \
#   bash scripts/supabase-setup.sh

set -e

if [[ -z "$DATABASE_URL" || -z "$DIRECT_URL" ]]; then
  echo "ERROR: Set DATABASE_URL and DIRECT_URL before running."
  echo ""
  echo "Get both from Supabase → Project Settings → Database → Connection string"
  echo "  DATABASE_URL  = Transaction mode (port 6543, pgbouncer=true)"
  echo "  DIRECT_URL    = Direct connection (port 5432)"
  exit 1
fi

echo "1/3  Generating Prisma client..."
npx prisma generate

echo "2/3  Creating schema (migrate dev → creates migrations/ folder)..."
npx prisma migrate dev --name init

echo "3/3  Seeding 214 songs, 38 groups, 7 BTS solos, IU, NMIXX, APINK..."
npm run db:seed

echo ""
echo "✅  Supabase setup complete."
echo ""
echo "Next steps:"
echo "  1. Set DATABASE_URL and DIRECT_URL in Railway → Variables"
echo "  2. git push → Railway will run 'prisma migrate deploy + next build' (no re-seed)"
echo "  3. After deploy: curl -s -X POST https://your-app.railway.app/api/image-refresh"
echo "     (fetches Wikipedia images for all 90+ mapped artists — persists in Supabase)"
