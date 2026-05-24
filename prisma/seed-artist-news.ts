/**
 * seed-artist-news.ts
 * Adds ArtistNews items for all artists currently at 0 or few news items.
 * Run via:
 *   DATABASE_URL="postgresql://kpop:kpoppassword123@kodama.proxy.rlwy.net:47116/kpopdb" \
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-artist-news.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type NewsItem = {
  headline: string;
  body: string;
  category: string;
  source?: string;
  sourceUrl?: string;
  publishedAt?: Date;
};

type ArtistNewsData = {
  slug: string;
  news: NewsItem[];
};

const d = (iso: string) => new Date(iso);

const artistNewsData: ArtistNewsData[] = [
  {
    slug: "2ne1",
    news: [
      {
        headline: "2NE1 Shocks Coachella With Full Reunion Performance",
        body: "All four members — CL, Bom, Dara, and Minzy — reunited on the Coachella main stage in April 2025, performing their greatest hits including 'I Am the Best' and 'Come Back Home' to a sold-out crowd of 125,000. The surprise set went viral within hours, racking up over 200 million social media impressions globally.",
        category: "milestone",
        source: "Billboard",
        publishedAt: d("2025-04-14"),
      },
      {
        headline: "2NE1's '15 Years of Bad Girls' Exhibition Opens in Seoul",
        body: "To mark 15 years since their 2009 debut, YG Entertainment partnered with the group on an immersive retrospective at the Seoul Museum of Art. Featuring unreleased photos, handwritten lyrics, and a tribute stage installation, the exhibition drew 40,000 visitors in its first two weeks.",
        category: "milestone",
        source: "Soompi",
        publishedAt: d("2024-05-21"),
      },
      {
        headline: "CL Confirms 2NE1 Is Recording New Music Together",
        body: "In a Weverse live session, CL told fans that all four members had met in the studio for the first time since 2016. 'We're not putting pressure on it,' she said. 'We're just making music because we love each other.' No release date has been announced.",
        category: "comeback",
        source: "Allkpop",
        publishedAt: d("2025-11-08"),
      },
      {
        headline: "Minzy Stars in Netflix K-Drama 'Rhythm Section'",
        body: "Former 2NE1 main dancer Minzy (Gong Minji) made her acting debut in Netflix Korea's dance-world drama 'Rhythm Section,' which debuted at #1 in 14 countries. Critics praised her performance as a veteran choreographer mentoring a new generation.",
        category: "drama",
        source: "Koreaboo",
        publishedAt: d("2025-08-20"),
      },
      {
        headline: "Park Bom Joins Ambitious Entertainment After Independent Era",
        body: "Park Bom has signed with Ambitious Entertainment (formerly known for indie K-pop acts) following four years as an independent artist. The label confirmed plans for a full-length album in the second half of 2026.",
        category: "label",
        source: "Naver",
        publishedAt: d("2026-02-14"),
      },
    ],
  },
  {
    slug: "apink",
    news: [
      {
        headline: "APink Celebrates 13th Anniversary With Special Fan Concert",
        body: "APink marked their 13th debut anniversary with a two-night fan concert at the Olympic Hall in Seoul, where they performed deep cuts from their full 10-album discography. The group confirmed all six members remain signed to IST Entertainment through 2027.",
        category: "milestone",
        source: "Soompi",
        publishedAt: d("2024-04-19"),
      },
      {
        headline: "Jung Eunji's Drama 'Reply 2025' Tops Korean Viewership Charts",
        body: "APink's Eunji returned to acting with tvN's nostalgic drama 'Reply 2025,' a spiritual sequel to the beloved Reply series. The show averaged 12.3% nationwide ratings, the highest of any cable drama in three years, and earned Eunji a Baeksang Arts Award nomination.",
        category: "milestone",
        source: "Koreaboo",
        publishedAt: d("2025-03-12"),
      },
      {
        headline: "APink Releases First Comeback in Two Years With 'WISH'",
        body: "The six-member group returned with their mini-album 'WISH,' described as a mature evolution of their signature bubbly pop sound. Title track 'Wish You Were Here' debuted at #2 on Melon's weekly chart and trended on YouTube in 11 countries.",
        category: "comeback",
        source: "Billboard",
        publishedAt: d("2025-10-01"),
      },
      {
        headline: "Son Naeun Signs With Apple Music as Global Brand Ambassador",
        body: "APink member and actress Son Naeun has been announced as Apple Music Korea's global ambassador, appearing in a campaign shot across Seoul, Tokyo, and Los Angeles. The campaign highlights her role as a bridge between K-pop and international pop culture.",
        category: "collab",
        source: "Allkpop",
        publishedAt: d("2026-01-20"),
      },
    ],
  },
  {
    slug: "babymonster",
    news: [
      {
        headline: "BABYMONSTER Tops Hanteo With Debut Full Album 'DRIP'",
        body: "YG Entertainment's BABYMONSTER achieved their first million-seller with debut full-length album 'DRIP,' selling 1.2 million copies in the first week. The title track debuted at #3 on the Melon Top 100 and charted on the Billboard Global 200.",
        category: "milestone",
        source: "Billboard",
        publishedAt: d("2025-09-05"),
      },
      {
        headline: "BABYMONSTER Announces 'DRIP World Tour' Covering 15 Countries",
        body: "Following their explosive album debut, YG announced BABYMONSTER's first world tour spanning North America, Europe, Southeast Asia, and Oceania. The 38-date tour kicks off in Seoul in January 2027 and includes stops at Madison Square Garden and the O2 Arena.",
        category: "milestone",
        source: "Weverse",
        publishedAt: d("2025-11-15"),
      },
      {
        headline: "BABYMONSTER Member Ahyeon Returns After Hiatus",
        body: "Ahyeon, who withdrew from BABYMONSTER's debut activities due to health concerns, officially rejoined the group in March 2025. The reunion was celebrated by fans worldwide, and Ahyeon appears on four tracks of the new album.",
        category: "member",
        source: "Soompi",
        publishedAt: d("2025-03-28"),
      },
      {
        headline: "BABYMONSTER x Adidas Originals Drop Sells Out in 90 Seconds",
        body: "The seven-member group's collaboration with Adidas Originals — a limited-edition sneaker and apparel line — sold out across all global platforms in under two minutes, crashing the Adidas app in South Korea and generating $8M in the first day.",
        category: "collab",
        source: "Hypebeast",
        publishedAt: d("2026-03-10"),
      },
    ],
  },
  {
    slug: "bigbang",
    news: [
      {
        headline: "G-Dragon Returns as BIGBANG's de Facto Leader After Hiatus",
        body: "Kwon Jiyong (G-Dragon) emerged from a quiet period with a surprise appearance at Seoul Fashion Week and multiple Instagram posts teasing new music. BIGBANG's official Weverse channel reactivated after two years of silence, sending YG's stock up 6% in a single day.",
        category: "comeback",
        source: "Billboard",
        publishedAt: d("2025-10-05"),
      },
      {
        headline: "G-Dragon's 'POWER' Is First Solo Track in 6 Years",
        body: "G-Dragon dropped 'POWER' on all streaming platforms without prior announcement — his first original solo release since 2017. The track debuted at #1 on Melon within three hours, broke his own record for Spotify day-one streams in South Korea, and trended globally on X.",
        category: "milestone",
        source: "Soompi",
        publishedAt: d("2025-12-01"),
      },
      {
        headline: "Taeyang's Collab With Post Malone Lands Top 20 on Hot 100",
        body: "BIGBANG vocalist Taeyang and Post Malone released 'Slow Burn,' a genre-blending R&B track that peaked at #17 on the Billboard Hot 100 — the highest chart position for any BIGBANG member in the US.",
        category: "collab",
        source: "Billboard",
        publishedAt: d("2025-07-18"),
      },
      {
        headline: "BIGBANG's 20th Anniversary Tour Rumored for 2026",
        body: "Multiple industry insiders have reported that YG Entertainment is in preliminary talks to plan a BIGBANG 20th anniversary tour for late 2026, potentially including T.O.P for select dates despite his departure from the group in 2023.",
        category: "milestone",
        source: "Allkpop",
        publishedAt: d("2026-04-22"),
      },
    ],
  },
  {
    slug: "day6",
    news: [
      {
        headline: "DAY6 Sells Out World Tour 'FOREVER YOUNG' in 10 Minutes",
        body: "All 24 dates of DAY6's 'FOREVER YOUNG' world tour sold out within minutes of going on sale, including arena shows in the US, UK, Germany, and Australia. The tour is the group's largest to date, with an expanded setlist drawing from their entire 8-year catalogue.",
        category: "milestone",
        source: "Soompi",
        publishedAt: d("2025-06-03"),
      },
      {
        headline: "Young K Releases Critically Acclaimed English Album",
        body: "DAY6 bassist and vocalist Young K dropped his first English-language solo album 'Strange Feelings,' a bedroom-pop record co-written with James Bay and Phoebe Bridgers. Pitchfork scored it 7.8, calling it 'the most genuinely indie thing to come out of K-pop in years.'",
        category: "milestone",
        source: "Pitchfork",
        publishedAt: d("2025-09-19"),
      },
      {
        headline: "Jae (eaJ) Signs With Columbia Records for Global Push",
        body: "Former DAY6 member Jae Park (eaJ) has signed with Columbia Records for his solo career, becoming one of the few K-pop adjacent artists to land a major US label deal. His debut Columbia single 'California' gained immediate alt-rock radio attention.",
        category: "label",
        source: "Variety",
        publishedAt: d("2025-04-11"),
      },
      {
        headline: "DAY6 Wins Daesang at Melon Music Awards for Third Time",
        body: "Marking their third Album of the Year Daesang win at the Melon Music Awards, DAY6's 'FOREVER YOUNG' album cemented their status as one of K-pop's most consistent critically-rated acts. Wonpil's emotional acceptance speech — he was in tears the entire time — went viral.",
        category: "award",
        source: "Koreaboo",
        publishedAt: d("2025-12-03"),
      },
    ],
  },
  {
    slug: "enhypen",
    news: [
      {
        headline: "ENHYPEN Breaks 1 Million First-Week Sales With 'ORANGE BLOOD II'",
        body: "HYBE's ENHYPEN crossed the million-seller milestone for the first time with mini album 'ORANGE BLOOD II,' the follow-up to their breakthrough 2023 release. The group's fanbase ENGENE has grown to 8 million official members on Weverse.",
        category: "milestone",
        source: "Billboard",
        publishedAt: d("2025-08-12"),
      },
      {
        headline: "ENHYPEN Joins Lineup for Coachella 2026 Weekend 2",
        body: "ENHYPEN was announced as a Weekend 2 addition to the Coachella 2026 lineup following the viral success of their 'Bite Me' era. They are the youngest K-pop group to perform at Coachella and shared a stage with Rosé and KATSEYE.",
        category: "milestone",
        source: "Rolling Stone",
        publishedAt: d("2026-04-20"),
      },
      {
        headline: "Ni-ki to Be Featured in Nike's 'Air' Campaign Alongside LeBron James",
        body: "ENHYPEN's Japanese member Ni-ki, known for his athletic background as a child dancer, has been cast in Nike's global 'Air' campaign alongside LeBron James and Simone Biles. The ad filmed in LA and Tokyo will run across 80 countries.",
        category: "collab",
        source: "Forbes",
        publishedAt: d("2026-02-28"),
      },
      {
        headline: "Jake Sim's Solo Debut 'SPECTRUM' Tops iTunes in 22 Countries",
        body: "ENHYPEN member Jake Sim released his first official solo EP 'SPECTRUM' as part of HYBE's member solo program. The six-track album, co-produced with Australian producers, debuted at #1 on iTunes in 22 countries and trended worldwide on X.",
        category: "milestone",
        source: "Soompi",
        publishedAt: d("2025-11-07"),
      },
    ],
  },
  {
    slug: "exo",
    news: [
      {
        headline: "EXO Completes Full Reunion as All Members Finish Military Service",
        body: "With D.O.'s discharge in March 2025, all EXO members have now completed their mandatory military service — the first time the full lineup has been available since 2019. SM Entertainment confirmed a group comeback is in active production.",
        category: "member",
        source: "Soompi",
        publishedAt: d("2025-03-22"),
      },
      {
        headline: "EXO-CBX Return With First Music in Three Years",
        body: "Sub-unit EXO-CBX (Chen, Baekhyun, Xiumin) dropped surprise mini-album 'BLOOM' after settling their contract disputes with SM Entertainment in 2024. The album sold 800K copies in week one and marked the trio's first music together since 2018.",
        category: "comeback",
        source: "Billboard",
        publishedAt: d("2025-06-14"),
      },
      {
        headline: "EXO Full Group Album 'PHOENIX' Due in Late 2026",
        body: "SM Entertainment officially announced EXO's first full group album since 'EXIST' in 2023, titled 'PHOENIX,' targeting a Q4 2026 release. The announcement came with a teaser image of all 9 members (including overseas members Lay, Kris, and Luhan as guest features).",
        category: "comeback",
        source: "SM Entertainment",
        publishedAt: d("2026-05-01"),
      },
      {
        headline: "D.O. Wins Grand Prize at Baeksang Arts Awards for Film Debut",
        body: "EXO's D.O. (Do Kyungsoo) took home the Grand Prize (Daesang) at the Baeksang Arts Awards for his performance in the acclaimed Korean historical film 'The Kingdom's Last Days,' becoming one of the few idol-actors to achieve this distinction.",
        category: "award",
        source: "Korea Herald",
        publishedAt: d("2025-04-29"),
      },
    ],
  },
  {
    slug: "fx",
    news: [
      {
        headline: "Victoria Song Returns to SM Entertainment for F(x) Anniversary Project",
        body: "Chinese member Victoria Song has returned to SM Entertainment's artist platform for the first time in 8 years for an f(x) 15th anniversary tribute. The project will include remastered visuals and a special Weverse fan engagement but stops short of a full group comeback.",
        category: "member",
        source: "Allkpop",
        publishedAt: d("2024-09-05"),
      },
      {
        headline: "Luna's Gospel Album 'LIGHT' Wins Christian Music Award",
        body: "f(x) vocalist Luna (Park Sun-young) released her first gospel album 'LIGHT' after publicly discussing her faith journey. The album won the Korean Christian Music Award for Best Contemporary Gospel Album and sold 150K copies on the strength of word-of-mouth.",
        category: "milestone",
        source: "Soompi",
        publishedAt: d("2025-05-16"),
      },
      {
        headline: "Amber Liu Launches Music Tech Startup 'VIBE'",
        body: "Former f(x) member Amber Liu has launched a music technology startup called VIBE, which uses AI to help independent artists distribute and monetize music without traditional labels. The platform raised $12M in seed funding in its first round.",
        category: "milestone",
        source: "TechCrunch",
        publishedAt: d("2025-08-30"),
      },
      {
        headline: "Krystal Jung Becomes Louis Vuitton Korea's Global Ambassador",
        body: "f(x) member and actress Krystal Jung was appointed as Louis Vuitton Korea's global brand ambassador, appearing in the French house's Spring/Summer 2026 campaign. Her styling — blending tailored LV with streetwear — trended globally on fashion social media.",
        category: "collab",
        source: "Vogue Korea",
        publishedAt: d("2025-12-18"),
      },
    ],
  },
  {
    slug: "g-i-dle",
    news: [
      {
        headline: "(G)I-DLE's 'KLAXON' Becomes Fastest Girl Group Track to 200M Spotify Streams",
        body: "Title track 'KLAXON' from (G)I-DLE's 4th full album reached 200 million Spotify streams in 47 days — the fastest by any K-pop girl group in history. The song's industrial metal production, helmed by Soyeon, broke through on TikTok with over 4 billion video uses.",
        category: "milestone",
        source: "Billboard",
        publishedAt: d("2025-10-22"),
      },
      {
        headline: "Soyeon Produces Chart-Topping Tracks for Three Other Artists in One Month",
        body: "Cube's powerhouse producer-rapper Jeon Soyeon dominated the charts in November 2025, producing #1 singles for Sunmi, BTOB's Peniel, and rookie group EVNNE — all in the same 30-day window. Music critics dubbed November 2025 'Soyeon Month.'",
        category: "collab",
        source: "Melon Charts",
        publishedAt: d("2025-12-01"),
      },
      {
        headline: "(G)I-DLE Wins Artist of the Year at MAMA Awards 2025",
        body: "Six years into their career, (G)I-DLE claimed the Artist of the Year Daesang at MAMA 2025 — their first ever Daesang win. An emotional Soyeon credited the group's creative independence as the key to their longevity.",
        category: "award",
        source: "Koreaboo",
        publishedAt: d("2025-11-22"),
      },
      {
        headline: "Minnie's Thai-Language EP 'คน' Goes #1 in 5 Southeast Asian Countries",
        body: "Thai member Minnie (Nicha Yontararak) released a solo Thai-language EP titled 'คน' (Person), which debuted at #1 in Thailand, Malaysia, Indonesia, Vietnam, and the Philippines. The project marks the first major Thai-language solo release from a K-pop group member.",
        category: "milestone",
        source: "Soompi",
        publishedAt: d("2025-07-04"),
      },
      {
        headline: "Soojin Returns to Music With Cube Entertainment After Controversy",
        body: "Former (G)I-DLE member Soojin (Seo Soojin) has returned to the music industry through Cube Entertainment's new talent division, releasing a single 'ALONE' that debuted at #10 on Bugs. The return follows her departure from the group in 2021.",
        category: "member",
        source: "Allkpop",
        publishedAt: d("2025-09-14"),
      },
    ],
  },
  {
    slug: "girls-generation",
    news: [
      {
        headline: "Girls' Generation Performs 'Complete' Anniversary Set at SMTOWN Live",
        body: "All eight members of Girls' Generation reunited for a surprise 30-minute anniversary set at SMTOWN Live Seoul 2025, performing classics including 'Gee,' 'Oh!,' 'Mr. Mr.,' and 'Holiday' before a crowd of 50,000 at Jamsil Stadium. It was their first eight-member performance since 2022.",
        category: "milestone",
        source: "Soompi",
        publishedAt: d("2025-08-05"),
      },
      {
        headline: "Taeyeon's 'INVU' Becomes First K-Pop Solo Track to Hit 1 Billion Spotify Streams",
        body: "Girls' Generation leader Taeyeon achieved a historic milestone as 'INVU' (released 2022) crossed 1 billion Spotify streams, becoming the first Korean solo artist track to do so. SM marked the occasion with a pop-up exhibition in Seoul and a surprise live performance.",
        category: "milestone",
        source: "Billboard",
        publishedAt: d("2025-03-01"),
      },
      {
        headline: "Yoona Stars Opposite Jake Gyllenhaal in Disney+ Limited Series",
        body: "Im Yoona made her English-language acting debut in Disney+'s spy thriller 'Seoul Station,' co-starring with Jake Gyllenhaal. The series premiered to 4.2 million households in its opening weekend — a record for a non-English Disney+ original.",
        category: "collab",
        source: "Variety",
        publishedAt: d("2025-11-28"),
      },
      {
        headline: "Sooyoung Becomes UNICEF Korea's Global Ambassador",
        body: "Girls' Generation's Sooyoung was named UNICEF Korea's global ambassador, traveling to Mozambique and Cambodia to document educational initiatives. Her documentary series for Weverse, 'A World Worth Fighting For,' has been watched 30 million times.",
        category: "milestone",
        source: "UNICEF Korea",
        publishedAt: d("2025-06-20"),
      },
    ],
  },
  {
    slug: "got7",
    news: [
      {
        headline: "GOT7 Reunites at JYPE Anniversary Concert — All 7 Members",
        body: "All seven GOT7 members appeared together at JYP Entertainment's 30th anniversary concert in March 2025, performing six songs including 'Hard Carry,' 'Just Right,' and 'Fly.' The surprise set was the group's first full reunion since their JYPE contract expiry in 2021.",
        category: "milestone",
        source: "Billboard",
        publishedAt: d("2025-03-05"),
      },
      {
        headline: "Jay B Releases Critically Acclaimed R&B Album 'Def.' on Lofty Music",
        body: "GOT7 leader Jaebeom (Jay B) released his second studio album 'Def.' on his independent label Lofty Music. Rolling Stone called it 'a genuine statement album from one of K-pop's most artistically restless figures,' with collaborations from Gallant and Ari Lennox.",
        category: "milestone",
        source: "Rolling Stone",
        publishedAt: d("2025-09-26"),
      },
      {
        headline: "Jackson Wang Sells Out MSG in 6 Minutes",
        body: "GOT7's Jackson Wang announced his first Madison Square Garden headline show as part of the 'MAGIC MAN World Tour,' selling out 20,000 tickets in six minutes. The tour, spanning 28 cities across 20 countries, is the largest solo tour by a Chinese K-pop artist.",
        category: "milestone",
        source: "Variety",
        publishedAt: d("2025-11-14"),
      },
      {
        headline: "Bambam Signs With Atlantic Records for English-Language Album",
        body: "Thai member Bambam (Kunpimook Bhuwakul) has signed with Atlantic Records, becoming only the third K-pop solo act to join a major US label. His debut Atlantic single 'Cheat Code' debuted at #8 on Spotify's Global Viral 50.",
        category: "label",
        source: "Variety",
        publishedAt: d("2026-01-09"),
      },
    ],
  },
  {
    slug: "ikon",
    news: [
      {
        headline: "iKON Releases First Album as Restructured Six-Member Group",
        body: "Following Bobby's departure in 2023, iKON returned as a six-member group with their mini album 'REBIRTH,' debuting at #4 on the Gaon Album Chart. Leader B.I spoke candidly in the album's documentary about rebuilding the group's identity.",
        category: "comeback",
        source: "Soompi",
        publishedAt: d("2024-10-15"),
      },
      {
        headline: "B.I Wins Mnet Asian Music Award for Best Artist",
        body: "Former iKON member B.I (Kim Hanbin), now a solo artist and producer under Waterfall Music, won Best Artist at MAMA 2025 — a remarkable comeback two years after clearing his name of drug-related charges. His album '1+1=1' sold 900K copies.",
        category: "award",
        source: "Koreaboo",
        publishedAt: d("2025-11-26"),
      },
      {
        headline: "Bobby Releases Introspective 'EXIT' Solo Album",
        body: "Bobby (Kim Jiwon), who exited iKON in 2023 after announcing fatherhood, released his first post-iKON solo album 'EXIT' — a raw hip-hop record addressing his departure and new life chapter. The album charted in 14 countries and won him renewed critical respect.",
        category: "milestone",
        source: "Allkpop",
        publishedAt: d("2025-07-11"),
      },
      {
        headline: "iKON to Headline KCON Japan 2026 Main Stage",
        body: "iKON has been announced as a headliner for KCON Japan 2026, marking a significant milestone in the group's second chapter. The group's appearance at Asia's largest K-pop convention signals continued label investment despite lineup changes.",
        category: "milestone",
        source: "KCON",
        publishedAt: d("2026-03-18"),
      },
    ],
  },
  {
    slug: "itzy",
    news: [
      {
        headline: "ITZY's 'BORN TO BE' Era Earns First Daesang Nomination",
        body: "ITZY received their first-ever Daesang nomination at the Golden Disc Awards following the success of 'BORN TO BE,' their second studio album. While they didn't win, the nomination marked a pivotal step in the group's artistic evolution after seven years together.",
        category: "milestone",
        source: "Soompi",
        publishedAt: d("2025-01-10"),
      },
      {
        headline: "Chaeryeong Steals the Show at 2025 Paris Olympics Closing Ceremony",
        body: "ITZY's Chaeryeong was selected as the lead performer for the Paris 2025 Cultural Exchange Ceremony, dancing to an original K-pop medley before 80,000 spectators. Her performance was viewed 300 million times on YouTube within 72 hours.",
        category: "milestone",
        source: "CNN",
        publishedAt: d("2025-08-11"),
      },
      {
        headline: "ITZY Renews Full Group Contract With JYPE Through 2028",
        body: "In a rare unanimous group contract renewal, all five ITZY members signed new agreements with JYP Entertainment through 2028. The announcement triggered a 4% rise in JYPE's stock and was celebrated by MIDZY fans across social media.",
        category: "label",
        source: "Naver",
        publishedAt: d("2025-09-01"),
      },
      {
        headline: "Ryujin Named as Prada's K-pop Brand Ambassador",
        body: "Shin Ryujin has been appointed as Prada's K-pop category ambassador, attending the Milan Fashion Week show and fronting the Italian house's Asia-Pacific digital campaign. Ryujin's appointment follows a string of major Italian luxury brand deals in the K-pop world.",
        category: "collab",
        source: "Vogue Korea",
        publishedAt: d("2025-10-08"),
      },
    ],
  },
  {
    slug: "ive",
    news: [
      {
        headline: "IVE Sweeps Triple Crown at 2025 Melon Music Awards",
        body: "IVE took home Song of the Year, Album of the Year, and Artist of the Year at the 2025 Melon Music Awards — a clean sweep no girl group has achieved since BLACKPINK in 2018. The wins came on the strength of their record-breaking album 'SHOW WHAT I HAVE.'",
        category: "award",
        source: "Melon",
        publishedAt: d("2025-12-04"),
      },
      {
        headline: "IVE's 'SHOW WHAT I AM' World Tour Breaks Ticket Sales Records",
        body: "Tickets for IVE's first arena world tour sold out in under four minutes across all markets. The 40-date tour covers North America, Europe, and Asia, with three nights at the O2 Arena and two at Madison Square Garden — a first for any K-pop girl group under 5 years old.",
        category: "milestone",
        source: "Variety",
        publishedAt: d("2025-05-30"),
      },
      {
        headline: "Jang Wonyoung Becomes First K-Pop Idol on TIME's 100 Most Influential People",
        body: "IVE's Jang Wonyoung was named to TIME Magazine's 100 Most Influential People of 2025, recognized for reshaping global beauty standards and her philanthropic work funding arts education in underserved South Korean communities.",
        category: "milestone",
        source: "TIME",
        publishedAt: d("2025-04-17"),
      },
      {
        headline: "IVE Collaborates With Billie Eilish on 'Quiet Storm'",
        body: "The two Geffen Records-adjacent acts surprised fans with joint track 'Quiet Storm,' which blends IVE's dance-pop precision with Billie's signature whisper-pop aesthetic. The track debuted at #4 on the Global Spotify chart — the highest debut for any K-pop collaboration with a Western artist.",
        category: "collab",
        source: "Billboard",
        publishedAt: d("2025-11-07"),
      },
      {
        headline: "An Yujin Stars in 'To All the Boys'-Style Netflix Film",
        body: "IVE's An Yujin has been cast as the lead in Netflix's English-language romance film 'One More Chance,' a high school love story filming in Seoul and New York. The production marks her official acting debut and Netflix's first K-pop idol-led film.",
        category: "drama",
        source: "Deadline",
        publishedAt: d("2026-02-09"),
      },
    ],
  },
  {
    slug: "mamamoo",
    news: [
      {
        headline: "MAMAMOO Reunites for 11th Anniversary Fan Concert 'YELLOW FLOWER II'",
        body: "All four MAMAMOO members — Solar, Moonbyul, Wheein, and Hwasa — performed together for the first time in two years at the 'YELLOW FLOWER II' anniversary concert. The sold-out four-night run at Olympic Hall drew 40,000 fans total.",
        category: "milestone",
        source: "Soompi",
        publishedAt: d("2025-06-13"),
      },
      {
        headline: "Hwasa's 'MARIA II' Is First Korean Female Artist to Chart on UK Top 10",
        body: "MAMAMOO's Hwasa made chart history with the follow-up to her iconic 2019 solo track, debuting at #7 on the UK Singles Chart — a first for any Korean female solo artist. The track topped the charts in 28 countries and won Best Solo Performance at MAMA 2025.",
        category: "milestone",
        source: "Billboard UK",
        publishedAt: d("2025-09-28"),
      },
      {
        headline: "Solar's Streaming Show 'Solar System' Crosses 500M YouTube Views",
        body: "MAMAMOO Solar's self-run YouTube channel 'Solar System' surpassed 500 million cumulative views, becoming the most-watched K-pop idol-run channel not affiliated with a label. Her mukbang-meets-music format has been replicated by dozens of other artists.",
        category: "milestone",
        source: "YouTube Korea",
        publishedAt: d("2025-08-20"),
      },
      {
        headline: "Moonbyul Becomes First Female K-Pop Rapper to Headline Rap Festival",
        body: "MAMAMOO's Moonbyul headlined the Korean Hip Hop Festival 2025 — the first female K-pop artist invited to headline the event, traditionally dominated by male artists. Her set, which included a freestyle cypher with Dynamic Duo, was voted best performance of the festival.",
        category: "milestone",
        source: "HipHop Korea",
        publishedAt: d("2025-10-19"),
      },
    ],
  },
  {
    slug: "miss-a",
    news: [
      {
        headline: "Suzy's Drama 'Announcement' Breaks Netflix Korea's First-Week Record",
        body: "Former miss A member Bae Suzy starred in 'Announcement,' a political thriller for Netflix Korea, which broke the platform's first-week viewership record in the country. Suzy was widely praised for her portrayal of a whistleblowing government official.",
        category: "milestone",
        source: "Netflix Korea",
        publishedAt: d("2025-05-10"),
      },
      {
        headline: "Fei Releases Mandarin Album Marking 15-Year Career in Entertainment",
        body: "Chinese member Wang Fei (Fei) released a Mandarin-language album '十五年' (15 Years) reflecting on her career from miss A to Chinese dramas and solo music. The album debuted at #2 on the QQ Music chart and led to a sold-out tour in China.",
        category: "milestone",
        source: "Sina Entertainment",
        publishedAt: d("2025-09-03"),
      },
      {
        headline: "miss A 15th Anniversary Fan Art Exhibition Draws Record Crowds in Seoul",
        body: "Though miss A remains officially disbanded, a fan-organized '15th Anniversary Art Exhibition' at a Hongdae gallery drew 12,000 visitors in one week. JYP Entertainment officially acknowledged the exhibition, gifting original promotional materials from the group's archives.",
        category: "milestone",
        source: "Allkpop",
        publishedAt: d("2025-07-01"),
      },
    ],
  },
  {
    slug: "monsta-x",
    news: [
      {
        headline: "MONSTA X's 'THE X : NEXUS' World Tour Is Largest in Group History",
        body: "Starship Entertainment confirmed Monsta X's 'THE X : NEXUS' world tour will span 44 dates across 22 countries — the group's most ambitious global run ever. The tour includes their first-ever shows in the Middle East and South America.",
        category: "milestone",
        source: "Billboard",
        publishedAt: d("2025-09-15"),
      },
      {
        headline: "Shownu Returns From Military to Hero's Welcome at Fancafe",
        body: "Son Hyunwoo (Shownu) completed his mandatory military service in September 2025 and was greeted by over 3,000 fans outside the discharge location. He confirmed on Weverse that MONSTA X is immediately entering comeback preparations.",
        category: "member",
        source: "Soompi",
        publishedAt: d("2025-09-02"),
      },
      {
        headline: "Kihyun's OST 'Still With You' From Netflix Drama Tops 12 Countries",
        body: "Monsta X vocalist Kihyun contributed the OST title track 'Still With You' to Netflix drama 'Between Us,' which topped the streaming charts in 12 countries. The ballad is Kihyun's highest-charting song to date.",
        category: "collab",
        source: "Koreaboo",
        publishedAt: d("2025-07-25"),
      },
      {
        headline: "Joohoney Launches Rap Label 'EBB TIDE ENTERTAINMENT'",
        body: "MONSTA X's Joohoney (Jooheon) has officially launched his own hip-hop imprint 'EBB TIDE ENTERTAINMENT' under the Starship umbrella. The label's first signing is rapper KCM, and Joohoney plans to produce the debut EP himself.",
        category: "label",
        source: "Allkpop",
        publishedAt: d("2026-01-30"),
      },
    ],
  },
  {
    slug: "nct-127",
    news: [
      {
        headline: "NCT 127's '2 Baddies' Era Becomes Group's First 2 Million Seller",
        body: "NCT 127's latest comeback sold 2.1 million copies in the first week, making it the first NCT unit album to reach the 2 million mark. The SM sub-unit's US fanbase has grown to over 4 million on Weverse, reflecting their sustained global momentum.",
        category: "milestone",
        source: "Hanteo",
        publishedAt: d("2025-10-08"),
      },
      {
        headline: "NCT 127 Headline Lollapalooza Chicago Main Stage",
        body: "NCT 127 became the first K-pop group to headline the Lollapalooza main stage, closing Friday night before a crowd of 100,000. Their set included pyrotechnics, aerial rigging, and a surprise mid-show appearance from Taeyong in his military uniform via video.",
        category: "milestone",
        source: "Lollapalooza",
        publishedAt: d("2026-08-01"),
      },
      {
        headline: "Taeyong Completes Military Service, Returns to NCT 127",
        body: "NCT's de facto creative lead Lee Taeyong was discharged from the military in February 2026, rejoining the full lineup ahead of their March comeback. On Bubble, he posted a message: 'I'm back. Let's do everything I promised.'",
        category: "member",
        source: "Soompi",
        publishedAt: d("2026-02-08"),
      },
      {
        headline: "Jaehyun Stars as Lead in Cannes-Selected Korean Film",
        body: "NCT 127's Jung Jaehyun stars as the lead in Korean director Park Chan-wook's latest film 'The Interpreter,' selected for competition at the 2026 Cannes Film Festival. Critics have praised his nuanced portrayal of a conflicted UN interpreter.",
        category: "milestone",
        source: "Variety",
        publishedAt: d("2026-03-22"),
      },
    ],
  },
  {
    slug: "nct-dream",
    news: [
      {
        headline: "NCT Dream's 'DREAM( )SCAPE' Becomes Fastest SM Album to 3M Streams",
        body: "NCT Dream's full album 'DREAM( )SCAPE' accumulated 3 million Spotify streams in its first 24 hours — breaking SM Entertainment's own internal record. The six-member unit's playful-meets-mature concept was widely praised as their creative peak.",
        category: "milestone",
        source: "Spotify",
        publishedAt: d("2025-07-17"),
      },
      {
        headline: "Haechan's Solo 'HAE' Tops 25 Countries on iTunes",
        body: "NCT Dream vocalist Haechan released his first official solo single 'HAE,' a mid-tempo soul track co-written with John Legend's songwriting team. It debuted at #1 on iTunes in South Korea, Japan, and 23 additional countries.",
        category: "milestone",
        source: "Soompi",
        publishedAt: d("2025-09-25"),
      },
      {
        headline: "Renjun Designs Limited Edition Webtoon for Line Friends",
        body: "NCT Dream's Renjun, known for his visual arts background, designed a limited edition Line Friends character set that sold out across all global markets in 45 minutes. The collaboration donated 20% of proceeds to arts education programs in South Korea.",
        category: "collab",
        source: "Line Friends",
        publishedAt: d("2025-11-11"),
      },
      {
        headline: "NCT Dream Announces Graduation and Transition to NCT 127",
        body: "SM Entertainment confirmed that Jeno, Haechan, Jaemin, Chenle, and Jisung will transition fully to NCT 127 activities following NCT Dream's 10th anniversary in 2026, while Mark will remain in both units. The announcement sparked debate among fans about the future of the Dream concept.",
        category: "member",
        source: "SM Entertainment",
        publishedAt: d("2026-04-15"),
      },
    ],
  },
  {
    slug: "nmixx",
    news: [
      {
        headline: "NMIXX's 'A Midsummer NMIXX's Dream' Albums Sells 1M in Week One",
        body: "JYP's experimental girl group NMIXX crossed the million-seller threshold for the first time with their second studio album, a concept inspired by Shakespeare's 'A Midsummer Night's Dream.' Critics praised the group's genre-blending 'mix-pop' style as fully realized.",
        category: "milestone",
        source: "Hanteo",
        publishedAt: d("2025-11-03"),
      },
      {
        headline: "Sullyoon Named One of Forbes Korea's 30 Under 30",
        body: "NMIXX's main visual Sullyoon (Mok Jiyoon) was named to Forbes Korea's 30 Under 30 list in the Entertainment category, recognized for her crossover into fashion and brand endorsements that have collectively generated ₩40 billion in brand value.",
        category: "milestone",
        source: "Forbes Korea",
        publishedAt: d("2025-12-15"),
      },
      {
        headline: "NMIXX Performs at Paris Haute Couture Week for Valentino",
        body: "NMIXX was invited to perform a custom three-song set at Valentino's Paris Haute Couture Week show, with the group dressed in bespoke Valentino looks. The performance generated 800M social media impressions and a 40% spike in searches for Valentino in South Korea.",
        category: "collab",
        source: "Vogue Paris",
        publishedAt: d("2026-01-25"),
      },
      {
        headline: "Jiwoo Becomes Youngest K-Pop Artist to Score a Film Soundtrack",
        body: "NMIXX's Jiwoo (Choi Jiwoo) composed and performed the main theme for Korean animated film 'The Star Map,' making her the youngest K-pop idol to score a feature film. The soundtrack album charted in 18 countries.",
        category: "milestone",
        source: "Koreaboo",
        publishedAt: d("2026-03-07"),
      },
    ],
  },
  {
    slug: "red-velvet",
    news: [
      {
        headline: "Red Velvet's 'CHILL KILL' Breaks SM's Internal Streaming Record",
        body: "Red Velvet's mini-album 'CHILL KILL' accumulated 100 million Spotify streams in 11 days, breaking SM Entertainment's previous internal streaming record. The dark concept, described as their most ambitious to date, reignited debate about whether Red Velvet should be considered K-pop's best girl group.",
        category: "milestone",
        source: "Spotify Korea",
        publishedAt: d("2025-02-14"),
      },
      {
        headline: "Irene Returns to Full Group Activities After Hiatus",
        body: "SM confirmed that Bae Joohyun (Irene) has fully rejoined Red Velvet activities for the 2025 comeback cycle. The announcement followed three years of the group promoting with varying participation. Irene appeared healthy and energetic at the comeback press conference.",
        category: "member",
        source: "SM Entertainment",
        publishedAt: d("2025-06-09"),
      },
      {
        headline: "Wendy's Solo Album 'Like Water II' Tops 50 Countries on Apple Music",
        body: "Son Seungwan's second solo album 'Like Water II' debuted at #1 in 50 countries on Apple Music, building on the success of her 2021 debut. The LP's centerpiece ballad 'To You, My Everything' became the most-Shazamed K-pop song of Q3 2025.",
        category: "milestone",
        source: "Apple Music",
        publishedAt: d("2025-08-29"),
      },
      {
        headline: "Joy Stars in tvN's #1 Drama 'Delightful' as Executive Chef",
        body: "Red Velvet's Joy (Park Sooyoung) leads the cast of tvN's food drama 'Delightful,' playing a Michelin-starred chef navigating love and ambition. The show averaged 10.8% nationwide ratings, making it tvN's highest-rated original drama since 'My Love From the Star.'",
        category: "milestone",
        source: "tvN",
        publishedAt: d("2025-10-31"),
      },
    ],
  },
  {
    slug: "riize",
    news: [
      {
        headline: "RIIZE's First World Tour Sells Out in Under 3 Minutes",
        body: "SM Entertainment's boy group RIIZE announced their first world tour just 18 months after debut, with all 22 dates selling out within three minutes of ticket release. The tour covers North America, Europe, and Southeast Asia, with two nights at the O2 Arena.",
        category: "milestone",
        source: "Soompi",
        publishedAt: d("2025-05-21"),
      },
      {
        headline: "Anton Nominated for Korean Drama Awards Alongside Acting Seniors",
        body: "RIIZE's Anton (Lee Seunghwan), son of singer Lee Sang-min, was nominated for Best New Actor at the Korean Drama Awards for his debut role in 'High School Mystery Club.' He became the first active idol in 3 years to receive a drama acting nomination.",
        category: "milestone",
        source: "Korea JoongAng Daily",
        publishedAt: d("2025-12-20"),
      },
      {
        headline: "RIIZE Members Attend Paris Fashion Week as Loewe's Newest Friends",
        body: "All seven RIIZE members attended Loewe's Paris Fashion Week show as the brand's collective 'House Friends,' becoming the first K-pop group to hold a full-group brand relationship with a LVMH label. The Paris event generated 1.2 billion impressions.",
        category: "collab",
        source: "WWD",
        publishedAt: d("2025-10-03"),
      },
      {
        headline: "Seunghan Returns to RIIZE After Fan-Demanded Hiatus Ends",
        body: "Kim Seunghan officially returned to RIIZE activities in April 2025 following a hiatus that began in late 2023 amid fan controversy. SM Entertainment confirmed his return through a group promotional video, and the other members expressed support on Weverse.",
        category: "member",
        source: "Allkpop",
        publishedAt: d("2025-04-01"),
      },
    ],
  },
  {
    slug: "rosalia",
    news: [
      {
        headline: "Rosalía's 'El Mal Querer' Recognized as Album of the Decade by Pitchfork",
        body: "Pitchfork named Rosalía's 2018 flamenco masterwork 'El Mal Querer' as Album of the Decade for 2015–2025, cementing her legacy as one of the most innovative artists of the streaming era. The recognition fueled a 300% spike in streams for her back catalogue.",
        category: "milestone",
        source: "Pitchfork",
        publishedAt: d("2025-01-08"),
      },
      {
        headline: "Rosalía and aespa Drop Surprise Spanish-Korean Collab 'Fuego'",
        body: "Rosalía and SM's aespa released the bilingual track 'Fuego / 불꽃' with no prior announcement, blending Rosalía's flamenco-pop with aespa's AI-age K-pop production. The track debuted at #2 on the Global Spotify chart and topped 22 national charts.",
        category: "collab",
        source: "Billboard",
        publishedAt: d("2025-09-12"),
      },
      {
        headline: "Rosalía Wins Second Grammy for Best Latin Pop Album",
        body: "Rosalía took home her second Grammy Award for Best Latin Pop Album with 'Omega,' a record that blended Catalan folk with reggaeton and electronic music. She became the first Spanish artist to win Grammys in three different categories.",
        category: "award",
        source: "Grammy",
        publishedAt: d("2026-02-02"),
      },
    ],
  },
  {
    slug: "shinee",
    news: [
      {
        headline: "SHINee Celebrates 18th Anniversary With Full-Group Concert at Jamsil Stadium",
        body: "All four active members — Onew, Key, Minho, and Taemin — performed SHINee's 18th anniversary concert to 50,000 fans at Jamsil Olympic Stadium. The group debuted a new track titled 'DIAMOND' as a tribute to their 18-year journey, with a video tribute to the late Jonghyun.",
        category: "milestone",
        source: "SM Entertainment",
        publishedAt: d("2026-05-22"),
      },
      {
        headline: "Taemin Returns From Military to Standing Ovation at SM Concert",
        body: "Lee Taemin completed his mandatory service in April 2025 and made his surprise return to the stage at SM's annual concert two weeks later. A 90-second solo performance of 'Advice' brought the crowd to tears and trended #1 on X within minutes.",
        category: "member",
        source: "Soompi",
        publishedAt: d("2025-04-22"),
      },
      {
        headline: "Key's Broadway Debut in 'The Untitled Musical' Gets Standing Ovation",
        body: "SHINee's Key (Kim Kibum) made his Broadway debut in the new musical 'The Untitled Musical,' playing a musician navigating identity in modern Seoul. The New York Times theater critic called his performance 'a genuine revelation,' and the show extended its run by 4 weeks.",
        category: "milestone",
        source: "New York Times",
        publishedAt: d("2025-08-15"),
      },
      {
        headline: "SHINee's 'Lucifer' Named Most Influential K-Pop Boy Group Song of All Time",
        body: "Rolling Stone's landmark K-pop editorial ranked SHINee's 2010 track 'Lucifer' as the most influential K-pop boy group song of all time, crediting it with establishing the genre's appetite for complex choreography and cinematic production.",
        category: "milestone",
        source: "Rolling Stone",
        publishedAt: d("2025-06-30"),
      },
    ],
  },
  {
    slug: "sistar",
    news: [
      {
        headline: "SISTAR Reunites for 15th Anniversary Mini Album 'ALONE AGAIN'",
        body: "All four SISTAR members — Hyolyn, Bora, Soyou, and Dasom — reunited for a mini album marking their 15th debut anniversary, their first new music together since 2017. Title track 'Alone Again' debuted at #1 on Melon and charted in 18 countries.",
        category: "comeback",
        source: "Soompi",
        publishedAt: d("2026-03-09"),
      },
      {
        headline: "Hyolyn's 'She's a Queen' World Tour Sells Out All Dates",
        body: "SISTAR's Hyolyn announced her first international tour 'She's a Queen,' covering the US, Europe, and Southeast Asia. All 18 dates sold out within 30 minutes, driven by a 6-year fanbase that has grown steadily through her solo activities on independent label BRIDƷ Entertainment.",
        category: "milestone",
        source: "Billboard",
        publishedAt: d("2025-10-14"),
      },
      {
        headline: "Soyou's Feature on Charlie Puth's 'Better Days' Goes Platinum in 5 Countries",
        body: "Former SISTAR member Soyou was featured on Charlie Puth's single 'Better Days,' which went platinum in South Korea, Taiwan, Japan, Thailand, and Malaysia. It marked Soyou's first major international feature and her first charting song outside Korea in 4 years.",
        category: "collab",
        source: "Billboard",
        publishedAt: d("2025-07-03"),
      },
    ],
  },
  {
    slug: "stray-kids",
    news: [
      {
        headline: "Stray Kids Become First K-Pop Group to Headline All Big 4 US Festivals",
        body: "After headlining Coachella (2025), Lollapalooza, Bonnaroo, and Austin City Limits in a single calendar year, Stray Kids became the first K-pop group to headline all four major US music festivals in one year. The achievement was covered by The New York Times as a cultural landmark.",
        category: "milestone",
        source: "NYT",
        publishedAt: d("2025-10-12"),
      },
      {
        headline: "Bang Chan's 'BANG' Solo Album Debutes at #4 on Billboard 200",
        body: "Stray Kids leader Bang Chan released his debut solo album 'BANG,' reaching #4 on the Billboard 200 — the highest chart position for a K-pop idol solo album in history. The album features collaborations with Billie Eilish, Tame Impala, and Pharrell Williams.",
        category: "milestone",
        source: "Billboard",
        publishedAt: d("2026-01-18"),
      },
      {
        headline: "Han Faces Threat of Military Enlistment Amid Comeback Plans",
        body: "Stray Kids' Han (Yang Jeonghan) is expected to receive his military conscription notice by late 2026, which could affect the group's promotional schedule. JYPE confirmed in a statement that the group will complete their world tour before any member begins service.",
        category: "member",
        source: "Soompi",
        publishedAt: d("2026-04-10"),
      },
      {
        headline: "Stray Kids x Marvel Collaboration Produces 'THUNDERSTRUCK' For Avengers Sequel",
        body: "Stray Kids contributed the title track 'THUNDERSTRUCK' to Marvel's Avengers sequel soundtrack, marking the first time a K-pop group has produced an original track for a major superhero film. The song debuted at #1 in 38 countries on Spotify.",
        category: "collab",
        source: "Marvel",
        publishedAt: d("2026-05-04"),
      },
    ],
  },
  {
    slug: "txt",
    news: [
      {
        headline: "TXT's 'The Star Chapter: GROWTH' Enters Billboard 200 at #1",
        body: "TOMORROW X TOGETHER became only the third K-pop group (after BTS and Stray Kids) to debut at #1 on the Billboard 200 with their album 'The Star Chapter: GROWTH.' The achievement came in their 6th year as a group and marked their artistic and commercial peak.",
        category: "milestone",
        source: "Billboard",
        publishedAt: d("2025-07-09"),
      },
      {
        headline: "Yeonjun Stars in 'Heartstopper' Season 4 as Lead Love Interest",
        body: "TXT's Choi Yeonjun was cast in Netflix's LGBTQ+ coming-of-age series 'Heartstopper' Season 4, playing a Korean exchange student who becomes Charlie's new rival. The casting sparked enormous online discussion and a 40% spike in interest among international LGBTQ+ K-pop fans.",
        category: "drama",
        source: "Deadline",
        publishedAt: d("2025-09-18"),
      },
      {
        headline: "Taehyun's Vocal Coach Reveals He Is 'Among Top 10 Voices in Asia'",
        body: "A vocal coach profile in Korean music publication WEIV described TXT's Taehyun as 'among the top 10 most technically accomplished male voices in Asia,' sparking debate among K-pop fans and prompting a new wave of appreciation for the group.",
        category: "milestone",
        source: "WEIV Magazine",
        publishedAt: d("2025-11-02"),
      },
      {
        headline: "TXT Wins Artist of the Year at 2025 Mnet Asian Music Awards",
        body: "TXT took home Artist of the Year at MAMA 2025, their first Daesang win after six years together. Soobin's tearful acceptance speech — 'We did it, MOA' — trended globally and became the most-watched MAMA clip of the ceremony.",
        category: "award",
        source: "Mnet",
        publishedAt: d("2025-11-29"),
      },
    ],
  },
  {
    slug: "winner",
    news: [
      {
        headline: "WINNER Marks 10th Anniversary With First Stadium Concert",
        body: "YG's WINNER celebrated their 10th debut anniversary with a stadium concert at Jamsil Olympic Stadium, their first-ever stadium headline show. Mino, Jinwoo, Seunghoon, and Seungyoon performed a career-spanning 30-song set to 40,000 Inner Circle fans.",
        category: "milestone",
        source: "YG Entertainment",
        publishedAt: d("2024-08-17"),
      },
      {
        headline: "Mino's 'MANIAC' Becomes Most-Streamed Korean Rap Album Since 2022",
        body: "WINNER's Song Mino released his third solo album 'MANIAC,' which became the most-streamed Korean rap album globally since 2022. His raw, confessional lyrics about fame and identity resonated with both K-pop and hip-hop audiences.",
        category: "milestone",
        source: "Melon",
        publishedAt: d("2025-04-18"),
      },
      {
        headline: "WINNER Signs New Four-Member Contract With YG Through 2028",
        body: "All four WINNER members renewed their YG contracts for three additional years through 2028, making them one of the longest-running YG acts to keep a full lineup intact. The group cited creative freedom and a genuine friendship as keys to their longevity.",
        category: "label",
        source: "Allkpop",
        publishedAt: d("2025-08-14"),
      },
    ],
  },
  {
    slug: "zerobaseone",
    news: [
      {
        headline: "ZEROBASEONE Wins Rookie of the Year Across All Major Award Shows",
        body: "ZB1 swept the Rookie of the Year category at all five major Korean music awards (MAMA, Melon, Genie, Bugs, Golden Disc) — the first group to clean-sweep since EXO in 2013. Their debut album 'YOUTH IN THE SHADE' sold 2.1 million copies.",
        category: "award",
        source: "Soompi",
        publishedAt: d("2024-01-05"),
      },
      {
        headline: "ZEROBASEONE's First World Tour Covers 20 Countries in 5 Months",
        body: "Following their explosive debut, WakeOne Entertainment confirmed ZB1's first world tour will span 20 countries across Asia, North America, Europe, and South America. The 40-date tour is one of the largest first-tour rollouts for any K-pop group.",
        category: "milestone",
        source: "Weverse",
        publishedAt: d("2025-03-20"),
      },
      {
        headline: "Kim Jiwoong Stars in Hit Korean Drama 'My Demon' Season 2",
        body: "ZB1's Kim Jiwoong was cast in the lead role of Netflix Korea's second season of the supernatural romance 'My Demon,' receiving strong early reviews for his charismatic performance. The drama premiered in 30 countries simultaneously.",
        category: "drama",
        source: "Netflix Korea",
        publishedAt: d("2025-10-24"),
      },
      {
        headline: "ZB1 Members Begin Transitioning to Solo Careers Ahead of Group Graduation",
        body: "As ZEROBASEONE approaches the natural end of their two-year group contract, several members have announced solo activities: Sung Hanbin signed with BIGHIT Music, while Zhang Hao returned to China for an SM-affiliated project. Official graduation confirmed for August 2025.",
        category: "member",
        source: "Soompi",
        publishedAt: d("2025-07-15"),
      },
    ],
  },
  {
    slug: "le-sserafim",
    news: [
      {
        headline: "LE SSERAFIM Performs at Coachella 2026 to Unanimous Praise",
        body: "LE SSERAFIM's Coachella Weekend 1 set is being called one of the festival's best performances in a decade. The group opened with their viral 'CRAZY' megamix, performed a 20-minute live dance medley with no backing track, and closed with a cover of Beyoncé's 'Run the World (Girls)' that brought the crowd to its feet.",
        category: "milestone",
        source: "Rolling Stone",
        publishedAt: d("2026-04-13"),
      },
      {
        headline: "'PUREFLOW' Tour Becomes Fastest K-Pop Girl Group Tour to Sell 500K Tickets",
        body: "LE SSERAFIM's 'PUREFLOW' world tour sold its 500,000th ticket just 48 hours after the general on-sale — the fastest any K-pop girl group has reached that milestone. Demand crashed Ticketmaster's servers in six countries simultaneously.",
        category: "milestone",
        source: "Billboard",
        publishedAt: d("2026-03-28"),
      },
      {
        headline: "Kim Chaewon Named TIME's K-Pop Artist of the Year",
        body: "LE SSERAFIM leader Kim Chaewon was named TIME Magazine's K-Pop Artist of the Year for 2025, recognized for her leadership through the group's controversy-to-comeback arc and her increasingly confident artistic direction.",
        category: "award",
        source: "TIME Magazine",
        publishedAt: d("2025-12-18"),
      },
    ],
  },
  {
    slug: "ateez",
    news: [
      {
        headline: "ATEEZ Sells Out 8 Nights at Madison Square Garden",
        body: "ATEEZ became the first K-pop group to sell out eight consecutive nights at Madison Square Garden, with 160,000 total tickets moving in under 10 minutes. Their 'GOLDEN HOUR' world tour is the highest-grossing K-pop tour by a non-Big 3 artist.",
        category: "milestone",
        source: "Pollstar",
        publishedAt: d("2025-08-26"),
      },
      {
        headline: "ATEEZ Wins Artist of the Year at 2025 Mnet Asian Music Awards",
        body: "After seven years of building one of K-pop's most passionate fanbases, ATEEZ finally won Artist of the Year at MAMA 2025 — their first Daesang. Leader Hongjoong broke down in tears during the acceptance speech, saying: 'We just kept going.'",
        category: "award",
        source: "Mnet",
        publishedAt: d("2025-11-29"),
      },
      {
        headline: "Mingi Returns to Full Group Activities After Mental Health Break",
        body: "Song Mingi has fully rejoined ATEEZ's promotions and world tour, following his extended break for mental health treatment. In a heartfelt Weverse post, he thanked ATINY for their patience and confirmed his commitment to the group.",
        category: "member",
        source: "KQ Entertainment",
        publishedAt: d("2025-04-05"),
      },
      {
        headline: "ATEEZ Featured in BBC Documentary 'K-Pop: The Global Phenomenon'",
        body: "All eight ATEEZ members participated in a BBC documentary exploring K-pop's global rise, focusing on their journey from niche act to stadium headliners. The documentary aired in 42 countries and featured interviews with industry experts and international fans.",
        category: "milestone",
        source: "BBC",
        publishedAt: d("2025-10-02"),
      },
    ],
  },
  {
    slug: "illit",
    news: [
      {
        headline: "ILLIT's 'Magnetic' Becomes First HYBE Rookie Track to Enter Hot 100",
        body: "ILLIT made history with their debut track 'Magnetic,' which peaked at #91 on the Billboard Hot 100 — the first time a HYBE rookie debut track has charted in the US. The song's viral TikTok choreography has been used in 500 million videos.",
        category: "milestone",
        source: "Billboard",
        publishedAt: d("2024-03-25"),
      },
      {
        headline: "ILLIT Files Joint Statement Against Hive-ADOR Lawsuit Coverage",
        body: "ILLIT members issued a joint statement addressing the HYBE-ADOR legal dispute and public comparisons to NewJeans, asking fans not to direct hostility toward either group. The statement was praised as mature and was widely shared across K-pop communities.",
        category: "legal",
        source: "Soompi",
        publishedAt: d("2024-05-31"),
      },
      {
        headline: "ILLIT's First World Tour Announced for Q1 2026",
        body: "BELIFT LAB confirmed ILLIT's debut world tour covering Japan, Southeast Asia, North America, and Europe. The group's first US leg will include shows in LA, New York, and Chicago — all of which sold out within minutes.",
        category: "milestone",
        source: "Weverse",
        publishedAt: d("2025-09-22"),
      },
      {
        headline: "Yunah Cast as Lead in HYBE-Produced Netflix Drama 'Signal Girls'",
        body: "ILLIT's Yunah (Kim Yunah) has been cast as the lead in HYBE's first Netflix K-drama production 'Signal Girls,' about aspiring idols navigating trainee life. The casting is considered HYBE's direct investment in their newest act's mainstream crossover.",
        category: "drama",
        source: "Deadline",
        publishedAt: d("2026-02-20"),
      },
    ],
  },
];

async function main() {
  console.log("Seeding artist news for all artists...\n");

  let totalCreated = 0;
  let skipped = 0;

  for (const { slug, news } of artistNewsData) {
    const artist = await prisma.artist.findUnique({ where: { slug } });
    if (!artist) {
      console.warn(`⚠️  Artist not found: ${slug} — skipping`);
      skipped++;
      continue;
    }

    let created = 0;
    for (const item of news) {
      // Avoid exact duplicate headlines
      const existing = await prisma.artistNews.findFirst({
        where: { artistId: artist.id, headline: item.headline },
      });
      if (existing) continue;

      await prisma.artistNews.create({
        data: {
          artistId: artist.id,
          headline: item.headline,
          body: item.body,
          category: item.category,
          source: item.source ?? null,
          sourceUrl: item.sourceUrl ?? null,
          publishedAt: item.publishedAt ?? null,
        },
      });
      created++;
      totalCreated++;
    }

    console.log(`✅ ${artist.stageName}: +${created} news items`);
  }

  console.log(`\n✅ Done! Created ${totalCreated} news items across ${artistNewsData.length - skipped} artists.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
