// Culture Vulture — 4 social-content topic pages (dance / fashion / beauty / mukbang).
// One template renders all four; the first embed is the "Video of the Day" hero, the
// rest fill the "Right Now" grid.

export type CultureTopic = "dance" | "fashion" | "beauty" | "mukbang";

export type Embed =
  | { kind: "instagram"; permalink: string }
  | { kind: "youtube"; id: string }
  | { kind: "tiktok"; url: string };

export type TopicMeta = {
  key: CultureTopic;
  title: string;
  emoji: string;
  tagline: string;
  blurb: string;
  embeds: Embed[];
};

const ig = (id: string, type: "reel" | "p" = "reel"): Embed => ({ kind: "instagram", permalink: `https://www.instagram.com/${type}/${id}/` });
const yt = (id: string): Embed => ({ kind: "youtube", id });
const tt = (slug: string): Embed => ({ kind: "tiktok", url: `https://www.tiktok.com/t/${slug}/` });

export const TOPIC_ORDER: CultureTopic[] = ["dance", "fashion", "beauty", "mukbang"];

// ── Rich layout data (Dance) — featured Video of the Day + "Right Now" grid +
// "Learn the Moves" tutorials, mirroring the reference template. ─────────────────
export type FeaturedVideo = { label: string; title: string; desc: string; initials: string; channel: string; type: string; youtubeId: string };
export type RightNowCard = {
  rank: string; title: string; initials: string; channel: string; type: string;
  source: "youtube" | "reels"; youtubeId?: string; thumb?: string; views?: string; href?: string;
};
export type Tutorial = { tag: string; level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"; title: string; subtitle: string; youtubeId: string };
export type RichTopic = { featured: FeaturedVideo; rightNow: RightNowCard[]; tutorials: Tutorial[] };

export const RICH: Partial<Record<CultureTopic, RichTopic>> = {
  dance: {
    featured: {
      label: "Featured on YouTube",
      title: 'ILLIT — "It’s Me" Dance Practice (Mirrored)',
      desc: "The mirrored version everyone’s using to learn the chorus point choreo, count by count. This is the one the whole fandom is drilling this week.",
      initials: "IL", channel: "ILLIT Official", type: "Dance Practice", youtubeId: "dpJfhmeBdfU",
    },
    rightNow: [
      { rank: "01", title: 'LE SSERAFIM — "CELEBRATION"', initials: "LS", channel: "LE SSERAFIM Official", type: "Moving ver.", source: "youtube", youtubeId: "D3qz8aAyKME" },
      { rank: "02", title: 'KATSEYE — "Gabriela"', initials: "KE", channel: "KATSEYE Official", type: "Dance Practice", source: "youtube", youtubeId: "lll3eKuBJ8w" },
      { rank: "03", title: "Group Challenge", initials: "SM", channel: "smashtalentkids", type: "Reels", source: "reels", views: "478.1K", thumb: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80", href: "https://www.instagram.com/smashtalentkids" },
      { rank: "04", title: '*NSYNC — "I Want You Back"', initials: "SR", channel: "sproutingrenee", type: "Reels", source: "reels", views: "3.2K", thumb: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&q=80", href: "https://www.instagram.com/sproutingrenee" },
      { rank: "05", title: '"Original Audio"', initials: "BR", channel: "bam_ravelo", type: "Reels", source: "reels", views: "63.4K", thumb: "https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=600&q=80", href: "https://www.instagram.com/bam_ravelo" },
      { rank: "06", title: 'Jung Kook — "Standing Next to You"', initials: "IJ", channel: "itsjasonzamora", type: "Reels", source: "reels", views: "12.7K", thumb: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=80", href: "https://www.instagram.com/itsjasonzamora" },
    ],
    tutorials: [
      { tag: "Chorus", level: "BEGINNER", title: 'ILLIT "It’s Me" — chorus + dance break, step by step', subtitle: "YouTube · Slowed 0.75x tutorial", youtubeId: "Cv45rfEohlM" },
      { tag: "Mirrored", level: "INTERMEDIATE", title: 'LE SSERAFIM "CELEBRATION" — full mirrored breakdown', subtitle: "YouTube · Step by step tutorial", youtubeId: "9KUb3tXLVv0" },
      { tag: "Full Routine", level: "ADVANCED", title: 'KATSEYE "Gabriela" — slow, mirrored, with counts', subtitle: "YouTube · SHERO dance tutorial", youtubeId: "podqp0szGaY" },
    ],
  },
};

export const CULTURE: Record<CultureTopic, TopicMeta> = {
  dance: {
    key: "dance",
    title: "Dance",
    emoji: "💃",
    tagline: "Choreo, covers & challenges",
    blurb: "The moves the fandom can't stop looping — point choreography, dance covers, and the challenges blowing up across Reels right now.",
    embeds: [ig("DWy2SSwASyv"), ig("DYth9jESBvi"), ig("DWz3FVkiHFX"), ig("DZX2gAZJrJu"), ig("DYv8VaNitHv"), ig("DWzzdknj1Ci")],
  },
  fashion: {
    key: "fashion",
    title: "Fashion",
    emoji: "👗",
    tagline: "Fits, airport looks & runway",
    blurb: "Idol fits, airport fashion, and red-carpet moments the fandom is dissecting frame by frame.",
    embeds: [
      ig("DX98jtWIBgC"), ig("DYB50KJEYj4"), ig("DX8GxZWj1MY", "p"), ig("DXt_rHUDRIq"), ig("DW4fBZgDHUG"), ig("DYOzawixRgH"),
      tt("ZTBb11NSc"), tt("ZTBqouGqn"), tt("ZTBqobQwa"), tt("ZTBqoa67V"), tt("ZTBqoqSRm"),
      ig("DRJ7OKKkVQ4"), ig("DJczCWsyDF3"), ig("B8k_vRtHXrQ", "p"),
    ],
  },
  beauty: {
    key: "beauty",
    title: "Beauty",
    emoji: "💄",
    tagline: "Makeup, skincare & glow-ups",
    blurb: "Idol makeup looks, K-beauty routines, and get-ready-with-me breakdowns. Curated drops coming soon.",
    embeds: [],
  },
  mukbang: {
    key: "mukbang",
    title: "Mukbang",
    emoji: "🍜",
    tagline: "Eat with your faves",
    blurb: "Mukbang and what-I-eat-in-a-day videos — the comfort-watch corner of the fandom.",
    embeds: [yt("hBMaTyVrOfc"), yt("wjdsvcT0uQA"), yt("5e15ZMCOCfA")],
  },
};
