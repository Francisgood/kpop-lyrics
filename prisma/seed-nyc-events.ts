/**
 * seed-nyc-events.ts
 * Replaces placeholder NYC city events with real scraped data.
 * Sources: kpoptracker.net, popupgirlsnyc.substack.com, meetup.com/bts-army-friends
 * Run via: railway run npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-nyc-events.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const city = await prisma.city.findUnique({ where: { slug: "new-york" } });
  if (!city) {
    console.error("NYC city not found in DB — run main seed first.");
    process.exit(1);
  }

  // Wipe existing NYC events (placeholder data) and replace with real scraped events
  const deleted = await prisma.cityEvent.deleteMany({ where: { cityId: city.id } });
  console.log(`Deleted ${deleted.count} existing NYC events`);

  // ── Concerts (scraped from popupgirlsnyc.substack.com) ──────────────────────
  const concerts: Array<{
    title: string;
    venue: string;
    eventDate: string;
    ticketUrl?: string;
    type: string;
  }> = [
    {
      title: "YVES — TOUR 2026: THE AMERICAS",
      venue: "Palladium Times Square, 1515 Broadway",
      eventDate: "May 20, 2026",
      ticketUrl: "https://www.ticketmaster.com/event/00006464BA3AE26B",
      type: "concert",
    },
    {
      title: "The Rose — ROSETOPIA World Tour",
      venue: "Hulu Theater at MSG, 4 Pennsylvania Plaza",
      eventDate: "June 5, 2026",
      ticketUrl: "https://www.msg.com",
      type: "concert",
    },
    {
      title: "KATSEYE at Governors Ball",
      venue: "Flushing Meadows Corona Park, Queens",
      eventDate: "June 5, 2026",
      ticketUrl: "https://governorsballmusicfestival.com",
      type: "festival",
    },
    {
      title: "Stray Kids at Governors Ball",
      venue: "Flushing Meadows Corona Park, Queens",
      eventDate: "June 6, 2026",
      ticketUrl: "https://governorsballmusicfestival.com",
      type: "festival",
    },
    {
      title: "JENNIE at Governors Ball",
      venue: "Flushing Meadows Corona Park, Queens",
      eventDate: "June 7, 2026",
      ticketUrl: "https://governorsballmusicfestival.com",
      type: "festival",
    },
    {
      title: "BTS — World Cup Final Halftime Show",
      venue: "MetLife Stadium, East Rutherford NJ",
      eventDate: "July 19, 2026",
      ticketUrl: "https://www.ticketmaster.com",
      type: "concert",
    },
    {
      title: "IVE — WORLD TOUR 'SHOW WHAT I AM'",
      venue: "Prudential Center, 25 Lafayette St, Newark NJ",
      eventDate: "July 25, 2026",
      ticketUrl: "https://www.ticketmaster.com",
      type: "concert",
    },
    {
      title: "BTS — WORLD TOUR 'ARIRANG' Night 1",
      venue: "MetLife Stadium, East Rutherford NJ",
      eventDate: "Aug 1, 2026",
      ticketUrl: "https://www.metlifestadium.com",
      type: "concert",
    },
    {
      title: "BTS — WORLD TOUR 'ARIRANG' Night 2",
      venue: "MetLife Stadium, East Rutherford NJ",
      eventDate: "Aug 2, 2026",
      ticketUrl: "https://www.metlifestadium.com",
      type: "concert",
    },
    {
      title: "WayV — SummerStage",
      venue: "Central Park, Rumsey Playfield",
      eventDate: "Aug 2, 2026",
      ticketUrl: "https://cityparksfoundation.org",
      type: "concert",
    },
    {
      title: "MAMAMOO — 2026 World Tour",
      venue: "UBS Arena, 2400 Hempstead Turnpike, Elmont NY",
      eventDate: "Aug 12, 2026",
      ticketUrl: "https://www.ticketmaster.com",
      type: "concert",
    },
    {
      title: "KATSEYE — Citi Concert Series at TODAY",
      venue: "Rockefeller Plaza, 35 W 48th St",
      eventDate: "Aug 14, 2026",
      ticketUrl: "https://today.com",
      type: "concert",
    },
    {
      title: "aespa — Live Tour",
      venue: "UBS Arena, 2400 Hempstead Turnpike, Elmont NY",
      eventDate: "Sep 18, 2026",
      ticketUrl: "https://weverse.io",
      type: "concert",
    },
    {
      title: "wave to earth — The ( ) pieces tour",
      venue: "Radio City Music Hall, 1260 6th Ave",
      eventDate: "Sep 29, 2026",
      ticketUrl: "https://www.seated.com",
      type: "concert",
    },
    {
      title: "MONSTA X — WORLD TOUR [THE X : NEXUS]",
      venue: "Hulu Theater at MSG, 4 Pennsylvania Plaza",
      eventDate: "Oct 6, 2026",
      ticketUrl: "https://www.msg.com",
      type: "concert",
    },
    {
      title: "LE SSERAFIM — 'PUREFLOW' TOUR",
      venue: "Prudential Center, 25 Lafayette St, Newark NJ",
      eventDate: "Oct 8, 2026",
      ticketUrl: "https://www.ticketmaster.com",
      type: "concert",
    },
    {
      title: "KATSEYE — THE WILDWORLD TOUR",
      venue: "UBS Arena, 2400 Hempstead Turnpike, Elmont NY",
      eventDate: "Oct 24, 2026",
      ticketUrl: "https://www.ticketmaster.com",
      type: "concert",
    },
    {
      title: "CLOSE YOUR EYES — 1ST [BEYOND YOUR EYES] Tour",
      venue: "Melrose Ballroom, 36-08 33rd St, Long Island City",
      eventDate: "Nov 2, 2026",
      type: "concert",
    },
    {
      title: "BOYNEXTDOOR — 'KNOCK ON Vol.2' TOUR",
      venue: "Hulu Theater at MSG, 4 Pennsylvania Plaza",
      eventDate: "Nov 7, 2026",
      ticketUrl: "https://weverse.io",
      type: "concert",
    },
  ];

  // ── Fan Meetups & Cupsleeve Events (scraped from kpoptracker.net) ───────────
  const meetups: Array<{
    title: string;
    venue: string;
    eventDate: string;
    ticketUrl?: string;
    type: string;
  }> = [
    {
      title: "Yves — Nail Fansign Event",
      venue: "Kpop Nara NYC, 1237 Broadway (near Herald Square)",
      eventDate: "May 19, 2026",
      ticketUrl: "https://shop.kpopnara.com",
      type: "fan-event",
    },
    {
      title: "Love & Letter — 11 Years With Seventeen",
      venue: "Xing Fu Tang Ktown, Koreatown",
      eventDate: "May 23, 2026",
      type: "meetup",
    },
    {
      title: "aespa LEMONADE Pop-Up",
      venue: "TBA, New York City",
      eventDate: "May 29–31, 2026",
      type: "fan-event",
    },
    {
      title: "Seventeen 11th Anniversary & Mingyu Birthday Celebration",
      venue: "Xing Fu Tang Ktown, Koreatown",
      eventDate: "May 30, 2026",
      type: "meetup",
    },
    {
      title: "HARUA TAKI DAY — Birthday Cupsleeve Event",
      venue: "Yaya Tea CHRYSTIE, Chinatown",
      eventDate: "May 31, 2026",
      type: "fan-event",
    },
    {
      title: "BOYNEXTDOOR 3rd Anniversary Celebration",
      venue: "Xing Fu Tang Ktown, Koreatown",
      eventDate: "June 7, 2026",
      type: "meetup",
    },
    {
      title: "Swim with Bangtan — BTS Cupsleeve Event",
      venue: "Sweet Moment NYC, Koreatown",
      eventDate: "June 20, 2026",
      type: "fan-event",
    },
    {
      title: "NYC ARMY Monthly Meetup",
      venue: "Central Park (Bethesda Fountain area)",
      eventDate: "Monthly — check @nycARMY on Bluesky",
      type: "meetup",
    },
    {
      title: "Flushing K-pop Night",
      venue: "New World Mall, 136-20 Roosevelt Ave, Flushing Queens",
      eventDate: "Bi-weekly Saturdays",
      type: "meetup",
    },
  ];

  const allEvents = [...concerts, ...meetups];
  let created = 0;
  for (const e of allEvents) {
    await prisma.cityEvent.create({
      data: {
        cityId: city.id,
        title: e.title,
        venue: e.venue,
        eventDate: e.eventDate,
        ticketUrl: e.ticketUrl,
        type: e.type,
      },
    });
    created++;
  }

  // ── Update NYC metadata: add Kpop Nara as a K-pop spot ─────────────────────
  const currentMeta = city.metadata ? JSON.parse(city.metadata) : {};
  const existingSpots: Array<{ name: string; type: string; description: string }> =
    currentMeta.kpopSpots ?? [];

  const hasKpopNara = existingSpots.some((s) => s.name.toLowerCase().includes("nara"));
  if (!hasKpopNara) {
    existingSpots.push({
      name: "Kpop Nara NYC",
      type: "Store",
      description:
        "Official K-pop retailer at 1237 Broadway (near Herald Square). Fansign events, album drops, and expert staff. Physical photocard purchasing and in-store trading.",
    });
  }

  const hasSweetMoment = existingSpots.some((s) => s.name.toLowerCase().includes("sweet moment"));
  if (!hasSweetMoment) {
    existingSpots.push({
      name: "Sweet Moment NYC",
      type: "Café",
      description:
        "K-pop themed café in Koreatown hosting cupsleeve events, fan meetups, and themed drinks for comeback seasons.",
    });
  }

  const hasXingFuTang = existingSpots.some((s) => s.name.toLowerCase().includes("xing fu"));
  if (!hasXingFuTang) {
    existingSpots.push({
      name: "Xing Fu Tang Ktown",
      type: "Café",
      description:
        "Brown sugar boba café on 32nd St K-town that has become the go-to venue for fan birthday cupsleeve events and idol anniversary celebrations.",
    });
  }

  await prisma.city.update({
    where: { id: city.id },
    data: {
      metadata: JSON.stringify({ ...currentMeta, kpopSpots: existingSpots }),
    },
  });

  console.log(`✅ NYC events seeded: ${created} events (${concerts.length} concerts/festivals, ${meetups.length} meetups/fan events)`);
  console.log(`   K-pop spots updated in metadata`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
