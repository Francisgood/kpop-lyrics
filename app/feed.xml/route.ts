import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SITE = "https://www.aegyoarena.com";

function esc(s: string | null | undefined): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

type Row = {
  headline: string; subheadline: string | null; body: string | null; category: string | null;
  sourceName: string | null; sourceUrl: string; imageUrl: string | null; publishedAt: Date | null;
};

// RSS 2.0 feed of the homepage news posts (each links back to the original source).
export async function GET() {
  let rows: Row[] = [];
  try {
    rows = await prisma.$queryRawUnsafe<Row[]>(
      `SELECT "headline","subheadline","body","category","sourceName","sourceUrl","imageUrl","publishedAt"
       FROM "NewsPost" WHERE "status" = 'live'
       ORDER BY "publishedAt" DESC NULLS LAST, "createdAt" DESC LIMIT 50`
    );
  } catch { /* table not created yet → empty feed */ }

  const items = rows.map((r) => {
    const desc = [r.subheadline, r.body].filter(Boolean).join(" ");
    const img = r.imageUrl ? `<enclosure url="${esc(r.imageUrl)}" type="image/jpeg" />` : "";
    const pub = r.publishedAt ? new Date(r.publishedAt).toUTCString() : new Date().toUTCString();
    const src = r.sourceName ? ` (via ${esc(r.sourceName)})` : "";
    return `    <item>
      <title>${esc(r.headline)}</title>
      <link>${esc(r.sourceUrl)}</link>
      <guid isPermaLink="true">${esc(r.sourceUrl)}</guid>
      ${r.category ? `<category>${esc(r.category)}</category>` : ""}
      <description>${esc(desc)}${esc(src)}</description>
      <pubDate>${pub}</pubDate>
      ${img}
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Aegyo Arena — K-pop News, Gossip &amp; Rumors</title>
    <link>${SITE}</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>The K-pop feed: latest news, gossip, rumors, comebacks and charts — original summaries linking to each source.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=900" } });
}
