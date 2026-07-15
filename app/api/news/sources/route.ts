import { NextResponse } from "next/server";
import { NEWS_SOURCES } from "@/lib/news-sources";

// Public: the list of publications the homepage news publisher pulls from.
// Lets anyone verify the feed spans 30+ publishers (not just one aggregator).
export function GET() {
  const byKind: Record<string, number> = {};
  for (const s of NEWS_SOURCES) byKind[s.kind] = (byKind[s.kind] ?? 0) + 1;
  return NextResponse.json(
    {
      publications: NEWS_SOURCES.length,
      byKind,
      note:
        "The news publisher reads these feeds hourly, keeps only stories about artists on /artists, rewrites each in the Aegyo Arena voice, and links back to the original source.",
      sources: NEWS_SOURCES.map((s) => ({ name: s.name, kind: s.kind, site: s.url, feed: s.feed ?? null })),
    },
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
}
