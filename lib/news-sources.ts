// Curated K-pop news sources for the homepage feed (the `news-publisher` skill
// reads these, keeps only stories about artists on /artists, writes ORIGINAL
// own-words summaries, and links back to the source). Keep in sync with
// ~/.claude/skills/news-publisher/SKILL.md.

export type NewsSource = {
  name: string;
  url: string;      // section / homepage
  feed?: string;    // RSS feed if known (else the publisher derives it)
  kind: "aggregator" | "wire" | "explainer";
};

export const NEWS_SOURCES: NewsSource[] = [
  { name: "Koreaboo",        url: "https://www.koreaboo.com/",                          feed: "https://www.koreaboo.com/feed/",       kind: "aggregator" },
  { name: "Asian Junkie",    url: "https://www.asianjunkie.com/",                       feed: "https://www.asianjunkie.com/feed/",    kind: "aggregator" },
  { name: "KpopStarz",       url: "https://www.kpopstarz.com/",                                                                       kind: "aggregator" },
  { name: "kbizoom",         url: "https://kbizoom.com/",                                                                             kind: "aggregator" },
  { name: "gokpop",          url: "https://www.gokpop.co/",                                                                           kind: "aggregator" },
  { name: "KpopWorld",       url: "https://www.kpopworld.com/news",                                                                   kind: "aggregator" },
  { name: "Kpopangel",       url: "https://www.kpopangel.com/",                                                                       kind: "aggregator" },
  { name: "United Kpop",     url: "https://unitedkpop.com/",                                                                          kind: "aggregator" },
  { name: "asianfeed",       url: "https://asianfeed.com/category/music/",                                                            kind: "aggregator" },
  { name: "Yonhap",          url: "https://m-en.yna.co.kr/culture/k-pop",                                                             kind: "wire" },
  { name: "Korea Times",     url: "https://www.koreatimes.co.kr/entertainment/k-pop",                                                 kind: "wire" },
  { name: "Chosun (English)",url: "https://www.chosun.com/english/kpop-culture-en/",                                                  kind: "wire" },
  { name: "SCMP K-pop",      url: "https://www.scmp.com/k-pop",                                                                       kind: "wire" },
  { name: "CNA Lifestyle",   url: "https://cnalifestyle.channelnewsasia.com/entertainment",                                          kind: "wire" },
  { name: "The Conversation",url: "https://theconversation.com/topics/k-pop-8167",                                                    kind: "explainer" },
  { name: "Mnet Plus",       url: "https://www.mnetplus.world/contents/en",                                                           kind: "wire" },
  { name: "Distractify",     url: "https://www.distractify.com/",                                                                     kind: "explainer" },
  { name: "KoreanTopik",     url: "https://www.koreantopik.com/",                                                                     kind: "aggregator" },
];
