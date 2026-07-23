// Curated K-pop / K-entertainment / K-beauty news sources for the homepage feed.
// The `news-publisher` skill reads these feeds, keeps only stories about artists
// on /artists, rewrites each in the Aegyo Arena voice, and links back to the
// source. Publicly visible at /api/news/sources so the breadth (30+ publishers,
// not just one) can be verified. Keep in sync with
// ~/.claude/skills/news-publisher/SKILL.md.

export type NewsSource = {
  name: string;
  url: string;      // section / homepage
  feed?: string;    // RSS feed if known (else the publisher derives it)
  kind: "aggregator" | "wire" | "culture" | "kbeauty" | "explainer";
};

export const NEWS_SOURCES: NewsSource[] = [
  // ── K-pop aggregators / fan news ─────────────────────────────────────────
  { name: "Soompi",          url: "https://www.soompi.com/",                            feed: "https://www.soompi.com/feed",          kind: "aggregator" },
  { name: "Koreaboo",        url: "https://www.koreaboo.com/",                          feed: "https://www.koreaboo.com/feed/",       kind: "aggregator" },
  { name: "allkpop",         url: "https://www.allkpop.com/",                           feed: "https://www.allkpop.com/rss_xml/lab.php", kind: "aggregator" },
  { name: "Asian Junkie",    url: "https://www.asianjunkie.com/",                       feed: "https://www.asianjunkie.com/feed/",    kind: "aggregator" },
  { name: "kbizoom",         url: "https://kbizoom.com/",                               feed: "https://kbizoom.com/feed/",            kind: "aggregator" },
  { name: "Hellokpop",       url: "https://www.hellokpop.com/",                         feed: "https://www.hellokpop.com/feed/",      kind: "aggregator" },
  { name: "KpopMap",         url: "https://www.kpopmap.com/",                           feed: "https://www.kpopmap.com/feed/",        kind: "aggregator" },
  { name: "KpopStarz",       url: "https://www.kpopstarz.com/",                                                                       kind: "aggregator" },
  { name: "gokpop",          url: "https://www.gokpop.co/",                                                                           kind: "aggregator" },
  { name: "KpopWorld",       url: "https://www.kpopworld.com/news",                                                                   kind: "aggregator" },
  { name: "Kpopangel",       url: "https://www.kpopangel.com/",                                                                       kind: "aggregator" },
  { name: "United Kpop",     url: "https://unitedkpop.com/",                            feed: "https://unitedkpop.com/feed/",         kind: "aggregator" },
  { name: "asianfeed",       url: "https://asianfeed.com/category/music/",                                                            kind: "aggregator" },
  { name: "Kpopping",        url: "https://kpopping.com/community",                                                                   kind: "aggregator" },
  // Feedspot is a DIRECTORY of K-pop RSS feeds — mine it to discover additional
  // publisher feeds, not as an article source itself.
  { name: "Feedspot K-pop",  url: "https://rss.feedspot.com/kpop_rss_feeds/",                                                         kind: "aggregator" },

  // ── Wire / mainstream Korea desks ────────────────────────────────────────
  { name: "Yonhap",          url: "https://m-en.yna.co.kr/culture/k-pop",                                                             kind: "wire" },
  { name: "Korea Times",     url: "https://www.koreatimes.co.kr/entertainment/k-pop",                                                 kind: "wire" },
  { name: "Korea Herald",    url: "https://www.koreaherald.com/culture",                feed: "https://www.koreaherald.com/rss/020000000000.xml", kind: "wire" },
  { name: "JoongAng Daily",  url: "https://koreajoongangdaily.joins.com/section/entertainment",                                       kind: "wire" },
  { name: "Chosun (English)",url: "https://www.chosun.com/english/kpop-culture-en/",                                                  kind: "wire" },
  { name: "SCMP K-pop",      url: "https://www.scmp.com/k-pop",                                                                       kind: "wire" },
  { name: "CNA Lifestyle",   url: "https://cnalifestyle.channelnewsasia.com/entertainment",                                          kind: "wire" },
  { name: "Mnet Plus",       url: "https://www.mnetplus.world/contents/en",                                                           kind: "wire" },

  // ── Western / global music + culture ─────────────────────────────────────
  { name: "Billboard",       url: "https://www.billboard.com/c/music/k-pop/",           feed: "https://www.billboard.com/feed/",      kind: "culture" },
  { name: "NME",             url: "https://www.nme.com/news/music/k-pop",               feed: "https://www.nme.com/feed",             kind: "culture" },
  { name: "Rolling Stone",   url: "https://www.rollingstone.com/t/k-pop/",              feed: "https://www.rollingstone.com/music/feed/", kind: "culture" },
  { name: "Teen Vogue",      url: "https://www.teenvogue.com/tag/k-pop",                feed: "https://www.teenvogue.com/feed/rss",   kind: "culture" },
  { name: "Paper Magazine",  url: "https://www.papermag.com/",                          feed: "https://www.papermag.com/rss.xml",     kind: "culture" },
  { name: "Pinkvilla",       url: "https://www.pinkvilla.com/entertainment/korean",                                                   kind: "culture" },
  { name: "Sportskeeda",     url: "https://www.sportskeeda.com/pop-culture",                                                          kind: "culture" },
  { name: "Times of India",  url: "https://timesofindia.indiatimes.com/etimes/k-pop",                                                 kind: "culture" },
  { name: "The Conversation",url: "https://theconversation.com/topics/k-pop-8167",                                                    kind: "explainer" },
  { name: "Distractify",     url: "https://www.distractify.com/",                                                                     kind: "explainer" },

  // ── K-beauty (for the advertiser angle) ──────────────────────────────────
  { name: "Hypebae",         url: "https://hypebae.com/",                               feed: "https://hypebae.com/feed",             kind: "kbeauty" },
  { name: "Allure",          url: "https://www.allure.com/",                            feed: "https://www.allure.com/feed/rss",      kind: "kbeauty" },
  { name: "Dazed Beauty",    url: "https://www.dazeddigital.com/beauty",                                                              kind: "kbeauty" },
  { name: "Byrdie",          url: "https://www.byrdie.com/",                                                                          kind: "kbeauty" },
];
