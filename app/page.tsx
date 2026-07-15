import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
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
        "imageUrl" TEXT, "imageCredit" TEXT, "category" TEXT, "tag" TEXT, "artistSlug" TEXT, "artistName" TEXT,
        "sourceName" TEXT, "sourceUrl" TEXT NOT NULL, "readMins" INTEGER NOT NULL DEFAULT 2,
        "publishedAt" TIMESTAMP, "status" TEXT NOT NULL DEFAULT 'live', "createdAt" TIMESTAMP NOT NULL DEFAULT now())`);
    const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT "id","headline","subheadline","body","imageUrl","imageCredit","category","tag",
              "artistSlug","artistName","sourceName","sourceUrl","readMins","publishedAt"
       FROM "NewsPost" WHERE "status" = 'live'
       ORDER BY "publishedAt" DESC NULLS LAST, "createdAt" DESC LIMIT ${PAGE}`
    );
    return rows.map((r) => ({
      id: String(r.id), headline: String(r.headline),
      subheadline: (r.subheadline as string) ?? null, body: (r.body as string) ?? null,
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

  return (
    <main style={{ paddingBottom: 72 }}>
      {/* Feed header (the site nav in the layout stays sticky above this) */}
      <section style={{ background: "linear-gradient(180deg, var(--sakura-light), var(--bg))", borderBottom: "1px solid var(--border)", padding: "40px 24px 34px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 12 }}>The Feed · Updated daily</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem, 7vw, 3.4rem)", fontWeight: 700, color: "var(--ink)", lineHeight: 1.05, margin: "0 0 12px" }}>
            K-pop news, gossip <em style={{ color: "var(--sakura)", fontStyle: "italic" }}>&amp; rumors.</em>
          </h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.02rem", lineHeight: 1.6, maxWidth: 560, margin: 0 }}>
            The whole scene in one endless scroll — comebacks, charts, scandals and scoops, rewritten for fans with a link to every source.{" "}
            <Link href="/artists" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>Explore the universe →</Link>
          </p>
        </div>
      </section>

      {/* Infinite-scroll feed */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px 0" }}>
        <NewsFeed initial={first} initialOffset={first.length} initialHasMore={first.length === PAGE} />
      </div>
    </main>
  );
}
