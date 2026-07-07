// Shared K-pop quiz data — single source of truth for the /quiz pages and the
// homepage QuizModal. Each category is a standalone, individually shareable quiz.

export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type QuizCategory = {
  id: string;
  slug: string;          // URL segment: /quiz/<slug>
  title: string;         // page + social title
  label: string;         // short display name
  emoji: string;
  accent: string;        // per-quiz accent colour (distinct social identity)
  blurb: string;         // one-line hook for the hub card
  description: string;   // meta / OpenGraph description
  questions: QuizQuestion[];
};

export const QUIZZES: QuizCategory[] = [
  {
    id: "slang",
    slug: "kpop-dictionary",
    title: "K-pop Dictionary Quiz",
    blurb: "Bias wrecker, daesang, maknae, fancam — how fluent are you in fandom slang?",
    description: "Bias wrecker, daesang, maknae, fancam — how fluent are you in K-pop fandom slang? Take the 5-question K-pop Dictionary quiz on Aegyo Arena.",
    label: "K-pop Dictionary",
    emoji: "📖",
    accent: "#FFD700",
    questions: [
      {
        q: "What does 'bias wrecker' mean in K-pop fandom?",
        options: [
          "Your absolute favourite member in a group",
          "A member who keeps threatening to replace your bias",
          "An obsessive fan who follows idols everywhere",
          "A blogger who writes negative reviews of idols",
        ],
        answer: 1,
        explanation: "A bias wrecker is a member you didn't choose, but who constantly steals your attention — 'wrecking' your loyalty to your actual bias.",
      },
      {
        q: "A K-pop 'comeback' refers to...",
        options: [
          "A disbanded group permanently reuniting",
          "A group returning from a world tour",
          "Any new music release after a period of absence",
          "An idol returning from mandatory military service",
        ],
        answer: 2,
        explanation: "In K-pop, even a group releasing music just weeks after their last release calls it a 'comeback' — it's any new promotional cycle.",
      },
      {
        q: "'Daesang' (대상) at K-pop award shows means...",
        options: [
          "Best Choreography award",
          "Best Music Video award",
          "A special debut award",
          "The Grand Prize — the highest honour in K-pop",
        ],
        answer: 3,
        explanation: "Daesang (大賞) translates literally as 'grand prize' — winning one at MAMA or Melon Music Awards is the peak achievement in K-pop.",
      },
      {
        q: "The 'maknae' of a group is...",
        options: [
          "The leader who handles all press interviews",
          "The main dancer with the most fancam views",
          "The youngest member, often doted on by the group",
          "The member who writes all original songs",
        ],
        answer: 2,
        explanation: "막내 (maknae) means the youngest person. In idol groups, the maknae is often treated like the group's baby — babied by senior members and beloved by fans.",
      },
      {
        q: "A 'fancam' is...",
        options: [
          "A crowd-sourced voting app for idol polls",
          "An official fan club membership card",
          "A video focused on one specific member during a group performance",
          "The camera rig used during music video shoots",
        ],
        answer: 2,
        explanation: "Fancams track a single member throughout an entire performance. Lisa's MAMA 2019 fancam passed 400 million views — a record that helped introduce many fans to K-pop.",
      },
    ],
  },
  {
    id: "artist",
    slug: "artist-facts",
    title: "Artist Facts Quiz",
    blurb: "Debuts, labels, lineups and lore. Do you really know your faves?",
    description: "Debuts, labels, lineups and lore — do you really know your faves? Take the 5-question K-pop Artist Facts quiz on Aegyo Arena.",
    label: "Artist Facts",
    emoji: "🎤",
    accent: "#FF6B9D",
    questions: [
      {
        q: "Lisa founded her own entertainment label in January 2024. What is it called?",
        options: ["Manoban Music", "Bangkok Records", "Lloud", "LALI Entertainment"],
        answer: 2,
        explanation: "Lloud Co., Ltd. is Lisa's independent label, backed by a global distribution deal with RCA Records (Sony Music) — making her the first K-pop idol of her generation to own her own company.",
      },
      {
        q: "How many members does SEVENTEEN have?",
        options: ["7", "9", "11", "13"],
        answer: 3,
        explanation: "SEVENTEEN has 13 members — hence the name '13 + teen'. They're split into three units: Hip-Hop, Vocal, and Performance.",
      },
      {
        q: "aespa's groundbreaking concept involves each member having...",
        options: [
          "A real-life twin who performs as a body double",
          "A virtual AI counterpart called an 'æ'",
          "A solo alter ego with a different stage name",
          "A holographic avatar used on stage",
        ],
        answer: 1,
        explanation: "Each aespa member has an 'æ' — a virtual AI version of themselves living in the digital world called KWANGYA. This dual-world concept is central to the SMCU (SM Culture Universe) lore.",
      },
      {
        q: "Which group was formed through the 2020 survival show 'I-Land'?",
        options: ["TXT", "Stray Kids", "ENHYPEN", "Zerobaseone"],
        answer: 2,
        explanation: "ENHYPEN was formed through 'I-Land', co-produced by HYBE and CJ ENM. Their vampire-inspired debut concept and coming-of-age themes quickly earned them a massive global fanbase.",
      },
      {
        q: "Which BLACKPINK member debuted as a solo artist first?",
        options: ["Jisoo", "Rosé", "Jennie", "Lisa"],
        answer: 2,
        explanation: "Jennie released 'SOLO' in November 2018, making her the first BLACKPINK member to go solo. The track topped Korean charts and announced her as a formidable solo force.",
      },
    ],
  },
  {
    id: "mukbang",
    slug: "mukbang",
    title: "Mukbang & Food Quiz",
    blurb: "Idol eating shows, viral street-food moments and Korean food culture.",
    description: "Idol mukbangs, viral street-food moments and Korean food culture — take the 5-question Mukbang and Food quiz on Aegyo Arena.",
    label: "Mukbang & Food",
    emoji: "🍜",
    accent: "#FF6B35",
    questions: [
      {
        q: "Which BTS member is universally known as the group's biggest eater and the unofficial king of idol mukbang?",
        options: [
          "RM — he stress-eats before studio sessions",
          "Jin — earned the nickname 'Worldwide Handsome Eater'",
          "V — he eats black bean noodles every single day",
          "Jungkook — documented eating 3 full meals before sunrise",
        ],
        answer: 1,
        explanation: "Jin (Kim Seokjin) is BTS's legendary eater — nicknamed for his theatrical food reactions and ability to finish everyone else's leftovers. His mukbang content on Weverse consistently goes viral. He once ate an entire convenience store haul live on camera.",
      },
      {
        q: "In IVE's 'I AM' music video, Wonyoung is seen eating which iconic Korean street food that sent fans into a frenzy of fan cams?",
        options: [
          "Tteokbokki (spicy rice cakes)",
          "Hotteok (sweet pancake)",
          "Bungeoppang (fish-shaped pastry)",
          "Corn Dog (gamja hot dog)",
        ],
        answer: 2,
        explanation: "Bungeoppang — the fish-shaped red bean pastry — became a Wonyoung meme after she was spotted eating one on a winter schedule. Fans recreated photos holding bungeoppang trying to 'match her vibe.' The pastry briefly sold out near Starship Entertainment.",
      },
      {
        q: "Lisa went viral for her authentic Thai food content. Which dish does she consistently rank as her absolute comfort food from home?",
        options: [
          "Pad Thai — she calls it 'the standard'",
          "Som Tum (green papaya salad) — she claims it cures everything",
          "Khao Man Gai (chicken rice) — reminds her of her mum",
          "Mango sticky rice — she ships it to Paris on weekends",
        ],
        answer: 1,
        explanation: "Som Tum (ส้มตำ) — Thai green papaya salad — is Lisa's documented comfort food. In interviews she's said it's the first thing she craves when she misses Bangkok. She's been photographed at Thai restaurants in Seoul ordering it regardless of the season.",
      },
      {
        q: "The Korean word '먹방' (mukbang) is a portmanteau of which two Korean words?",
        options: [
          "먹다 (meokda, to eat) + 방송 (bangsong, broadcast)",
          "먹거리 (meokgeori, food) + 방문 (bangmun, visit)",
          "맛있다 (masitda, delicious) + 방 (bang, room)",
          "먹다 (meokda, to eat) + 방탄 (bangtan, bulletproof)",
        ],
        answer: 0,
        explanation: "먹방 = 먹다 (to eat) + 방송 (broadcast). The format originated in South Korea around 2010 and exploded globally through streaming platforms. K-pop idols doing mukbangs became a staple fan service genre — combining parasocial closeness with the deeply social Korean food culture.",
      },
      {
        q: "BLACKPINK's '24/365 with BLACKPINK' YouTube series featured the members eating together. Which member became an unexpected fan favourite for her dramatic food reactions?",
        options: [
          "Jennie — her 'it's giving main character energy' food takes",
          "Jisoo — her kimchi jjigae obsession became a running joke",
          "Rosé — her tiny bites vs enormous portions became iconic",
          "Lisa — she turned every meal into a dance performance",
        ],
        answer: 1,
        explanation: "Jisoo's kimchi jjigae obsession became a fan-beloved running joke throughout the series. She consistently ranked it above anything else, defended it passionately against other food opinions, and BLINKs began sending kimchi jjigae food trucks to BLACKPINK shoots in tribute.",
      },
    ],
  },
  {
    id: "lyrics",
    slug: "lyrics-challenge",
    title: "K-pop Lyrics Challenge",
    blurb: "Translate the line, name the song, finish the lyric.",
    description: "Translate the line, name the song, finish the lyric — from BLACKPINK to NewJeans. Take the 5-question K-pop Lyrics Challenge on Aegyo Arena.",
    label: "Lyrics Challenge",
    emoji: "🎵",
    accent: "#4ECDC4",
    questions: [
      {
        q: "'내 독이 퍼지게 해줘' from BLACKPINK's Pink Venom translates to...",
        options: [
          "\"Let my love bloom everywhere\"",
          "\"Let my music play on\"",
          "\"Let my venom spread\"",
          "\"Let my tears fall free\"",
        ],
        answer: 2,
        explanation: "독 (dok) means venom or poison. BLACKPINK's 'Pink Venom' is built on the flower-with-thorns metaphor — beautiful but dangerous.",
      },
      {
        q: "Which song contains '나는 나야' (naneun naya — \"I am myself\")?",
        options: [
          "MONEY by Lisa",
          "LALISA by Lisa",
          "NEW WOMAN by Lisa feat. Rosalía",
          "ROCKSTAR by Lisa",
        ],
        answer: 1,
        explanation: "'나는 나야' closes LALISA, Lisa's debut single. It became a fan anthem — a manifesto of self-identity after years of being shaped by an entertainment system.",
      },
      {
        q: "'방콕에서 여기까지' (From Bangkok to here) appears in which song?",
        options: ["MONEY", "ROCKSTAR", "LALISA", "BORN AGAIN"],
        answer: 2,
        explanation: "LALISA is Lisa's autobiographical debut track. The line 'from Bangkok to here' traces her journey from Thailand to Seoul at 13, alone, to train at YG Entertainment.",
      },
      {
        q: "Complete this BTS Dynamite lyric: 'Shining through, I light up when ___'",
        options: [
          "\"...the night falls down\"",
          "\"...you call my name\"",
          "\"...ARMY calls for me\"",
          "\"...the stars align\"",
        ],
        answer: 1,
        explanation: "'Shining through, I light up when you call my name' — Dynamite was BTS's first all-English track and their first song to debut at #1 on the Billboard Hot 100.",
      },
      {
        q: "'심장이 자꾸 뛰어' (My heart keeps racing) is a lyric from...",
        options: [
          "Boy With Luv — BTS",
          "Hype Boy — NewJeans",
          "FANCY — TWICE",
          "Next Level — aespa",
        ],
        answer: 1,
        explanation: "From NewJeans' 'Hype Boy' — '나 요즘 왜 이러지 / 심장이 자꾸 뛰어' (Why am I like this lately / My heart keeps racing). The song became a massive all-kill on debut.",
      },
    ],
  },
];

export const QUIZ_SLUGS: string[] = QUIZZES.map((q) => q.slug);

export function getQuizBySlug(slug: string): QuizCategory | undefined {
  return QUIZZES.find((q) => q.slug === slug);
}
