import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CONTRIBUTORS } from "@/app/leaderboard/data";
import { T, LangToggle } from "@/components/LangProvider";

export const revalidate = 3600;

// ── City data ─────────────────────────────────────────────────────────────────
const CITY_DATA: Record<string, {
  name: string; country: string; flag: string; color: string;
  timezone: string; currency: string;
  description: string; descriptionEs?: string;
  concerts: { artist: string; venue: string; date: string; ticketUrl: string }[];
  meetups: { title: string; location: string; date: string; description: string; descriptionEs?: string; url?: string }[];
  hotels: { name: string; stars: number; note: string; noteEs?: string; area: string }[];
  communities: { name: string; platform: string; url: string; members: string }[];
  kpopSpots: { name: string; type: string; description: string; descriptionEs?: string }[];
}> = {
  "new-york": {
    name: "New York", country: "US", flag: "🇺🇸", color: "#e32636",
    timezone: "EST (UTC-5)", currency: "USD",
    description: "NYC is the US hub for K-pop events — from Times Square album drops to Flushing fan meetups. MSG, Barclays Center, and Radio City host major tours.",
    descriptionEs: "NYC es el centro del K-pop en Estados Unidos: desde lanzamientos de álbumes en Times Square hasta meetups de fans en Flushing. El MSG, el Barclays Center y el Radio City reciben las giras más grandes.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "MetLife Stadium, East Rutherford NJ", date: "Aug 1-2, 2026", ticketUrl: `https://www.ticketmaster.com/bts-world-tour-arirang-in-east-east-rutherford-new-jersey-08-01-2026/event/00006429EB39BB6F` },
      { artist: "aespa", venue: "UBS Arena, Belmont Park", date: "Sep 18, 2026", ticketUrl: `https://seatgeek.com/aespa-tickets` },
      { artist: "LE SSERAFIM", venue: "Prudential Center, Newark", date: "Oct 8, 2026", ticketUrl: `https://seatgeek.com/le-sserafim-tickets` },
      { artist: "STRAY KIDS", venue: "Madison Square Garden", date: "2025-08", ticketUrl: `https://seatgeek.com/search#?q=stray+kids` },
      { artist: "BLACKPINK", venue: "Barclays Center, Brooklyn", date: "2025-09", ticketUrl: `https://www.songkick.com/search?query=blackpink` },
    ],
    meetups: [
      { title: "NYC ARMY Meetup", location: "Central Park (Bethesda Fountain)", date: "Monthly", description: "Casual fan gathering with BTS trivia and album trading.", descriptionEs: "Encuentro relajado de fans con trivia de BTS e intercambio de álbumes.", url: "https://linktr.ee/popupgirlsnyc" },
      { title: "Flushing K-pop Night", location: "Flushing, Queens", date: "Bi-weekly Saturdays", description: "Dance covers, idol merch swap, and Korean BBQ crawl.", descriptionEs: "Dance covers, intercambio de merch de idols y ruta de BBQ coreano." },
    ],
    hotels: [
      { name: "Lotte New York Palace", stars: 5, note: "BTS members have stayed here during US tours", noteEs: "Miembros de BTS se han hospedado aquí durante sus giras por Estados Unidos", area: "Midtown Manhattan" },
      { name: "The Knickerbocker", stars: 4, note: "Walking distance to Times Square kpop stores", noteEs: "A pocos pasos de las tiendas de K-pop de Times Square", area: "Times Square" },
      { name: "Aloft Harlem", stars: 3, note: "Fan-favorite budget option near Korean restaurants", noteEs: "La opción económica favorita de las fans, cerca de restaurantes coreanos", area: "Harlem" },
    ],
    communities: [
      { name: "NYC K-pop", platform: "Reddit", url: "https://reddit.com/r/nycmeetups", members: "12k+" },
      { name: "NYC BLINK", platform: "Discord", url: "https://discord.gg", members: "3k+" },
      { name: "K-Pop in NYC", platform: "Facebook", url: "https://facebook.com/groups/kpopnyc", members: "8k+" },
    ],
    kpopSpots: [
      { name: "New World Mall (Flushing)", type: "Shopping", description: "Underground mall with K-pop merch vendors, boba shops, and Korean bakeries.", descriptionEs: "Plaza subterránea con puestos de merch de K-pop, boba y panaderías coreanas." },
      { name: "Koreatown 32nd St", type: "District", description: "NYC's K-town strip with norebang (karaoke), Korean BBQ, and fan shops.", descriptionEs: "El corredor del K-town neoyorquino con norebang (karaoke), BBQ coreano y tiendas para fans." },
      { name: "Line 9 Records", type: "Record Store", description: "K-pop album importer with rare photocards and limited editions.", descriptionEs: "Importador de álbumes de K-pop con photocards raras y ediciones limitadas." },
    ],
  },
  "los-angeles": {
    name: "Los Angeles", country: "US", flag: "🇺🇸", color: "#003594",
    timezone: "PST (UTC-8)", currency: "USD",
    description: "LA is the K-pop gateway to the US — home to HYBE America, SM Global, and the largest Korean-American community outside of Seoul.",
    descriptionEs: "LA es la puerta de entrada del K-pop a Estados Unidos: aquí están HYBE America, SM Global y la comunidad coreano-estadounidense más grande fuera de Seúl.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "SoFi Stadium, Inglewood", date: "Sep 1-6, 2026", ticketUrl: `https://www.ticketmaster.com/bts-world-tour-arirang-in-los-inglewood-california-09-01-2026/event/0A006429AB3C5EF1` },
      { artist: "aespa", venue: "Intuit Dome, Inglewood", date: "Oct 3, 2026", ticketUrl: `https://seatgeek.com/aespa-tickets` },
      { artist: "LE SSERAFIM", venue: "Crypto.com Arena", date: "Sep 16, 2026", ticketUrl: `https://seatgeek.com/le-sserafim-tickets` },
      { artist: "TWICE", venue: "Hollywood Bowl", date: "2025-08", ticketUrl: `https://www.songkick.com/search?query=twice` },
    ],
    meetups: [
      { title: "K-Town Stans Night", location: "Koreatown, LA", date: "First Friday", description: "Open fan meetup with dance covers and lightstick ocean.", descriptionEs: "Meetup abierto para fans con dance covers y océano de lightsticks." },
      { title: "K-pop Swap Meet", location: "Little Tokyo", date: "Monthly", description: "Trade albums, photocards, and fan goods.", descriptionEs: "Intercambia álbumes, photocards y artículos de fans." },
    ],
    hotels: [
      { name: "Marriott JW at L.A. LIVE", stars: 5, note: "Adjacent to Crypto.com Arena — idol groups often stay here for US shows", noteEs: "Junto al Crypto.com Arena: varios grupos de idols se hospedan aquí cuando tocan en Estados Unidos", area: "Downtown LA" },
      { name: "Line Hotel Koreatown", stars: 4, note: "Located in K-town, walkable to fan shops and Korean restaurants", noteEs: "En pleno K-town, caminando a tiendas para fans y restaurantes coreanos", area: "Koreatown" },
      { name: "Freehand Los Angeles", stars: 3, note: "Trendy, fan-friendly budget boutique near Wilshire", noteEs: "Hotel boutique económico y trendy cerca de Wilshire, ideal para fans", area: "Koreatown" },
    ],
    communities: [
      { name: "LA K-pop Fans", platform: "Facebook", url: "https://facebook.com/groups/lakpop", members: "15k+" },
      { name: "SoCal ONCE", platform: "Discord", url: "https://discord.gg", members: "5k+" },
    ],
    kpopSpots: [
      { name: "Koreatown (K-town)", type: "District", description: "The 2.7-mile Koreatown corridor with norebang, K-beauty, and merch stores.", descriptionEs: "El corredor de Koreatown, 4.3 km de norebang, K-beauty y tiendas de merch." },
      { name: "Hannam Chain Superstore", type: "Shopping", description: "K-pop albums, import snacks, and idol lifestyle goods.", descriptionEs: "Álbumes de K-pop, snacks importados y artículos de idols." },
    ],
  },
  "seoul": {
    name: "Seoul", country: "KR", flag: "🇰🇷", color: "#003478",
    timezone: "KST (UTC+9)", currency: "KRW (₩)",
    description: "The epicenter of K-pop. Home to HYBE, SM, YG, and JYP headquarters — you can literally walk past your bias's company building.",
    descriptionEs: "El epicentro del K-pop. Aquí están las sedes de HYBE, SM, YG y JYP: literalmente puedes pasar caminando frente al edificio de la compañía de tu bias.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Goyang Stadium, Goyang", date: "Apr 9-12, 2026", ticketUrl: `https://ibighit.com/en/bts/tour/` },
      { artist: "aespa", venue: "Gocheok Sky Dome", date: "Aug 7-8, 2026", ticketUrl: `https://seatgeek.com/aespa-tickets` },
      { artist: "(G)I-DLE", venue: "KSPO Dome", date: "Feb 21, 2026", ticketUrl: `https://seatgeek.com/i-dle-tickets` },
      { artist: "LE SSERAFIM", venue: "Inspire Arena, Incheon", date: "Jul 11-12, 2026", ticketUrl: `https://seatgeek.com/le-sserafim-tickets` },
      { artist: "Multiple Artists", venue: "KSPO Dome (Olympic Gymnastics Arena)", date: "Year-round", ticketUrl: `https://www.songkick.com/search?query=kpop+seoul` },
      { artist: "Multiple Artists", venue: "COEX Artium", date: "Year-round", ticketUrl: `https://seatgeek.com/search#?q=kpop+seoul` },
    ],
    meetups: [
      { title: "Hongdae Fan Street", location: "Hongdae, Seoul", date: "Daily (especially weekends)", description: "Busking, dance performances, and spontaneous fan gatherings outside YG and JYP buildings.", descriptionEs: "Busking, presentaciones de baile y encuentros espontáneos de fans afuera de los edificios de YG y JYP." },
      { title: "Inkigayo Filming Queue", location: "SBS HQ, Mapo-gu", date: "Sundays", description: "Fans line up to watch live idol performances at the weekly music show.", descriptionEs: "Las fans hacen fila para ver a los idols en vivo en el programa musical semanal." },
    ],
    hotels: [
      { name: "The Shilla Seoul", stars: 5, note: "Historic idol favorite in Namsan — many idols have been photographed here", noteEs: "Clásico favorito de los idols en Namsan: muchos han sido fotografiados aquí", area: "Jung-gu" },
      { name: "Signiel Seoul", stars: 5, note: "Located in Lotte World Tower — top-floor views and K-pop concert venue proximity", noteEs: "Dentro de la Lotte World Tower: vistas desde los pisos más altos y cerca de los recintos de conciertos de K-pop", area: "Songpa-gu" },
      { name: "Myeongdong Tmark Hotel", stars: 3, note: "Budget option in the shopping heart of Seoul", noteEs: "Opción económica en el corazón comercial de Seúl", area: "Myeongdong" },
    ],
    communities: [
      { name: "Seoul K-pop Tours", platform: "Instagram", url: "https://instagram.com", members: "200k+" },
      { name: "HanStan Discord", platform: "Discord", url: "https://discord.gg", members: "20k+" },
    ],
    kpopSpots: [
      { name: "HYBE INSIGHT Museum", type: "Museum", description: "Official HYBE artist exhibition and merch store. BTS artifacts and interactive K-pop experience.", descriptionEs: "Exhibición oficial de los artistas de HYBE y tienda de merch. Objetos de BTS y una experiencia K-pop interactiva." },
      { name: "SM TOWN COEX Artium", type: "Fan Space", description: "SM Entertainment's fan experience center with studios, merch, and themed cafés.", descriptionEs: "El centro de experiencias para fans de SM Entertainment, con estudios, merch y cafés temáticos." },
      { name: "Hongdae Street", type: "District", description: "Indie music, street performances, and surrounded by JYP & YG offices.", descriptionEs: "Música indie, presentaciones callejeras y las oficinas de JYP y YG a la vuelta." },
      { name: "Myeongdong K-pop Alley", type: "Shopping", description: "Dozens of merch shops selling albums, photocards, and lightsticks.", descriptionEs: "Decenas de tiendas de merch con álbumes, photocards y lightsticks." },
    ],
  },
  "tokyo": {
    name: "Tokyo", country: "JP", flag: "🇯🇵", color: "#bc002d",
    timezone: "JST (UTC+9)", currency: "JPY (¥)",
    description: "Japan is K-pop's largest overseas market. Tokyo sees exclusive Japanese releases, dedicated K-pop floors in Shibuya, and frequent sold-out dome tours.",
    descriptionEs: "Japón es el mercado más grande del K-pop fuera de Corea. Tokio tiene lanzamientos exclusivos en japonés, pisos enteros de K-pop en Shibuya y giras de domo que se agotan seguido.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Tokyo Dome", date: "Apr 17-18, 2026", ticketUrl: `https://ibighit.com/en/bts/tour/` },
      { artist: "(G)I-DLE", venue: "Yokohama Arena", date: "Jun 20, 2026", ticketUrl: `https://seatgeek.com/i-dle-tickets` },
      { artist: "TWICE", venue: "Saitama Super Arena", date: "2025 TBA", ticketUrl: `https://www.songkick.com/search?query=twice+japan` },
    ],
    meetups: [
      { title: "Shibuya K-pop Fans", location: "Tower Records Shibuya B1", date: "Monthly", description: "Album listening parties and idol trivia nights at the legendary record store.", descriptionEs: "Listening parties de álbumes y noches de trivia de idols en la legendaria tienda de discos." },
    ],
    hotels: [
      { name: "Park Hyatt Tokyo", stars: 5, note: "Iconic hotel in Shinjuku, favored by international artists on Japan tours", noteEs: "Hotel icónico en Shinjuku, el preferido de los artistas internacionales que giran por Japón", area: "Shinjuku" },
      { name: "Shibuya Excel Hotel Tokyu", stars: 4, note: "Steps from Tower Records and Shibuya K-pop shops", noteEs: "A unos pasos de Tower Records y de las tiendas de K-pop de Shibuya", area: "Shibuya" },
    ],
    communities: [
      { name: "Tokyo Kpop Lovers", platform: "Meetup", url: "https://meetup.com", members: "6k+" },
    ],
    kpopSpots: [
      { name: "Tower Records Shibuya — K-pop Floor", type: "Record Store", description: "Entire floor dedicated to K-pop imports with fan events and in-store signings.", descriptionEs: "Un piso entero dedicado a importaciones de K-pop, con eventos para fans y firmas en la tienda." },
      { name: "Shin-Okubo Koreatown", type: "District", description: "Tokyo's K-pop district with import stores, Korean food, and idol café pop-ups.", descriptionEs: "El barrio K-pop de Tokio, con tiendas de importación, comida coreana y cafés pop-up de idols." },
    ],
  },
  "london": {
    name: "London", country: "UK", flag: "🇬🇧", color: "#012169",
    timezone: "GMT (UTC+0)", currency: "GBP (£)",
    description: "Europe's biggest K-pop hub with dedicated fan clubs, the O2 Arena for major tours, and a growing K-town in New Malden.",
    descriptionEs: "El mayor centro del K-pop en Europa: fanclubs dedicados, el O2 Arena para las giras grandes y un K-town en crecimiento en New Malden.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Tottenham Hotspur Stadium", date: "Jul 6-7, 2026", ticketUrl: `https://www.ticketmaster.co.uk/bts-world-tour-arirang-in-london-london-07-07-2026/event/3500642CAF9145A0` },
      { artist: "aespa", venue: "The O2", date: "Jan 16, 2027", ticketUrl: `https://seatgeek.com/aespa-tickets` },
      { artist: "ENHYPEN", venue: "The O2", date: "Mar 9, 2027", ticketUrl: `https://seatgeek.com/enhypen-tickets` },
      { artist: "LE SSERAFIM", venue: "The O2", date: "Oct 16, 2026", ticketUrl: `https://seatgeek.com/le-sserafim-tickets` },
      { artist: "BLACKPINK", venue: "The O2", date: "2025 TBA", ticketUrl: `https://www.songkick.com/search?query=blackpink+london` },
      { artist: "STRAY KIDS", venue: "OVO Hydro (Glasgow) / O2 Arena", date: "2025", ticketUrl: `https://seatgeek.com/search#?q=stray+kids+uk` },
    ],
    meetups: [
      { title: "London K-pop Socials", location: "New Malden", date: "Monthly", description: "UK's Korean community hub — fan events and K-pop karaoke.", descriptionEs: "El corazón de la comunidad coreana del Reino Unido: eventos para fans y karaoke de K-pop." },
    ],
    hotels: [
      { name: "The Langham London", stars: 5, note: "Historic central London hotel, K-pop acts' top choice near Hyde Park", noteEs: "Hotel histórico en el centro de Londres, el favorito de los artistas de K-pop cerca de Hyde Park", area: "Marylebone" },
      { name: "citizenM Tower of London", stars: 4, note: "Modern, affordable near the O2 for concert-goers", noteEs: "Moderno y accesible cerca del O2, ideal si vas al concierto", area: "Tower Hill" },
    ],
    communities: [
      { name: "UK K-pop", platform: "Reddit", url: "https://reddit.com/r/ukkpop", members: "25k+" },
    ],
    kpopSpots: [
      { name: "New Malden Koreatown", type: "District", description: "Europe's largest Korean community with K-pop shops and Korean restaurants.", descriptionEs: "La comunidad coreana más grande de Europa, con tiendas de K-pop y restaurantes coreanos." },
      { name: "KPOP London (Oxford St)", type: "Store", description: "Dedicated K-pop store in central London with imports and fan goods.", descriptionEs: "Tienda dedicada al K-pop en el centro de Londres, con importaciones y artículos para fans." },
    ],
  },
  "bangkok": {
    name: "Bangkok", country: "TH", flag: "🇹🇭", color: "#a51931",
    timezone: "ICT (UTC+7)", currency: "THB (฿)",
    description: "Bangkok is Southeast Asia's K-pop epicenter. Lisa (BLACKPINK) is Thai, making the city a global focal point for Blinks and K-pop tourism.",
    descriptionEs: "Bangkok es el epicentro del K-pop en el sudeste asiático. Lisa (BLACKPINK) es tailandesa, lo que convierte a la ciudad en un punto de referencia mundial para las Blinks y el turismo K-pop.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Rajamangala National Stadium", date: "Dec 3-6, 2026", ticketUrl: `https://ibighit.com/en/bts/tour/` },
      { artist: "ATEEZ", venue: "IMPACT Exhibition Hall 5-6", date: "Apr 4, 2026", ticketUrl: `https://www.ateezlive.com/asia/` },
      { artist: "BLACKPINK / Lisa", venue: "Impact Arena", date: "2025 TBA", ticketUrl: `https://www.songkick.com/search?query=lisa+blackpink+bangkok` },
    ],
    meetups: [
      { title: "Bangkok Blink Meetup", location: "Siam Square", date: "Monthly", description: "BLACKPINK fan community meet with dance covers and album sharing.", descriptionEs: "Encuentro de la comunidad de fans de BLACKPINK con dance covers e intercambio de álbumes." },
    ],
    hotels: [
      { name: "Capella Bangkok", stars: 5, note: "Top riverfront luxury — idol-level accommodation", noteEs: "Lujo frente al río: hospedaje nivel idol", area: "Charoennakorn" },
      { name: "Centara Grand at CentralWorld", stars: 5, note: "Adjacent to major concert venues and shopping malls", noteEs: "Junto a los principales recintos de conciertos y centros comerciales", area: "Ratchaprasong" },
    ],
    communities: [
      { name: "Thailand K-pop Fans", platform: "Facebook", url: "https://facebook.com/groups/thaiblink", members: "40k+" },
    ],
    kpopSpots: [
      { name: "Siam Square K-pop Alley", type: "District", description: "Bangkok's youth culture district with K-pop merch shops and dance studios.", descriptionEs: "El barrio de la cultura juvenil de Bangkok, con tiendas de merch de K-pop y estudios de baile." },
    ],
  },
  "paris": {
    name: "Paris", country: "FR", flag: "🇫🇷", color: "#002395",
    timezone: "CET (UTC+1)", currency: "EUR (€)",
    description: "Paris hosts some of K-pop's most iconic events — from BLACKPINK's Palace of Versailles concert to BTS's Accor Arena shows.",
    descriptionEs: "París ha sido sede de algunos de los eventos más icónicos del K-pop: desde el concierto de BLACKPINK en el Palacio de Versalles hasta los shows de BTS en el Accor Arena.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Stade de France, Saint-Denis", date: "Jul 17-18, 2026", ticketUrl: `https://www.ticketmaster.fr/fr/manifestation/bts-world-tour-arirang-in-paris-billet/idmanif/647775/idtier/18864121` },
      { artist: "ENHYPEN", venue: "Plenitude Arena, Nanterre", date: "Feb 27, 2027", ticketUrl: `https://seatgeek.com/enhypen-tickets` },
      { artist: "LE SSERAFIM", venue: "Accor Arena", date: "Oct 21, 2026", ticketUrl: `https://seatgeek.com/le-sserafim-tickets` },
      { artist: "K-pop tours", venue: "Accor Arena (Bercy)", date: "Various 2025", ticketUrl: `https://www.songkick.com/search?query=kpop+paris` },
    ],
    meetups: [
      { title: "Paris K-pop Fan Day", location: "Place de la République", date: "Quarterly", description: "Dance covers, album giveaways, and community picnic.", descriptionEs: "Dance covers, sorteos de álbumes y picnic comunitario." },
    ],
    hotels: [
      { name: "Hôtel Le Meurice", stars: 5, note: "Palace hotel — BLACKPINK's base during Paris Fashion Week collabs", noteEs: "Hotel palacio: la base de BLACKPINK durante sus colaboraciones en la Paris Fashion Week", area: "1st arrondissement" },
      { name: "Generator Paris", stars: 3, note: "Fan-friendly hostel near Canal Saint-Martin", noteEs: "Hostal ideal para fans cerca del Canal Saint-Martin", area: "10th arrondissement" },
    ],
    communities: [
      { name: "K-pop France", platform: "Discord", url: "https://discord.gg/kpopfrance", members: "18k+" },
    ],
    kpopSpots: [
      { name: "K-Star Paris (Opéra)", type: "Store", description: "Largest dedicated K-pop shop in France with rare imports and photocards.", descriptionEs: "La tienda de K-pop más grande de Francia, con importaciones raras y photocards." },
    ],
  },
  "mexico-city": {
    name: "Mexico City", country: "MX", flag: "🇲🇽", color: "#006847",
    timezone: "CST (UTC-6)", currency: "MXN ($)",
    description: "Latin America's K-pop capital. CDMX fans are known for their legendary fancams and massive fan-organized lightstick oceans.",
    descriptionEs: "La capital del K-pop en Latinoamérica. Las fans de la CDMX son famosas por sus fancams legendarias y por los océanos de lightsticks que organizan ellas mismas.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Estadio GNP Seguros", date: "May 7-10, 2026", ticketUrl: `https://ibighit.com/en/bts/tour/` },
      { artist: "aespa", venue: "Palacio de los Deportes", date: "Sep 11, 2026", ticketUrl: `https://seatgeek.com/aespa-tickets` },
      { artist: "ENHYPEN", venue: "Arena CDMX", date: "Jul 11-15, 2026", ticketUrl: `https://seatgeek.com/enhypen-tickets` },
      { artist: "BTS Members / Solo", venue: "Foro Sol", date: "2025 TBA", ticketUrl: `https://www.songkick.com/search?query=kpop+mexico` },
    ],
    meetups: [
      { title: "CDMX Stan Network", location: "Parque España, Condesa", date: "Monthly", description: "Open fan meeting with dance battles and idol trivia.", descriptionEs: "Meetup abierto con batallas de baile y trivia de idols.", url: "https://linktr.ee/Bernalkpop" },
    ],
    hotels: [
      { name: "Four Seasons Mexico City", stars: 5, note: "K-pop artists' top accommodation on Latin American tours", noteEs: "El hospedaje favorito de los artistas de K-pop cuando giran por Latinoamérica", area: "Paseo de la Reforma" },
      { name: "Hotel Camino Real Polanco", stars: 4, note: "Major concert venue proximity and fan-friendly", noteEs: "Cerquita de los principales recintos de conciertos y muy buena onda con las fans", area: "Polanco" },
    ],
    communities: [
      { name: "K-pop México", platform: "Facebook", url: "https://facebook.com/groups/kpopmexico", members: "60k+" },
    ],
    kpopSpots: [
      { name: "K-pop Store CDMX (Centro)", type: "Store", description: "Ground zero for K-pop merchandise in Mexico with imports and exclusives.", descriptionEs: "El punto cero del merch de K-pop en México, con importaciones y exclusivas." },
    ],
  },
  "chicago": {
    name: "Chicago", country: "US", flag: "🇺🇸", color: "#00b5e2",
    timezone: "CST (UTC-6)", currency: "USD",
    description: "Chicago's United Center and Wintrust Arena draw major K-pop tours, while the city's Korean community in north suburbs supports a growing fan scene.",
    descriptionEs: "El United Center y el Wintrust Arena de Chicago atraen a las grandes giras de K-pop, mientras que la comunidad coreana de los suburbios del norte sostiene una escena de fans en crecimiento.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Soldier Field", date: "Aug 27-28, 2026", ticketUrl: `https://www.ticketmaster.com/bts-world-tour-arirang-in-chicago-chicago-illinois-08-27-2026/event/0400642ACBBD5D44` },
      { artist: "LE SSERAFIM", venue: "United Center", date: "Oct 2, 2026", ticketUrl: `https://seatgeek.com/le-sserafim-tickets` },
      { artist: "Multiple", venue: "United Center", date: "2025 various", ticketUrl: `https://seatgeek.com/search#?q=kpop+chicago` },
    ],
    meetups: [
      { title: "Chicago ARMY", location: "Millennium Park", date: "Summer weekends", description: "Outdoor BTS listening parties and dance covers.", descriptionEs: "Listening parties de BTS al aire libre y dance covers." },
    ],
    hotels: [
      { name: "Loews Chicago Hotel", stars: 4, note: "Fan-preferred hotel near United Center concert venue", noteEs: "El hotel preferido de las fans cerca del United Center", area: "Streeterville" },
      { name: "Chicago Athletic Association Hotel", stars: 4, note: "Boutique option in the Loop near K-pop venues", noteEs: "Opción boutique en el Loop, cerca de los recintos donde toca el K-pop", area: "The Loop" },
    ],
    communities: [
      { name: "Chicago K-pop", platform: "Meetup", url: "https://meetup.com", members: "3k+" },
    ],
    kpopSpots: [
      { name: "H Mart Niles", type: "Shopping", description: "Korean supermarket with K-pop albums, snacks, and fan goods.", descriptionEs: "Supermercado coreano con álbumes de K-pop, snacks y artículos para fans." },
    ],
  },
  "dallas": {
    name: "Dallas", country: "US", flag: "🇺🇸", color: "#003594",
    timezone: "CST (UTC-6)", currency: "USD",
    description: "DFW is Texas's K-pop hub with one of the fastest-growing Korean-American communities and American Airlines Center for major tours.",
    descriptionEs: "DFW es el centro del K-pop en Texas, con una de las comunidades coreano-estadounidenses de más rápido crecimiento y el American Airlines Center para las giras grandes.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "AT&T Stadium, Arlington", date: "Aug 15-16, 2026", ticketUrl: `https://seatgeek.com/bts-tickets/arlington-texas-at-t-stadium-2026-08-15-8-pm/concert/17975621` },
      { artist: "aespa", venue: "American Airlines Center", date: "Sep 29, 2026", ticketUrl: `https://seatgeek.com/aespa-tickets` },
      { artist: "ENHYPEN", venue: "American Airlines Center", date: "Jul 17-18, 2026", ticketUrl: `https://seatgeek.com/enhypen-tickets` },
      { artist: "LE SSERAFIM", venue: "Dickies Arena, Fort Worth", date: "Sep 27, 2026", ticketUrl: `https://seatgeek.com/le-sserafim-tickets` },
      { artist: "Multiple", venue: "American Airlines Center", date: "2025 various", ticketUrl: `https://seatgeek.com/search#?q=kpop+dallas` },
    ],
    meetups: [
      { title: "DFW K-pop Meet", location: "Koreatown (Dallas)", date: "Monthly", description: "Fan community gathering with album swaps and Korean food.", descriptionEs: "Encuentro de la comunidad de fans con intercambio de álbumes y comida coreana." },
    ],
    hotels: [
      { name: "Omni Dallas Hotel", stars: 4, note: "Convention center connected — used by K-pop acts performing downtown", noteEs: "Conectado al centro de convenciones: lo usan los artistas de K-pop que se presentan en el downtown", area: "Downtown Dallas" },
    ],
    communities: [
      { name: "DFW K-pop Fans", platform: "Facebook", url: "https://facebook.com/groups/dfwkpop", members: "5k+" },
    ],
    kpopSpots: [
      { name: "Carrollton Koreatown", type: "District", description: "DFW's Korean cultural center with K-pop shops and restaurants.", descriptionEs: "El centro cultural coreano de DFW, con tiendas de K-pop y restaurantes." },
    ],
  },
  "tampa": {
    name: "Tampa", country: "US", flag: "🇺🇸", color: "#d50032",
    timezone: "EST (UTC-5)", currency: "USD",
    description: "Tampa's Amalie Arena draws K-pop tours on the US Southeast circuit. Growing fan community in the Bay Area.",
    descriptionEs: "El Amalie Arena de Tampa recibe las giras de K-pop del circuito del sureste de Estados Unidos. La comunidad de fans de la bahía va en crecimiento.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Raymond James Stadium", date: "Apr 25-28, 2026", ticketUrl: `https://ibighit.com/en/bts/tour/` },
      { artist: "Multiple", venue: "Amalie Arena", date: "2025 various", ticketUrl: `https://seatgeek.com/search#?q=kpop+tampa` },
    ],
    meetups: [
      { title: "Tampa Bay K-pop", location: "Ybor City", date: "Bi-monthly", description: "Fan meetups in historic Tampa district.", descriptionEs: "Meetups de fans en el barrio histórico de Tampa." },
    ],
    hotels: [
      { name: "JW Marriott Tampa Water Street", stars: 5, note: "Premier Tampa hotel near Amalie Arena concert venue", noteEs: "El mejor hotel de Tampa, cerca del Amalie Arena", area: "Downtown Tampa" },
    ],
    communities: [
      { name: "Tampa K-pop Fans", platform: "Discord", url: "https://discord.gg", members: "1k+" },
    ],
    kpopSpots: [
      { name: "H Mart Tampa", type: "Shopping", description: "Korean supermarket with K-pop section in the Bay Area.", descriptionEs: "Supermercado coreano con sección de K-pop en la zona de la bahía." },
    ],
  },
  "boston": {
    name: "Boston", country: "US", flag: "🇺🇸", color: "#00a0dc",
    timezone: "EST (UTC-5)", currency: "USD",
    description: "Boston's TD Garden hosts major K-pop tours, with MIT and Harvard Korean student associations running active fan communities.",
    descriptionEs: "El TD Garden de Boston recibe las grandes giras de K-pop, y las asociaciones de estudiantes coreanos del MIT y Harvard mantienen comunidades de fans muy activas.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Gillette Stadium, Foxborough", date: "Aug 5-6, 2026", ticketUrl: `https://www.ticketmaster.com/bts-world-tour-arirang-in-foxborough-foxborough-massachusetts-08-05-2026/event/0100642CBD7AB56B` },
      { artist: "Multiple", venue: "TD Garden", date: "2025 various", ticketUrl: `https://seatgeek.com/search#?q=kpop+boston` },
    ],
    meetups: [
      { title: "Harvard Square K-pop", location: "Harvard Square, Cambridge", date: "Monthly", description: "University fan community meetup with trivia and merch trading.", descriptionEs: "Meetup de la comunidad de fans universitarias con trivia e intercambio de merch." },
    ],
    hotels: [
      { name: "The Verb Hotel", stars: 4, note: "Music-themed boutique hotel near Fenway", noteEs: "Hotel boutique con temática musical cerca de Fenway", area: "Fenway" },
    ],
    communities: [
      { name: "Boston K-pop Society", platform: "Discord", url: "https://discord.gg", members: "2k+" },
    ],
    kpopSpots: [
      { name: "Allston Korean Restaurants", type: "District", description: "Boston's mini Koreatown with Korean food and informal fan meeting spots.", descriptionEs: "El mini Koreatown de Boston, con comida coreana y puntos informales de reunión para fans." },
    ],
  },
  "scottsdale": {
    name: "Scottsdale", country: "US", flag: "🇺🇸", color: "#f5a623",
    timezone: "MST (UTC-7)", currency: "USD",
    description: "Scottsdale's Desert Diamond Arena and Phoenix-area venues are increasingly on K-pop tour routes in the Southwest.",
    descriptionEs: "El Desert Diamond Arena de Scottsdale y los recintos del área de Phoenix aparecen cada vez más en las rutas de giras de K-pop por el suroeste.",
    concerts: [
      { artist: "LE SSERAFIM", venue: "Mortgage Matchup Center, Phoenix", date: "Sep 25, 2026", ticketUrl: `https://seatgeek.com/le-sserafim-tickets` },
      { artist: "Multiple", venue: "Footprint Center (Phoenix)", date: "2025 various", ticketUrl: `https://seatgeek.com/search#?q=kpop+phoenix` },
    ],
    meetups: [
      { title: "Arizona K-pop Fans", location: "Old Town Scottsdale", date: "Quarterly", description: "Desert state fan community gathering.", descriptionEs: "Encuentro de la comunidad de fans del estado del desierto." },
    ],
    hotels: [
      { name: "The Phoenician, Scottsdale", stars: 5, note: "Luxury resort used by touring artists in the Phoenix metro", noteEs: "Resort de lujo que usan los artistas en gira por el área metropolitana de Phoenix", area: "Camelback Mountain" },
    ],
    communities: [
      { name: "AZ K-pop", platform: "Facebook", url: "https://facebook.com/groups/arizonakpop", members: "3k+" },
    ],
    kpopSpots: [
      { name: "Mitsuwa Marketplace (Tempe)", type: "Shopping", description: "Japanese/Korean market with imported K-pop albums nearby.", descriptionEs: "Mercado japonés y coreano con álbumes de K-pop importados a la vuelta." },
    ],
  },
  "sao-paulo": {
    name: "São Paulo", country: "BR", flag: "🇧🇷", color: "#009c3b",
    timezone: "BRT (UTC-3)", currency: "BRL (R$)",
    description: "Brazil's megacity has the largest K-pop fanbase in Latin America. KCON Brazil draws tens of thousands, and fan clubs here are legendary for energy.",
    descriptionEs: "La megaciudad brasileña tiene el fandom de K-pop más grande de Latinoamérica. La KCON Brasil convoca a decenas de miles y los fanclubs de aquí son legendarios por su energía.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Estádio MorumBIS", date: "Oct 23-28, 2026", ticketUrl: `https://ibighit.com/en/bts/tour/` },
      { artist: "aespa", venue: "Mercado Livre Arena Pacaembu", date: "Sep 4, 2026", ticketUrl: `https://seatgeek.com/aespa-tickets` },
      { artist: "ENHYPEN", venue: "Nubank Parque", date: "Jul 4, 2026", ticketUrl: `https://seatgeek.com/enhypen-tickets` },
      { artist: "K-pop tours", venue: "Allianz Parque", date: "2025 TBA", ticketUrl: `https://www.songkick.com/search?query=kpop+sao+paulo` },
    ],
    meetups: [
      { title: "São Paulo K-pop Festival", location: "Parque do Ibirapuera", date: "Annual + monthly", description: "The biggest informal K-pop fan gathering in South America.", descriptionEs: "El encuentro informal de fans de K-pop más grande de Sudamérica." },
    ],
    hotels: [
      { name: "Tivoli Mofarrej São Paulo", stars: 5, note: "Touring acts' top pick in São Paulo", noteEs: "El favorito de los artistas en gira por São Paulo", area: "Jardins" },
    ],
    communities: [
      { name: "K-pop Brasil", platform: "Facebook", url: "https://facebook.com/groups/kpopbrasil", members: "200k+" },
    ],
    kpopSpots: [
      { name: "Liberdade (Japanese-Korean District)", type: "District", description: "São Paulo's Asian cultural district with K-pop shops, Korean restaurants, and fan events.", descriptionEs: "El barrio de cultura asiática de São Paulo, con tiendas de K-pop, restaurantes coreanos y eventos para fans." },
    ],
  },
  "buenos-aires": {
    name: "Buenos Aires", country: "AR", flag: "🇦🇷", color: "#74acdf",
    timezone: "ART (UTC-3)", currency: "ARS ($)",
    description: "BA's passionate K-pop fans fill Movistar Arena and organize some of South America's most creative fan art and choreography projects.",
    descriptionEs: "Las fans de K-pop de Buenos Aires llenan el Movistar Arena y arman algunos de los proyectos de fan art y coreografía más creativos de Sudamérica.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Estadio Único, La Plata", date: "Oct 21-24, 2026", ticketUrl: `https://ibighit.com/en/bts/tour/` },
      { artist: "Multiple", venue: "Movistar Arena", date: "2025 TBA", ticketUrl: `https://www.songkick.com/search?query=kpop+buenos+aires` },
    ],
    meetups: [
      { title: "Buenos Aires Stan Night", location: "Palermo Soho", date: "Monthly", description: "Argentine K-pop fan gathering with dance covers and merchandise.", descriptionEs: "Encuentro de fans argentinas del K-pop con dance covers y merch.", url: "https://linktr.ee/uriche.stream" },
    ],
    hotels: [
      { name: "Alvear Palace Hotel", stars: 5, note: "Buenos Aires grand palace, major touring acts' accommodation", noteEs: "El gran palacio porteño, donde se hospedan los artistas de las giras grandes", area: "Recoleta" },
    ],
    communities: [
      { name: "K-pop Argentina", platform: "Twitter/X", url: "https://x.com/kpoparg", members: "15k+" },
    ],
    kpopSpots: [
      { name: "Once District K-pop Store", type: "Store", description: "Leading K-pop import shop serving the Argentine fan community.", descriptionEs: "La principal tienda de importación de K-pop para el fandom argentino." },
    ],
  },
  "madrid": {
    name: "Madrid", country: "ES", flag: "🇪🇸", color: "#aa151b",
    timezone: "CET (UTC+1)", currency: "EUR (€)",
    description: "Spain's K-pop scene is booming with the Wizink Center hosting tours and a passionate Spanish ARMY community.",
    descriptionEs: "La escena del K-pop en España está explotando: el Wizink Center recibe giras y el ARMY español es de los más apasionados.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Riyadh Air Metropolitano", date: "Jun 26-27, 2026", ticketUrl: `https://ibighit.com/en/bts/tour/` },
      { artist: "Multiple", venue: "WiZink Center", date: "2025 TBA", ticketUrl: `https://www.songkick.com/search?query=kpop+madrid` },
    ],
    meetups: [
      { title: "Madrid K-pop Fans", location: "Retiro Park", date: "Monthly", description: "Spanish fan community outdoor meetup.", descriptionEs: "Meetup al aire libre de la comunidad de fans española." },
    ],
    hotels: [
      { name: "Rosewood Villa Magna", stars: 5, note: "Madrid luxury hotel used by international touring acts", noteEs: "Hotel de lujo en Madrid donde se hospedan los artistas internacionales en gira", area: "Paseo de la Castellana" },
    ],
    communities: [
      { name: "K-pop España", platform: "Discord", url: "https://discord.gg/kpopes", members: "8k+" },
    ],
    kpopSpots: [
      { name: "K-pop Music Madrid (Gran Vía)", type: "Store", description: "Dedicated K-pop store with albums, lightsticks, and fan goods.", descriptionEs: "Tienda dedicada al K-pop con álbumes, lightsticks y artículos para fans." },
    ],
  },
  "milan": {
    name: "Milan", country: "IT", flag: "🇮🇹", color: "#009246",
    timezone: "CET (UTC+1)", currency: "EUR (€)",
    description: "Milan's fashion week draws K-pop artists as brand ambassadors, and the Mediolanum Forum hosts major tours.",
    descriptionEs: "La semana de la moda de Milán atrae a artistas de K-pop como embajadores de marca, y el Mediolanum Forum recibe las giras grandes.",
    concerts: [
      { artist: "aespa", venue: "Unipol Dome", date: "Jan 29, 2027", ticketUrl: `https://seatgeek.com/aespa-tickets` },
      { artist: "ENHYPEN", venue: "Unipol Dome", date: "Feb 24, 2027", ticketUrl: `https://seatgeek.com/enhypen-tickets` },
      { artist: "Multiple", venue: "Mediolanum Forum", date: "2025 TBA", ticketUrl: `https://www.songkick.com/search?query=kpop+milan` },
    ],
    meetups: [
      { title: "Milan K-pop Night", location: "Navigli District", date: "Quarterly", description: "Italian fans gather for K-pop karaoke and fan art exhibitions.", descriptionEs: "Las fans italianas se reúnen para karaoke de K-pop y exposiciones de fan art." },
    ],
    hotels: [
      { name: "Bulgari Hotel Milan", stars: 5, note: "Fashion-week hotel where K-pop brand ambassadors stay for Milan shows", noteEs: "El hotel de la semana de la moda donde se hospedan los embajadores de marca del K-pop cuando hay desfiles en Milán", area: "Montenapoleone" },
    ],
    communities: [
      { name: "K-pop Italia", platform: "Facebook", url: "https://facebook.com/groups/kpopitalia", members: "12k+" },
    ],
    kpopSpots: [
      { name: "K-pop Store Milano (Duomo)", type: "Store", description: "Central Milan K-pop import shop near the famous cathedral.", descriptionEs: "Tienda de importación de K-pop en el centro de Milán, cerca de la famosa catedral." },
    ],
  },
  "dubai": {
    name: "Dubai", country: "AE", flag: "🇦🇪", color: "#009a44",
    timezone: "GST (UTC+4)", currency: "AED (د.إ)",
    description: "Dubai is the Middle East's K-pop hub with Coca-Cola Arena hosting major acts and a large Korean expat and fan community.",
    descriptionEs: "Dubái es el centro del K-pop en Medio Oriente: el Coca-Cola Arena recibe a los grandes artistas y hay una amplia comunidad de expatriados coreanos y de fans.",
    concerts: [
      { artist: "Multiple", venue: "Coca-Cola Arena", date: "2025 TBA", ticketUrl: `https://www.songkick.com/search?query=kpop+dubai` },
    ],
    meetups: [
      { title: "Dubai K-pop Fans", location: "Dubai Mall", date: "Monthly", description: "Fan community gathering at the world's largest mall.", descriptionEs: "Encuentro de la comunidad de fans en el centro comercial más grande del mundo." },
    ],
    hotels: [
      { name: "Burj Al Arab", stars: 5, note: "Iconic ultra-luxury resort where K-pop acts filming in Dubai stay", noteEs: "Resort icónico de ultralujo donde se hospedan los artistas de K-pop que graban en Dubái", area: "Jumeirah Beach" },
      { name: "Atlantis The Palm", stars: 5, note: "Fan-favorite K-pop artist accommodation in Dubai", noteEs: "El hospedaje de artistas de K-pop favorito de las fans en Dubái", area: "Palm Jumeirah" },
    ],
    communities: [
      { name: "UAE K-pop", platform: "Facebook", url: "https://facebook.com/groups/uaekpop", members: "8k+" },
    ],
    kpopSpots: [
      { name: "Korea Plaza, Dubai", type: "Cultural Center", description: "Korean cultural center with K-pop events and Korean food.", descriptionEs: "Centro cultural coreano con eventos de K-pop y comida coreana." },
    ],
  },
  "manila": {
    name: "Manila", country: "PH", flag: "🇵🇭", color: "#0038a8",
    timezone: "PHT (UTC+8)", currency: "PHP (₱)",
    description: "Philippine fans are among K-pop's most dedicated. Manila's MOA Arena and Philippine Arena draw massive sell-out crowds.",
    descriptionEs: "Las fans filipinas están entre las más dedicadas del K-pop. El MOA Arena y el Philippine Arena de Manila convocan multitudes y agotan entradas.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Philippine Sports Stadium, Bulacan", date: "Mar 13-16, 2027", ticketUrl: `https://ibighit.com/en/bts/tour/` },
      { artist: "ATEEZ", venue: "Smart Araneta Coliseum", date: "Mar 14, 2026", ticketUrl: `https://www.ateezlive.com/asia/` },
      { artist: "Multiple", venue: "Mall of Asia Arena", date: "Year-round", ticketUrl: `https://www.songkick.com/search?query=kpop+manila` },
    ],
    meetups: [
      { title: "Manila Fan Assembly", location: "BGC, Taguig", date: "Monthly", description: "K-pop fan gathering in Bonifacio Global City.", descriptionEs: "Encuentro de fans del K-pop en Bonifacio Global City." },
    ],
    hotels: [
      { name: "Conrad Manila", stars: 5, note: "Bay-view luxury hotel near SMX Convention Center and MOA Arena", noteEs: "Hotel de lujo con vista a la bahía, cerca del SMX Convention Center y el MOA Arena", area: "Pasay" },
    ],
    communities: [
      { name: "Philippines K-pop", platform: "Facebook", url: "https://facebook.com/groups/philippineskpop", members: "500k+" },
    ],
    kpopSpots: [
      { name: "SM Mall of Asia K-pop Section", type: "Shopping", description: "Dedicated K-pop album and merchandise sections in the massive mall.", descriptionEs: "Secciones dedicadas a álbumes y merch de K-pop dentro del enorme centro comercial." },
    ],
  },
  "kuala-lumpur": {
    name: "Kuala Lumpur", country: "MY", flag: "🇲🇾", color: "#cc0001",
    timezone: "MYT (UTC+8)", currency: "MYR (RM)",
    description: "KL's Axiata Arena is Southeast Asia's premier concert venue, hosting dozens of K-pop acts annually. Malaysia's fan community is highly organized.",
    descriptionEs: "El Axiata Arena de KL es el recinto de conciertos más importante del sudeste asiático y recibe a decenas de artistas de K-pop al año. El fandom malayo es de los más organizados.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Stadium Nasional Bukit Jalil", date: "Dec 12-13, 2026", ticketUrl: "https://ibighit.com/en/bts/tour/" },
      { artist: "ATEEZ", venue: "Axiata Arena", date: "Mar 22, 2026", ticketUrl: `https://www.ateezlive.com/asia/` },
      { artist: "Multiple", venue: "Axiata Arena", date: "Year-round", ticketUrl: `https://www.songkick.com/search?query=kpop+kuala+lumpur` },
    ],
    meetups: [
      { title: "KL K-pop Community", location: "KLCC Park", date: "Monthly", description: "Fan meetup near the Petronas Towers.", descriptionEs: "Meetup de fans junto a las Torres Petronas." },
    ],
    hotels: [
      { name: "Mandarin Oriental KL", stars: 5, note: "KLCC luxury hotel, K-pop acts' go-to during Malaysian shows", noteEs: "Hotel de lujo en KLCC, el preferido de los artistas de K-pop cuando tocan en Malasia", area: "KLCC" },
    ],
    communities: [
      { name: "Malaysia K-pop", platform: "Facebook", url: "https://facebook.com/groups/mykpop", members: "80k+" },
    ],
    kpopSpots: [
      { name: "Pavilion KL K-pop Section", type: "Shopping", description: "K-pop merchandise and album stores in the premium Pavilion Mall.", descriptionEs: "Tiendas de merch y álbumes de K-pop dentro del exclusivo Pavilion Mall." },
    ],
  },
  "shanghai": {
    name: "Shanghai", country: "CN", flag: "🇨🇳", color: "#de2910",
    timezone: "CST (UTC+8)", currency: "CNY (¥)",
    description: "Shanghai hosts major K-pop concerts at Mercedes-Benz Arena, and China's enormous fanbase makes it one of the most commercially significant K-pop markets.",
    descriptionEs: "Shanghái recibe los grandes conciertos de K-pop en el Mercedes-Benz Arena, y el enorme fandom chino lo convierte en uno de los mercados más importantes comercialmente para el K-pop.",
    concerts: [
      { artist: "Multiple", venue: "Mercedes-Benz Arena", date: "Various", ticketUrl: `https://www.songkick.com/search?query=kpop+shanghai` },
    ],
    meetups: [
      { title: "Shanghai K-pop Fan Day", location: "People's Square", date: "Monthly", description: "Fan community gathering with Chinese K-pop fan club organizing.", descriptionEs: "Encuentro de la comunidad de fans organizado por los fanclubs chinos de K-pop." },
    ],
    hotels: [
      { name: "The Peninsula Shanghai", stars: 5, note: "Iconic Bund hotel, K-pop artists' top choice in Shanghai", noteEs: "Hotel icónico del Bund, el favorito de los artistas de K-pop en Shanghái", area: "The Bund" },
    ],
    communities: [
      { name: "China K-pop Station", platform: "Weibo", url: "https://weibo.com", members: "1M+" },
    ],
    kpopSpots: [
      { name: "Gubei Korean Town", type: "District", description: "Shanghai's Korean expatriate community with K-pop shops and restaurants.", descriptionEs: "La comunidad de expatriados coreanos de Shanghái, con tiendas de K-pop y restaurantes." },
    ],
  },
  "puebla": {
    name: "Puebla", country: "MX", flag: "🇲🇽", color: "#B0323C",
    timezone: "CST (UTC-6)", currency: "MXN ($)",
    description: "One of Mexico's most active K-pop dance-cover scenes. Puebla's plazas fill with random-play-dance circles most weekends, and CDMX arena tours are a short trip away.",
    descriptionEs: "Una de las escenas de dance cover de K-pop más activas de México. Las plazas de Puebla se llenan de círculos de random play dance casi todos los fines de semana, y las giras en las arenas de la CDMX quedan a un viaje corto.",
    concerts: [
      { artist: "K-pop world tours", venue: "Major arenas & stadiums", date: "Check current listings", ticketUrl: "https://www.songkick.com/search?query=kpop+puebla" },
    ],
    meetups: [
      { title: "Puebla K-pop Meetup", location: "Zócalo (Plaza de Armas)", date: "Monthly", description: "Casual fan gathering with random play dance, album swaps, and photocard trading.", descriptionEs: "Encuentro relajado de fans con random play dance, intercambio de álbumes y de photocards." },
      { title: "Angelópolis Dance Crew", location: "Parque Metropolitano", date: "Bi-weekly Sundays", description: "Open K-pop dance-cover practice — all levels welcome.", descriptionEs: "Práctica abierta de dance cover de K-pop: todos los niveles son bienvenidos." },
    ],
    hotels: [
      { name: "Grand Fiesta Americana Puebla", stars: 5, note: "Central Angelópolis base near the malls fans gather at", noteEs: "Base céntrica en Angelópolis, cerca de las plazas donde se juntan las fans", area: "Angelópolis" },
    ],
    communities: [
      { name: "K-pop Puebla (fan groups)", platform: "Facebook", url: "https://www.facebook.com/search/groups?q=kpop%20puebla", members: "Active" },
    ],
    kpopSpots: [
      { name: "Anime & K-pop merch stalls", type: "Shopping", description: "Hunt albums, photocards, and lightsticks in the city's anime and Asian-goods shops.", descriptionEs: "Caza álbumes, photocards y lightsticks en las tiendas de anime y artículos asiáticos de la ciudad." },
    ],
  },
  "tijuana": {
    name: "Tijuana", country: "MX", flag: "🇲🇽", color: "#E4572E",
    timezone: "PST (UTC-8)", currency: "MXN ($)",
    description: "A border-city K-pop scene split between Mexico and Southern California — Tijuana fans cross to San Diego and LA shows while building a lively local dance-cover community.",
    descriptionEs: "Una escena K-pop de ciudad fronteriza, repartida entre México y el sur de California: las fans de Tijuana cruzan a los shows de San Diego y LA mientras arman una comunidad local de dance cover bien viva.",
    concerts: [
      { artist: "K-pop world tours", venue: "Major arenas & stadiums", date: "Check current listings", ticketUrl: "https://www.songkick.com/search?query=kpop+tijuana" },
    ],
    meetups: [
      { title: "Tijuana K-pop Fan Meet", location: "Parque Teniente Guerrero", date: "Monthly", description: "Open-air fan meetup with games, trivia, and merch trading.", descriptionEs: "Meetup de fans al aire libre con juegos, trivia e intercambio de merch." },
      { title: "TJ Random Play Dance", location: "Plaza Río Tijuana", date: "First Saturday", description: "Random play dance circle — jump in when your bias's song drops.", descriptionEs: "Círculo de random play dance: métete cuando suene la canción de tu bias." },
    ],
    hotels: [
      { name: "Grand Hotel Tijuana", stars: 4, note: "Landmark towers near Zona Río where fans gather", noteEs: "Las torres emblemáticas cerca de la Zona Río, donde se juntan las fans", area: "Zona Río" },
    ],
    communities: [
      { name: "K-pop Tijuana (fan groups)", platform: "Facebook", url: "https://www.facebook.com/search/groups?q=kpop%20tijuana", members: "Active" },
    ],
    kpopSpots: [
      { name: "Plaza Río & anime shops", type: "Shopping", description: "K-pop and anime merch stalls concentrated around Plaza Río Tijuana.", descriptionEs: "Puestos de merch de K-pop y anime concentrados alrededor de Plaza Río Tijuana." },
    ],
  },
  "guadalajara": {
    name: "Guadalajara", country: "MX", flag: "🇲🇽", color: "#A31621",
    timezone: "CST (UTC-6)", currency: "MXN ($)",
    description: "Jalisco's capital is a powerhouse of Mexican K-pop fandom, with huge random-play-dance turnouts and one of the country's biggest anime & K-pop convention circuits.",
    descriptionEs: "La capital de Jalisco es una potencia del fandom mexicano del K-pop, con convocatorias enormes de random play dance y uno de los circuitos de convenciones de anime y K-pop más grandes del país.",
    concerts: [
      { artist: "K-pop world tours", venue: "Major arenas & stadiums", date: "Check current listings", ticketUrl: "https://www.songkick.com/search?query=kpop+guadalajara" },
    ],
    meetups: [
      { title: "GDL K-pop Meetup", location: "Parque Rojo (Parque Revolución)", date: "Monthly", description: "Casual gathering with dance covers, album swaps, and Korean street snacks.", descriptionEs: "Encuentro relajado con dance covers, intercambio de álbumes y botanas coreanas de la calle." },
      { title: "Guadalajara Random Play Dance", location: "Plaza de la Liberación", date: "Bi-weekly Saturdays", description: "Downtown random play dance — one of GDL's biggest fan circles.", descriptionEs: "Random play dance en el centro: uno de los círculos de fans más grandes de GDL." },
    ],
    hotels: [
      { name: "Riu Plaza Guadalajara", stars: 4, note: "High-rise base near the Minerva circle and event venues", noteEs: "Base en altura cerca de la Glorieta Minerva y los recintos de eventos", area: "Zona Minerva" },
    ],
    communities: [
      { name: "K-pop Guadalajara (fan groups)", platform: "Facebook", url: "https://www.facebook.com/search/groups?q=kpop%20guadalajara", members: "Active" },
    ],
    kpopSpots: [
      { name: "Anime & K-pop shops (Centro)", type: "Shopping", description: "Downtown Guadalajara's anime and import stores stock albums, photocards, and lightsticks.", descriptionEs: "Las tiendas de anime e importación del centro de Guadalajara tienen álbumes, photocards y lightsticks." },
    ],
  },
  "monterrey": {
    name: "Monterrey", country: "MX", flag: "🇲🇽", color: "#1F6FB2",
    timezone: "CST (UTC-6)", currency: "MXN ($)",
    description: "Northern Mexico's industrial capital pulls major Latin American tour stops to its arenas, backed by a passionate, well-organized fan base.",
    descriptionEs: "La capital industrial del norte de México se lleva paradas importantes de las giras latinoamericanas a sus arenas, con un fandom apasionado y bien organizado detrás.",
    concerts: [
      { artist: "K-pop world tours", venue: "Major arenas & stadiums", date: "Check current listings", ticketUrl: "https://www.songkick.com/search?query=kpop+monterrey" },
    ],
    meetups: [
      { title: "MTY K-pop Fans", location: "Parque Fundidora", date: "Monthly", description: "Fan community meetup with picnics, dance covers, and album trading.", descriptionEs: "Meetup de la comunidad de fans con picnics, dance covers e intercambio de álbumes." },
      { title: "Monterrey Dance Cover Jam", location: "Macroplaza", date: "First Sunday", description: "Open dance-cover session in the heart of downtown Monterrey.", descriptionEs: "Sesión abierta de dance cover en pleno centro de Monterrey." },
    ],
    hotels: [
      { name: "Fiesta Americana Monterrey Valle", stars: 5, note: "San Pedro base near the city's arenas and malls", noteEs: "Base en San Pedro, cerca de las arenas y las plazas de la ciudad", area: "Valle / San Pedro" },
    ],
    communities: [
      { name: "K-pop Monterrey (fan groups)", platform: "Facebook", url: "https://www.facebook.com/search/groups?q=kpop%20monterrey", members: "Active" },
    ],
    kpopSpots: [
      { name: "Anime & K-pop merch (Centro)", type: "Shopping", description: "Import and anime stores downtown carry K-pop albums and fan goods.", descriptionEs: "Las tiendas de importación y anime del centro tienen álbumes de K-pop y artículos para fans." },
    ],
  },
  "chihuahua": {
    name: "Chihuahua", country: "MX", flag: "🇲🇽", color: "#8B5E3C",
    timezone: "MST (UTC-7)", currency: "MXN ($)",
    description: "A tight-knit desert-city fandom that punches above its size — regular dance meets and road trips to Monterrey and CDMX shows.",
    descriptionEs: "Un fandom muy unido de ciudad desértica que rinde más de lo que su tamaño sugiere: encuentros de baile constantes y carretera a los shows de Monterrey y la CDMX.",
    concerts: [
      { artist: "K-pop world tours", venue: "Regional arenas", date: "Check current listings", ticketUrl: "https://www.songkick.com/search?query=kpop+chihuahua" },
    ],
    meetups: [
      { title: "Chihuahua K-pop Meetup", location: "Plaza del Ángel", date: "Monthly", description: "Casual fan gathering with trivia, dance, and photocard trading.", descriptionEs: "Encuentro relajado de fans con trivia, baile e intercambio de photocards." },
      { title: "CUU Random Play Dance", location: "Deportiva Sur", date: "Monthly", description: "Random play dance session open to dancers of all levels.", descriptionEs: "Sesión de random play dance abierta a bailarines de todos los niveles." },
    ],
    hotels: [
      { name: "Quinta Real Chihuahua", stars: 5, note: "Central luxury base for visiting fans", noteEs: "Base de lujo en el centro para las fans que vienen de fuera", area: "Centro" },
    ],
    communities: [
      { name: "K-pop Chihuahua (fan groups)", platform: "Facebook", url: "https://www.facebook.com/search/groups?q=kpop%20chihuahua", members: "Active" },
    ],
    kpopSpots: [
      { name: "Anime & import shops", type: "Shopping", description: "Local anime and import stores are the go-to for albums and merch.", descriptionEs: "Las tiendas locales de anime e importación son el punto obligado para álbumes y merch." },
    ],
  },
  "rio-de-janeiro": {
    name: "Rio de Janeiro", country: "BR", flag: "🇧🇷", color: "#00A859",
    timezone: "BRT (UTC-3)", currency: "BRL (R$)",
    description: "Brazil's beach capital brings K-pop to the sand — Aterro do Flamengo and Copacabana host huge open-air fan gatherings and dance battles.",
    descriptionEs: "La capital playera de Brasil lleva el K-pop a la arena: el Aterro do Flamengo y Copacabana reciben enormes encuentros de fans al aire libre y batallas de baile.",
    concerts: [
      { artist: "K-pop world tours", venue: "Major arenas & stadiums", date: "Check current listings", ticketUrl: "https://www.songkick.com/search?query=kpop+rio+de+janeiro" },
    ],
    meetups: [
      { title: "Rio K-pop Meetup", location: "Aterro do Flamengo", date: "Monthly", description: "Open-air fan gathering with dance covers, picnics, and album swaps by the bay.", descriptionEs: "Encuentro de fans al aire libre con dance covers, picnics e intercambio de álbumes frente a la bahía." },
      { title: "Rio Random Play Dance", location: "Largo do Machado", date: "Bi-weekly Saturdays", description: "One of Rio's biggest random-play-dance circles.", descriptionEs: "Uno de los círculos de random play dance más grandes de Río." },
    ],
    hotels: [
      { name: "Copacabana Palace", stars: 5, note: "Iconic beachfront landmark hosting touring artists", noteEs: "Ícono frente al mar donde se hospedan los artistas en gira", area: "Copacabana" },
    ],
    communities: [
      { name: "K-pop Rio (fan groups)", platform: "Facebook", url: "https://www.facebook.com/search/groups?q=kpop%20rio%20de%20janeiro", members: "Active" },
    ],
    kpopSpots: [
      { name: "Saara & Asian import shops", type: "Shopping", description: "The Saara market district and Asian-goods stores stock albums and K-pop merch.", descriptionEs: "El distrito comercial de Saara y las tiendas de artículos asiáticos tienen álbumes y merch de K-pop." },
    ],
  },
  "santiago": {
    name: "Santiago", country: "CL", flag: "🇨🇱", color: "#0F52BA",
    timezone: "CLT (UTC-4)", currency: "CLP ($)",
    description: "Chile has one of Latin America's most devoted K-pop fandoms, and Santiago is its heart — famous for record-breaking pre-order drives and sold-out arena tours.",
    descriptionEs: "Chile tiene uno de los fandoms de K-pop más devotos de Latinoamérica y Santiago es su corazón: famoso por campañas de preventa que rompen récords y giras que agotan las arenas.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Estadio Nacional", date: "Oct 14, 16-17, 2026", ticketUrl: "https://ibighit.com/en/bts/tour/" },
      { artist: "K-pop world tours", venue: "Movistar Arena & Estadio venues", date: "Check current listings", ticketUrl: "https://www.songkick.com/search?query=kpop+santiago+chile" },
    ],
    meetups: [
      { title: "Santiago K-pop Fans", location: "Parque Forestal", date: "Monthly", description: "Casual fan meetup with dance, trivia, and merch trading along the park.", descriptionEs: "Meetup relajado de fans con baile, trivia e intercambio de merch a lo largo del parque." },
      { title: "K-pop RPD Santiago", location: "Plaza Ñuñoa", date: "First Saturday", description: "Random play dance circle — a Santiago fandom institution.", descriptionEs: "Círculo de random play dance: toda una institución del fandom santiaguino." },
    ],
    hotels: [
      { name: "The Ritz-Carlton Santiago", stars: 5, note: "El Golf base near the city's arenas and malls", noteEs: "Base en El Golf, cerca de las arenas y los malls de la ciudad", area: "El Golf" },
    ],
    communities: [
      { name: "K-pop Chile (fan groups)", platform: "Facebook", url: "https://www.facebook.com/search/groups?q=kpop%20chile", members: "Active" },
    ],
    kpopSpots: [
      { name: "Barrio Patronato imports", type: "Shopping", description: "Patronato's Asian-import shops are Santiago's hub for K-pop albums and merch.", descriptionEs: "Las tiendas de importación asiática de Patronato son el centro neurálgico de Santiago para álbumes y merch de K-pop." },
    ],
  },
  "bogota": {
    name: "Bogotá", country: "CO", flag: "🇨🇴", color: "#00489E",
    timezone: "COT (UTC-5)", currency: "COP ($)",
    description: "Colombia's capital is a major Latin American tour stop, with a thriving fan scene organizing meetups across the city's parks and plazas.",
    descriptionEs: "La capital colombiana es una de las paradas importantes de las giras latinoamericanas, con una escena de fans que no para de crecer y que organiza meetups por los parques y plazas de la ciudad.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Estadio El Campín", date: "Oct 2-3, 2026", ticketUrl: "https://ibighit.com/en/bts/tour/" },
      { artist: "K-pop world tours", venue: "Movistar Arena & Coliseo venues", date: "Check current listings", ticketUrl: "https://www.songkick.com/search?query=kpop+bogota" },
    ],
    meetups: [
      { title: "Bogotá K-pop Meetup", location: "Parque de los Hippies (Chapinero)", date: "Monthly", description: "Casual fan gathering with dance covers, games, and album swaps.", descriptionEs: "Encuentro relajado de fans con dance covers, juegos e intercambio de álbumes." },
      { title: "Bogotá Random Play Dance", location: "Parque Simón Bolívar", date: "Bi-weekly Saturdays", description: "Large-scale random play dance in the city's biggest park.", descriptionEs: "Random play dance a gran escala en el parque más grande de la ciudad." },
    ],
    hotels: [
      { name: "Four Seasons Bogotá (Casa Medina)", stars: 5, note: "Zona G landmark near event venues", noteEs: "Ícono de la Zona G, cerca de los recintos de eventos", area: "Zona G" },
    ],
    communities: [
      { name: "K-pop Colombia (fan groups)", platform: "Facebook", url: "https://www.facebook.com/search/groups?q=kpop%20colombia", members: "Active" },
    ],
    kpopSpots: [
      { name: "Chapinero import shops", type: "Shopping", description: "Chapinero's anime and import stores carry albums, photocards, and lightsticks.", descriptionEs: "Las tiendas de anime e importación de Chapinero tienen álbumes, photocards y lightsticks." },
    ],
  },
  "medellin": {
    name: "Medellín", country: "CO", flag: "🇨🇴", color: "#E4002B",
    timezone: "COT (UTC-5)", currency: "COP ($)",
    description: "The city of eternal spring has a fast-growing K-pop community, centered on El Poblado and the parks of the city center.",
    descriptionEs: "La ciudad de la eterna primavera tiene una comunidad K-pop que crece rapidísimo, concentrada en El Poblado y los parques del centro.",
    concerts: [
      { artist: "K-pop world tours", venue: "La Macarena & regional venues", date: "Check current listings", ticketUrl: "https://www.songkick.com/search?query=kpop+medellin" },
    ],
    meetups: [
      { title: "Medellín K-pop Fans", location: "Parque de los Deseos", date: "Monthly", description: "Fan meetup with dance covers, trivia, and photocard trading.", descriptionEs: "Meetup de fans con dance covers, trivia e intercambio de photocards." },
      { title: "Medellín RPD", location: "Parque de las Luces", date: "First Saturday", description: "Random play dance circle in the heart of the city.", descriptionEs: "Círculo de random play dance en pleno corazón de la ciudad." },
    ],
    hotels: [
      { name: "The Charlee Hotel", stars: 5, note: "El Poblado nightlife-district base for visiting fans", noteEs: "Base en la zona de rumba de El Poblado para las fans que vienen de visita", area: "El Poblado" },
    ],
    communities: [
      { name: "K-pop Medellín (fan groups)", platform: "Facebook", url: "https://www.facebook.com/search/groups?q=kpop%20medellin", members: "Active" },
    ],
    kpopSpots: [
      { name: "El Poblado import shops", type: "Shopping", description: "El Poblado's anime and Asian-goods stores stock K-pop albums and merch.", descriptionEs: "Las tiendas de anime y artículos asiáticos de El Poblado tienen álbumes y merch de K-pop." },
    ],
  },
  "toronto": {
    name: "Toronto", country: "CA", flag: "🇨🇦", color: "#C8102E",
    timezone: "EST (UTC-5)", currency: "CAD ($)",
    description: "Canada's most multicultural city is a top North American tour stop, with a deep Korean community along Bloor St and year-round fan events.",
    descriptionEs: "La ciudad más multicultural de Canadá es una de las paradas principales de las giras norteamericanas, con una comunidad coreana muy arraigada sobre Bloor St y eventos para fans todo el año.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Rogers Stadium", date: "Aug 22-23, 2026", ticketUrl: "https://ibighit.com/en/bts/tour/" },
      { artist: "K-pop world tours", venue: "Scotiabank Arena & Rogers Centre", date: "Check current listings", ticketUrl: "https://www.songkick.com/search?query=kpop+toronto" },
    ],
    meetups: [
      { title: "Toronto K-pop Meetup", location: "Nathan Phillips Square", date: "Monthly", description: "Downtown fan gathering with dance covers and album trading.", descriptionEs: "Encuentro de fans en el centro con dance covers e intercambio de álbumes." },
      { title: "Toronto Random Play Dance", location: "Yonge-Dundas Square", date: "Summer weekends", description: "Open-air random play dance in the city's busiest square.", descriptionEs: "Random play dance al aire libre en la plaza más concurrida de la ciudad." },
    ],
    hotels: [
      { name: "Fairmont Royal York", stars: 5, note: "Landmark hotel across from Union Station and the arena", noteEs: "Hotel emblemático frente a Union Station y la arena", area: "Downtown" },
    ],
    communities: [
      { name: "Toronto K-pop (fan groups)", platform: "Facebook", url: "https://www.facebook.com/search/groups?q=kpop%20toronto", members: "Active" },
    ],
    kpopSpots: [
      { name: "Koreatown (Bloor St W)", type: "District", description: "Toronto's Koreatown has restaurants, cafés, and shops carrying K-pop albums and goods.", descriptionEs: "El Koreatown de Toronto tiene restaurantes, cafés y tiendas con álbumes y artículos de K-pop." },
    ],
  },
  "melbourne": {
    name: "Melbourne", country: "AU", flag: "🇦🇺", color: "#1B3A6B",
    timezone: "AEST (UTC+10)", currency: "AUD ($)",
    description: "Australia's culture capital anchors a huge K-pop scene — from Fed Square dance meets to sold-out shows at Rod Laver Arena.",
    descriptionEs: "La capital cultural de Australia sostiene una escena K-pop enorme: desde los encuentros de baile en Fed Square hasta los shows agotados en el Rod Laver Arena.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Marvel Stadium", date: "Feb 10, 12-13, 2027", ticketUrl: "https://ibighit.com/en/bts/tour/" },
      { artist: "K-pop world tours", venue: "Rod Laver Arena & Marvel Stadium", date: "Check current listings", ticketUrl: "https://www.songkick.com/search?query=kpop+melbourne" },
    ],
    meetups: [
      { title: "Melbourne K-pop Meetup", location: "Federation Square", date: "Monthly", description: "Central fan gathering with dance covers, trivia, and merch swaps.", descriptionEs: "Encuentro de fans en el centro con dance covers, trivia e intercambio de merch." },
      { title: "Melbourne Random Play Dance", location: "State Library Victoria forecourt", date: "Bi-weekly Saturdays", description: "A long-running Melbourne fan random-play-dance circle.", descriptionEs: "Un círculo de random play dance de las fans de Melbourne con años de trayectoria." },
    ],
    hotels: [
      { name: "Crown Towers Melbourne", stars: 5, note: "Southbank riverside base near major venues", noteEs: "Base a la orilla del río en Southbank, cerca de los principales recintos", area: "Southbank" },
    ],
    communities: [
      { name: "K-pop Melbourne (fan groups)", platform: "Facebook", url: "https://www.facebook.com/search/groups?q=kpop%20melbourne", members: "Active" },
    ],
    kpopSpots: [
      { name: "CBD K-pop & Asian grocers", type: "Shopping", description: "The CBD's Asian grocers and album shops stock K-pop releases and photocards.", descriptionEs: "Los supermercados asiáticos y las tiendas de discos del CBD tienen lanzamientos de K-pop y photocards." },
    ],
  },
  "sydney": {
    name: "Sydney", country: "AU", flag: "🇦🇺", color: "#0057B8",
    timezone: "AEST (UTC+10)", currency: "AUD ($)",
    description: "Sydney draws nearly every K-pop world tour to Qudos Bank Arena, with fan meetups clustered around Darling Harbour and the CBD.",
    descriptionEs: "Sídney atrae casi todas las giras mundiales de K-pop al Qudos Bank Arena, con meetups de fans concentrados alrededor de Darling Harbour y el CBD.",
    concerts: [
      { artist: "BTS — ARIRANG World Tour", venue: "Accor Stadium", date: "Feb 20-21, 2027", ticketUrl: "https://ibighit.com/en/bts/tour/" },
      { artist: "K-pop world tours", venue: "Qudos Bank Arena & Accor Stadium", date: "Check current listings", ticketUrl: "https://www.songkick.com/search?query=kpop+sydney" },
    ],
    meetups: [
      { title: "Sydney K-pop Meetup", location: "Tumbalong Park (Darling Harbour)", date: "Monthly", description: "Harbourside fan gathering with dance, games, and album trading.", descriptionEs: "Encuentro de fans junto al puerto con baile, juegos e intercambio de álbumes." },
      { title: "Sydney Random Play Dance", location: "Sydney Town Hall steps", date: "First Saturday", description: "Random play dance circle on the iconic Town Hall steps.", descriptionEs: "Círculo de random play dance en las icónicas escalinatas del Town Hall." },
    ],
    hotels: [
      { name: "The Star Grand", stars: 5, note: "Pyrmont base a short walk from Darling Harbour meetups", noteEs: "Base en Pyrmont, a poca distancia a pie de los meetups de Darling Harbour", area: "Pyrmont" },
    ],
    communities: [
      { name: "K-pop Sydney (fan groups)", platform: "Facebook", url: "https://www.facebook.com/search/groups?q=kpop%20sydney", members: "Active" },
    ],
    kpopSpots: [
      { name: "Chinatown album shops", type: "Shopping", description: "Haymarket / Chinatown stores are Sydney's hub for K-pop albums and merch.", descriptionEs: "Las tiendas de Haymarket y Chinatown son el punto de referencia de Sídney para álbumes y merch de K-pop." },
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params;
  const data = CITY_DATA[city];
  if (!data) return { title: "City not found — Aegyo Arena" };
  return {
    title: `K-pop in ${data.name} — Events, Meetups & Community | Aegyo Arena`,
    description: data.description,
  };
}

export async function generateStaticParams() {
  return Object.keys(CITY_DATA).map((city) => ({ city }));
}

// Category styling for live scanned events (mirrors /events so the two stay visually consistent).
const EVENT_CAT: Record<string, { label: string; labelEs: string; emoji: string; color: string }> = {
  kpop:    { label: "K-pop",     labelEs: "K-pop",     emoji: "💜", color: "#C77DFF" },
  kbeauty: { label: "K-Beauty",  labelEs: "K-Beauty",  emoji: "💄", color: "#FF6FA8" },
  dance:   { label: "Dance",     labelEs: "Baile",     emoji: "🕺", color: "#4AC8F0" },
  anime:   { label: "Anime",     labelEs: "Anime",     emoji: "🎌", color: "#FF8C42" },
  comicon: { label: "Comic-Con", labelEs: "Comic-Con", emoji: "🦸", color: "#C8F04A" },
  store:   { label: "Store",     labelEs: "Tienda",    emoji: "🛍", color: "#B8A0FF" },
  meetup:  { label: "Meetup",    labelEs: "Meetup",    emoji: "🗓", color: "#4ECDC4" },
  other:   { label: "Event",     labelEs: "Evento",    emoji: "✨", color: "#FFD700" },
};

// The controlled vocabulary behind each K-pop spot's category chip. Only the
// chip label is translated — the spot's name and description stay as authored.
const SPOT_TYPE_ES: Record<string, string> = {
  "shopping": "Compras",
  "district": "Barrio",
  "record store": "Tienda de Discos",
  "museum": "Museo",
  "fan space": "Espacio Fan",
  "store": "Tienda",
  "cultural center": "Centro Cultural",
};
const spotTypeEs = (type: string): string => SPOT_TYPE_ES[type.toLowerCase()] ?? type;

// Meetup cadence labels are a small controlled vocabulary — the 48 meetups across
// all cities use only these 12 values. Keyed by the exact English label, with an
// English fallback so a new/unmapped cadence degrades instead of breaking.
const MEETUP_DATE_ES: Record<string, string> = {
  "Monthly": "Mensual",
  "Bi-weekly Saturdays": "Sábados cada dos semanas",
  "Bi-weekly Sundays": "Domingos cada dos semanas",
  "Bi-monthly": "Cada dos meses",
  "First Saturday": "Primer sábado del mes",
  "First Sunday": "Primer domingo del mes",
  "First Friday": "Primer viernes del mes",
  "Quarterly": "Trimestral",
  "Sundays": "Domingos",
  "Summer weekends": "Fines de semana de verano",
  "Daily (especially weekends)": "Diario (sobre todo fines de semana)",
  "Annual + monthly": "Anual + mensual",
};
const meetupDateEs = (date: string): string => MEETUP_DATE_ES[date] ?? date;

type CityEvent = {
  id: string; title: string; titleEs: string | null; category: string; venue: string | null;
  startsAt: Date | null; dateText: string | null; description: string | null; descriptionEs: string | null;
  source: string | null; sourceUrl: string;
};

// Localise the free-form concert date strings (month abbreviations + a handful of
// placeholder phrases). Absolute dates keep their numbers; only the words change.
const CONCERT_MONTHS: Record<string, string> = {
  Jan: "ene", Feb: "feb", Mar: "mar", Apr: "abr", May: "may", Jun: "jun",
  Jul: "jul", Aug: "ago", Sep: "sep", Sept: "sep", Oct: "oct", Nov: "nov", Dec: "dic",
};
const CONCERT_PHRASES: Record<string, string> = {
  "Year-round": "Todo el año",
  "Check current listings": "Consulta la cartelera",
  "TBA": "Por confirmar",
  "TBD": "Por confirmar",
  "Various": "Varias fechas",
  "Ongoing": "En curso",
};
function concertDateEs(date: string): string {
  let out = date;
  for (const [en, es] of Object.entries(CONCERT_PHRASES)) out = out.replaceAll(en, es);
  out = out.replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)\b/g, (m) => CONCERT_MONTHS[m] ?? m);
  return out;
}

