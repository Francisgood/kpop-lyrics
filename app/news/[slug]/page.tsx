import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// ── 21 Cities ─────────────────────────────────────────────────────────────────

const CITIES = [
  { slug: "new-york",      name: "New York",       flag: "🇺🇸", country: "USA" },
  { slug: "los-angeles",   name: "Los Angeles",    flag: "🇺🇸", country: "USA" },
  { slug: "seoul",         name: "Seoul",           flag: "🇰🇷", country: "South Korea" },
  { slug: "tokyo",         name: "Tokyo",           flag: "🇯🇵", country: "Japan" },
  { slug: "london",        name: "London",          flag: "🇬🇧", country: "UK" },
  { slug: "bangkok",       name: "Bangkok",         flag: "🇹🇭", country: "Thailand" },
  { slug: "paris",         name: "Paris",           flag: "🇫🇷", country: "France" },
  { slug: "mexico-city",   name: "Mexico City",     flag: "🇲🇽", country: "Mexico" },
  { slug: "chicago",       name: "Chicago",         flag: "🇺🇸", country: "USA" },
  { slug: "dallas",        name: "Dallas",          flag: "🇺🇸", country: "USA" },
  { slug: "tampa",         name: "Tampa",           flag: "🇺🇸", country: "USA" },
  { slug: "boston",        name: "Boston",          flag: "🇺🇸", country: "USA" },
  { slug: "scottsdale",    name: "Scottsdale",      flag: "🇺🇸", country: "USA" },
  { slug: "sao-paulo",     name: "São Paulo",       flag: "🇧🇷", country: "Brazil" },
  { slug: "buenos-aires",  name: "Buenos Aires",    flag: "🇦🇷", country: "Argentina" },
  { slug: "madrid",        name: "Madrid",          flag: "🇪🇸", country: "Spain" },
  { slug: "milan",         name: "Milan",           flag: "🇮🇹", country: "Italy" },
  { slug: "dubai",         name: "Dubai",           flag: "🇦🇪", country: "UAE" },
  { slug: "manila",        name: "Manila",          flag: "🇵🇭", country: "Philippines" },
  { slug: "kuala-lumpur",  name: "Kuala Lumpur",    flag: "🇲🇾", country: "Malaysia" },
  { slug: "shanghai",      name: "Shanghai",        flag: "🇨🇳", country: "China" },
];

// ── City Insights per Article ──────────────────────────────────────────────────

