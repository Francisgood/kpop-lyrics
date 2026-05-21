import { PrismaClient } from "@prisma/client";

function lyrics(lines: [string, string, string][]): { lyricsKo: string; lyricsRomanized: string; lyricsEn: string } {
  return {
    lyricsKo: lines.map(l => l[0]).join("\n"),
    lyricsRomanized: lines.map(l => l[1]).join("\n"),
    lyricsEn: lines.map(l => l[2]).join("\n"),
  };
}

export async function seed(prisma: PrismaClient): Promise<void> {
  const hybe = await prisma.label.findFirst({ where: { slug: "hybe-entertainment" } });
  const ist  = await prisma.label.upsert({
    where: { slug: "ist-entertainment" },
    update: {},
    create: { slug: "ist-entertainment", name: "IST Entertainment", country: "South Korea", foundedYear: 2021, website: "ist-ent.com", bio: "IST Entertainment (formerly Play M Entertainment) is a South Korean label home to APINK, VICTON, and fromis_9. Founded in 2021 after a rebranding, IST manages some of K-pop's longest-running girl groups." },
  });

  // ── RM (김남준) ──────────────────────────────────────────────────────────────
  const rm = await prisma.artist.upsert({
    where: { slug: "rm-bts" }, update: {},
    create: {
      slug: "rm-bts", type: "MEMBER", stageName: "RM", realName: "Kim Nam-jun", debutYear: 2013, labelId: hybe?.id,
      bio: "RM (Kim Nam-jun) is the leader and main rapper of BTS. A self-taught rapper who began writing lyrics at age 11, RM's intellectual lyricism explores Korean identity, the meaning of life, and art. His solo album 'Indigo' (2022) was composed as a personal journal before his mandatory military service.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/RM_at_the_2022_White_House_meeting_for_Asian_inclusion_%28cropped%29.jpg/960px-RM_at_the_2022_White_House_meeting_for_Asian_inclusion_%28cropped%29.jpg",
    },
  });

  const rmIndigoAlbum = await prisma.album.upsert({
    where: { slug: "rm-indigo" }, update: {},
    create: { slug: "rm-indigo", title: "Indigo", artistId: rm.id, releaseYear: 2022, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/RM_-_Indigo.png/220px-RM_-_Indigo.png" },
  });

  await prisma.song.upsert({
    where: { slug: "rm-wild-flower" }, update: {},
    create: { slug: "rm-wild-flower", title: "Wild Flower", albumId: rmIndigoAlbum.id, releaseYear: 2022, viewCount: 68000, coverArt: rmIndigoAlbum.coverArt,
      ...lyrics([
        ["들판에 피어난 꽃처럼", "Deulpane pieonan kkotcheoreom", "Like a flower blooming in the field"],
        ["바람에 흔들려도 꺾이지 않아", "Barame heundeullyeodo kkeokiji ana", "Even when shaken by the wind, it doesn't break"],
        ["나는 야생화야", "Naneun yasaenghwaya", "I am a wild flower"],
        ["", "", ""],
        ["Wild flower, growing free", "Wild flower, growing free", "Wild flower, growing free"],
        ["아무도 날 가두지 못해", "Amudo nal gadeuji mote", "No one can cage me"],
        ["이 땅 어디서든 피어날 거야", "I ttang eodiseodeun pieoonal geoya", "I'll bloom anywhere on this earth"],
        ["", "", ""],
        ["거친 세상 속에서도", "Geochin sesang sogessdo", "Even in this rough world"],
        ["나는 나대로 자라나", "Naneun nadaero jarana", "I grow in my own way"],
        ["Wild flower, wild flower", "Wild flower, wild flower", "Wild flower, wild flower"],
        ["자유롭게 피어나", "Jayuropge pieoona", "Blooming freely"],
        ["", "", ""],
        ["비가 와도 괜찮아", "Biga wado gwaenchana", "It's okay even when it rains"],
        ["폭풍이 와도 괜찮아", "Pokpungi wado gwaenchana", "It's okay even when storms come"],
        ["이게 나의 삶이야", "Ige naui salmiya", "This is my life"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-rm-wild-flower-rm-bts" },
    update: {}, create: { id: "credit-rm-wild-flower-rm-bts", songId: (await prisma.song.findUnique({ where: { slug: "rm-wild-flower" } }))!.id, artistId: rm.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "rm-come-back-to-me" }, update: {},
    create: { slug: "rm-come-back-to-me", title: "Come back to me", albumId: rmIndigoAlbum.id, releaseYear: 2022, viewCount: 61000, coverArt: rmIndigoAlbum.coverArt,
      ...lyrics([
        ["Come back to me", "Come back to me", "Come back to me"],
        ["돌아와줘", "Dorawajweo", "Come back"],
        ["I need you here with me", "I need you here with me", "I need you here with me"],
        ["", "", ""],
        ["아직도 네가 필요해", "Ajikdo nega piryohae", "I still need you"],
        ["이 세상이 텅 비어보여", "I sesangi teong bieoboyo", "This world looks empty to me"],
        ["Come back, come back to me", "Come back, come back to me", "Come back, come back to me"],
        ["", "", ""],
        ["기억해줘 우리의 시간을", "Gieokhajweo urieui siganeul", "Remember our time"],
        ["다시 돌아올 수 있어", "Dasi doraol su isseo", "You can come back again"],
        ["Come back to me", "Come back to me", "Come back to me"],
        ["내 곁으로", "Nae gyeoteureo", "Back to my side"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-rm-come-back-to-me-rm-bts" },
    update: {}, create: { id: "credit-rm-come-back-to-me-rm-bts", songId: (await prisma.song.findUnique({ where: { slug: "rm-come-back-to-me" } }))!.id, artistId: rm.id, role: "PRIMARY" },
  });

  // ── Jungkook (전정국) ────────────────────────────────────────────────────────
  const jungkook = await prisma.artist.upsert({
    where: { slug: "jungkook-bts" }, update: {},
    create: {
      slug: "jungkook-bts", type: "MEMBER", stageName: "Jungkook", realName: "Jeon Jeong-guk", debutYear: 2013, labelId: hybe?.id,
      bio: "Jungkook is the youngest member (maknae) and main vocalist of BTS. Often called the 'Golden Maknae' for his exceptional abilities in singing, dancing, and athletics. His solo debut album 'GOLDEN' (2023) produced the global hits 'Seven' and 'Standing Next to You'.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Jungkook_at_the_2022_Grammy_Awards_%28cropped%29.jpg/960px-Jungkook_at_the_2022_Grammy_Awards_%28cropped%29.jpg",
    },
  });

  const jkGoldenAlbum = await prisma.album.upsert({
    where: { slug: "jungkook-golden" }, update: {},
    create: { slug: "jungkook-golden", title: "GOLDEN", artistId: jungkook.id, releaseYear: 2023, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a3/Jungkook_-_Golden.png/220px-Jungkook_-_Golden.png" },
  });

  await prisma.song.upsert({
    where: { slug: "jungkook-seven" }, update: {},
    create: { slug: "jungkook-seven", title: "Seven (feat. Latto)", albumId: jkGoldenAlbum.id, releaseYear: 2023, viewCount: 184000, coverArt: jkGoldenAlbum.coverArt,
      ...lyrics([
        ["Monday, Tuesday, Wednesday, Thursday", "Monday, Tuesday, Wednesday, Thursday", "Monday, Tuesday, Wednesday, Thursday"],
        ["Friday, Saturday, Sunday", "Friday, Saturday, Sunday", "Friday, Saturday, Sunday"],
        ["I wanna be with you every day", "I wanna be with you every day", "I wanna be with you every day"],
        ["", "", ""],
        ["Seven days a week", "Seven days a week", "Seven days a week"],
        ["너와 함께하고 싶어", "Neowa hamkkaehago sipeo", "I want to be with you"],
        ["하루도 빠짐없이", "Haruodo ppajimeopsi", "Without missing a single day"],
        ["", "", ""],
        ["Baby I know your face", "Baby I know your face", "Baby I know your face"],
        ["When you smile, when you cry", "When you smile, when you cry", "When you smile, when you cry"],
        ["I don't care if there's hell or heaven", "I don't care if there's hell or heaven", "I don't care if there's hell or heaven"],
        ["Baby I just want you", "Baby I just want you", "Baby I just want you"],
        ["", "", ""],
        ["Seven, seven, seven days", "Seven, seven, seven days", "Seven, seven, seven days"],
        ["나는 너만 바라볼게", "Naneun neoman barabollge", "I'll only look at you"],
        ["Seven days a week, every week", "Seven days a week, every week", "Seven days a week, every week"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-jungkook-seven-jungkook-bts" },
    update: {}, create: { id: "credit-jungkook-seven-jungkook-bts", songId: (await prisma.song.findUnique({ where: { slug: "jungkook-seven" } }))!.id, artistId: jungkook.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "jungkook-standing-next-to-you" }, update: {},
    create: { slug: "jungkook-standing-next-to-you", title: "Standing Next to You", albumId: jkGoldenAlbum.id, releaseYear: 2023, viewCount: 162000, coverArt: jkGoldenAlbum.coverArt,
      ...lyrics([
        ["Standing next to you", "Standing next to you", "Standing next to you"],
        ["네 곁에 서 있을게", "Ne gyeote seo isseulge", "I'll stand next to you"],
        ["아무것도 두렵지 않아", "Amugeotdo duryeopji ana", "I'm not afraid of anything"],
        ["", "", ""],
        ["I'll be right here", "I'll be right here", "I'll be right here"],
        ["네 손을 잡고", "Ne soneul jabgo", "Holding your hand"],
        ["어디든 함께 가자", "Eodideun hamkke gaja", "Let's go anywhere together"],
        ["", "", ""],
        ["Don't you worry now", "Don't you worry now", "Don't you worry now"],
        ["내가 여기 있어", "Naega yeogi isseo", "I'm right here"],
        ["Standing next to you, yeah", "Standing next to you, yeah", "Standing next to you, yeah"],
        ["영원히 함께할게", "Yeongwonhi hamkkaehallge", "I'll be with you forever"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-jungkook-standing-next-to-you-jungkook-bts" },
    update: {}, create: { id: "credit-jungkook-standing-next-to-you-jungkook-bts", songId: (await prisma.song.findUnique({ where: { slug: "jungkook-standing-next-to-you" } }))!.id, artistId: jungkook.id, role: "PRIMARY" },
  });

  // ── Jimin (박지민) ───────────────────────────────────────────────────────────
  const jimin = await prisma.artist.upsert({
    where: { slug: "jimin-bts" }, update: {},
    create: {
      slug: "jimin-bts", type: "MEMBER", stageName: "Jimin", realName: "Park Ji-min", debutYear: 2013, labelId: hybe?.id,
      bio: "Jimin is the main dancer and lead vocalist of BTS. Known for his powerful, sensual stage presence and emotional vocal delivery, Jimin became the first BTS member to reach #1 on the Billboard Hot 100 with his solo single 'Like Crazy' from debut album 'FACE' (2023).",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Jimin_at_the_2022_Grammy_Awards_%28cropped%29.jpg/960px-Jimin_at_the_2022_Grammy_Awards_%28cropped%29.jpg",
    },
  });

  const jiminFaceAlbum = await prisma.album.upsert({
    where: { slug: "jimin-face" }, update: {},
    create: { slug: "jimin-face", title: "FACE", artistId: jimin.id, releaseYear: 2023, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Jimin_-_Face.png/220px-Jimin_-_Face.png" },
  });

  await prisma.song.upsert({
    where: { slug: "jimin-like-crazy" }, update: {},
    create: { slug: "jimin-like-crazy", title: "Like Crazy", albumId: jiminFaceAlbum.id, releaseYear: 2023, viewCount: 157000, coverArt: jiminFaceAlbum.coverArt,
      ...lyrics([
        ["Like crazy, like crazy", "Like crazy, like crazy", "Like crazy, like crazy"],
        ["미칠 것 같아 이 감정", "Michil geot gata i gamjeong", "This feeling is making me crazy"],
        ["Like crazy for you", "Like crazy for you", "Like crazy for you"],
        ["", "", ""],
        ["눈을 감으면 네가 보여", "Nuneul gameumyeon nega boyeo", "When I close my eyes I see you"],
        ["숨을 쉴 때마다 너야", "Sumeul swil ttaemada neoya", "Every time I breathe, it's you"],
        ["Like crazy, I'm going crazy", "Like crazy, I'm going crazy", "Like crazy, I'm going crazy"],
        ["너 없인 못 살겠어", "Neo eopsin mot salgeseo", "I can't live without you"],
        ["", "", ""],
        ["이게 사랑인지 중독인지", "Ige saranginji jungdoginji", "Whether this is love or addiction"],
        ["모르겠어 그냥 다 너야", "Moreugesseo geunyang da neoya", "I don't know, everything is just you"],
        ["Like crazy, like crazy", "Like crazy, like crazy", "Like crazy, like crazy"],
        ["나는 너로 미쳐가", "Naneun neoro michyeoga", "I'm going crazy for you"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-jimin-like-crazy-jimin-bts" },
    update: {}, create: { id: "credit-jimin-like-crazy-jimin-bts", songId: (await prisma.song.findUnique({ where: { slug: "jimin-like-crazy" } }))!.id, artistId: jimin.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "jimin-set-me-free-pt-2" }, update: {},
    create: { slug: "jimin-set-me-free-pt-2", title: "Set Me Free Pt.2", albumId: jiminFaceAlbum.id, releaseYear: 2023, viewCount: 134000, coverArt: jiminFaceAlbum.coverArt,
      ...lyrics([
        ["Set me free, set me free", "Set me free, set me free", "Set me free, set me free"],
        ["이 감옥에서 나를 꺼내줘", "I gameokseo nareul kkeonaejweo", "Take me out of this prison"],
        ["갇혀있던 내 마음을", "Gachyeoissedon nae maeumeul", "My heart that was trapped"],
        ["", "", ""],
        ["해방시켜줘", "Haebangsikkyeojweo", "Set me free"],
        ["이 두려움에서", "I duryeoumeseo", "From this fear"],
        ["Set me free, I wanna be free", "Set me free, I wanna be free", "Set me free, I wanna be free"],
        ["더 이상 숨지 않을게", "Deo isang sumji aneulge", "I won't hide anymore"],
        ["", "", ""],
        ["진짜 나를 보여줄게", "Jinjja nareul boyeojulge", "I'll show you the real me"],
        ["더 이상 두렵지 않아", "Deo isang duryeopji ana", "I'm not afraid anymore"],
        ["Set me free, yeah, set me free", "Set me free, yeah, set me free", "Set me free, yeah, set me free"],
        ["이제 자유로워", "Ije jayurowo", "Now I'm free"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-jimin-set-me-free-pt-2-jimin-bts" },
    update: {}, create: { id: "credit-jimin-set-me-free-pt-2-jimin-bts", songId: (await prisma.song.findUnique({ where: { slug: "jimin-set-me-free-pt-2" } }))!.id, artistId: jimin.id, role: "PRIMARY" },
  });

  // ── V / Kim Taehyung (김태형) ─────────────────────────────────────────────────
  const vBts = await prisma.artist.upsert({
    where: { slug: "v-bts" }, update: {},
    create: {
      slug: "v-bts", type: "MEMBER", stageName: "V", realName: "Kim Tae-hyung", debutYear: 2013, labelId: hybe?.id,
      bio: "V (Kim Tae-hyung) is a vocalist in BTS known for his deep baritone voice and experimental artistic sensibility. His debut solo album 'Layover' (2023) showcased a jazz-influenced sound very different from BTS's usual style, reflecting his eclectic musical tastes spanning Frank Ocean to Miles Davis.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/V_at_the_2022_Grammy_Awards_%28cropped%29.jpg/960px-V_at_the_2022_Grammy_Awards_%28cropped%29.jpg",
    },
  });

  const vLayoverAlbum = await prisma.album.upsert({
    where: { slug: "v-layover" }, update: {},
    create: { slug: "v-layover", title: "Layover", artistId: vBts.id, releaseYear: 2023, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3e/V_-_Layover.png/220px-V_-_Layover.png" },
  });

  await prisma.song.upsert({
    where: { slug: "v-rainy-days" }, update: {},
    create: { slug: "v-rainy-days", title: "Rainy Days", albumId: vLayoverAlbum.id, releaseYear: 2023, viewCount: 112000, coverArt: vLayoverAlbum.coverArt,
      ...lyrics([
        ["비 오는 날엔 네가 생각나", "Bi oneun nalen nega saengnakna", "On rainy days I think of you"],
        ["창문에 맺힌 빗방울처럼", "Changmune maechin bitbangulcheoreom", "Like raindrops on the window"],
        ["흘러내리는 기억들", "Heulleonaeineun gieogeul", "Memories flowing down"],
        ["", "", ""],
        ["Rainy days, rainy days", "Rainy days, rainy days", "Rainy days, rainy days"],
        ["이런 날엔 더 보고 싶어", "Ireon nalen deo bogo sipeo", "On days like this I miss you more"],
        ["어디 있어 지금 넌", "Eodi isseo jigeum neon", "Where are you right now"],
        ["", "", ""],
        ["비가 그쳐도 넌 돌아오지 않아", "Biga geuchyeodo neon doraoji ana", "Even when the rain stops, you don't come back"],
        ["이 빗소리가 너인 것 같아", "I bitssoriga neorin geot gata", "The sound of this rain feels like you"],
        ["Rainy days, just rainy days", "Rainy days, just rainy days", "Rainy days, just rainy days"],
        ["네가 그리워", "Nega geuriwo", "I miss you"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-v-rainy-days-v-bts" },
    update: {}, create: { id: "credit-v-rainy-days-v-bts", songId: (await prisma.song.findUnique({ where: { slug: "v-rainy-days" } }))!.id, artistId: vBts.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "v-love-me-again" }, update: {},
    create: { slug: "v-love-me-again", title: "Love Me Again", albumId: vLayoverAlbum.id, releaseYear: 2023, viewCount: 104000, coverArt: vLayoverAlbum.coverArt,
      ...lyrics([
        ["Love me again", "Love me again", "Love me again"],
        ["다시 한번 나를 사랑해줘", "Dasi hanbeon nareul saranghajweo", "Love me once more"],
        ["그때처럼", "Geutaecheoreom", "Like before"],
        ["", "", ""],
        ["우리 처음 만났을 때", "Uri cheoeum mannaasseul ttae", "When we first met"],
        ["그때의 눈빛으로 봐줘", "Geuttaeui nunbiteuro bwajweo", "Look at me with those eyes from then"],
        ["Love me again, love me again", "Love me again, love me again", "Love me again, love me again"],
        ["", "", ""],
        ["시간이 많이 흘렀지만", "Sigani manhi heulleotjiman", "Even though much time has passed"],
        ["아직도 그 감정 기억해", "Ajikdo geu gamjeong gieokhae", "I still remember that feeling"],
        ["Love me again, please", "Love me again, please", "Love me again, please"],
        ["다시 처음으로", "Dasi cheoeumeuro", "Back to the beginning"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-v-love-me-again-v-bts" },
    update: {}, create: { id: "credit-v-love-me-again-v-bts", songId: (await prisma.song.findUnique({ where: { slug: "v-love-me-again" } }))!.id, artistId: vBts.id, role: "PRIMARY" },
  });

  // ── J-Hope (정호석) ──────────────────────────────────────────────────────────
  const jhope = await prisma.artist.upsert({
    where: { slug: "j-hope-bts" }, update: {},
    create: {
      slug: "j-hope-bts", type: "MEMBER", stageName: "j-hope", realName: "Jung Ho-seok", debutYear: 2013, labelId: hybe?.id,
      bio: "j-hope is the main dancer and sub-rapper of BTS. His solo album 'Jack In The Box' (2022) was a critically acclaimed artistic pivot into darker, more complex hip-hop, culminating in a headline performance at Lollapalooza 2022 — the first solo Korean artist to headline the festival.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/J-Hope_at_Lollapalooza_2022_%28cropped%29.jpg/960px-J-Hope_at_Lollapalooza_2022_%28cropped%29.jpg",
    },
  });

  const jhopeJITBAlbum = await prisma.album.upsert({
    where: { slug: "j-hope-jack-in-the-box" }, update: {},
    create: { slug: "j-hope-jack-in-the-box", title: "Jack In The Box", artistId: jhope.id, releaseYear: 2022, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/5/52/J-Hope_-_Jack_in_the_Box.png/220px-J-Hope_-_Jack_in_the_Box.png" },
  });

  await prisma.song.upsert({
    where: { slug: "j-hope-arson" }, update: {},
    create: { slug: "j-hope-arson", title: "Arson", albumId: jhopeJITBAlbum.id, releaseYear: 2022, viewCount: 98000, coverArt: jhopeJITBAlbum.coverArt,
      ...lyrics([
        ["방화범", "Banghwabeom", "Arsonist"],
        ["나는 나를 불태워", "Naneun nareul bulttaewo", "I burn myself"],
        ["이게 내 운명이야", "Ige nae unmyeongiya", "This is my fate"],
        ["", "", ""],
        ["Arson, I'm an arsonist", "Arson, I'm an arsonist", "Arson, I'm an arsonist"],
        ["내 안의 불꽃이 꺼지지 않아", "Nae anui bulkkochi kkeojiji ana", "The flame inside me won't go out"],
        ["계속 타오르는 이 열정", "Gyesok taoeuneun i yeoljeong", "This passion that keeps burning"],
        ["", "", ""],
        ["세상이 뭐라 해도", "Sesangi mwora haedo", "Whatever the world says"],
        ["나는 내 불꽃으로 빛날 거야", "Naneun nae bulkkocheuro binal geoya", "I'll shine with my own flame"],
        ["Arson, arson", "Arson, arson", "Arson, arson"],
        ["이게 내 이야기야", "Ige nae iyagiya", "This is my story"],
        ["", "", ""],
        ["불을 지피자 온 세상에", "Bureul jipia on sesange", "Light the fire across the whole world"],
        ["j-hope, 불태워라", "j-hope, bulttaeora", "j-hope, burn it all"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-j-hope-arson-j-hope-bts" },
    update: {}, create: { id: "credit-j-hope-arson-j-hope-bts", songId: (await prisma.song.findUnique({ where: { slug: "j-hope-arson" } }))!.id, artistId: jhope.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "j-hope-more" }, update: {},
    create: { slug: "j-hope-more", title: "MORE", albumId: jhopeJITBAlbum.id, releaseYear: 2022, viewCount: 87000, coverArt: jhopeJITBAlbum.coverArt,
      ...lyrics([
        ["I want more, I need more", "I want more, I need more", "I want more, I need more"],
        ["만족할 수 없어", "Manjokhal su eopseo", "I can't be satisfied"],
        ["항상 더 원해", "Hangsang deo wonhae", "I always want more"],
        ["", "", ""],
        ["More, more, give me more", "More, more, give me more", "More, more, give me more"],
        ["이 무대가 갈증을 채워줘", "I mudaega galjeungeul chaewojweo", "Let this stage quench my thirst"],
        ["끝이 없는 욕망", "Kkeuti eomneun yokmang", "Endless desire"],
        ["", "", ""],
        ["높이 더 높이 올라가", "Nopi deo nopi ollaga", "Higher and higher up"],
        ["멈출 이유가 없잖아", "Meomchul iyuga eopjana", "There's no reason to stop"],
        ["More, more, I want more", "More, more, I want more", "More, more, I want more"],
        ["한계가 없어", "Hankkaega eopseo", "There's no limit"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-j-hope-more-j-hope-bts" },
    update: {}, create: { id: "credit-j-hope-more-j-hope-bts", songId: (await prisma.song.findUnique({ where: { slug: "j-hope-more" } }))!.id, artistId: jhope.id, role: "PRIMARY" },
  });

  // ── Suga / Agust D (민윤기) ──────────────────────────────────────────────────
  const suga = await prisma.artist.upsert({
    where: { slug: "suga-bts" }, update: {},
    create: {
      slug: "suga-bts", type: "MEMBER", stageName: "Suga", realName: "Min Yoon-gi", debutYear: 2013, labelId: hybe?.id,
      bio: "Suga (Min Yoon-gi) is the lead rapper of BTS, also known as Agust D for his solo work. A prolific songwriter and producer, Suga co-writes most of BTS's discography. His mixtapes 'Agust D' (2016), 'D-2' (2020), and album 'D-DAY' (2023) are unfiltered explorations of mental health, ambition, and Korean society.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Suga_at_the_2022_Grammy_Awards_%28cropped%29.jpg/960px-Suga_at_the_2022_Grammy_Awards_%28cropped%29.jpg",
    },
  });

  const sugaDDayAlbum = await prisma.album.upsert({
    where: { slug: "agust-d-d-day" }, update: {},
    create: { slug: "agust-d-d-day", title: "D-DAY", artistId: suga.id, releaseYear: 2023, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Agust_D_-_D-Day.png/220px-Agust_D_-_D-Day.png" },
  });

  await prisma.song.upsert({
    where: { slug: "agust-d-haegeum" }, update: {},
    create: { slug: "agust-d-haegeum", title: "Haegeum (해금)", albumId: sugaDDayAlbum.id, releaseYear: 2023, viewCount: 94000, coverArt: sugaDDayAlbum.coverArt,
      ...lyrics([
        ["해금, 모든 것을 해금시켜줄게", "Haegeum, modeun geoseul haegeumsikkyeojulge", "Haegeum — I'll lift all restrictions"],
        ["자유롭게 해줄게", "Jayuropge haejulge", "I'll set you free"],
        ["해금, Haegeum", "Haegeum, Haegeum", "Haegeum, Haegeum"],
        ["", "", ""],
        ["규칙을 깨버려", "Gyuchireul kkaebeoryeo", "Break the rules"],
        ["억압된 것들을 다 풀어버려", "Eokabdoen geotdeureul da pureobeoryeo", "Release all that was suppressed"],
        ["이게 내 방식이야", "Ige nae bangsigia", "This is my way"],
        ["", "", ""],
        ["Haegeum, 모든 족쇄를 끊어", "Haegeum, modeun jokswaereul kkeunheo", "Haegeum — cut all the shackles"],
        ["자유 그것이 진짜야", "Jayu geugeosi jinjjaya", "Freedom — that's the real thing"],
        ["해금, 다 풀어줄게", "Haegeum, da pureojulge", "Haegeum — I'll untie everything"],
        ["이게 내 음악이야", "Ige nae eumakia", "This is my music"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-agust-d-haegeum-suga-bts" },
    update: {}, create: { id: "credit-agust-d-haegeum-suga-bts", songId: (await prisma.song.findUnique({ where: { slug: "agust-d-haegeum" } }))!.id, artistId: suga.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "agust-d-people-pt-2" }, update: {},
    create: { slug: "agust-d-people-pt-2", title: "People Pt.2", albumId: sugaDDayAlbum.id, releaseYear: 2023, viewCount: 78000, coverArt: sugaDDayAlbum.coverArt,
      ...lyrics([
        ["사람이 좋다", "Sarami jota", "I love people"],
        ["근데 사람이 싫다", "Geunde sarami sireo", "But I hate people"],
        ["이 모순 속에 사는 게 나야", "I mosun soge saneun ge naya", "Living in this contradiction is me"],
        ["", "", ""],
        ["People, people everywhere", "People, people everywhere", "People, people everywhere"],
        ["모두가 다 다른 이야기를 살아가고 있어", "Moduga da dareun iyagireul salagago isseo", "Everyone is living different stories"],
        ["", "", ""],
        ["그 속에서 나는 누구인가", "Geu sogeso naneun nuguinga", "Within that, who am I"],
        ["답을 찾아가는 중이야", "Dabeul chajaganeun jungiya", "I'm in the process of finding answers"],
        ["People, just people", "People, just people", "People, just people"],
        ["우리 모두 다 사람이야", "Uri modu da sarамiya", "We are all just people"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-agust-d-people-pt-2-suga-bts" },
    update: {}, create: { id: "credit-agust-d-people-pt-2-suga-bts", songId: (await prisma.song.findUnique({ where: { slug: "agust-d-people-pt-2" } }))!.id, artistId: suga.id, role: "PRIMARY" },
  });

  // ── Jin (김석진) ─────────────────────────────────────────────────────────────
  const jin = await prisma.artist.upsert({
    where: { slug: "jin-bts" }, update: {},
    create: {
      slug: "jin-bts", type: "MEMBER", stageName: "Jin", realName: "Kim Seok-jin", debutYear: 2013, labelId: hybe?.id,
      bio: "Jin is the oldest member and a vocalist in BTS. Known for his warm, lyrical tenor voice and self-deprecating humor about his own 'worldwide handsome' appearance, Jin released his debut solo single 'The Astronaut' co-written with Coldplay in 2022 before completing mandatory military service.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Jin_BTS_at_the_2022_Grammy_Awards_%28cropped%29.jpg/960px-Jin_BTS_at_the_2022_Grammy_Awards_%28cropped%29.jpg",
    },
  });

  const jinAstronaut = await prisma.album.upsert({
    where: { slug: "jin-the-astronaut" }, update: {},
    create: { slug: "jin-the-astronaut", title: "The Astronaut", artistId: jin.id, releaseYear: 2022, type: "Single Album", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/Jin_-_The_Astronaut.png/220px-Jin_-_The_Astronaut.png" },
  });
  const jinHappyAlbum = await prisma.album.upsert({
    where: { slug: "jin-happy" }, update: {},
    create: { slug: "jin-happy", title: "HAPPY", artistId: jin.id, releaseYear: 2024, type: "Single Album", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/4/44/Jin_-_Happy.png/220px-Jin_-_Happy.png" },
  });

  await prisma.song.upsert({
    where: { slug: "jin-the-astronaut" }, update: {},
    create: { slug: "jin-the-astronaut", title: "The Astronaut", albumId: jinAstronaut.id, releaseYear: 2022, viewCount: 96000, coverArt: jinAstronaut.coverArt,
      ...lyrics([
        ["별들 사이에서 혼자 떠있는 나", "Byeoldeul saieseo honja tteoisneun na", "Me, floating alone among the stars"],
        ["너라는 별을 찾아 헤매고 있어", "Neoraeneun byeoreul chaja hemaego isseo", "I'm wandering, searching for you, a star"],
        ["The Astronaut, 나는 우주인이야", "The Astronaut, naneun ujuiniya", "The Astronaut, I am an astronaut"],
        ["", "", ""],
        ["광활한 우주 속에서", "Gwanghwolhan uju sogeseo", "In the vast universe"],
        ["너의 빛을 찾아가고 있어", "Neoui biteul chajagago isseo", "I'm finding my way to your light"],
        ["The Astronaut, I'm on my way", "The Astronaut, I'm on my way", "The Astronaut, I'm on my way"],
        ["", "", ""],
        ["두렵지 않아 이 여정이", "Duryeopji ana i yeojeong-i", "I'm not afraid of this journey"],
        ["네가 기다리고 있으니까", "Nega gidariogo isseuni kka", "Because you're waiting for me"],
        ["The Astronaut, 돌아올게", "The Astronaut, doraolge", "The Astronaut, I'll come back"],
        ["너에게로", "Neoegero", "To you"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-jin-the-astronaut-jin-bts" },
    update: {}, create: { id: "credit-jin-the-astronaut-jin-bts", songId: (await prisma.song.findUnique({ where: { slug: "jin-the-astronaut" } }))!.id, artistId: jin.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "jin-happy" }, update: {},
    create: { slug: "jin-happy", title: "HAPPY", albumId: jinHappyAlbum.id, releaseYear: 2024, viewCount: 88000, coverArt: jinHappyAlbum.coverArt,
      ...lyrics([
        ["Happy, happy, happy", "Happy, happy, happy", "Happy, happy, happy"],
        ["행복하고 싶어", "Haengbokhago sipeo", "I want to be happy"],
        ["이 순간이 영원하면 좋겠어", "I sungani yeongwonhamyeon jokesseo", "I wish this moment would last forever"],
        ["", "", ""],
        ["Happy days, happy days", "Happy days, happy days", "Happy days, happy days"],
        ["너와 함께라면 매일이 행복해", "Neowa hamkkeoramyeon maeiri haengbokhae", "Every day is happy as long as I'm with you"],
        ["이게 진짜 행복이야", "Ige jinjja haengbogiya", "This is true happiness"],
        ["", "", ""],
        ["웃음이 가득한 날들", "Useum-i gadeukhan naldeul", "Days filled with laughter"],
        ["기억하고 싶어 영원히", "Gieokhago sipeo yeongwonhi", "I want to remember them forever"],
        ["Happy, I'm so happy", "Happy, I'm so happy", "Happy, I'm so happy"],
        ["네가 있어서", "Nega isseoseo", "Because you're here"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-jin-happy-jin-bts" },
    update: {}, create: { id: "credit-jin-happy-jin-bts", songId: (await prisma.song.findUnique({ where: { slug: "jin-happy" } }))!.id, artistId: jin.id, role: "PRIMARY" },
  });

  // ── APINK (에이핑크) — new group ───────────────────────────────────────────────
  const apink = await prisma.artist.upsert({
    where: { slug: "apink" }, update: {},
    create: {
      slug: "apink", type: "GROUP", stageName: "APINK", debutYear: 2011, labelId: ist.id,
      bio: "APINK (에이핑크) is a South Korean girl group formed by Plan A Entertainment (now IST Entertainment), debuting in April 2011. One of K-pop's longest-running active girl groups, APINK pioneered an innocent, soft-girl concept before evolving into a more mature, sensual sound. Consisting of Park Cho-rong, Yoon Bo-mi, Jung Eun-ji, Son Na-eun, Kim Nam-joo, and Oh Ha-young.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Apink_in_October_2023_%28cropped%29.jpg/960px-Apink_in_October_2023_%28cropped%29.jpg",
    },
  });

  const apinkPinkTapeAlbum = await prisma.album.upsert({
    where: { slug: "apink-pink-tape" }, update: {},
    create: { slug: "apink-pink-tape", title: "PINK TAPE", artistId: apink.id, releaseYear: 2013, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/3/33/Apink_-_Pink_Tape.png/220px-Apink_-_Pink_Tape.png" },
  });
  const apinkPinkRevolutionAlbum = await prisma.album.upsert({
    where: { slug: "apink-pink-revolution" }, update: {},
    create: { slug: "apink-pink-revolution", title: "Pink Revolution", artistId: apink.id, releaseYear: 2014, type: "ALBUM", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/7/78/Apink_-_Pink_Revolution.png/220px-Apink_-_Pink_Revolution.png" },
  });
  const apinkSummerNightAlbum = await prisma.album.upsert({
    where: { slug: "apink-s-from-a" }, update: {},
    create: { slug: "apink-s-from-a", title: "5th mini", artistId: apink.id, releaseYear: 2014, type: "EP", coverArt: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/Apink_Mr._Chu.png/220px-Apink_Mr._Chu.png" },
  });

  await prisma.song.upsert({
    where: { slug: "apink-nonono" }, update: {},
    create: { slug: "apink-nonono", title: "NoNoNo", albumId: apinkPinkTapeAlbum.id, releaseYear: 2013, viewCount: 104000, coverArt: apinkPinkTapeAlbum.coverArt,
      ...lyrics([
        ["No no no no no", "No no no no no", "No no no no no"],
        ["안 돼 안 돼 그럼 안 돼", "An dwae an dwae geureom an dwae", "No no no, that won't do"],
        ["No no no no no", "No no no no no", "No no no no no"],
        ["이렇게 하면 안 된다고", "Ireoke hamyeon an doendago", "I said you can't do it this way"],
        ["", "", ""],
        ["왜 자꾸만 내 맘을 흔들어", "Wae jakkuman nae mameul heundeureo", "Why do you keep shaking my heart"],
        ["설레게 만들면 어쩌려고", "Seollege mandeurungmyeon eojjeoryeogo", "What are you going to do making me flutter"],
        ["No no no, 그러지 마", "No no no, geuroji ma", "No no no, don't do that"],
        ["나 혼자 좋아하는 것 같잖아", "Na honja joahaneun geot gatjana", "It seems like I'm the only one who likes you"],
        ["", "", ""],
        ["No no no no no no no", "No no no no no no no", "No no no no no no no"],
        ["니가 좋다는 말 못 해", "Niga jotaneun mal mot hae", "I can't say that I like you"],
        ["숨겨야 해 이 감정", "Sumgyeoya hae i gamjeong", "I have to hide these feelings"],
        ["No no no, 비밀이야", "No no no, bimiriya", "No no no, it's a secret"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-apink-nonono-apink" },
    update: {}, create: { id: "credit-apink-nonono-apink", songId: (await prisma.song.findUnique({ where: { slug: "apink-nonono" } }))!.id, artistId: apink.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "apink-mr-chu" }, update: {},
    create: { slug: "apink-mr-chu", title: "Mr. Chu (On Stage)", albumId: apinkSummerNightAlbum.id, releaseYear: 2014, viewCount: 91000, coverArt: apinkSummerNightAlbum.coverArt,
      ...lyrics([
        ["Mr. Chu, 내게로 와줘", "Mr. Chu, naegero wajweo", "Mr. Chu, come to me"],
        ["두근두근 심장이 멈출 것만 같아", "Dugeundugeun simjangi meomchul geotman gata", "My heart is pounding, it feels like it might stop"],
        ["Mr. Chu, 좋아해", "Mr. Chu, joahae", "Mr. Chu, I like you"],
        ["", "", ""],
        ["처음 본 순간부터", "Cheoeum bon sunganbuteo", "From the moment I first saw you"],
        ["알 수 없는 이 감정이", "Al su eomneun i gamjeong-i", "This feeling I can't explain"],
        ["내 맘속에 가득 차올라", "Nae mamsogeul gadeuk chaolla", "Fills up my heart"],
        ["", "", ""],
        ["Mr. Chu, on stage", "Mr. Chu, on stage", "Mr. Chu, on stage"],
        ["무대 위에서 빛나는 너", "Mudae uieseo binnaneun neo", "You who shines on stage"],
        ["그 모습에 나는 반했어", "Geu moseube naneun banhaesseo", "I fell for that image of you"],
        ["Mr. Chu, 고백할게", "Mr. Chu, goebaekhalge", "Mr. Chu, I'll confess"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-apink-mr-chu-apink" },
    update: {}, create: { id: "credit-apink-mr-chu-apink", songId: (await prisma.song.findUnique({ where: { slug: "apink-mr-chu" } }))!.id, artistId: apink.id, role: "PRIMARY" },
  });

  await prisma.song.upsert({
    where: { slug: "apink-luv" }, update: {},
    create: { slug: "apink-luv", title: "LUV", albumId: apinkPinkRevolutionAlbum.id, releaseYear: 2014, viewCount: 98000, coverArt: apinkPinkRevolutionAlbum.coverArt,
      ...lyrics([
        ["LUV, 사랑하고 있어", "LUV, saranghago isseo", "LUV, I am in love"],
        ["이 감정을 어떻게 표현하지", "I gamjeongeul eotteoke pyohyeonhaji", "How do I express this feeling"],
        ["LUV, 넌 내 전부야", "LUV, neon nae jeonbuya", "LUV, you are my everything"],
        ["", "", ""],
        ["눈을 뜨면 네 생각", "Nuneul tteumyeon ne saengnak", "When I open my eyes, thoughts of you"],
        ["잠이 들면 꿈에서 또 너야", "Jami deulmyeon kkeumeseo tto neoya", "When I fall asleep, you're in my dreams too"],
        ["LUV, 완전히 빠져들었어", "LUV, wanjeonhi ppajyeodeureotseo", "LUV, I've completely fallen in"],
        ["", "", ""],
        ["함께하고 싶어 언제까지나", "Hamkkaehago sipeo eonjekkajina", "I want to be with you forever"],
        ["이 사랑 영원하길 바라", "I sarang yeongwonhagil bara", "I hope this love lasts forever"],
        ["LUV, LUV, LUV", "LUV, LUV, LUV", "LUV, LUV, LUV"],
        ["그냥 너만 사랑해", "Geunyang neoman saranghae", "I just love only you"],
      ]),
    },
  });
  await prisma.songCredit.upsert({
    where: { id: "credit-apink-luv-apink" },
    update: {}, create: { id: "credit-apink-luv-apink", songId: (await prisma.song.findUnique({ where: { slug: "apink-luv" } }))!.id, artistId: apink.id, role: "PRIMARY" },
  });

  // ── BTS — bonus group song (Dynamite already exists, add one more) ──────────
  const bts = await prisma.artist.findUnique({ where: { slug: "bts" } });
  if (bts) {
    const btsAlbum = await prisma.album.findFirst({ where: { artistId: bts.id } });
    if (btsAlbum) {
      const existing = await prisma.song.findUnique({ where: { slug: "bts-spring-day" } });
      if (!existing) {
        const springDay = await prisma.song.create({
          data: { slug: "bts-spring-day", title: "봄날 (Spring Day)", albumId: btsAlbum.id, releaseYear: 2017, viewCount: 198000, coverArt: btsAlbum.coverArt,
            ...lyrics([
              ["보고 싶다", "Bogo sipda", "I miss you"],
              ["이렇게 말하니까 더 보고 싶다", "Ireoke malhanikka deo bogo sipda", "Saying this makes me miss you even more"],
              ["너희 사진을 보고 있어도", "Neoheui sajineul bogo itseodo", "Even when I look at your photos"],
              ["보고 싶다", "Bogo sipda", "I miss you"],
              ["", "", ""],
              ["너무 야속한 시간", "Neomu yasokhan sigan", "This time is too cruel"],
              ["나는 우리가 밉다", "Naneun uri-ga mipda", "I hate us"],
              ["이젠 얼굴 한번 보는 것도 힘들어진 우리가", "Ijen eolgul hanbeon boneun geotdo himdeuleojin uriga", "Us, for whom even seeing each other's faces has become hard"],
              ["", "", ""],
              ["겨울이 지나 봄이 오면", "Gyeouri jina bomi omyeon", "When winter passes and spring comes"],
              ["벚꽃이 피어나듯이", "Beotkkochi pioanaduzi", "Like cherry blossoms blooming"],
              ["우리 다시 만나자", "Uri dasi mannaja", "Let's meet again"],
              ["봄날처럼", "Bomnalcheoreom", "Like a spring day"],
              ["", "", ""],
              ["오랜 기다림 끝에", "Oraen gidarim kkeute", "After a long wait"],
              ["넌 내게로 올 거야", "Neon naegero ol geoya", "You'll come back to me"],
              ["봄날처럼", "Bomnalcheoreom", "Like a spring day"],
            ]),
          },
        });
        await prisma.songCredit.create({
          data: { songId: springDay.id, artistId: bts.id, role: "PRIMARY" },
        });
      }
    }
  }

  console.log("✅ seed-bts-solos-apink: RM(+2) | Jungkook(+2) | Jimin(+2) | V(+2) | j-hope(+2) | Suga(+2) | Jin(+2) | APINK(+3) | BTS(+1)");
}
