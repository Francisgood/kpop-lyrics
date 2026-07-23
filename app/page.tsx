import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import NewsFeed, { type NewsRow } from "@/components/NewsFeed";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aegyo Arena — K-pop News, Gossip & Rumors",
  description: "The K-pop feed: latest news, gossip, rumors, comebacks and charts — rewritten for fans, updated daily. Plus lyrics, translations, slang and artist deep-dives.",
  openGraph: {
    title: "Aegyo Arena — K-pop News, Gossip & Rumors",
    description: "The K-pop feed: latest news, gossip, rumors, comebacks and charts — updated daily.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const PAGE = 20;

async function getFirstPage(): Promise<NewsRow[]> {
  try {
    // Ensure the table exists so the homepage never 500s before the first publish.
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "NewsPost" (
        "id" TEXT PRIMARY KEY, "headline" TEXT NOT NULL, "subheadline" TEXT, "body" TEXT,
        "esHeadline" TEXT, "esSubheadline" TEXT,
        "imageUrl" TEXT, "imageCredit" TEXT, "category" TEXT, "tag" TEXT, "artistSlug" TEXT, "artistName" TEXT,
        "sourceName" TEXT, "sourceUrl" TEXT NOT NULL, "readMins" INTEGER NOT NULL DEFAULT 2,
        "publishedAt" TIMESTAMP, "status" TEXT NOT NULL DEFAULT 'live', "createdAt" TIMESTAMP NOT NULL DEFAULT now())`);
    // Older tables may predate the ES columns — add them defensively so the SELECT never fails.
    await prisma.$executeRawUnsafe(`ALTER TABLE "NewsPost" ADD COLUMN IF NOT EXISTS "esHeadline" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "NewsPost" ADD COLUMN IF NOT EXISTS "esSubheadline" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "NewsPost" ADD COLUMN IF NOT EXISTS "slug" TEXT`);
    const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT "id","slug","headline","subheadline","body","esHeadline","esSubheadline","imageUrl","imageCredit","category","tag",
              "artistSlug","artistName","sourceName","sourceUrl","readMins","publishedAt"
       FROM "NewsPost" WHERE "status" = 'live'
       ORDER BY "publishedAt" DESC NULLS LAST, "createdAt" DESC LIMIT ${PAGE}`
    );
    return rows.map((r) => ({
      id: String(r.id), slug: (r.slug as string) ?? null, headline: String(r.headline),
      subheadline: (r.subheadline as string) ?? null, body: (r.body as string) ?? null,
      esHeadline: (r.esHeadline as string) ?? null, esSubheadline: (r.esSubheadline as string) ?? null,
      imageUrl: (r.imageUrl as string) ?? null, imageCredit: (r.imageCredit as string) ?? null,
      category: (r.category as string) ?? null, tag: (r.tag as string) ?? null,
      artistSlug: (r.artistSlug as string) ?? null, artistName: (r.artistName as string) ?? null,
      sourceName: (r.sourceName as string) ?? null, sourceUrl: String(r.sourceUrl),
      readMins: Number(r.readMins ?? 2),
      publishedAt: r.publishedAt ? new Date(r.publishedAt as string).toISOString() : null,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const first = await getFirstPage();

  // The header, language toggle (EN/ES) and feed all live in the NewsFeed client
  // component so one language state drives the whole homepage.
  return <NewsFeed initial={first} initialOffset={first.length} initialHasMore={first.length === PAGE} />;
}
