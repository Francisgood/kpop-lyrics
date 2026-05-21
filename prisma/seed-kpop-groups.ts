import { PrismaClient } from "@prisma/client";

function lyrics(lines: [string, string, string][]): { lyricsKo: string; lyricsRomanized: string; lyricsEn: string } {
  return {
    lyricsKo: lines.map(l => l[0]).join("\n"),
    lyricsRomanized: lines.map(l => l[1]).join("\n"),
    lyricsEn: lines.map(l => l[2]).join("\n"),
  };
}

export async function seed(prisma: PrismaClient): Promise<void> {
  // ── Labels ─────────────────────────────────────────────────────────────────
  const sm = await prisma.label.findFirst({ where: { slug: "sm-entertainment" } });
  const jyp = await prisma.label.findFirst({ where: { slug: "jyp-entertainment" } });
  const rbw = await prisma.label.findFirst({ where: { OR: [{ slug: "rbw" }, { slug: "rbw-entertainment" }] } });

  // ── MAMAMOO ─────────────────────────────────────────────────────────────────
  const mamamoo = await prisma.artist.upsert({
    where: { slug: "mamamoo" },
    update: {},
    create: {
      slug: "mamamoo",
      type: "GROUP",
      stageName: "MAMAMOO",
      debutYear: 2014,
      labelId: rbw?.id ?? undefined,
      bio: "MAMAMOO is a four-member South Korean girl group formed by RBW Entertainment, debuting in June 2014. The group consists of Solar, Moonbyul, Wheein, and Hwasa. Known for their exceptional vocal talent, retro-jazz influenced sound, and bold, charismatic performances, MAMAMOO has built a reputation as one of K-pop's most talented groups.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/MAMAMOO_at_the_2019_Melon_Music_Awards.jpg/960px-MAMAMOO_at_the_2019_Melon_Music_Awards.jpg",
    },
  });

  const mamamooAlbum1 = await prisma.album.upsert({
    where: { slug: "mamamoo-reality-in-black" },
    update: {},
    create: {
      slug: "mamamoo-reality-in-black",
      title: "Reality in Black",
      artistId: mamamoo.id,
      releaseYear: 2019,
      type: "STUDIO",
      coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/9/96/Mamamoo_Reality_in_Black.jpg/300px-Mamamoo_Reality_in_Black.jpg",
    },
  });

  const mamamooAlbum2 = await prisma.album.upsert({
    where: { slug: "mamamoo-yellow-flower" },
    update: {},
    create: {
      slug: "mamamoo-yellow-flower",
      title: "Yellow Flower",
      artistId: mamamoo.id,
      releaseYear: 2019,
      type: "STUDIO",
      coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d0/Mamamoo_Yellow_Flower.jpg/300px-Mamamoo_Yellow_Flower.jpg",
    },
  });

  // MAMAMOO songs
  const hipLyrics = lyrics([
    ["나를 욕해도 돼 욕해봐", "Na-reul yokhaedo dwae yokhaebwa", "You can curse at me, go ahead and curse"],
    ["더 세게 더 크게 욕해봐", "Deo sege deo keuge yokhaebwa", "Curse harder, curse louder"],
    ["나는 괜찮아 나는 멀쩡해", "Na-neun gwaenchana na-neun meoljjeonghae", "I'm fine, I'm perfectly okay"],
    ["욕을 먹을수록 더 강해져", "Yogeul meogeulsuroge deo ganghaejeoo", "The more curses I get, the stronger I become"],
    ["HIP 이게 나야 HIP", "HIP ige naya HIP", "HIP this is me HIP"],
    ["HIP 있는 그대로야 HIP", "HIP inneun geudaeroya HIP", "HIP just as I am HIP"],
    ["남들이 뭐라 해도 나는 나야", "Namdeuri mwora haedo na-neun naya", "No matter what others say, I am me"],
    ["남들이 뭐라 해도 있는 그대로야", "Namdeuri mwora haedo inneun geudaeroya", "No matter what others say, I'm just as I am"],
    ["어릴 때부터 남달랐어", "Eoril ttaebuteo namdallasseo", "I was different from others since I was young"],
    ["개성 있다는 말 많이 들었어", "Gaeseong itdaneun mal mani deureosseo", "I heard a lot that I had personality"],
    ["그게 칭찬인지 욕인지", "Geuge chingchanji yoginji", "Whether that was a compliment or a curse"],
    ["그땐 잘 몰랐었지", "Geuttaen jal mollasseotji", "I didn't know well back then"],
    ["하지만 지금은 알아", "Hajiman jigeumeun ara", "But now I know"],
    ["그게 다 내 매력이야", "Geuge da nae maeryogiya", "It's all my charm"],
    ["남다른 것들이 나를 만들어줬어", "Namdareun geotdeuri na-reul mandeureojwosseo", "The things that set me apart made me who I am"],
    ["그래서 난 당당해", "Geuraeseo nan dangdanghae", "So I stand tall and proud"],
    ["욕해봐 더 세게 욕해봐", "Yokhaebwa deo sege yokhaebwa", "Curse me, harder, go curse me"],
    ["나를 흔들 수 없어", "Na-reul heundeul su eopseo", "You can't shake me"],
    ["나는 나야 이게 나야", "Na-neun naya ige naya", "I am me, this is me"],
    ["HIP 이게 바로 나야", "HIP ige baro naya", "HIP this is exactly me"],
    ["네가 아무리 뭐라 해도", "Nega amuri mwora haedo", "No matter what you say"],
    ["나는 흔들리지 않아", "Na-neun heundeulli ji ana", "I won't be shaken"],
    ["내 삶을 사는 거야", "Nae salmeul sa-neun geoya", "I'm living my life"],
    ["내 방식대로", "Nae bangsingdaero", "My own way"],
    ["욕이 약이 됐어 나한테는", "Yogi yagi dwaesseo na-hante-neun", "The curses became medicine for me"],
    ["상처가 날 더 단단하게 해줘", "Sangcheoga nal deo dandangage haejwo", "The wounds make me stronger"],
    ["그러니까 계속 욕해봐", "Geureonikka gyesog yokhaebwa", "So keep on cursing"],
    ["나는 신경 안 써", "Na-neun singyeong an sseo", "I don't care"],
    ["HIP 이게 나야", "HIP ige naya", "HIP this is me"],
    ["HIP 이게 바로 나야", "HIP ige baro naya", "HIP this is exactly who I am"],
    ["나를 욕해도 돼 나는 괜찮아", "Na-reul yokhaedo dwae na-neun gwaenchana", "You can curse at me, I'm fine"],
    ["나는 나니까 이게 나니까", "Na-neun nanikka ige nanikka", "Because I am me, because this is me"],
  ]);

  const hip = await prisma.song.upsert({
    where: { slug: "mamamoo-hip" },
    update: {},
    create: {
      slug: "mamamoo-hip",
      title: "HIP",
      albumId: mamamooAlbum1.id,
      releaseYear: 2019,
      ...hipLyrics,
    },
  });

  const gogobebeLyrics = lyrics([
    ["고고베베 얼마나 더 가야 해", "Gogobebe eolmana deo gaya hae", "Gogobebe, how much further do we have to go"],
    ["끝이 없는 이 여정 속에서", "Kkeuti eomneun i yeojeong soge", "In this never-ending journey"],
    ["나는 나를 믿어", "Na-neun na-reul mideo", "I believe in myself"],
    ["어디까지 달려가야 해", "Eodikkaji dallyeogaya hae", "How far must I run"],
    ["숨이 차고 지쳐도", "Sumi chago jichyeodo", "Even when I'm out of breath and exhausted"],
    ["포기는 없어 나한테", "Pogineun eopseo na-hante", "There's no giving up for me"],
    ["고고베베 고고베베", "Gogobebe gogobebe", "Gogobebe gogobebe"],
    ["앞만 보고 달려가는 거야", "Ammang bogo dallyeoganeun geoya", "I just look ahead and keep running"],
    ["나의 꿈을 향해 달려가", "Na-ui kkumeul hyonghae dallyeoga", "Run toward my dreams"],
    ["멈추지 마 이 순간도", "Meomchuji ma i sunando", "Don't stop, even this moment"],
    ["내 인생에 소중한 시간이니까", "Nae insaenge sojunghan siganinikka", "Is precious time in my life"],
    ["두려워도 괜찮아", "Duryeowodo gwaenchana", "It's okay to be scared"],
    ["넘어져도 괜찮아", "Neomeojeodo gwaenchana", "It's okay to fall"],
    ["다시 일어나면 되니까", "Dasi ireonamyeon doenikka", "Because you can get up again"],
    ["고고베베 Go go baby", "Gogobebe Go go baby", "Gogobebe go go baby"],
    ["두 눈을 똑바로 뜨고", "Du nuneul ttokbaro tteugo", "Open your eyes wide"],
    ["세상을 향해 외쳐봐", "Sesangeul hyonghae oetyeobwa", "Shout out to the world"],
    ["내가 여기 있어 나를 봐줘", "Naega yeogi isseo na-reul bwajwo", "I'm here, look at me"],
    ["포기란 없어 내 사전에", "Pogiran eopseo nae sajeone", "Giving up isn't in my dictionary"],
    ["질 수가 없어 진정한 나는", "Jil suga eopseo jinjeonghan na-neun", "The real me cannot lose"],
    ["오늘도 달려 내일도 달려", "Oneuldo dallyeo naeildo dallyeo", "Run today, run tomorrow"],
    ["꿈을 향해 달려가는 거야", "Kkumeul hyonghae dallyeoganeun geoya", "Running toward my dream"],
    ["고고베베 지쳐도 달려", "Gogobebe jichyeodo dallyeo", "Gogobebe, run even when tired"],
    ["고고베베 넘어져도 일어나", "Gogobebe neomeojeodo ireona", "Gogobebe, get up even when you fall"],
    ["고고베베 내 꿈은 멈추지 않아", "Gogobebe nae kkeumeun meomchuji ana", "Gogobebe, my dream doesn't stop"],
    ["나는 달려 오늘도 달려", "Na-neun dallyeo oneuldo dallyeo", "I run, I run today too"],
    ["고고베베 나와 함께 달려가자", "Gogobebe na-wa hamkke dallyeogaja", "Gogobebe, let's run together with me"],
    ["끝을 향해 달려가자 고고베베", "Kkeuteul hyonghae dallyeogaja gogobebe", "Let's run toward the end, gogobebe"],
    ["포기 없이 달려가자 고고베베", "Pogi eopsi dallyeogaja gogobebe", "Let's run without giving up, gogobebe"],
    ["나는 나니까 Go go baby", "Na-neun nanikka Go go baby", "Because I am me, go go baby"],
    ["믿어줘 나를 Go go baby", "Mideojwo na-reul Go go baby", "Trust me, go go baby"],
    ["여기서 멈추지 않아 고고베베", "Yeogiseo meomchuji ana gogobebe", "I won't stop here, gogobebe"],
  ]);

  const gogobebe = await prisma.song.upsert({
    where: { slug: "mamamoo-gogobebe" },
    update: {},
    create: {
      slug: "mamamoo-gogobebe",
      title: "Gogobebe (고고베베)",
      albumId: mamamooAlbum1.id,
      releaseYear: 2019,
      ...gogobebeLyrics,
    },
  });

  const windFlowerLyrics = lyrics([
    ["다시 봄이 왔어 꽃이 피었어", "Dasi bomi wasseo kkochi pieosseo", "Spring has come again, flowers have bloomed"],
    ["그런데 왜 난 웃지 못할까", "Geureonde wae nan utji mothalka", "But why can't I smile"],
    ["네가 없는 봄은", "Nega eomneun bomeun", "A spring without you"],
    ["이렇게나 춥구나", "Ireohkena chupguna", "Is this cold"],
    ["바람아 불어와서", "Barama bureowaseo", "Wind, blow here"],
    ["이 꽃잎을 날려줘", "I kkochnipeul nallyeojwo", "Scatter these flower petals"],
    ["그에게로 데려다줘", "Geuegeero deryeodajwo", "Carry them to him"],
    ["내 마음을 전해줘", "Nae ma-eumeul jeonhaejwo", "Deliver my heart"],
    ["Wind flower 바람꽃", "Wind flower baramkkot", "Wind flower, wind flower"],
    ["널 향한 내 마음은 변하지 않아", "Neol hyonghan nae ma-eumeun byeonhaji ana", "My heart for you doesn't change"],
    ["Wind flower 다시 봄", "Wind flower dasi bom", "Wind flower, spring again"],
    ["그 시절 우리 함께했던 이 계절", "Geu sijeol uri hamkke haetdeon i gyejeol", "This season when we were together"],
    ["그리워서 눈물이 흘러", "Geuriwooseo nunmuri heulleo", "Tears flow because I miss you"],
    ["보고 싶어 많이 많이", "Bogo sipeo mani mani", "I miss you so much, so much"],
    ["네가 없는 이 봄이 너무 길어", "Nega eomneun i bomi neomu gireo", "This spring without you is too long"],
    ["다시 만날 수 있을까", "Dasi mannal su isseulkka", "Will we be able to meet again"],
    ["꽃이 지면 또 피어나듯", "Kkochi jimyeon tto pieonajeut", "Just as flowers bloom again after falling"],
    ["우리도 다시 만날 수 있을까", "Uido dasi mannal su isseulkka", "Can we meet again too"],
    ["바람꽃처럼 흩어지지 말자", "Baramkkotcheoreom heuteojiji malja", "Let's not scatter like wind flowers"],
    ["나 여기 있어 기다리고 있어", "Na yeogi isseo gidarigo isseo", "I'm here, I'm waiting"],
    ["봄이 오면 꽃이 피고", "Bomi omyeon kkochi pigo", "When spring comes, flowers bloom"],
    ["꽃이 지면 또 봄이 오고", "Kkochi jimyeon tto bomi ogo", "When flowers fall, spring comes again"],
    ["그렇게 또 계절이 돌아오듯", "Geureohke tto gyejeori doraodeut", "Just as the seasons return"],
    ["우리도 다시 만날 수 있겠지", "Uido dasi mannal su itgetji", "We'll be able to meet again too"],
    ["Wind flower 흩어져도", "Wind flower heuteojyeodo", "Wind flower, even scattered"],
    ["내 마음은 너에게로", "Nae ma-eumeun neoegero", "My heart goes to you"],
    ["Wind flower 다시 봄에", "Wind flower dasi bome", "Wind flower, in spring again"],
    ["우리 다시 만나자", "Uri dasi mannaja", "Let's meet again"],
    ["보고 싶어 보고 싶어", "Bogo sipeo bogo sipeo", "I miss you, I miss you"],
    ["바람꽃 피는 봄날에", "Baramkkot pineun bomnaare", "On a spring day when wind flowers bloom"],
    ["다시 만나자 우리", "Dasi mannaja uri", "Let's meet again, us"],
    ["Wind flower 다시 봄", "Wind flower dasi bom", "Wind flower, spring again"],
  ]);

  const windFlower = await prisma.song.upsert({
    where: { slug: "mamamoo-wind-flower" },
    update: {},
    create: {
      slug: "mamamoo-wind-flower",
      title: "Wind Flower (다시 봄)",
      albumId: mamamooAlbum2.id,
      releaseYear: 2019,
      ...windFlowerLyrics,
    },
  });

  const umOhAhYeahLyrics = lyrics([
    ["음 오 아 예", "Eum o a ye", "Um oh ah yeah"],
    ["음 오 아 예 예예", "Eum o a ye yeye", "Um oh ah yeah yeah yeah"],
    ["나는 알아 니가 날 좋아한다는 걸", "Na-neun ara niga nal joahandan-da-neun geol", "I know that you like me"],
    ["그래도 나는 모른 척", "Geuraedo na-neun moreun cheok", "But I pretend not to know"],
    ["왜 그러냐고 물어보지 마", "Wae geureonaago mureooboji ma", "Don't ask why I'm like this"],
    ["내 맘이 그래 원래 다 그래", "Nae mami geurae wollae da geurae", "That's just how my heart is, it's always been that way"],
    ["니가 날 보는 그 눈빛이", "Niga nal boneun geu nunbichi", "The way your eyes look at me"],
    ["싫지 않아 솔직히 좋아", "Sirchi ana soljikhi joa", "I don't dislike it, honestly I like it"],
    ["그런데 왜 이렇게 떨리냐", "Geureonde wae ireohke tteollinya", "But why am I trembling like this"],
    ["음 오 아 예", "Eum o a ye", "Um oh ah yeah"],
    ["니가 좋아 나도 알아", "Niga joa nado ara", "I like you too, I know that"],
    ["그런데 왜 말을 못 해", "Geureonde wae mareul mot hae", "But why can't I say it"],
    ["바보같이 웃기만 해", "Babogachi utgiman hae", "I just smile like a fool"],
    ["니가 다가오면 도망쳐", "Niga dagaomyeon domangchyeo", "When you come near, I run away"],
    ["음 오 아 예", "Eum o a ye", "Um oh ah yeah"],
    ["내 마음이 이래 어떡해", "Nae ma-eumi irae eotteokhae", "My heart is like this, what do I do"],
    ["니가 웃으면 나도 웃어", "Niga useumyeon nado useo", "When you smile, I smile too"],
    ["니가 울면 나도 울고 싶어", "Niga ulmyeon nado ulgo sipeo", "When you cry, I want to cry too"],
    ["이게 사랑인가 모르겠어", "Ige saranginga moreugesseo", "Is this love, I don't know"],
    ["음 오 아 예예예", "Eum o a yeyeye", "Um oh ah yeah yeah yeah"],
    ["오늘도 내일도 모레도", "Oneuldo naeildo moreydo", "Today, tomorrow, the day after"],
    ["네 생각만 해", "Ne saengganman hae", "I only think of you"],
    ["이게 맞는 거야 내 마음이", "Ige manneun geoya nae ma-eumi", "Is my heart right"],
    ["音 Oh Ah Yeah", "Eum Oh Ah Yeah", "Um Oh Ah Yeah"],
    ["아직도 모르겠어 사랑이 뭔지", "Ajikdo moreugesseo sarangi mwonji", "I still don't know what love is"],
    ["그냥 네 옆에 있고 싶어", "Geunyang ne yeope itgo sipeo", "I just want to be beside you"],
    ["이게 다 사랑인 건가봐", "Ige da sarangin geonabwa", "I guess all of this is love"],
    ["음 오 아 예", "Eum o a ye", "Um oh ah yeah"],
    ["나도 알아 이게 사랑이라는 걸", "Nado ara ige sarangiraneun geol", "I know too, that this is love"],
    ["이제는 말할게 좋아해", "Ije-neun malhalge joahae", "Now I'll say it, I like you"],
    ["음 오 아 예", "Eum o a ye", "Um oh ah yeah"],
  ]);

  const umOhAhYeah = await prisma.song.upsert({
    where: { slug: "mamamoo-um-oh-ah-yeah" },
    update: {},
    create: {
      slug: "mamamoo-um-oh-ah-yeah",
      title: "Um Oh Ah Yeah (음오아예)",
      albumId: mamamooAlbum2.id,
      releaseYear: 2015,
      ...umOhAhYeahLyrics,
    },
  });

  // MAMAMOO credits
  for (const song of [hip, gogobebe, windFlower, umOhAhYeah]) {
    await prisma.songCredit.upsert({
      where: { id: `credit-${song.slug}-mamamoo` },
      update: {},
      create: { id: `credit-${song.slug}-mamamoo`, songId: song.id, artistId: mamamoo.id, role: "performer" },
    });
  }

  // ── RED VELVET ─────────────────────────────────────────────────────────────
  const redVelvet = await prisma.artist.upsert({
    where: { slug: "red-velvet" },
    update: {},
    create: {
      slug: "red-velvet",
      type: "GROUP",
      stageName: "Red Velvet",
      debutYear: 2014,
      labelId: sm?.id ?? undefined,
      bio: "Red Velvet is a five-member South Korean girl group formed by SM Entertainment, debuting in August 2014. The group consists of Irene, Seulgi, Wendy, Joy, and Yeri. Known for their dual concept combining the bright 'Red' side with a darker, more mature 'Velvet' side, Red Velvet has achieved wide critical acclaim and commercial success.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Red_Velvet_in_2022.jpg/960px-Red_Velvet_in_2022.jpg",
    },
  });

  const redVelvetAlbum1 = await prisma.album.upsert({
    where: { slug: "red-velvet-summer-magic" },
    update: {},
    create: {
      slug: "red-velvet-summer-magic",
      title: "Summer Magic",
      artistId: redVelvet.id,
      releaseYear: 2018,
      type: "MINI",
      coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Red_Velvet_-_Summer_Magic.jpg/300px-Red_Velvet_-_Summer_Magic.jpg",
    },
  });

  const redVelvetAlbum2 = await prisma.album.upsert({
    where: { slug: "red-velvet-the-reve-festival-finale" },
    update: {},
    create: {
      slug: "red-velvet-the-reve-festival-finale",
      title: "The ReVe Festival: Finale",
      artistId: redVelvet.id,
      releaseYear: 2019,
      type: "MINI",
      coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/4/45/Red_Velvet_-_The_ReVe_Festival_Finale.jpg/300px-Red_Velvet_-_The_ReVe_Festival_Finale.jpg",
    },
  });

  const redFlavorLyrics = lyrics([
    ["빨간 맛 궁금해 Honey", "Ppalgan mat gunggeumhae Honey", "I'm curious about the red flavor, honey"],
    ["여름 초입 달콤한 그 향기에", "Yeoreum choeip dalkomhan geu hyanggie", "At the beginning of summer, that sweet scent"],
    ["눈이 멀어버릴 것 같아", "Nuni meoreobeoril geot gata", "I feel like I might go blind"],
    ["어질어질어질 Baby", "Eojireojireojil Baby", "Dizzy dizzy dizzy baby"],
    ["빨간 맛 궁금해 Honey", "Ppalgan mat gunggeumhae Honey", "I'm curious about the red flavor, honey"],
    ["저 하늘이 물들어 가는 노을처럼", "Jeo haneuri muldeureoganeun noeulcheoreom", "Like the sky being dyed by the sunset"],
    ["내 맘도 붉게 물들어", "Nae mamdo bulge muldeeureo", "My heart is also dyed red"],
    ["여름이니까 Baby", "Yeoreuminiikka Baby", "Because it's summer, baby"],
    ["Bing bing bing bing", "Bing bing bing bing", "Bing bing bing bing"],
    ["빙글빙글 돌아가는 지구처럼", "Bingeulbingeul dolaganeun jigucheoreom", "Like the spinning spinning Earth"],
    ["나도 너만 보면 돌아가", "Nado neoman bomyeon dolaga", "I also spin when I see only you"],
    ["뜨거운 여름 바람처럼", "Tteugoun yeoreum barameulcheoreom", "Like the hot summer wind"],
    ["내 맘에 불을 질러놓은 너", "Nae mame bureul jilleronoeun neo", "You who set my heart on fire"],
    ["빨간 맛 red flavor", "Ppalgan mat red flavor", "Red flavor, red flavor"],
    ["새콤달콤 초여름 느낌이야", "Saekomdalkoma choyeoreum neukkimiya", "It's the bittersweet feeling of early summer"],
    ["내 최애 계절이야", "Nae choiae gyejeoriya", "It's my most beloved season"],
    ["눈을 감아도 네가 보여", "Nuneul gamado nega boyeo", "Even with my eyes closed I see you"],
    ["왜 이럴까 이럴까", "Wae ireolkka ireolkka", "Why is it like this, why is it like this"],
    ["다가올 것 같아 근데 멀리 있어", "Dagaol geot gata geunde meolli isseo", "It feels like you'll come closer but you're far away"],
    ["빨간 맛이야 red flavor", "Ppalgan masiya red flavor", "It's red flavor, red flavor"],
    ["이 기분 뭔지 알아 I know you know", "I gibun mwonji ara I know you know", "You know this feeling, I know you know"],
    ["달달한 거 좋아해 좋아해", "Daldatan geo joahae joahae", "I love sweet things, I love them"],
    ["특히 너 같은 거 Babe", "Teukhi neo gateun geo Babe", "Especially things like you, babe"],
    ["빨개빨개 빨개지는 내 두 볼처럼", "Ppalgaeppalgae ppalgeajineun nae du bolcheoreom", "Red red red like my two cheeks turning red"],
    ["너를 보면 멈추는 내 심장처럼", "Neoreul bomyeon meomchuneun nae simjangeulcheoreom", "Like my heart that stops when I see you"],
    ["빨간 맛 Red Red Red", "Ppalgan mat Red Red Red", "Red flavor red red red"],
    ["여름의 끝 잡고 싶어 나는", "Yeoreumui kkeut japgo sipeo na-neun", "I want to hold onto the end of summer"],
    ["Watermelon Watermelon", "Watermelon Watermelon", "Watermelon watermelon"],
    ["달콤한 여름 향기를 맡으며", "Dalkomhan yeoreum hyanggyireul mateumeyo", "Smelling the sweet summer scent"],
    ["빨간 맛 궁금해 Honey", "Ppalgan mat gunggeumhae Honey", "I'm curious about the red flavor, honey"],
    ["빨간 맛 Red flavor Red flavor", "Ppalgan mat Red flavor Red flavor", "Red flavor, red flavor, red flavor"],
    ["이게 바로 여름이야", "Ige baro yeoreumiya", "This is exactly summer"],
  ]);

  const redFlavor = await prisma.song.upsert({
    where: { slug: "red-velvet-red-flavor" },
    update: {},
    create: {
      slug: "red-velvet-red-flavor",
      title: "Red Flavor (빨간 맛)",
      albumId: redVelvetAlbum1.id,
      releaseYear: 2017,
      ...redFlavorLyrics,
    },
  });

  const psychoLyrics = lyrics([
    ["나를 부르지 마 이미 늦었어", "Na-reul bureujima imi neujeosseo", "Don't call for me, it's already too late"],
    ["처음부터 잘못됐어 우리", "Cheoeumebuteo jalmosdwaesseo uri", "From the beginning we were wrong"],
    ["내가 너를 좋아하는 만큼", "Naega neoreul joahaneun mankeum", "As much as I like you"],
    ["너도 나를 좋아해준다면", "Neodo na-reul joahaejundamyeon", "If you would like me as much"],
    ["이런 말 안 해도 됐을 텐데", "Ireon mal an haedo dwaesseul tende", "I wouldn't have had to say these words"],
    ["Psycho 내 맘이 Psycho야", "Psycho nae mami Psychoya", "Psycho, my heart is psycho"],
    ["모르겠어 왜 이렇게 됐는지", "Moreugesseo wae ireohke dwaenneunnji", "I don't know why it's become like this"],
    ["너를 만나기 전과 다른 나", "Neoreul mannagi jeon-gwa dareun na", "A different me than before I met you"],
    ["어쩌다 이렇게 됐는지 몰라", "Eojjeoda ireohke dwaenneunnji molla", "I don't know how this happened"],
    ["Psycho 너도 내 Psycho야", "Psycho neodo nae Psychoya", "Psycho, you're also my psycho"],
    ["서로가 서로에게 빠져드는 것처럼", "Seorogaga seoroe ge ppajjeodeuneun geotcheoreom", "Like we're falling into each other"],
    ["헤어날 수 없어 우리 둘이서", "Heeoonal su eopseo uri durireo", "We can't escape, just the two of us"],
    ["미칠 것 같아 미칠 것 같아", "Michil geot gata michil geot gata", "I feel like I'm going crazy, going crazy"],
    ["Psycho Psycho Psycho", "Psycho Psycho Psycho", "Psycho psycho psycho"],
    ["나만 이런 건지 너도 그런 건지", "Naman ireun geonji neodo geureun geonji", "Whether it's only me or you too"],
    ["확인하고 싶어 매일 밤마다", "Hwagin hago sipeo maeil bammadar", "I want to confirm every night"],
    ["아무리 애써봐도 되돌릴 수 없어", "Amuri aesseobwado doedolil su eopseo", "No matter how hard I try I can't turn back"],
    ["우린 이미 이렇게 됐으니까", "Urin imi ireohke dwaesseoniikka", "Because we've already become like this"],
    ["사랑은 원래 이런 건가", "Sarangeun wollae ireun geonga", "Is love originally like this"],
    ["이렇게 미칠 것만 같은 건가", "Ireohke michil geotman gateun geonga", "Does it always feel like going crazy"],
    ["Psycho 나를 보는 너의 눈빛", "Psycho na-reul boneun neoui nunbit", "Psycho, the way your eyes look at me"],
    ["날 놓아줄 것 같지 않아", "Nal noaajul geot gatji ana", "It doesn't seem like you'll let me go"],
    ["이미 너에게 빠져버린 나는", "Imi neoege ppajjeobeorin na-neun", "Me who has already fallen for you"],
    ["어떻게 해야 할지 몰라", "Eotteokhge haeya halji molla", "I don't know what to do"],
    ["그냥 이대로 Psycho 할게", "Geunyang idaero Psycho halge", "I'll just be psycho like this"],
    ["너와 나 둘이서 Psycho 할게", "Neowa na durireo Psycho halge", "You and I, both psycho together"],
    ["Psycho 내 맘이 Psycho야", "Psycho nae mami Psychoya", "Psycho, my heart is psycho"],
    ["너도 나도 서로의 Psycho야", "Neodo nado seoroui Psychoya", "You and me, each other's psycho"],
    ["우린 원래 이렇게 됐었던 거야", "Urin wollae ireohke dwaesseotdeon geoya", "We were always meant to be like this"],
    ["Psycho Psycho", "Psycho Psycho", "Psycho psycho"],
    ["우리 둘이 서로의 Psycho", "Uri durireo seoroui Psycho", "The two of us, each other's psycho"],
    ["영원히 함께 Psycho 하자", "Yeongwonhi hamkke Psycho haja", "Let's be psycho together forever"],
  ]);

  const psycho = await prisma.song.upsert({
    where: { slug: "red-velvet-psycho" },
    update: {},
    create: {
      slug: "red-velvet-psycho",
      title: "Psycho",
      albumId: redVelvetAlbum2.id,
      releaseYear: 2019,
      ...psychoLyrics,
    },
  });

  const feelMyRhythmLyrics = lyrics([
    ["느껴봐 내 리듬을", "Neukyeobwa nae rideumul", "Feel my rhythm"],
    ["이 순간을 즐겨봐", "I sunaneul jeulgyeobwa", "Enjoy this moment"],
    ["나만 따라와", "Naman ttarawa", "Just follow me"],
    ["내 리듬에 맞춰봐", "Nae rideume maechwoobwa", "Match my rhythm"],
    ["Classical 선율 위에", "Classical seonnyul wie", "On top of a classical melody"],
    ["새로운 리듬이 펼쳐져", "Saeroun rideumi pyeolchyeojyeo", "A new rhythm unfolds"],
    ["과거와 현재가 만나는 곳", "Gwageowa hyeonjjaega mannaneun got", "Where the past and present meet"],
    ["그 사이를 걷는 우리", "Geu saireul geodneun uri", "We who walk between them"],
    ["Feel my rhythm 느껴봐", "Feel my rhythm neukyeobwa", "Feel my rhythm, feel it"],
    ["지금 이 순간 내 맘속에", "Jigeum i sunan nae mamsoge", "In my heart right now in this moment"],
    ["새로운 바람이 불어와", "Saeroun barami bureowa", "A new wind is blowing"],
    ["너와 나만의 멜로디", "Neowa namanui mellodi", "A melody that's only yours and mine"],
    ["함께 춤을 춰봐 Feel my rhythm", "Hamkke chumeul chwoobwa Feel my rhythm", "Let's dance together, feel my rhythm"],
    ["세상이 멈춘 것 같아", "Sesangi meomchun geot gata", "It feels like the world has stopped"],
    ["너와 나만 있는 이 공간", "Neowa naman inneun i gonggan", "This space where only you and I exist"],
    ["Bach의 선율이 흐르는 가운데", "Bach-ui seonnyuri heureuneun gaunde", "While Bach's melody flows"],
    ["우리만의 노래가 시작돼", "Urimanui noraega sijakdwae", "Our own song begins"],
    ["Feel my rhythm 따라와", "Feel my rhythm ttarawa", "Feel my rhythm, follow me"],
    ["클래식과 팝이 만나는 순간", "Keullaessikgwa pabi mannaneun sunan", "The moment classical and pop meet"],
    ["새로운 역사가 쓰여져", "Saeroun yeoksaga sseunyeojyeo", "A new history is being written"],
    ["우리의 이야기로", "Uriui iyagiro", "With our story"],
    ["Feel my rhythm 느껴봐 내 심장이", "Feel my rhythm neukyeobwa nae simjangi", "Feel my rhythm, feel my heart"],
    ["너를 위해 뛰고 있어", "Neoreul wihae ttwigo isseo", "Is beating for you"],
    ["이 음악처럼 영원히", "I eumakcheoreom yeongwonhi", "Forever like this music"],
    ["함께이고 싶어", "Hamkkeirgo sipeo", "I want to be together"],
    ["Feel my rhythm Baby feel my rhythm", "Feel my rhythm Baby feel my rhythm", "Feel my rhythm baby feel my rhythm"],
    ["고전 속에 담긴 우리의 사랑", "Gojeon soge damgin uriui sarang", "Our love contained within the classics"],
    ["시간을 넘어 울려 퍼져", "Siganeul neomeo ullyeo pyeojyeo", "Echoing and spreading beyond time"],
    ["Feel my rhythm 지금 이 순간", "Feel my rhythm jigeum i sunan", "Feel my rhythm, this moment right now"],
    ["영원히 간직할게", "Yeongwonhi ganjikhalge", "I'll cherish forever"],
    ["Feel my rhythm", "Feel my rhythm", "Feel my rhythm"],
    ["내 리듬을 느껴봐 Baby", "Nae rideumul neukyeobwa Baby", "Feel my rhythm baby"],
  ]);

  const feelMyRhythm = await prisma.song.upsert({
    where: { slug: "red-velvet-feel-my-rhythm" },
    update: {},
    create: {
      slug: "red-velvet-feel-my-rhythm",
      title: "Feel My Rhythm",
      albumId: redVelvetAlbum2.id,
      releaseYear: 2022,
      ...feelMyRhythmLyrics,
    },
  });

  const badBoyLyrics = lyrics([
    ["한마디면 돼 Yes or No", "Hanmadimyeon dwae Yes or No", "One word is enough, yes or no"],
    ["넌 날 원해 난 알아", "Neon nal wonhae nan ara", "You want me, I know"],
    ["왜 망설여 이미 늦었잖아", "Wae mangseolyeo imi neujeotjana", "Why hesitate, it's already too late"],
    ["날 잡아봐 Bad boy", "Nal jabobwa Bad boy", "Try to catch me, bad boy"],
    ["차가운 척해도 다 알아", "Chagaun cheok haedo da ara", "Even if you act cold, I know everything"],
    ["네 눈빛이 말해줘", "Ne nunbichi malhaejwo", "Your eyes tell me"],
    ["좋아하면서 왜 모른 척해", "Joahamyeonseo wae moreun cheok hae", "Why do you pretend not to like me when you do"],
    ["Bad bad bad bad boy", "Bad bad bad bad boy", "Bad bad bad bad boy"],
    ["그렇게 차갑게 굴지 마", "Geureohke chagapge gulji ma", "Don't act so cold"],
    ["나한테만은 따뜻해도 돼", "Na-hante maneun ttattteuthaeado dwae", "You can be warm at least to me"],
    ["Bad boy 나쁜 척하지 마", "Bad boy nappeun cheok haji ma", "Bad boy, stop pretending to be bad"],
    ["나는 다 알아 네 마음", "Na-neun da ara ne maeum", "I know everything, your heart"],
    ["결국엔 내 곁에 오게 될걸", "Gyeolgugen nae gyeote oge doelgeol", "In the end you'll come to my side"],
    ["Bad bad boy", "Bad bad boy", "Bad bad boy"],
    ["나만 봐 나만 봐", "Naman bwa naman bwa", "Look only at me, look only at me"],
    ["Bad boy 나만 봐", "Bad boy naman bwa", "Bad boy, look only at me"],
    ["네가 아무리 숨기려 해도", "Nega amuri sumgireohaedo", "No matter how much you try to hide"],
    ["내 눈엔 다 보여 다 보여", "Nae nunen da boyeo da boyeo", "I can see it all in my eyes"],
    ["Bad boy 솔직하게 말해봐", "Bad boy soljikage malhaebwa", "Bad boy, speak honestly"],
    ["나 좋아한다고 말해봐", "Na joahandan-da go malhaebwa", "Tell me that you like me"],
    ["왜 그렇게 어렵게 생각해", "Wae geureohke eoryeopge saenggakhae", "Why do you make it so complicated"],
    ["단순하게 생각해봐", "Dansunhage saenggakhaeobwa", "Think simply"],
    ["내가 널 좋아하고 넌 날 좋아해", "Naega neol joahago neon nal joahae", "I like you and you like me"],
    ["그게 다잖아", "Geuge dajana", "That's all there is to it"],
    ["Bad boy 이제 그만 차갑게 굴지 마", "Bad boy ije geuman chagapge gulji ma", "Bad boy, stop acting cold now"],
    ["나한테 솔직해져도 돼", "Na-hante soljikhaejyeodo dwae", "You can be honest with me"],
    ["나쁜 척하지 말고 내 곁에 있어줘", "Nappeun cheok haji malgo nae gyeote isseo jwo", "Stop pretending to be bad and stay by my side"],
    ["Bad boy", "Bad boy", "Bad boy"],
    ["결국엔 내 곁에 있을 거잖아", "Gyeolgugen nae gyeote isseul geojana", "In the end you'll be by my side anyway"],
    ["Bad bad bad bad boy", "Bad bad bad bad boy", "Bad bad bad bad boy"],
    ["나만 봐 내 Bad boy", "Naman bwa nae Bad boy", "Look only at me, my bad boy"],
    ["Bad boy 이제 손 내밀어", "Bad boy ije son naemireo", "Bad boy, reach out your hand now"],
  ]);

  const badBoy = await prisma.song.upsert({
    where: { slug: "red-velvet-bad-boy" },
    update: {},
    create: {
      slug: "red-velvet-bad-boy",
      title: "Bad Boy",
      albumId: redVelvetAlbum1.id,
      releaseYear: 2018,
      ...badBoyLyrics,
    },
  });

  // Red Velvet credits
  for (const song of [redFlavor, psycho, feelMyRhythm, badBoy]) {
    await prisma.songCredit.upsert({
      where: { id: `credit-${song.slug}-red-velvet` },
      update: {},
      create: { id: `credit-${song.slug}-red-velvet`, songId: song.id, artistId: redVelvet.id, role: "performer" },
    });
  }

  // ── ITZY ──────────────────────────────────────────────────────────────────
  const itzy = await prisma.artist.upsert({
    where: { slug: "itzy" },
    update: {},
    create: {
      slug: "itzy",
      type: "GROUP",
      stageName: "ITZY",
      debutYear: 2019,
      labelId: jyp?.id ?? undefined,
      bio: "ITZY (있지) is a five-member South Korean girl group formed by JYP Entertainment, debuting in February 2019. The group consists of Yeji, Lia, Ryujin, Chaeryeong, and Yuna. Known for their powerful choreography, catchy music, and message of self-confidence and individuality, ITZY quickly became one of the top fourth-generation K-pop groups.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/ITZY_at_2023_MTV_Video_Music_Awards.jpg/960px-ITZY_at_2023_MTV_Video_Music_Awards.jpg",
    },
  });

  const itzyAlbum1 = await prisma.album.upsert({
    where: { slug: "itzy-it-z-me" },
    update: {},
    create: {
      slug: "itzy-it-z-me",
      title: "IT'z ME",
      artistId: itzy.id,
      releaseYear: 2020,
      type: "MINI",
      coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Itzy_It%27z_Me.png/300px-Itzy_It%27z_Me.png",
    },
  });

  const itzyAlbum2 = await prisma.album.upsert({
    where: { slug: "itzy-guess-who" },
    update: {},
    create: {
      slug: "itzy-guess-who",
      title: "GUESS WHO",
      artistId: itzy.id,
      releaseYear: 2021,
      type: "MINI",
      coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/ITZY_-_Guess_Who.jpg/300px-ITZY_-_Guess_Who.jpg",
    },
  });

  const dallaDallaLyrics = lyrics([
    ["달라달라 달라달라", "Dalla dalla dalla dalla", "Different different, different different"],
    ["나는 나는 나는 나야", "Na-neun na-neun na-neun naya", "I am I am I am me"],
    ["남들과는 달라 달라", "Namdeulgwa-neun dalla dalla", "I'm different from others, different"],
    ["있는 그대로의 나야", "Inneun geudaeroeui naya", "I'm just as I am"],
    ["너무 어렵게 생각하지 마", "Neomu eoryeopge saengak haji ma", "Don't think too hard about it"],
    ["내가 누군지 알잖아", "Naega nugunji aljana", "You know who I am"],
    ["남들이 뭐라 해도 신경 쓰지 마", "Namdeuri mwora haedo singyeong sseuji ma", "Don't mind what others say"],
    ["나는 나니까", "Na-neun nanikka", "Because I am me"],
    ["달라달라 나는 달라 달라", "Dalla dalla na-neun dalla dalla", "Different different, I am different different"],
    ["내 맘대로 살 거야", "Nae mamdaero sal geoya", "I'll live as I please"],
    ["눈치 따위 필요 없어", "Nunchi ttawi piryeo eopseo", "I don't need to be self-conscious"],
    ["나는 나야 달라달라", "Na-neun naya dalla dalla", "I am me, different different"],
    ["하루에도 수십 번 변해가는 유행", "Haruedo susip beon byeonhaeganeun yuhaeng", "Trends that change dozens of times a day"],
    ["따라가기 바빠 숨이 차", "Ttaragagi bappa sumi cha", "Busy following them, out of breath"],
    ["왜 남들과 똑같아야 해", "Wae namdeulgwa ttokgataya hae", "Why do I have to be exactly like others"],
    ["그냥 내 자신이면 안 돼", "Geunyang nae jasiniimyeon an dwae", "Can't I just be myself"],
    ["No no no no 아니야", "No no no no aniya", "No no no no, no way"],
    ["I'm the trend 나 자신이 트렌드야", "I'm the trend na jasini teurendi-ya", "I'm the trend, I myself am the trend"],
    ["내가 좋아하는 것 내가 원하는 것", "Naega joahaneun geot naega wonhaneun geot", "What I like, what I want"],
    ["그게 바로 나야", "Geuge baro naya", "That's exactly me"],
    ["달라달라 달라달라 나야", "Dalla dalla dalla dalla naya", "Different different different different, that's me"],
    ["남들 눈에 어떻게 보여도", "Namdeul nune eotteokhge boyeodo", "No matter how I appear in others' eyes"],
    ["나는 나야 있는 그대로야", "Na-neun naya inneun geudaeroya", "I am me, just as I am"],
    ["달라달라 더 달라", "Dalla dalla deo dalla", "Different different, even more different"],
    ["나는 나야 이게 나야", "Na-neun naya ige naya", "I am me, this is me"],
    ["비교하지 마 기준도 없어", "Bigyohaji ma gijundo eopseo", "Don't compare, there's no standard"],
    ["오직 나만의 기준이 있어", "Ojik namanui gijuni isseo", "I only have my own standards"],
    ["달라달라 나는 달라", "Dalla dalla na-neun dalla", "Different different, I am different"],
    ["이게 바로 나야 달라달라", "Ige baro naya dalla dalla", "This is exactly me, different different"],
    ["So different So different", "So different So different", "So different so different"],
    ["달라달라 나는 나야", "Dalla dalla na-neun naya", "Different different, I am me"],
    ["달라달라 있는 그대로야", "Dalla dalla inneun geudaeroya", "Different different, just as I am"],
  ]);

  const dallaDalla = await prisma.song.upsert({
    where: { slug: "itzy-dalla-dalla" },
    update: {},
    create: {
      slug: "itzy-dalla-dalla",
      title: "DALLA DALLA (달라달라)",
      albumId: itzyAlbum1.id,
      releaseYear: 2019,
      ...dallaDallaLyrics,
    },
  });

  const wannabeLyrics = lyrics([
    ["내가 나로 살기 너무 힘든 날엔", "Naega naro salgi neomu himdeun naren", "On days when it's too hard to live as myself"],
    ["닮고 싶은 누군가를 찾게 돼", "Damgo sipeun nugungareu chatke dwae", "I find myself looking for someone I want to be like"],
    ["근데 막상 되고 보면 느낄 것 같아", "Geunde makssang doego bomyeon neukil geot gata", "But when I actually become them, I think I'll feel"],
    ["어딘가 모자란 느낌", "Eodinga mojaran neukkim", "Something is lacking"],
    ["완벽한 사람이란 없어", "Wanbyeokhan sarami ran eopseo", "There's no such thing as a perfect person"],
    ["남들이 부러워하는 삶에도", "Namdeuri bureowohaneun salme-do", "Even in a life others envy"],
    ["분명 어딘가엔 상처가 있어", "Bunmyeong eodingaen sangcheoga isseo", "There is certainly a wound somewhere"],
    ["그러니 너도 나도 다 달라", "Geureonikka neodo nado da dalla", "So you and I are all different"],
    ["Wannabe 나만의 길을 걸어가", "Wannabe namanui gireul georeoga", "Wannabe, I walk my own path"],
    ["Wannabe 내 방식대로 살아가", "Wannabe nae bangsingdaero saraga", "Wannabe, I live my own way"],
    ["I wanna be me 그냥 있는 그대로", "I wanna be me geunyang inneun geudaero", "I wanna be me, just as I am"],
    ["I just wanna be me", "I just wanna be me", "I just wanna be me"],
    ["남들이 원하는 내 모습이 아닌", "Namdeuri wonhaneun nae mosubi anin", "Not the appearance others want from me"],
    ["진짜 내가 원하는 나로", "Jinjja naega wonhaneun naro", "As the me I truly want to be"],
    ["살아가고 싶어 그냥 내 자신으로", "Salagago sipeo geunyang nae jasinoero", "I want to live as just myself"],
    ["Wannabe Wannabe", "Wannabe Wannabe", "Wannabe wannabe"],
    ["남들이 보는 나는 항상 자신 있어 보여", "Namdeuri boneun na-neun hangsang jasin isseo boyeo", "The me others see always looks confident"],
    ["근데 나는 사실 많이 불안해", "Geunde na-neun sasil mani buranae", "But actually I'm quite anxious"],
    ["매일 나를 채우려 노력해", "Maeil na-reul chaeureoryeo noryeokhae", "I try to fill myself every day"],
    ["그게 다 나니까", "Geuge da nanikka", "Because all of that is me"],
    ["Wannabe 나만의 색으로 빛나고 싶어", "Wannabe namanui saeguro bitnago sipeo", "Wannabe, I want to shine with my own color"],
    ["Wannabe 남들 기준 아닌 내 기준으로", "Wannabe namdeul gijun anin nae gijuneuro", "Wannabe, by my standards, not others'"],
    ["I just wanna be me 있는 그대로의 나", "I just wanna be me inneun geudaeroui na", "I just wanna be me, myself as I am"],
    ["I just wanna be me", "I just wanna be me", "I just wanna be me"],
    ["비교하지 마 기준은 없어", "Bigyohaji ma gijuneun eopseo", "Don't compare, there is no standard"],
    ["모두가 다 각자의 완벽함이 있어", "Moduga da gagjaui wanbyeokkami isseo", "Everyone has their own perfection"],
    ["Wannabe 나는 나야", "Wannabe na-neun naya", "Wannabe, I am me"],
    ["있는 그대로의 나야", "Inneun geudaeroeui naya", "I'm myself just as I am"],
    ["이게 바로 나야 Wannabe", "Ige baro naya Wannabe", "This is exactly me, wannabe"],
    ["I wanna be me I wanna be me", "I wanna be me I wanna be me", "I wanna be me I wanna be me"],
    ["Just me 그냥 나", "Just me geunyang na", "Just me, just me"],
    ["Wannabe 내가 원하는 나로 살아갈게", "Wannabe naega wonhaneun naro salagalge", "Wannabe, I'll live as the me I want to be"],
  ]);

  const wannabe = await prisma.song.upsert({
    where: { slug: "itzy-wannabe" },
    update: {},
    create: {
      slug: "itzy-wannabe",
      title: "Wannabe (워너비)",
      albumId: itzyAlbum1.id,
      releaseYear: 2020,
      ...wannabeLyrics,
    },
  });

  const notShyLyrics = lyrics([
    ["I'm not shy", "I'm not shy", "I'm not shy"],
    ["다가갈게 나는 Not shy", "Dagagalge na-neun Not shy", "I'll come to you, I'm not shy"],
    ["처음엔 나도 떨렸어", "Cheoeumen nado tteollyeosseo", "At first I was trembling too"],
    ["네 앞에만 서면 작아지던 나", "Ne ame-man seomyeon jagaajideon na", "Me who would shrink only when standing before you"],
    ["이제는 달라졌어", "Ije-neun dallajeosseo", "Now it's different"],
    ["당당하게 말할게 I like you", "Dangdanghage malhalge I like you", "I'll say it boldly, I like you"],
    ["숨기지 않을게 내 마음", "Sumgiji aneulge nae maeum", "I won't hide my heart"],
    ["Not shy not shy not shy", "Not shy not shy not shy", "Not shy not shy not shy"],
    ["나는 Not shy 네가 좋아", "Na-neun Not shy nega joa", "I'm not shy, I like you"],
    ["솔직하게 말해 I like you", "Soljikage malhe I like you", "I'll say it honestly, I like you"],
    ["용기 내서 다가갈게", "Yongi naeseo dagagalge", "I'll gather courage and come to you"],
    ["I'm not shy", "I'm not shy", "I'm not shy"],
    ["눈이 마주칠 때마다", "Nuni majuchil ttemada", "Every time our eyes meet"],
    ["심장이 쿵 내려앉아", "Simjangi kung naeryeoanja", "My heart drops"],
    ["그래도 피하지 않을게", "Geuraedo pihaji aneulge", "Still I won't run away"],
    ["똑바로 바라볼게", "Ttokbaro baraabolge", "I'll look straight at you"],
    ["좋아하면 좋아한다고 해", "Joahamyeon joahandan-da go hae", "If you like someone, say you like them"],
    ["사랑하면 사랑한다고 해", "Saranghamyeon saranghan-da go hae", "If you love someone, say you love them"],
    ["후회 없이 다 표현할게", "Huhoe eopsi da pyohyeonhalge", "I'll express everything without regret"],
    ["Not shy not shy not shy", "Not shy not shy not shy", "Not shy not shy not shy"],
    ["내가 먼저 손 내밀게", "Naega meonjeo son naemilge", "I'll reach out my hand first"],
    ["내가 먼저 웃어줄게", "Naega meonjeo useojulge", "I'll smile first"],
    ["이게 바로 나야", "Ige baro naya", "This is exactly who I am"],
    ["Not shy 나는 Not shy", "Not shy na-neun Not shy", "Not shy, I am not shy"],
    ["더 이상 숨지 않아", "Deo isang sumji ana", "I won't hide anymore"],
    ["내 감정 솔직하게 드러낼게", "Nae gamjeong soljikage deureoeolge", "I'll show my feelings honestly"],
    ["Not shy not shy", "Not shy not shy", "Not shy not shy"],
    ["나는 이제 Not shy", "Na-neun ije Not shy", "I am now not shy"],
    ["당당하게 말할게", "Dangdanghage malhalge", "I'll say it boldly"],
    ["I like you I like you", "I like you I like you", "I like you I like you"],
    ["Not shy 솔직한 나야", "Not shy soljikan naya", "Not shy, I'm the honest me"],
    ["I'm not shy anymore", "I'm not shy anymore", "I'm not shy anymore"],
  ]);

  const notShy = await prisma.song.upsert({
    where: { slug: "itzy-not-shy" },
    update: {},
    create: {
      slug: "itzy-not-shy",
      title: "Not Shy",
      albumId: itzyAlbum2.id,
      releaseYear: 2020,
      ...notShyLyrics,
    },
  });

  const cakeLyrics = lyrics([
    ["CAKE CAKE CAKE CAKE", "CAKE CAKE CAKE CAKE", "Cake cake cake cake"],
    ["달콤한 나를 맛봐", "Dalkomhan na-reul matbwa", "Taste the sweet me"],
    ["나는 케이크야", "Na-neun keikeuya", "I am a cake"],
    ["달콤하고 예뻐", "Dalkomhago yeppeo", "Sweet and pretty"],
    ["한 입 베어 물어봐", "Han ip beeo mureobwa", "Take a bite"],
    ["CAKE CAKE 나를 봐", "CAKE CAKE na-reul bwa", "Cake cake, look at me"],
    ["달달한 내 모습에", "Daldalhan nae mosube", "At my sweet appearance"],
    ["빠져들게 될걸", "Ppajjeodeulge doelgeol", "You'll fall for me"],
    ["아이싱 바른 내 미소", "Aising bareun nae miso", "My frosting-covered smile"],
    ["스프링클처럼 반짝여", "Seupeulingleum banjjakkyeo", "Sparkles like sprinkles"],
    ["달콤한 향기로 가득한 나", "Dalkomhan hyanggyiro gadeukhan na", "Me, full of sweet scent"],
    ["거부할 수 없잖아", "Geobul al su eopsjana", "You can't resist"],
    ["CAKE 나는 케이크야", "CAKE na-neun keikeuya", "Cake, I am a cake"],
    ["겉도 속도 달콤해", "Geotdo sokdo dalkomhae", "Sweet inside and out"],
    ["나를 원한다면 와", "Na-reul wonhandamyeon wa", "If you want me, come"],
    ["망설이지 말고", "Mangseoliiji malgo", "Don't hesitate"],
    ["달콤달콤 달달달달", "Dalkomdalkom daldaldaldal", "Sweet sweet sweet sweet sweet"],
    ["나는 달콤한 케이크야", "Na-neun dalkomhan keikeuya", "I'm a sweet cake"],
    ["먹고 싶지 먹고 싶지", "Meokgo sipji meokgo sipji", "You want to eat me right, you want to eat me"],
    ["CAKE CAKE 한 조각", "CAKE CAKE han jogak", "Cake cake, one slice"],
    ["달달한 나를 가져봐", "Daldalhan na-reul gajeobwa", "Take the sweet me"],
    ["케이크처럼 특별한 날", "Keikeucheoreom teukbyeolhan nal", "On a special day like a cake"],
    ["나를 선택해줘", "Na-reul seonteongaejwo", "Choose me"],
    ["CAKE CAKE CAKE", "CAKE CAKE CAKE", "Cake cake cake"],
    ["달콤한 나만의 레시피", "Dalkomhan namanui resipi", "My own sweet recipe"],
    ["아무나 알 수 없어", "Amuna al su eopseo", "Not just anyone can know it"],
    ["특별한 너만을 위해", "Teukbyeolhan neomaneul wihae", "Only for special you"],
    ["공개할게 나의 비밀", "Gonggaehalge naui bimil", "I'll reveal my secret"],
    ["달콤달콤 달달달달 CAKE", "Dalkomdalkom daldaldaldal CAKE", "Sweet sweet sweet sweet sweet cake"],
    ["나는 케이크야 달콤한 나", "Na-neun keikeuya dalkomhan na", "I am a cake, the sweet me"],
    ["한 입 더 원하게 될걸", "Han ip deo wonhage doelgeol", "You'll want one more bite"],
    ["CAKE CAKE CAKE", "CAKE CAKE CAKE", "Cake cake cake"],
  ]);

  const cake = await prisma.song.upsert({
    where: { slug: "itzy-cake" },
    update: {},
    create: {
      slug: "itzy-cake",
      title: "CAKE",
      albumId: itzyAlbum2.id,
      releaseYear: 2021,
      ...cakeLyrics,
    },
  });

  // ITZY credits
  for (const song of [dallaDalla, wannabe, notShy, cake]) {
    await prisma.songCredit.upsert({
      where: { id: `credit-${song.slug}-itzy` },
      update: {},
      create: { id: `credit-${song.slug}-itzy`, songId: song.id, artistId: itzy.id, role: "performer" },
    });
  }

  // ── EXO ───────────────────────────────────────────────────────────────────
  const exo = await prisma.artist.upsert({
    where: { slug: "exo" },
    update: {},
    create: {
      slug: "exo",
      type: "GROUP",
      stageName: "EXO",
      debutYear: 2012,
      labelId: sm?.id ?? undefined,
      bio: "EXO is a South Korean-Chinese boy group formed by SM Entertainment, debuting in 2012. Originally debuting as two sub-units EXO-K and EXO-M performing in Korean and Mandarin respectively, the group is known for their powerful performances and synchronized choreography. EXO dominated the K-pop scene throughout the 2010s with hit after hit.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/EXO_at_the_Golden_Disc_Awards_2023_%28cropped%29.jpg/960px-EXO_at_the_Golden_Disc_Awards_2023_%28cropped%29.jpg",
    },
  });

  const exoAlbum1 = await prisma.album.upsert({
    where: { slug: "exo-the-war" },
    update: {},
    create: {
      slug: "exo-the-war",
      title: "The War",
      artistId: exo.id,
      releaseYear: 2017,
      type: "STUDIO",
      coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/8/87/EXO_-_The_War.jpg/300px-EXO_-_The_War.jpg",
    },
  });

  const exoAlbum2 = await prisma.album.upsert({
    where: { slug: "exo-exodus" },
    update: {},
    create: {
      slug: "exo-exodus",
      title: "EXODUS",
      artistId: exo.id,
      releaseYear: 2015,
      type: "STUDIO",
      coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/EXO_EXODUS.jpg/300px-EXO_EXODUS.jpg",
    },
  });

  const koKoBopLyrics = lyrics([
    ["Ko Ko Bop 느낌 알잖아", "Ko Ko Bop neukkim aljana", "Ko Ko Bop, you know the feeling"],
    ["다 놓고 싶어 이 순간만큼은", "Da noko sipeo i sunanmankeumeun", "I want to let go of everything, at least for this moment"],
    ["Ko Ko Bop 그냥 놀자", "Ko Ko Bop geunyang nolja", "Ko Ko Bop, let's just play"],
    ["Ko Ko Bop Ko Ko Bop", "Ko Ko Bop Ko Ko Bop", "Ko Ko Bop Ko Ko Bop"],
    ["지금 이 느낌 어때 Baby", "Jigeum i neukkim eottae Baby", "How does this feeling feel, baby"],
    ["온몸이 녹아 내리는 것 같아", "Onomi nota naerineun geot gata", "It feels like my whole body is melting"],
    ["이 밤이 지나가기 전에", "I bami jinagage jeone", "Before this night passes"],
    ["함께 즐겨봐 Ko Ko Bop", "Hamkke jeulgyeobwa Ko Ko Bop", "Enjoy it together, Ko Ko Bop"],
    ["Uh 마음이 따라가고 있어", "Uh ma-eumi taragago isseo", "Uh, my heart is following"],
    ["몸이 이끄는 대로", "Momi ikkeunneun daero", "Wherever my body leads"],
    ["걱정은 내려놓고 Baby", "Geokjeongeun naelyeonoko Baby", "Put down your worries, baby"],
    ["그냥 느껴봐", "Geunyang neukyeobwa", "Just feel it"],
    ["Ko Ko Bop 이 느낌이 좋아", "Ko Ko Bop i neukkimi joa", "Ko Ko Bop, I love this feeling"],
    ["온 세상이 흔들려 Baby", "On sesangi heundellyeo Baby", "The whole world is shaking, baby"],
    ["Ko Ko Bop 다 잊어버려", "Ko Ko Bop da ijeobeolyeo", "Ko Ko Bop, forget everything"],
    ["나만 봐줘 이 순간에", "Naman bwajwo i sunane", "Look only at me in this moment"],
    ["오늘 밤은 우리 둘만의 시간", "Oneul bameun uri dulmanui sigan", "Tonight is our time just for the two of us"],
    ["모두 다 잊고 신나게 놀자", "Modu da ikgo sinnage nolja", "Forget everything and let's have fun"],
    ["리듬에 몸을 맡겨봐", "Rideume momeul matkyeobwa", "Surrender your body to the rhythm"],
    ["Ko Ko Bop Ko Ko Bop", "Ko Ko Bop Ko Ko Bop", "Ko Ko Bop Ko Ko Bop"],
    ["기분이 좋아 이 밤이 좋아", "Gibuni joa i bami joa", "I feel good, I love this night"],
    ["너와 함께라서 더 좋아", "Neowa hamkkeraseo deo joa", "It's even better because I'm with you"],
    ["Ko Ko Bop 우리 신나게", "Ko Ko Bop uri sinnage", "Ko Ko Bop, let's have fun together"],
    ["이 밤을 불태워봐", "I bameul bultaewobwa", "Let's set this night on fire"],
    ["Ko Ko Bop 느낌 알잖아", "Ko Ko Bop neukkim aljana", "Ko Ko Bop, you know the feeling"],
    ["이 순간을 즐겨봐", "I sunaneul jeulgyeobwa", "Enjoy this moment"],
    ["Ko Ko Bop Ko Ko Bop", "Ko Ko Bop Ko Ko Bop", "Ko Ko Bop Ko Ko Bop"],
    ["좋아 이 느낌이 좋아", "Joa i neukkimi joa", "Good, I love this feeling"],
    ["영원히 계속되길", "Yeongwonhi gyesoktweogil", "I hope it lasts forever"],
    ["Ko Ko Bop Baby", "Ko Ko Bop Baby", "Ko Ko Bop baby"],
    ["오늘 밤 Ko Ko Bop", "Oneul bam Ko Ko Bop", "Tonight Ko Ko Bop"],
    ["이 리듬에 취해봐", "I rideume chwihwobwa", "Get lost in this rhythm"],
  ]);

  const koKoBop = await prisma.song.upsert({
    where: { slug: "exo-ko-ko-bop" },
    update: {},
    create: {
      slug: "exo-ko-ko-bop",
      title: "Ko Ko Bop",
      albumId: exoAlbum1.id,
      releaseYear: 2017,
      ...koKoBopLyrics,
    },
  });

  const powerLyrics = lyrics([
    ["파워 Power 파워 Power", "Paweo Power paweo Power", "Power power power power"],
    ["내게 Power 줘봐", "Naege Power jwobwa", "Give me power"],
    ["이 세상을 구할 Power", "I sesangeul guhal Power", "Power to save this world"],
    ["Power 어둠을 밝힐", "Power eodeumeul balkil", "Power to light up the darkness"],
    ["초능력 같은 노래로", "Choneungnyeok gateun noraero", "With a song like supernatural power"],
    ["온 세상을 깨워줄게", "On sesangeul kkaewojulge", "I'll wake up the whole world"],
    ["이 음악이 내 Power야", "I eumagi nae Powerya", "This music is my power"],
    ["세상 끝까지 함께해", "Sesang kkeutkkaji hamkkeha", "Be together with me until the end of the world"],
    ["Power 너의 손을 잡아", "Power neoui soneul jaba", "Power, hold your hand"],
    ["Power 함께 날아가", "Power hamkke naraga", "Power, let's fly together"],
    ["이 음악으로 세상을 바꿔", "I eumageuro sesangeul bakkkwo", "I'll change the world with this music"],
    ["Power Power Power", "Power Power Power", "Power power power"],
    ["슈퍼 히어로가 되고 싶어", "Syupeo hieooga doego sipeo", "I want to become a superhero"],
    ["세상 모든 슬픔을 없애줄", "Sesang modeun seulpeumeul eopsaejul", "I'll erase all the sadness in the world"],
    ["내 음악에 담긴 Power로", "Nae eumage damgin Powerro", "With the power within my music"],
    ["너를 구해줄게", "Neoreul guhaejulge", "I'll save you"],
    ["힘들 때 내 노래를 들어봐", "Himdel ttae nae noraereul deureobwa", "Listen to my song when things are hard"],
    ["다시 일어설 힘이 생겨", "Dasi ireoseol himi saengkyeo", "You'll find the strength to stand up again"],
    ["이게 바로 내 Power야", "Ige baro nae Powerya", "This is exactly my power"],
    ["너와 함께하는 Power", "Neowa hamkkeha-neun Power", "Power that I share with you"],
    ["Power 이 음악이 세상을 바꿔", "Power i eumagi sesangeul bakkkwo", "Power, this music changes the world"],
    ["Power 모두 함께 날아올라", "Power modu hamkke naraolla", "Power, everyone fly up together"],
    ["우리의 Power로", "Uriui Powerro", "With our power"],
    ["세상을 빛내줄게", "Sesangeul binnaeojulge", "We'll make the world shine"],
    ["Power Power Power Power", "Power Power Power Power", "Power power power power"],
    ["파워 Power 파워 Power", "Paweo Power paweo Power", "Power power power power"],
    ["세상을 구할 Power", "Sesangeul guhal Power", "Power to save the world"],
    ["이게 내 Power야", "Ige nae Powerya", "This is my power"],
    ["너와 나의 Power야", "Neowa naui Powerya", "It's the power of you and me"],
    ["Power Power Power", "Power Power Power", "Power power power"],
    ["함께라면 못 할 게 없어", "Hamkkeramyeon mot hal ge eopseo", "If we're together there's nothing we can't do"],
    ["우리의 Power Power", "Uriui Power Power", "Our power power"],
  ]);

  const power = await prisma.song.upsert({
    where: { slug: "exo-power" },
    update: {},
    create: {
      slug: "exo-power",
      title: "Power",
      albumId: exoAlbum1.id,
      releaseYear: 2017,
      ...powerLyrics,
    },
  });

  const growlLyrics = lyrics([
    ["으르렁 으르렁 으르렁 대", "Eureuréong eureuréong eureuréong dae", "Growl growl growl"],
    ["으르렁 으르렁 으르렁 대", "Eureuréong eureuréong eureuréong dae", "Growl growl growl"],
    ["이봐 저 남자가 너에게 접근하잖아", "Ibwa jeo namjaga neoege jeopgeunhajana", "Hey, that guy is approaching you"],
    ["내 두 눈이 무섭게 타오르잖아", "Nae du nuni museopge taoreu-rjana", "My two eyes are burning fiercely"],
    ["날 건드리지 마 내 여자한테", "Nal geondeuliji ma nae yeojahante", "Don't mess with me, with my girl"],
    ["나 화나면 무서운 거 알잖아", "Na hwanahmyeon museo-un geo aljana", "You know I'm scary when I'm angry"],
    ["저 남자 눈빛이 너무 맘에 안 들어", "Jeo namja nunbichi neomu mame an deureo", "That guy's gaze doesn't sit right with me"],
    ["왜 자꾸 내 여자한테 시비를 걸어", "Wae jakku nae yeojahante sibili geolleo", "Why does he keep picking a fight with my girl"],
    ["으르렁 으르렁 으르렁 대", "Eureuréong eureuréong eureuréong dae", "Growl growl growl"],
    ["나쁜 놈이야 나쁜 놈이야", "Nappeun nomiya nappeun nomiya", "He's a bad guy, a bad guy"],
    ["감히 내 여자를 넘봐", "Gamhi nae yeojareul neombwa", "How dare he covet my girl"],
    ["으르렁 으르렁 으르렁 대", "Eureuréong eureuréong eureuréong dae", "Growl growl growl"],
    ["내 여자 잡아줘 내 여자 지켜줘", "Nae yeoja jabajwo nae yeoja jikyeojwo", "Hold my girl, protect my girl"],
    ["저 남자한테서 멀리 떨어져", "Jeo namjahanteoseo meolli tteoreojyeo", "Get far away from that guy"],
    ["나만 바라봐 나만 바라봐", "Naman barabwa naman barabwa", "Look only at me, look only at me"],
    ["I'm your man 알잖아", "I'm your man aljana", "I'm your man, you know that"],
    ["으르렁 으르렁 으르렁대", "Eureuréong eureuréong eureuréongdae", "Growl growl growl"],
    ["내가 화가 났어 너 때문이야", "Naega hwaga nasseo neo ttemuniya", "I'm angry and it's because of you"],
    ["왜 자꾸 그 남자 눈을 봐줘", "Wae jakku geu namja nuneul bwajwo", "Why do you keep looking at that guy"],
    ["나만 봐야 해 나만 봐야 해", "Naman bwaya hae naman bwaya hae", "You should only look at me, only at me"],
    ["으르렁 으르렁 으르렁대", "Eureuréong eureuréong eureuréongdae", "Growl growl growl"],
    ["질투가 나 솔직히 질투가 나", "Jiltuga na soljikhi jiltuga na", "I'm jealous, honestly I'm jealous"],
    ["내 여자한테 가까이 오지 마", "Nae yeojahante gakkai oji ma", "Don't come close to my girl"],
    ["으르렁 으르렁 대 으르렁 대", "Eureuréong eureuréong dae eureuréong dae", "Growl growl, growl"],
    ["나는 이미 많이 화가 났어", "Na-neun imi mani hwaga nasseo", "I'm already very angry"],
    ["조심해 조심해 조심해", "Josimhae josimhae josimhae", "Be careful, be careful, be careful"],
    ["내 눈이 무섭게 타오르잖아", "Nae nuni museopge taoeurjana", "My eyes are burning fiercely"],
    ["으르렁 으르렁 으르렁대", "Eureuréong eureuréong eureuréongdae", "Growl growl growl"],
    ["나쁜 놈 저리 가", "Nappeun nom jeori ga", "Bad guy, get away"],
    ["감히 내 여자 넘봐", "Gamhi nae yeoja neombwa", "How dare you covet my girl"],
    ["으르렁 으르렁 대", "Eureuréong eureuréong dae", "Growl growl"],
    ["나는 네 남자 I'm your man", "Na-neun ne namja I'm your man", "I'm your man, I'm your man"],
  ]);

  const growl = await prisma.song.upsert({
    where: { slug: "exo-growl" },
    update: {},
    create: {
      slug: "exo-growl",
      title: "Growl (으르렁)",
      albumId: exoAlbum2.id,
      releaseYear: 2013,
      ...growlLyrics,
    },
  });

  const monsterLyrics = lyrics([
    ["난 Monster 난 Monster", "Nan Monster nan Monster", "I'm a monster, I'm a monster"],
    ["너를 잡아 먹을 것 같아", "Neoreul jaba meogeul geot gata", "It seems like I'll devour you"],
    ["너의 눈빛이 날 부르잖아", "Neoui nunbichi nal bureujana", "Your gaze is calling me"],
    ["나를 멈출 수 없어", "Na-reul meomchul su eopseo", "I can't stop myself"],
    ["가까이 오지 마 위험해", "Gakkai oji ma wiheomhae", "Don't come close, it's dangerous"],
    ["난 너를 원하지만 안 돼", "Nan neoreul wonhajiman an dwae", "I want you but I shouldn't"],
    ["Monster 내 안에 숨어있던", "Monster nae ane sumeoinneudeon", "Monster, the one hiding inside me"],
    ["Monster 이제 깨어났어", "Monster ije kkaeeonasseo", "Monster, has awakened now"],
    ["너 때문이야 너 때문에", "Neo ttaemuniya neo ttemune", "It's because of you, because of you"],
    ["이렇게 내가 변해버렸어", "Ireohke naega byeonhaebeolyeosseo", "I've changed like this"],
    ["Monster 나는 Monster야", "Monster na-neun Monsterya", "Monster, I am a monster"],
    ["가까이 오지 마 위험하니까", "Gakkai oji ma wiheomhaniikka", "Don't come close because it's dangerous"],
    ["내 안에 잠들어 있던 Monster가", "Nae ane jamdeureo inneudeon Monsteri ga", "The monster sleeping inside me"],
    ["너로 인해 깨어났어", "Neoro inhae kkaeeonaasseo", "Has awakened because of you"],
    ["나를 멀리해 나는 Monster야", "Na-reul meollihae na-neun Monsterya", "Stay away from me, I'm a monster"],
    ["너를 해칠 것 같아", "Neoreul haechil geot gata", "I feel like I might hurt you"],
    ["Monster Monster Monster", "Monster Monster Monster", "Monster monster monster"],
    ["나는 멈출 수 없어", "Na-neun meomchul su eopseo", "I can't stop"],
    ["너에게 끌려가는 나", "Neoege kkeullyeoganeun na", "Me, being pulled toward you"],
    ["Monster 이게 다 너 때문이야", "Monster ige da neo ttemuniya", "Monster, this is all because of you"],
    ["나도 어쩔 수 없어", "Nado eojjeol su eopseo", "I can't help it either"],
    ["너를 향한 내 마음은", "Neoreul hyonghan nae ma-eumeun", "My heart toward you"],
    ["Monster처럼 자라나", "Monstercheoreom jarana", "Grows like a monster"],
    ["멈출 수가 없어 Monster", "Meomchul suga eopseo Monster", "I can't stop, monster"],
    ["내가 Monster야 Monster야", "Naega Monsterya Monsterya", "I am a monster, a monster"],
    ["너만 보면 이렇게 돼", "Neoman bomyeon ireohke dwae", "When I see only you, I become like this"],
    ["Monster 나는 Monster", "Monster na-neun Monster", "Monster, I am a monster"],
    ["너로 인해 깨어난 Monster", "Neoro inhae kkaeeonan Monster", "Monster awakened because of you"],
    ["내 안에 숨어있던 Monster가", "Nae ane sumeoinneudeon Monsteri ga", "The monster hiding inside me"],
    ["이제 깨어났어", "Ije kkaeeonasseo", "Has awakened now"],
    ["Monster Monster Monster나야", "Monster Monster Monster naya", "Monster monster monster, that's me"],
    ["나는 Monster야 조심해", "Na-neun Monsterya josimhae", "I'm a monster, be careful"],
  ]);

  const monster = await prisma.song.upsert({
    where: { slug: "exo-monster" },
    update: {},
    create: {
      slug: "exo-monster",
      title: "Monster (몬스터)",
      albumId: exoAlbum2.id,
      releaseYear: 2016,
      ...monsterLyrics,
    },
  });

  // EXO credits
  for (const song of [koKoBop, power, growl, monster]) {
    await prisma.songCredit.upsert({
      where: { id: `credit-${song.slug}-exo` },
      update: {},
      create: { id: `credit-${song.slug}-exo`, songId: song.id, artistId: exo.id, role: "performer" },
    });
  }

  // ── NCT 127 ───────────────────────────────────────────────────────────────
  const nct127 = await prisma.artist.upsert({
    where: { slug: "nct-127" },
    update: {},
    create: {
      slug: "nct-127",
      type: "GROUP",
      stageName: "NCT 127",
      debutYear: 2016,
      labelId: sm?.id ?? undefined,
      bio: "NCT 127 is a South Korean boy group and one of the sub-units of SM Entertainment's NCT. The group debuted in July 2016 and is named after the longitude coordinate 127°E, the meridian that runs through Seoul. Known for their experimental and genre-blending music, powerful performances, and passionate fanbase Neo Culture Technology, NCT 127 has built a global following.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/NCT_127_at_the_2022_MTV_Video_Music_Awards.png/960px-NCT_127_at_the_2022_MTV_Video_Music_Awards.png",
    },
  });

  const nct127Album1 = await prisma.album.upsert({
    where: { slug: "nct-127-nct-127-regular-irregular" },
    update: {},
    create: {
      slug: "nct-127-nct-127-regular-irregular",
      title: "NCT #127 Regular-Irregular",
      artistId: nct127.id,
      releaseYear: 2018,
      type: "STUDIO",
      coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c3/NCT_127_Regular-Irregular.jpg/300px-NCT_127_Regular-Irregular.jpg",
    },
  });

  const nct127Album2 = await prisma.album.upsert({
    where: { slug: "nct-127-sticker" },
    update: {},
    create: {
      slug: "nct-127-sticker",
      title: "Sticker",
      artistId: nct127.id,
      releaseYear: 2021,
      type: "STUDIO",
      coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/4/44/NCT_127_Sticker.jpg/300px-NCT_127_Sticker.jpg",
    },
  });

  const regularLyrics = lyrics([
    ["Regular 난 매일 규칙적으로", "Regular nan maeil gyuchikjeogeureo", "Regular, I'm regular every day"],
    ["이 시간을 즐겨 항상 같은 자리에서", "I siganeul jeulgyeo hangsang gateun jarieseo", "I enjoy this time, always in the same place"],
    ["Regular 습관처럼 자연스럽게", "Regular seubgwancheoreom jayeonseureopge", "Regular, naturally like a habit"],
    ["너를 생각해 매일 똑같이", "Neoreul saengakae maeil ttokgachi", "I think of you the same every day"],
    ["넌 내 일상이야 Regular", "Neon nae ilsangiya Regular", "You're my daily routine, regular"],
    ["숨 쉬듯 자연스러운 나의 하루", "Sum swijeut jayeonseuroun naui haru", "My day as natural as breathing"],
    ["Regular 넌 내 리듬이야", "Regular neon nae rideumiya", "Regular, you're my rhythm"],
    ["내 심장 박동처럼 규칙적인 너", "Nae simjang bakdongcheoreom gyuchikjeogin neo", "You, as regular as my heartbeat"],
    ["Irregular 그런데 너만 보면", "Irregular geureonde neoman bomyeon", "Irregular, but when I see only you"],
    ["내 심장이 불규칙하게 뛰어", "Nae simjangi bulgyuchikage ttweo", "My heart beats irregularly"],
    ["Regular 하지만 너 생각할 때", "Regular hajiman neo saenggakhal ttae", "Regular, but when I think of you"],
    ["모든 게 달라져 Irregular", "Modeun ge dallajeoo Irregular", "Everything changes, irregular"],
    ["규칙적으로 돌아가는 세상 속에서", "Gyuchikjeogeureo doraganeun sesang soge", "In this world that runs on schedule"],
    ["너만은 불규칙해 나한테는", "Neomaneun bulgyuchikae na-hante-neun", "You alone are irregular to me"],
    ["Regular Irregular 너 때문에", "Regular Irregular neo ttemune", "Regular irregular, because of you"],
    ["내 일상이 뒤바뀌어", "Nae ilsangi dwibakkyueo", "My daily life is turned upside down"],
    ["매일 같은 루틴처럼 보여도", "Maeil gateun rutincheoreom boyeodo", "Even if it looks like the same daily routine"],
    ["너와 함께라면 특별해져", "Neowa hamkkeramyeon teukbyeolhaejyeo", "If I'm with you it becomes special"],
    ["Regular 변하지 않는 내 마음", "Regular byeonhaji aneun nae maeum", "Regular, my unchanged heart"],
    ["매일 너를 사랑해 Regular", "Maeil neoreul saranghae Regular", "I love you every day, regular"],
    ["Irregular 그래도 네가 있어서", "Irregular geuraedo nega isseoseo", "Irregular, but because you're here"],
    ["내 인생은 특별해", "Nae insaengeun teukbyeolhae", "My life is special"],
    ["Regular Irregular 우리 둘은", "Regular Irregular uri dureun", "Regular irregular, the two of us"],
    ["완벽한 조화야", "Wanbyeokhan johwaya", "Are in perfect harmony"],
    ["Regular 난 오늘도 Regular", "Regular nan oneuldo Regular", "Regular, I'm regular today too"],
    ["너를 생각하는 이 마음은", "Neoreul saenggakhaneun i ma-eumeun", "This heart that thinks of you"],
    ["변함없이 Regular", "Byeonhameobsi Regular", "Is unchangingly regular"],
    ["Regular 규칙적으로 사랑해", "Regular gyuchikjeogeureo saranghae", "Regular, I love you regularly"],
    ["매일 매일 Everyday", "Maeil maeil Everyday", "Every day every day, everyday"],
    ["Regular Irregular 너와 나", "Regular Irregular neowa na", "Regular irregular, you and I"],
    ["우리만의 리듬으로", "Urimanui rideumeureo", "With our own rhythm"],
    ["Regular", "Regular", "Regular"],
  ]);

  const regular = await prisma.song.upsert({
    where: { slug: "nct-127-regular" },
    update: {},
    create: {
      slug: "nct-127-regular",
      title: "Regular",
      albumId: nct127Album1.id,
      releaseYear: 2018,
      ...regularLyrics,
    },
  });

  const kickItLyrics = lyrics([
    ["영웅 나는 영웅", "Yeongung na-neun yeongung", "Hero, I am a hero"],
    ["두려움 없이 나아가는", "Duryeoum eopsi naaganeun", "Advancing without fear"],
    ["영웅 나는 영웅", "Yeongung na-neun yeongung", "Hero, I am a hero"],
    ["이 세상을 구할 영웅", "I sesangeul guhal yeongung", "A hero who will save this world"],
    ["Kick It 발을 굴러봐", "Kick It bareul gulleobwa", "Kick it, stamp your feet"],
    ["Kick It 주먹을 들어봐", "Kick It jumeoguel deureobwa", "Kick it, raise your fists"],
    ["Bruce Lee 처럼 강해져", "Bruce Lee cheoreom ganghaejeoo", "Become strong like Bruce Lee"],
    ["아무것도 두렵지 않아", "Amugeotsdo duryeopji ana", "Nothing is frightening"],
    ["영웅처럼 싸울 거야", "Yeongungcheoreom ssaul geoya", "I'll fight like a hero"],
    ["쓰러지지 않을 거야", "Sseureooji ji aneul geoya", "I won't fall"],
    ["Kick It 앞으로 나아가", "Kick It apeuro naaga", "Kick it, move forward"],
    ["Kick It 포기하지 마", "Kick It pogihaji ma", "Kick it, don't give up"],
    ["나는 멈추지 않아 영웅", "Na-neun meomchuji ana yeongung", "I won't stop, hero"],
    ["끝까지 싸울 거야", "Kkeutkkaji ssaul geoya", "I'll fight to the end"],
    ["Kick It Kick It Kick It", "Kick It Kick It Kick It", "Kick it kick it kick it"],
    ["영웅이 되고 싶어", "Yeongunggi doego sipeo", "I want to become a hero"],
    ["이 세상의 모든 악을 물리칠", "I sesangui modeun ageul mullichil", "A hero who will defeat all the evil in this world"],
    ["영웅이 될 거야", "Yeongunggi doel geoya", "I will become a hero"],
    ["Bruce Lee 내 안에 살아있어", "Bruce Lee nae ane saralisseo", "Bruce Lee is alive inside me"],
    ["두려움을 이겨내는 영웅", "Duryeoeumeul igyeoine-neun yeongung", "A hero who overcomes fear"],
    ["Kick It 강하게 강하게", "Kick It ganghage ganghage", "Kick it, strong strong"],
    ["Kick It 앞으로 앞으로", "Kick It apeuro apeuro", "Kick it, forward forward"],
    ["포기하지 마 절대로", "Pogihaji ma jeoldaero", "Never give up, never"],
    ["영웅 이게 바로 나야", "Yeongung ige baro naya", "Hero, this is exactly me"],
    ["Kick It Kick It Kick It", "Kick It Kick It Kick It", "Kick it kick it kick it"],
    ["나는 영웅이야", "Na-neun yeongungiya", "I am a hero"],
    ["세상을 구할 영웅이야", "Sesangeul guhal yeongungiya", "A hero who will save the world"],
    ["Kick It 나아가 나아가", "Kick It naaga naaga", "Kick it, go forward go forward"],
    ["영웅 나의 이름은 영웅", "Yeongung naui ireumeun yeongung", "Hero, my name is hero"],
    ["Bruce Lee Spirit", "Bruce Lee Spirit", "Bruce Lee spirit"],
    ["Kick It 영웅처럼", "Kick It yeongungcheoreom", "Kick it, like a hero"],
    ["Kick It 영웅이야 나는", "Kick It yeongungiya na-neun", "Kick it, I am a hero"],
  ]);

  const kickIt = await prisma.song.upsert({
    where: { slug: "nct-127-kick-it" },
    update: {},
    create: {
      slug: "nct-127-kick-it",
      title: "Kick It (영웅)",
      albumId: nct127Album1.id,
      releaseYear: 2020,
      ...kickItLyrics,
    },
  });

  const cherryBombLyrics = lyrics([
    ["Cherry Bomb 터져라", "Cherry Bomb tteojyeora", "Cherry bomb, explode"],
    ["내 안에 있는 에너지", "Nae ane inneun enereugi", "The energy inside me"],
    ["Cherry Bomb 폭발해", "Cherry Bomb pokpalhae", "Cherry bomb, explode"],
    ["이 세상을 흔들어놔", "I sesangeul heundeureonnwa", "Shake up this world"],
    ["나는 Cherry Bomb이야", "Na-neun Cherry Bombiya", "I am a cherry bomb"],
    ["터지기 직전의 에너지", "Teojiji jikjeoneui enereugi", "Energy right before exploding"],
    ["폭발 직전 나의 심장이", "Pokpal jikjeon naui simjangi", "Right before explosion my heart"],
    ["Cherry Bomb처럼 터진다", "Cherry Bombcheoreom teojinda", "Explodes like a cherry bomb"],
    ["I'm the biggest hit I know you know", "I'm the biggest hit I know you know", "I'm the biggest hit I know you know"],
    ["터져버린 Cherry Bomb", "Tteojyeobeorin Cherry Bomb", "Exploded cherry bomb"],
    ["Cherry Bomb Cherry Bomb", "Cherry Bomb Cherry Bomb", "Cherry bomb cherry bomb"],
    ["나를 막을 수 없어", "Na-reul mageul su eopseo", "You can't stop me"],
    ["폭발하는 에너지로", "Pokpalhaneun enereugi-ro", "With explosive energy"],
    ["세상을 뒤흔들어 놓을게", "Sesangeul dwiheundeureoneul ge", "I'll shake up the world"],
    ["Cherry Bomb 터져버려", "Cherry Bomb tteojyeobeoryeo", "Cherry bomb, explode"],
    ["가득 차오른 내 안의 에너지가", "Gadeuk chaoreun nae anui enereugi-ga", "The energy inside me filled to the brim"],
    ["폭발하기 직전이야", "Pokpalhagi jikjeoni-ya", "Is right before exploding"],
    ["Cherry Bomb I'm a Cherry Bomb", "Cherry Bomb I'm a Cherry Bomb", "Cherry bomb I'm a cherry bomb"],
    ["터지기 전에 비켜", "Teojigi jeone bikyeo", "Step aside before I explode"],
    ["Cherry Bomb 나의 에너지는", "Cherry Bomb naui enereugi-neun", "Cherry bomb, my energy"],
    ["폭발 직전이야 조심해", "Pokpal jikjeoni-ya josimhae", "Is right before exploding, be careful"],
    ["나는 Cherry Bomb이야", "Na-neun Cherry Bombiya", "I am a cherry bomb"],
    ["터져라 Cherry Bomb", "Tteojyeora Cherry Bomb", "Explode, cherry bomb"],
    ["Cherry Bomb Cherry Bomb Cherry Bomb", "Cherry Bomb Cherry Bomb Cherry Bomb", "Cherry bomb cherry bomb cherry bomb"],
    ["나를 막을 수 없어 절대로", "Na-reul mageul su eopseo jeoldaero", "You absolutely can't stop me"],
    ["Cherry Bomb 폭발한다", "Cherry Bomb pokpalhanda", "Cherry bomb, exploding"],
    ["Cherry Bomb 나야 나", "Cherry Bomb naya na", "Cherry bomb, that's me, me"],
    ["이 에너지 막을 수 없어", "I enereugi mageul su eopseo", "This energy can't be stopped"],
    ["Cherry Bomb Cherry Bomb", "Cherry Bomb Cherry Bomb", "Cherry bomb cherry bomb"],
    ["터져버린 나의 Cherry Bomb", "Tteojyeobeorin naui Cherry Bomb", "My exploded cherry bomb"],
    ["세상이 흔들려 Cherry Bomb", "Sesangi heundellyeo Cherry Bomb", "The world is shaking, cherry bomb"],
    ["Cherry Bomb 나는 Cherry Bomb", "Cherry Bomb na-neun Cherry Bomb", "Cherry bomb, I am a cherry bomb"],
  ]);

  const cherryBomb = await prisma.song.upsert({
    where: { slug: "nct-127-cherry-bomb" },
    update: {},
    create: {
      slug: "nct-127-cherry-bomb",
      title: "Cherry Bomb",
      albumId: nct127Album1.id,
      releaseYear: 2017,
      ...cherryBombLyrics,
    },
  });

  const stickerLyrics = lyrics([
    ["스티커 나는 스티커야", "Seutikeo na-neun seutikeoiya", "Sticker, I am a sticker"],
    ["한번 붙으면 떨어지지 않아", "Hanbeon buteumyeon tteoreojiji ana", "Once stuck, I won't come off"],
    ["스티커처럼 붙어 있어", "Seutikeoocheoreom buteo isseo", "Stuck like a sticker"],
    ["영원히 너와 함께 있고 싶어", "Yeongwonhi neowa hamkke itgo sipeo", "I want to be with you forever"],
    ["Sticker 내가 너에게 붙을게", "Sticker naega neoege buteulge", "Sticker, I'll stick to you"],
    ["어떤 것도 우릴 떼어놓을 수 없어", "Eotteon geotdo uril tteeoneoulsu eopseo", "Nothing can peel us apart"],
    ["스티커 나는 스티커야", "Seutikeo na-neun seutikeoiya", "Sticker, I am a sticker"],
    ["너에게 붙어 있을 거야", "Neoege buteo isseul geoya", "I will be stuck to you"],
    ["Sticker Sticker Sticker", "Sticker Sticker Sticker", "Sticker sticker sticker"],
    ["나는 네 마음에 붙어 있어", "Na-neun ne ma-eume buteo isseo", "I am stuck in your heart"],
    ["영원히 지워지지 않는 스티커", "Yeongwonhi jiweojiji aneun seutikeo", "A sticker that won't be erased forever"],
    ["그게 바로 나야", "Geuge baro naya", "That's exactly me"],
    ["Sticker 네 가슴에 붙어있는", "Sticker ne gaseum-e buteoinnneun", "Sticker, the one stuck on your chest"],
    ["스티커가 바로 나야", "Seutikeo-ga baro naya", "The sticker is exactly me"],
    ["네 마음에 붙어 영원히", "Ne ma-eume buteo yeongwonhi", "Stuck in your heart forever"],
    ["있고 싶어 Sticker", "Itgo sipeo Sticker", "I want to be there, sticker"],
    ["어디를 가도 항상 함께야", "Eodireul gado hangsang hamkkeya", "Wherever you go we're always together"],
    ["스티커처럼 붙어있을 거야", "Seutikeoocheoreom buteoisseur geoya", "I'll be stuck like a sticker"],
    ["Sticker 떨어지지 마", "Sticker tteoreojiji ma", "Sticker, don't come off"],
    ["우리 영원히 함께야", "Uri yeongwonhi hamkkeya", "We're together forever"],
    ["Sticker Sticker나야 나는 Sticker", "Sticker Sticker naya na-neun Sticker", "Sticker sticker, that's me, I am a sticker"],
    ["네 마음에 새겨진 내 이름", "Ne ma-eume saegyeojin nae ireum", "My name engraved in your heart"],
    ["지울 수가 없어 영원히", "Jiul suga eopseo yeongwonhi", "Can't be erased forever"],
    ["Sticker 나는 Sticker야", "Sticker na-neun Stickerya", "Sticker, I am a sticker"],
    ["한번 붙으면 그게 전부야", "Hanbeon buteumyeon geuge jeonbuya", "Once stuck, that's everything"],
    ["스티커 스티커 스티커", "Seutikeo seutikeo seutikeo", "Sticker sticker sticker"],
    ["나는 네 마음의 스티커야", "Na-neun ne ma-eumui seutikeoiya", "I am the sticker of your heart"],
    ["Sticker 영원히 영원히", "Sticker yeongwonhi yeongwonhi", "Sticker, forever forever"],
    ["네 가슴에 붙어있을게", "Ne gaseum-e buteo-isseulge", "I'll be stuck to your chest"],
    ["Sticker Sticker Sticker", "Sticker Sticker Sticker", "Sticker sticker sticker"],
    ["나는 영원한 너의 Sticker", "Na-neun yeongwonhan neoui Sticker", "I am your forever sticker"],
    ["Sticker 나야 나", "Sticker naya na", "Sticker, that's me, me"],
  ]);

  const sticker = await prisma.song.upsert({
    where: { slug: "nct-127-sticker" },
    update: {},
    create: {
      slug: "nct-127-sticker",
      title: "Sticker (스티커)",
      albumId: nct127Album2.id,
      releaseYear: 2021,
      ...stickerLyrics,
    },
  });

  // NCT 127 credits
  for (const song of [regular, kickIt, cherryBomb, sticker]) {
    await prisma.songCredit.upsert({
      where: { id: `credit-${song.slug}-nct-127` },
      update: {},
      create: { id: `credit-${song.slug}-nct-127`, songId: song.id, artistId: nct127.id, role: "performer" },
    });
  }

  console.log("✅ seed-kpop-groups: MAMAMOO(+3) | Red Velvet(+1) | ITZY(+2) | EXO(+1) | NCT 127(+1)");
}
