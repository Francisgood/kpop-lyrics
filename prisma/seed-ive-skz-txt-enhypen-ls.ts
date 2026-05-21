import { PrismaClient } from "@prisma/client";

function lyrics(lines: [string, string, string][]): { lyricsKo: string; lyricsRomanized: string; lyricsEn: string } {
  return {
    lyricsKo: lines.map(l => l[0]).join("\n"),
    lyricsRomanized: lines.map(l => l[1]).join("\n"),
    lyricsEn: lines.map(l => l[2]).join("\n"),
  };
}

export async function seed(prisma: PrismaClient): Promise<void> {
  const starship = await prisma.label.findUnique({ where: { slug: "starship-entertainment" } });
  const jyp      = await prisma.label.findUnique({ where: { slug: "jyp-entertainment" } });
  const hybe     = await prisma.label.findUnique({ where: { slug: "hybe-entertainment" } });

  // ── IVE ──────────────────────────────────────────────────────────────────────
  const ive = await prisma.artist.upsert({
    where: { slug: "ive" }, update: {},
    create: {
      slug: "ive", type: "GROUP", stageName: "IVE", debutYear: 2021,
      labelId: starship?.id,
      bio: "IVE (아이브) is a six-member South Korean girl group formed by Starship Entertainment. Debuting on December 1, 2021, the group consists of Yujin, Gaeul, Rei, Wonyoung, Liz, and Leeseo. Known for their sophisticated confidence concept and polished performances, IVE became the defining fourth-generation act with consecutive #1 hits.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/IVE_in_2023_%28cropped%29.jpg/960px-IVE_in_2023_%28cropped%29.jpg",
    },
  });

  const iveAlbum1 = await prisma.album.upsert({ where: { slug: "ive-eleven" }, update: {}, create: { slug: "ive-eleven", title: "ELEVEN", artistId: ive.id, releaseYear: 2021, type: "SINGLE", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/3/37/IVE_-_Eleven.png/220px-IVE_-_Eleven.png" } });
  const iveAlbum2 = await prisma.album.upsert({ where: { slug: "ive-ive" },    update: {}, create: { slug: "ive-ive",    title: "IVE IVE",  artistId: ive.id, releaseYear: 2023, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/IVE_-_I%27ve_IVE.png/220px-IVE_-_I%27ve_IVE.png" } });

  const iveLoveDive = await prisma.song.upsert({ where: { slug: "ive-love-dive" }, update: {}, create: { slug: "ive-love-dive", title: "LOVE DIVE", albumId: iveAlbum1.id, releaseYear: 2022,
    ...lyrics([
      ["나르시스처럼 난 내 눈에 빠져", "Nareusiseuceoreom nan nae nune ppajyeo", "Like Narcissus, I fall into my own eyes"],
      ["근데 왜 이 호수엔 네 얼굴이 보여", "Geunde wae i hosuaen ne eolguri boyeo", "But why do I see your face in this lake"],
      ["확인하고 싶어 내가 널 원하는 건지", "Hwagin hago sipeo naega neol wonhaneun geonji", "I want to confirm whether I want you"],
      ["아님 내 기분에 취해서 그런 건지", "Anim nae gibune chwiaeseo geureon geonji", "Or if I'm just intoxicated by my own feelings"],
      ["", "", ""],
      ["들어봐 내 심장 소리가", "Deureobwa nae simjang soriga", "Listen to the sound of my heart"],
      ["오늘따라 더 크게 들려", "Oneulttara deo keuge deullyeo", "It sounds louder than usual today"],
      ["이건 분명히 너 때문이야", "Igeon bunmyeonghi neo ttaemuniya", "This is clearly because of you"],
      ["Love dive into my eyes", "Love dive into my eyes", "Love dive into my eyes"],
      ["", "", ""],
      ["내 맘속에 풍덩 뛰어들어", "Nae mamsogeul pungdeong ttwieodeulleo", "Dive deep into my heart"],
      ["I love, I love, I love dive", "I love, I love, I love dive", "I love, I love, I love dive"],
      ["한 치 앞도 안 보여도", "Han chi apdo an boyeodo", "Even when I can't see an inch ahead"],
      ["그냥 여기 있어줘", "Geunyang yeogie isseojweo", "Just stay here with me"],
      ["", "", ""],
      ["헷갈려 아직도 사랑인지 집착인지", "Hetgallyeo ajikdo saranginji jipchaginji", "I'm confused, still unsure if it's love or obsession"],
      ["설레는 이 기분을 어떻게 설명하지", "Seolreneun i gibeumeul eotteoke seolmyeonghaji", "How do I explain this fluttering feeling"],
      ["너무 좋아 겁이 날 정도야", "Neomu joa geopi nal jeongdoya", "I like you so much it scares me"],
      ["이 감정에 솔직하게 따라가 볼까", "I gamjeonge soljikage ttaragaga bolkka", "Should I honestly follow this feeling"],
      ["", "", ""],
      ["아름다운 착각이라도 괜찮아", "Areumdaun chakgagiraedo gwaenchana", "Even a beautiful illusion is fine"],
      ["이 순간만큼은 진심이야", "I sunganmankeumeun jinsimiya", "At least in this moment, it's sincere"],
      ["나를 바라보는 네 두 눈이", "Nareul baraborneun ne du nuni", "Your two eyes looking at me"],
      ["날 숨 막히게 해", "Nal sum makige hae", "Leave me breathless"],
      ["", "", ""],
      ["Love dive into my eyes", "Love dive into my eyes", "Love dive into my eyes"],
      ["Love dive, love dive", "Love dive, love dive", "Love dive, love dive"],
      ["깊이 빠져들어", "Gipi ppajyeodeulleo", "Fall deeper"],
      ["나에게로 와", "Naegero wa", "Come to me"],
    ]),
  }});

  const iveAfterLike = await prisma.song.upsert({ where: { slug: "ive-after-like" }, update: {}, create: { slug: "ive-after-like", title: "After LIKE", albumId: iveAlbum1.id, releaseYear: 2022,
    ...lyrics([
      ["Like 다음엔 뭐가 와", "Like daeumena mwoga wa", "What comes after Like"],
      ["그 감정이 뭔지 몰라", "Geu gamjeongi mwonji molla", "I don't know what that feeling is"],
      ["두근두근 설레는 거 알아", "Dugeundugeun seolreneun geo ara", "I know this flutter, this excitement"],
      ["근데 너는 나를 좋아하니", "Geunde neoneun nareul joahani", "But do you like me"],
      ["", "", ""],
      ["I feel the love right now", "I feel the love right now", "I feel the love right now"],
      ["이게 사랑인 건지", "Ige sarangin geonji", "Is this what love is"],
      ["아직 잘 모르겠어", "Ajik jal moreugesseo", "I'm still not sure"],
      ["하지만 네 옆에 있고 싶어", "Hajiman ne yeopae itgo sipeo", "But I want to be by your side"],
      ["", "", ""],
      ["After LIKE, after LIKE", "After LIKE, after LIKE", "After LIKE, after LIKE"],
      ["너를 향한 이 마음", "Neoreul hyanghan i maeum", "These feelings aimed at you"],
      ["점점 커져가고 있어", "Jeomjeom keojyeogago isseo", "Are growing bigger and bigger"],
      ["멈출 수가 없어", "Meomchul suga eopseo", "I can't stop it"],
      ["", "", ""],
      ["Like 다음엔 뭐가 올까", "Like daeumena mwoga olkka", "What will come after Like"],
      ["Love가 오는 건 아닐까", "Love-ga oneun geon animkka", "Could Love be coming"],
      ["그 답을 알고 싶어서", "Geu dabeul algo sipeoeo", "Because I want to know that answer"],
      ["오늘도 네 곁에 있어", "Oneuldo ne gyeote isseo", "I'm by your side today too"],
    ]),
  }});

  const iveIAm = await prisma.song.upsert({ where: { slug: "ive-i-am" }, update: {}, create: { slug: "ive-i-am", title: "I AM", albumId: iveAlbum2.id, releaseYear: 2023,
    ...lyrics([
      ["I am what I am", "I am what I am", "I am what I am"],
      ["나를 사랑하는 법을 배워가고 있어", "Nareul saranghaneun beobeul baewogago isseo", "I'm learning how to love myself"],
      ["완벽하지 않아도 괜찮아", "Wanbyeokhaji anado gwaenchana", "It's okay that I'm not perfect"],
      ["있는 그대로의 나를 믿어", "Inneun geudaeroeui nareul midyeo", "I trust myself just as I am"],
      ["", "", ""],
      ["거울 속에 비친 내 모습", "Georulsoge bichin nae moseup", "The me reflected in the mirror"],
      ["가끔은 낯설고 두렵지만", "Gakkeumun natseolgo duryeopjiman", "Sometimes feels strange and scary"],
      ["그래도 이게 나야", "Geuraedo ige naya", "But still, this is me"],
      ["I am, I am, I am", "I am, I am, I am", "I am, I am, I am"],
      ["", "", ""],
      ["세상이 원하는 모습이 아니어도", "Sesangi wonhaneun moseupi aniyeodo", "Even if it's not what the world wants"],
      ["내가 원하는 나로 살아갈 거야", "Naega wonhaneun naro salagal geoya", "I'll live as the me I want to be"],
      ["I am, I am, I am", "I am, I am, I am", "I am, I am, I am"],
      ["있는 그대로 나야", "Inneun geudaero naya", "This is just who I am"],
      ["", "", ""],
      ["남들의 시선에 흔들리지 마", "Namdeueui siseon-e heundeulli ji ma", "Don't be shaken by others' gazes"],
      ["너만의 길을 걸어가", "Neomaneui gireul georeoga", "Walk your own path"],
      ["I am who I am", "I am who I am", "I am who I am"],
      ["그게 가장 아름다운 거야", "Geuge gajang areumdaun geoya", "That's the most beautiful thing"],
    ]),
  }});

  const iveKitsch = await prisma.song.upsert({ where: { slug: "ive-kitsch" }, update: {}, create: { slug: "ive-kitsch", title: "Kitsch", albumId: iveAlbum2.id, releaseYear: 2023,
    ...lyrics([
      ["Kitsch, kitsch", "Kitsch, kitsch", "Kitsch, kitsch"],
      ["내 감성이 좀 유치하면 어때", "Nae gamseong-i jom yuchihwamyeon eottae", "So what if my taste is a bit tacky"],
      ["좋으면 그만이지", "Joeumyeon geumaniji", "If I like it, that's enough"],
      ["Kitsch 하더라도 진짜 내 거야", "Kitsch hadeordo jinjja nae geoya", "Even if it's kitsch, it's genuinely mine"],
      ["", "", ""],
      ["유행이 뭐든 상관없어", "Yuhaeng-i mwodeun sanggwaneopseo", "Whatever the trend, I don't care"],
      ["내가 좋아하는 게 최고야", "Naega joahaneun ge choegoya", "What I love is the best"],
      ["남들 눈치 볼 필요 없어", "Namdeul nunchi bol pilyo eopseo", "No need to worry about what others think"],
      ["내 취향이 곧 트렌드야", "Nae chwiyang-i got teeurendeunya", "My taste is the trend"],
      ["", "", ""],
      ["It's okay to be kitsch", "It's okay to be kitsch", "It's okay to be kitsch"],
      ["나만의 색깔로 물들일 거야", "Namaneui saekgallo muldeulil geoya", "I'll color everything in my own shade"],
      ["Kitsch, 이게 나야", "Kitsch, ige naya", "Kitsch, this is me"],
      ["완벽한 나의 불완전함", "Wanbyeokhan naui burwanjeokham", "My perfectly imperfect self"],
    ]),
  }});

  const iveBaddie = await prisma.song.upsert({ where: { slug: "ive-baddie" }, update: {}, create: { slug: "ive-baddie", title: "Baddie", albumId: iveAlbum2.id, releaseYear: 2023,
    ...lyrics([
      ["Baddie, baddie, baddie", "Baddie, baddie, baddie", "Baddie, baddie, baddie"],
      ["나 요즘 어때 보여", "Na yojeum eottae boyeo", "How do I look lately"],
      ["솔직히 말해봐", "Soljiki malhaebwa", "Tell me honestly"],
      ["너무 멋있어 그렇지", "Neomu meossisseo geureochi", "Too cool, right"],
      ["", "", ""],
      ["내가 걸어가면 시선이 몰려", "Naega georeogamyeon siseon-i mollyeo", "When I walk, all eyes are drawn to me"],
      ["이게 다 내 힘이야", "Ige da nae himiya", "All of this is my power"],
      ["Baddie, that's me", "Baddie, that's me", "Baddie, that's me"],
      ["누구도 날 막을 수 없어", "Nugudo nal mageul su eopseo", "Nobody can stop me"],
      ["", "", ""],
      ["세상이 내 무대야", "Sesangi nae mudaeya", "The world is my stage"],
      ["내가 원하는 대로 움직여", "Naega wonhaneun daero umjigyo", "It moves the way I want"],
      ["Baddie, I'm a baddie", "Baddie, I'm a baddie", "Baddie, I'm a baddie"],
      ["이게 내 스타일이야", "Ige nae seutaileunya", "This is my style"],
    ]),
  }});

  for (const s of [iveLoveDive, iveAfterLike, iveIAm, iveKitsch, iveBaddie]) {
    await prisma.songCredit.upsert({ where: { id: `credit-${s.slug}-ive` }, update: {}, create: { id: `credit-${s.slug}-ive`, songId: s.id, artistId: ive.id, role: "performer" } });
  }

  // ── STRAY KIDS ───────────────────────────────────────────────────────────────
  const straykids = await prisma.artist.upsert({
    where: { slug: "stray-kids" }, update: {},
    create: {
      slug: "stray-kids", type: "GROUP", stageName: "Stray Kids", debutYear: 2018,
      labelId: jyp?.id,
      bio: "Stray Kids is an eight-member South Korean boy group formed by JYP Entertainment. Debuting on March 25, 2018, the group (Bang Chan, Lee Know, Changbin, Hyunjin, Han, Felix, Seungmin, I.N) is known for their self-produced music, intense performance style, and the production unit 3RACHA.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Stray_Kids_at_KCON_LA_2022.jpg/960px-Stray_Kids_at_KCON_LA_2022.jpg",
    },
  });

  const skzAlbum1 = await prisma.album.upsert({ where: { slug: "stray-kids-noeasy" }, update: {}, create: { slug: "stray-kids-noeasy", title: "NOEASY", artistId: straykids.id, releaseYear: 2021, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/8/89/Stray_Kids_-_Noeasy.png/220px-Stray_Kids_-_Noeasy.png" } });
  const skzAlbum2 = await prisma.album.upsert({ where: { slug: "stray-kids-maxident" }, update: {}, create: { slug: "stray-kids-maxident", title: "MAXIDENT", artistId: straykids.id, releaseYear: 2022, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f8/Stray_Kids_-_Maxident.png/220px-Stray_Kids_-_Maxident.png" } });

  const skzGodMenu = await prisma.song.upsert({ where: { slug: "stray-kids-gods-menu" }, update: {}, create: { slug: "stray-kids-gods-menu", title: "God's Menu (神메뉴)", albumId: skzAlbum1.id, releaseYear: 2020,
    ...lyrics([
      ["이건 비밀인데", "Igeon bimiirinde", "This is a secret, but"],
      ["우리 요리사들이 모여", "Uri yorisadeuri moyeo", "Our chefs have gathered"],
      ["특별한 메뉴를 만들어", "Teukbyeolhan menyureul mandeulleo", "To create a special menu"],
      ["오늘 밤 파티가 열려", "Oneul bam patiga yeollyeo", "Tonight a party opens"],
      ["", "", ""],
      ["God's menu, God's menu", "God's menu, God's menu", "God's menu, God's menu"],
      ["우리가 만든 이 요리", "Uriga mandeun i yori", "This dish we've made"],
      ["세상 어디서도 못 먹어봤어", "Sesang eodiseo-do mot meokeobwasseo", "You've never tasted it anywhere in the world"],
      ["God's menu, taste it now", "God's menu, taste it now", "God's menu, taste it now"],
      ["", "", ""],
      ["매운 맛 단 맛 짠 맛", "Maeun mat dan mat jjan mat", "Spicy sweet salty"],
      ["전부 다 우리 거야", "Jeonbu da uri geoya", "All of it is ours"],
      ["입맛에 맞게 골라봐", "Immae-e matke gollaabwa", "Choose according to your taste"],
      ["오늘 밤 우리가 쏜다", "Oneul bam uriga ssonda", "Tonight we're treating"],
      ["", "", ""],
      ["식욕을 자극하는", "Sigyogeul jageukaneun", "Stimulating the appetite"],
      ["우리만의 레시피", "Urimaneui ressipi", "Our very own recipe"],
      ["아무도 따라 못 해", "Amudo ttara mot hae", "Nobody can replicate it"],
      ["특제 소스가 있어", "Teukje sosuga isseo", "We have a special sauce"],
      ["", "", ""],
      ["God's menu, 지금 당장 맛봐", "God's menu, jigeum dangjang matbwa", "God's menu, taste it right now"],
      ["우리가 차린 이 밥상", "Uriga charin i bapsang", "This table we've set"],
      ["절대 후회 없을 거야", "Jeoldae huhoe eopseul geoya", "You'll never regret it"],
      ["God's menu, God's menu", "God's menu, God's menu", "God's menu, God's menu"],
    ]),
  }});

  const skzThunderous = await prisma.song.upsert({ where: { slug: "stray-kids-thunderous" }, update: {}, create: { slug: "stray-kids-thunderous", title: "Thunderous (소리꾼)", albumId: skzAlbum1.id, releaseYear: 2021,
    ...lyrics([
      ["봐라 소리꾼이 왔다", "Bwara soriguni watda", "Look, the performer has arrived"],
      ["이 무대를 가져라", "I mudaereul gajyeora", "Take this stage"],
      ["천둥 번개 치듯", "Cheondung beongae chideut", "Like thunder and lightning strike"],
      ["세상을 뒤흔들어", "Sesangeul dwiheundeulleo", "Shake the world"],
      ["", "", ""],
      ["Thunderous, 소리꾼", "Thunderous, soriguun", "Thunderous, performer"],
      ["내 소리가 세상을 깨워", "Nae soriga sesangeul kkaewo", "My voice awakens the world"],
      ["울려 퍼져라", "Ullyeo peojyeora", "Ring out and spread"],
      ["이 땅 끝까지", "I ttang kkeutkkaji", "To the ends of this earth"],
      ["", "", ""],
      ["판소리의 혼이 담긴", "Pansoriui honi damgin", "Containing the soul of pansori"],
      ["우리의 노래야", "Uriui noraeya", "This is our song"],
      ["전통과 현대가 만나는", "Jeontong-gwa hyeondaega mannaneun", "Where tradition meets modern"],
      ["그 자리에 내가 서 있어", "Geu jarie naega seo isseo", "I stand in that place"],
      ["", "", ""],
      ["Thunderous, 외쳐봐", "Thunderous, oetyeobwa", "Thunderous, shout out"],
      ["목이 터지도록 소리질러", "Mogi teojidorog sorijilleo", "Shout until your throat bursts"],
      ["이 순간을 영원히", "I sunganeul yeongwonhi", "This moment forever"],
      ["기억해줘", "Gieokhaeejweo", "Remember it"],
    ]),
  }});

  const skzCase143 = await prisma.song.upsert({ where: { slug: "stray-kids-case-143" }, update: {}, create: { slug: "stray-kids-case-143", title: "CASE 143", albumId: skzAlbum2.id, releaseYear: 2022,
    ...lyrics([
      ["내가 사랑에 빠진 이유", "Naega sarang-e ppajin iyu", "The reason I fell in love"],
      ["143가지가 있어", "143 gajiga isseo", "There are 143 reasons"],
      ["(I love you)를 가장 빠르게", "I love you-reul gajang bbarege", "The fastest way to say I love you"],
      ["타이핑하면 143", "Taipingha-myeon 143", "Is to type 143"],
      ["", "", ""],
      ["Case 143, 143", "Case 143, 143", "Case 143, 143"],
      ["네가 내 곁에 있을 때", "Nega nae gyeote isseul ttae", "When you're by my side"],
      ["세상이 완벽해 보여", "Sesangi wanbyeokhae boyeo", "The world looks perfect"],
      ["Case 143, I love you", "Case 143, I love you", "Case 143, I love you"],
      ["", "", ""],
      ["네 숨결이 느껴져", "Ne sumgyeori neukkkyeojyeo", "I can feel your breath"],
      ["내 심장이 빨라져", "Nae simjangi ppallajyeo", "My heart races"],
      ["이 감정을 어떻게", "I gamjeongeul eotteoke", "How do I"],
      ["전달해야 할지 몰라", "Jeondalhaeya halji molla", "Deliver this feeling"],
      ["", "", ""],
      ["Case 143, 사랑해", "Case 143, saranghae", "Case 143, I love you"],
      ["이 세 글자로 표현돼", "I se geuljaro pyohyeondwae", "Expressed in these three letters"],
      ["143가지 이유가 있어도", "143 gajiga iyuga isseodo", "Even with 143 reasons"],
      ["결국 다 너야", "Gyeolkuk da neoya", "In the end, it's all you"],
    ]),
  }});

  const skzManiac = await prisma.song.upsert({ where: { slug: "stray-kids-maniac" }, update: {}, create: { slug: "stray-kids-maniac", title: "Maniac", albumId: skzAlbum1.id, releaseYear: 2022,
    ...lyrics([
      ["다들 나를 미쳤다 해", "Dadeul nareul michyeotda hae", "Everyone says I'm crazy"],
      ["근데 뭐 어때", "Geunde mwo eottae", "But so what"],
      ["I'm a maniac, maniac", "I'm a maniac, maniac", "I'm a maniac, maniac"],
      ["이게 나야", "Ige naya", "This is me"],
      ["", "", ""],
      ["세상이 정해놓은 틀 밖에서", "Sesangi jeonghaenonheun tteul bakeseo", "Outside the mold the world has set"],
      ["나는 자유롭게 살아가", "Naneun jayurolge salaga", "I live freely"],
      ["미쳐도 괜찮아", "Michyeodo gwaenchana", "It's okay to be crazy"],
      ["나답게 살면 그만이야", "Nadabke salmyeon geumaniya", "Living like myself is enough"],
      ["", "", ""],
      ["Maniac, maniac, I'm a maniac", "Maniac, maniac, I'm a maniac", "Maniac, maniac, I'm a maniac"],
      ["내 방식대로 갈 거야", "Nae bangsingdaero gal geoya", "I'll go my own way"],
      ["남들이 뭐라 해도 상관없어", "Namdeuri mwora haedo sanggwaneopseo", "No matter what others say, I don't care"],
      ["I'm a maniac for life", "I'm a maniac for life", "I'm a maniac for life"],
    ]),
  }});

  const skzMiroh = await prisma.song.upsert({ where: { slug: "stray-kids-miroh" }, update: {}, create: { slug: "stray-kids-miroh", title: "MIROH", albumId: skzAlbum1.id, releaseYear: 2019,
    ...lyrics([
      ["나만의 길을 가 아무도 없는", "Namaneui gireul ga amudo eomneun", "I go my own path where no one else walks"],
      ["미로 속을 헤매도", "Miro sogeul hemaedo", "Even wandering through a maze"],
      ["나는 결국 나를 믿어", "Naneun gyeolkuk nareul midyeo", "In the end I trust myself"],
      ["빠져나올 수 있어", "Ppajyenaoal su isseo", "I can find my way out"],
      ["", "", ""],
      ["MIROH, MIROH 두려워 마", "MIROH, MIROH duryeowo ma", "MIROH, MIROH don't be afraid"],
      ["길을 잃어도 괜찮아", "Gireul irheodo gwaenchana", "It's okay to lose your way"],
      ["MIROH, MIROH 계속 나아가", "MIROH, MIROH gyesok naaga", "MIROH, MIROH keep moving forward"],
      ["언젠간 출구가 있어", "Eonjeengan chulgu-ga isseo", "Someday there'll be an exit"],
      ["", "", ""],
      ["수백 번 막혀도", "Subaek beon makhyeodo", "Even if blocked hundreds of times"],
      ["다시 일어나 뛰어가", "Dasi ireona ttwieoga", "Get up and run again"],
      ["포기는 없어 내 사전에", "Pogineun eopseo nae sajeone", "Giving up isn't in my dictionary"],
      ["MIROH, I found my way", "MIROH, I found my way", "MIROH, I found my way"],
    ]),
  }});

  for (const s of [skzGodMenu, skzThunderous, skzCase143, skzManiac, skzMiroh]) {
    await prisma.songCredit.upsert({ where: { id: `credit-${s.slug}-stray-kids` }, update: {}, create: { id: `credit-${s.slug}-stray-kids`, songId: s.id, artistId: straykids.id, role: "performer" } });
  }

  // ── TXT (TOMORROW X TOGETHER) ─────────────────────────────────────────────
  const txt = await prisma.artist.upsert({
    where: { slug: "txt" }, update: {},
    create: {
      slug: "txt", type: "GROUP", stageName: "TXT", debutYear: 2019,
      labelId: hybe?.id,
      bio: "Tomorrow X Together (TXT) is a five-member South Korean boy group formed by Big Hit Music (HYBE). The members — Yeonjun, Soobin, Beomgyu, Taehyun, and Huening Kai — debuted on March 4, 2019. Known for emotional storytelling and cinematic music videos, TXT explores themes of adolescence, dreams, and identity.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/220215_TXT.jpg/960px-220215_TXT.jpg",
    },
  });

  const txtAlbum1 = await prisma.album.upsert({ where: { slug: "txt-dream-chapter-magic" }, update: {}, create: { slug: "txt-dream-chapter-magic", title: "The Dream Chapter: MAGIC", artistId: txt.id, releaseYear: 2019, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/TXT_-_The_Dream_Chapter-_MAGIC.png/220px-TXT_-_The_Dream_Chapter-_MAGIC.png" } });
  const txtAlbum2 = await prisma.album.upsert({ where: { slug: "txt-chaos-freeze" }, update: {}, create: { slug: "txt-chaos-freeze", title: "The Chaos Chapter: FREEZE", artistId: txt.id, releaseYear: 2021, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/3/34/TXT_-_The_Chaos_Chapter-_FREEZE.png/220px-TXT_-_The_Chaos_Chapter-_FREEZE.png" } });

  const txtCrown = await prisma.song.upsert({ where: { slug: "txt-crown" }, update: {}, create: { slug: "txt-crown", title: "Crown (어느 날 머리에서 뿔이 자랐다)", albumId: txtAlbum1.id, releaseYear: 2019,
    ...lyrics([
      ["어느 날 머리에서 뿔이 자랐다", "Eoneu nal meorieseo ppuri jarattda", "One day horns grew from my head"],
      ["거울 보며 놀라 소리질렀다", "Georur bomyeo nolla sorijilleotda", "Shocked, I screamed looking in the mirror"],
      ["아무리 숨겨도 보이잖아", "Amuri sumgyeodo boijana", "No matter how I hide them they show"],
      ["이건 뭐야 이게 뭔지 몰라", "Igeon mwoya ige mwonji molla", "What is this, I don't know what this is"],
      ["", "", ""],
      ["Crown, crown 이건 내 거야", "Crown, crown igeon nae geoya", "Crown, crown, this is mine"],
      ["나만의 상처이자 나만의 왕관", "Namaneui sangcheijja namaneui wanggwan", "My own wound and my own crown"],
      ["Crown, crown 자랑스러워", "Crown, crown jarangseureoeo", "Crown, crown, I'm proud"],
      ["이 뿔이 결국 나를 빛나게 해", "I ppuri gyeolkuk nareul bitnage hae", "These horns ultimately make me shine"],
      ["", "", ""],
      ["다들 다르다고 손가락질해", "Dadeul dareuadago songarak jil hae", "Everyone points fingers saying I'm different"],
      ["상처받아 울었던 밤들", "Sangcheobadwa ureotdeon bamdeul", "Nights I was hurt and cried"],
      ["하지만 이제는 알아", "Hajiman ijeoneun ara", "But now I know"],
      ["이게 내 특별함이야", "Ige nae teukbyeolhamiya", "This is what makes me special"],
      ["", "", ""],
      ["Crown 나는 왕이야", "Crown naneun wangiya", "Crown, I am a king"],
      ["내 머리 위엔 내 크라운", "Nae meori wien nae keuraun", "Above my head is my crown"],
      ["Crown, this is me", "Crown, this is me", "Crown, this is me"],
      ["있는 그대로 완벽해", "Inneun geudaero wanbyeokhae", "Perfect just as I am"],
    ]),
  }});

  const txt0x1 = await prisma.song.upsert({ where: { slug: "txt-0x1-lovesong" }, update: {}, create: { slug: "txt-0x1-lovesong", title: "0X1=LOVESONG (I Know I Love You)", albumId: txtAlbum2.id, releaseYear: 2021,
    ...lyrics([
      ["I know I love you", "I know I love you", "I know I love you"],
      ["근데 왜 이렇게 힘들까", "Geunde wae ireohke himdeulkka", "But why is it so hard"],
      ["너를 사랑한다는 걸 알면서도", "Neoreul saranghandan-geol almyeonseo-do", "Even knowing that I love you"],
      ["표현하지 못해", "Pyohyeonhaji mothae", "I can't express it"],
      ["", "", ""],
      ["0에 1을 더하면", "0-e 1-eul deohana-myeon", "If I add 1 to 0"],
      ["사랑이 될 수 있을까", "Sarang-i doel su isseulkka", "Can it become love"],
      ["0X1=LOVESONG", "0X1=LOVESONG", "0X1=LOVESONG"],
      ["그게 바로 우리야", "Geuge baro uriya", "That's exactly what we are"],
      ["", "", ""],
      ["폭풍 속에서도 네 곁을 지킬게", "Pokpung sogeseo-do ne gyeoteul jikige", "Even in the storm I'll protect your side"],
      ["무너져도 다시 일어날게", "Muneojyeodo dasi ireonaolge", "Even if I fall I'll get back up"],
      ["너를 위해서라면", "Neoreul wihaeseoramyeon", "If it's for you"],
      ["뭐든지 할 수 있어", "Mwodeunji hal su isseo", "I can do anything"],
      ["", "", ""],
      ["I know I love you, I know I love you", "I know I love you, I know I love you", "I know I love you, I know I love you"],
      ["이 감정 멈출 수 없어", "I gamjeong meomchul su eopseo", "I can't stop this feeling"],
      ["0X1=LOVESONG, that's what we are", "0X1=LOVESONG, that's what we are", "0X1=LOVESONG, that's what we are"],
    ]),
  }});

  const txtBlueHour = await prisma.song.upsert({ where: { slug: "txt-blue-hour" }, update: {}, create: { slug: "txt-blue-hour", title: "Blue Hour (5시 53분의 하늘에서 발견한 너와 나)", albumId: txtAlbum1.id, releaseYear: 2020,
    ...lyrics([
      ["5시 53분의 하늘", "5si 53bun-ui haneul", "The sky at 5:53"],
      ["가장 예쁜 그 순간", "Gajang yeppeun geu sungan", "That most beautiful moment"],
      ["파란빛으로 물들어가는", "Paranbiteuro muldeureoganeun", "Turning a shade of blue"],
      ["우리의 이야기", "Uriui iyagi", "Our story"],
      ["", "", ""],
      ["Blue hour, 시간이 멈춰", "Blue hour, sigani meomchwo", "Blue hour, time has stopped"],
      ["너와 나 단둘이서", "Neowa na dandurieseo", "Just you and me alone"],
      ["이 순간이 영원하길", "I sungani yeongwonhagil", "I hope this moment lasts forever"],
      ["Blue hour, 우리 둘만의 시간", "Blue hour, uri dulmaneui sigan", "Blue hour, time just for us two"],
      ["", "", ""],
      ["이 세상 어느 곳에서든", "I sesang eoneu goeseosdeudeun", "Anywhere in this world"],
      ["네가 있으면 그게 천국이야", "Nega isseumyeon geuge cheonggugiya", "If you're there, it's heaven"],
      ["저 하늘빛처럼 아름다운", "Jeo haneurbitcheoreom areumdaun", "Beautiful like the color of that sky"],
      ["우리의 사랑이야", "Uriui sarang-iya", "That's our love"],
      ["", "", ""],
      ["Blue hour, 다시 한번 더", "Blue hour, dasi hanbeon deo", "Blue hour, one more time"],
      ["이 빛깔을 기억해줘", "I bitkareul gieokhaeejweo", "Remember this color"],
      ["너와 함께한 5시 53분", "Neowa hamkkehan 5si 53bun", "5:53 spent together with you"],
      ["영원히 간직할게", "Yeongwonhi ganjighalge", "I'll cherish it forever"],
    ]),
  }});

  const txtGoodBoy = await prisma.song.upsert({ where: { slug: "txt-good-boy-gone-bad" }, update: {}, create: { slug: "txt-good-boy-gone-bad", title: "Good Boy Gone Bad", albumId: txtAlbum2.id, releaseYear: 2022,
    ...lyrics([
      ["Good boy gone bad, bad, bad", "Good boy gone bad, bad, bad", "Good boy gone bad, bad, bad"],
      ["어쩌다 이렇게 됐나", "Eojeoda ireohke dwattna", "How did things end up like this"],
      ["착했던 내가 지금은", "Chakheatdeon naega jigeumneun", "I who was once good now"],
      ["이렇게 바뀌었어", "Ireohke bakvieosseo", "Have changed like this"],
      ["", "", ""],
      ["네가 날 바꿔놨어", "Nega nal bakkwenasseo", "You changed me"],
      ["이 세상에서 가장 아프게", "I sesange-seo gajang apeuge", "In the most painful way in this world"],
      ["Good boy gone bad", "Good boy gone bad", "Good boy gone bad"],
      ["이게 다 너 때문이야", "Ige da neo ttaemuniya", "All of this is because of you"],
      ["", "", ""],
      ["더 이상 착하게 살 수 없어", "Deo isang chakha-ge sal su eopseo", "I can no longer live being good"],
      ["세상이 나한테 너무 잔인해", "Sesangi nahante neomu janinhaee", "The world is too cruel to me"],
      ["Good boy gone bad", "Good boy gone bad", "Good boy gone bad"],
      ["이제 다시 돌아올 수 없어", "Ije dasi dola-ol su eopseo", "I can't go back now"],
    ]),
  }});

  for (const s of [txtCrown, txt0x1, txtBlueHour, txtGoodBoy]) {
    await prisma.songCredit.upsert({ where: { id: `credit-${s.slug}-txt` }, update: {}, create: { id: `credit-${s.slug}-txt`, songId: s.id, artistId: txt.id, role: "performer" } });
  }

  // ── ENHYPEN ────────────────────────────────────────────────────────────────
  const enhypen = await prisma.artist.upsert({
    where: { slug: "enhypen" }, update: {},
    create: {
      slug: "enhypen", type: "GROUP", stageName: "ENHYPEN", debutYear: 2020,
      labelId: hybe?.id,
      bio: "ENHYPEN is a seven-member South Korean-Japanese boy group formed by BELIFT LAB (HYBE). Members Jungwon, Heeseung, Jay, Jake, Sunghoon, Sunoo, and Ni-ki debuted on November 30, 2020 after being formed through the reality show I-Land.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/220212_ENHYPEN.jpg/960px-220212_ENHYPEN.jpg",
    },
  });

  const enAlbum1 = await prisma.album.upsert({ where: { slug: "enhypen-border-day-one" }, update: {}, create: { slug: "enhypen-border-day-one", title: "BORDER: DAY ONE", artistId: enhypen.id, releaseYear: 2020, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0b/Enhypen_-_Border_Day_One.png/220px-Enhypen_-_Border_Day_One.png" } });
  const enAlbum2 = await prisma.album.upsert({ where: { slug: "enhypen-dimension-dilemma" }, update: {}, create: { slug: "enhypen-dimension-dilemma", title: "DIMENSION : DILEMMA", artistId: enhypen.id, releaseYear: 2021, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c9/Enhypen_-_Dimension_Dilemma.png/220px-Enhypen_-_Dimension_Dilemma.png" } });

  const enGivenTaken = await prisma.song.upsert({ where: { slug: "enhypen-given-taken" }, update: {}, create: { slug: "enhypen-given-taken", title: "Given-Taken", albumId: enAlbum1.id, releaseYear: 2020,
    ...lyrics([
      ["태어날 때부터 가지고 태어난 것들", "Taeeoonal ttaebuteo gajigo taeeonaan geotdeul", "Things born with from the start"],
      ["주어진 운명인지도 몰라", "Jueojin unnyeong-injido molla", "Perhaps it's a given fate"],
      ["하지만 이 모든 건 내가 선택한 것들", "Hajiman i modeun geon naega seontaekan geotdeul", "But all of these are choices I made"],
      ["내 삶의 주인공은 나야", "Nae samui juingongeun naya", "I am the protagonist of my life"],
      ["", "", ""],
      ["Given or taken, taken or given", "Given or taken, taken or given", "Given or taken, taken or given"],
      ["결국 내가 만들어가는 거야", "Gyeolkuk naega mandeureoganeun geoya", "In the end, I'm the one making it"],
      ["운명이든 선택이든", "Unnyeong-ideun seontaegiideun", "Whether fate or choice"],
      ["이게 바로 나야", "Ige baro naya", "This is exactly me"],
      ["", "", ""],
      ["두려워도 앞으로 나아가", "Duryeowodo apeuro naaga", "Even if scared, move forward"],
      ["이 길이 맞다면 계속 가", "I giri mattdamyeon gyesok ga", "If this path is right, keep going"],
      ["Given, taken, 내 것이야", "Given, taken, nae geosiya", "Given, taken, it's mine"],
      ["내 인생 내가 써내려가", "Nae insaeng naega sseonae-ryeoga", "I write my own life story"],
    ]),
  }});

  const enDrunkDazed = await prisma.song.upsert({ where: { slug: "enhypen-drunk-dazed" }, update: {}, create: { slug: "enhypen-drunk-dazed", title: "Drunk-Dazed", albumId: enAlbum2.id, releaseYear: 2021,
    ...lyrics([
      ["We're all drunk and dazed", "We're all drunk and dazed", "We're all drunk and dazed"],
      ["이 파티가 끝나지 않길 바라", "I patiga kkeutnaji ankil bara", "I hope this party never ends"],
      ["빠져들어 이 리듬 속으로", "Ppajyeodeulleo i rideum sogeuro", "Fall into this rhythm"],
      ["오늘 밤 우리가 주인공이야", "Oneul bam uriga juingongiya", "Tonight we are the main characters"],
      ["", "", ""],
      ["Drunk-dazed, 이 밤에 취해", "Drunk-dazed, i bame chwihae", "Drunk-dazed, intoxicated by this night"],
      ["현실을 잊어버려", "Hyeonsireul ijeoboryeo", "Forget reality"],
      ["우리만의 세상에서", "Urimaneui sesangeseo", "In a world just for us"],
      ["마음껏 즐겨봐", "Maeumeul kkojeutk jeulgyeobwa", "Enjoy to your heart's content"],
      ["", "", ""],
      ["이 순간이 영원하길", "I sungani yeongwonhagil", "I hope this moment lasts forever"],
      ["시간이 멈춰주길", "Sigani meomchwojugil", "I hope time stops"],
      ["Drunk-dazed, 우리 함께", "Drunk-dazed, uri hamkke", "Drunk-dazed, together"],
      ["이 밤을 기억해줘", "I bameul gieokhaeejweo", "Remember this night"],
    ]),
  }});

  const enBiteMe = await prisma.song.upsert({ where: { slug: "enhypen-bite-me" }, update: {}, create: { slug: "enhypen-bite-me", title: "Bite Me", albumId: enAlbum2.id, releaseYear: 2023,
    ...lyrics([
      ["Bite me, bite me", "Bite me, bite me", "Bite me, bite me"],
      ["네가 원한다면 뭐든 줄 수 있어", "Nega wonhandamyeon mwodeun jul su isseo", "If you want, I can give you anything"],
      ["내 심장까지도", "Nae simjankkajido", "Even my heart"],
      ["Bite me if you dare", "Bite me if you dare", "Bite me if you dare"],
      ["", "", ""],
      ["뱀파이어처럼 달려들어", "Baempaieoceoreom dallyeodeulleo", "Rush at me like a vampire"],
      ["내 목을 물어줘", "Nae mogeul mureojweo", "Bite my neck"],
      ["이 달콤한 위험 속으로", "I dalkomhan wiheom sogeuro", "Into this sweet danger"],
      ["빠져들어 함께", "Ppajyeodeulleo hamkke", "Fall in together"],
      ["", "", ""],
      ["Bite me, bite me, bite me", "Bite me, bite me, bite me", "Bite me, bite me, bite me"],
      ["이 밤이 우리의 것이야", "I bami uriui geosiya", "This night is ours"],
      ["어둠 속에서 빛나는", "Eodum sogeseo bitnaneun", "Shining in the darkness"],
      ["우리만의 비밀이야", "Urimaneui bimiriya", "Our very own secret"],
    ]),
  }});

  const enFuturePerfect = await prisma.song.upsert({ where: { slug: "enhypen-future-perfect" }, update: {}, create: { slug: "enhypen-future-perfect", title: "Future Perfect (Pass the MIC)", albumId: enAlbum2.id, releaseYear: 2022,
    ...lyrics([
      ["Pass the MIC, pass the MIC", "Pass the MIC, pass the MIC", "Pass the MIC, pass the MIC"],
      ["우리 차례야 이제", "Uri chaeryeya ije", "It's our turn now"],
      ["새로운 시대가 열리고 있어", "Saeroun sidaega yeolliigo isseo", "A new era is opening"],
      ["우리가 그 주인공이야", "Uriga geu juingongiya", "We are its main characters"],
      ["", "", ""],
      ["Future perfect, 완벽한 미래", "Future perfect, wanbyeokhan mirae", "Future perfect, a perfect future"],
      ["우리가 만들어갈 거야", "Uriga mandeureogal geoya", "We're going to create it"],
      ["Pass the MIC, 이제 우리 시대야", "Pass the MIC, ije uri sidaeya", "Pass the MIC, it's our era now"],
      ["멈추지 마 계속 나아가", "Meomchuji ma gyesok naaga", "Don't stop, keep moving forward"],
      ["", "", ""],
      ["두려움을 밀어내고", "Duryeoeumeul milleonaego", "Push away the fear"],
      ["앞으로만 달려가자", "Apeuroman dallyeogaja", "Let's just run forward"],
      ["Future perfect, 우리 함께", "Future perfect, uri hamkke", "Future perfect, together"],
      ["이 무대를 가져가자", "I mudaereul gajyeogaja", "Let's take this stage"],
    ]),
  }});

  for (const s of [enGivenTaken, enDrunkDazed, enBiteMe, enFuturePerfect]) {
    await prisma.songCredit.upsert({ where: { id: `credit-${s.slug}-enhypen` }, update: {}, create: { id: `credit-${s.slug}-enhypen`, songId: s.id, artistId: enhypen.id, role: "performer" } });
  }

  // ── LE SSERAFIM ───────────────────────────────────────────────────────────
  const lesserafim = await prisma.artist.upsert({
    where: { slug: "le-sserafim" }, update: {},
    create: {
      slug: "le-sserafim", type: "GROUP", stageName: "LE SSERAFIM", debutYear: 2022,
      labelId: hybe?.id,
      bio: "LE SSERAFIM is a five-member South Korean girl group formed by Source Music (HYBE). Members Chaewon, Sakura, Yunjin, Kazuha, and Eunchae debuted on May 2, 2022. The group's name is an anagram of 'I'm fearless,' embodying a philosophy of courage and authenticity.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/LE_SSERAFIM_at_2022_MAMA_Awards.jpg/960px-LE_SSERAFIM_at_2022_MAMA_Awards.jpg",
    },
  });

  const lsAlbum1 = await prisma.album.upsert({ where: { slug: "le-sserafim-fearless" }, update: {}, create: { slug: "le-sserafim-fearless", title: "FEARLESS", artistId: lesserafim.id, releaseYear: 2022, type: "EP", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/LE_SSERAFIM_-_Fearless.png/220px-LE_SSERAFIM_-_Fearless.png" } });
  const lsAlbum2 = await prisma.album.upsert({ where: { slug: "le-sserafim-antifragile" }, update: {}, create: { slug: "le-sserafim-antifragile", title: "ANTIFRAGILE", artistId: lesserafim.id, releaseYear: 2022, type: "EP", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/LE_SSERAFIM_-_Antifragile.png/220px-LE_SSERAFIM_-_Antifragile.png" } });

  const lsFearless = await prisma.song.upsert({ where: { slug: "le-sserafim-fearless-song" }, update: {}, create: { slug: "le-sserafim-fearless-song", title: "FEARLESS", albumId: lsAlbum1.id, releaseYear: 2022,
    ...lyrics([
      ["두려움 없이 나아가", "Duryeoum eobsi naaga", "Move forward without fear"],
      ["이게 우리의 선택이야", "Ige uriui seontaegiiya", "This is our choice"],
      ["Fearless, fearless", "Fearless, fearless", "Fearless, fearless"],
      ["우린 멈추지 않아", "Urin meomchuji ana", "We don't stop"],
      ["", "", ""],
      ["세상이 뭐라 해도", "Sesangi mwora haedo", "No matter what the world says"],
      ["난 두렵지 않아", "Nan duryeopji ana", "I'm not afraid"],
      ["내 길을 가겠어", "Nae gireul gagetsseo", "I'll go my own way"],
      ["Fearless, I'm fearless", "Fearless, I'm fearless", "Fearless, I'm fearless"],
      ["", "", ""],
      ["LE SSERAFIM, I'm fearless", "LE SSERAFIM, I'm fearless", "LE SSERAFIM, I'm fearless"],
      ["이 이름의 의미처럼", "I ireumui uimicheoreom", "Like the meaning of this name"],
      ["두려움 없이 살아가겠어", "Duryeoum eobsi salagagetsseo", "I'll live without fear"],
      ["Fearless, always fearless", "Fearless, always fearless", "Fearless, always fearless"],
      ["", "", ""],
      ["넘어져도 괜찮아", "Neomeojeodo gwaenchana", "It's okay to fall"],
      ["다시 일어나면 그만이야", "Dasi ireonamyeon geumaniya", "Just getting back up is enough"],
      ["우린 두렵지 않아 fearless", "Urin duryeopji ana fearless", "We're not afraid, fearless"],
    ]),
  }});

  const lsAntifragile = await prisma.song.upsert({ where: { slug: "le-sserafim-antifragile-song" }, update: {}, create: { slug: "le-sserafim-antifragile-song", title: "ANTIFRAGILE", albumId: lsAlbum2.id, releaseYear: 2022,
    ...lyrics([
      ["부서질수록 더 강해져", "Buseojilsurok deo ganghaejeoo", "The more I break, the stronger I become"],
      ["Antifragile, 이게 나야", "Antifragile, ige naya", "Antifragile, this is me"],
      ["상처가 날 더 단단하게 해", "Sangcheoga nal deo dandangage hae", "Wounds make me harder"],
      ["Antifragile, 아무도 못 꺾어", "Antifragile, amudo mot kkeogeo", "Antifragile, no one can break me"],
      ["", "", ""],
      ["폭풍이 몰아쳐도", "Pokpung-i moraachyeodo", "Even when storms rage"],
      ["뿌리가 흔들리지 않아", "Ppurigi heundeulli ji ana", "My roots don't shake"],
      ["위기를 기회로 바꿔", "Wigireul gihoero bakkweo", "I turn crises into opportunities"],
      ["Antifragile, that's me", "Antifragile, that's me", "Antifragile, that's me"],
      ["", "", ""],
      ["넘어질수록 높이 뛰어올라", "Neomeogilsurok nopi ttwieooalla", "The more I fall, the higher I jump"],
      ["이게 내 힘의 원천이야", "Ige nae himui woncheon-iya", "This is the source of my strength"],
      ["Antifragile, fearless, strong", "Antifragile, fearless, strong", "Antifragile, fearless, strong"],
      ["이게 바로 LE SSERAFIM이야", "Ige baro LE SSERAFIM-iya", "This is exactly LE SSERAFIM"],
    ]),
  }});

  const lsEvePsyche = await prisma.song.upsert({ where: { slug: "le-sserafim-eve-psyche" }, update: {}, create: { slug: "le-sserafim-eve-psyche", title: "Eve, Psyche & The Bluebeard's Wife", albumId: lsAlbum2.id, releaseYear: 2022,
    ...lyrics([
      ["이 열매를 따먹어", "I yeolmaereul ttameogeo", "Eat this fruit"],
      ["금지된 걸 알지만", "Geunji-deon geol alji man", "Though I know it's forbidden"],
      ["궁금해 저 문 너머엔", "Gunggeumhae jeo mun neomeoren", "I'm curious about what's beyond that door"],
      ["뭐가 있는지", "Mwoga inneunji", "What could be there"],
      ["", "", ""],
      ["Eve, Psyche, 금지된 사랑", "Eve, Psyche, geunji-deon sarang", "Eve, Psyche, forbidden love"],
      ["파란 수염의 아내처럼", "Paran suyeomui anaecheoreom", "Like Bluebeard's wife"],
      ["알면 안 되는 걸 알고 싶어", "Almyeon an doeneun geol algo sipeo", "I want to know what I shouldn't"],
      ["이 호기심을 멈출 수 없어", "I hogisimeul meomchul su eopseo", "I can't stop this curiosity"],
      ["", "", ""],
      ["천사인지 악마인지", "Cheonsainji akmaginji", "Whether angel or demon"],
      ["그 경계선 위에 서 있어", "Geu gyeonggyeseon wie seo isseo", "I stand on that boundary"],
      ["금지된 것들이 더 달콤해", "Geunji-deon geotdeuri deo dalkomhae", "Forbidden things taste sweeter"],
      ["Eve, Psyche, 이게 우리야", "Eve, Psyche, ige uriya", "Eve, Psyche, this is us"],
    ]),
  }});

  const lsUnforgiven = await prisma.song.upsert({ where: { slug: "le-sserafim-unforgiven" }, update: {}, create: { slug: "le-sserafim-unforgiven", title: "UNFORGIVEN (feat. Nile Rodgers)", albumId: lsAlbum2.id, releaseYear: 2023,
    ...lyrics([
      ["용서받지 못한 자", "Yongseobatnaji motan ja", "One who cannot be forgiven"],
      ["그게 바로 나야", "Geuge baro naya", "That's exactly who I am"],
      ["하지만 난 상관없어", "Hajiman nan sanggwaneopseo", "But I don't care"],
      ["내 방식대로 살아가겠어", "Nae bangsikdaero saraagagetsseo", "I'll live life my own way"],
      ["", "", ""],
      ["세상이 날 욕해도", "Sesangi nal yokhaedo", "Even if the world condemns me"],
      ["내 귀엔 안 들려", "Nae gwiena an deullyeo", "I don't hear it"],
      ["Unforgiven, 용서 따윈 필요 없어", "Unforgiven, yongseo ttawien piryeo eopseo", "Unforgiven, I don't need forgiveness"],
      ["내가 원하는 대로 살 거야", "Naega wonhaneun daero sal geoya", "I'll live the way I want"],
      ["", "", ""],
      ["규칙을 어기는 것도 용기야", "Gyuchikkeul eogineun geotdo yonggiya", "Breaking the rules also takes courage"],
      ["나는 그 용기를 갖고 있어", "Naneun geu yonggireul gatgo isseo", "I have that courage"],
      ["Unforgiven, 비판이 무서워?", "Unforgiven, bipani museoowo", "Unforgiven, afraid of criticism"],
      ["천만에, 난 Fearless", "Cheonmane, nan Fearless", "Not at all, I'm Fearless"],
      ["", "", ""],
      ["Unforgiven, 이게 바로 나야", "Unforgiven, ige baro naya", "Unforgiven, this is exactly who I am"],
      ["내 신념대로 살았으니까", "Nae sinnyeomdaero sarasseoniikka", "Because I lived by my own conviction"],
    ]),
  }});

  for (const s of [lsFearless, lsAntifragile, lsEvePsyche, lsUnforgiven]) {
    await prisma.songCredit.upsert({ where: { id: `credit-${s.slug}-le-sserafim` }, update: {}, create: { id: `credit-${s.slug}-le-sserafim`, songId: s.id, artistId: lesserafim.id, role: "performer" } });
  }

  console.log("✓ IVE, Stray Kids, TXT, ENHYPEN, LE SSERAFIM seeded");
}