const CITY_INSIGHTS: Record<string, Record<string, { headline: string; stat: string; body: string }>> = {

  "instagram-top-10-2026": {
    "new-york":     { headline: "East Coast Stan Central", stat: "~2.4M K-pop followers", body: "NYC leads the US in active K-pop fan pages, with Lisa and Jennie accounts regularly hitting 100K+ likes on event nights. The NYC Blinks chapter runs weekly IG Lives." },
    "los-angeles":  { headline: "BLACKPINK's US Heartbeat", stat: "~3.1M K-pop followers", body: "The LA metro has the highest K-pop Instagram engagement in the Western Hemisphere. Lisa's LA fanbase helped push her to 107M by organizing coordinated streaming and IG story campaigns." },
    "seoul":        { headline: "The Source", stat: "Follower growth origin", body: "Every idol's Instagram follower spike starts here. Seoul fans clock every post within seconds — the city accounts for nearly 18% of K-pop artists' first-hour engagement." },
    "tokyo":        { headline: "Quiet Power", stat: "~1.9M K-pop followers", body: "Japanese fans rarely comment loudly, but their engagement rate is among the highest globally. V and Jimin both see outsized Tokyo impressions relative to follower count." },
    "london":       { headline: "Europe's Stan Hub", stat: "~1.1M K-pop followers", body: "London leads Europe in K-pop Instagram activity. The UK BLINK collective has coordinated three major Instagram follower pushes for the group in 2025–26." },
    "bangkok":      { headline: "Lisa's Home Turf", stat: "~2.8M K-pop followers", body: "Lisa being Thai means Bangkok delivers the highest per-capita K-pop Instagram engagement on the planet. Local fan clubs manage 40+ active stan accounts just for her." },
    "paris":        { headline: "Rosé's European Anchor", stat: "~870K K-pop followers", body: "After BLACKPINK's Paris shows and Rosé's fashion week appearances, Paris became the EU's second-biggest Instagram fan hub. French BLINK accounts grew 34% in 2025." },
    "mexico-city":  { headline: "LatAm's Loudest Stans", stat: "~1.6M K-pop followers", body: "Mexico City stans are known for going viral — their BTS and BLACKPINK fan cams and edit accounts regularly cross 500K views, driving follower spikes for idols." },
    "chicago":      { headline: "Midwest Stan Army", stat: "~780K K-pop followers", body: "The Chicago K-pop community punches above its weight. Three Chicago-based fan edit accounts have over 200K followers each — unusually high for a mid-size US metro." },
    "dallas":       { headline: "Texas Blink Brigade", stat: "~690K K-pop followers", body: "Dallas hosted BLACKPINK's SoFi events watch party and saw a 22% spike in local K-pop Instagram follows the week after. The DFW ARMY chapter has 45K members." },
    "tampa":        { headline: "Gulf Coast Fandom Rising", stat: "~340K K-pop followers", body: "Tampa's K-pop scene is younger and faster-growing than most US metros. University of South Florida has one of the most active campus K-pop clubs in the Southeast." },
    "boston":       { headline: "College Town, Global Taste", stat: "~520K K-pop followers", body: "Dense university population means Boston's K-pop Instagram engagement skews 18–24, with MIT and Harvard students running some of the most analytically detailed K-pop fan accounts online." },
    "scottsdale":   { headline: "Desert Stans", stat: "~210K K-pop followers", body: "Small but devoted — Scottsdale's K-pop community is tightly knit and known for showing up in force to regional events. Several Arizona ARMY accounts have broken 50K followers." },
    "sao-paulo":    { headline: "South America's Biggest Base", stat: "~2.2M K-pop followers", body: "Brazil leads South America in K-pop Instagram activity, and São Paulo is the epicenter. V's visit photos sparked the highest single-day follower gain for any idol in Brazil's history." },
    "buenos-aires": { headline: "Argentina ARMYs Are Unmatched", stat: "~1.4M K-pop followers", body: "Argentine fans are globally famous for their passion. Buenos Aires stan accounts regularly trend on X during album drops, driving cross-platform Instagram spikes." },
    "madrid":       { headline: "Spain's K-wave Hub", stat: "~760K K-pop followers", body: "Madrid K-pop fans organized a 5,000-person flashmob for BTS's anniversary in 2025 that went globally viral — adding an estimated 200K Instagram followers to BTS members overnight." },
    "milan":        { headline: "Fashion Capital Meets K-pop", stat: "~480K K-pop followers", body: "Milan fans overlap heavily with the fashion crowd. Jennie's Chanel appearances and Rosé's Saint Laurent connections have made BLACKPINK's Italian fan accounts some of the most aesthetic." },
    "dubai":        { headline: "Gulf Fandom on the Rise", stat: "~620K K-pop followers", body: "Dubai's K-pop community is young, wealthy, and growing fast. Several idols' Dubai concert announcements have generated record-high local Instagram engagement within minutes." },
    "manila":       { headline: "Southeast Asia's K-pop Heart", stat: "~3.4M K-pop followers", body: "The Philippines has one of the world's highest K-pop fan densities. Manila stan accounts dominate Southeast Asian K-pop Twitter and drive massive Instagram follow campaigns." },
    "kuala-lumpur": { headline: "Malaysia's K-wave Machine", stat: "~1.7M K-pop followers", body: "KL's K-pop community is highly organized — fan clubs here coordinated 72-hour streaming marathons for Jimin's solo debut, earning recognition from his official fansite." },
    "shanghai":     { headline: "China's K-pop Pulse", stat: "~2.9M K-pop followers", body: "Despite platform restrictions, Shanghai fans are deeply connected via Weibo and Instagram VPN usage. EXO and SuperM have particularly strong Shanghai fan networks." },
  },

  "most-streamed-spotify-2025": {
    "new-york":     { headline: "JENNIE Dominates the Playlist", stat: "#1 K-pop: JENNIE – 41.7M", body: "NYC's editorial playlists on Spotify pushed JENNIE's solo cuts hard in late 2025. Her collab tracks chart highest in the Tri-State area, where K-pop listening surged 28% YoY." },
    "los-angeles":  { headline: "KATSEYE Built Here", stat: "#1 K-pop: KATSEYE – 33.5M", body: "KATSEYE formed via a US-based competition, and LA claims them. Their Spotify numbers spike sharply in the LA metro, where several members grew up and still have hometown followings." },
    "seoul":        { headline: "Hometown Advantage for Everyone", stat: "All artists charting", body: "Seoul streams all ten artists within the top 100 simultaneously. BLACKPINK and BTS see their highest Korean streaming numbers in Seoul, especially on comeback days." },
    "tokyo":        { headline: "BLACKPINK Rules Japan", stat: "#1 K-pop: BLACKPINK – 25.7M", body: "Japan's Spotify market leans heavily BLACKPINK — their Japanese releases and Tokyo Dome concert albums drive consistent streaming. ROSÉ's solo work also polls high here." },
    "london":       { headline: "BTS Streams Power the UK", stat: "#1 K-pop: BTS – 23.7M", body: "London drives BTS's UK numbers — their English-language releases chart in the UK Viral 50 regularly. Jimin's solo album saw a 3-day listening event organized by UK ARMY." },
    "bangkok":      { headline: "LISA's Home Stream", stat: "#1 K-pop: JENNIE – 41.7M", body: "Thai fans stream JENNIE and LISA relentlessly. Bangkok Spotify charts see K-pop in 40%+ of top-streamed tracks weekly, with BLACKPINK soloist cuts dominating year-round." },
    "paris":        { headline: "ROSÉ Rules the French Charts", stat: "#1 K-pop: ROSÉ – 30.6M", body: "ROSÉ's French Spotify numbers are the highest of any BLACKPINK member outside Korea, boosted by her Saint Laurent Paris appearances and French media coverage." },
    "mexico-city":  { headline: "BTS's Latin Stronghold", stat: "#1 K-pop: BTS – 23.7M", body: "Mexico City is one of BTS's top-5 streaming cities globally. Fan streaming parties during Map of the Soul anniversary pushed BTS's Mexico numbers to an all-time high in 2025." },
    "chicago":      { headline: "Stray Kids Climbing Fast", stat: "#1 K-pop: Stray Kids – 14.1M", body: "Chicago's Spotify charts saw Stray Kids make unexpected inroads in 2025, driven by a viral TikTok challenge that originated in the Chicago Korean community in Wicker Park." },
    "dallas":       { headline: "TWICE's Texas Moment", stat: "#1 K-pop: TWICE – 22.2M", body: "TWICE's Texan fanbase is among the most loyal in the US. Their Dallas streaming numbers spiked 40% after their stadium show in the DFW area in late 2024." },
    "tampa":        { headline: "ENHYPEN Breaking Through", stat: "#1 K-pop: ENHYPEN – 9.3M", body: "Tampa's younger demo skews toward 4th-gen groups. ENHYPEN's Spotify numbers are growing fastest in Tampa's 16–24 demographic, outpacing their US national average." },
    "boston":       { headline: "Data-Driven Streaming", stat: "#1 K-pop: BTS – 23.7M", body: "Boston's university crowd streams analytically — BTS tops here, with students tracking weekly Spotify plays and organizing coordinated playlisting campaigns for comeback days." },
    "scottsdale":   { headline: "BLACKPINK Poolside", stat: "#1 K-pop: BLACKPINK – 25.7M", body: "Scottsdale's leisure-heavy lifestyle means K-pop tracks get heavy background playlist play. BLACKPINK's dance tracks chart highest in gym and outdoor playlist categories here." },
    "sao-paulo":    { headline: "Brazil's Streaming Giant", stat: "#1 K-pop: BTS – 23.7M", body: "São Paulo is consistently BTS's #2 or #3 highest-streaming city globally. ARMY Brazil ran 48-hour streaming marathons for 'Butter' and 'Dynamite' that broke Spotify records." },
    "buenos-aires": { headline: "Passionate Plays", stat: "#1 K-pop: BTS – 23.7M", body: "Argentine fans are legendary for streaming dedication. Buenos Aires had the highest per-user BTS stream count in Latin America for three consecutive months in 2025." },
    "madrid":       { headline: "Spain Streams KATSEYE", stat: "#1 K-pop: KATSEYE – 33.5M", body: "Spain has surprisingly strong KATSEYE numbers — their pop-forward sound resonates with Madrid's playlist culture. Several Spanish Spotify editorial picks featured KATSEYE in Q4 2025." },
    "milan":        { headline: "Fashion & Sound Collide", stat: "#1 K-pop: JENNIE – 41.7M", body: "Milan's JENNIE numbers are off the chart — her music plays in retail stores, fashion shows, and bars across the city. She's the only K-pop artist regularly on Milan's commercial radio." },
    "dubai":        { headline: "HUNTR/X Leads the Gulf", stat: "#1 K-pop: HUNTR/X – 48.1M", body: "HUNTR/X has cracked Spotify's Gulf Arabic editorial playlists. Dubai's cosmopolitan expat community, heavy with Southeast Asian K-pop fans, drives consistent streaming across all top acts." },
    "manila":       { headline: "Philippines: K-pop Streaming Capital", stat: "#1 K-pop: BLACKPINK – 25.7M", body: "Manila's Spotify streams per capita for K-pop are among the highest in the world. BLACKPINK has the most-saved album in Philippine Spotify history. Every comeback is a national event." },
    "kuala-lumpur": { headline: "TWICE Reigns in Malaysia", stat: "#1 K-pop: TWICE – 22.2M", body: "TWICE's Malaysian numbers are powered by KL's large ONCE fanbase. Their city chapter organized a 24-hour streaming party for 'Ready to Be' that pushed the album into the MY chart top 3." },
    "shanghai":     { headline: "EXO Holds Strong", stat: "#1 K-pop: BTS – 23.7M", body: "Despite streaming market complexity, Shanghai's VPN-enabled K-pop listeners push BTS and EXO numbers consistently. Chinese fans are among the most dedicated playlist builders on Spotify." },
  },

  "jungkook-jimin-spotify": {
    "new-york":     { headline: "Jimin's NY Army Night", stat: "Jimin – 56M IG followers", body: "New York ARMY held a sold-out listening party for Jimin's 'FACE' album at a Times Square venue in 2023 that remains the largest solo BTS member event in the city's history." },
    "los-angeles":  { headline: "Jungkook's Hollywood Moment", stat: "JK sold out LA in 48hrs", body: "Jungkook's solo LA shows sold out in under 48 hours. His Spotify monthly listener count hits its weekly peak on Fridays in the LA metro, driven by fan playlisting campaigns." },
    "seoul":        { headline: "From Seoul With Love", stat: "Home city, global domination", body: "Both artists grew up in or near Seoul. Their Spotify numbers here are the highest globally on a per-capita basis, with local fans streaming daily to push their charts." },
    "tokyo":        { headline: "Japan's BTS Devotion", stat: "JK #1 in Japan Spotify", body: "Jungkook is the #1 most-streamed BTS solo artist in Japan. Tokyo fans were the first to organize 'Golden Hour' streaming events, later adopted worldwide." },
    "london":       { headline: "Wembley Echoes On", stat: "Post-Wembley stream spike +67%", body: "BTS's Wembley shows remain legendary. London ARMY still runs annual 'Wembley anniversary' streaming events for Jungkook and Jimin, keeping their UK charts warm year-round." },
    "bangkok":      { headline: "Southeast Asia BTS Beacon", stat: "Jimin – top-streamed BTS solo", body: "Bangkok's BTS fandom is enormous and dedicated. Jimin's 'Like Crazy' holds the record for most single-day streams by a BTS solo act in Thailand, set on release day 2023." },
    "paris":        { headline: "The Stade de France Effect", stat: "+112% streams post-Paris show", body: "BTS's Paris concerts triggered a 112% spike in Jungkook and Jimin's French Spotify streams. Paris ARMY still maintains active streaming parties tied to the show's anniversary." },
    "mexico-city":  { headline: "Latin ARMY's BTS Obsession", stat: "BTS top-10 all year in MX", body: "Mexico City has one of the most active BTS solo streaming communities globally. Jimin's birthday streams and Jungkook's comeback day coordinations are organized weeks in advance." },
    "chicago":      { headline: "Chi-Town Stans Go Hard", stat: "JK streams +41% in 2025", body: "Chicago ARMY saw a major membership surge in 2025. Jungkook's 'Golden' album drove the biggest single-week K-pop streaming event in Chicago Spotify history." },
    "dallas":       { headline: "Texas-Sized BTS Love", stat: "Jimin – most-saved BTS solo TX", body: "Dallas fans saved Jimin's 'FACE' more than any other BTS solo album in Texas. The DFW ARMY chapter ran a 3-day streaming campaign on release weekend." },
    "tampa":        { headline: "Gulf Coast BTS", stat: "Growing 4th-gen crossover", body: "Tampa's younger ARMY base has been crossing over to 4th gen groups, but Jungkook remains their anchor. His Instagram following here grew 18% in the 6 months after military completion." },
    "boston":       { headline: "Academic ARMYs Analyze the Data", stat: "Harvard K-pop Society top listener", body: "Boston's ARMY chapters include several university clubs that publish detailed streaming analytics. Their coordinated playlisting for Jimin's 'Promise' helped push it to 100M Spotify streams." },
    "scottsdale":   { headline: "Desert ARMY Rally", stat: "Jungkook – top artist Nov 2025", body: "Scottsdale ARMY organized a listening event for Jungkook's 'Standing Next to You' at a local venue that drew 400 fans — the largest K-pop event in Arizona that year." },
    "sao-paulo":    { headline: "Brazil's BTS Royalty", stat: "Jimin – #1 BTS solo BR", body: "Brazil treats Jimin and Jungkook like global pop royalty. São Paulo's Spotify numbers for both artists are in the top 5 cities worldwide, sustained by year-round fan coordination." },
    "buenos-aires": { headline: "Argentina Goes All In", stat: "+89% streams on JK's bday", body: "Argentine ARMY runs one of the world's most coordinated streaming campaigns. Jungkook's birthday streams in Buenos Aires hit 89% above baseline — one of the highest in Latin America." },
    "madrid":       { headline: "Spain's BTS Devotion", stat: "Jimin – #1 K-pop solo ES", body: "Jimin is the #1 streamed K-pop solo artist in Spain. Madrid ARMY organized a public flash mob and streaming event for 'Like Crazy' that was covered by El País." },
    "milan":        { headline: "Italian ARMY Aesthetic", stat: "Jungkook – top 5 IT streams", body: "Milan's ARMY has a strong visual culture — their fan edits and photo books for Jungkook are among the highest quality in Europe. Both artists stream consistently in the Italian top 5 K-pop." },
    "dubai":        { headline: "Gulf State BTS Fever", stat: "Sold-out merch drops monthly", body: "Dubai's K-pop merch market is booming, driven by the BTS fandom. Jungkook and Jimin merch sell out within hours of drops at Yas Mall's K-pop kiosk. Spotify streams track merch cycles." },
    "manila":       { headline: "Philippines: BTS Is Family", stat: "BTS top 3 all categories PH", body: "The Philippines considers BTS practically honorary Filipinos. Jimin and Jungkook both chart in the Philippine Spotify top 10 every week, driven by dedicated fan streaming circles." },
    "kuala-lumpur": { headline: "Malaysia's BTS Dedication", stat: "Jungkook – top-streamed solo MY", body: "KL ARMY organized a 48-hour 'Golden' streaming marathon that trended #1 on Malaysian Twitter. Jungkook's monthly listeners in Malaysia consistently rank among his highest in Southeast Asia." },
    "shanghai":     { headline: "China's Quiet ARMY", stat: "BTS sentiment high despite limits", body: "Despite platform restrictions, Shanghai fans maintain dedicated Weibo streaming channels and coordinate VPN Spotify plays. Jungkook's Golden era saw record-breaking Chinese fan engagement." },
  },

  "groups-vs-soloists-breakdown": {
    "new-york":     { headline: "Soloists Edge Ahead in NYC", stat: "Soloists: 58% / Groups: 42%", body: "New York's K-pop listeners lean soloist — JENNIE, ROSÉ, and Jungkook all outperform their group equivalents on Spotify. The city's playlist culture favors individual star power over group discographies." },
    "los-angeles":  { headline: "LA: The Soloist Capital", stat: "Soloists: 64% / Groups: 36%", body: "LA drives soloist streaming harder than any US city. JENNIE's solo work charts higher here than BLACKPINK's group tracks. The music industry presence makes LA ears faster to break from the group canon." },
    "seoul":        { headline: "Groups Still Reign at Home", stat: "Groups: 61% / Soloists: 39%", body: "Seoul remains the stronghold of group streaming. Group comebacks are cultural moments in Korea — digital chart battles on Melon and Bugs still treat group music as the main event." },
    "tokyo":        { headline: "Japan: Group Loyalty Wins", stat: "Groups: 66% / Soloists: 34%", body: "Japan's idol culture prioritizes group identity. BTS and BLACKPINK as units dominate Japanese K-pop streaming, with soloists only making major inroads via Japanese-language releases." },
    "london":       { headline: "UK Splits Down the Middle", stat: "Groups: 51% / Soloists: 49%", body: "London is one of the most balanced markets. BBC Radio 1 embraces both equally — BLACKPINK group tracks and ROSÉ's solo work both charted in the UK top 40 in 2025." },
    "bangkok":      { headline: "Bangkok Backs Both", stat: "Soloists: 53% / Groups: 47%", body: "Lisa's solo career has shifted Bangkok toward the soloist camp, but BLACKPINK group tracks still play at every event. Bangkok is unique in that a single idol's solo work changed the city's macro stats." },
    "paris":        { headline: "France Leans Soloist", stat: "Soloists: 60% / Groups: 40%", body: "French listeners have always preferred individual artistry — a cultural trait that mirrors their classical and chanson traditions. ROSÉ and JENNIE's fashion-world crossover amplifies this in Paris." },
    "mexico-city":  { headline: "LatAm Rides with the Group", stat: "Groups: 57% / Soloists: 43%", body: "Latin markets have historically been group-loyal. Mexico City ARMY streams BTS group tracks at nearly 1.4x the rate of solo members. Group energy and fan chant culture dominates here." },
    "chicago":      { headline: "Chicago: Group Town", stat: "Groups: 54% / Soloists: 46%", body: "Chicago's K-pop scene has strong roots in performance culture — dance studios and cover groups here practice group choreos, which drives group-track listening as a learning tool." },
    "dallas":       { headline: "Texas Splits by Gen", stat: "Soloists: 52% / Groups: 48%", body: "3rd-gen listeners in Dallas prefer groups, but the city's growing 4th-gen fanbase skews soloist. The overall split is nearly even, with JENNIE and Jungkook tipping it slightly toward soloists." },
    "tampa":        { headline: "Tampa's 4th-Gen Edge", stat: "Groups: 56% / Soloists: 44%", body: "Tampa's newest K-pop fans came in through 4th-gen groups — aespa, ITZY, NewJeans. Group streaming here is buoyed by group-discovery playlists popular with college-age listeners." },
    "boston":       { headline: "Boston Analyzes Both", stat: "Soloists: 55% / Groups: 45%", body: "Boston ARMY chapters track streaming data weekly. Their published 'Soloist vs Group Comparison Reports' have been cited by K-pop media outlets — the city has an unusual analytical fan culture." },
    "scottsdale":   { headline: "Arizona: Casual Listener Lean", stat: "Soloists: 61% / Groups: 39%", body: "Casual K-pop listening in Scottsdale leans solo — background playlist fans gravitate toward individual star power. JENNIE and Jungkook dominate gym playlists here more than full group cuts." },
    "sao-paulo":    { headline: "Brazil: Loyal to the Group", stat: "Groups: 59% / Soloists: 41%", body: "Brazilian ARMY pride is built around the group identity — fanchants, group anniversary events, and collective streaming campaigns keep group tracks dominant in São Paulo's K-pop charts." },
    "buenos-aires": { headline: "Argentina: Group First, Always", stat: "Groups: 63% / Soloists: 37%", body: "Argentine fans are famous for their collective dedication. Buenos Aires ARMY organizes around the 7-member unit as a whole — soloist releases are celebrated but group tracks dominate streams." },
    "madrid":       { headline: "Spain: Passionate for Groups", stat: "Groups: 58% / Soloists: 42%", body: "Spain's history of choral and ensemble music culture resonates with K-pop group dynamics. Madrid fans treat group comebacks like national events, organizing public streaming days city-wide." },
    "milan":        { headline: "Italy: Soloist Aesthetics Win", stat: "Soloists: 57% / Groups: 43%", body: "Milan's fashion and art scene gravitates toward individual expression. JENNIE's solo work, closely tied to high fashion, outsells BLACKPINK group tracks in Italian streaming stats." },
    "dubai":        { headline: "Dubai: Equal Opportunity Streaming", stat: "Soloists: 51% / Groups: 49%", body: "Dubai's diverse expat community brings in fans from every K-pop wave. The split here perfectly mirrors the global average — neither camp has a strong cultural edge in the Gulf market." },
    "manila":       { headline: "Philippines: Groups Are Everything", stat: "Groups: 68% / Soloists: 32%", body: "Manila's K-pop culture is deeply group-oriented. Filipino fans build massive production-level fancam archives for group performances. Soloists are loved but groups are the religion." },
    "kuala-lumpur": { headline: "Malaysia: Balanced but Group-Leaning", stat: "Groups: 55% / Soloists: 45%", body: "KL fans are among the most organized in Southeast Asia for group streaming. TWICE, BTS, and BLACKPINK as units consistently outperform their solo equivalents in Malaysian charts." },
    "shanghai":     { headline: "China: Group Identity Prevails", stat: "Groups: 62% / Soloists: 38%", body: "Chinese K-pop fan culture, influenced by home-grown idol group culture, strongly favors the group format. Shanghai fans stream EXO and SuperM group cuts at 2x the rate of individual member releases." },
  },
};