function fmtEventDate(e: CityEvent, locale = "en-US"): string {
  if (e.startsAt) {
    try { return new Date(e.startsAt).toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric", year: "numeric" }); } catch { /* fall through */ }
  }
  return e.dateText ?? "";
}

// "12k+ members" localises cleanly; the "Active" placeholder some cities use for
// an unknown member count needs a real phrase rather than a suffix swap.
function membersLabel(members: string): { en: string; es: string } {
  if (members.toLowerCase() === "active") return { en: "Active members", es: "Miembros activos" };
  return { en: `${members} members`, es: `${members} miembros` };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const data = CITY_DATA[city];
  if (!data) notFound();

  // Leaderboard contributors based in this city (empty for cities with no contributors).
  const cityContributors = CONTRIBUTORS.filter((c) => c.city === data.name);

  // Live events scanned for this city — the SAME feed shown on /events, filtered
  // to this city so the two pages stay in sync. Matched by citySlug or city name.
  let liveEvents: CityEvent[] = [];
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "ScannedEvent" ADD COLUMN IF NOT EXISTS "titleEs" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "ScannedEvent" ADD COLUMN IF NOT EXISTS "descriptionEs" TEXT`);
    liveEvents = await prisma.$queryRawUnsafe<CityEvent[]>(
      `SELECT "id","title","titleEs","category","venue","startsAt","dateText","description","descriptionEs","source","sourceUrl"
       FROM "ScannedEvent"
       WHERE "status" = 'live'
         AND ("startsAt" IS NULL OR "startsAt" >= now() - interval '1 day')
         AND ("citySlug" = $1 OR lower("city") = $2)
       ORDER BY ("startsAt" IS NULL), "startsAt" ASC, "createdAt" DESC
       LIMIT 12`,
      city, data.name.toLowerCase()
    );
  } catch { liveEvents = []; }

  // Map DB artists by lowercased stage name so concert billings can deep-link to artist pages.
  const artists = await prisma.artist.findMany({ select: { slug: true, stageName: true } });
  const artistSlugByName = new Map(artists.map((a) => [a.stageName.toLowerCase(), a.slug] as const));
  const SKIP_CONCERT_ARTIST = new Set(["multiple", "multiple artists", "k-pop world tours", "k-pop tours"]);
  const concertArtistSlug = (raw: string): string | null => {
    const name = raw.split(/—|\/|feat\./i)[0].trim();
    if (!name || SKIP_CONCERT_ARTIST.has(name.toLowerCase())) return null;
    return artistSlugByName.get(name.toLowerCase()) ?? null;
  };

  return (
    <main>
      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)`, color: "#fff", padding: "60px 24px 48px", borderBottom: `4px solid ${data.color}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <LangToggle align="flex-start" marginBottom={16} />
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Aegyo Arena</Link>
            {" / "}
            <Link href="/cities" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}><T en="Cities" es="Ciudades" /></Link>
            {" / "}
            {data.name}
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "3.5rem" }}>{data.flag}</span>
            <div>
              <h1 style={{ fontSize: "2.8rem", fontWeight: 800, margin: "0 0 8px" }}>
                <T en={`K-pop in ${data.name}`} es={`K-pop en ${data.name}`} />
              </h1>
              <div style={{ display: "flex", gap: 16, fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", flexWrap: "wrap" }}>
                <span>{data.country}</span>
                <span>{data.timezone}</span>
                <span>{data.currency}</span>
              </div>
            </div>
          </div>
          <p style={{ marginTop: 20, color: "rgba(255,255,255,0.75)", maxWidth: 700, lineHeight: 1.7, fontSize: "0.95rem" }}>
            <T en={data.description} es={data.descriptionEs} />
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <div className="responsive-sidebar-grid">
          <div>
            {/* Happening Soon — live scanned events for this city (synced with /events) */}
            {liveEvents.length > 0 && (
              <section style={{ marginBottom: 48 }}>
                <div className="section-header"><T en="Happening Soon" es="Próximamente" /></div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                  {liveEvents.map((e) => {
                    const c = EVENT_CAT[e.category] ?? EVENT_CAT.other;
                    const when = fmtEventDate(e);
                    const whenEs = fmtEventDate(e, "es-MX");
                    return (
                      <div key={e.id} className="genius-card" style={{ padding: 18, display: "flex", flexDirection: "column", borderLeft: `3px solid ${c.color}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{ background: `${c.color}22`, color: "var(--ink)", fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.06em", padding: "3px 9px", borderRadius: 999, textTransform: "uppercase" }}>{c.emoji} <T en={c.label} es={c.labelEs} /></span>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--ink)", lineHeight: 1.35, marginBottom: 6 }}><T en={e.title} es={e.titleEs} /></div>
                        {(e.venue || when) && (
                          <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.68)", marginBottom: 8 }}>
                            {e.venue && <span>📍 {e.venue}</span>}{e.venue && when ? " · " : ""}{when && <span>🗓 <T en={when} es={whenEs} /></span>}
                          </div>
                        )}
                        {e.description && <div style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.55, marginBottom: 12, flex: 1 }}><T en={e.description} es={e.descriptionEs} /></div>}
                        <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ marginTop: "auto", fontSize: "0.78rem", color: c.color, fontWeight: 800, textDecoration: "none" }}>
                          <T
                            en={`Details${e.source ? ` on ${e.source}` : ""} →`}
                            es={`Detalles${e.source ? ` en ${e.source}` : ""} →`}
                          />
                        </a>
                      </div>
                    );
                  })}
                </div>
                <Link href="/events" style={{ display: "inline-block", marginTop: 14, fontSize: "0.8rem", color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>
                  <T en="See all fan events →" es="Ver todos los eventos de fans →" />
                </Link>
              </section>
            )}

            {/* Upcoming Concerts */}
            <section style={{ marginBottom: 48 }}>
              <div className="section-header"><T en="Upcoming Concerts" es="Próximos Conciertos" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.concerts.map((c, i) => {
                  const artistSlug = concertArtistSlug(c.artist);
                  return (
                  <div key={i} className="genius-card" style={{ padding: 20, borderLeft: `3px solid ${data.color}` }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--ink)", marginBottom: 4 }}>
                          {artistSlug ? (
                            <Link href={`/artists/${artistSlug}`} style={{ color: "var(--ink)", textDecoration: "none" }}>{c.artist}</Link>
                          ) : c.artist}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.68)" }}>📍 {c.venue}</div>
                        <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.68)", marginTop: 2 }}>📅 <T en={c.date} es={concertDateEs(c.date)} /></div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <a href={c.ticketUrl} target="_blank" rel="noopener noreferrer" className="btn-yellow" style={{ fontSize: "0.72rem", textAlign: "center" }}>
                          <T en="FIND TICKETS" es="BUSCAR BOLETOS" />
                        </a>
                        <a href={`https://www.songkick.com/search?query=${encodeURIComponent(c.artist + " " + data.name)}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.68)", textAlign: "center", textDecoration: "none" }}>
                          <T en="Check Songkick →" es="Ver en Songkick →" />
                        </a>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </section>

            {/* Fan Meetups */}
            <section style={{ marginBottom: 48 }}>
              <div className="section-header"><T en="Fan Meetups" es="Encuentros de Fans" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data.meetups.map((m, i) => (
                  <div key={i} className="genius-card" style={{ padding: 20 }}>
                    <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--ink)", marginBottom: 6 }}>{m.title}</div>
                    <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.68)", marginBottom: 4 }}>📍 {m.location} &middot; 🗓 <T en={m.date} es={meetupDateEs(m.date)} /></div>
                    <div style={{ fontSize: "0.88rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.6 }}><T en={m.description} es={m.descriptionEs} /></div>
                    <a href={m.url ?? `https://www.google.com/search?q=${encodeURIComponent(`${m.title} ${data.name} K-pop meetup`)}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 10, fontSize: "0.78rem", color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>
                      {m.url
                        ? <T en="More info & socials →" es="Más info y redes →" />
                        : <T en="Find this meetup →" es="Busca este meetup →" />}
                    </a>
                  </div>
                ))}
              </div>
            </section>

            {/* K-pop Spots */}
            <section>
              <div className="section-header"><T en="K-pop Spots" es="Lugares K-pop" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {data.kpopSpots.map((s, i) => (
                  <div key={i} className="genius-card" style={{ padding: 18 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                      <span style={{ background: "var(--genius-yellow)", color: "var(--on-accent)", fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap", letterSpacing: "0.06em" }}>
                        <T en={s.type.toUpperCase()} es={spotTypeEs(s.type).toUpperCase()} />
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)", marginBottom: 6 }}>{s.name}</div>
                    <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.6 }}><T en={s.description} es={s.descriptionEs} /></div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside>
            {/* Top leaderboard contributors based in this city */}
            {cityContributors.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div className="section-header">
                  <T en={`Top contributors in ${data.name}`} es={`Top de colaboradores en ${data.name}`} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {cityContributors.map((c) => (
                    <Link key={c.slug} href={`/u/${c.slug}`} style={{ textDecoration: "none" }}>
                      <div className="genius-card" style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.avatar} alt="" width={34} height={34} loading="lazy" style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${c.tierColor}`, background: c.tierColor }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.username}</div>
                          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.68)" }}>
                            #{c.rank} · <T en={`${c.points.toLocaleString("en-US")} pts`} es={`${c.points.toLocaleString("es-MX")} pts`} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Hotel Recommendations */}
            <div style={{ marginBottom: 28 }}>
              <div className="section-header"><T en="Hotel Picks" es="Hoteles Recomendados" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.hotels.map((h, i) => (
                  <div key={i} className="genius-card" style={{ padding: 16 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--ink)" }}>{h.name}</span>
                      <span style={{ fontSize: "0.72rem", color: "var(--genius-yellow)", letterSpacing: "0.04em" }}>
                        {"★".repeat(h.stars)}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.68)", marginBottom: 4 }}>📍 {h.area}</div>
                    <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.82)", fontStyle: "italic", lineHeight: 1.5 }}><T en={h.note} es={h.noteEs} /></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Communities */}
            <div style={{ marginBottom: 28 }}>
              <div className="section-header"><T en="Online Communities" es="Comunidades en Línea" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.communities.map((c, i) => {
                  const members = membersLabel(c.members);
                  return (
                  <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <div className="genius-card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--ink)" }}>{c.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.68)" }}>
                          {c.platform} · <T en={members.en} es={members.es} />
                        </div>
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.68)" }}>→</span>
                    </div>
                  </a>
                  );
                })}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <div className="section-header"><T en="Find Events" es="Buscar Eventos" /></div>
              {[
                { label: "Songkick", href: `https://www.songkick.com/search?query=kpop+${encodeURIComponent(data.name)}`, bg: "#f80046" },
                { label: "Seatgeek", href: `https://seatgeek.com/search#?q=kpop+${encodeURIComponent(data.name)}`, bg: "#fa5252" },
              ].map(({ label, href, bg }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ display: "block", background: bg, color: "#fff", textAlign: "center", fontWeight: 700, fontSize: "0.78rem", padding: "10px", borderRadius: 4, textDecoration: "none", marginBottom: 8, letterSpacing: "0.04em" }}>
                  <T en={`Search ${label} for ${data.name}`} es={`Busca ${data.name} en ${label}`} />
                </a>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {/* Other cities */}
      <section style={{ background: "#f8f8f8", borderTop: "2px solid #000", padding: "40px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="section-header"><T en="Explore Other Cities" es="Explora Otras Ciudades" /></div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {Object.entries(CITY_DATA).filter(([slug]) => slug !== city).slice(0, 10).map(([slug, c]) => (
              <Link key={slug} href={`/cities/${slug}`} style={{ textDecoration: "none" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fff", border: "1px solid var(--genius-border)", borderRadius: 999, padding: "5px 14px", fontSize: "0.82rem", fontWeight: 600, color: "var(--on-accent)" }}>
                  {c.flag} {c.name}
                </span>
              </Link>
            ))}
            <Link href="/cities" style={{ textDecoration: "none" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--genius-yellow)", border: "1px solid var(--genius-yellow)", borderRadius: 999, padding: "5px 14px", fontSize: "0.82rem", fontWeight: 700, color: "var(--on-accent)" }}>
                <T en="View all cities →" es="Ver todas las ciudades →" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
