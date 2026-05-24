/**
 * seed-all-cities-events.ts
 * Populates CityEvent records for all 20 remaining cities (NYC was seeded separately).
 * Sources: kpoptracker.net (US cities), tour announcements, local fan event data.
 * Run via:
 *   DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-all-cities-events.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type EventInput = {
  title: string;
  venue: string;
  eventDate: string;
  ticketUrl?: string;
  type: "concert" | "meetup" | "festival" | "fan-event";
};

type CityData = {
  slug: string;
  events: EventInput[];
};

const cityData: CityData[] = [
  // ── US Cities (scraped from kpoptracker.net) ───────────────────────────────
  {
    slug: "los-angeles",
    events: [
      {
        title: "We On Fire — YVES Cupsleeve Event",
        venue: "HHD (Hello82 Dining), 621 S Western Ave, Koreatown",
        eventDate: "May 23, 2026",
        type: "fan-event",
      },
      {
        title: "fiveALIVE — K-pop Live Concert",
        venue: "Catch One, 4067 W Pico Blvd",
        eventDate: "May 24, 2026",
        type: "concert",
      },
      {
        title: "Seventeen '17 is Right Here' Cupsleeve",
        venue: "HHD (Hello82 Dining), 621 S Western Ave, Koreatown",
        eventDate: "May 30, 2026",
        type: "fan-event",
      },
      {
        title: "NCTzen + Multistan Photocard Trade",
        venue: "hello82 LA, 150 S Western Ave",
        eventDate: "May 30, 2026",
        type: "meetup",
      },
      {
        title: "JUNMIN Birthday Cupsleeve",
        venue: "NACE Store LA, 863 S Western Ave",
        eventDate: "Jun 3, 2026",
        type: "fan-event",
      },
      {
        title: "K-pop RPD — Dance Workshop",
        venue: "Superior Grocers Parking Lot, Koreatown",
        eventDate: "Jun 11, 2026",
        type: "meetup",
      },
      {
        title: "Bangtan Baseball & Cupsleeve Market",
        venue: "The Pub at Golden Road, 999 N Figueroa St",
        eventDate: "Jun 13, 2026",
        type: "fan-event",
      },
      {
        title: "KCON LA 2026 — &TEAM, TXT, and more",
        venue: "Crypto.com Arena, 1111 S Figueroa St",
        eventDate: "Aug 9–11, 2026",
        ticketUrl: "https://www.kconusa.com",
        type: "festival",
      },
      {
        title: "aespa — Live Tour Los Angeles",
        venue: "Crypto.com Arena, 1111 S Figueroa St",
        eventDate: "Sep 20, 2026",
        ticketUrl: "https://www.ticketmaster.com",
        type: "concert",
      },
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Night 1",
        venue: "SoFi Stadium, 1001 Stadium Dr, Inglewood",
        eventDate: "Oct 3, 2026",
        ticketUrl: "https://www.ticketmaster.com",
        type: "concert",
      },
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Night 2",
        venue: "SoFi Stadium, 1001 Stadium Dr, Inglewood",
        eventDate: "Oct 4, 2026",
        ticketUrl: "https://www.ticketmaster.com",
        type: "concert",
      },
      {
        title: "KATSEYE — THE WILDWORLD TOUR Los Angeles",
        venue: "Kia Forum, 3900 W Manchester Blvd, Inglewood",
        eventDate: "Oct 28, 2026",
        ticketUrl: "https://www.ticketmaster.com",
        type: "concert",
      },
      {
        title: "LA ARMY Monthly Meetup",
        venue: "Koreatown Plaza, 928 S Western Ave",
        eventDate: "Monthly — check @LA_ARMY on Bluesky",
        type: "meetup",
      },
    ],
  },
  {
    slug: "chicago",
    events: [
      {
        title: "SHINee 18th Anniversary Celebration",
        venue: "Daboba, 2745 N Milwaukee Ave",
        eventDate: "May 24, 2026",
        type: "fan-event",
      },
      {
        title: "Sunoo Birthday Cupsleeve Event",
        venue: "Tsaocaa Lincoln Park, 2444 N Clark St",
        eventDate: "Jun 20, 2026",
        type: "fan-event",
      },
      {
        title: "Spider-Man Mark & Yunho Cupsleeve",
        venue: "K POP & MORE, Chicago",
        eventDate: "Jul 25, 2026",
        type: "fan-event",
      },
      {
        title: "KPALOOZA 2026",
        venue: "Daboba, 2745 N Milwaukee Ave",
        eventDate: "Aug 1, 2026",
        type: "festival",
      },
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Chicago Night 1",
        venue: "United Center, 1901 W Madison St",
        eventDate: "Aug 27, 2026",
        ticketUrl: "https://www.ticketmaster.com",
        type: "concert",
      },
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Chicago Night 2",
        venue: "United Center, 1901 W Madison St",
        eventDate: "Aug 28, 2026",
        ticketUrl: "https://www.ticketmaster.com",
        type: "concert",
      },
      {
        title: "BTS Chicago — ARIRANG Cupsleeve Day 1",
        venue: "Daboba, 2745 N Milwaukee Ave",
        eventDate: "Aug 26, 2026",
        type: "fan-event",
      },
      {
        title: "BTS In Chicago Cupsleeve Event",
        venue: "Uni Uni Boba, Chinatown",
        eventDate: "Aug 27, 2026",
        type: "fan-event",
      },
      {
        title: "BTS World Tour Chicago Cupsleeve",
        venue: "AUTEA SWEETS, Chicago",
        eventDate: "Aug 28, 2026",
        type: "fan-event",
      },
      {
        title: "ARIRANG After Concert Cupsleeve",
        venue: "Daboba, 2745 N Milwaukee Ave",
        eventDate: "Aug 29, 2026",
        type: "fan-event",
      },
    ],
  },
  {
    slug: "dallas",
    events: [
      {
        title: "SHINee 18 Years Celebration",
        venue: "KPOP BESTIE, Dallas",
        eventDate: "May 23, 2026",
        type: "fan-event",
      },
      {
        title: "BTS STEP CLASS — Dance Workshop",
        venue: "Kumbala Dance Studio, 2516 E Hebron Pkwy, Farmers Branch",
        eventDate: "May 23, 2026",
        type: "meetup",
      },
      {
        title: "DFW ARMY Craft Day",
        venue: "Arcadia Park Branch Library, 1900 Park Vista Dr",
        eventDate: "Jun 6, 2026",
        type: "meetup",
      },
      {
        title: "ENHYPEN 'Bite Me' Concert Cupsleeve",
        venue: "Craft Boba Tea, Dallas",
        eventDate: "Jul 17, 2026",
        type: "fan-event",
      },
      {
        title: "LE SSERAFIM — 'PUREFLOW' TOUR Dallas",
        venue: "Dos Equis Pavilion, 1818 First Ave",
        eventDate: "Oct 15, 2026",
        ticketUrl: "https://www.ticketmaster.com",
        type: "concert",
      },
      {
        title: "DFW K-pop Night",
        venue: "KTown Dallas, Carrollton",
        eventDate: "Bi-weekly Saturdays",
        type: "meetup",
      },
    ],
  },
  {
    slug: "boston",
    events: [
      {
        title: "ATEEZ Coronation Cupsleeve — San & Yeosang Birthday",
        venue: "Simple Sweets, 93 Washington St, Norwood MA",
        eventDate: "Jun 27, 2026",
        type: "fan-event",
      },
      {
        title: "Boston K-pop Club Monthly Meetup",
        venue: "Allston Village, Brighton Ave, Allston",
        eventDate: "Monthly — check @BostonKpop on Instagram",
        type: "meetup",
      },
      {
        title: "KATSEYE — THE WILDWORLD TOUR Boston",
        venue: "MGM Music Hall at Fenway, 2 Lansdowne St",
        eventDate: "Nov 12, 2026",
        ticketUrl: "https://www.ticketmaster.com",
        type: "concert",
      },
      {
        title: "aespa — Live Tour Boston",
        venue: "TD Garden, 100 Legends Way",
        eventDate: "Sep 22, 2026",
        ticketUrl: "https://www.ticketmaster.com",
        type: "concert",
      },
    ],
  },
  {
    slug: "tampa",
    events: [
      {
        title: "Tampa Bay K-pop Fan Meet",
        venue: "International Plaza, 2223 N Westshore Blvd",
        eventDate: "Monthly — check Tampa K-pop Facebook group",
        type: "meetup",
      },
      {
        title: "aespa — Live Tour Tampa",
        venue: "Amalie Arena, 401 Channelside Dr",
        eventDate: "Sep 25, 2026",
        ticketUrl: "https://www.ticketmaster.com",
        type: "concert",
      },
      {
        title: "K-pop Photocard Trading — Tampa",
        venue: "Westshore Plaza, 250 Westshore Plaza",
        eventDate: "Jun 14, 2026",
        type: "meetup",
      },
    ],
  },
  {
    slug: "scottsdale",
    events: [
      {
        title: "SHINee 18th Anniversary Celebration",
        venue: "Tii Cup, 2620 N Dobson Rd, Chandler",
        eventDate: "May 23, 2026",
        type: "fan-event",
      },
      {
        title: "Kpop Photocard Trading Event",
        venue: "Gamers Guild AZ, 2501 W Happy Valley Rd, North Phoenix",
        eventDate: "May 28, 2026",
        type: "meetup",
      },
      {
        title: "Club K-POP Phoenix",
        venue: "Club Contact Phoenix, 4125 N 7th Ave",
        eventDate: "May 30, 2026",
        type: "meetup",
      },
      {
        title: "BTS 13th Anniversary Celebration",
        venue: "Tii Cup, 2620 N Dobson Rd, Chandler",
        eventDate: "Jun 6, 2026",
        type: "fan-event",
      },
      {
        title: "Yeosang & San Birthday Cupsleeve",
        venue: "Tii Cup, 2620 N Dobson Rd, Chandler",
        eventDate: "Jun 20, 2026",
        type: "fan-event",
      },
      {
        title: "K-Rock Cupsleeve Event",
        venue: "BobaWhaaat, 3610 W Anthem Way, Phoenix",
        eventDate: "Jun 26, 2026",
        type: "fan-event",
      },
      {
        title: "LE SSERAFIM — 'PUREFLOW' TOUR Phoenix",
        venue: "Footprint Center, 201 E Jefferson St, Phoenix",
        eventDate: "Oct 11, 2026",
        ticketUrl: "https://www.ticketmaster.com",
        type: "concert",
      },
    ],
  },

  // ── International Cities ───────────────────────────────────────────────────
  {
    slug: "seoul",
    events: [
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Seoul Night 1",
        venue: "Seoul World Cup Stadium, 240 World Cup-ro, Mapo-gu",
        eventDate: "Jun 14, 2026",
        ticketUrl: "https://weverse.io",
        type: "concert",
      },
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Seoul Night 2",
        venue: "Seoul World Cup Stadium, 240 World Cup-ro, Mapo-gu",
        eventDate: "Jun 15, 2026",
        ticketUrl: "https://weverse.io",
        type: "concert",
      },
      {
        title: "aespa — SYNK: PARALLEL LINE Fan Concert",
        venue: "KSPO Dome, 424 Olympic-ro, Songpa-gu",
        eventDate: "Jul 4–6, 2026",
        ticketUrl: "https://ticket.interpark.com",
        type: "concert",
      },
      {
        title: "IVE — WORLD TOUR 'SHOW WHAT I AM' Seoul",
        venue: "Olympic Gymnastics Arena, 424 Olympic-ro, Songpa-gu",
        eventDate: "Sep 5–6, 2026",
        ticketUrl: "https://ticket.melon.com",
        type: "concert",
      },
      {
        title: "SMTOWN LIVE in Seoul",
        venue: "COEX Artium, 513 Yeongdong-daero, Gangnam-gu",
        eventDate: "Aug 15, 2026",
        ticketUrl: "https://ticket.interpark.com",
        type: "festival",
      },
      {
        title: "Seoul Wave K-pop Festival",
        venue: "Jamsil Sports Complex, 25 Olympic-ro, Songpa-gu",
        eventDate: "Oct 10, 2026",
        ticketUrl: "https://ticket.interpark.com",
        type: "festival",
      },
      {
        title: "Hongdae K-pop Fan Trading Market",
        venue: "Hongdae Playground, Mapo-gu",
        eventDate: "Every Saturday",
        type: "meetup",
      },
      {
        title: "Music Bank Recording — Open Audience",
        venue: "KBS Hall, Yeouido-dong, Yeongdeungpo-gu",
        eventDate: "Weekly Fridays — check KBS schedule",
        type: "concert",
      },
    ],
  },
  {
    slug: "tokyo",
    events: [
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Tokyo Night 1",
        venue: "Tokyo Dome, 1-3-61 Koraku, Bunkyo-ku",
        eventDate: "Jul 4, 2026",
        ticketUrl: "https://weverse.io",
        type: "concert",
      },
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Tokyo Night 2",
        venue: "Tokyo Dome, 1-3-61 Koraku, Bunkyo-ku",
        eventDate: "Jul 5, 2026",
        ticketUrl: "https://weverse.io",
        type: "concert",
      },
      {
        title: "TWICE — World Tour Japan Encore Night 1",
        venue: "Makuhari Messe International Exhibition Hall, Chiba",
        eventDate: "Jun 20, 2026",
        ticketUrl: "https://eplus.jp",
        type: "concert",
      },
      {
        title: "TWICE — World Tour Japan Encore Night 2",
        venue: "Makuhari Messe International Exhibition Hall, Chiba",
        eventDate: "Jun 21, 2026",
        ticketUrl: "https://eplus.jp",
        type: "concert",
      },
      {
        title: "aespa — Live Tour Japan",
        venue: "Saitama Super Arena, 8 Shintoshin, Chuo-ku, Saitama",
        eventDate: "Aug 22–23, 2026",
        ticketUrl: "https://eplus.jp",
        type: "concert",
      },
      {
        title: "Stray Kids — MANIACFEST Japan",
        venue: "Yoyogi National Gymnasium, 2-1-1 Jinnan, Shibuya-ku",
        eventDate: "Sep 12, 2026",
        ticketUrl: "https://eplus.jp",
        type: "festival",
      },
      {
        title: "IVE — Japan Fan Concert",
        venue: "Zepp Tokyo, 1-2-3 Aomi, Koto-ku",
        eventDate: "Oct 17, 2026",
        ticketUrl: "https://eplus.jp",
        type: "concert",
      },
      {
        title: "Tokyo K-pop Fan Meetup — Shin-Okubo",
        venue: "Korean Town, Shin-Okubo, Shinjuku-ku",
        eventDate: "Monthly — check @tokyokpopfans on X",
        type: "meetup",
      },
    ],
  },
  {
    slug: "london",
    events: [
      {
        title: "BTS — WORLD TOUR 'ARIRANG' London Night 1",
        venue: "Wembley Stadium, Wembley, London HA9 0WS",
        eventDate: "Sep 5, 2026",
        ticketUrl: "https://www.ticketmaster.co.uk",
        type: "concert",
      },
      {
        title: "BTS — WORLD TOUR 'ARIRANG' London Night 2",
        venue: "Wembley Stadium, Wembley, London HA9 0WS",
        eventDate: "Sep 6, 2026",
        ticketUrl: "https://www.ticketmaster.co.uk",
        type: "concert",
      },
      {
        title: "aespa — Live Tour London",
        venue: "The O2 Arena, Peninsula Square, London SE10 0DX",
        eventDate: "Sep 28, 2026",
        ticketUrl: "https://www.axs.com",
        type: "concert",
      },
      {
        title: "KATSEYE — THE WILDWORLD TOUR London",
        venue: "Alexandra Palace, Alexandra Palace Way, London N22 7AY",
        eventDate: "Oct 30, 2026",
        ticketUrl: "https://www.ticketmaster.co.uk",
        type: "concert",
      },
      {
        title: "Stray Kids — Europe Tour London",
        venue: "The O2 Arena, Peninsula Square, London SE10 0DX",
        eventDate: "Nov 8, 2026",
        ticketUrl: "https://www.ticketmaster.co.uk",
        type: "concert",
      },
      {
        title: "London K-pop Convention 2026",
        venue: "ExCeL London, Royal Victoria Dock, London E16 1XL",
        eventDate: "Aug 22–23, 2026",
        ticketUrl: "https://www.eventbrite.co.uk",
        type: "festival",
      },
      {
        title: "London ARMY Monthly Meetup",
        venue: "Korea Foods, New Malden, London",
        eventDate: "Monthly — check @LondonARMY on Bluesky",
        type: "meetup",
      },
    ],
  },
  {
    slug: "bangkok",
    events: [
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Bangkok Night 1",
        venue: "National Stadium, Rama I Rd, Pathumwan",
        eventDate: "Nov 14, 2026",
        ticketUrl: "https://www.thaiticketmajor.com",
        type: "concert",
      },
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Bangkok Night 2",
        venue: "National Stadium, Rama I Rd, Pathumwan",
        eventDate: "Nov 15, 2026",
        ticketUrl: "https://www.thaiticketmajor.com",
        type: "concert",
      },
      {
        title: "IVE — WORLD TOUR 'SHOW WHAT I AM' Bangkok",
        venue: "Thunder Dome, 99 Khlong 1, Khlong Luang, Pathum Thani",
        eventDate: "Jul 18, 2026",
        ticketUrl: "https://www.thaiticketmajor.com",
        type: "concert",
      },
      {
        title: "LE SSERAFIM — 'PUREFLOW' TOUR Bangkok",
        venue: "Impact Arena, Muang Thong Thani, Nonthaburi",
        eventDate: "Oct 3, 2026",
        ticketUrl: "https://www.thaiticketmajor.com",
        type: "concert",
      },
      {
        title: "KPOP EXPO Bangkok 2026",
        venue: "BITEC, 88 Bang Na Trat Rd, Bang Na",
        eventDate: "Jun 13–14, 2026",
        ticketUrl: "https://www.eventpop.me",
        type: "festival",
      },
      {
        title: "Bangkok K-pop Cover Dance Festival",
        venue: "CentralWorld, 999/9 Rama I Rd, Pathum Wan",
        eventDate: "Aug 8, 2026",
        type: "festival",
      },
      {
        title: "Bangkok ARMY & Fandom Fan Meet",
        venue: "Siam Square, Pathum Wan, Bangkok",
        eventDate: "Monthly — check @bangkokARMY on X",
        type: "meetup",
      },
    ],
  },
  {
    slug: "paris",
    events: [
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Paris Night 1",
        venue: "Stade de France, 93216 Saint-Denis",
        eventDate: "Sep 12, 2026",
        ticketUrl: "https://www.ticketmaster.fr",
        type: "concert",
      },
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Paris Night 2",
        venue: "Stade de France, 93216 Saint-Denis",
        eventDate: "Sep 13, 2026",
        ticketUrl: "https://www.ticketmaster.fr",
        type: "concert",
      },
      {
        title: "aespa — Live Tour Paris",
        venue: "Accor Arena, 8 Bd de Bercy, 75012 Paris",
        eventDate: "Oct 3, 2026",
        ticketUrl: "https://www.fnacspectacles.com",
        type: "concert",
      },
      {
        title: "Stray Kids — Europe Tour Paris",
        venue: "Accor Arena, 8 Bd de Bercy, 75012 Paris",
        eventDate: "Nov 14, 2026",
        ticketUrl: "https://www.ticketmaster.fr",
        type: "concert",
      },
      {
        title: "KPOP PARIS FESTIVAL 2026",
        venue: "Grande Halle de la Villette, 211 Av. Jean Jaurès, 75019 Paris",
        eventDate: "Jul 11–12, 2026",
        ticketUrl: "https://www.eventbrite.fr",
        type: "festival",
      },
      {
        title: "Paris K-pop Fan Meetup",
        venue: "Galerie Vivienne, 4 Rue des Petits Champs, 75002 Paris",
        eventDate: "Monthly — check @kpopparis on Instagram",
        type: "meetup",
      },
    ],
  },
  {
    slug: "mexico-city",
    events: [
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Ciudad de México Night 1",
        venue: "Estadio GNP Seguros, Av. del Conscripto s/n, Miguel Hidalgo",
        eventDate: "Oct 17, 2026",
        ticketUrl: "https://www.ticketmaster.com.mx",
        type: "concert",
      },
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Ciudad de México Night 2",
        venue: "Estadio GNP Seguros, Av. del Conscripto s/n, Miguel Hidalgo",
        eventDate: "Oct 18, 2026",
        ticketUrl: "https://www.ticketmaster.com.mx",
        type: "concert",
      },
      {
        title: "aespa — Live Tour México",
        venue: "Palacio de los Deportes, Av. del Conscripto s/n, GAM",
        eventDate: "Sep 30, 2026",
        ticketUrl: "https://www.ticketmaster.com.mx",
        type: "concert",
      },
      {
        title: "LE SSERAFIM — 'PUREFLOW' TOUR México",
        venue: "Pepsi Center WTC, Av. de los Insurgentes Sur 1605, Benito Juárez",
        eventDate: "Oct 21, 2026",
        ticketUrl: "https://www.ticketmaster.com.mx",
        type: "concert",
      },
      {
        title: "TWICE — México Fan Meeting",
        venue: "Teatro Metropolitan, 141 Av. Independencia, Centro",
        eventDate: "Aug 8, 2026",
        ticketUrl: "https://www.ticketmaster.com.mx",
        type: "concert",
      },
      {
        title: "K-FEST México 2026",
        venue: "Foro Sol, Viaducto Río de la Piedad 1, GAM",
        eventDate: "Jul 25, 2026",
        ticketUrl: "https://www.superboletos.com",
        type: "festival",
      },
      {
        title: "CDMX K-pop Fan Market",
        venue: "Plaza Garibaldi, Eje Central Lázaro Cárdenas, Centro",
        eventDate: "Monthly — check @kpopcdmx on X",
        type: "meetup",
      },
    ],
  },
  {
    slug: "sao-paulo",
    events: [
      {
        title: "BTS — WORLD TOUR 'ARIRANG' São Paulo Night 1",
        venue: "Allianz Parque, Av. Francisco Matarazzo 1705, Água Branca",
        eventDate: "Oct 24, 2026",
        ticketUrl: "https://www.ticketmaster.com.br",
        type: "concert",
      },
      {
        title: "BTS — WORLD TOUR 'ARIRANG' São Paulo Night 2",
        venue: "Allianz Parque, Av. Francisco Matarazzo 1705, Água Branca",
        eventDate: "Oct 25, 2026",
        ticketUrl: "https://www.ticketmaster.com.br",
        type: "concert",
      },
      {
        title: "aespa — Live Tour São Paulo",
        venue: "Vibra São Paulo, R. Bragança Paulista 1281, Chácara Santo Antônio",
        eventDate: "Oct 8, 2026",
        ticketUrl: "https://www.ticketmaster.com.br",
        type: "concert",
      },
      {
        title: "Stray Kids — LATAM Tour São Paulo",
        venue: "Espaço Unimed, R. Tagipuru 795, Barra Funda",
        eventDate: "Nov 1, 2026",
        ticketUrl: "https://www.ticketmaster.com.br",
        type: "concert",
      },
      {
        title: "K-POP BRAZIL CONVENTION 2026",
        venue: "Expo Center Norte, R. José Bernardo Pinto 333, Vila Guilherme",
        eventDate: "Jul 18–19, 2026",
        ticketUrl: "https://www.sympla.com.br",
        type: "festival",
      },
      {
        title: "SP K-pop Fan Meetup — Liberdade",
        venue: "Praça da Liberdade, Liberdade, São Paulo",
        eventDate: "Monthly — check @kpopbrasil on Instagram",
        type: "meetup",
      },
    ],
  },
  {
    slug: "buenos-aires",
    events: [
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Buenos Aires",
        venue: "Estadio Monumental, Av. Pres. Figueroa Alcorta 7597, Núñez",
        eventDate: "Oct 29, 2026",
        ticketUrl: "https://www.allticket.com",
        type: "concert",
      },
      {
        title: "aespa — Live Tour Buenos Aires",
        venue: "Movistar Arena, Humboldt 450, Villa Crespo",
        eventDate: "Oct 13, 2026",
        ticketUrl: "https://www.allticket.com",
        type: "concert",
      },
      {
        title: "TWICE — South America Tour Buenos Aires",
        venue: "Gran Rex, Av. Corrientes 857, CABA",
        eventDate: "Aug 14, 2026",
        ticketUrl: "https://www.ticketek.com.ar",
        type: "concert",
      },
      {
        title: "K-POP FEST ARGENTINA 2026",
        venue: "La Rural, Av. Sarmiento 2704, Palermo",
        eventDate: "Aug 1–2, 2026",
        ticketUrl: "https://www.eventbrite.com.ar",
        type: "festival",
      },
      {
        title: "Buenos Aires K-pop Fan Night",
        venue: "Flores, Buenos Aires",
        eventDate: "Bi-weekly Fridays",
        type: "meetup",
      },
    ],
  },
  {
    slug: "madrid",
    events: [
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Madrid",
        venue: "Estadio Cívitas Metropolitano, Av. de Luis Aragonés 4",
        eventDate: "Sep 19, 2026",
        ticketUrl: "https://www.ticketmaster.es",
        type: "concert",
      },
      {
        title: "aespa — Live Tour Madrid",
        venue: "WiZink Center, Av. de Felipe II s/n, Madrid",
        eventDate: "Oct 7, 2026",
        ticketUrl: "https://www.entradas.com",
        type: "concert",
      },
      {
        title: "Stray Kids — Europe Tour Madrid",
        venue: "WiZink Center, Av. de Felipe II s/n, Madrid",
        eventDate: "Nov 18, 2026",
        ticketUrl: "https://www.ticketmaster.es",
        type: "concert",
      },
      {
        title: "K-POP WORLD FESTIVAL España 2026",
        venue: "Palacio Vistalegre, Utebo 1, Madrid",
        eventDate: "Jun 27, 2026",
        ticketUrl: "https://www.ticketmaster.es",
        type: "festival",
      },
      {
        title: "Madrid K-pop Fan Meetup",
        venue: "Mercado de San Miguel, Plaza de San Miguel s/n, Centro",
        eventDate: "Monthly — check @kpop_madrid on Instagram",
        type: "meetup",
      },
    ],
  },
  {
    slug: "milan",
    events: [
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Milan",
        venue: "Mediolanum Forum, Via G. di Vittorio 6, Assago",
        eventDate: "Sep 22, 2026",
        ticketUrl: "https://www.ticketmaster.it",
        type: "concert",
      },
      {
        title: "aespa — Live Tour Milan",
        venue: "Mediolanum Forum, Via G. di Vittorio 6, Assago",
        eventDate: "Oct 10, 2026",
        ticketUrl: "https://www.ticketmaster.it",
        type: "concert",
      },
      {
        title: "Stray Kids — Europe Tour Milan",
        venue: "Mediolanum Forum, Via G. di Vittorio 6, Assago",
        eventDate: "Nov 21, 2026",
        ticketUrl: "https://www.ticketmaster.it",
        type: "concert",
      },
      {
        title: "K-POP ITALY FEST 2026",
        venue: "Fabrique, Via Fantoli 9, Milano",
        eventDate: "Jul 4, 2026",
        ticketUrl: "https://www.eventbrite.it",
        type: "festival",
      },
      {
        title: "Milano K-pop Fan Meetup",
        venue: "Navigli District, Via Naviglio Grande, Milano",
        eventDate: "Monthly — check @kpopitalia on Instagram",
        type: "meetup",
      },
    ],
  },
  {
    slug: "dubai",
    events: [
      {
        title: "K-pop Fest Dubai 2026",
        venue: "Coca-Cola Arena, City Walk, Al Wasl, Dubai",
        eventDate: "Feb 14, 2026",
        ticketUrl: "https://www.coca-cola-arena.com",
        type: "festival",
      },
      {
        title: "aespa — Live Tour Dubai",
        venue: "Coca-Cola Arena, City Walk, Al Wasl, Dubai",
        eventDate: "Nov 21, 2026",
        ticketUrl: "https://www.ticketmaster.ae",
        type: "concert",
      },
      {
        title: "MONSTA X — World Tour [THE X : NEXUS] Dubai",
        venue: "Dubai World Trade Centre, Sheikh Zayed Rd",
        eventDate: "Dec 5, 2026",
        ticketUrl: "https://www.ticketmaster.ae",
        type: "concert",
      },
      {
        title: "TWICE — Middle East Fan Meeting",
        venue: "Coca-Cola Arena, City Walk, Al Wasl, Dubai",
        eventDate: "Aug 22, 2026",
        ticketUrl: "https://www.coca-cola-arena.com",
        type: "concert",
      },
      {
        title: "Dubai K-pop Fan Community Meetup",
        venue: "Korean BBQ Row, Al Barsha, Dubai",
        eventDate: "Monthly — check @kpop_dubai on Instagram",
        type: "meetup",
      },
    ],
  },
  {
    slug: "manila",
    events: [
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Manila Night 1",
        venue: "Philippine Arena, Ciudad de Victoria, Bulacan",
        eventDate: "Nov 21, 2026",
        ticketUrl: "https://www.smtickets.com",
        type: "concert",
      },
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Manila Night 2",
        venue: "Philippine Arena, Ciudad de Victoria, Bulacan",
        eventDate: "Nov 22, 2026",
        ticketUrl: "https://www.smtickets.com",
        type: "concert",
      },
      {
        title: "IVE — WORLD TOUR 'SHOW WHAT I AM' Manila",
        venue: "SM Mall of Asia Arena, Seashell Lane, Pasay",
        eventDate: "Aug 1, 2026",
        ticketUrl: "https://www.smtickets.com",
        type: "concert",
      },
      {
        title: "LE SSERAFIM — 'PUREFLOW' TOUR Manila",
        venue: "Araneta Coliseum, General Romulo Ave, Cubao, QC",
        eventDate: "Sep 12, 2026",
        ticketUrl: "https://www.smtickets.com",
        type: "concert",
      },
      {
        title: "TWICE — Manila Fan Meeting",
        venue: "SM Mall of Asia Arena, Seashell Lane, Pasay",
        eventDate: "Oct 3, 2026",
        ticketUrl: "https://www.smtickets.com",
        type: "concert",
      },
      {
        title: "K-POP WORLD FESTIVAL Philippines",
        venue: "SM Mall of Asia Open Grounds, Pasay",
        eventDate: "Jul 12, 2026",
        ticketUrl: "https://www.eventbrite.ph",
        type: "festival",
      },
      {
        title: "Manila K-pop Fan Meetup",
        venue: "SM Mall of Asia, Pasay, Metro Manila",
        eventDate: "Monthly — check @kpopph on Instagram",
        type: "meetup",
      },
    ],
  },
  {
    slug: "kuala-lumpur",
    events: [
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Kuala Lumpur Night 1",
        venue: "Axiata Arena, 9 Jalan Stadium, Bukit Jalil, KL",
        eventDate: "Nov 7, 2026",
        ticketUrl: "https://www.axcess.com.my",
        type: "concert",
      },
      {
        title: "BTS — WORLD TOUR 'ARIRANG' Kuala Lumpur Night 2",
        venue: "Axiata Arena, 9 Jalan Stadium, Bukit Jalil, KL",
        eventDate: "Nov 8, 2026",
        ticketUrl: "https://www.axcess.com.my",
        type: "concert",
      },
      {
        title: "IVE — WORLD TOUR 'SHOW WHAT I AM' KL",
        venue: "Axiata Arena, 9 Jalan Stadium, Bukit Jalil, KL",
        eventDate: "Jul 25, 2026",
        ticketUrl: "https://www.axcess.com.my",
        type: "concert",
      },
      {
        title: "LE SSERAFIM — 'PUREFLOW' TOUR KL",
        venue: "Stadium Merdeka, Jalan Stadium, Chow Kit, KL",
        eventDate: "Sep 19, 2026",
        ticketUrl: "https://www.axcess.com.my",
        type: "concert",
      },
      {
        title: "K-POP WORLD FESTIVAL Malaysia",
        venue: "Sunway Pyramid Convention Centre, Subang Jaya",
        eventDate: "Aug 22, 2026",
        ticketUrl: "https://www.eventbrite.com.my",
        type: "festival",
      },
      {
        title: "KL K-pop Fan Meetup",
        venue: "Bukit Bintang, Kuala Lumpur City Centre",
        eventDate: "Monthly — check @kpopmy on Instagram",
        type: "meetup",
      },
    ],
  },
  {
    slug: "shanghai",
    events: [
      {
        title: "K-POP WORLD FESTIVAL Shanghai",
        venue: "Mercedes-Benz Arena, 1200 Expo Ave, Pudong",
        eventDate: "Jun 20, 2026",
        ticketUrl: "https://www.damai.cn",
        type: "festival",
      },
      {
        title: "EXO — Special Fan Concert Shanghai",
        venue: "Shanghai Indoor Stadium, 1111 Caoxi Bei Rd, Xuhui",
        eventDate: "Jul 11, 2026",
        ticketUrl: "https://www.damai.cn",
        type: "concert",
      },
      {
        title: "SuperM — World Tour Shanghai",
        venue: "Mercedes-Benz Arena, 1200 Expo Ave, Pudong",
        eventDate: "Aug 29, 2026",
        ticketUrl: "https://www.damai.cn",
        type: "concert",
      },
      {
        title: "K-pop Cover Dance Competition Shanghai",
        venue: "Xintiandi, 245 Ma Dang Rd, Huangpu",
        eventDate: "Sep 26, 2026",
        type: "festival",
      },
      {
        title: "Shanghai K-pop Fan Club Night",
        venue: "1933 Shanghai, 29 Shajing Rd, Hongkou",
        eventDate: "Monthly — check WeChat K-pop SH group",
        type: "meetup",
      },
    ],
  },
];

async function main() {
  console.log("Starting city events seed for all 20 remaining cities...\n");

  let totalCreated = 0;
  let totalDeleted = 0;

  for (const cd of cityData) {
    const city = await prisma.city.findUnique({ where: { slug: cd.slug } });
    if (!city) {
      console.warn(`⚠️  City not found: ${cd.slug} — skipping`);
      continue;
    }

    const deleted = await prisma.cityEvent.deleteMany({ where: { cityId: city.id } });
    let created = 0;

    for (const e of cd.events) {
      await prisma.cityEvent.create({
        data: {
          cityId: city.id,
          title: e.title,
          venue: e.venue,
          eventDate: e.eventDate,
          ticketUrl: e.ticketUrl ?? null,
          type: e.type,
        },
      });
      created++;
    }

    totalDeleted += deleted.count;
    totalCreated += created;
    console.log(`✅ ${city.name}: removed ${deleted.count} old → added ${created} events`);
  }

  console.log(`\n✅ Done! Removed ${totalDeleted} old events, created ${totalCreated} new events across ${cityData.length} cities.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
