// First-party events that Aegyo Arena itself hosts or co-hosts.
//
// The /events feed is an aggregator: every row in `ScannedEvent` is deduped by
// `sourceUrl`, and the page promises that each card links to a real listing. Our
// own meetups have no third-party listing to point at, so each one gets a real
// hosted page here at /events/[slug] — that page IS the listing, and its URL is
// what we ingest as `sourceUrl`. The honesty guarantee holds: nothing in the feed
// links to a page that doesn't exist.
export type HostedEvent = {
  slug: string;
  title: string;
  titleEs: string;
  category: string;
  city: string;
  citySlug: string;
  country: string;
  venue: string;
  address: string;
  mapQuery: string;
  /** Local wall-clock, stored and rendered as UTC so the posted time never drifts. */
  startsAt: string;
  endsAt: string;
  timeText: string;
  timeTextEs: string;
  /** Short line used on the feed card. */
  summary: string;
  summaryEs: string;
  /** Long copy for the hosted page. */
  body: string[];
  bodyEs: string[];
  expect: { en: string; es: string }[];
  host: { name: string; blurb: string; blurbEs: string; url: string };
  cover: string;
  coverCredit: string;
  free: boolean;
};

export const HOSTED_EVENTS: HostedEvent[] = [
  {
    slug: "random-play-dance-nyc-knesis",
    title: "Random Play Dance NYC — Under the Arch with KNESIS",
    titleEs: "Random Play Dance NYC — Bajo el Arco con KNESIS",
    category: "dance",
    city: "New York",
    citySlug: "new-york",
    country: "USA",
    venue: "Washington Square Park Arch",
    address: "Washington Square Park, Greenwich Village, New York, NY 10012",
    mapQuery: "Washington Square Arch, New York, NY 10012",
    startsAt: "2026-09-22T17:00:00.000Z",
    endsAt: "2026-09-22T19:00:00.000Z",
    timeText: "5:00 – 7:00 PM ET",
    timeTextEs: "5:00 – 7:00 PM ET",
    summary:
      "A two-hour random play dance circle under the arch with KNESIS, NYU's K-pop cover dance team. Free, no sign-up, all levels.",
    summaryEs:
      "Dos horas de random play dance bajo el arco con KNESIS, el equipo de baile K-pop de NYU. Gratis, sin inscripción, todos los niveles.",
    body: [
      "A song drops, and whoever knows the choreography runs into the middle of the circle. That's the whole game. Random play dance is the purest version of the K-pop fandom — no stage, no audition, no ticket, just a speaker and the part of the chorus everyone learned from the same TikTok.",
      "We're taking it to the arch at Washington Square Park on the evening of Tuesday, September 22, with KNESIS running the set list. Come at five, stay for however long you like, and leave knowing more people than you arrived with.",
    ],
    bodyEs: [
      "Suena una canción y quien se sepa la coreografía salta al centro del círculo. Ese es todo el juego. El random play dance es la versión más pura del fandom del K-pop: sin escenario, sin audición, sin entrada — solo una bocina y esa parte del coro que todo el mundo aprendió del mismo TikTok.",
      "Lo llevamos al arco de Washington Square Park la tarde del martes 22 de septiembre, con KNESIS a cargo de la lista de canciones. Llega a las cinco, quédate lo que quieras y vete conociendo a más gente de la que llegaste.",
    ],
    expect: [
      { en: "A rolling random play circle — a track starts, the people who know it take the middle.", es: "Un círculo de random play continuo: empieza una canción y quienes se la saben pasan al centro." },
      { en: "All levels. Watching from the fountain steps and screaming for your friends absolutely counts.", es: "Todos los niveles. Mirar desde las escaleras de la fuente y gritar por tus amigos también cuenta." },
      { en: "KNESIS on the set list — NYU's K-pop cover dance team, who teach free weekly classes.", es: "KNESIS a cargo de la lista — el equipo de baile K-pop de NYU, que da clases gratuitas cada semana." },
      { en: "Free, outdoors and public. No ticket, no registration, no cover charge.", es: "Gratis, al aire libre y público. Sin entrada, sin registro, sin cover." },
    ],
    host: {
      name: "KNESIS",
      blurb: "New York University's K-pop cover dance team. They teach free weekly classes open to all levels and post dance covers on YouTube.",
      blurbEs: "El equipo de baile de covers de K-pop de New York University. Dan clases gratuitas cada semana para todos los niveles y publican covers en YouTube.",
      url: "https://www.instagram.com/knesisnyu/",
    },
    cover:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Washington_Square_Arch_September_2022.jpg/1920px-Washington_Square_Arch_September_2022.jpg",
    coverCredit: "Photo: Kidfly182, CC BY-SA 4.0, via Wikimedia Commons",
    free: true,
  },
];

export const SITE = "https://www.aegyoarena.com";

export function hostedEventBySlug(slug: string): HostedEvent | undefined {
  return HOSTED_EVENTS.find((e) => e.slug === slug);
}

/** The canonical listing URL — also the `sourceUrl` the event is ingested under. */
export function hostedEventUrl(e: HostedEvent): string {
  return `${SITE}/events/${e.slug}`;
}