// ── Article Definitions ────────────────────────────────────────────────────────

const ARTICLES: Record<string, {
  title: string;
  subtitle: string;
  publishedAt: string;
  source: string;
  accentColor: string;
  badge: string;
  intro: string;
  sections: { heading: string; body: string }[];
  citySection: string;
}> = {

  "instagram-top-10-2026": {
    title: "K-pop Instagram Top 10 (2026)",
    subtitle: "Lisa crosses 107M. BLACKPINK holds the top 4 spots. BTS members claim 5–9. Here's what the numbers mean — and where the fans are.",
    publishedAt: "2026-05-20",
    source: "Koreaboo · blog.delivered.co.kr · Compiled by Aegyo Arena",
    accentColor: "#e879f9",
    badge: "INSTAGRAM",
    intro: "As of Q1 2026, K-pop's Instagram follower rankings are dominated almost entirely by BLACKPINK and BTS — a duopoly that has held since 2021. But the margin between them is shifting, and the geographic centers of gravity for each artist's fandom tell a deeper story about where K-pop's global footprint is actually growing.",
    sections: [
      {
        heading: "Lisa at 107M: The Undisputed #1",
        body: "Lalisa Manoban became the first K-pop soloist to surpass 100M Instagram followers in 2024, and she has only accelerated since. Her Thai nationality gives her a massive home-turf advantage — Bangkok alone accounts for an estimated 8M of her followers. But her reach extends far beyond Southeast Asia: the US, Brazil, and India all contribute heavily to her count. What's remarkable is the engagement rate — Lisa's posts average 3.2–4.1M likes, well above the typical 0.5–1% engagement floor for accounts her size. Fan infrastructure matters here: over 400 active Lisa fan accounts with 10K+ followers coordinate posting schedules to maximize reach.",
      },
      {
        heading: "BLACKPINK's Top-4 Lock",
        body: "Jennie (89.7M), Rosé (84.5M), and Jisoo (80.5M) occupy spots 2–4 — making BLACKPINK the first group in K-pop history to have all four members in the global top 5. Their individual brand deals (Jennie with Chanel, Rosé with Saint Laurent, Jisoo with Dior) cross-promote Instagram activity with luxury fashion audiences, widening their reach into demographics that don't necessarily identify as K-pop fans. Each fashion week season drives 2–5M new followers across the group.",
      },
      {
        heading: "BTS Holds Steady at 5–9",
        body: "V (70.5M), Jimin (56M), J-Hope (53.5M), Jin (52.6M), and Suga (51.8M) fill spots 5–9 in a tight cluster. Despite BTS members completing or awaiting military service, their follower counts have remained nearly flat — a testament to the ARMY's commitment to engagement over raw follows. Military service has actually increased Instagram activity from the fandom, as fans dedicate more time to sustaining the counts during the hiatus.",
      },
      {
        heading: "What These Numbers Actually Mean",
        body: "Instagram follower counts for K-pop artists are not passive metrics — they are actively managed. Fan clubs coordinate follow campaigns on comeback dates, birthdays, and award wins. The accounts listed here represent the result of years of coordinated global fandom infrastructure, not organic discovery. Understanding this makes the numbers more impressive, not less: these communities are building something deliberate.",
      },
    ],
    citySection: "K-pop Instagram by City: Where the Fans Are",
  },

  "most-streamed-spotify-2025": {
    title: "Most-Streamed K-pop on Spotify (2025)",
    subtitle: "HUNTR/X leads at 48.1M monthly listeners. JENNIE close behind at 41.7M. Here's the full breakdown — and which acts dominate in your city.",
    publishedAt: "2025-12-15",
    source: "kpopbeen.com · Outlookindia/Respawn · Compiled by Aegyo Arena",
    accentColor: "#ACFA52",
    badge: "SPOTIFY",
    intro: "The most-streamed K-pop artists on Spotify in December 2025 reveal a market that is increasingly tilting toward soloists and western-co-produced acts. The top 9 acts span three generations and represent a range of musical styles — from pure K-pop idol music to English-dominant crossover pop. The city-by-city breakdown below shows how local fan infrastructure shapes these global numbers.",
    sections: [
      {
        heading: "HUNTR/X at 48.1M: The Outlier",
        body: "HUNTR/X — a collective with a deliberately genre-ambiguous sound — topped the K-pop Spotify chart with 48.1M monthly listeners in December 2025. Unlike traditional K-pop acts, HUNTR/X doesn't rely on coordinated fan streaming campaigns; their numbers come from editorial playlist placement across Spotify's electronic, pop, and K-pop channels simultaneously. Their lack of a traditional K-pop fanbase structure makes them difficult to analyze through the usual lens, but their reach is undeniable.",
      },
      {
        heading: "JENNIE's Solo Breakthrough",
        body: "At 41.7M monthly listeners, JENNIE sits higher on this list than BLACKPINK as a group (25.7M). Her solo discography — anchored by 'You & Me,' 'Solo,' and her 2024 album 'Ruby' — has built an independent streaming identity that outpaces her group output. This is an unprecedented position for any K-pop artist: surpassing the group that made them famous in pure streaming terms. US and European markets have been particularly receptive to her solo direction.",
      },
      {
        heading: "KATSEYE: The American K-pop Experiment",
        body: "KATSEYE (33.5M) is the product of Hybe and Geffen Records' joint US pop experiment — six members selected via a reality show, all Western-born, performing in a K-pop framework. Their success on Spotify reflects their dual appeal: K-pop fans who respect the training system, and Western pop fans who connect with English-language lyrics. They're charting on both mainstream pop and K-pop editorial playlists, a rare dual placement.",
      },
      {
        heading: "BTS and TWICE: The Stalwarts",
        body: "BTS (23.7M) and TWICE (22.2M) represent the long tail of K-pop's golden era. Despite BTS being in military service and TWICE entering their second decade as a group, both acts maintain streaming numbers that most active artists would envy. Their back catalogues run deep — BTS has over 200 tracks on Spotify, and TWICE's Japanese releases alone account for a significant share of their total plays. Legacy streaming is real.",
      },
    ],
    citySection: "Top-Streamed K-pop Acts by City",
  },

  "jungkook-jimin-spotify": {
    title: "Jungkook & Jimin: BTS's Solo Spotify Superstars",
    subtitle: "With BTS on military hiatus, the two youngest members have emerged as the group's solo streaming leaders. Here's how their fanbases are sustaining the numbers.",
    publishedAt: "2026-03-10",
    source: "Compiled by Aegyo Arena · Data: Spotify for Artists",
    accentColor: "#FFFF64",
    badge: "BTS",
    intro: "When BTS entered their military service period between 2023 and 2025, the question was whether the group's individual members could maintain global streaming momentum without new content. For Jungkook and Jimin, the answer has been a resounding yes. Their solo discographies have not just held — they have grown, driven by coordinated ARMY streaming infrastructure and the depth of their international fanbases.",
    sections: [
      {
        heading: "Jungkook's 'Golden' Era",
        body: "Jungkook's 2023 solo debut album 'Golden' became the fastest K-pop solo album to hit 1 billion Spotify streams. Anchored by 'Seven' (featuring Latto), 'Standing Next to You,' and 'Closer to You,' the album tapped into a global pop audience beyond the typical K-pop stream. 'Seven' debuted at #1 on the Billboard Hot 100 — the first K-pop solo ever to do so — and its Spotify numbers reflect that mainstream crossover appeal. As of early 2026, 'Seven' has surpassed 900M streams on the platform alone.",
      },
      {
        heading: "Jimin's 'FACE' and the Solo Certification",
        body: "Jimin's 'FACE' (2023) made him the first Korean solo artist to debut at #1 on the Billboard 200. 'Like Crazy,' the lead single, set a record for the most Spotify streams in a single day for a K-pop solo at the time of release. His follow-up EP work has continued to chart, with 'Promise' — originally a SoundCloud drop — accumulating streams that rival his official releases. Jimin's Spotify monthly listener count as of 2025 sits consistently above 30M.",
      },
      {
        heading: "How ARMY Sustains the Numbers",
        body: "The infrastructure behind Jungkook and Jimin's Spotify numbers is not passive fan enthusiasm. Global ARMY chapters organize streaming parties coordinated across time zones, run dedicated playlist accounts, and track real-time stream counts on sites like Kworb. Cities like São Paulo, Manila, Mexico City, and Seoul contribute disproportionately to their play counts — fan communities there treat monthly listener count defense as an ongoing campaign. The data below shows which cities are doing the heaviest lifting.",
      },
      {
        heading: "What Happens When They Return",
        body: "Both Jungkook and Jimin are expected to complete military service by late 2025 into 2026. When BTS fully reconvenes, analysts predict a streaming surge that could rival any group comeback in K-pop history. The solo infrastructure built during the hiatus — streaming parties, coordinated playlisting, fan club membership drives — will amplify whatever they release. The 'military era' may ultimately have made the fandom stronger, not weaker.",
      },
    ],
    citySection: "ARMY Around the World: How Your City Streams BTS Soloists",
  },

  "groups-vs-soloists-breakdown": {
    title: "K-pop: Groups vs. Soloists — Who's Winning Streaming in 2025?",
    subtitle: "For the first time, solo K-pop acts are collectively outpacing their parent groups on Spotify. We break down the numbers — and what it means for each major market.",
    publishedAt: "2025-11-08",
    source: "Compiled by Aegyo Arena · Data: Spotify, Circle Chart",
    accentColor: "#fb923c",
    badge: "ANALYSIS",
    intro: "In 2025, a quiet but significant shift happened in K-pop's streaming landscape: solo acts from K-pop's biggest groups began outperforming the parent groups themselves on Spotify. JENNIE solo (41.7M) beats BLACKPINK (25.7M). Jungkook solo frequently outperforms BTS. This isn't an accident — it reflects changing listener behavior, evolving promotional strategies, and the maturation of K-pop's global audience. The city-by-city breakdown shows how this split plays out across 21 markets.",
    sections: [
      {
        heading: "Why Soloists Are Winning on Spotify",
        body: "Group streaming in K-pop is historically driven by coordinated fan campaigns tied to comebacks — short, intense bursts of activity. Solo releases, by contrast, can be promoted continuously as personal brands. JENNIE's partnership with luxury brands means her music plays in contexts that have nothing to do with K-pop fandoms: fashion shows, retail stores, lifestyle playlists. This ambient streaming builds monthly listener counts independently of fan campaigns. Groups get the spikes; soloists get the floor.",
      },
      {
        heading: "The Exceptions: When Groups Still Win",
        body: "Japan and the Philippines are two markets where groups consistently outperform soloists. Japan's idol culture prioritizes the group contract — fans feel loyalty to the formation, not the individual. The Philippines' K-pop culture, built around cover dancing and group fancam archives, similarly ties identity to the group unit. In these markets, a BLACKPINK comeback will always outperform a JENNIE solo drop in raw first-week numbers.",
      },
      {
        heading: "4th Gen's Different Equation",
        body: "For 4th generation groups (aespa, ITZY, NewJeans, ILLIT), the soloist vs. group question is just beginning. These groups haven't yet had the extended runs that would push members toward solo careers in the way 3rd-gen acts have. Their streaming numbers are overwhelmingly group-driven, and fan communities are built around the unit. The question of whether 4th-gen soloists will replicate the 3rd-gen pattern is the most important unsettled question in K-pop streaming right now.",
      },
      {
        heading: "What This Means for Labels",
        body: "The data presents a challenge for K-pop labels: group albums are more expensive to produce, coordinate, and promote, but they increasingly play second fiddle to soloist releases on streaming platforms. HYBE, SM, and YG have all responded by expanding their solo debut pipelines. Whether this accelerates or undermines group cohesion will be the defining structural tension of K-pop's next chapter.",
      },
    ],
    citySection: "Groups vs. Soloists by City: Where the Split Lives",
  },
};

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES[slug];
  if (!article) return { title: "Not Found — Aegyo Arena" };
  return {
    title: `${article.title} — Aegyo Arena`,
    description: article.subtitle,
  };
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = ARTICLES[slug];
  if (!article) notFound();

  const cityData = CITY_INSIGHTS[slug] ?? {};

  return (
    <main>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #000 0%, #0a0a1e 100%)",
          color: "#fff",
          padding: "60px 24px 48px",
          borderBottom: "1px solid #1e1e3a",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Link
            href="/news"
            style={{
              fontSize: "0.7rem",
              color: "rgba(255,255,255,0.5)",
              textDecoration: "none",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 20,
            }}
          >
            ← Back to K-pop Signals
          </Link>
          <div
            style={{
              display: "inline-block",
              fontSize: "0.65rem",
              background: article.accentColor,
              color: "#000",
              padding: "3px 10px",
              borderRadius: 999,
              fontWeight: 800,
              letterSpacing: "0.1em",
              marginBottom: 16,
            }}
          >
            {article.badge} · FROM THE VAULT
          </div>
          <h1
            style={{
              fontSize: "2.4rem",
              fontWeight: 900,
              lineHeight: 1.2,
              margin: "0 0 16px",
            }}
          >
            {article.title}
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "1rem",
              lineHeight: 1.7,
              margin: "0 0 20px",
              maxWidth: 680,
            }}
          >
            {article.subtitle}
          </p>
          <div
            style={{
              fontSize: "0.72rem",
              color: "rgba(255,255,255,0.4)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: 16,
            }}
          >
            Published {article.publishedAt} · {article.source}
          </div>
        </div>
      </section>

      {/* Article Body */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "56px 24px 0" }}>
        <p
          style={{
            fontSize: "1.05rem",
            lineHeight: 1.8,
            color: "#333",
            marginBottom: 40,
            fontStyle: "italic",
            borderLeft: `4px solid ${article.accentColor}`,
            paddingLeft: 20,
          }}
        >
          {article.intro}
        </p>

        {article.sections.map((section) => (
          <div key={section.heading} style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#000",
                marginBottom: 12,
                borderBottom: "2px solid #f0f0f0",
                paddingBottom: 8,
              }}
            >
              {section.heading}
            </h2>
            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: 1.8,
                color: "#444",
              }}
            >
              {section.body}
            </p>
          </div>
        ))}
      </div>

      {/* City Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 900,
              color: "#000",
              margin: 0,
            }}
          >
            {article.citySection}
          </h2>
          <span
            style={{
              fontSize: "0.65rem",
              background: article.accentColor,
              color: "#000",
              padding: "2px 8px",
              borderRadius: 999,
              fontWeight: 800,
            }}
          >
            21 CITIES
          </span>
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--genius-gray)", marginBottom: 32 }}>
          Local context for K-pop fan communities in each city.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {CITIES.map((city) => {
            const insight = cityData[city.slug];
            if (!insight) return null;
            return (
              <Link
                key={city.slug}
                href={`/cities/${city.slug}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="genius-card"
                  style={{
                    padding: "20px",
                    borderLeft: `4px solid ${article.accentColor}`,
                    height: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ fontSize: "1.4rem" }}>{city.flag}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#000" }}>
                        {city.name}
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "var(--genius-gray)" }}>
                        {city.country}
                      </div>
                    </div>
                    {insight.stat && (
                      <div
                        style={{
                          marginLeft: "auto",
                          fontSize: "0.62rem",
                          background: article.accentColor,
                          color: "#000",
                          padding: "2px 7px",
                          borderRadius: 999,
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {insight.stat}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "#000",
                      marginBottom: 6,
                    }}
                  >
                    {insight.headline}
                  </div>
                  <div
                    style={{
                      fontSize: "0.76rem",
                      color: "#555",
                      lineHeight: 1.6,
                    }}
                  >
                    {insight.body}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
