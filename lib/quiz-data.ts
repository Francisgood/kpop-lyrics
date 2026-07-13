// Shared K-pop quiz data — single source of truth for the /quiz pages and the
// homepage QuizModal. Each category is a standalone, individually shareable quiz.

export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
  image?: string;      // optional illustrative GIF/image shown above the options
  imageAlt?: string;
  sourceUrl?: string;    // optional "watch the clip" link shown at the bottom of the question
  sourceLabel?: string;
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
    id: "aegyo",
    slug: "aegyo",
    title: "Aegyo & Aegyo-Sal Quiz",
    blurb: "Aegyo-sal, buing buing, and the science of cute — how fluent are you in K-pop's charm code?",
    description: "What is aegyo-sal? Why do East Asian cultures prize aegyo as charming rather than attention-seeking? Test your knowledge of K-pop's cuteness code — the eye-smile, the gestures, and the science of cute — in this 10-question Aegyo quiz on Aegyo Arena.",
    label: "Aegyo",
    emoji: "🥺",
    accent: "#C77DFF",
    questions: [
      {
        q: "The K-beauty term 애교살 (aegyo-sal) refers to which facial feature?",
        options: [
          "A deep dimple that appears in the cheek when smiling",
          "The small roll of muscle right under the lower lash line that puffs up in a smile",
          "The rosy flush high on the cheekbones",
          "The crease of a double eyelid",
        ],
        answer: 1,
        explanation: "애교살 literally means 'charm flesh' (애교 aegyo = charm + 살 sal = flesh). It's the little band of orbicularis-oculi muscle just beneath the lower lashes that plumps into a soft ridge when you smile, making the eyes look bigger, brighter and more expressive.",
      },
      {
        q: "How is aegyo-sal different from an 'eye bag'?",
        options: [
          "They're identical — just two words for the same thing",
          "Aegyo-sal is the thin cute ridge right under the lashes; eye bags are the lower, saggier puffiness read as tired or aging",
          "Aegyo-sal only appears on men",
          "Eye bags are considered cute; aegyo-sal is considered aging",
        ],
        answer: 1,
        explanation: "Position is everything. Aegyo-sal sits directly under the lash line and reads as youthful and charming; true under-eye bags (눈밑지방) sit lower and are associated with fatigue and aging. K-beauty makeup exaggerates the former while concealing the latter.",
      },
      {
        q: "K-pop's classic aegyo 'eye smile' — cheeks up, eyes curved into crescents, finger hearts out (as in this GIF) — is prized because it…",
        image: "/images/quiz/aegyo-expression.gif",
        imageAlt: "A K-pop idol smiling with a doe-eyed 'eye smile' and pointing at her cheeks with finger hearts — a classic aegyo expression.",
        options: [
          "Makes her look older and more authoritative",
          "Makes the eyes read as bigger, younger and warmer — the aegyo-sal effect",
          "Signals that she is about to cry",
          "Only works under bright stage lighting",
        ],
        answer: 1,
        explanation: "That crescent 'eye smile' — cheeks up, aegyo-sal plumped — is the visual core of aegyo. The plumped under-eye makes the eyes look larger and more childlike, which people instinctively find endearing (the 'baby schema').",
      },
      {
        q: "Idols are constantly asked to 'do aegyo' on variety shows. A move like the hands-framing-the-face, sing-song pose in this GIF is best described as…",
        image: "/images/quiz/aegyo-pose.gif",
        imageAlt: "A K-pop idol cupping her face with both hands in a cutesy 'flower' aegyo pose surrounded by floating hearts.",
        options: [
          "A martial-arts guard position",
          "A performed act of cuteness — like 뿌잉뿌잉 (buing buing) or the 'Gwiyomi' play",
          "A traditional court bow",
          "A vocal warm-up exercise",
        ],
        answer: 1,
        explanation: "Aegyo isn't only a look, it's a performance — cutesy voice, gestures and poses like 뿌잉뿌잉 (buing buing, twisting fists at the cheeks) or the viral 'Gwiyomi' counting play. Variety shows love putting idols on the spot to perform it.",
      },
      {
        q: "Why is aegyo considered a socially acceptable way to draw attention or ask for a favour?",
        options: [
          "Because it signals wealth and high social status",
          "Because acting endearing feels warm and non-threatening, so it wins affection without seeming arrogant or pushy",
          "Because it is legally required of service workers",
          "Because it removes the need to ever say thank you",
        ],
        answer: 1,
        explanation: "In cultures that prize social harmony, openly demanding attention can read as arrogant. Aegyo reframes the ask as playful and endearing — a soft, face-saving way to seek affection, defuse tension, or coax a 'yes' without confrontation.",
      },
      {
        q: "Japan has a closely related beauty ideal for the coveted under-eye plumpness. What is it called?",
        options: [
          "涙袋 (namida-bukuro), literally 'tear bag'",
          "漫画 (manga)",
          "侘寂 (wabi-sabi)",
          "木漏れ日 (komorebi)",
        ],
        answer: 0,
        explanation: "Japan calls the prized under-eye plumpness 涙袋 (namida-bukuro), 'tear bag,' valued for the same youthful, doe-eyed effect. The broader cute-culture parallel is kawaii — Korea's aegyo and Japan's kawaii are close cousins.",
      },
      {
        q: "How do K-beauty makeup artists fake or boost aegyo-sal?",
        options: [
          "By drawing one thick black line across the entire under-eye",
          "By dabbing a shimmery light shade on the ridge and a thin soft-brown shadow just beneath it",
          "By applying bright red blush directly under the eye",
          "By gluing false lashes onto the lower lid only",
        ],
        answer: 1,
        explanation: "The trick is light and shadow: a pearly highlight on the aegyo-sal ridge catches the light so it looks plump, and a faint brown line underneath fakes the natural shadow — creating a 3-D 'pillow' under the eye. Fillers and fat-grafting do it more permanently.",
      },
      {
        q: "Who performs aegyo in Korean pop culture?",
        options: [
          "Only female idols",
          "Only trainees under 18",
          "Everyone — male idols are regularly asked to do it too, and it's used among friends, couples, and even toward elders or bosses",
          "Only actors, never singers",
        ],
        answer: 2,
        explanation: "Though often stereotyped as feminine, aegyo is performed by male idols on cue (frequently for comedic effect), and everyday aegyo shows up between friends, couples, and even toward elders or bosses to soften a request. It's a whole social register, not just a girl-group thing.",
      },
      {
        q: "The 2013 viral 'Gwiyomi (귀요미) Player' craze — idols counting '1 + 1' with escalating cuteness — is a textbook example of what?",
        image: "/images/quiz/aegyo-gwiyomi.gif",
        imageAlt: "A performer doing the Gwiyomi Song's cutesy counting routine, hands framing the face — the aegyo gesture that went viral.",
        options: [
          "A dance-battle format",
          "A meme-ified aegyo performance that spread worldwide",
          "A cooking-show segment",
          "A rap cypher",
        ],
        answer: 1,
        explanation: "귀요미 means 'cutie.' The Gwiyomi Song turned aegyo into a copy-me challenge — an escalating cutesy counting routine — and it went global, showing how aegyo doubles as shareable, participatory content.",
        sourceUrl: "https://www.youtube.com/watch?v=YjZ1vd1YgOE",
        sourceLabel: "Watch the Gwiyomi Song clip on YouTube",
      },
      {
        q: "Scientists explain the universal pull of aegyo with the 'baby schema' (Kindchenschema). What is it?",
        options: [
          "A theory about how babies acquire language",
          "The instinct to feel warmth and a protective urge toward big-eyed, round, childlike features",
          "A standardized K-pop training curriculum",
          "A camera lens that digitally enlarges the eyes",
        ],
        answer: 1,
        explanation: "Ethologist Konrad Lorenz described how big eyes, round cheeks and small chins trigger caregiving instincts across humans. Aegyo — and aegyo-sal's big-eyed effect — deliberately leans into this, a big reason cuteness works so well as social currency.",
      },
    ],
  },
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
    id: "korean-slang",
    slug: "korean-slang",
    title: "Korean Slang Quiz",
    blurb: "치맥, 눈치, 대박, 리즈 — do you actually speak K-pop's Korean slang?",
    description: "치맥, 눈치, 대박, 리즈 — how much everyday Korean slang do you actually know? Test yourself on 10 real Korean expressions from the Aegyo Arena slang dictionary.",
    label: "Korean Slang",
    emoji: "💬",
    accent: "#4AC8F0",
    questions: [
      {
        q: "A fan shouts '대박 (daebak)!' the moment their group wins a Daesang. What does 대박 express?",
        options: [
          "\"Better luck next time\"",
          "\"Awesome! / Jackpot!\" — total amazement",
          "\"I'm so bored\"",
          "\"Let's go home\"",
        ],
        answer: 1,
        explanation: "대박 originally meant 'great success' or 'jackpot/windfall,' then became an all-purpose exclamation of amazement. It's one of the most widely borrowed Korean words in global fandom — used for shock announcements, stunning visuals, or surprise chart wins.",
      },
      {
        q: "치맥 (chimaek) — a Korean national institution and variety-show staple — is a mashup of which two things?",
        options: [
          "Cheese + macaroni",
          "Fried chicken + beer (치킨 + 맥주)",
          "Tea + rice cake",
          "Chili + noodles",
        ],
        answer: 1,
        explanation: "치맥 = 치킨 (chicken) + 맥주 (beer) — Korea's beloved fried-chicken-and-beer pairing. It's so iconic it has its own festival in Daegu, and idols reference it constantly (and endorse chicken brands).",
      },
      {
        q: "An idol who gracefully reads the mood of a room and responds perfectly is said to have great 눈치 (nunchi). What is it?",
        options: [
          "A powerful singing voice",
          "Social awareness — the ability to read the room and unspoken cues",
          "A huge fan following",
          "Flawless dance timing",
        ],
        answer: 1,
        explanation: "눈치 (literally 'eye-measure') is the Korean art of reading a room — catching unspoken cues and reacting appropriately. Good 눈치 helps idols handle interviews and group dynamics gracefully; lacking it is a classic criticism of tone-deaf behavior.",
      },
      {
        q: "정 (jeong) is often called untranslatable. What does it describe?",
        options: [
          "A quick crush that fades fast",
          "A deep attachment and affection that builds slowly over time",
          "A signed business contract",
          "Rage at a rival group",
        ],
        answer: 1,
        explanation: "정 is a uniquely Korean concept — the deep, sticky bond that grows through shared history. It's the loyalty between longtime members and the attachment fans feel after following an idol through every era. You can even develop 정 for a song or a place.",
      },
      {
        q: "In K-pop commentary, a veteran who lectures younger groups about 'real talent' and 'the old ways' might be called a 꼰대 (kkondae). Who is that?",
        options: [
          "A generous mentor",
          "A preachy, out-of-touch older person who moralizes at younger people",
          "A backup dancer",
          "A first-time concertgoer",
        ],
        answer: 1,
        explanation: "꼰대 is the rigid elder who constantly references 'back in my day' and lectures juniors. Gen Z broadened it into a catch-all for any condescending, boomer-style moralizing — including industry vets who gatekeep what counts as 'real' K-pop.",
      },
      {
        q: "Your bias flashes an unexpected sweet smile and you feel 심쿵 (simkung). What just happened?",
        options: [
          "Your heart skipped and fluttered (심장 + 쿵, a 'heart-thud')",
          "You fell asleep",
          "You got a headache",
          "You won a giveaway",
        ],
        answer: 0,
        explanation: "심쿵 = 심장 (heart) + 쿵 (a thud sound) — the little heart-drop when an idol does something unexpectedly charming. It's one of the most common reactions to idol content, from a casual vlog smile to a breathtaking stage look.",
      },
      {
        q: "Fans call an idol's 2016 comeback their 리즈 (rijeu). Surprisingly, this slang for 'peak/prime era' traces back to…",
        options: [
          "A famous Korean poet",
          "The English football club Leeds United",
          "A makeup brand",
          "A kind of flower",
        ],
        answer: 1,
        explanation: "리즈 means someone's absolute prime — their best-looking, best-performing era. It traces back through a Korean internet meme to Leeds United (a footballer's 'Leeds era' being his peak). Now it's pure K-pop shorthand: 'that was her 리즈 era.'",
      },
      {
        q: "An idol films a cozy vlog of themselves 혼밥 (honbap). What are they doing?",
        options: [
          "Cooking a feast for the whole group",
          "Eating alone (혼자 + 밥)",
          "Ordering the most expensive dish on the menu",
          "Skipping a meal to practice",
        ],
        answer: 1,
        explanation: "혼밥 = 혼자 (alone) + 밥 (meal) — eating solo. Once mildly stigmatized in Korea's communal food culture, it was normalized in the mid-2010s, and idol 혼밥 vlogs now look downright aspirational. (Its drinking cousin is 혼술, honsul.)",
      },
      {
        q: "A surprise disbandment announcement leaves the whole fandom in total 멘붕 (menbung). What is it?",
        options: [
          "A dance formation",
          "A mental breakdown — being totally overwhelmed (멘탈 붕괴)",
          "A ticketing website",
          "A celebration party",
        ],
        answer: 1,
        explanation: "멘붕 is short for 멘탈 붕괴 ('mental collapse') — the brain-melting overwhelm of too much to process, whether it's a shocking controversy, a surprise comeback, or a performance so good your brain short-circuits.",
      },
      {
        q: "Fans hold up an idol's 5 a.m. workouts and language study as 갓생 (gatsaeng) goals. What does 갓생 mean?",
        options: [
          "A lazy day off",
          "The ideal disciplined, maximally productive 'god life' (갓 + 생)",
          "A concert afterparty",
          "A crash diet",
        ],
        answer: 1,
        explanation: "갓생 = 갓 (god, as in 'godlike') + 생 (life) — living a disciplined, growth-focused, ultra-productive existence. Fans admire idols' punishing routines (early workouts, multi-language study, perfectionist rehearsals) as 갓생 inspiration.",
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
