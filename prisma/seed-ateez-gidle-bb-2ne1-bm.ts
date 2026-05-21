import { PrismaClient } from "@prisma/client";

function lyrics(lines: [string, string, string][]): { lyricsKo: string; lyricsRomanized: string; lyricsEn: string } {
  return {
    lyricsKo: lines.map(l => l[0]).join("\n"),
    lyricsRomanized: lines.map(l => l[1]).join("\n"),
    lyricsEn: lines.map(l => l[2]).join("\n"),
  };
}

export async function seed(prisma: PrismaClient): Promise<void> {
  const kq   = await prisma.label.findFirst({ where: { slug: "kq-entertainment" } });
  const cube = await prisma.label.findFirst({ where: { slug: "cube-entertainment" } });
  const yg   = await prisma.label.findFirst({ where: { slug: "yg-entertainment" } });
  const edam = await prisma.label.upsert({
    where: { slug: "edam-entertainment" },
    update: {},
    create: { slug: "edam-entertainment", name: "EDAM Entertainment", country: "South Korea", foundedYear: 2019, website: "edamcompany.com", bio: "EDAM Entertainment is a South Korean agency that manages IU (Lee Ji-eun), one of Korea's most beloved singer-songwriters and actresses." },
  });
  const jyp = await prisma.label.findFirst({ where: { slug: "jyp-entertainment" } });

  // ── ATEEZ — additional songs ───────────────────────────────────────────────
  const ateez = await prisma.artist.upsert({
    where: { slug: "ateez" }, update: {},
    create: {
      slug: "ateez", type: "GROUP", stageName: "ATEEZ", debutYear: 2018, labelId: kq?.id,
      bio: "ATEEZ (에이티즈) is an eight-member boy group from KQ Entertainment known for explosive theatrical performances and the 'Treasure' universe lore.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ATEEZ_at_2023_MAMA_Awards.jpg/960px-ATEEZ_at_2023_MAMA_Awards.jpg",
    },
  });

  const ateezWooyoungAlbum = await prisma.album.upsert({
    where: { slug: "ateez-the-world-ep2-outlaw" }, update: {},
    create: { slug: "ateez-the-world-ep2-outlaw", title: "THE WORLD EP.2 : OUTLAW", artistId: ateez.id, releaseYear: 2022, type: "EP", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/ATEEZ_-_The_World_EP.2_Outlaw.png/220px-ATEEZ_-_The_World_EP.2_Outlaw.png" },
  });
  const ateezSeasonOfFall = await prisma.album.upsert({
    where: { slug: "ateez-spin-off-from-the-witness" }, update: {},
    create: { slug: "ateez-spin-off-from-the-witness", title: "SPIN OFF : FROM THE WITNESS", artistId: ateez.id, releaseYear: 2022, type: "EP", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/3/31/ATEEZ_-_Spin_Off_from_the_Witness.png/220px-ATEEZ_-_Spin_Off_from_the_Witness.png" },
  });

  await prisma.song.upsert({
    where: { slug: "ateez-halazia" }, update: {},
    create: { slug: "ateez-halazia", title: "HALAZIA", albumId: ateezWooyoungAlbum.id, releaseYear: 2022, viewCount: 93000, coverArt: ateezWooyoungAlbum.coverArt,
      ...lyrics([
        ["별빛이 가득한 하늘 아래", "Byeolbichi gadeukhan haneul arae", "Under the sky full of starlight"],
        ["우린 함께 걸어가고 있어", "Urin hamkke georeogago isseo", "We are walking together"],
        ["어둠도 두렵지 않아 네가 있으니", "Eodumdo duryeopji ana nega isseuni", "I'm not afraid of the darkness because you're here"],
        ["", "", ""],
        ["HALAZIA, HALAZIA", "HALAZIA, HALAZIA", "HALAZIA, HALAZIA"],
        ["빛나는 저 별처럼", "Binnaneun jeo byeolcheoreom", "Like those shining stars"],
        ["우리 함께 빛나자", "Uri hamkke binnaja", "Let's shine together"],
        ["HALAZIA, HALAZIA", "HALAZIA, HALAZIA", "HALAZIA, HALAZIA"],
        ["", "", ""],
        ["지쳐도 포기하지 마", "Jichyeodo pogihaji ma", "Even when exhausted, don't give up"],
        ["끝이 보이지 않아도", "Kkeuti boyiji anado", "Even when the end isn't in sight"],
        ["우린 빛을 향해 달려가고 있어", "Urin biteul hyanghae dallyeogago isseo", "We are running toward the light"],
        ["", "", ""],
        ["이 순간이 영원하기를", "I sungani yeongwonhagireul", "I wish this moment could last forever"],
        ["함께라면 뭐든 할 수 있어", "Hamkkeoramyeon mwodeun hal su isseo", "Together we can do anything"],
        ["HALAZIA, shine forever", "HALAZIA, shine forever", "HALAZIA, shine forever"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-ateez-halazia-ateez" },
    update: {}, create: { id: "credit-ateez-halazia-ateez", songId: (await prisma.song.findUnique({ where: { slug: "ateez-halazia" } }))!.id, artistId: ateez.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "ateez-crazy-form" }, update: {},
    create: { slug: "ateez-crazy-form", title: "Crazy Form (미친 폼)", albumId: ateezWooyoungAlbum.id, releaseYear: 2022, viewCount: 88000, coverArt: ateezWooyoungAlbum.coverArt,
      ...lyrics([
        ["우린 지금 미친 폼", "Urin jigeum michin pom", "We're in crazy form right now"],
        ["세상이 다 놀라게 해줄게", "Sesangi da nollage haejulge", "We'll make the whole world surprised"],
        ["두려움 없이 나아가", "Duryeoum eopsi naaga", "Moving forward without fear"],
        ["", "", ""],
        ["불을 지펴라, 불을 지펴라", "Bureul jipyeora, bureul jipyeora", "Light the fire, light the fire"],
        ["세상을 뒤집어라", "Sesangeul duijibeotra", "Turn the world upside down"],
        ["우리가 만드는 전설", "Uriga mandeuneun jeonseol", "The legend we're creating"],
        ["지금 여기서 시작해", "Jigeum yeogiseo sijakhae", "Starting right here, right now"],
        ["", "", ""],
        ["Crazy form, crazy form", "Crazy form, crazy form", "Crazy form, crazy form"],
        ["우린 달라 남들과는", "Urin dalla namdeulgwaneun", "We're different from the others"],
        ["우리만의 색깔로", "Urimaneui saekkkallo", "With our own colors"],
        ["세상에 물들여", "Sesange muldeullyeo", "We paint the world"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-ateez-crazy-form-ateez" },
    update: {}, create: { id: "credit-ateez-crazy-form-ateez", songId: (await prisma.song.findUnique({ where: { slug: "ateez-crazy-form" } }))!.id, artistId: ateez.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "ateez-the-real" }, update: {},
    create: { slug: "ateez-the-real", title: "The Real (작전명 스트라이커)", albumId: ateezSeasonOfFall.id, releaseYear: 2022, viewCount: 79000, coverArt: ateezSeasonOfFall.coverArt,
      ...lyrics([
        ["작전명은 스트라이커", "Jakjeonmyeongeun seuteuraika", "Operation name: Striker"],
        ["우린 진짜 시작해", "Urin jinjja sijakhae", "We're really starting now"],
        ["이건 진짜야, The real", "Igeon jinjjaya, The real", "This is real, The real"],
        ["", "", ""],
        ["앞만 보고 달려가", "Ammane bogo dallyeoga", "Run forward looking only ahead"],
        ["멈출 수 없어 절대로", "Meomchul su eopseo jeoldaero", "I can never stop, absolutely"],
        ["포기란 없어 우리에겐", "Pogiran eopseo uriegene", "There's no giving up for us"],
        ["", "", ""],
        ["The real, 진짜를 보여줄게", "The real, jinjjareul boyeojulge", "The real, I'll show you the real thing"],
        ["우리가 바로 그 주인공", "Uriga baro geu juingong", "We are the protagonists"],
        ["세상의 중심에서 외쳐", "Sesangui jungsimseo oechyeo", "Shouting from the center of the world"],
        ["우린 The real, The real", "Urin The real, The real", "We are The real, The real"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-ateez-the-real-ateez" },
    update: {}, create: { id: "credit-ateez-the-real-ateez", songId: (await prisma.song.findUnique({ where: { slug: "ateez-the-real" } }))!.id, artistId: ateez.id, role: "PRIMARY" },
  });

  // ── (G)I-DLE — additional songs ────────────────────────────────────────────
  const gidle = await prisma.artist.upsert({
    where: { slug: "g-i-dle" }, update: {},
    create: {
      slug: "g-i-dle", type: "GROUP", stageName: "(G)I-DLE", debutYear: 2018, labelId: cube?.id,
      bio: "(G)I-DLE is a self-producing girl group led by Soyeon, known for fierce versatility.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/%28G%29I-DLE_at_the_2022_MAMA_Awards.jpg/960px-%28G%29I-DLE_at_the_2022_MAMA_Awards.jpg",
    },
  });

  const gidleOhMyGodAlbum = await prisma.album.upsert({
    where: { slug: "g-i-dle-i-trust" }, update: {},
    create: { slug: "g-i-dle-i-trust", title: "I trust", artistId: gidle.id, releaseYear: 2020, type: "EP", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/3/34/%28G%29I-DLE_-_I_trust.png/220px-%28G%29I-DLE_-_I_trust.png" },
  });
  const gidleSuperLadyAlbum = await prisma.album.upsert({
    where: { slug: "g-i-dle-2" }, update: {},
    create: { slug: "g-i-dle-2", title: "2", artistId: gidle.id, releaseYear: 2023, type: "EP", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/7/76/%28G%29I-DLE_-_2.png/220px-%28G%29I-DLE_-_2.png" },
  });

  await prisma.song.upsert({
    where: { slug: "g-i-dle-oh-my-god" }, update: {},
    create: { slug: "g-i-dle-oh-my-god", title: "Oh my god", albumId: gidleOhMyGodAlbum.id, releaseYear: 2020, viewCount: 94000, coverArt: gidleOhMyGodAlbum.coverArt,
      ...lyrics([
        ["신이여 저를 버리셨나요", "Siniyeo jeoreul beorisyeonnayo", "God, have you abandoned me"],
        ["제 기도는 닿지 않아요", "Je gidoneun daji anayo", "My prayers don't reach you"],
        ["아무것도 보이지 않아요", "Amugeotdo boyiji anayo", "I can't see anything"],
        ["Oh my god, Oh my god", "Oh my god, Oh my god", "Oh my god, Oh my god"],
        ["", "", ""],
        ["검은 하늘 아래서 나 홀로", "Geomeun haneul araeseo na hollo", "Alone under a black sky"],
        ["나를 향한 저주가 내려와", "Nareul hyanghan jeojuga naeryeowa", "A curse aimed at me descends"],
        ["빠져나갈 수 없는 미로 속에서", "Ppajyeonagal su eomneun miro sogeseo", "Inside a maze I can't escape"],
        ["Oh my god, 나를 구해줘", "Oh my god, nareul guhaejweo", "Oh my god, save me"],
        ["", "", ""],
        ["피어나는 꽃잎처럼 나도", "Pieoaneun kkochiptheoreom nado", "Like a blooming petal, I too"],
        ["언젠간 빛날 거라 믿어", "Eonjengan binal geora midyeo", "Believe someday I will shine"],
        ["Oh my god, Oh my god", "Oh my god, Oh my god", "Oh my god, Oh my god"],
        ["이 밤이 지나고 나면", "I bami jinago namyeon", "When this night passes"],
        ["반드시 아침이 올 거야", "Bandeusi achimi ol geoya", "Morning will surely come"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-g-i-dle-oh-my-god-gidle" },
    update: {}, create: { id: "credit-g-i-dle-oh-my-god-gidle", songId: (await prisma.song.findUnique({ where: { slug: "g-i-dle-oh-my-god" } }))!.id, artistId: gidle.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "g-i-dle-super-lady" }, update: {},
    create: { slug: "g-i-dle-super-lady", title: "Super Lady", albumId: gidleSuperLadyAlbum.id, releaseYear: 2023, viewCount: 86000, coverArt: gidleSuperLadyAlbum.coverArt,
      ...lyrics([
        ["나는 슈퍼레이디", "Naneun syupeolaedi", "I am a Super Lady"],
        ["세상을 내 손에 쥐고", "Sesangeul nae sone jwigo", "The world in my hands"],
        ["내 페이스대로 살아가", "Nae peiseudeaero salagya", "Living at my own pace"],
        ["", "", ""],
        ["Super Lady, Super Lady", "Super Lady, Super Lady", "Super Lady, Super Lady"],
        ["나를 막을 건 아무것도 없어", "Nareul mageul geon amugeotzdo eopseo", "Nothing can stop me"],
        ["내가 원하는 건 내가 가져", "Naega wonhaneun geon naega gajyeo", "I take what I want"],
        ["", "", ""],
        ["두려움 없이 앞으로 나아가", "Duryeoum eopsi apeuro naaga", "Moving forward without fear"],
        ["세상이 뭐라 해도 상관없어", "Sesangi mwora haedo sanggwaneopseo", "I don't care what the world says"],
        ["Super Lady, 나야", "Super Lady, naya", "Super Lady, that's me"],
        ["이건 내 스토리", "Igeon nae seutori", "This is my story"],
        ["", "", ""],
        ["왕관을 써라, 이건 내 시간", "Wangwaneul sseora, igeon nae sigan", "Wear the crown, this is my time"],
        ["누가 뭐래도 나는 나야", "Nuga mworaedo naneun naya", "No matter what anyone says, I'm me"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-g-i-dle-super-lady-gidle" },
    update: {}, create: { id: "credit-g-i-dle-super-lady-gidle", songId: (await prisma.song.findUnique({ where: { slug: "g-i-dle-super-lady" } }))!.id, artistId: gidle.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "g-i-dle-villain-dies" }, update: {},
    create: { slug: "g-i-dle-villain-dies", title: "Villain Dies", albumId: gidleSuperLadyAlbum.id, releaseYear: 2023, viewCount: 74000, coverArt: gidleSuperLadyAlbum.coverArt,
      ...lyrics([
        ["악당은 결국 죽는 거야", "Akdangeun gyeolguk jungneun geoya", "The villain always dies in the end"],
        ["그게 이야기의 법칙이잖아", "Geuge iyagieui beopchigigjanha", "That's the rule of the story"],
        ["넌 나쁜 역할을 맡았으니", "Neon nappeun yeokhal-eul matasseuni", "Since you took on the villain's role"],
        ["당연히 지는 거야", "Dangyeonhi jineun geoya", "Of course you'll lose"],
        ["", "", ""],
        ["이건 해피엔딩이야", "Igeon haepiendingiya", "This is a happy ending"],
        ["내가 주인공이니까", "Naega juingonginikka", "Because I am the protagonist"],
        ["Villain dies, villain dies", "Villain dies, villain dies", "Villain dies, villain dies"],
        ["결국엔 내가 이겨", "Gyeolgugen naega igyeo", "I win in the end"],
        ["", "", ""],
        ["두려워하지 마 네 운명을", "Duryeowohaji ma ne unmyeongeul", "Don't fear your fate"],
        ["이건 이미 정해진 결말", "Igeon imi jeonghaejin gyeolmal", "This is an already-determined ending"],
        ["악당은 항상 지는 거야", "Akdangeun hangsang jineun geoya", "The villain always loses"],
        ["그게 이야기의 룰", "Geuge iyagieui rul", "That's the rule of the story"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-g-i-dle-villain-dies-gidle" },
    update: {}, create: { id: "credit-g-i-dle-villain-dies-gidle", songId: (await prisma.song.findUnique({ where: { slug: "g-i-dle-villain-dies" } }))!.id, artistId: gidle.id, role: "PRIMARY" },
  });

  // ── BIGBANG — additional songs ─────────────────────────────────────────────
  const bigbang = await prisma.artist.upsert({
    where: { slug: "bigbang" }, update: {},
    create: {
      slug: "bigbang", type: "GROUP", stageName: "BIGBANG", debutYear: 2006, labelId: yg?.id,
      bio: "BIGBANG is a legendary five-member boy group from YG Entertainment, pioneers of hip-hop idol music.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/BIGBANG_at_2022_MAMA_Awards_%28cropped%29.jpg/960px-BIGBANG_at_2022_MAMA_Awards_%28cropped%29.jpg",
    },
  });

  const bbAlbumHeart = await prisma.album.upsert({
    where: { slug: "bigbang-a" }, update: {},
    create: { slug: "bigbang-a", title: "A", artistId: bigbang.id, releaseYear: 2007, type: "Single Album", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1f/BIGBANG_-_A.png/220px-BIGBANG_-_A.png" },
  });
  const bbLastDanceAlbum = await prisma.album.upsert({
    where: { slug: "bigbang-0-to-10" }, update: {},
    create: { slug: "bigbang-0-to-10", title: "BIGBANG 0.TO.10 THE FINAL IN SEOUL", artistId: bigbang.id, releaseYear: 2017, type: "Album", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/BIGBANG_-_MADE.png/220px-BIGBANG_-_MADE.png" },
  });

  await prisma.song.upsert({
    where: { slug: "bigbang-lies" }, update: {},
    create: { slug: "bigbang-lies", title: "거짓말 (Lies)", albumId: bbAlbumHeart.id, releaseYear: 2007, viewCount: 108000, coverArt: bbAlbumHeart.coverArt,
      ...lyrics([
        ["거짓말이야 거짓말이야", "Geojinmariya geojinmariya", "It's a lie, it's a lie"],
        ["니가 날 사랑한다고 한 그 말이 다", "Niga nal saranghanda go han geu mari da", "Everything you said about loving me"],
        ["거짓말이야 거짓말이야", "Geojinmariya geojinmariya", "Is a lie, is a lie"],
        ["", "", ""],
        ["이미 늦었어 돌이킬 수 없잖아", "Imi neujeosseo dolikiil su eopsjana", "It's too late, we can't turn back"],
        ["왜 이제 와서 그런 말을 해", "Wae ije waseo geureon mareul hae", "Why are you saying that now"],
        ["넌 날 망쳐놨어", "Neon nal mangchyeonnwasseo", "You've ruined me"],
        ["", "", ""],
        ["거짓말이야, I can't believe", "Geojinmariya, I can't believe", "It's a lie, I can't believe"],
        ["니가 날 사랑한다는 그 말이", "Niga nal saranghanda neun geu mari", "That you said you loved me"],
        ["거짓말이야, I can't believe", "Geojinmariya, I can't believe", "Is a lie, I can't believe"],
        ["이 모든 게 다 거짓이었어", "I modeunge da geojisieosseo", "All of this was a lie"],
        ["", "", ""],
        ["우리의 사랑이 끝났어", "Urieui sarangi kkeunnasseo", "Our love is over"],
        ["하지만 난 여전히 너를 원해", "Hajiman nan yeojeonhi neoreul wonhae", "But I still want you"],
        ["이게 말이 돼", "Ige mari dwae", "Does this make sense"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-bigbang-lies-bigbang" },
    update: {}, create: { id: "credit-bigbang-lies-bigbang", songId: (await prisma.song.findUnique({ where: { slug: "bigbang-lies" } }))!.id, artistId: bigbang.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "bigbang-last-dance" }, update: {},
    create: { slug: "bigbang-last-dance", title: "LAST DANCE", albumId: bbLastDanceAlbum.id, releaseYear: 2017, viewCount: 96000, coverArt: bbLastDanceAlbum.coverArt,
      ...lyrics([
        ["마지막 춤을 춰줘", "Majimak chumeul chwojweo", "Dance the last dance with me"],
        ["이게 마지막이라면", "Ige majimangiraymyeon", "If this is the last time"],
        ["한 번만 더 안아줘", "Han beonman deo anajweo", "Hold me one more time"],
        ["", "", ""],
        ["LAST DANCE, LAST DANCE", "LAST DANCE, LAST DANCE", "LAST DANCE, LAST DANCE"],
        ["우리의 마지막 밤", "Urieui majimak bam", "Our last night"],
        ["이 순간이 멈춰주길", "I sungani meomchwojugil", "I wish this moment would stop"],
        ["", "", ""],
        ["시간이 흘러도 잊지 마", "Sigani heulleoodo itji ma", "Even as time passes, don't forget"],
        ["우리가 함께했던 모든 것들", "Uriga hamkkehaesseon modeun geotdeul", "Everything we shared together"],
        ["Last dance, 너와 나", "Last dance, neowa na", "Last dance, you and me"],
        ["이 기억만은 영원히", "I gieokmaneun yeongwonhi", "Only these memories forever"],
        ["", "", ""],
        ["헤어지기 싫어도", "Heeojigi sireodo", "Even though I don't want to say goodbye"],
        ["이게 마지막이라는 걸 알아", "Ige majimagiramneun geol ara", "I know this is the last time"],
        ["LAST DANCE, 안녕", "LAST DANCE, annyeong", "LAST DANCE, goodbye"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-bigbang-last-dance-bigbang" },
    update: {}, create: { id: "credit-bigbang-last-dance-bigbang", songId: (await prisma.song.findUnique({ where: { slug: "bigbang-last-dance" } }))!.id, artistId: bigbang.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "bigbang-sober" }, update: {},
    create: { slug: "bigbang-sober", title: "Sober (맨정신)", albumId: bbLastDanceAlbum.id, releaseYear: 2015, viewCount: 84000, coverArt: bbLastDanceAlbum.coverArt,
      ...lyrics([
        ["맨정신으로 어떻게 해", "Maenjeongsinero eotteoke hae", "How can I do this sober"],
        ["니가 없는 이 세상을", "Niga eomneun i sesangeul", "In this world without you"],
        ["맨정신으로 어떻게 살아", "Maenjeongsinero eotteoke sara", "How can I live sober"],
        ["", "", ""],
        ["Sober, sober", "Sober, sober", "Sober, sober"],
        ["정신을 차릴 수가 없어", "Jeongsineul charil suga eopseo", "I can't come to my senses"],
        ["너 없이는 아무것도 안 돼", "Neo eopsineun amugeotdo an dwae", "Nothing works without you"],
        ["", "", ""],
        ["술을 마셔도 취하지 않아", "Sureul masyeodo chwihaji ana", "Even when I drink I can't get drunk"],
        ["너를 잊으려 해도 안 돼", "Neoreul ijeuryeo haedo an dwae", "I can't forget you"],
        ["Sober, 맨정신이야", "Sober, maenjeongsiniya", "Sober, I'm stone cold sober"],
        ["이게 더 힘들어", "Ige deo himneureo", "This is even harder"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-bigbang-sober-bigbang" },
    update: {}, create: { id: "credit-bigbang-sober-bigbang", songId: (await prisma.song.findUnique({ where: { slug: "bigbang-sober" } }))!.id, artistId: bigbang.id, role: "PRIMARY" },
  });

  // ── 2NE1 — additional songs ────────────────────────────────────────────────
  const twone = await prisma.artist.upsert({
    where: { slug: "2ne1" }, update: {},
    create: {
      slug: "2ne1", type: "GROUP", stageName: "2NE1", debutYear: 2009, labelId: yg?.id,
      bio: "2NE1 were pioneers of girl crush concept in K-pop, active from 2009–2016.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/2NE1_at_2014_MAMA_Awards_%28cropped%29.jpg/960px-2NE1_at_2014_MAMA_Awards_%28cropped%29.jpg",
    },
  });

  const twoneToAnyone = await prisma.album.upsert({
    where: { slug: "2ne1-to-anyone" }, update: {},
    create: { slug: "2ne1-to-anyone", title: "To Anyone", artistId: twone.id, releaseYear: 2010, type: "Album", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/2NE1_-_To_Anyone.png/220px-2NE1_-_To_Anyone.png" },
  });
  const twoneAlive = await prisma.album.upsert({
    where: { slug: "2ne1-2ne1" }, update: {},
    create: { slug: "2ne1-2ne1", title: "2NE1", artistId: twone.id, releaseYear: 2012, type: "Album", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a5/2NE1_-_2NE1_%282012%29.png/220px-2NE1_-_2NE1_%282012%29.png" },
  });

  await prisma.song.upsert({
    where: { slug: "2ne1-cant-nobody" }, update: {},
    create: { slug: "2ne1-cant-nobody", title: "CAN'T NOBODY", albumId: twoneToAnyone.id, releaseYear: 2010, viewCount: 88000, coverArt: twoneToAnyone.coverArt,
      ...lyrics([
        ["Can't nobody, can't nobody", "Can't nobody, can't nobody", "Can't nobody, can't nobody"],
        ["우릴 막을 수 없어", "Uril mageul su eopseo", "Nobody can stop us"],
        ["Can't nobody hold us down", "Can't nobody hold us down", "Can't nobody hold us down"],
        ["우린 최강이야", "Urin choegangia", "We are the strongest"],
        ["", "", ""],
        ["2NE1이 돌아왔어", "2NE1i dorawasseo", "2NE1 is back"],
        ["준비됐어 세상아", "Junbidwaesseo sesanga", "Are you ready, world"],
        ["우리가 원하는 건 다 가져", "Uriga wonhaneun geon da gajyeo", "We take everything we want"],
        ["", "", ""],
        ["나쁜 년들이 왔어", "Nappeun nyeondeuri wasseo", "The bad girls are here"],
        ["세상을 뒤집을 거야", "Sesangeul dwijipeul geoya", "We're going to turn the world upside down"],
        ["Can't nobody, nobody, nobody", "Can't nobody, nobody, nobody", "Can't nobody, nobody, nobody"],
        ["막을 사람 없어", "Mageul saram eopseo", "No one can stop this"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-2ne1-cant-nobody-2ne1" },
    update: {}, create: { id: "credit-2ne1-cant-nobody-2ne1", songId: (await prisma.song.findUnique({ where: { slug: "2ne1-cant-nobody" } }))!.id, artistId: twone.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "2ne1-missing-you" }, update: {},
    create: { slug: "2ne1-missing-you", title: "그리워해요 (Missing You)", albumId: twoneAlive.id, releaseYear: 2012, viewCount: 81000, coverArt: twoneAlive.coverArt,
      ...lyrics([
        ["그리워해요, 그리워해요", "Geuriwohaeyo, geuriwohaeyo", "I miss you, I miss you"],
        ["당신이 너무 보고 싶어요", "Dangsini neomu bogo sipeoyo", "I miss you so much"],
        ["하루에도 수백 번", "Haruedo subaek beon", "Hundreds of times a day"],
        ["당신 생각이 나요", "Dangsin saenggagi nayo", "I think of you"],
        ["", "", ""],
        ["이 세상 어딘가에서", "I sesang eodigaseo", "Somewhere in this world"],
        ["당신도 날 그리워하길", "Dangsindo nal geuriwohagil", "I hope you miss me too"],
        ["행복하게 잘 지내길", "Haengbokhage jal jinaegil", "I hope you're doing well and happy"],
        ["", "", ""],
        ["Missing you, missing you", "Missing you, missing you", "Missing you, missing you"],
        ["가슴이 너무 아파요", "Gaseumi neomu apayo", "My heart aches so much"],
        ["그리워해요, 그리워해요", "Geuriwohaeyo, geuriwohaeyo", "I miss you, I miss you"],
        ["당신이 너무 그리워요", "Dangsini neomu geuriwoya", "I miss you so much"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-2ne1-missing-you-2ne1" },
    update: {}, create: { id: "credit-2ne1-missing-you-2ne1", songId: (await prisma.song.findUnique({ where: { slug: "2ne1-missing-you" } }))!.id, artistId: twone.id, role: "PRIMARY" },
  });

  // ── BABYMONSTER — additional songs ─────────────────────────────────────────
  const babymonster = await prisma.artist.upsert({
    where: { slug: "babymonster" }, update: {},
    create: {
      slug: "babymonster", type: "GROUP", stageName: "BABYMONSTER", debutYear: 2023, labelId: yg?.id,
      bio: "BABYMONSTER is a seven-member girl group from YG Entertainment debuting in 2023.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/BABYMONSTER_at_2024_SBS_Gayo_Daejeon.jpg/960px-BABYMONSTER_at_2024_SBS_Gayo_Daejeon.jpg",
    },
  });

  const bmForeverAlbum = await prisma.album.upsert({
    where: { slug: "babymonster-forever" }, update: {},
    create: { slug: "babymonster-forever", title: "FOREVER", artistId: babymonster.id, releaseYear: 2024, type: "Single Album", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5d/BABYMONSTER_-_Forever.png/220px-BABYMONSTER_-_Forever.png" },
  });

  await prisma.song.upsert({
    where: { slug: "babymonster-forever" }, update: {},
    create: { slug: "babymonster-forever", title: "FOREVER", albumId: bmForeverAlbum.id, releaseYear: 2024, viewCount: 77000, coverArt: bmForeverAlbum.coverArt,
      ...lyrics([
        ["영원히 함께할 거야", "Yeongwonhi hamkkaehal geoya", "We'll be together forever"],
        ["이 약속 절대 변하지 않아", "I yakssok jeoldae byeonhaji ana", "This promise will never change"],
        ["Forever, forever", "Forever, forever", "Forever, forever"],
        ["네 곁에 있을게", "Ne gyeote isseulge", "I'll stay by your side"],
        ["", "", ""],
        ["시간이 흘러도 우린 하나야", "Sigani heulleoodo urin hanaya", "Even as time passes, we are one"],
        ["어떤 폭풍이 와도 함께 서서", "Eotteon pokpungi wado hamkke seoseo", "Standing together through any storm"],
        ["FOREVER, 우린 영원해", "FOREVER, urin yeongwonhae", "FOREVER, we are eternal"],
        ["", "", ""],
        ["뭐가 달라져도 변하지 않아", "Mwoga dallajyeodo byeonhaji ana", "Whatever changes, this won't"],
        ["우리의 이 순간은", "Urieui i sunganeun", "This moment of ours"],
        ["Forever and ever", "Forever and ever", "Forever and ever"],
        ["영원히 빛날 거야", "Yeongwonhi binal geoya", "Will shine forever"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-babymonster-forever-babymonster" },
    update: {}, create: { id: "credit-babymonster-forever-babymonster", songId: (await prisma.song.findUnique({ where: { slug: "babymonster-forever" } }))!.id, artistId: babymonster.id, role: "PRIMARY" },
  });

  // ── IU (이지은) — new artist ───────────────────────────────────────────────
  const iu = await prisma.artist.upsert({
    where: { slug: "iu" }, update: {},
    create: {
      slug: "iu", type: "MEMBER", stageName: "IU", realName: "Lee Ji-eun", debutYear: 2008, labelId: edam.id,
      bio: "IU (이지은) is South Korea's most beloved solo singer-songwriter and actress. Debuting in 2008 at age 15, she has become a national treasure known for her crystalline voice, introspective songwriting, and decades-spanning discography. Her album 'Palette' (2017) and single 'Celebrity' (2021) cemented her as K-pop's reigning queen of emotional pop.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/IU_at_2022_Golden_Disc_Awards_%28cropped%29.jpg/960px-IU_at_2022_Golden_Disc_Awards_%28cropped%29.jpg",
    },
  });

  const iuGoodDayAlbum = await prisma.album.upsert({
    where: { slug: "iu-real" }, update: {},
    create: { slug: "iu-real", title: "Real", artistId: iu.id, releaseYear: 2010, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/2/24/IU_-_Real.png/220px-IU_-_Real.png" },
  });
  const iuPaletteAlbum = await prisma.album.upsert({
    where: { slug: "iu-palette" }, update: {},
    create: { slug: "iu-palette", title: "Palette", artistId: iu.id, releaseYear: 2017, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/5/5b/IU_-_Palette.png/220px-IU_-_Palette.png" },
  });
  const iuLilacAlbum = await prisma.album.upsert({
    where: { slug: "iu-lilac" }, update: {},
    create: { slug: "iu-lilac", title: "LILAC", artistId: iu.id, releaseYear: 2021, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/3/31/IU_-_LILAC.png/220px-IU_-_LILAC.png" },
  });

  await prisma.song.upsert({
    where: { slug: "iu-good-day" }, update: {},
    create: { slug: "iu-good-day", title: "좋은 날 (Good Day)", albumId: iuGoodDayAlbum.id, releaseYear: 2010, viewCount: 134000, coverArt: iuGoodDayAlbum.coverArt,
      ...lyrics([
        ["나는 오늘 하루도 그댈 그리다", "Naneun oneul harudon geudael geurida", "I spend today missing you again"],
        ["설레는 맘에 눈도 못 감아", "Seolleneun mame nundo mot gama", "My fluttering heart won't let me sleep"],
        ["혹시나 하는 맘에 또 창문 앞에 서서", "Hoksina haneun mame tto changmun ape seoseo", "Standing by the window on the off chance"],
        ["오늘도 기다리다 해가 지네요", "Oneuldo gidarida haega jineyo", "Today again the sun sets as I wait"],
        ["", "", ""],
        ["좋은 날이야 오늘도", "Joheun nariya oneuldo", "It's a good day today too"],
        ["그댈 생각하면서", "Geudael saengakhamyeonseo", "While thinking of you"],
        ["이렇게 두근두근 설레는 거잖아", "Ireoke dugeundugeun seolleneun geojana", "My heart flutters like this"],
        ["", "", ""],
        ["나는 네가 좋아 너무 좋아", "Naneun nega joa neomu joa", "I like you, I like you so much"],
        ["이 세상 모든 걸 줄 수 있어", "I sesang modeun geol jul su isseo", "I could give you everything in this world"],
        ["그냥 나를 바라봐줘", "Geunyang nareul barabwajweo", "Just look at me"],
        ["눈이 마주치면 돼", "Nuni majuchimyeon dwae", "Our eyes just need to meet"],
        ["", "", ""],
        ["좋은 날이야, 오늘은", "Joheun nariya, oneureun", "It's a good day today"],
        ["네가 내 곁에 있으니", "Nega nae gyeote isseuni", "Because you are by my side"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-iu-good-day-iu" },
    update: {}, create: { id: "credit-iu-good-day-iu", songId: (await prisma.song.findUnique({ where: { slug: "iu-good-day" } }))!.id, artistId: iu.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "iu-palette" }, update: {},
    create: { slug: "iu-palette", title: "팔레트 (Palette)", albumId: iuPaletteAlbum.id, releaseYear: 2017, viewCount: 121000, coverArt: iuPaletteAlbum.coverArt,
      ...lyrics([
        ["이제 좋아 스물다섯이 된 나", "Ije joa seumuldaseoisi doen na", "I like it now, me at twenty-five"],
        ["더 이상 내가 뭔지 찾지 않아도 돼", "Deo isang naega mwonji chatji anado dwae", "I don't have to search for what I am anymore"],
        ["내가 뭘 좋아하는지 뭘 싫어하는지", "Naega mwol joahaneunjii mwol sireohaneunji", "What I like, what I dislike"],
        ["대충은 알 것 같아", "Daechungeun al geot gata", "I think I roughly know"],
        ["", "", ""],
        ["나는 내가 좋아", "Naneun naega joa", "I like myself"],
        ["있는 그대로의 나를", "Inneun geudaeroeui nareul", "The me as I am"],
        ["Palette, palette", "Palette, palette", "Palette, palette"],
        ["나의 색으로 칠할게", "Naui saegeullo chilhalge", "I'll paint it in my own color"],
        ["", "", ""],
        ["이제 알아 남들의 눈치 보지 않아도 돼", "Ije ara namdeueui nunchi boji anado dwae", "I know now, I don't need to worry about others' opinions"],
        ["이게 나야, 이게 나야", "Ige naya, ige naya", "This is me, this is me"],
        ["내 팔레트에 그림 그려나가", "Nae palletee geurim geuryeonaga", "I'll paint on my palette"],
        ["", "", ""],
        ["스물다섯은 참 좋아", "Seumuldaseouen cham joa", "Twenty-five is really good"],
        ["내 색깔대로 살 수 있어", "Nae saekkkaldaero sal su isseo", "I can live in my own colors"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-iu-palette-iu" },
    update: {}, create: { id: "credit-iu-palette-iu", songId: (await prisma.song.findUnique({ where: { slug: "iu-palette" } }))!.id, artistId: iu.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "iu-celebrity" }, update: {},
    create: { slug: "iu-celebrity", title: "Celebrity", albumId: iuLilacAlbum.id, releaseYear: 2021, viewCount: 147000, coverArt: iuLilacAlbum.coverArt,
      ...lyrics([
        ["나를 봐줘 eyes on me", "Nareul bwajweo eyes on me", "Look at me, eyes on me"],
        ["이 세상이 다 볼 수 있도록", "I sesangi da bol su itdorok", "So all of this world can see"],
        ["Celebrity, I'm a celebrity", "Celebrity, I'm a celebrity", "Celebrity, I'm a celebrity"],
        ["", "", ""],
        ["눈부시게 빛나는 별처럼", "Nunbusige binnaneun byeolcheoreom", "Like a dazzlingly shining star"],
        ["온 세상에 나를 알릴게", "On sesange nareul allilge", "I'll make the whole world know me"],
        ["내가 누군지 다 보여줄게", "Naega nugunji da boyeojulge", "I'll show everyone who I am"],
        ["", "", ""],
        ["나는 나야 특별한 존재야", "Naneun naya teukbyeolhan jonjaeya", "I am me, I am a special being"],
        ["이 무대 위에서 빛날게", "I mudae uieseo binalge", "I'll shine on this stage"],
        ["Celebrity, 세상의 중심에서", "Celebrity, sesangui jungsimseo", "Celebrity, at the center of the world"],
        ["", "", ""],
        ["보이니 눈부신 나의 빛이", "Boini nunbusin naui bichi", "Can you see my dazzling light"],
        ["온 세상을 가득 채워가", "On sesangeul gadeuk chaewoga", "Filling all the world"],
        ["I'm a celebrity, yeah", "I'm a celebrity, yeah", "I'm a celebrity, yeah"],
        ["영원히 빛나는 나야", "Yeongwonhi binnaneun naya", "I'm the me that shines forever"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-iu-celebrity-iu" },
    update: {}, create: { id: "credit-iu-celebrity-iu", songId: (await prisma.song.findUnique({ where: { slug: "iu-celebrity" } }))!.id, artistId: iu.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "iu-eight" }, update: {},
    create: { slug: "iu-eight", title: "에잇 (Eight)", albumId: iuLilacAlbum.id, releaseYear: 2020, viewCount: 138000, coverArt: iuLilacAlbum.coverArt,
      ...lyrics([
        ["I Remember 스물네살의 봄", "I Remember seumulyeossarui bom", "I remember the spring of twenty-four"],
        ["혼자 익어가던 그 감정들", "Honja igeogadeon geu gamjeongdeul", "Those feelings that ripened alone"],
        ["다시는 이제 없을 것 같아", "Dasineun ije eobeul geot gata", "I don't think they'll ever come back"],
        ["", "", ""],
        ["I wish you were here 함께 있었으면", "I wish you were here hamkke isseosseumyeon", "I wish you were here, I wish we were together"],
        ["지금 이 시간을 같이 보냈으면", "Jigeum i siganeul gachi bonaesseumyeon", "I wish we could spend this time together"],
        ["", "", ""],
        ["에잇, 나쁜 말하지 마", "Aet, nappeun mal haji ma", "Eight, don't say bad things"],
        ["슬픔과 이별하자", "Seulpeumgwa ibyeorhaja", "Let's part with sadness"],
        ["영원할 것 같았던 봄날", "Yeongwonhal geot gatasseon bomnal", "The spring days that seemed like they'd last forever"],
        ["지금은 어디 있을까", "Jigeumun eodi isseulkka", "Where are they now"],
        ["", "", ""],
        ["에잇 에잇 에잇", "Aet aet aet", "Eight eight eight"],
        ["잊혀지는 게 무서워", "Itchyeojineun ge museowo", "I'm afraid of being forgotten"],
        ["에잇 에잇 에잇", "Aet aet aet", "Eight eight eight"],
        ["그래도 괜찮을 거야", "Geuraedo gwaenchaneul geoya", "But it'll be okay"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-iu-eight-iu" },
    update: {}, create: { id: "credit-iu-eight-iu", songId: (await prisma.song.findUnique({ where: { slug: "iu-eight" } }))!.id, artistId: iu.id, role: "PRIMARY" },
  });

  // ── NMIXX — new artist ─────────────────────────────────────────────────────
  const nmixx = await prisma.artist.upsert({
    where: { slug: "nmixx" }, update: {},
    create: {
      slug: "nmixx", type: "GROUP", stageName: "NMIXX", debutYear: 2022, labelId: jyp?.id,
      bio: "NMIXX (엔믹스) is a six-member girl group formed by JYP Entertainment, debuting in February 2022. The group is known for their innovative 'MIX POP' genre — a concept that fuses multiple distinct musical genres within a single song. Consisting of Lily, Haewon, Sullyoon, Kyujin, Jinni (departed 2022), and BAE, NMIXX showcases exceptional vocal range and athletic performance.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/NMIXX_in_2023_%28cropped%29.jpg/960px-NMIXX_in_2023_%28cropped%29.jpg",
    },
  });

  const nmixxOOAlbum = await prisma.album.upsert({
    where: { slug: "nmixx-oo" }, update: {},
    create: { slug: "nmixx-oo", title: "O.O", artistId: nmixx.id, releaseYear: 2022, type: "Single Album", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/8/87/NMIXX_-_O.O.png/220px-NMIXX_-_O.O.png" },
  });
  const nmixxDiceAlbum = await prisma.album.upsert({
    where: { slug: "nmixx-dice" }, update: {},
    create: { slug: "nmixx-dice", title: "DICE", artistId: nmixx.id, releaseYear: 2022, type: "EP", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/NMIXX_-_Dice.png/220px-NMIXX_-_Dice.png" },
  });
  const nmixxExpAlbum = await prisma.album.upsert({
    where: { slug: "nmixx-expergo" }, update: {},
    create: { slug: "nmixx-expergo", title: "expergo", artistId: nmixx.id, releaseYear: 2023, type: "EP", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/NMIXX_-_Expergo.png/220px-NMIXX_-_Expergo.png" },
  });

  await prisma.song.upsert({
    where: { slug: "nmixx-oo" }, update: {},
    create: { slug: "nmixx-oo", title: "O.O", albumId: nmixxOOAlbum.id, releaseYear: 2022, viewCount: 86000, coverArt: nmixxOOAlbum.coverArt,
      ...lyrics([
        ["O.O, O.O", "O.O, O.O", "O.O, O.O"],
        ["눈이 동그래지게 만들어줄게", "Nuni donggeurajige mandeureojulge", "I'll make your eyes go wide"],
        ["이건 시작이야", "Igeon sijagiya", "This is just the beginning"],
        ["", "", ""],
        ["세상이 뒤집어질 것 같아", "Sesangi dwijipeojil geot gata", "It feels like the world is turning upside down"],
        ["준비됐어 우리의 시대", "Junbidwaesseo urieui sidae", "Our era is ready"],
        ["O.O, 우린 다 달라", "O.O, urin da dalla", "O.O, we're all different"],
        ["그게 우리의 매력", "Geuge urieui maeryeok", "That's our charm"],
        ["", "", ""],
        ["이제 눈 크게 떠봐", "Ije nun keuge tteobwa", "Open your eyes wide now"],
        ["보이지 않는 걸 보여줄게", "Boyiji aneun geol boyeojulge", "I'll show you what you can't see"],
        ["O.O, O.O", "O.O, O.O", "O.O, O.O"],
        ["우린 NMIXX야", "Urin NMIXXya", "We are NMIXX"],
        ["", "", ""],
        ["Mix pop, 우리만의 음악", "Mix pop, urimaneui eumak", "Mix pop, our own music"],
        ["새로운 세계로 초대해", "Saeroun segyero chodaehae", "Inviting you to a new world"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-nmixx-oo-nmixx" },
    update: {}, create: { id: "credit-nmixx-oo-nmixx", songId: (await prisma.song.findUnique({ where: { slug: "nmixx-oo" } }))!.id, artistId: nmixx.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "nmixx-dice" }, update: {},
    create: { slug: "nmixx-dice", title: "DICE", albumId: nmixxDiceAlbum.id, releaseYear: 2022, viewCount: 79000, coverArt: nmixxDiceAlbum.coverArt,
      ...lyrics([
        ["주사위를 던져봐", "Jusawireul deonjyeobwa", "Throw the dice"],
        ["어떤 결과가 나올지 몰라도", "Eotteon gyeolgwaga naol-jji mollado", "Even if you don't know what the result will be"],
        ["DICE, 기회를 잡아", "DICE, gihoereul jaba", "DICE, seize the opportunity"],
        ["", "", ""],
        ["두려워하지 마 새로운 도전", "Duryeowohaji ma saeroun dojeon", "Don't be afraid of new challenges"],
        ["Gonna roll the dice, roll the dice", "Gonna roll the dice, roll the dice", "Gonna roll the dice, roll the dice"],
        ["운명은 네 손에 달려 있어", "Unmyeongeun ne sone dallyeo isseo", "Your destiny is in your hands"],
        ["", "", ""],
        ["DICE, DICE, roll it", "DICE, DICE, roll it", "DICE, DICE, roll it"],
        ["원하는 대로 되게 해줄게", "Wonhaneun daero doege haejulge", "I'll make it happen the way you want"],
        ["주사위가 구를수록", "Jusawiga gureulsurok", "The more the dice rolls"],
        ["가능성이 열려", "Ganeungseong-i yeollyeo", "The more possibilities open up"],
        ["", "", ""],
        ["Chance, chance, take a chance", "Chance, chance, take a chance", "Chance, chance, take a chance"],
        ["DICE가 결정해줄 거야", "DICEga gyeoljeonghaejul geoya", "The DICE will decide"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-nmixx-dice-nmixx" },
    update: {}, create: { id: "credit-nmixx-dice-nmixx", songId: (await prisma.song.findUnique({ where: { slug: "nmixx-dice" } }))!.id, artistId: nmixx.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "nmixx-love-me-like-this" }, update: {},
    create: { slug: "nmixx-love-me-like-this", title: "Love Me Like This", albumId: nmixxExpAlbum.id, releaseYear: 2023, viewCount: 83000, coverArt: nmixxExpAlbum.coverArt,
      ...lyrics([
        ["Love me like this", "Love me like this", "Love me like this"],
        ["이렇게 나를 사랑해줘", "Ireoke nareul saranghajweo", "Love me like this"],
        ["있는 그대로의 나를", "Inneun geudaeroeui nareul", "Me as I am"],
        ["Love me like this, like this", "Love me like this, like this", "Love me like this, like this"],
        ["", "", ""],
        ["완벽하지 않아도 괜찮아", "Wanbyeokhaji anado gwaenchana", "It's okay even if I'm not perfect"],
        ["이게 진짜 나야", "Ige jinjja naya", "This is the real me"],
        ["있는 그대로 받아줘", "Inneun geudaero badajweo", "Accept me as I am"],
        ["Love me, love me, love me", "Love me, love me, love me", "Love me, love me, love me"],
        ["", "", ""],
        ["날 봐줘, 진심으로", "Nal bwajweo, jinsimullo", "Look at me, sincerely"],
        ["이 마음을 알아줘", "I maeumeul alajweo", "Understand this heart"],
        ["Love me like this", "Love me like this", "Love me like this"],
        ["그것만으로 충분해", "Geugeotmaneuro chungbunhae", "That's enough"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-nmixx-love-me-like-this-nmixx" },
    update: {}, create: { id: "credit-nmixx-love-me-like-this-nmixx", songId: (await prisma.song.findUnique({ where: { slug: "nmixx-love-me-like-this" } }))!.id, artistId: nmixx.id, role: "PRIMARY" },
  });

  console.log("✅ seed-ateez-gidle-bb-2ne1-bm: ATEEZ(+3) | (G)I-DLE(+3) | BIGBANG(+3) | 2NE1(+2) | BABYMONSTER(+1) | IU(+4) | NMIXX(+3)");
}
