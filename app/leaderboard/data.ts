// Mock leaderboard data — 30 contributors across Mexico City, New York, and Paris.
// Activity reasons reference real songs, slang, and city-specific K-pop culture
// from the Aegyo Arena database.

export type City = "Mexico City" | "New York" | "Paris";

export interface Contributor {
  rank:         number;
  username:     string;
  slug:         string;     // URL-safe id for /u/[slug]
  initial:      string;
  city:         City;
  flag:         string;
  points:       number;
  tier:         string;
  tierColor:    string;
  focus:        string;      // primary artist/genre focus
  focusTag:     string;      // short tag shown on card
  recentAct:    string;      // most recent rich activity blurb
  annotations:  number;
  edits:        number;
  comments:     number;
  followers:    number;     // followers from other users
  joinedMonth:  string;
}

const RAW: Omit<Contributor, "followers" | "slug">[] = [
  // ── MEXICO CITY ─────────────────────────────────────────────────────────────
  {
    rank: 1, username: "SofiaRM_CDMX", initial: "S",
    city: "Mexico City", flag: "🇲🇽", points: 8450,
    tier: "Legend", tierColor: "#ef4444", focus: "RM · BTS", focusTag: "BTS",
    recentAct: "Annotated RM's 'Indigo' — explained the 'persona' philosophy for Spanish ARMYs. Daebak response from the CDMX fan community, 47 upvotes.",
    annotations: 42, edits: 31, comments: 210, joinedMonth: "Jan 2024",
  },
  {
    rank: 2, username: "ValeriaBangtanMX", initial: "V",
    city: "Mexico City", flag: "🇲🇽", points: 7180,
    tier: "Legend", tierColor: "#ef4444", focus: "BTS · 봄날", focusTag: "BTS",
    recentAct: "Fixed romanization errors across 봄날 (Spring Day) — added CDMX OT7 streaming party notes and a full maknae line breakdown. The whole Mexican ARMY fandom bookmarked this.",
    annotations: 36, edits: 27, comments: 188, joinedMonth: "Feb 2024",
  },
  {
    rank: 3, username: "Fernanda_V_Stan", initial: "F",
    city: "Mexico City", flag: "🇲🇽", points: 6340,
    tier: "Legend", tierColor: "#ef4444", focus: "V · Kiiikiii", focusTag: "Kiiikiii",
    recentAct: "First to annotate Kiiikiii's 'BORN AGAIN' MV — connected the visual concept to V's Layover era aesthetic. CDMX Kiiikiii stans called it the most thorough annotation on the platform.",
    annotations: 29, edits: 22, comments: 167, joinedMonth: "Mar 2024",
  },
  {
    rank: 4, username: "KiiikiiFanMX_Jorge", initial: "J",
    city: "Mexico City", flag: "🇲🇽", points: 5920,
    tier: "Superstar", tierColor: "#f59e0b", focus: "Kiiikiii · Indie", focusTag: "Kiiikiii",
    recentAct: "Broke down Kiiikiii 'FXCK UP THE WORLD' bridge — explained the 'hwaiting' energy and the indie concept era transition for MX K-indie fans. This annotation sparked a 3-hour thread.",
    annotations: 31, edits: 18, comments: 142, joinedMonth: "Mar 2024",
  },
  {
    rank: 5, username: "JiminCDMX_Lupita", initial: "L",
    city: "Mexico City", flag: "🇲🇽", points: 5110,
    tier: "Superstar", tierColor: "#f59e0b", focus: "Jimin · BTS", focusTag: "BTS",
    recentAct: "Translated 'Set Me Free Pt.2' line by line — explained 'chagiya' and the sub-unit dynamics for Spanish ARMYs. Called a daesang-level contribution by the CDMX ARMY Discord.",
    annotations: 24, edits: 20, comments: 131, joinedMonth: "Apr 2024",
  },
  {
    rank: 6, username: "LisaMexico_Daniela", initial: "D",
    city: "Mexico City", flag: "🇲🇽", points: 4680,
    tier: "Concert Tickets", tierColor: "#f59e0b", focus: "Lisa · BLACKPINK", focusTag: "BLACKPINK",
    recentAct: "Annotated LALISA with verified BLACKPINK CDMX merch drop details. Linked the fancam thread from the Mexico City Born Pink stop — 200+ saves.",
    annotations: 20, edits: 19, comments: 118, joinedMonth: "Apr 2024",
  },
  {
    rank: 7, username: "JungkookARMY_Ana", initial: "A",
    city: "Mexico City", flag: "🇲🇽", points: 3970,
    tier: "Superstar", tierColor: "#f59e0b", focus: "Jungkook · BTS", focusTag: "BTS",
    recentAct: "Standing Next to You — added the 80s retro concept etymology and maknae-on-top era timeline. Jungkook's global solo impact documented with CDMX streaming numbers.",
    annotations: 18, edits: 14, comments: 109, joinedMonth: "May 2024",
  },
  {
    rank: 8, username: "BlackpinkMX_Carolina", initial: "C",
    city: "Mexico City", flag: "🇲🇽", points: 3450,
    tier: "Superstar", tierColor: "#f59e0b", focus: "BLACKPINK", focusTag: "BLACKPINK",
    recentAct: "Kill This Love — created Mexico City Blink fan chant guide with full phonetics. Confirmed lightstick color codes and DDU-DU DDU-DU visual lineup for CDMX concerts.",
    annotations: 16, edits: 12, comments: 97, joinedMonth: "Jun 2024",
  },
  {
    rank: 9, username: "IndieMX_Carlos", initial: "C",
    city: "Mexico City", flag: "🇲🇽", points: 2890,
    tier: "Superstar", tierColor: "#f59e0b", focus: "Kiiikiii · Hyukoh", focusTag: "Indie",
    recentAct: "Compiled the CDMX K-indie discovery thread — documented the Hyukoh → Kiiikiii pipeline and how the indie concept era reached Mexico City's underground music scene.",
    annotations: 13, edits: 11, comments: 85, joinedMonth: "Jul 2024",
  },
  {
    rank: 10, username: "SugaCDMX_Yolanda", initial: "Y",
    city: "Mexico City", flag: "🇲🇽", points: 2310,
    tier: "Superstar", tierColor: "#f59e0b", focus: "Suga · Agust D", focusTag: "BTS",
    recentAct: "Agust D D-DAY Mexico City tour press notes added. Annotated Suga's sunbae rap line history — the most complete BTS rap line breakdown available for Spanish speakers.",
    annotations: 10, edits: 9, comments: 74, joinedMonth: "Aug 2024",
  },

  // ── NEW YORK ─────────────────────────────────────────────────────────────────
  {
    rank: 11, username: "NYCArmy_Jasmine", initial: "J",
    city: "New York", flag: "🇺🇸", points: 2070,
    tier: "Superstar", tierColor: "#f59e0b", focus: "j-hope · BTS", focusTag: "BTS",
    recentAct: "Annotated j-hope's Dynamite Lollapalooza set — added NYC ARMY Barclays Center fan gathering sidebar. The hwaiting energy in that annotation thread was unreal.",
    annotations: 9, edits: 8, comments: 68, joinedMonth: "Aug 2024",
  },
  {
    rank: 12, username: "JennieNYC_Mia", initial: "M",
    city: "New York", flag: "🇺🇸", points: 1920,
    tier: "Idol", tierColor: "#8b5cf6", focus: "Jennie · BLACKPINK", focusTag: "BLACKPINK",
    recentAct: "Jennie's MONEY — added Met Gala appearance context and the NYC Blink pop-up event. NYC stans called this a daesang moment for Jennie's solo bias wreckers.",
    annotations: 8, edits: 8, comments: 62, joinedMonth: "Sep 2024",
  },
  {
    rank: 13, username: "SugaBarclays_Tyler", initial: "T",
    city: "New York", flag: "🇺🇸", points: 1760,
    tier: "Idol", tierColor: "#8b5cf6", focus: "Suga · Agust D", focusTag: "BTS",
    recentAct: "Verified Suga's Agust D Tour Barclays Center setlist — corrected three bias wrecker rankings in the NYC ARMY Discord that had been wrong since the concert.",
    annotations: 8, edits: 7, comments: 57, joinedMonth: "Sep 2024",
  },
  {
    rank: 14, username: "KiiikiiBrooklyn_Sam", initial: "S",
    city: "New York", flag: "🇺🇸", points: 1640,
    tier: "Idol", tierColor: "#8b5cf6", focus: "Kiiikiii", focusTag: "Kiiikiii",
    recentAct: "Kiiikiii 'RAPUNZEL' — wrote the first English-language annotation on the platform. Broke down the concept era for Brooklyn stans discovering K-indie. Stan Kiiikiii for clear skin.",
    annotations: 7, edits: 7, comments: 53, joinedMonth: "Oct 2024",
  },
  {
    rank: 15, username: "RMsBookClub_Priya", initial: "P",
    city: "New York", flag: "🇺🇸", points: 1510,
    tier: "Idol", tierColor: "#8b5cf6", focus: "RM · Art", focusTag: "BTS",
    recentAct: "RM Indigo — connected the MoMA visit references to the album artwork. The NYC ARMY book club pinned this as the most thorough annotation on Indigo on any platform.",
    annotations: 6, edits: 7, comments: 49, joinedMonth: "Oct 2024",
  },
  {
    rank: 16, username: "PinkVenomNY_Zoe", initial: "Z",
    city: "New York", flag: "🇺🇸", points: 1390,
    tier: "Idol", tierColor: "#8b5cf6", focus: "BLACKPINK · Visual", focusTag: "BLACKPINK",
    recentAct: "Kill This Love + DDU-DU DDU-DU — compiled the NYC pop-up merch guide and visual era breakdown for new Blinks. Added BLACKPINK's New York setlist and fancam archive links.",
    annotations: 6, edits: 6, comments: 44, joinedMonth: "Nov 2024",
  },
  {
    rank: 17, username: "JhopeHarlem_Marcus", initial: "M",
    city: "New York", flag: "🇺🇸", points: 1240,
    tier: "Idol", tierColor: "#8b5cf6", focus: "j-hope · Hip-hop", focusTag: "BTS",
    recentAct: "j-hope Dynamite — caught a Harlem Shake cultural reference the entire fandom missed. The noona ARMYs in the replies were *screaming*. This annotation has 89 upvotes.",
    annotations: 5, edits: 6, comments: 40, joinedMonth: "Nov 2024",
  },
  {
    rank: 18, username: "EpikHighNYC_DeShawn", initial: "D",
    city: "New York", flag: "🇺🇸", points: 1080,
    tier: "Idol", tierColor: "#8b5cf6", focus: "Epik High · Indie", focusTag: "Indie",
    recentAct: "First to add Epik High to the New York city page — documented how the Korean indie-hip-hop scene shaped NYC's K-music venue circuit from Koreatown to Brooklyn.",
    annotations: 5, edits: 5, comments: 36, joinedMonth: "Nov 2024",
  },
  {
    rank: 19, username: "IndieCityKpop_Lily", initial: "L",
    city: "New York", flag: "🇺🇸", points: 870,
    tier: "Rising Star", tierColor: "#3b82f6", focus: "Kiiikiii · Crush", focusTag: "Indie",
    recentAct: "Annotated Kiiikiii 'ELASTIGIRL' — connected the indie concept to NYC underground music scene. Advised hoobae stans on building their K-indie playlists from scratch.",
    annotations: 4, edits: 4, comments: 30, joinedMonth: "Dec 2024",
  },
  {
    rank: 20, username: "K2NYC_Alexia", initial: "A",
    city: "New York", flag: "🇺🇸", points: 760,
    tier: "Rising Star", tierColor: "#3b82f6", focus: "NYC K-pop Scene", focusTag: "NYC",
    recentAct: "Added H Mart Koreatown, Pocha 32, and Jongno BBQ to the New York city page — the definitive NYC K-pop fan spot guide. Hwaiting to every stan who road-trips to NYC for this.",
    annotations: 3, edits: 4, comments: 28, joinedMonth: "Dec 2024",
  },

  // ── PARIS ────────────────────────────────────────────────────────────────────
  {
    rank: 21, username: "ARMYParis_Camille", initial: "C",
    city: "Paris", flag: "🇫🇷", points: 980,
    tier: "Rising Star", tierColor: "#3b82f6", focus: "BTS · OT7", focusTag: "BTS",
    recentAct: "BTS 'Life Goes On' — added La Défense Arena fan chant guide with French phonetics. Merci to the OT7 Paris fandom for the 60-person annotation review session.",
    annotations: 4, edits: 4, comments: 32, joinedMonth: "Dec 2024",
  },
  {
    rank: 22, username: "RoséParis_Sophie", initial: "S",
    city: "Paris", flag: "🇫🇷", points: 870,
    tier: "Rising Star", tierColor: "#3b82f6", focus: "Rosé · BLACKPINK", focusTag: "BLACKPINK",
    recentAct: "Rosé 'WHEN I'M WITH YOU' — annotated 'jeongmal' usage for French Blinks and documented her visual era at Paris Fashion Week. The most-saved annotation by French Blinks this quarter.",
    annotations: 4, edits: 3, comments: 28, joinedMonth: "Jan 2025",
  },
  {
    rank: 23, username: "KiiikiiFrance_Hugo", initial: "H",
    city: "Paris", flag: "🇫🇷", points: 780,
    tier: "Rising Star", tierColor: "#3b82f6", focus: "Kiiikiii · K-indie", focusTag: "Kiiikiii",
    recentAct: "Kiiikiii 'BORN AGAIN' — wrote the first French-language annotation breakdown on Aegyo Arena. The Paris K-indie community called it a *daebak* contribution to the global Kiiikiii fanbase.",
    annotations: 3, edits: 4, comments: 25, joinedMonth: "Jan 2025",
  },
  {
    rank: 24, username: "BangtanParis_Théo", initial: "T",
    city: "Paris", flag: "🇫🇷", points: 680,
    tier: "Rising Star", tierColor: "#3b82f6", focus: "Jungkook · BTS", focusTag: "BTS",
    recentAct: "Standing Next to You — added Paris Récréation fan meet 2024 context. Explained Jungkook's maknae-on-top journey for French ARMYs who are discovering BTS through his solo era.",
    annotations: 3, edits: 3, comments: 22, joinedMonth: "Feb 2025",
  },
  {
    rank: 25, username: "JinFanParis_Marie", initial: "M",
    city: "Paris", flag: "🇫🇷", points: 610,
    tier: "Rising Star", tierColor: "#3b82f6", focus: "Jin · BTS", focusTag: "BTS",
    recentAct: "Jin 'The Astronaut' Coldplay collab — annotated the Paris concert connection and explained worldwide handsome sunbae lore to French ARMYs discovering Jin's solo debut.",
    annotations: 3, edits: 3, comments: 19, joinedMonth: "Feb 2025",
  },
  {
    rank: 26, username: "SeoulVibesParis_Emma", initial: "E",
    city: "Paris", flag: "🇫🇷", points: 540,
    tier: "Rising Star", tierColor: "#3b82f6", focus: "IU · K-indie", focusTag: "Indie",
    recentAct: "IU '에잇 (Eight)' — added Louvre-inspired fan art exhibition context. The French K-indie stans are building something beautiful and this annotation is their bible.",
    annotations: 2, edits: 3, comments: 18, joinedMonth: "Mar 2025",
  },
  {
    rank: 27, username: "HyukohParis_Inès", initial: "I",
    city: "Paris", flag: "🇫🇷", points: 470,
    tier: "Rising Star", tierColor: "#3b82f6", focus: "Hyukoh · Indie", focusTag: "Indie",
    recentAct: "First to add Hyukoh to the Paris city page — documented the Korean indie rock influence on Paris's K-music café scene. Every hoobae Paris stan now has a starting point.",
    annotations: 2, edits: 3, comments: 15, joinedMonth: "Mar 2025",
  },
  {
    rank: 28, username: "SoyeonFan_Maxime", initial: "M",
    city: "Paris", flag: "🇫🇷", points: 410,
    tier: "Rising Star", tierColor: "#3b82f6", focus: "(G)I-DLE · Soyeon", focusTag: "G)I-DLE",
    recentAct: "Soyeon's 'Woman' lyric annotation — explained the feminist historical concept for French stans. She is the center, the visual, and the all-kill machine. Bias confirmed.",
    annotations: 2, edits: 2, comments: 14, joinedMonth: "Apr 2025",
  },
  {
    rank: 29, username: "CrushParis_Léa", initial: "L",
    city: "Paris", flag: "🇫🇷", points: 360,
    tier: "Rising Star", tierColor: "#3b82f6", focus: "Crush · K-R&B", focusTag: "Indie",
    recentAct: "First Crush annotation on the platform — 'Lay Me Down' breakdown for Paris K-R&B fans. The hoobae stans are paying attention and the K-indie Paris scene is growing because of this.",
    annotations: 2, edits: 2, comments: 11, joinedMonth: "Apr 2025",
  },
  {
    rank: 30, username: "NewJeansParis_Florian", initial: "F",
    city: "Paris", flag: "🇫🇷", points: 310,
    tier: "Rising Star", tierColor: "#3b82f6", focus: "NewJeans · Y2K", focusTag: "NewJeans",
    recentAct: "MOONLIT FLOOR (KISS ME) — added Paris premiere screening context and the Y2K aesthetic breakdown for French Bunnies. The aegyo in that MV has never been more thoroughly documented.",
    annotations: 1, edits: 2, comments: 10, joinedMonth: "May 2025",
  },
];

// Followers are derived from standing (points, rank, annotations) with a small
// deterministic per-user variation so the count reads organically rather than
// perfectly tracking points. Real DB follows are layered on top at the profile level.
// URL-safe slug shared by contributor slugs and real-user profile lookups.
export function slugify(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const CONTRIBUTORS: Contributor[] = RAW.map((c) => ({
  ...c,
  slug: slugify(c.username),
  followers: Math.round(c.points * 0.15 + (31 - c.rank) * 14 + c.annotations * 4 + (c.username.length % 7) * 23),
}));

export function contributorBySlug(slug: string): Contributor | undefined {
  return CONTRIBUTORS.find((c) => c.slug === slug);
}

export const CITY_TOTALS: Record<City, { contributors: number; totalPoints: number; topSong: string }> = {
  "Mexico City": { contributors: 10, totalPoints: 50310, topSong: "봄날 (Spring Day)" },
  "New York":    { contributors: 10, totalPoints: 14440, topSong: "Dynamite" },
  "Paris":       { contributors: 10, totalPoints: 6010,  topSong: "Life Goes On" },
};
