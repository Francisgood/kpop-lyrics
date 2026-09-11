import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { LangToggle } from "@/components/LangProvider";
import ArcadeCTA from "@/components/ArcadeCTA";
import EventsBrowser, { type EventRow } from "@/components/EventsBrowser";
import { HOSTED_EVENTS, hostedEventUrl } from "@/lib/hosted-events";

export const dynamic = "force-dynamic";

const TITLE = "K-pop Fan Events & Meetups Near You — Aegyo Arena";
const DESC =
  "Find your people. A daily-updated feed of local K-pop fan meetups, random play dance nights, merch signings, K-fashion & K-beauty pop-ups and karaoke around the world — search by city, date and category.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: "/events" },
  openGraph: { title: TITLE, description: DESC, url: "https://www.aegyoarena.com/events", type: "website" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

type DbRow = Omit<EventRow, "startsAt" | "featured" | "cover"> & { startsAt: Date | null };

async function getEvents(): Promise<DbRow[]> {
  try {
    // Idempotently ensure the table exists so the page never 500s before the first scan.
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ScannedEvent" (
        "id" TEXT PRIMARY KEY, "title" TEXT NOT NULL, "category" TEXT NOT NULL,
        "city" TEXT, "citySlug" TEXT, "country" TEXT, "venue" TEXT, "startsAt" TIMESTAMP,
        "dateText" TEXT, "description" TEXT, "source" TEXT, "sourceUrl" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'live', "createdAt" TIMESTAMP NOT NULL DEFAULT now())`);
    // Spanish columns are added additively (the migration may lag); safe + idempotent.
    await prisma.$executeRawUnsafe(`ALTER TABLE "ScannedEvent" ADD COLUMN IF NOT EXISTS "titleEs" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "ScannedEvent" ADD COLUMN IF NOT EXISTS "descriptionEs" TEXT`);
    return await prisma.$queryRawUnsafe<DbRow[]>(
      `SELECT "id","title","titleEs","category","city","citySlug","country","venue","startsAt","dateText","description","descriptionEs","source","sourceUrl"
       FROM "ScannedEvent"
       WHERE "status" = 'live' AND ("startsAt" IS NULL OR "startsAt" >= now() - interval '1 day')
       ORDER BY ("startsAt" IS NULL), "startsAt" ASC, "createdAt" DESC
       LIMIT 200`
    );
  } catch {
    return [];
  }
}

// Ticketmaster-style browse page: brand search band → highlights mosaic → city rail
// → a dated "happening soon" list → per-category rails. The feed is the ScannedEvent
// table; our own hosted meetups (lib/hosted-events) are merged in on top, flagged
// `featured`, and matched to their DB row by sourceUrl so they never double up.
export default async function EventsPage() {
  const db = await getEvents();

  const hostedByUrl = new Map(HOSTED_EVENTS.map((h) => [hostedEventUrl(h), h]));
  const rows: EventRow[] = db.map((r) => {
    const h = hostedByUrl.get(r.sourceUrl);
    return {
      ...r,
      startsAt: r.startsAt ? new Date(r.startsAt).toISOString() : null,
      featured: !!h,
      cover: h?.cover ?? null,
    };
  });

  // Upcoming hosted events that haven't been ingested yet still belong on the page.
  const seen = new Set(rows.map((r) => r.sourceUrl));
  for (const h of HOSTED_EVENTS) {
    const url = hostedEventUrl(h);
    if (seen.has(url)) continue;
    if (new Date(h.endsAt).getTime() < Date.now() - 86400000) continue;
    rows.push({
      id: `hosted-${h.slug}`, title: h.title, titleEs: h.titleEs, category: h.category,
      city: h.city, citySlug: h.citySlug, country: h.country, venue: h.venue,
      startsAt: h.startsAt, dateText: null, description: h.summary, descriptionEs: h.summaryEs,
      source: "Aegyo Arena", sourceUrl: url, featured: true, cover: h.cover,
    });
  }

  rows.sort((a, b) => {
    const av = a.startsAt ? Date.parse(a.startsAt) : Number.MAX_SAFE_INTEGER;
    const bv = b.startsAt ? Date.parse(b.startsAt) : Number.MAX_SAFE_INTEGER;
    return av - bv;
  });

  return (
    <EventsBrowser
      events={rows}
      topBar={
        <div key="events-topbar" style={{ maxWidth: 1220, margin: "0 auto", padding: "18px 24px 0" }}>
          <LangToggle align="flex-start" marginBottom={16} />
        </div>
      }
      cta={<ArcadeCTA key="events-cta" margin="0" />}
    />
  );
}
