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
  /** An example clip, so someone who has never seen a random play dance can watch one. */
  video?: { id: string; title: string; channel: string; channelUrl: string; heading: string; headingEs: string; caption: string; captionEs: string };
  /** Running order — each phase renders as a card, duration only (no invented clock times). */
  phases?: { name: string; nameEs: string; length: string; lengthEs: string; blurb: string; blurbEs: string }[];
  /** Long-form rules for a structured event, plus the prize ladder they resolve to. */
  format?: { heading: string; headingEs: string; body: string[]; bodyEs: string[]; prizes: { value: string; label: string; labelEs: string }[] };
  /** Named collaborators credited on the page. `preliminary` prints the caveat. */
  lineup?: { heading: string; headingEs: string; preliminary: boolean; people: { name: string; handle: string; url: string }[] };
  host: {
    name: string;
    blurb: string;
    blurbEs: string;
    url: string;
    /** Longer partner profile, rendered under the blurb when present. */
    profile?: string[];
    profileEs?: string[];
    links?: { label: string; handle: string; url: string }[];
  };
  cover: string;
  coverCredit: string;
  free: boolean;
  /** Attending requires registering on aegyoarena.com (see /api/events/register). */
  registration: boolean;
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
    endsAt: "2026-09-22T19:30:00.000Z",
    timeText: "5:00 – 7:30 PM ET",
    timeTextEs: "5:00 – 7:30 PM ET",
    summary:
      "A judged random play dance tournament under the arch with NYU KNESIS — 10 rounds, 40 photocards on the line — then an hour of free play. Free, all levels, register on Aegyo Arena to attend.",
    summaryEs:
      "Un torneo de random play dance con jurado bajo el arco junto a NYU KNESIS — 10 rondas y 40 photocards en juego — y después una hora de baile libre. Gratis, todos los niveles, regístrate en Aegyo Arena para asistir.",
    body: [
      "A song drops, and whoever knows the choreography runs into the middle of the circle. That's the whole game. Random play dance is the purest version of the K-pop fandom — no stage, no audition, no ticket, just a speaker and the part of the chorus everyone learned from the same video.",
      "We're taking it to the arch at Washington Square Park on the evening of Tuesday, September 22, with NYU KNESIS running the set list. This one comes in two halves: a judged tournament with photocards on the line, then free play, where the circle goes back to being a circle and the judges can jump in too.",
      "It's free, but you do need to register on this page so we know how many people to plan the circle for. Registering takes a name and an email, and that's the whole ask.",
    ],
    bodyEs: [
      "Suena una canción y quien se sepa la coreografía salta al centro del círculo. Ese es todo el juego. El random play dance es la versión más pura del fandom del K-pop: sin escenario, sin audición, sin entrada — solo una bocina y esa parte del coro que todo el mundo aprendió del mismo video.",
      "Lo llevamos al arco de Washington Square Park la tarde del martes 22 de septiembre, con NYU KNESIS a cargo de la lista de canciones. Esta vez son dos mitades: un torneo con jurado y photocards en juego, y después baile libre, cuando el círculo vuelve a ser solo un círculo y el jurado también puede entrar.",
      "Es gratis, pero tienes que registrarte en esta página para que sepamos con cuánta gente contar. Solo pedimos un nombre y un correo.",
    ],
    expect: [
      { en: "A rolling random play circle — a track starts, the people who know it take the middle.", es: "Un círculo de random play continuo: empieza una canción y quienes se la saben pasan al centro." },
      { en: "Ten judged rounds with 40 photocards on the line, then an hour of free play.", es: "Diez rondas con jurado y 40 photocards en juego, y después una hora de baile libre." },
      { en: "All levels. Watching from the fountain steps and screaming for your friends absolutely counts.", es: "Todos los niveles. Mirar desde las escaleras de la fuente y gritar por tus amigos también cuenta." },
      { en: "NYU KNESIS on the set list — NYU's very own K-pop cover dance club.", es: "NYU KNESIS a cargo de la lista — el club de baile de covers de K-pop de NYU." },
      { en: "Free and outdoors — but register on this page first, so we know how many to expect.", es: "Gratis y al aire libre — pero regístrate primero en esta página para que sepamos cuántos esperar." },
    ],
    video: {
      id: "2mtaoDYcisY",
      title: "During the GoToe's RPD in New York, NCT 127 actually appeared…!! Am I dreaming???",
      channel: "토경아 약먹자 (GoToe)",
      channelUrl: "https://www.youtube.com/@gotoe",
      heading: "What a random play dance looks like",
      headingEs: "Cómo se ve un random play dance",
      caption: "A GoToe random play dance in New York — the one where NCT 127 turned up. This is the format, minus the idols.",
      captionEs: "Un random play dance de GoToe en Nueva York — ese en el que aparecieron NCT 127. Este es el formato, sin los idols.",
    },
    phases: [
      {
        name: "The tournament",
        nameEs: "El torneo",
        length: "~1 hour",
        lengthEs: "~1 hora",
        blurb: "Ten rounds, song by song, with five judges working the circle. Dance the ones you know.",
        blurbEs: "Diez rondas, canción por canción, con cinco jueces recorriendo el círculo. Baila las que te sepas.",
      },
      {
        name: "Free play",
        nameEs: "Baile libre",
        length: "~1 hour",
        lengthEs: "~1 hora",
        blurb: "Standard random play dance, nobody scoring anything. The judges can jump in too.",
        blurbEs: "Random play dance normal, sin nadie puntuando. El jurado también puede entrar.",
      },
    ],
    format: {
      heading: "How the tournament works",
      headingEs: "Cómo funciona el torneo",
      body: [
        "A song plays and everyone jumps in as normal. The five judges each hold a different part of the circle, walk through the dancers, and pick the two best in their area — ten dancers in all.",
        "The floor is then cleared for those ten, who dance the song's chorus for the judges. The judges name one winner, who picks two photocards, and two runners-up, who pick one each.",
        "That's one round, and there are ten of them — forty photocards in total, all of them chosen by the people who win them.",
      ],
      bodyEs: [
        "Suena una canción y todo el mundo entra como siempre. Cada uno de los cinco jueces cubre una zona distinta del círculo, camina entre quienes bailan y elige a los dos mejores de su zona: diez personas en total.",
        "Se despeja la pista para esos diez, que bailan el coro de la canción frente al jurado. El jurado nombra a un ganador, que elige dos photocards, y a dos finalistas, que eligen una cada uno.",
        "Eso es una ronda, y hay diez — cuarenta photocards en total, todas elegidas por quienes las ganan.",
      ],
      prizes: [
        { value: "10", label: "rounds", labelEs: "rondas" },
        { value: "40", label: "photocards", labelEs: "photocards" },
        { value: "5", label: "judges", labelEs: "jueces" },
        { value: "2", label: "cards for each winner", labelEs: "cartas para cada ganador" },
      ],
    },
    lineup: {
      heading: "Judging the tournament",
      headingEs: "El jurado del torneo",
      preliminary: true,
      people: [
        { name: "Bobur Malikov", handle: "@bobur.kov", url: "https://www.instagram.com/bobur.kov/" },
        { name: "Grant Tayson", handle: "@thatasiangrant", url: "https://www.instagram.com/thatasiangrant/" },
        { name: "Claire Pan", handle: "@clairepan_covers", url: "https://www.instagram.com/clairepan_covers/" },
        { name: "Vic Gong", handle: "@viccanteatrice", url: "https://www.instagram.com/viccanteatrice/" },
        { name: "Monica Tsay", handle: "@mtsay_15", url: "https://www.instagram.com/mtsay_15/" },
      ],
    },
    host: {
      name: "NYU KNESIS",
      blurb: "New York University's own student-led K-pop dance cover club.",
      blurbEs: "El club de baile de covers de K-pop de New York University, dirigido por sus propios estudiantes.",
      url: "https://www.instagram.com/knesisnyu/",
      profile: [
        "A substantial membership, almost 15,000 subscribers on YouTube, and a calendar built around planning, learning, practising and executing high-level covers of the songs that are actually charting.",
        "They hire professionals to film and edit their public performances, publish them on their socials, and pull thousands of views — sometimes well over a hundred thousand. Every semester closes with an elaborate show at NYU built around their best covers of the term.",
      ],
      profileEs: [
        "Una membresía amplia, casi 15.000 suscriptores en YouTube y un calendario dedicado a planear, aprender, ensayar y ejecutar covers de alto nivel de las canciones que están sonando.",
        "Contratan profesionales para grabar y editar sus presentaciones públicas, las publican en sus redes y acumulan miles de reproducciones — a veces bastante más de cien mil. Cada semestre cierra con un show elaborado en NYU con sus mejores covers del período.",
      ],
      links: [
        { label: "Instagram", handle: "@knesisnyu", url: "https://www.instagram.com/knesisnyu/" },
        { label: "TikTok", handle: "@knesisnyu", url: "https://www.tiktok.com/@knesisnyu" },
        { label: "YouTube", handle: "KNESIS", url: "https://www.youtube.com/channel/UCExejBLW9coSaprYTdfUVag" },
      ],
    },
    cover:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Washington_Square_Arch_September_2022.jpg/1920px-Washington_Square_Arch_September_2022.jpg",
    coverCredit: "Photo: Kidfly182, CC BY-SA 4.0, via Wikimedia Commons",
    free: true,
    registration: true,
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
