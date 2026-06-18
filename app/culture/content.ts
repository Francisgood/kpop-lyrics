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
