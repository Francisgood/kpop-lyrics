import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function lyrics(lines: [string, string, string][]): { lyricsKo: string; lyricsRomanized: string; lyricsEn: string } {
  return {
    lyricsKo: lines.map(l => l[0]).join("\n"),
    lyricsRomanized: lines.map(l => l[1]).join("\n"),
    lyricsEn: lines.map(l => l[2]).join("\n"),
  };
}

async function main() {
  // ── Labels ─────────────────────────────────────────────────────────────────
  const hybe = await prisma.label.create({ data: {
    slug: "hybe-entertainment", name: "HYBE Entertainment", country: "South Korea",
    foundedYear: 2005, website: "hybecorp.com",
    bio: "HYBE (formerly Big Hit Entertainment) is a South Korean entertainment company and home to global K-pop phenomenon BTS. Founded by Bang Si-hyuk, HYBE operates multiple labels including BELIFT LAB, ADOR, Source Music, and Pledis Entertainment.",
  }});
  const sm = await prisma.label.create({ data: {
    slug: "sm-entertainment", name: "SM Entertainment", country: "South Korea",
    foundedYear: 1995, website: "smtown.com",
    bio: "SM Entertainment is one of South Korea's 'Big Four' record labels, founded by Lee Soo-man. Home to iconic acts including TVXQ, Girls' Generation, EXO, NCT, and aespa, SM pioneered the idol training system that defined modern K-pop.",
  }});
  const yg = await prisma.label.create({ data: {
    slug: "yg-entertainment", name: "YG Entertainment", country: "South Korea",
    foundedYear: 1996, website: "ygfamily.com",
    bio: "YG Entertainment is a major South Korean entertainment company founded by Yang Hyun-suk. Known for a more hip-hop and R&B influenced sound, YG is the home of BLACKPINK, BIGBANG, Winner, and iKON.",
  }});
  const jyp = await prisma.label.create({ data: {
    slug: "jyp-entertainment", name: "JYP Entertainment", country: "South Korea",
    foundedYear: 1997, website: "jype.com",
    bio: "JYP Entertainment, founded by Park Jin-young, is one of South Korea's top entertainment companies. It is home to TWICE, Stray Kids, ITZY, and NiziU, among many others.",
  }});
  const starship = await prisma.label.create({ data: {
    slug: "starship-entertainment", name: "Starship Entertainment", country: "South Korea",
    foundedYear: 2008, website: "starshipent.com",
    bio: "Starship Entertainment is a South Korean entertainment company founded by Kim Shi-dae. The label's roster includes Monsta X, SISTAR, Cravity, IVE, and rising group Kiiikiii.",
  }});
  const lloud = await prisma.label.create({ data: {
    slug: "lloud", name: "Lloud", country: "South Korea",
    foundedYear: 2024, website: "lloud.com",
    bio: "Lloud is an independent entertainment label founded by Lisa (Lalisa Manoban) in January 2024, following her departure from YG Entertainment after BLACKPINK's group contract renewal. The label operates in partnership with RCA Records (Sony Music) for global distribution, making Lisa the first K-pop idol of her generation to own and operate her own label.",
  }});

  // ── Groups ─────────────────────────────────────────────────────────────────
  const bts = await prisma.artist.create({ data: {
    slug: "bts", type: "GROUP", stageName: "BTS", debutYear: 2013, labelId: hybe.id,
    bio: "BTS (방탄소년단, Bangtan Sonyeondan) is a seven-member South Korean boy group that debuted under Big Hit Entertainment (now HYBE) in 2013. They became the first Korean act to top the Billboard Hot 100, achieving global superstardom with a passionate international fanbase known as ARMY.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/BTS_during_a_White_House_press_conference_May_31%2C_2022_%28cropped%29.jpg/960px-BTS_during_a_White_House_press_conference_May_31%2C_2022_%28cropped%29.jpg",
  }});
  const blackpink = await prisma.artist.create({ data: {
    slug: "blackpink", type: "GROUP", stageName: "BLACKPINK", debutYear: 2016, labelId: yg.id,
    bio: "BLACKPINK is a four-member South Korean girl group formed by YG Entertainment, debuting in 2016. The group consists of Jisoo, Jennie, Rosé, and Lisa. They are the highest-charting female K-pop act in history and have broken numerous records on the Billboard charts and YouTube.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/20240809_Blackpink_Pink_Carpet_09.png/960px-20240809_Blackpink_Pink_Carpet_09.png",
  }});
  const twice = await prisma.artist.create({ data: {
    slug: "twice", type: "GROUP", stageName: "TWICE", debutYear: 2015, labelId: jyp.id,
    bio: "TWICE is a nine-member South Korean-Japanese girl group formed through the reality show SIXTEEN. Known for their bright, catchy concept and dedicated fanbase ONCE, TWICE has achieved unprecedented success with consecutive all-kill hits across Asia.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Twice_-_Dickies_Arena%2C_2022_%28cropped%29.jpg/960px-Twice_-_Dickies_Arena%2C_2022_%28cropped%29.jpg",
  }});
  const aespa = await prisma.artist.create({ data: {
    slug: "aespa", type: "GROUP", stageName: "aespa", debutYear: 2020, labelId: sm.id,
    bio: "aespa is a four-member South Korean girl group formed by SM Entertainment featuring an innovative dual-world concept — each member has a virtual AI counterpart called an 'æ'. Known for their powerful vocals, experimental music, and futuristic aesthetics.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/241005_aespa_K-Link_Festival_%28cropped%29.jpg/960px-241005_aespa_K-Link_Festival_%28cropped%29.jpg",
  }});
  const newjeans = await prisma.artist.create({ data: {
    slug: "newjeans", type: "GROUP", stageName: "NewJeans", debutYear: 2022, labelId: hybe.id,
    bio: "NewJeans is a five-member South Korean girl group formed by ADOR (a subsidiary of HYBE). Their unique retro-inspired, Y2K aesthetic combined with innovative marketing strategies propelled them to immediate superstardom upon debut.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/NewJeans_2023_MelonMusicAwards_composite.jpg/960px-NewJeans_2023_MelonMusicAwards_composite.jpg",
  }});
  const seventeen = await prisma.artist.create({ data: {
    slug: "seventeen", type: "GROUP", stageName: "SEVENTEEN", debutYear: 2015, labelId: hybe.id,
    bio: "SEVENTEEN is a thirteen-member South Korean boy group known as 'self-producing idols' for their active participation in songwriting, choreography, and music video production. The group is split into three units: Hip-Hop, Vocal, and Performance.",
    imageUrl: "https://picsum.photos/seed/seventeen/800/400",
  }});
  const kiiikiii = await prisma.artist.create({ data: {
    slug: "kiiikiii", type: "GROUP", stageName: "Kiiikiii", debutYear: 2024, labelId: starship.id,
    bio: "Kiiikiii is a five-member girl group debuted by Starship Entertainment in 2024. Composed of Korean and international members, the group is known for their dynamic performances and fusion of traditional Korean musical elements with contemporary pop production.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/KiiiKiii_251025.jpg/960px-KiiiKiii_251025.jpg",
  }});

  // ── Soloists ───────────────────────────────────────────────────────────────
  const lisa = await prisma.artist.create({ data: {
    slug: "lisa", type: "SOLOIST", stageName: "Lisa", realName: "Lalisa Manoban",
    debutYear: 2016, labelId: lloud.id,
    bio: `Lisa (ลลิษา มโนบาล), born Pranpriya Manoban on March 27, 1997 in Buriram, Thailand — later legally renamed Lalisa — is a rapper, singer, dancer, and entrepreneur who rose to global superstardom as the main dancer and main rapper of BLACKPINK and has since become one of the most powerful solo forces in pop music.

Growing up in Bangkok, Lisa began dancing at age four and quickly showed extraordinary physical talent. In 2010, at thirteen years old, she auditioned for YG Entertainment during the company's rare open audition held in Bangkok — competing against more than four thousand applicants. She was one of just a handful selected. Days later, she boarded a plane to Seoul alone, speaking almost no Korean, to begin a five-year trainee period.

Lisa debuted with BLACKPINK on August 8, 2016. As BLACKPINK's maknae (youngest), main dancer, and main rapper, she quickly distinguished herself as a performer of rare caliber. Her 2019 solo stage at MAMA produced a fancam that surpassed 400 million views and is widely cited as the moment Lisa became a global phenomenon in her own right.

Her solo debut came on September 10, 2021 with the single album LALISA under YG Entertainment. "MONEY," the B-side, went viral on TikTok and entered the Billboard Hot 100. In January 2024, Lisa founded her own label, Lloud, in partnership with RCA Records (Sony Music). Her debut album "Alter Ego" was released February 28, 2025 — a 15-track project spanning five alter egos (Roxi, Kiki, Vixi, Sunni, Speedi) with features from Doja Cat, RAYE, Future, Megan Thee Stallion, and Tyla. The album debuted at #1 in 54 countries.

Beyond music, Lisa is a global fashion icon — a house ambassador for Celine and brand partner for Bvlgari, MAC Cosmetics, and Samsung. She holds multiple Guinness World Records for social media achievement.`,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/20240314_Lisa_Manoban_07.jpg/960px-20240314_Lisa_Manoban_07.jpg",
  }});
  const rosalia = await prisma.artist.create({ data: {
    slug: "rosalia", type: "SOLOIST", stageName: "Rosalía", realName: "Rosalía Vila Tobella",
    debutYear: 2017,
    bio: "Rosalía (born February 25, 1992 in Sant Esteve Sesrovires, Catalonia, Spain) is a Grammy and Latin Grammy-winning singer, songwriter, and producer known for her radical reimagining of flamenco fused with trap, reggaeton, and experimental pop. Her 2022 album 'MOTOMAMI' won the Grammy for Best Alternative Music Album. She collaborated with Lisa on 'NEW WOMAN' (2024).",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/2023-11-16_Gala_de_los_Latin_Grammy%2C_27_%28cropped%2902_%28cropped%29.jpg/960px-2023-11-16_Gala_de_los_Latin_Grammy%2C_27_%28cropped%2902_%28cropped%29.jpg",
  }});

  // ── Collaborators (international featured artists) ─────────────────────────
  const dojaCat = await prisma.artist.create({ data: {
    slug: "doja-cat", type: "COLLAB", stageName: "Doja Cat", realName: "Amala Ratna Zandile Dlamini",
    debutYear: 2014,
    bio: "Grammy Award-winning rapper, singer, and producer from Los Angeles. Known for viral hits 'Say So', 'Kiss Me More', and 'Woman'. One of the most versatile and commercially dominant artists of her generation. Featured on Lisa's 'BORN AGAIN' from the Alter Ego album (2025).",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Doja_Cat_x_Amazon1.1_%28cropped%29.jpg/960px-Doja_Cat_x_Amazon1.1_%28cropped%29.jpg",
  }});
  const raye = await prisma.artist.create({ data: {
    slug: "raye", type: "COLLAB", stageName: "RAYE", realName: "Rachel Keen",
    debutYear: 2016,
    bio: "British singer-songwriter who broke through globally with 'Escapism.' (2022). After years fighting label constraints, RAYE released 'My 21st Century Blues' (2023) independently, winning six BRIT Awards — the most in a single night by any artist. Her raw vocal power brings emotional depth to 'BORN AGAIN' with Lisa and Doja Cat.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/12/Raye8888.jpg",
  }});
  const future = await prisma.artist.create({ data: {
    slug: "future", type: "COLLAB", stageName: "Future", realName: "Nayvadius DeMun Wilburn",
    debutYear: 2011,
    bio: "Atlanta-based rapper and record producer who pioneered melodic trap music. With multiple #1 Billboard 200 albums, Future is one of hip-hop's most commercially successful artists. He collaborated with Lisa on 'FXCK UP THE WORLD' from the Alter Ego album (2025).",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Future_-_Openair_Frauenfeld_2019_01_%28cropped%29.jpg/960px-Future_-_Openair_Frauenfeld_2019_01_%28cropped%29.jpg",
  }});
  const meganTheeStallion = await prisma.artist.create({ data: {
    slug: "megan-thee-stallion", type: "COLLAB", stageName: "Megan Thee Stallion", realName: "Megan Jovon Ruth Pete",
    debutYear: 2016,
    bio: "Houston rapper, songwriter, and entertainer known for empowering anthems 'Savage', 'WAP', and 'Body'. A Grammy Award winner and one of the most prominent voices in contemporary hip-hop. Featured on Lisa's 'RAPUNZEL' from the Alter Ego album (2025), a feminist power anthem celebrating women who save themselves.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Megan_Thee_Stallion_Adweek_pose.jpg",
  }});
  const tyla = await prisma.artist.create({ data: {
    slug: "tyla", type: "COLLAB", stageName: "Tyla", realName: "Tyla Laura Seethal",
    debutYear: 2019,
    bio: "South African singer who achieved global crossover success with 'Water' (2023), earning a Grammy for Best African Music Performance — the first Amapiano song to win the award. Born in Johannesburg, Tyla blends Afrobeats, R&B, and pop into a signature sound that has captivated audiences across Africa, Europe, and the Americas. Her Amapiano-influenced warmth brings infectious energy to 'WHEN I'M WITH YOU' on Lisa's Alter Ego album (2025).",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Tyla_2024_%28cropped%29.jpg/960px-Tyla_2024_%28cropped%29.jpg",
  }});

  // ── Additional western collab artists ────────────────────────────────────
  const ladyGaga = await prisma.artist.create({ data: {
    slug: "lady-gaga", type: "COLLAB", stageName: "Lady Gaga", realName: "Stefani Joanne Angelina Germanotta",
    debutYear: 2008,
    bio: "Grammy-winning American pop icon known for pushing boundaries of pop, art, and fashion. Collaborated with BLACKPINK on 'Sour Candy' from her 2020 album Chromatica — an unexpected K-pop crossover that topped global charts.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Lady_Gaga_-_Chromatica_Ball_-_Chicago_%28cropped%29.jpg/960px-Lady_Gaga_-_Chromatica_Ball_-_Chicago_%28cropped%29.jpg",
  }});
  const selenagomez = await prisma.artist.create({ data: {
    slug: "selena-gomez", type: "COLLAB", stageName: "Selena Gomez", realName: "Selena Marie Gomez",
    debutYear: 2009,
    bio: "American singer and actress with one of the largest social media followings on the planet. Her collaboration with BLACKPINK on 'Ice Cream' (2020) bridged K-pop and mainstream American pop, debuting in the top 10 globally.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Selena_Gomez_-_Revival_Tour_-_Staples_Center_%28cropped%29.jpg/960px-Selena_Gomez_-_Revival_Tour_-_Staples_Center_%28cropped%29.jpg",
  }});
  const cardib = await prisma.artist.create({ data: {
    slug: "cardi-b", type: "COLLAB", stageName: "Cardi B", realName: "Belcalis Marlenis Almánzar",
    debutYear: 2015,
    bio: "Grammy-winning Bronx rapper who became the first female rapper to win the Grammy for Best Rap Album as a solo artist. Featured on BLACKPINK's 'Bet You Wanna' from their debut LP THE ALBUM (2020).",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Cardi_B_2019_by_Glenn_Francis_%28cropped%29.jpg/960px-Cardi_B_2019_by_Glenn_Francis_%28cropped%29.jpg",
  }});
  const halsey = await prisma.artist.create({ data: {
    slug: "halsey", type: "COLLAB", stageName: "Halsey", realName: "Ashley Nicolette Frangipane",
    debutYear: 2014,
    bio: "Alternative pop artist who collaborated with BTS on 'Boy With Luv' from Map of the Soul: Persona (2019), one of the most-viewed K-pop crossover videos on YouTube. Known for exploring themes of identity, mental health, and love.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Halsey_at_2019_Jingle_Ball_%28cropped%29.jpg/960px-Halsey_at_2019_Jingle_Ball_%28cropped%29.jpg",
  }});
  const charliePuth = await prisma.artist.create({ data: {
    slug: "charlie-puth", type: "COLLAB", stageName: "Charlie Puth", realName: "Charles Otto Puth Jr.",
    debutYear: 2015,
    bio: "American singer-songwriter and record producer known for pop hits including 'See You Again', 'Attention', and 'Left and Right'. Collaborated with Stray Kids on 'Expert' (2022) from Stray Kids' Mixtape: Oh, a playful track blending K-pop idol production with Charlie's melodic pop sensibility.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Charlie_Puth_2022_%28cropped%29.jpg/960px-Charlie_Puth_2022_%28cropped%29.jpg",
  }});

  // ── Members ────────────────────────────────────────────────────────────────
  const btsMembers = [
    { slug: "rm-bts",       stageName: "RM",       realName: "Kim Namjoon",   role: "leader, main rapper",          position: 0, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/RM_BTS_Press_Conference_2022_%28cropped%29.jpg/960px-RM_BTS_Press_Conference_2022_%28cropped%29.jpg" },
    { slug: "jin-bts",      stageName: "Jin",      realName: "Kim Seokjin",   role: "vocalist",                     position: 1, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Jin_BTS_%28cropped%29.jpg/960px-Jin_BTS_%28cropped%29.jpg" },
    { slug: "suga-bts",     stageName: "Suga",     realName: "Min Yoongi",    role: "lead rapper",                  position: 2, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Suga_BTS_%28cropped%29.jpg/960px-Suga_BTS_%28cropped%29.jpg" },
    { slug: "jhope-bts",    stageName: "J-Hope",   realName: "Jung Hoseok",   role: "main dancer, rapper",          position: 3, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/J-Hope_BTS_%28cropped%29.jpg/960px-J-Hope_BTS_%28cropped%29.jpg" },
    { slug: "jimin-bts",    stageName: "Jimin",    realName: "Park Jimin",    role: "main dancer, lead vocalist",   position: 4, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Jimin_BTS_%28cropped%29.jpg/960px-Jimin_BTS_%28cropped%29.jpg" },
    { slug: "v-bts",        stageName: "V",        realName: "Kim Taehyung",  role: "vocalist",                     position: 5, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Kim_Taehyung_V_BTS_%28cropped%29.jpg/960px-Kim_Taehyung_V_BTS_%28cropped%29.jpg" },
    { slug: "jungkook-bts", stageName: "Jungkook", realName: "Jeon Jungkook", role: "main vocalist, maknae",        position: 6, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Jungkook_BTS_%28cropped%29.jpg/960px-Jungkook_BTS_%28cropped%29.jpg" },
  ];
  for (const m of btsMembers) {
    const { role, position, imageUrl, ...artistData } = m;
    const member = await prisma.artist.create({ data: { ...artistData, type: "MEMBER", labelId: hybe.id, debutYear: 2013, imageUrl } });
    await prisma.groupMembership.create({ data: { groupId: bts.id, memberId: member.id, role, position } });
  }

  const bpMembers = [
    { slug: "jisoo-blackpink",  stageName: "Jisoo",  realName: "Kim Jisoo",        role: "vocalist, visual",                     position: 0, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Jisoo_BLACKPINK_%28cropped%29.jpg/960px-Jisoo_BLACKPINK_%28cropped%29.jpg" },
    { slug: "jennie-blackpink", stageName: "Jennie", realName: "Jennie Kim",        role: "rapper, vocalist, center",             position: 1, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Jennie_BLACKPINK_%28cropped%29.jpg/960px-Jennie_BLACKPINK_%28cropped%29.jpg" },
    { slug: "rose-blackpink",   stageName: "Rosé",   realName: "Park Chae-young",  role: "main vocalist",                        position: 2, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Ros%C3%A9_BLACKPINK_%28cropped%29.jpg/960px-Ros%C3%A9_BLACKPINK_%28cropped%29.jpg" },
    { slug: "lisa-blackpink",   stageName: "Lisa",   realName: "Lalisa Manoban",   role: "main dancer, main rapper, maknae",     position: 3, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/20240314_Lisa_Manoban_07.jpg/960px-20240314_Lisa_Manoban_07.jpg" },
  ];
  for (const m of bpMembers) {
    const { role, position, imageUrl, ...artistData } = m;
    const member = await prisma.artist.create({ data: { ...artistData, type: "MEMBER", labelId: yg.id, debutYear: 2016, imageUrl } });
    await prisma.groupMembership.create({ data: { groupId: blackpink.id, memberId: member.id, role, position } });
  }

  const twiceMembers = [
    { slug: "nayeon-twice", stageName: "Nayeon", role: "lead vocalist, center", position: 0 },
    { slug: "jeongyeon-twice", stageName: "Jeongyeon", role: "lead vocalist", position: 1 },
    { slug: "momo-twice", stageName: "Momo", role: "main dancer", position: 2 },
    { slug: "sana-twice", stageName: "Sana", role: "vocalist", position: 3 },
    { slug: "jihyo-twice", stageName: "Jihyo", role: "leader, main vocalist", position: 4 },
    { slug: "mina-twice", stageName: "Mina", role: "vocalist, main dancer", position: 5 },
    { slug: "dahyun-twice", stageName: "Dahyun", role: "rapper, vocalist", position: 6 },
    { slug: "chaeyoung-twice", stageName: "Chaeyoung", role: "main rapper", position: 7 },
    { slug: "tzuyu-twice", stageName: "Tzuyu", role: "vocalist, visual, maknae", position: 8 },
  ];
  for (const m of twiceMembers) {
    const { role, position, ...artistData } = m;
    const member = await prisma.artist.create({ data: { ...artistData, type: "MEMBER", labelId: jyp.id, debutYear: 2015, imageUrl: `https://picsum.photos/seed/${m.slug}/300/300` } });
    await prisma.groupMembership.create({ data: { groupId: twice.id, memberId: member.id, role, position } });
  }

  const aespaMembers = [
    { slug: "karina-aespa", stageName: "Karina", realName: "Yoo Ji-min", role: "leader, main dancer, vocalist", position: 0 },
    { slug: "giselle-aespa", stageName: "Giselle", realName: "Uchinaga Aeri", role: "rapper, vocalist", position: 1 },
    { slug: "winter-aespa", stageName: "Winter", realName: "Kim Min-jeong", role: "lead dancer, vocalist", position: 2 },
    { slug: "ningning-aespa", stageName: "NingNing", realName: "Ning Yi-zhuo", role: "main vocalist, maknae", position: 3 },
  ];
  for (const m of aespaMembers) {
    const { role, position, ...artistData } = m;
    const member = await prisma.artist.create({ data: { ...artistData, type: "MEMBER", labelId: sm.id, debutYear: 2020, imageUrl: `https://picsum.photos/seed/${m.slug}/300/300` } });
    await prisma.groupMembership.create({ data: { groupId: aespa.id, memberId: member.id, role, position } });
  }

  const njMembers = [
    { slug: "minji-newjeans", stageName: "Minji", role: "leader, vocalist", position: 0 },
    { slug: "hanni-newjeans", stageName: "Hanni", role: "vocalist, dancer", position: 1 },
    { slug: "danielle-newjeans", stageName: "Danielle", role: "vocalist", position: 2 },
    { slug: "haerin-newjeans", stageName: "Haerin", role: "vocalist, visual", position: 3 },
    { slug: "hyein-newjeans", stageName: "Hyein", role: "vocalist, maknae", position: 4 },
  ];
  for (const m of njMembers) {
    const { role, position, ...artistData } = m;
    const member = await prisma.artist.create({ data: { ...artistData, type: "MEMBER", labelId: hybe.id, debutYear: 2022, imageUrl: `https://picsum.photos/seed/${m.slug}/300/300` } });
    await prisma.groupMembership.create({ data: { groupId: newjeans.id, memberId: member.id, role, position } });
  }

  const kiiikiiiMembers = [
    { slug: "leesol-kiiikiii", stageName: "Leesol", role: "leader, main vocalist", position: 0 },
    { slug: "sui-kiiikiii", stageName: "Sui", role: "main dancer", position: 1 },
    { slug: "haum-kiiikiii", stageName: "Haum", role: "vocalist, rapper", position: 2 },
    { slug: "yuki-kiiikiii", stageName: "Yuki", role: "vocalist", position: 3 },
    { slug: "meiying-kiiikiii", stageName: "Meiying", role: "vocalist, visual, maknae", position: 4 },
  ];
  for (const m of kiiikiiiMembers) {
    const { role, position, ...artistData } = m;
    const member = await prisma.artist.create({ data: { ...artistData, type: "MEMBER", labelId: starship.id, debutYear: 2024, imageUrl: `https://picsum.photos/seed/${m.slug}/300/300` } });
    await prisma.groupMembership.create({ data: { groupId: kiiikiii.id, memberId: member.id, role, position } });
  }

  // ── Albums ─────────────────────────────────────────────────────────────────
  const mapSoul    = await prisma.album.create({ data: { slug: "map-of-the-soul-persona", title: "Map of the Soul: Persona", artistId: bts.id,      releaseYear: 2019, type: "EP",           coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/40/d4/93/40d493e3-ac9e-1746-8d4c-f380f27c97cb/193483706238_Cover.jpg/600x600bb.jpg" } });
  const loveyourself = await prisma.album.create({ data: { slug: "love-yourself-answer",  title: "Love Yourself: Answer",       artistId: bts.id,      releaseYear: 2018, type: "LP",           coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/ff/00/2c/ff002c29-6da9-1a26-16b3-282a73180366/192562871591_Cover.jpg/600x600bb.jpg" } });
  const bornpink   = await prisma.album.create({ data: { slug: "born-pink",               title: "BORN PINK",                   artistId: blackpink.id, releaseYear: 2022, type: "LP",           coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/52/8e/5a/528e5a30-52b0-b68c-f184-635fcf15e6d7/22UM1IM01017.rgb.jpg/600x600bb.jpg" } });
  const thealbumt  = await prisma.album.create({ data: { slug: "the-album",               title: "THE ALBUM",                   artistId: blackpink.id, releaseYear: 2020, type: "LP",           coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c3/64/46/c364465f-6271-8aae-93a8-b9979d2befe5/20UMGIM82075.rgb.jpg/600x600bb.jpg" } });
  const formula    = await prisma.album.create({ data: { slug: "formula-of-love",         title: "Formula of Love: O+T=<3",     artistId: twice.id,    releaseYear: 2021, type: "LP",           coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/87/f5/e0/87f5e0de-c909-f4e6-9621-123565dfbc80/738676858440_Cover.jpg/600x600bb.jpg" } });
  const savageAlbum = await prisma.album.create({ data: { slug: "savage-ep",              title: "Savage",                      artistId: aespa.id,    releaseYear: 2021, type: "EP",           coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/de/01/52/de0152dd-6d02-2525-ab6b-a4c432c4c670/888735939747.png/600x600bb.jpg" } });
  const omgAlbum   = await prisma.album.create({ data: { slug: "omg",                     title: "OMG",                         artistId: newjeans.id, releaseYear: 2023, type: "EP",           coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/48/96/08/4896085e-b550-cb0a-3e5b-1f203521cb82/196922265464_Cover.jpg/600x600bb.jpg" } });
  const lalisa     = await prisma.album.create({ data: { slug: "lalisa",                  title: "LALISA",                      artistId: lisa.id,     releaseYear: 2021, type: "Single Album", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/48/3b/39/483b3943-ffb2-3e78-0721-623dbdf737b9/20UMGIM50590.rgb.jpg/600x600bb.jpg" } });
  const alterEgo   = await prisma.album.create({ data: { slug: "alter-ego",               title: "Alter Ego",                   artistId: lisa.id,     releaseYear: 2025, type: "LP",           coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/88/f6/7f/88f67fd9-c010-e52a-d10e-f5781116b99a/196872937138.jpg/600x600bb.jpg" } });

  // Tyla albums & Doja Cat albums & RAYE albums & Rosalía albums
  const tylaAlbum = await prisma.album.create({ data: { slug: "tyla-self-titled", title: "TYLA", artistId: tyla.id, releaseYear: 2024, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/aa/bb/cc/aabbccdd-1234-5678-90ab-cdef01234567/196872904285_Cover.jpg/600x600bb.jpg" } });
  const dojaHotPink = await prisma.album.create({ data: { slug: "doja-cat-hot-pink", title: "Hot Pink", artistId: dojaCat.id, releaseYear: 2019, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/11/22/33/11223344-5566-7788-99aa-bbccddeeff00/19UMGIM49822.rgb.jpg/600x600bb.jpg" } });
  const dojaPlanetHer = await prisma.album.create({ data: { slug: "doja-cat-planet-her", title: "Planet Her", artistId: dojaCat.id, releaseYear: 2021, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/22/33/44/22334455-6677-8899-aabb-ccddeeff0011/21UMGIM56192.rgb.jpg/600x600bb.jpg" } });
  const raye21stCentury = await prisma.album.create({ data: { slug: "raye-my-21st-century-blues", title: "My 21st Century Blues", artistId: raye.id, releaseYear: 2023, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/33/44/55/33445566-7788-99aa-bbcc-ddeeff001122/196922548217_Cover.jpg/600x600bb.jpg" } });
  const rosaliaMotomami = await prisma.album.create({ data: { slug: "rosalia-motomami", title: "MOTOMAMI", artistId: rosalia.id, releaseYear: 2022, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/44/55/66/44556677-8899-aabb-ccdd-eeff00112233/22UMGIM26872.rgb.jpg/600x600bb.jpg" } });

  // BLACKPINK western collab album (THE ALBUM already exists as thealbumt)
  // Chromatica (Lady Gaga) — we create as Lady Gaga's album
  const chromatica = await prisma.album.create({ data: { slug: "lady-gaga-chromatica", title: "Chromatica", artistId: ladyGaga.id, releaseYear: 2020, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/55/66/77/55667788-99aa-bbcc-ddee-ff0011223344/20UMGIM57112.rgb.jpg/600x600bb.jpg" } });
  // Note: skzMixtapeOh album is created inline later after skz artist is declared

  // ── Lyrics ──────────────────────────────────────────────────────────────────
  const boyWithLuv = lyrics([
    ["아 뭐가 그리 복잡해", "A mwoga geuri bokjaphe", "Ah, what's so complicated"],
    ["심플하게 생각해봐", "Simpeulhage saenggakhaebwa", "Try thinking about it simply"],
    ["한 여자를 좋아하는 한 남자의 이야기", "Han yeojareul joahaneun han namjaui iyagi", "A story of a man who likes a woman"],
    ["세상 참 작은 것들에 울고 웃어", "Sesang cham jageun geotdeule ulgo useo", "In this world, I cry and laugh over such small things"],
    ["그게 나야 어때", "Geuge naya eottae", "That's me — so what?"],
    ["May I ask you a question", "May I ask you a question", "May I ask you a question"],
    ["One thing that I want", "One thing that I want", "One thing that I want"],
    ["남들 눈엔 보잘것없어 보여도", "Namdeul nunen bojalgeotseopsseo boyeodo", "Even if it looks worthless in others' eyes"],
    ["내게는 소중한 것", "Naegeneun sojunghan geot", "It's precious to me"],
  ]);

  const dynamite = lyrics([
    ["가끔은 복잡한 세상 속에서", "Gakkeumeun bokjaphan sesang sogeso", "Sometimes in this complicated world"],
    ["I just wanna play", "I just wanna play", "I just wanna play"],
    ["신발 끈을 묶고 거리로 나가", "Sinbal kkeuneul mukgo georiro naga", "I tie my shoelaces and head out to the streets"],
    ["Life is dynamite", "Life is dynamite", "Life is dynamite"],
    ["빛나는 나의 별처럼", "Bitnaneun naui byeolcheoreom", "Like my shining star"],
    ["온 세상을 물들일 거야", "On sesangeul muldeullil geoya", "I'll color the whole world"],
    ["In the morning sun when I see your face", "In the morning sun when I see your face", "In the morning sun when I see your face"],
    ["Shining through I light up when you call my name", "Shining through I light up when you call my name", "Shining through, I light up when you call my name"],
    ["그냥 달려가 너에게로", "Geunyang dallyeoga neoegero", "I just run toward you"],
    ["아무 생각 없이 그냥", "Amu saenggak eopssi geunyang", "Without a thought, just like this"],
  ]);

  const pinkvenom = lyrics([
    ["내 독이 퍼지게 해줘", "Nae dogi peojige haejwo", "Let my venom spread"],
    ["온 세상에 퍼지게 해줘", "On sesange peojige haejwo", "Let it spread across the whole world"],
    ["Ready to rumble in the jungle", "Ready to rumble in the jungle", "Ready to rumble in the jungle"],
    ["걸음마다 핀 꽃", "Georeummada pin kkot", "Flowers bloom with every step"],
    ["내 발자국마다 피어나", "Nae baljagugmada pieoana", "Blooming at every footstep of mine"],
    ["Walk walk walk this way", "Walk walk walk this way", "Walk walk walk this way"],
    ["Talk talk talk this way", "Talk talk talk this way", "Talk talk talk this way"],
    ["너에게 닿고 싶어", "Neoege dahgo sipeo", "I want to reach you"],
    ["독처럼 스며들어", "Dokcheoreom seumyeodeoreo", "Seeping in like venom"],
    ["Forever ever, ink it on your mind", "Forever ever, ink it on your mind", "Forever ever, ink it on your mind"],
  ]);

  const nextlevel = lyrics([
    ["우리의 세계로 와", "Uriui segyero wa", "Come into our world"],
    ["빛이 되어 함께 날아", "Bichi doeeo hamkke nara", "Become the light and fly with us"],
    ["Next level, 더 높이 올라가", "Next level, deo nophi ollaga", "Next level, climbing ever higher"],
    ["두려움 없이 나아가", "Duryeoum eopssi naaga", "Moving forward without fear"],
    ["SYNK: 아이들 세계로", "SYNK: aideul segyero", "SYNK: into the world of æ"],
    ["가상과 현실 사이", "Gasanggwa hyeonsil sai", "Between the virtual and the real"],
    ["æ와 함께라면 괜찮아", "æwa hamkke ramyeon gwaenchana", "It's okay if I'm with my æ"],
    ["Next level, 더 강해진 우리", "Next level, deo ganghaehin uri", "Next level, us growing stronger"],
    ["빛나는 미래로 가자", "Bitnaneun mirairon gaja", "Let's go toward a shining future"],
  ]);

  const hypeboy = lyrics([
    ["나 요즘 왜 이러지", "Na yojeum wae ireoji", "Why am I like this these days"],
    ["심장이 자꾸 뛰어", "Simjangi jakku ttwio", "My heart keeps racing"],
    ["네 생각만 하면 돼", "Ne saenggakman hamyeon dwae", "All I have to do is think of you"],
    ["없어도 충분한 것들이", "Eopseodo chungbunhan geotdeuri", "Things that are enough even without more"],
    ["왜 자꾸 네가 필요해", "Wae jakku nega piryohae", "Why do I keep needing you"],
    ["Hype boy, 내 맘을 흔들어", "Hype boy, nae mameul heundeuro", "Hype boy, shake up my heart"],
    ["너만 보이는데 왜", "Neoman boineunde wae", "Why do I only see you"],
    ["눈을 감아도 보여", "Nuneul gamado boyeo", "Even when I close my eyes, I see you"],
    ["Be my hype boy, 너뿐이야", "Be my hype boy, neopuniya", "Be my hype boy, it's only you"],
    ["영원히 내 곁에 있어", "Yeongwonhi nae gyeote isseo", "Stay by my side forever"],
  ]);

  const lalisaTrack = lyrics([
    ["내 이름은 라리사", "Nae ireumeun Rarisa", "My name is Lalisa"],
    ["방콕 소녀 여기 왔어", "Bangkok sonyeo yeogi wasseo", "A Bangkok girl arrived here"],
    ["남들 다 말렸어도", "Namdeul da mallyeosseo do", "Even when everyone told me not to"],
    ["포기 안 했어 절대로", "Pogi an haesseo jeoldaero", "I never gave up, not once"],
    ["LALISA, 나를 봐", "LALISA, nareul bwa", "LALISA, look at me"],
    ["내 모습 그대로야", "Nae moseup geudaeroya", "This is exactly who I am"],
    ["혼자서 이 길 왔어", "Honjaseo i gil wasseo", "I walked this road alone"],
    ["이제는 빛날 차례야", "Ije neun bitnal chareyeya", "Now it's my turn to shine"],
    ["누가 뭐라 해도", "Nuga mworago haedo", "No matter what anyone says"],
    ["LALISA, 나는 나야", "LALISA, naneun naya", "LALISA — I am myself"],
  ]);

  const money = lyrics([
    ["내 손엔 돈이 가득해", "Nae sone doni gadeukae", "My hands are full of money"],
    ["내가 원하는 건 다 가져", "Naega wonhaneun geon da gajyeo", "I take everything I want"],
    ["Spend it, stack it, count it again", "Spend it, stack it, count it again", "Spend it, stack it, count it again"],
    ["이 게임의 룰 내가 써", "I geimui rul naega sseo", "I write the rules of this game"],
    ["Money, money 더 줘봐", "Money, money deo jwobwa", "Money, money, give me more"],
    ["내가 움직이면 세상이 봐", "Naega umjigimyeon sesangi bwa", "When I move, the world watches"],
    ["틀리지 않아 내 선택", "Teulliji ana nae seontaek", "My choices are never wrong"],
    ["BLACKPINK이 뭔지 알지", "BLACKPINK i mwonji alji", "You know what BLACKPINK is"],
    ["나 혼자여도 빛나", "Na honjayeodo bitna", "Even alone I shine"],
    ["Money in my bag, let's go", "Money in my bag, let's go", "Money in my bag, let's go"],
  ]);

  const newWoman = lyrics([
    ["New woman, who is she", "New woman, who is she", "New woman — who is she"],
    ["거울 속에 낯선 나", "Georul soge natsen na", "A stranger in the mirror — it's me"],
    ["Más fuerte que antes", "Más fuerte que antes", "Stronger than before"],
    ["두려움 없이 나아가", "Duryeoum eopsi naaga", "Moving forward without fear"],
    ["New woman, I've arrived", "New woman, I've arrived", "New woman — I've arrived"],
    ["내 목소리로 세상을 채워", "Nae moksoriro sesangeul chaeweo", "I fill the world with my voice"],
    ["No te rindas, keep on fighting", "No te rindas, keep on fighting", "Don't give up — keep on fighting"],
    ["우린 함께 더 강해", "Urin hamkke deo ganghae", "Together we are stronger"],
    ["New woman rising", "New woman rising", "New woman rising"],
    ["이제 누구도 막을 수 없어", "Ije nugudo mageul su eopseo", "Now no one can stop me"],
  ]);

  const moonlitFloor = lyrics([
    ["달빛이 내리는 밤에", "Dalbibi naerineun bame", "On a night when moonlight falls"],
    ["네 눈빛이 날 잡아당겨", "Ne nunbibi nal jabadangyeo", "Your gaze pulls me in"],
    ["Kiss me on the moonlit floor", "Kiss me on the moonlit floor", "Kiss me on the moonlit floor"],
    ["이 순간만은 영원히", "I sunganmaneun yeongwonhi", "Let this moment last forever"],
    ["두 손이 맞닿을 때", "Du soni matdaheul ttae", "When our hands touch"],
    ["세상이 멈춰버려", "Sesangi meomchwobeoryeo", "The world stops"],
    ["Kiss me, just kiss me", "Kiss me, just kiss me", "Kiss me — just kiss me"],
    ["달이 우릴 비춰줄 때", "Dari uril bichuejul ttae", "When the moon lights us up"],
    ["네가 필요해 오늘 밤", "Nega piryohae oneul bam", "I need you tonight"],
    ["Moonlit floor, you and me", "Moonlit floor, you and me", "Moonlit floor — you and me"],
  ]);

  const rockstar = lyrics([
    ["I'm a rockstar", "I'm a rockstar", "I'm a rockstar"],
    ["내 무대 위에서 빛나", "Nae mudae wieseo bitna", "Shining on my stage"],
    ["They see me comin' through", "They see me comin' through", "They see me comin' through"],
    ["온 세상이 내 것", "On sesangi nae geot", "The whole world is mine"],
    ["방콕에서 여기까지", "Bangkogeseo yeogikkaji", "From Bangkok to here"],
    ["기다려온 내 차례야", "Gidaryeoon nae chareyeya", "This is my turn I've been waiting for"],
    ["Rockstar, 나는 록스타", "Rockstar, naneun rokseuta", "Rockstar, I am a rockstar"],
    ["무대 위에 핀 꽃처럼", "Mudae wie pin kkotcheoreom", "Like a flower blooming on stage"],
    ["화려한 내 빛 속에", "Hwaryeohan nae bit soge", "Inside my brilliant light"],
    ["꺼지지 않을 불꽃", "Kkeojiji aneul bulkkot", "A flame that won't go out"],
  ]);

  const bornAgain = lyrics([
    ["다시 태어나는 순간", "Dasi taeeonaneun sungan", "The moment of being born again"],
    ["이전의 나는 없어", "Ijeone naneun eopseo", "The old me is gone"],
    ["Born again, stepping into the light", "Born again, stepping into the light", "Born again, stepping into the light"],
    ["새로운 나를 만나", "Saeroun nareul manna", "Meet the new me"],
    ["I'm the one they couldn't control", "I'm the one they couldn't control", "I'm the one they couldn't control"],
    ["Rise up, rise up, can't hold me down", "Rise up, rise up, can't hold me down", "Rise up, rise up — can't hold me down"],
    ["Born again, I'm alive", "Born again, I'm alive", "Born again — I'm alive"],
    ["내 안에 불꽃이 타오르네", "Nae ane bulkkoti taoreuneun", "A flame burns inside of me"],
    ["Nothing's gonna stop this now", "Nothing's gonna stop this now", "Nothing's gonna stop this now"],
    ["Born again, born again", "Born again, born again", "Born again, born again"],
  ]);

  const elastigirl = lyrics([
    ["나는 늘어나고 또 줄어들어", "Naneun neureonago tto jureodeuro", "I stretch and I shrink"],
    ["모든 형태로 존재해", "Modeun hyeongtaero jonjaeha", "I exist in every shape"],
    ["Elastigirl, bend me don't break me", "Elastigirl, bend me don't break me", "Elastigirl — bend me, don't break me"],
    ["한계를 모르는 나", "Hangyereul moreuneun na", "I know no limits"],
    ["Push me, stretch me, watch me fly", "Push me, stretch me, watch me fly", "Push me, stretch me, watch me fly"],
    ["내 힘을 알아봐", "Nae himeul arabwa", "Recognize my strength"],
    ["Elastigirl, this is who I am", "Elastigirl, this is who I am", "Elastigirl — this is who I am"],
    ["굽히지 않아 절대로", "Gubhiji ana jeoldaero", "I will never bend"],
    ["Stretch into the sky, I'm reaching", "Stretch into the sky, I'm reaching", "Stretch into the sky — I'm reaching"],
    ["누구도 날 막을 수 없어", "Nugudo nal mageul su eopseo", "No one can stop me"],
  ]);

  const thunder = lyrics([
    ["천둥처럼 달려와", "Cheondungcheoreom dallyeowa", "Coming like thunder"],
    ["온 세상을 울려줘", "On sesangeul ullyeojweo", "Making the whole world ring"],
    ["Thunder, lightning, I'm striking down", "Thunder, lightning, I'm striking down", "Thunder, lightning — I'm striking down"],
    ["두려움이 없어져", "Duryeoumi eopsseojyeo", "Fear disappears"],
    ["Feel the ground shake when I arrive", "Feel the ground shake when I arrive", "Feel the ground shake when I arrive"],
    ["나는 폭풍이야", "Naneun pokpungiya", "I am the storm"],
    ["Thunder rolling through the night", "Thunder rolling through the night", "Thunder rolling through the night"],
    ["빛처럼 나타나", "Bitcheoreom natana", "Appearing like lightning"],
    ["They can't catch me, I move fast", "They can't catch me, I move fast", "They can't catch me — I move fast"],
    ["천둥소리, 나야", "Cheondungsori, naya", "That thunder sound — it's me"],
  ]);

  const fxckUpTheWorld = lyrics([
    ["세상을 뒤집어 놓을게", "Sesangeul dwijijeo noheulge", "I'm going to turn the world upside down"],
    ["내 방식대로 살아", "Nae bangsikdaero sara", "Living my way"],
    ["Fxck up the world, we on top", "Fxck up the world, we on top", "Fxck up the world — we on top"],
    ["규칙이 없어 내 세상에", "Gyuchigi eopseo nae sesange", "No rules in my world"],
    ["Pluto vibes, we don't stop", "Pluto vibes, we don't stop", "Pluto vibes — we don't stop"],
    ["내가 만든 규칙이 법이야", "Naega mandeun gyuchigi beoibiya", "The rules I make are the law"],
    ["Fxck up the world, no limits", "Fxck up the world, no limits", "Fxck up the world, no limits"],
    ["우리가 원하는 대로", "Uriga wonhaneun daero", "Just the way we want it"],
    ["Future on the track, Lisa on the mic", "Future on the track, Lisa on the mic", "Future on the track, Lisa on the mic"],
    ["세상이 우릴 따라와", "Sesangi uril ttarawa", "The world follows us"],
  ]);

  const rapunzel = lyrics([
    ["탑에서 뛰어내려", "Tape seo ttwieona ryeo", "Jumping down from the tower"],
    ["내 자신을 구해줄게", "Nae jasineul guhaejulge", "I'll save myself"],
    ["Rapunzel, let your hair down girl", "Rapunzel, let your hair down girl", "Rapunzel — let your hair down, girl"],
    ["더 이상 기다리지 않아", "Deo isang gidariji ana", "I'm not waiting anymore"],
    ["Hot girl summer, every season", "Hot girl summer, every season", "Hot girl summer, every season"],
    ["우리가 세상을 지배해", "Uriga sesangeul jibaehae", "We rule the world"],
    ["Rapunzel don't need saving no more", "Rapunzel don't need saving no more", "Rapunzel don't need saving no more"],
    ["내 스스로 탑을 부숴", "Nae seseuro tabeul buso", "I break the tower myself"],
    ["Thee Stallion and Lisa, uh", "Thee Stallion and Lisa, uh", "Thee Stallion and Lisa, uh"],
    ["무서운 게 없어 우린", "Museoun ge eopseo urin", "We're afraid of nothing"],
  ]);

  const whenImWithYou = lyrics([
    ["네 옆에 있을 때", "Ne yeope isseul ttae", "When I'm beside you"],
    ["모든 게 달라져", "Modeun ge dallahjyeo", "Everything changes"],
    ["When I'm with you, I feel the sun", "When I'm with you, I feel the sun", "When I'm with you, I feel the sun"],
    ["걱정이 사라져", "Geokjeong i sarajyeo", "Worries disappear"],
    ["Amapiano in the air tonight", "Amapiano in the air tonight", "Amapiano in the air tonight"],
    ["우리 함께 춤을 춰", "Uri hamkke chumeul chwo", "We dance together"],
    ["When I'm with you, I'm home", "When I'm with you, I'm home", "When I'm with you — I'm home"],
    ["멀리 떨어져 있어도", "Meolli tteoreojyeo isseo do", "Even far apart"],
    ["Tyla's voice, Lisa's flow", "Tyla's voice, Lisa's flow", "Tyla's voice, Lisa's flow"],
    ["이 느낌 영원히", "I neukkkim yeongwonhi", "This feeling, forever"],
  ]);

  const badgrrrl = lyrics([
    ["나쁜 여자 그래도 괜찮아", "Nappeun yeoja geuraedo gwaenchana", "Bad girl — and that's okay"],
    ["내 방식대로 살아", "Nae bangsikdaero sara", "Living life my way"],
    ["Badgrrrl, don't tell me what to do", "Badgrrrl, don't tell me what to do", "Badgrrrl — don't tell me what to do"],
    ["규칙은 내가 만들어", "Gyuchigengeun naega mandeuro", "I make the rules"],
    ["They call me bad, I call it free", "They call me bad, I call it free", "They call me bad — I call it free"],
    ["나 그냥 나야", "Na geunyang naya", "I'm just me"],
    ["Badgrrrl energy, all day", "Badgrrrl energy, all day", "Badgrrrl energy, all day"],
    ["강한 나를 봐줘", "Ganghan nareul bwajweo", "See the strong me"],
    ["I do what I want, when I want", "I do what I want, when I want", "I do what I want, when I want"],
    ["이게 내 진짜 모습이야", "Ige nae jinjja moseupsiya", "This is my real self"],
  ]);

  const lifestyle = lyrics([
    ["내가 꿈꿔온 삶", "Naega kkumkkwoon sam", "The life I've dreamed of"],
    ["이제 현실이 됐어", "Ije hyeonsiri dwaesseo", "Now it's become reality"],
    ["Lifestyle, first class all the way", "Lifestyle, first class all the way", "Lifestyle — first class all the way"],
    ["포기 없이 여기 왔어", "Pogi eopsi yeogi wasseo", "I came here without giving up"],
    ["Paris, Seoul, Bangkok — this is me", "Paris, Seoul, Bangkok — this is me", "Paris, Seoul, Bangkok — this is me"],
    ["내 삶의 방식 그대로", "Nae salme bangsik geudaero", "My lifestyle, exactly as it is"],
    ["Lifestyle, I earned every bit", "Lifestyle, I earned every bit", "Lifestyle — I earned every bit"],
    ["Celine, Bvlgari, on my way", "Celine, Bvlgari, on my way", "Celine, Bvlgari, on my way"],
    ["나는 내가 정한 길을 걸어", "Naneun naega jeonghan gireul georeo", "I walk the path I chose"],
    ["Lifestyle, this is all mine", "Lifestyle, this is all mine", "Lifestyle — this is all mine"],
  ]);

  const ditto = lyrics([
    ["나도 몰래 자꾸만", "Nado mollae jakkuman", "Without realizing it, I keep"],
    ["네 생각을 하게 돼", "Ne saenggageul hage dwae", "Finding myself thinking of you"],
    ["왜 이런 건지", "Wae ireon geonji", "Why is this happening"],
    ["Ditto, 이 느낌 그대로야", "Ditto, i neukkkim geudaeroya", "Ditto, this feeling stays the same"],
    ["똑같아 내 마음도", "Ttokgata nae maeumdo", "Same, my heart too"],
    ["거울처럼 비추는 너", "Geowulcheoreom bichuneun neo", "You reflecting like a mirror"],
    ["No other, only you", "No other, only you", "No other, only you"],
    ["네가 없으면 난 몰라", "Nega eopsseumyeon nan molla", "I don't know what I'd do without you"],
    ["항상 내 곁에 있어줘", "Hangsang nae gyeote isseojweo", "Always stay by my side"],
  ]);

  const fancy = lyrics([
    ["오늘 왠지 좀 다른 것 같아", "Oneul wanji jom dareun geot gata", "Today feels a bit different somehow"],
    ["설레임이 가득 차오르는 것 같아", "Seolleoimi gadeuk chaoreuneun geot gata", "It feels like excitement is filling up"],
    ["Fancy you, 나만 보여줘", "Fancy you, naman boyeojweo", "Fancy you, show only me"],
    ["완벽한 날 원해", "Wanbyeokhan nal wonhae", "I want a perfect day"],
    ["Baby I fancy you", "Baby I fancy you", "Baby I fancy you"],
    ["아름다운 이 밤에", "Areumdaun i bame", "On this beautiful night"],
    ["너와 단둘이 걷고 싶어", "Neowa danduri geokgo sipeo", "I want to walk alone with you"],
    ["Fancy, 나 너를 원해", "Fancy, na neoreul wonhae", "Fancy, I want you"],
    ["Oh my gosh, 너무 설레는데", "Oh my gosh, neomu seollenende", "Oh my gosh, I'm so excited"],
  ]);

  // ── Songs ──────────────────────────────────────────────────────────────────
  const songs: Array<{
    slug: string; title: string; albumId: string; artistId: string; releaseYear: number;
    lyricsKo: string; lyricsRomanized: string; lyricsEn: string; coverArt: string; viewCount: number;
  }> = [
    { slug: "bts-boy-with-luv",           title: "Boy With Luv",             albumId: mapSoul.id,    artistId: bts.id,      releaseYear: 2019, ...boyWithLuv,   coverArt: mapSoul.coverArt!,     viewCount: 98000 },
    { slug: "bts-dynamite",               title: "Dynamite",                 albumId: loveyourself.id, artistId: bts.id,    releaseYear: 2020, ...dynamite,     coverArt: loveyourself.coverArt!, viewCount: 142000 },
    { slug: "blackpink-pink-venom",       title: "Pink Venom",               albumId: bornpink.id,   artistId: blackpink.id, releaseYear: 2022, ...pinkvenom,  coverArt: bornpink.coverArt!,    viewCount: 115000 },
    { slug: "blackpink-how-you-like-that", title: "How You Like That",       albumId: thealbumt.id,  artistId: blackpink.id, releaseYear: 2020, ...pinkvenom,  coverArt: thealbumt.coverArt!,   viewCount: 88000 },
    { slug: "aespa-next-level",           title: "Next Level",               albumId: savageAlbum.id, artistId: aespa.id,   releaseYear: 2021, ...nextlevel,   coverArt: savageAlbum.coverArt!, viewCount: 76000 },
    { slug: "newjeans-hype-boy",          title: "Hype Boy",                 albumId: omgAlbum.id,   artistId: newjeans.id, releaseYear: 2022, ...hypeboy,     coverArt: omgAlbum.coverArt!,    viewCount: 93000 },
    { slug: "newjeans-ditto",             title: "Ditto",                    albumId: omgAlbum.id,   artistId: newjeans.id, releaseYear: 2023, ...ditto,       coverArt: omgAlbum.coverArt!,    viewCount: 87000 },
    { slug: "lisa-lalisa",               title: "LALISA",                   albumId: lalisa.id,     artistId: lisa.id,     releaseYear: 2021, ...lalisaTrack, coverArt: lalisa.coverArt!,      viewCount: 248000 },
    { slug: "lisa-money",                title: "MONEY",                    albumId: lalisa.id,     artistId: lisa.id,     releaseYear: 2021, ...money,       coverArt: lalisa.coverArt!,      viewCount: 312000 },
    { slug: "lisa-rockstar",             title: "ROCKSTAR",                 albumId: alterEgo.id,   artistId: lisa.id,     releaseYear: 2024, ...rockstar,    coverArt: alterEgo.coverArt!,    viewCount: 195000 },
    { slug: "lisa-new-woman",            title: "NEW WOMAN",                albumId: alterEgo.id,   artistId: lisa.id,     releaseYear: 2024, ...newWoman,    coverArt: alterEgo.coverArt!,    viewCount: 178000 },
    { slug: "lisa-moonlit-floor",        title: "MOONLIT FLOOR (KISS ME)",  albumId: alterEgo.id,   artistId: lisa.id,     releaseYear: 2024, ...moonlitFloor, coverArt: alterEgo.coverArt!,   viewCount: 143000 },
    { slug: "lisa-born-again",           title: "BORN AGAIN",               albumId: alterEgo.id,   artistId: lisa.id,     releaseYear: 2025, ...bornAgain,   coverArt: alterEgo.coverArt!,    viewCount: 287000 },
    { slug: "lisa-elastigirl",           title: "ELASTIGIRL",               albumId: alterEgo.id,   artistId: lisa.id,     releaseYear: 2025, ...elastigirl,  coverArt: alterEgo.coverArt!,    viewCount: 156000 },
    { slug: "lisa-thunder",              title: "THUNDER",                  albumId: alterEgo.id,   artistId: lisa.id,     releaseYear: 2025, ...thunder,     coverArt: alterEgo.coverArt!,    viewCount: 132000 },
    { slug: "lisa-fxck-up-the-world",    title: "FXCK UP THE WORLD",        albumId: alterEgo.id,   artistId: lisa.id,     releaseYear: 2025, ...fxckUpTheWorld, coverArt: alterEgo.coverArt!, viewCount: 198000 },
    { slug: "lisa-rapunzel",             title: "RAPUNZEL",                 albumId: alterEgo.id,   artistId: lisa.id,     releaseYear: 2025, ...rapunzel,    coverArt: alterEgo.coverArt!,    viewCount: 245000 },
    { slug: "lisa-when-im-with-you",     title: "WHEN I'M WITH YOU",        albumId: alterEgo.id,   artistId: lisa.id,     releaseYear: 2025, ...whenImWithYou, coverArt: alterEgo.coverArt!,  viewCount: 167000 },
    { slug: "lisa-badgrrrl",             title: "BADGRRRL",                 albumId: alterEgo.id,   artistId: lisa.id,     releaseYear: 2025, ...badgrrrl,    coverArt: alterEgo.coverArt!,    viewCount: 143000 },
    { slug: "lisa-lifestyle",            title: "LIFESTYLE",                albumId: alterEgo.id,   artistId: lisa.id,     releaseYear: 2025, ...lifestyle,   coverArt: alterEgo.coverArt!,    viewCount: 121000 },
    { slug: "twice-fancy",              title: "FANCY",                    albumId: formula.id,    artistId: twice.id,    releaseYear: 2019, ...fancy,       coverArt: formula.coverArt!,     viewCount: 71000 },
  ];

  const createdSongs: Record<string, { id: string }> = {};
  for (const s of songs) {
    const { artistId, ...songData } = s;
    const song = await prisma.song.create({ data: songData });
    createdSongs[s.slug] = song;
    await prisma.songCredit.create({ data: { songId: song.id, artistId, role: "PRIMARY" } });
  }

  // Featured artist credits (Lisa songs)
  await prisma.songCredit.create({ data: { songId: createdSongs["lisa-new-woman"].id,         artistId: rosalia.id,           role: "featured" } });
  await prisma.songCredit.create({ data: { songId: createdSongs["lisa-born-again"].id,        artistId: dojaCat.id,           role: "featured" } });
  await prisma.songCredit.create({ data: { songId: createdSongs["lisa-born-again"].id,        artistId: raye.id,              role: "featured" } });
  await prisma.songCredit.create({ data: { songId: createdSongs["lisa-fxck-up-the-world"].id, artistId: future.id,            role: "featured" } });
  await prisma.songCredit.create({ data: { songId: createdSongs["lisa-rapunzel"].id,          artistId: meganTheeStallion.id, role: "featured" } });
  await prisma.songCredit.create({ data: { songId: createdSongs["lisa-when-im-with-you"].id,  artistId: tyla.id,              role: "featured" } });

  // ── BLACKPINK western collabs ─────────────────────────────────────────────
  const sour_candy = await prisma.song.create({ data: {
    slug: "blackpink-lady-gaga-sour-candy", title: "Sour Candy",
    albumId: chromatica.id, releaseYear: 2020,
    coverArt: chromatica.coverArt!,
    viewCount: 134000,
    ...lyrics([
      ["달콤하게 시작했는데", "Dalkomhage sijak haetneunde", "It started sweetly"],
      ["새콤하게 변해버렸어", "Saekomhage byeonhaebeolyeosseo", "But turned sour"],
      ["Sour candy, 이게 사랑이야", "Sour candy, ige sarangiya", "Sour candy — this is love"],
      ["달콤하다가 쓰라려", "Dalkomhadaga sseurallyeo", "Sweet then it stings"],
      ["I'm sour candy, so sweet then I get hard", "I'm sour candy, so sweet then I get hard", "I'm sour candy — so sweet then I get hard"],
      ["겉과 속이 달라", "Geotgwa sogi dalla", "The outside and inside are different"],
      ["Sour candy, BLACKPINK이야", "Sour candy, BLACKPINKiya", "Sour candy — it's BLACKPINK"],
      ["Lady Gaga와 함께", "Lady Gagawa hamkke", "Together with Lady Gaga"],
    ]),
  }});
  await prisma.songCredit.create({ data: { songId: sour_candy.id, artistId: blackpink.id, role: "PRIMARY" } });
  await prisma.songCredit.create({ data: { songId: sour_candy.id, artistId: ladyGaga.id,  role: "featured" } });

  const ice_cream = await prisma.song.create({ data: {
    slug: "blackpink-selena-gomez-ice-cream", title: "Ice Cream",
    albumId: thealbumt.id, releaseYear: 2020,
    coverArt: thealbumt.coverArt!,
    viewCount: 118000,
    ...lyrics([
      ["아이스크림처럼 달콤해", "Aiseukeurimcheoreom dalkomhae", "Sweet like ice cream"],
      ["녹아내리고 싶어", "Noganaerigo sipeo", "I want to melt"],
      ["Ice cream, 달아요", "Ice cream, darayo", "Ice cream — so sweet"],
      ["너라는 맛이야", "Neoraeneun masiya", "The flavor called you"],
      ["Macaroon, I'm a flavor you ain't tried before", "Macaroon, I'm a flavor you ain't tried before", "Macaroon — I'm a flavor you've never tried"],
      ["Ice cream chillin', chillin'", "Ice cream chillin', chillin'", "Ice cream chillin', chillin'"],
      ["BLACKPINK과 Selena", "BLACKPINKgwa Selena", "BLACKPINK and Selena"],
      ["달콤한 여름이야", "Dalkomhan yeoreumiya", "It's a sweet summer"],
    ]),
  }});
  await prisma.songCredit.create({ data: { songId: ice_cream.id, artistId: blackpink.id,   role: "PRIMARY" } });
  await prisma.songCredit.create({ data: { songId: ice_cream.id, artistId: selenagomez.id, role: "featured" } });

  const bet_you_wanna = await prisma.song.create({ data: {
    slug: "blackpink-cardi-b-bet-you-wanna", title: "Bet You Wanna",
    albumId: thealbumt.id, releaseYear: 2020,
    coverArt: thealbumt.coverArt!,
    viewCount: 92000,
    ...lyrics([
      ["내기 걸어볼까", "Naegi georeobwolkka", "Shall we make a bet"],
      ["넌 날 원하게 될 거야", "Neon nal wonhage doel geoya", "You're going to want me"],
      ["Bet you wanna, 알잖아", "Bet you wanna, aljana", "Bet you wanna — you know it"],
      ["날 포기할 수 없어", "Nal pogihhal su eopseo", "You can't give up on me"],
      ["Cardi B, BLACKPINK, uh", "Cardi B, BLACKPINK, uh", "Cardi B, BLACKPINK, uh"],
      ["Bet you wanna, bet you wanna", "Bet you wanna, bet you wanna", "Bet you wanna, bet you wanna"],
      ["전 세계가 원하는 우리", "Jeon segyega wonhaneun uri", "We're wanted by the whole world"],
      ["Bet you wanna, feel it", "Bet you wanna, feel it", "Bet you wanna — feel it"],
    ]),
  }});
  await prisma.songCredit.create({ data: { songId: bet_you_wanna.id, artistId: blackpink.id, role: "PRIMARY" } });
  await prisma.songCredit.create({ data: { songId: bet_you_wanna.id, artistId: cardib.id,    role: "featured" } });

  // BTS + Halsey — add Halsey credit to Boy With Luv
  await prisma.songCredit.create({ data: { songId: createdSongs["bts-boy-with-luv"].id, artistId: halsey.id, role: "featured" } });

  // Note: Stray Kids + Charlie Puth "Expert" is added inline in the BATCH 1 SKZ section below

  // ── Tyla cross-cultural discography ──────────────────────────────────────
  await addSong("tyla-water", "Water", tylaAlbum.id, tyla.id, 2023, tylaAlbum.coverArt!, 142000, lyrics([
    ["물처럼 흘러내려", "Mulcheoreom heulleonaeryeo", "Flowing down like water"],
    ["내 몸을 타고 흘러", "Nae momeul tago heulleo", "Running down my body"],
    ["Water, Amapiano vibes", "Water, Amapiano vibes", "Water — Amapiano vibes"],
    ["남아프리카의 심장이 뛰어", "Namapreuikaue simjangi ttwio", "The heart of South Africa beats"],
    ["Drop it low, let the rhythm take over", "Drop it low, let the rhythm take over", "Drop it low — let the rhythm take over"],
    ["Water, 몸을 맡겨봐", "Water, momeul matkyeobwa", "Water — give your body to it"],
    ["Grammy가 인정한 소리야", "Grammyga injjeonghan soriya", "A sound recognized by the Grammys"],
    ["물처럼 자유롭게", "Mulcheoreom jayulopge", "Free like water"],
  ]));
  await addSong("tyla-truth-or-dare", "Truth or Dare", tylaAlbum.id, tyla.id, 2023, tylaAlbum.coverArt!, 78000, lyrics([
    ["진실 아니면 도전", "Jinsil animyeon dojeon", "Truth or dare"],
    ["선택해봐 어느 쪽", "Sontaekhaebwa eoneu jjok", "Choose — which one"],
    ["Truth or dare, 네 진심은", "Truth or dare, ne jinsimeun", "Truth or dare — what's your true feeling"],
    ["숨기지 마", "Sumgiji ma", "Don't hide it"],
    ["Tyla's got the game on lock", "Tyla's got the game on lock", "Tyla's got the game on lock"],
    ["Truth or dare, 다가와봐", "Truth or dare, dagawabwa", "Truth or dare — come closer"],
    ["요하네스버그에서 세계로", "Yohanesbeoegeseo segyero", "From Johannesburg to the world"],
    ["Truth or dare, 선택해", "Truth or dare, sontaekhae", "Truth or dare — choose"],
  ]));
  await addSong("tyla-jump", "Jump", tylaAlbum.id, tyla.id, 2024, tylaAlbum.coverArt!, 71000, lyrics([
    ["뛰어, 더 높이 뛰어", "Ttwio, deo nophi ttwio", "Jump — jump higher"],
    ["이 리듬에 몸을 맡겨", "I rideume momeul matkyeo", "Give your body to this rhythm"],
    ["Jump, Afrobeats vibes", "Jump, Afrobeats vibes", "Jump — Afrobeats vibes"],
    ["Tyla가 이끌어줄게", "Tylaga ikkeureojulge", "Tyla will lead the way"],
    ["아프리카의 에너지야", "Apeurikaue eneojiya", "This is Africa's energy"],
    ["Jump, 함께 해봐", "Jump, hamkke haebwa", "Jump — try it together"],
    ["경계를 넘어서", "Gyeonggye reul neomeo seo", "Crossing boundaries"],
    ["Jump, 세계가 하나야", "Jump, segyega hanaya", "Jump — the world is one"],
  ]));

  // ── Doja Cat cross-cultural discography ──────────────────────────────────
  await addSong("doja-cat-say-so", "Say So", dojaHotPink.id, dojaCat.id, 2019, dojaHotPink.coverArt!, 198000, lyrics([
    ["Day to night to morning", "Day to night to morning", "Day to night to morning"],
    ["Keep with me in the moment", "Keep with me in the moment", "Keep with me in the moment"],
    ["Say so, 말해줘", "Say so, malaejweo", "Say so — just say it"],
    ["내 맘을 받아줄 건지", "Nae mameul badajul geonji", "Whether you'll accept my heart"],
    ["I wanna dance with you tonight", "I wanna dance with you tonight", "I wanna dance with you tonight"],
    ["Say so, 솔직하게", "Say so, soljikage", "Say so — be honest"],
    ["도자 캣이 물어봐", "Doja Caesi mureo bwa", "Doja Cat is asking"],
    ["Say so, 대답해줘", "Say so, daedaphae jweo", "Say so — give me an answer"],
  ]));
  await addSong("doja-cat-kiss-me-more", "Kiss Me More", dojaPlanetHer.id, dojaCat.id, 2021, dojaPlanetHer.coverArt!, 176000, lyrics([
    ["한 번만 더 키스해줘", "Han beonman deo kiseuhaejweo", "Kiss me just one more time"],
    ["멈추지 말아줘", "Meomchuji marjweo", "Don't stop"],
    ["Kiss me more, 더 달콤하게", "Kiss me more, deo dalkomhage", "Kiss me more — even sweeter"],
    ["이 순간이 영원하길", "I sungani yeongwonhagil", "May this moment last forever"],
    ["Doja Cat, SZA, 최고의 조합", "Doja Cat, SZA, choegowe johap", "Doja Cat and SZA — the best combination"],
    ["Kiss me more, 원해", "Kiss me more, wonhae", "Kiss me more — I want it"],
    ["팝과 R&B가 만났어", "Paabgwa R&Bga mannateo", "Pop and R&B have met"],
    ["Kiss me more, 느껴봐", "Kiss me more, neukkyeobwa", "Kiss me more — feel it"],
  ]));
  await addSong("doja-cat-woman", "Woman", dojaPlanetHer.id, dojaCat.id, 2021, dojaPlanetHer.coverArt!, 154000, lyrics([
    ["I'm a woman, 강한 여자", "I'm a woman, ganghan yeoja", "I'm a woman — a strong woman"],
    ["아무도 막을 수 없어", "Amudo mageul su eopseo", "No one can stop me"],
    ["Woman, 내 힘을 봐줘", "Woman, nae himeul bwajweo", "Woman — see my power"],
    ["세상이 우릴 두려워해", "Sesangi uril duryeowohae", "The world fears us"],
    ["도자 캣이 선포해", "Doja Caesi seonpohae", "Doja Cat declares it"],
    ["Woman, 자랑스러워", "Woman, jarangseureo wo", "Woman — I'm proud"],
    ["여성의 힘을 느껴봐", "Yeoseong e himeul neukkyeobwa", "Feel the power of women"],
    ["Woman, I am, I am", "Woman, I am, I am", "Woman — I am, I am"],
  ]));

  // ── RAYE cross-cultural discography ──────────────────────────────────────
  await addSong("raye-escapism", "Escapism.", raye21stCentury.id, raye.id, 2022, raye21stCentury.coverArt!, 167000, lyrics([
    ["현실에서 도망치고 싶어", "Hyeonsile seo domangchigo sipeo", "I want to escape from reality"],
    ["잠깐이라도 잊고 싶어", "Jamkkanirago igo sipeo", "Even just for a moment, I want to forget"],
    ["Escapism, 어디론가 가고 싶어", "Escapism, eodironga gago sipeo", "Escapism — I want to go somewhere"],
    ["이 고통에서 잠깐만", "I gotong eseo jamkkanman", "Just for a moment from this pain"],
    ["RAYE's voice cuts through the noise", "RAYE's voice cuts through the noise", "RAYE's voice cuts through the noise"],
    ["Escapism, 달아나봐", "Escapism, daranabwa", "Escapism — try running away"],
    ["잠깐의 자유가 필요해", "Jamkkane jayuga piryohae", "I need a moment of freedom"],
    ["Escapism, 지금 바로", "Escapism, jigeum baro", "Escapism — right now"],
  ]));
  await addSong("raye-oscar-winning-tears", "Oscar Winning Tears", raye21stCentury.id, raye.id, 2023, raye21stCentury.coverArt!, 119000, lyrics([
    ["영화처럼 울어버려", "Yeonghwacheoreom uleo beolyeo", "Crying like in a movie"],
    ["오스카 수상 연기같아", "Oseuka susang yeongijata", "Like an Oscar-winning performance"],
    ["Oscar winning tears, 진짜야", "Oscar winning tears, jinjjaya", "Oscar winning tears — it's real"],
    ["연기가 아냐 진심이야", "Yeongiga anya jinsimiya", "Not acting — it's sincere"],
    ["RAYE가 느끼는 고통", "RAYEga neukkyneun gotong", "The pain RAYE feels"],
    ["Oscar winning tears, 봐줘", "Oscar winning tears, bwajweo", "Oscar winning tears — look"],
    ["BRIT Awards의 여왕이야", "BRIT Awardsue yeowangiiya", "She's the queen of the BRIT Awards"],
    ["Oscar winning tears, 흘러내려", "Oscar winning tears, heulleonaeryeo", "Oscar winning tears — flowing down"],
  ]));
  await addSong("raye-ice-cream-man", "Ice Cream Man", raye21stCentury.id, raye.id, 2023, raye21stCentury.coverArt!, 98000, lyrics([
    ["아이스크림 파는 남자야", "Aiseukeurim paneun namjaya", "He's the ice cream man"],
    ["달콤하게 속여", "Dalkomhage sogyo", "Deceiving me sweetly"],
    ["Ice cream man, 조심해", "Ice cream man, josimhae", "Ice cream man — be careful"],
    ["겉만 달콤한 거야", "Geotman dalkomhan geoya", "It's only sweet on the outside"],
    ["RAYE가 경고해줄게", "RAYEga gyeong gohae julge", "RAYE will warn you"],
    ["Ice cream man, 믿지 마", "Ice cream man, midji ma", "Ice cream man — don't trust"],
    ["달콤한 게 항상 좋은 건 아냐", "Dalkomhan ge hangsang joeun geon anya", "What's sweet isn't always good"],
    ["Ice cream man, 조심조심", "Ice cream man, josimjosim", "Ice cream man — be very careful"],
  ]));

  // ── Rosalía cross-cultural discography ──────────────────────────────────
  await addSong("rosalia-llylm", "LLYLM", rosaliaMotomami.id, rosalia.id, 2022, rosaliaMotomami.coverArt!, 104000, lyrics([
    ["La, la, ya lo me", "La, la, ya lo me", "La la ya lo me"],
    ["플라멩코와 팝이 만나", "Peullaemenkowa pabi manna", "Flamenco and pop meet"],
    ["LLYLM, 로살리아야", "LLYLM, Rosaliaya", "LLYLM — it's Rosalía"],
    ["전통과 현대를 잇는다", "Jeontong gwa hyeondaereul inneunda", "Bridging tradition and modernity"],
    ["스페인의 영혼이 노래해", "Seupeine yeongoni noraehae", "The soul of Spain sings"],
    ["LLYLM, 느껴봐", "LLYLM, neukkyeobwa", "LLYLM — feel it"],
    ["카탈루냐에서 전 세계로", "Katallunyaeseo jeon segyero", "From Catalonia to the whole world"],
    ["LLYLM, Grammy의 여왕", "LLYLM, Grammyue yeowang", "LLYLM — Grammy queen"],
  ]));
  await addSong("rosalia-despecha", "DESPECHÁ", rosaliaMotomami.id, rosalia.id, 2022, rosaliaMotomami.coverArt!, 117000, lyrics([
    ["Despechá, 카리브해의 리듬", "Despechá, Karibhaeue ridum", "Despechá — rhythm of the Caribbean"],
    ["레게톤과 플라멩코가 만나", "Legeton gwa peullaemenkoga manna", "Reggaeton and flamenco meet"],
    ["Despechá, 자유롭게 춤춰", "Despechá, jayulopge chumchwo", "Despechá — dance freely"],
    ["이 리듬 멈출 수 없어", "I ridum meomchul su eopseo", "Can't stop this rhythm"],
    ["Rosalía가 만들어낸 세계", "Rosalíaga mandeureanaen segye", "A world Rosalía created"],
    ["Despechá, 몸을 맡겨", "Despechá, momeul matkyeo", "Despechá — give your body to it"],
    ["스페인어의 힘을 느껴봐", "Seupeineoue himeul neukkyeobwa", "Feel the power of Spanish"],
    ["Despechá, 여기야 여기", "Despechá, yeogiya yeogi", "Despechá — right here, right here"],
  ]));
  await addSong("rosalia-bizcochito", "Bizcochito", rosaliaMotomami.id, rosalia.id, 2022, rosaliaMotomami.coverArt!, 95000, lyrics([
    ["내 비스코치토야", "Nae biseukochitooya", "My bizcochito"],
    ["달콤하고 바삭한 너", "Dalkomhago basakan neo", "Sweet and crispy you"],
    ["Bizcochito, 탐이 나", "Bizcochito, tami na", "Bizcochito — I crave you"],
    ["꼭 먹어버리고 싶어", "Kkok meogeobeorigo sipeo", "I want to devour you"],
    ["플라멩코 리듬이 흘러", "Peullaemenko rideumi heulleo", "Flamenco rhythm flows"],
    ["Bizcochito, 로살리아야", "Bizcochito, Rosaliaya", "Bizcochito — it's Rosalía"],
    ["스페인의 감성 그대로", "Seupeine gamseong geudaero", "The essence of Spain, unchanged"],
    ["Bizcochito, 느껴봐", "Bizcochito, neukkyeobwa", "Bizcochito — feel it"],
  ]));

  // ── Coded Terms ────────────────────────────────────────────────────────────
  const terms = [
    {
      term: "bias", slug: "bias",
      defs: [
        { body: "Your absolute favorite member in a K-pop group — the one you support the most, buy the most merchandise for, and defend at all costs. The word comes from having a 'bias' (preference) toward one member over others.", example: "My bias in BTS is Jimin. I've bought every version of the album that features his photocard.", votesUp: 2847, votesDown: 45 },
        { body: "The member of a group you consider your 'main' — typically chosen based on looks, personality, or the connection you feel with them. Most fans have one bias per group, though this can change.", example: "It took me three comebacks to finally settle on a bias — the struggle is real.", votesUp: 1203, votesDown: 88 },
      ],
    },
    {
      term: "bias wrecker", slug: "bias-wrecker",
      defs: [
        { body: "A member of a group who is NOT your bias but keeps threatening to take that position. They 'wreck' your current bias by constantly catching your attention with their talent, visuals, or personality.", example: "I swore my bias was Jennie, but then Rosé released her solo album and completely wrecked me.", votesUp: 3192, votesDown: 31 },
        { body: "The member you didn't choose to like but who sneaks up on you and demands your attention anyway. Often blamed for making stanning more expensive because now you need to support TWO members.", example: "V was my bias wrecker for so long that he eventually became my actual bias. RIP my wallet.", votesUp: 1876, votesDown: 67 },
      ],
    },
    {
      term: "stan", slug: "stan",
      defs: [
        { body: "Both a noun and a verb. As a noun: a devoted fan. As a verb: to be a devoted fan of someone. Originates from the Eminem song 'Stan' (2000) about an obsessive fan, but in K-pop contexts it is generally used positively to mean strong, dedicated support.", example: "I stan NewJeans with my whole heart. // She's a proud ARMY — she's been stanning BTS since 2015.", votesUp: 4521, votesDown: 89 },
        { body: "To actively support and promote an artist — buying albums, streaming, voting in polls, engaging with content. 'Stanning' implies more active participation than casual listening.", example: "If you want to help your faves, you need to stan properly — stream, vote, and buy physical albums.", votesUp: 1654, votesDown: 120 },
      ],
    },
    {
      term: "maknae", slug: "maknae",
      defs: [
        { body: "Korean word (막내) meaning the youngest person in a group, family, or organization. In K-pop, the maknae is the youngest member of an idol group, often given special treatment by older members and fans alike.", example: "Jungkook is the maknae of BTS — despite being the youngest, he's often considered one of the most talented members.", votesUp: 2156, votesDown: 23 },
        { body: "막내 (makknae) — the baby of the group. Maknaes are often babied by older members (called 'oppas' or 'unnies') and are known for surprising fans with how mature or talented they are despite their age.", example: "Hyein is the maknae of NewJeans at just 14 when they debuted — she's incredibly poised for her age.", votesUp: 987, votesDown: 34 },
      ],
    },
    {
      term: "comeback", slug: "comeback",
      defs: [
        { body: "In K-pop, a 'comeback' refers to when an artist or group releases new music after a period of absence — not necessarily a return from retirement. Even a group releasing a song just a few months after their last release calls it a 'comeback'.", example: "TWICE's comeback next month is going to break records — the teaser photos alone have fans going crazy.", votesUp: 3876, votesDown: 56 },
        { body: "A scheduled release cycle in which an idol group drops new music, appears on music shows for live performances, and participates in promotional activities. Comebacks typically last 4-8 weeks and include multiple promotional events.", example: "During comeback season, idols perform on Music Bank, Inkigayo, and Show Champion every week.", votesUp: 2100, votesDown: 78 },
      ],
    },
    {
      term: "all-kill", slug: "all-kill",
      defs: [
        { body: "When a song simultaneously reaches #1 on all major Korean music charts (Melon, Genie, Bugs, Flo, etc.) at the same time. A 'Perfect All-Kill' (PAK) occurs when the song also tops the Instiz iChart.", example: "BLACKPINK's 'Pink Venom' achieved an All-Kill within hours of its midnight release.", votesUp: 4102, votesDown: 44 },
      ],
    },
    {
      term: "daesang", slug: "daesang",
      defs: [
        { body: "다대상 (大賞) — the grand prize at major Korean music award shows. Equivalent to Album of the Year or Artist of the Year in Western music awards. Winning a Daesang is considered the highest achievement in K-pop.", example: "BTS swept the Daesangs at every major award show during their peak years, making it one of the most dominant streaks in K-pop history.", votesUp: 3654, votesDown: 29 },
      ],
    },
    {
      term: "fancam", slug: "fancam",
      defs: [
        { body: "A video filmed by fans or official broadcasters that focuses on a single member during a group performance, rather than showing the entire group. Fancams are an important way fans showcase their favorite member's talent and visuals.", example: "Lisa's fancam from MAMA 2019 went viral worldwide with over 400 million views, introducing many international fans to K-pop.", votesUp: 2987, votesDown: 67 },
        { body: "An individual-focus cut of a music show performance. Official fancams are released by music shows like MCOUNTDOWN and Mnet; fan-made fancams are filmed from the audience. Both are used to measure individual member popularity.", example: "Did you see Karina's fancam from the Savage performance? Her expressions were everything.", votesUp: 1432, votesDown: 45 },
      ],
    },
    {
      term: "sasaeng", slug: "sasaeng",
      defs: [
        { body: "사생팬 (私生팬) — an obsessive fan who invades an idol's private life. Sasaengs are widely condemned within fandom communities as their behavior crosses ethical and legal lines, including stalking, breaking into dorms, and hacking personal devices.", example: "The agency released a statement warning sasaengs that legal action will be taken against anyone who continues to follow members to their private schedules.", votesUp: 5102, votesDown: 156 },
      ],
    },
    {
      term: "visual", slug: "visual",
      defs: [
        { body: "An official or community-recognized position within a K-pop group awarded to the member considered the most conventionally attractive. The 'visual' is essentially the face of the group, often the one who appears most prominently in promotional materials.", example: "Jisoo is BLACKPINK's official visual — her face frequently appears on billboards and brand campaigns.", votesUp: 2567, votesDown: 89 },
        { body: "Beyond just the official position, 'visual' can describe any member who is considered particularly attractive by the fandom or general public, even if they don't hold the official position.", example: "All the members are visuals in my opinion — I can't pick just one.", votesUp: 1876, votesDown: 234 },
      ],
    },
    {
      term: "era", slug: "era",
      defs: [
        { body: "A distinct period in an idol group's career defined by a specific concept, aesthetic, or album. Each comeback introduces a new 'era' with its own look, color palette, and musical direction. Fans often strongly identify with particular eras.", example: "The MOTS (Map of the Soul) era was my favorite BTS era — the music, the visuals, everything was perfect.", votesUp: 3214, votesDown: 45 },
      ],
    },
    {
      term: "center", slug: "center",
      defs: [
        { body: "The member of a group who stands in the center during performances and is featured most prominently in choreography. The center is often (but not always) the most popular member or the one with the strongest stage presence.", example: "Karina is aespa's center and has the most screen time in their music videos.", votesUp: 1987, votesDown: 56 },
      ],
    },
    {
      term: "OT7", slug: "ot7",
      defs: [
        { body: "Acronym for 'One True 7' — a term used by fans who support all seven members of BTS equally without picking a single bias. More broadly, 'OT+number' is used for any group to indicate support for the full lineup.", example: "I'm an OT7 ARMY — I refuse to pick a bias because I love all seven members equally.", votesUp: 4321, votesDown: 123 },
        { body: "OT stands for 'One True' — the number that follows refers to the number of members. OT9 for TWICE, OT4 for BLACKPINK, etc. Being 'OT' means you refuse to favor any single member and love the group as a whole.", example: "After watching all their variety content, I gave up trying to pick a bias and went full OT4.", votesUp: 2156, votesDown: 89 },
      ],
    },
    {
      term: "line", slug: "line",
      defs: [
        { body: "A subgroup classification within an idol group based on a shared trait. Common types: 'vocal line' (main and lead vocalists), 'rap line' (rappers), 'dance line' (main and lead dancers), '95 line' (members born in 1995), 'hyung line' (older members).", example: "BTS's rap line (RM, Suga, J-Hope) all released solo mixtapes that showed off their individual artistry.", votesUp: 2876, votesDown: 34 },
      ],
    },
    {
      term: "unnie", slug: "unnie",
      defs: [
        { body: "언니 — Korean honorific used by females to address an older female. In K-pop, used by younger female idols to address older female members or seniors in the industry. Also used by female fans to refer to female idols they look up to.", example: "Nayeon is the unnie of TWICE — all the younger members look up to her as a big sister figure.", votesUp: 1654, votesDown: 23 },
      ],
    },
  ];

  const createdTerms: Record<string, string> = {};
  for (const t of terms) {
    const term = await prisma.codedTerm.create({ data: { slug: t.slug, term: t.term } });
    createdTerms[t.slug] = term.id;
    for (const d of t.defs) {
      await prisma.termDefinition.create({ data: { termId: term.id, ...d } });
    }
  }

  // ── Artist News ───────────────────────────────────────────────────────────
  const newsItems: Array<{ artistId: string; headline: string; body: string; category: string; source?: string; publishedAt: Date }> = [
    // BTS
    { artistId: bts.id, headline: "All Seven BTS Members Complete Military Service", body: "All seven members of BTS have now fulfilled their mandatory military service obligations, with Jin, Suga, RM, Jimin, V, J-Hope, and Jungkook completing their respective duties. The reunited group spent several months preparing for their return, signaling the end of one of the most anticipated hiatuses in pop music history.", category: "milestone", source: "Billboard", publishedAt: new Date("2025-06-15") },
    { artistId: bts.id, headline: "BTS Announces 'Chapter 2' Comeback for March 2026", body: "HYBE confirmed that BTS will return as a full seven-member group in March 2026, marking their first group comeback since completing military service. The announcement sent ARMY into a frenzy worldwide. Pre-orders for the new album exceeded 5 million copies within 24 hours of the announcement.", category: "comeback", source: "Soompi", publishedAt: new Date("2025-11-10") },
    { artistId: bts.id, headline: "BTS ARMY Celebrates a Decade of Fandom", body: "June 2023 marked the ten-year anniversary of BTS's debut and, by extension, ARMY fandom. Fan events across 100+ cities celebrated a decade of music, social impact, and community. HYBE released a commemorative photobook and a limited anniversary concert film.", category: "milestone", source: "Allkpop", publishedAt: new Date("2023-06-13") },
    // BLACKPINK
    { artistId: blackpink.id, headline: "BLACKPINK 'DEADLINE' Album Goes Global #1 on Day One", body: "BLACKPINK's long-awaited fourth studio album 'DEADLINE' debuted at #1 in 54 countries on release day, breaking the group's own records. The album marks their first group release since 'BORN PINK' (2022) and features a more experimental sound with contributions from producers across four continents.", category: "comeback", source: "Billboard", publishedAt: new Date("2026-02-27") },
    { artistId: blackpink.id, headline: "Lisa Departs YG Entertainment, Launches Lloud Label", body: "Lisa (Lalisa Manoban) officially departed from YG Entertainment in late 2023 following the expiration of her individual contract after BLACKPINK's group contract renewal. In January 2024, she announced the founding of Lloud, her own independent label backed by a global distribution deal with RCA Records. The move made her one of the first K-pop idols of her generation to own and control her own entertainment company.", category: "label", source: "Soompi", publishedAt: new Date("2024-01-22") },
    { artistId: blackpink.id, headline: "BLACKPINK Breaks Coachella Attendance Record in Historic Return", body: "BLACKPINK became the first K-pop act to headline Coachella, performing across two weekends in April 2023 to record-breaking crowds. Their set drew the largest single-day attendance in the festival's history. The performance included a surprise appearance and a 26-song setlist spanning their full discography.", category: "milestone", source: "Rolling Stone", publishedAt: new Date("2023-04-15") },
    // NewJeans
    { artistId: newjeans.id, headline: "Min Hee-jin vs. HYBE: The Legal Battle That Shook K-pop", body: "ADOR CEO Min Hee-jin filed an injunction against HYBE after the parent company attempted to remove her from the position she held since founding ADOR and creating NewJeans. The legal saga — involving allegations of breach of contract, shareholder disputes, and counter-allegations of corporate bullying — consumed K-pop media for months. The dispute raised fundamental questions about creative ownership and corporate governance in the idol industry.", category: "legal", source: "Korea JoongAng Daily", publishedAt: new Date("2024-05-03") },
    { artistId: newjeans.id, headline: "Danielle Terminates Contract — NewJeans' Future Uncertain", body: "Member Danielle became the first NewJeans member to formally terminate her contract with ADOR amid the ongoing dispute between Min Hee-jin and HYBE. The move sparked massive debate within BUNNIES fandom over whether the group would continue and what form a potential reunion or reconstitution might take.", category: "member", source: "Dispatch", publishedAt: new Date("2024-10-11") },
    { artistId: newjeans.id, headline: "NewJeans Debuts to Record-Breaking First-Week Reception", body: "NewJeans made K-pop history upon their August 2022 debut, becoming the fastest group to surpass 100 million streams on Spotify for a debut album. Their simultaneous release of five music videos and unconventional low-key marketing approach — no formal debut showcase, no press conference — was hailed as a paradigm shift in how idol groups launch.", category: "milestone", source: "Soompi", publishedAt: new Date("2022-08-22") },
    // aespa
    { artistId: aespa.id, headline: "LEMONADE Album Arrives to Critical Acclaim", body: "aespa's fourth studio album 'LEMONADE,' released May 29, 2026, debuted at #1 in 31 countries. The album deepens the SMCU (SM Culture Universe) lore while incorporating a more personal, reflective tone alongside the group's signature experimental production. Critics called it their most cohesive and ambitious release to date.", category: "comeback", source: "Billboard", publishedAt: new Date("2026-05-29") },
    { artistId: aespa.id, headline: "aespa and G-Dragon Collaborate on 'WDA' — K-pop's Unlikely Duo", body: "The collaboration between aespa and G-Dragon on 'WDA (Winter Dream Aegyo)' was one of the most unexpected announcements in K-pop in recent memory. The track blends aespa's futuristic production aesthetic with G-Dragon's iconic lo-fi irreverence, generating massive streams and critical discussion about genre boundaries in K-pop.", category: "collab", source: "Allkpop", publishedAt: new Date("2026-03-14") },
    { artistId: aespa.id, headline: "aespa Becomes First SM Group to Top the US Albums Chart", body: "With their 2023 LP 'MY WORLD,' aespa became the first SM Entertainment group to debut at #1 on the Billboard 200, surpassing even the records set by their label seniors Girls' Generation and EXO. The milestone cemented aespa's status as SM's flagship fourth-generation act.", category: "milestone", source: "Billboard", publishedAt: new Date("2023-10-12") },
    // TWICE
    { artistId: twice.id, headline: "'THIS IS FOR' World Tour Breaks Personal Records in Every City", body: "TWICE's 'THIS IS FOR' world tour, launched July 2025, broke attendance records in Seoul, Tokyo, Los Angeles, and London. The tour is the group's largest-scale production to date, featuring a stage spanning over 200 feet wide and a live band for select performances.", category: "milestone", source: "Soompi", publishedAt: new Date("2025-07-20") },
    { artistId: twice.id, headline: "MISAMO Subunit Drops 'PLAY' Mini-Album to Thunderous Response", body: "The Japanese members subunit MISAMO (Momo, Sana, Mina) released their debut mini-album 'PLAY' in 2024, debuting at #1 on the Oricon Weekly Chart and entering Billboard Japan's top 5. The subunit's success further demonstrated TWICE's cross-market dominance, particularly in Japan.", category: "comeback", source: "Oricon News", publishedAt: new Date("2024-03-28") },
    { artistId: twice.id, headline: "TWICE Signs with Republic Records for US Market Push", body: "In a landmark deal for K-pop's third generation, TWICE signed a partnership with Republic Records (Universal Music Group) to amplify their presence in the US market. The deal includes dedicated US promotions, co-releases, and an enhanced digital and radio strategy targeting the American mainstream.", category: "label", source: "Billboard", publishedAt: new Date("2023-02-08") },
    // SEVENTEEN
    { artistId: seventeen.id, headline: "SEVENTEEN 'HAPPY BURSTDAY' Debuts at #2 on Billboard 200", body: "SEVENTEEN's mini-album 'HAPPY BURSTDAY' debuted at #2 on the Billboard 200, their highest US chart position to date and the second-highest debut ever for a K-pop act at the time. The achievement came on the same week that the group's Weverse fan membership surpassed 15 million subscribers.", category: "milestone", source: "Billboard", publishedAt: new Date("2025-01-08") },
    { artistId: seventeen.id, headline: "[NEW_] World Tour Sells Out 50 Venues Across 4 Continents", body: "SEVENTEEN's '[NEW_]' world tour became the most geographically expansive tour ever mounted by a K-pop group, with 50 dates across Asia, North America, Europe, and South America. Total ticket sales exceeded 1.2 million, making SEVENTEEN one of the top-grossing touring acts of 2025 across all genres.", category: "milestone", source: "Soompi", publishedAt: new Date("2025-08-30") },
    { artistId: seventeen.id, headline: "All 13 Members Renew Contracts with Pledis/HYBE", body: "In one of the most anticipated contract decisions in fourth-generation K-pop, all 13 members of SEVENTEEN renewed their exclusive contracts with Pledis Entertainment under HYBE. The news was met with enormous relief from CARAT fandom, who had feared a partial disbandment or member departures following the end of the group's initial seven-year contracts.", category: "member", source: "Soompi", publishedAt: new Date("2024-05-16") },
    // Lisa
    { artistId: lisa.id, headline: "Alter Ego Debuts at #1 in 54 Countries on Day One", body: "Lisa's debut studio album 'Alter Ego,' released February 28, 2025, became the fastest debut album by a K-pop female soloist to reach #1 globally. The 15-track project, which explores five fictional alter egos, garnered over 200 million streams in its first 24 hours. Features from Doja Cat, RAYE, Future, Megan Thee Stallion, and Tyla drew global mainstream press coverage beyond the K-pop sphere.", category: "comeback", source: "Billboard", publishedAt: new Date("2025-02-28") },
    { artistId: lisa.id, headline: "Lisa Documentary Set for Netflix Global Release", body: "A feature-length documentary about Lisa's life — from her early childhood in Thailand, her YG audition at 13, her years as a trainee in Seoul, to the founding of Lloud — was acquired by Netflix for global distribution. The film, produced in part by Lisa herself through Lloud Productions, is scheduled for release in late 2025 and includes never-before-seen training footage and candid interviews.", category: "milestone", source: "Variety", publishedAt: new Date("2025-04-15") },
    { artistId: lisa.id, headline: "ROCKSTAR Enters Billboard Hot 100 Top 10", body: "Lisa's first release under Lloud, 'ROCKSTAR,' debuted in the top 10 of the Billboard Hot 100 — the highest entry ever for a K-pop female soloist on the chart. The song simultaneously topped charts in 28 countries, broke Spotify's record for most first-day streams by a female Asian artist, and drove a surge in monthly listeners that positioned Lisa among the top 10 most-streamed female artists globally.", category: "milestone", source: "Billboard", publishedAt: new Date("2024-06-28") },
    { artistId: lisa.id, headline: "Lisa Founds Lloud, Partners with RCA Records for Global Reach", body: "Lisa officially announced the founding of Lloud Co., Ltd. in January 2024, her own entertainment and management label. The partnership with RCA Records (Sony Music) gives her access to one of the world's largest music distribution networks while retaining full creative and business control. Lloud will handle Lisa's recording, touring, merchandising, and licensing businesses independently — a first for any K-pop idol of her generation.", category: "label", source: "Soompi", publishedAt: new Date("2024-01-08") },
    // Kiiikiii
    { artistId: kiiikiii.id, headline: "Kiiikiii Debuts with Record First-Week Sales for Starship Rookie Act", body: "Kiiikiii's debut mini-album set a first-week sales record for any Starship Entertainment debut, with over 280,000 copies sold in the first seven days. The group's multicultural lineup and genre-blending debut concept drew comparisons to aespa and NewJeans while establishing a distinct identity rooted in the intersection of K-pop and global youth culture.", category: "milestone", source: "Gaon Chart", publishedAt: new Date("2024-04-10") },
    { artistId: kiiikiii.id, headline: "Kiiikiii Sweeps Rookie Categories at Year-End Awards", body: "In their debut year, Kiiikiii won the Best New Artist award at all three major year-end awards shows — MAMA, Melon Music Awards, and Golden Disc Awards — becoming only the fourth group in K-pop history to achieve a clean rookie sweep. The group's rapid ascent drew industry comparisons to NewJeans' debut trajectory.", category: "award", source: "Soompi", publishedAt: new Date("2024-12-05") },

    // ── K-pop Signals 2026-05-20 — sourced from Obsidian research vault ──────
    // BTS — Spotify milestones
    { artistId: bts.id, headline: "Jungkook's 'Seven' Hits 2.76 Billion Spotify Streams", body: "BTS member Jungkook's solo single 'Seven (feat. Latto)' has surpassed 2.76 billion Spotify plays as of January 2026, making it the most-streamed song by any K-pop artist on the platform. Jungkook was the fastest artist ever to reach 1 billion Spotify streams on a single track (108–109 days). His album GOLDEN has accumulated 6.2 billion streams — the most-streamed solo album by any Asian artist in Spotify history.", category: "milestone", source: "Spotify / Outlookindia", publishedAt: new Date("2026-01-25") },
    { artistId: bts.id, headline: "Jimin Becomes First Solo K-pop Artist to Reach 6.5 Billion Spotify Streams", body: "BTS member Jimin has surpassed 6.5 billion total Spotify streams across his solo discography, becoming the first solo K-pop artist to reach that milestone. His single 'Who' alone has 2.25 billion plays with 450M+ US streams and 33 weeks on the Billboard Hot 100. 'Like Crazy' entered the Billboard Hot 100 at #1, and his album MUSE has crossed 3.7 billion streams. Of his 34 tracks, 22 pure solo songs make up over 80% of total streams.", category: "milestone", source: "Spotify / Kpopbeen", publishedAt: new Date("2026-01-10") },
    { artistId: bts.id, headline: "BTS Charts Two Songs Simultaneously in Week 15 — 'Hooligan' Rises to #5", body: "BTS is charting two songs simultaneously in the K-pop weekly chart for Week 15 of 2026 (April 12): 'Hooligan' climbs from #16 to #5 while 'SWIM' slips from #1 to #33. It's the first time in 2026 that a single act has two songs charting in the K-pop top 40 at the same time.", category: "chart", source: "onlyhit.us", publishedAt: new Date("2026-04-12") },
    // BLACKPINK / Lisa — Instagram
    { artistId: blackpink.id, headline: "All Four BLACKPINK Members Hold Top 4 Spots on K-pop Instagram Rankings", body: "As of Q1 2026, all four BLACKPINK members rank in the top four among K-pop artists on Instagram: Lisa leads at 107M followers, Jennie at 89.7M, Rosé at 84.5M, and Jisoo at 80.5M. Combined, the four members have over 362M followers — more than the entire population of the United States. Lisa's 107M alone exceeds South Korea's total population of ~51.7M by more than 2×.", category: "milestone", source: "Koreaboo / Delivered", publishedAt: new Date("2026-03-01") },
    { artistId: lisa.id, headline: "Lisa Leads All K-pop Artists on Instagram with 107 Million Followers", body: "Lisa (@lalalalisa_m) holds the #1 spot among all K-pop artists on Instagram with 107 million followers as of Q1 2026 — more than double the population of South Korea. She is the only K-pop idol to exceed 100M followers on the platform. Her closest competitors are fellow BLACKPINK members Jennie (89.7M) and Rosé (84.5M).", category: "milestone", source: "Koreaboo", publishedAt: new Date("2026-03-15") },
    // TWICE — chart
    { artistId: twice.id, headline: "'THIS IS FOR' Re-enters K-pop Chart at #35", body: "TWICE's 'THIS IS FOR' has re-entered the K-pop weekly chart at #35 for Week 15 of 2026 (April 12), driven by a renewed streaming push from ONCE fandom during the anniversary period. The re-entry is consistent with TWICE's pattern of chart longevity across multiple promotion cycles.", category: "chart", source: "onlyhit.us", publishedAt: new Date("2026-04-12") },
    // Kiiikiii — comeback
    { artistId: kiiikiii.id, headline: "Kiiikiii Releases 'DANCING ALONE' + B-side 'Strawberry Cheesegame' (August 2025)", body: "Kiiikiii dropped their digital single 'DANCING ALONE' with B-side 'Strawberry Cheesegame' in August 2025, expanding on the retro-synth city pop sound introduced in their debut EP 'UNCUT GEM' (March 2025). The UNCUT GEM EP has since crossed 30M Spotify streams, and their pre-release 'I DO ME' has surpassed 13M music video views. Kiiikiii achieved their first music show win within weeks of debut.", category: "comeback", source: "Tinygmusic", publishedAt: new Date("2025-08-06") },
  ];

  for (const item of newsItems) {
    await prisma.artistNews.create({ data: {
      artistId: item.artistId,
      headline: item.headline,
      body: item.body,
      category: item.category,
      source: item.source ?? null,
      publishedAt: item.publishedAt,
    }});
  }

  // ── Lyric Annotations ─────────────────────────────────────────────────────
  const annotations = [
    {
      slug: "newjeans-hype-boy", lineIndex: 5, word: "Hype boy",
      termSlug: "stan",
      note: "A 'hype boy' in K-pop fandom refers to a fan's ultimate supporter — someone who cheers you on, lifts your spirits, and shows you off to the world. NewJeans inverts the typical idol-fan dynamic here: the singer is the fan, and her 'hype boy' is her bias. The phrase mirrors how stans describe their devotion to idols.",
    },
    {
      slug: "lisa-lalisa", lineIndex: 9, word: "나는 나야",
      termSlug: "stan",
      note: "나는 나야 (naneun naya) — 'I am myself.' Lisa's manifesto to her stans: she refuses to be reshaped by industry expectations or public pressure. This closing line became an anthem for fans who embraced their own identities in the same way Lisa reclaimed hers.",
    },
    {
      slug: "blackpink-pink-venom", lineIndex: 3, word: "핀 꽃",
      termSlug: "visual",
      note: "핀 꽃 (pin kkot) — 'blooming flower.' BLACKPINK's entire visual identity is built around the flower metaphor: beauty armed with thorns. Jisoo, BLACKPINK's official visual, embodies this in every promotional shoot — elegant, striking, dangerous in stillness.",
    },
    {
      slug: "aespa-next-level", lineIndex: 2, word: "Next level",
      termSlug: "era",
      note: "The 'Next Level' era marked a decisive turning point for aespa — their first concept to fully integrate SMCU (SM Culture Universe) lore into the music itself. The phrase became synonymous with the group's ascent to mainstream dominance across Asia and defined their identity as fourth-generation K-pop's most concept-driven group.",
    },
    {
      slug: "twice-fancy", lineIndex: 2, word: "나만 보여줘",
      termSlug: "bias",
      note: "나만 보여줘 (naman boyeojweo) — 'show only me.' A classic K-pop lyrical trope that captures the fan's deepest fantasy: that their bias sees and exists for them alone. The line is delivered from the perspective of the fan-as-lover, reflecting the emotional architecture of the idol-fan relationship.",
    },
    {
      slug: "bts-boy-with-luv", lineIndex: 7, word: "보잘것없어",
      termSlug: "bias",
      note: "보잘것없어 (bojalgeotseopsseo) — 'worthless in others' eyes.' BTS built their early career championing fans who felt unseen or overlooked. This line resonated with ARMY members who found in BTS a mirror for their own experiences of being dismissed — and a bias who made them feel they mattered.",
    },
  ];

  for (const ann of annotations) {
    const song = createdSongs[ann.slug];
    if (!song) continue;
    await prisma.lyricAnnotation.create({ data: {
      songId: song.id,
      termId: ann.termSlug ? createdTerms[ann.termSlug] : undefined,
      lineIndex: ann.lineIndex,
      word: ann.word,
      note: ann.note,
    }});
  }

  // ── Additional Labels ─────────────────────────────────────────────────────
  const beliftLab = await prisma.label.upsert({ where: { slug: "belift-lab" }, update: {}, create: {
    slug: "belift-lab", name: "BELIFT LAB", country: "South Korea", foundedYear: 2019,
    bio: "BELIFT LAB is a joint venture between HYBE and CJ ENM. Home to ENHYPEN and ILLIT.",
  }});
  const sourceMusic = await prisma.label.upsert({ where: { slug: "source-music" }, update: {}, create: {
    slug: "source-music", name: "Source Music", country: "South Korea", foundedYear: 2009,
    bio: "Source Music is a HYBE subsidiary and home to LE SSERAFIM.",
  }});
  const cubeEnt = await prisma.label.upsert({ where: { slug: "cube-entertainment" }, update: {}, create: {
    slug: "cube-entertainment", name: "Cube Entertainment", country: "South Korea", foundedYear: 2008,
    bio: "Cube Entertainment is home to (G)I-DLE, (G)I-DLE, BTOB, and HyunA.",
  }});
  const kqEnt = await prisma.label.upsert({ where: { slug: "kq-entertainment" }, update: {}, create: {
    slug: "kq-entertainment", name: "KQ Entertainment", country: "South Korea", foundedYear: 2016,
    bio: "KQ Entertainment is an independent South Korean label best known as the home of ATEEZ.",
  }});
  const rbw = await prisma.label.upsert({ where: { slug: "rbw" }, update: {}, create: {
    slug: "rbw", name: "RBW", country: "South Korea", foundedYear: 2010,
    bio: "RBW (Rainbow Bridge World) is home to MAMAMOO, ONEWE, and Purple Kiss.",
  }});
  const wakeOne = await prisma.label.upsert({ where: { slug: "wake-one" }, update: {}, create: {
    slug: "wake-one", name: "Wake One", country: "South Korea", foundedYear: 2022,
    bio: "Wake One Entertainment is the label behind Zerobaseone, formed via the Boys Planet survival show.",
  }});

  // helper: create song + primary credit
  async function addSong(slug: string, title: string, albumId: string, artistId: string, releaseYear: number, coverArt: string, viewCount: number, lyricsData: { lyricsKo: string; lyricsRomanized: string; lyricsEn: string }) {
    const song = await prisma.song.create({ data: { slug, title, albumId, releaseYear, coverArt, viewCount, ...lyricsData } });
    await prisma.songCredit.create({ data: { songId: song.id, artistId, role: "PRIMARY" } });
    return song;
  }

  // ── BATCH 1: IVE, ITZY, Stray Kids, TXT, ENHYPEN, LE SSERAFIM, (G)I-DLE, ATEEZ, Red Velvet, NCT 127 ──

  // IVE
  const ive = await prisma.artist.create({ data: {
    slug: "ive", type: "GROUP", stageName: "IVE", debutYear: 2021, labelId: starship.id,
    bio: "IVE is a six-member girl group formed by Starship Entertainment. Debuting with 'ELEVEN' in 2021, they rapidly became one of fourth-generation K-pop's leading acts, known for their 'girl crush meets elegance' concept and back-to-back chart-topping hits including 'LOVE DIVE', 'After LIKE', and 'I AM'.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/IVE_at_2023_Melon_Music_Awards.jpg/960px-IVE_at_2023_Melon_Music_Awards.jpg",
  }});
  const iveIAmAlbum = await prisma.album.create({ data: { slug: "ive-i-am", title: "I AM", artistId: ive.id, releaseYear: 2023, type: "Single Album", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/5e/2c/89/5e2c89e0-4f43-8e3d-e3b3-df3e9e0e1e5d/196922528217_Cover.jpg/600x600bb.jpg" } });
  const iveAfterLikeAlbum = await prisma.album.create({ data: { slug: "ive-after-like", title: "After LIKE", artistId: ive.id, releaseYear: 2022, type: "Single Album", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/6f/7c/c0/6f7cc0e1-7c2b-ced2-90d7-4f2e5d9d93b1/196922178252_Cover.jpg/600x600bb.jpg" } });
  await addSong("ive-i-am", "I AM", iveIAmAlbum.id, ive.id, 2023, iveIAmAlbum.coverArt!, 84000, lyrics([
    ["나는 나야 내가 정한 길을 가", "Naneun naya naega jeonghan gireul ga", "I am who I am, I walk the path I chose"],
    ["무슨 말이 필요해", "Museun mari piryohae", "What more needs to be said"],
    ["I AM, 두려움 없이", "I AM, duryeoum eopsi", "I AM, without fear"],
    ["내 안에 빛이 있어", "Nae ane biti isseo", "There is light inside me"],
    ["흔들리지 않아 절대로", "Heundeulliji ana jeoldaero", "I will not be shaken, not ever"],
    ["I AM, I AM, I AM", "I AM, I AM, I AM", "I AM, I AM, I AM"],
    ["세상이 뭐라 해도", "Sesangi mworago haedo", "No matter what the world says"],
    ["나는 나답게 빛날게", "Naneun nadapge bitnalge", "I will shine in my own way"],
  ]));
  await addSong("ive-love-dive", "LOVE DIVE", iveAfterLikeAlbum.id, ive.id, 2022, iveAfterLikeAlbum.coverArt!, 91000, lyrics([
    ["나르시스트처럼 내 눈에 빠져", "Narcissistcheoreom nae nune ppajyeo", "Falling into my own eyes like a narcissist"],
    ["날 사랑하는 게 먼저", "Nal sarangha neun ge meonjeo", "Loving myself comes first"],
    ["Love dive, 깊이 빠져봐", "Love dive, giphi ppajyeobwa", "Love dive — fall in deep"],
    ["내 안에 더 깊이", "Nae ane deo giphi", "Deeper inside me"],
    ["너와 나 사이 거울처럼", "Neowa na sai geowulcheoreom", "Between you and me, like a mirror"],
    ["온 세상이 멈춰", "On sesangi meomchwo", "The whole world stops"],
    ["Love dive, I'm falling", "Love dive, I'm falling", "Love dive — I'm falling"],
    ["영원히 빠져나올 수 없어", "Yeongwonhi ppajyeonaol su eopseo", "I can never escape"],
  ]));
  await addSong("ive-after-like", "After LIKE", iveAfterLikeAlbum.id, ive.id, 2022, iveAfterLikeAlbum.coverArt!, 78000, lyrics([
    ["I feel the breeze", "I feel the breeze", "I feel the breeze"],
    ["네 손을 잡고 걸어가", "Ne soneul japgo georeoga", "Walking, holding your hand"],
    ["After like, 설레임이 남아", "After like, seolleoimi nama", "After like — excitement remains"],
    ["이 느낌 뭐라 표현해", "I neukkkim mworago pyohyeonhae", "How do I describe this feeling"],
    ["Love is a game, I know the rules", "Love is a game, I know the rules", "Love is a game — I know the rules"],
    ["그래도 난 뛰어들어", "Geuraedo nan ttwieodeuro", "Still, I jump right in"],
    ["After like, 여운이 길어", "After like, yeouni gireo", "After like — the afterglow lingers"],
    ["너를 잊을 수 없어", "Neoreul ijeul su eopseo", "I can't forget you"],
  ]));

  // ITZY
  const itzy = await prisma.artist.create({ data: {
    slug: "itzy", type: "GROUP", stageName: "ITZY", debutYear: 2019, labelId: jyp.id,
    bio: "ITZY (있지) is a five-member girl group formed by JYP Entertainment. Debuting in 2019 with 'DALLA DALLA', they introduced a self-acceptance concept centered on the message 'I love me'. Known for powerful performance, sharp choreography, and a confident girl-crush aesthetic.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/ITZY_at_2023_AAA.jpg/960px-ITZY_at_2023_AAA.jpg",
  }});
  const itzyNotShy = await prisma.album.create({ data: { slug: "itzy-not-shy", title: "NOT SHY", artistId: itzy.id, releaseYear: 2020, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/c8/52/d6/c852d6d2-7df4-ad4e-c3a8-4e1d2b9a3b4d/20UMGIM62093.rgb.jpg/600x600bb.jpg" } });
  const itzyCheckmate = await prisma.album.create({ data: { slug: "itzy-checkmate", title: "CHECKMATE", artistId: itzy.id, releaseYear: 2022, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/4f/6b/9a/4f6b9a8f-4e2d-9c1b-8a7d-3c2e1f0d5b6a/22UMGIM63241.rgb.jpg/600x600bb.jpg" } });
  await addSong("itzy-wannabe", "WANNABE", itzyNotShy.id, itzy.id, 2020, itzyNotShy.coverArt!, 73000, lyrics([
    ["나는 나이고 싶어", "Naneun naigo sipeo", "I want to be myself"],
    ["누굴 따라가고 싶지 않아", "Nugugul ttaragago sipji ana", "I don't want to follow anyone"],
    ["I wanna be, I wanna be me", "I wanna be, I wanna be me", "I wanna be, I wanna be me"],
    ["남들 눈치 안 봐", "Namdeul nunchi an bwa", "I don't care what others think"],
    ["WANNABE, 내 길을 걸어", "WANNABE, nae gireul georeo", "WANNABE — I walk my own path"],
    ["완벽할 필요 없어", "Wanbyeokhal piryo eopseo", "I don't need to be perfect"],
    ["I wanna be myself, not you", "I wanna be myself, not you", "I wanna be myself, not you"],
    ["이대로가 좋아 나는", "Idaero ga joa naneun", "I like being exactly this way"],
  ]));
  await addSong("itzy-sneakers", "Sneakers", itzyCheckmate.id, itzy.id, 2022, itzyCheckmate.coverArt!, 58000, lyrics([
    ["신발 끈 묶고 달려", "Sinbal kkeun mukgo dallyeo", "Tie your sneakers and run"],
    ["오늘 하루 마음껏", "Oneul haru maeumkkeot", "Today, to your heart's content"],
    ["Sneakers on, world at my feet", "Sneakers on, world at my feet", "Sneakers on, world at my feet"],
    ["걱정 따윈 필요 없어", "Geokjeong ttawin piryo eopseo", "No need to worry at all"],
    ["빠르게 달려가도 좋아", "Ppareuge dallyeogado joa", "It's fine to run fast"],
    ["Sneakers hitting every beat", "Sneakers hitting every beat", "Sneakers hitting every beat"],
    ["자유롭게 날아가", "Jayulopge narraga", "Fly freely"],
    ["오늘만큼은 신나게", "Oneulmankeumeun sinnage", "At least for today, let's have fun"],
  ]));
  await addSong("itzy-dalla-dalla", "DALLA DALLA", itzyNotShy.id, itzy.id, 2019, itzyNotShy.coverArt!, 82000, lyrics([
    ["달라 달라 나는 달라", "Dalla dalla naneun dalla", "Different, different — I'm different"],
    ["남들과는 다른 나야", "Namdeulgwaneun dareun naya", "I'm different from everyone else"],
    ["뭔가 특별해 보이지", "Mwonga teukbyeolhae boiji", "Don't I look a little special"],
    ["DALLA DALLA, 맞아", "DALLA DALLA, maja", "DALLA DALLA — that's right"],
    ["내가 하고 싶은 대로", "Naega hago sipeun daero", "Doing whatever I want"],
    ["누가 뭐라 해도", "Nuga mworago haedo", "No matter what anyone says"],
    ["Dalla dalla, this is me", "Dalla dalla, this is me", "Dalla dalla — this is me"],
    ["완전히 나답게 살아", "Wanjeonhi nadapge sara", "Living completely like myself"],
  ]));

  // Stray Kids
  const skz = await prisma.artist.create({ data: {
    slug: "stray-kids", type: "GROUP", stageName: "Stray Kids", debutYear: 2018, labelId: jyp.id,
    bio: "Stray Kids (스트레이 키즈) is an eight-member boy group formed through a JYP Entertainment reality show. Known as a 'self-producing idol group', members write and produce much of their own music. Their fanbase STAY fuels one of the most passionate communities in fourth-generation K-pop.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Stray_Kids_at_2022_MAMA_Awards_%28cropped%29.jpg/960px-Stray_Kids_at_2022_MAMA_Awards_%28cropped%29.jpg",
  }});
  const skzOdinaryWorld = await prisma.album.create({ data: { slug: "skz-5-star", title: "5-STAR", artistId: skz.id, releaseYear: 2023, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a1/f2/3b/a1f23b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c/195882383219_Cover.jpg/600x600bb.jpg" } });
  const skzMaxident = await prisma.album.create({ data: { slug: "skz-maxident", title: "MAXIDENT", artistId: skz.id, releaseYear: 2022, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/b2/c3/d4/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/196589302789_Cover.jpg/600x600bb.jpg" } });
  await addSong("skz-maniac", "MANIAC", skzOdinaryWorld.id, skz.id, 2022, skzOdinaryWorld.coverArt!, 79000, lyrics([
    ["미친듯이 달려가", "Michindeusi dallyeoga", "Running like crazy"],
    ["멈출 수 없어 이미", "Meomchul su eopseo imi", "Can't stop anymore — it's already started"],
    ["MANIAC, 우리가 만든 세계", "MANIAC, uriga mandeun segye", "MANIAC — the world we built"],
    ["규칙 따위 없어", "Gyuchig ttawi eopseo", "No such thing as rules"],
    ["세상이 우릴 뭐라 해도", "Sesangi uril mworago haedo", "Whatever the world calls us"],
    ["MANIAC, 이게 우리야", "MANIAC, ige uriya", "MANIAC — this is us"],
    ["불꽃처럼 타오르는", "Bulkkotcheoreom taoreuneun", "Burning like flames"],
    ["STAY와 함께라면 가능해", "STAY wa hamkkeramyeon ganeunghae", "Possible if we're with STAY"],
  ]));
  await addSong("skz-gods-menu", "God's Menu", skzMaxident.id, skz.id, 2020, skzMaxident.coverArt!, 88000, lyrics([
    ["오늘의 메뉴는 우리야", "Oneulue menyuneun uriya", "Today's menu is us"],
    ["맛있게 드세요", "Masitge deuseyo", "Enjoy — it's delicious"],
    ["God's Menu, taste the fire", "God's Menu, taste the fire", "God's Menu — taste the fire"],
    ["우리가 만든 레시피", "Uriga mandeun resiphi", "A recipe made by us"],
    ["한 입 베어물면 끝이야", "Han ib beeomurimyeon kkeudiya", "One bite and it's over"],
    ["중독될 수밖에 없어", "Jungdoekdoel su bagge eopseo", "You have no choice but to get addicted"],
    ["God's Menu, we're cookin' up", "God's Menu, we're cookin' up", "God's Menu — we're cookin' up"],
    ["완벽한 우리의 맛", "Wanbyeokhan uriui mat", "Our perfect flavor"],
  ]));
  await addSong("skz-miroh", "MIROH", skzMaxident.id, skz.id, 2019, skzMaxident.coverArt!, 95000, lyrics([
    ["내 앞에 펼쳐진 미로", "Nae ape pyeolchyeojin miro", "The maze spread before me"],
    ["두렵지 않아 뛰어들어", "Duryeopji ana ttwieodeuro", "I'm not afraid — I dive right in"],
    ["MIROH, 이 길의 끝엔 뭐가", "MIROH, i girui kkeutene mwoga", "MIROH — what's at the end of this path"],
    ["내가 찾는 답이 있어", "Naega channeun dabi isseo", "There's the answer I'm looking for"],
    ["한 발 더 나아가", "Han bal deo naaga", "One more step forward"],
    ["멈추지 않을게", "Meomchuji aneulge", "I won't stop"],
    ["MIROH, 이 미로의 주인은 나", "MIROH, i miroui juineun na", "MIROH — I am the master of this maze"],
    ["길을 만들어 나가는 나", "Gireul mandeuro naganeun na", "I forge my own path"],
  ]));

  // Stray Kids × Charlie Puth — "Expert" (Mixtape: Oh)
  const skzMixtapeOh = await prisma.album.create({ data: {
    slug: "skz-mixtape-oh", title: "Mixtape: Oh", artistId: skz.id,
    releaseYear: 2022, type: "EP",
    coverArt: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Stray_Kids_%22Mixtape%3A_Oh%22_EP_Cover.jpg/600px-Stray_Kids_%22Mixtape%3A_Oh%22_EP_Cover.jpg",
  }});
  const expert = await prisma.song.create({ data: {
    slug: "stray-kids-charlie-puth-expert", title: "Expert",
    albumId: skzMixtapeOh.id, releaseYear: 2022,
    coverArt: skzMixtapeOh.coverArt!,
    viewCount: 86000,
    ...lyrics([
      ["전문가처럼 다가와", "Jeonmungacheoreom dagawa", "You approach like an expert"],
      ["내 마음을 읽어내", "Nae mameul ilgeonae", "Reading my heart"],
      ["Expert, 완벽해", "Expert, wanbyeokhae", "Expert — so perfect"],
      ["넌 내 감정의 전문가야", "Neon nae gamjeonge jeonmungaya", "You're an expert in my feelings"],
      ["Charlie Puth's melody, 스트레이키즈의 힘", "Charlie Puth's melody, Stray Kidse him", "Charlie Puth's melody, Stray Kids' power"],
      ["Expert, 우릴 봐줘", "Expert, uril bwajweo", "Expert — look at us"],
      ["이 콜라보 최고야", "I kollabo choegoya", "This collab is the best"],
      ["Expert, 느껴봐", "Expert, neukkyeobwa", "Expert — feel it"],
    ]),
  }});
  await prisma.songCredit.create({ data: { songId: expert.id, artistId: skz.id,         role: "PRIMARY" } });
  await prisma.songCredit.create({ data: { songId: expert.id, artistId: charliePuth.id,  role: "featured" } });

  // TXT (Tomorrow X Together)
  const txt = await prisma.artist.create({ data: {
    slug: "txt", type: "GROUP", stageName: "TXT", debutYear: 2019, labelId: hybe.id,
    bio: "TOMORROW X TOGETHER (투모로우바이투게더), known as TXT, is a five-member boy group from HYBE. Their music explores themes of youth, dreams, and identity through a narrative concept called 'The Dream Chapter'. Known for a melodic rock-influenced sound and deeply conceptual storytelling.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/TXT_at_2023_Melon_Music_Awards.jpg/960px-TXT_at_2023_Melon_Music_Awards.jpg",
  }});
  const txtDream = await prisma.album.create({ data: { slug: "txt-dream-chapter-magic", title: "The Dream Chapter: MAGIC", artistId: txt.id, releaseYear: 2019, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/c1/d2/e3/c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f/19UMGIM47821.rgb.jpg/600x600bb.jpg" } });
  const txtMinisode = await prisma.album.create({ data: { slug: "txt-minisode-2-thursday-child", title: "minisode 2: Thursday's Child", artistId: txt.id, releaseYear: 2022, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/d2/e3/f4/d2e3f4a5-b6c7-8d9e-0f1a-2b3c4d5e6f7a/196589074476_Cover.jpg/600x600bb.jpg" } });
  await addSong("txt-blue-hour", "Blue Hour", txtDream.id, txt.id, 2020, txtDream.coverArt!, 67000, lyrics([
    ["파란 시간 속에서", "Paran sigan soge seo", "Inside the blue hour"],
    ["너와 나만의 세계", "Neowa namane segye", "A world that belongs only to you and me"],
    ["Blue hour, 이 순간만큼은", "Blue hour, i sunganmankeumeun", "Blue hour — at least in this moment"],
    ["영원히 멈추길 바라", "Yeongwonhi meomchugil bara", "I wish it would stop forever"],
    ["하늘이 물드는 시간", "Haneuri muldeoneun sigan", "The time when the sky is painted"],
    ["너와 함께라면 좋겠어", "Neowa hamkkeramyeon jokesseo", "I wish I could be with you"],
    ["Blue hour — stay here with me", "Blue hour — stay here with me", "Blue hour — stay here with me"],
    ["이 빛 속에 영원히", "I bit soge yeongwonhi", "Forever in this light"],
  ]));
  await addSong("txt-0x1-lovesong", "0X1=LOVESONG (I Know I Love You)", txtMinisode.id, txt.id, 2021, txtMinisode.coverArt!, 72000, lyrics([
    ["수학처럼 풀 수 없는", "Suhakcheoreom pul su eomneun", "Can't solve it like mathematics"],
    ["우리 사이의 방정식", "Uri saie bangjeongssik", "The equation between us"],
    ["0 곱하기 1은 사랑이야", "0 gophagi 1eun sarangiya", "Zero times one equals love"],
    ["이해할 수 없어도", "Ihaehal su eopseo do", "Even if I can't understand it"],
    ["I know I love you anyway", "I know I love you anyway", "I know I love you anyway"],
    ["말이 안 돼도 느껴져", "Mari an dwaedo neukkyeojyeo", "Even if it doesn't make sense, I feel it"],
    ["0X1=LOVESONG, 우린 맞아", "0X1=LOVESONG, urin maja", "0X1=LOVESONG — we fit"],
    ["이게 사랑의 공식이야", "Ige sarange gongsigiya", "This is love's formula"],
  ]));
  await addSong("txt-crown", "Crown", txtDream.id, txt.id, 2019, txtDream.coverArt!, 61000, lyrics([
    ["뿔이 났어 내 머리에", "Ppuri nasseo nae meolie", "Horns grew on my head"],
    ["숨기고 싶었지만", "Sumgigo sipeotnajiman", "I wanted to hide them"],
    ["Crown, 이게 바로 나야", "Crown, ige baro naya", "Crown — this is exactly who I am"],
    ["감추지 않을게", "Gamchuji aneulge", "I won't hide anymore"],
    ["다름이 아름다움이야", "Dareumi areumdaumiiya", "Difference is beauty"],
    ["내 왕관을 써줄게", "Nae wanggwaneul sseojulge", "I'll wear my crown"],
    ["Crown, 빛나는 나의 것", "Crown, bitnaneun naui geot", "Crown — it's mine, shining"],
    ["누구도 빼앗을 수 없어", "Nugudo ppaeasseul su eopseo", "No one can take it away"],
  ]));

  // ENHYPEN
  const enhypen = await prisma.artist.create({ data: {
    slug: "enhypen", type: "GROUP", stageName: "ENHYPEN", debutYear: 2020, labelId: beliftLab.id,
    bio: "ENHYPEN (엔하이픈) is a seven-member boy group formed through the reality competition 'I-Land' (2020), produced by HYBE and CJ ENM. Their music explores themes of youth in transition, identity, and emotional growth, with a vampiric lore running through their discography.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/ENHYPEN_at_2022_MAMA_Awards.jpg/960px-ENHYPEN_at_2022_MAMA_Awards.jpg",
  }});
  const engyDimension = await prisma.album.create({ data: { slug: "enhypen-dimension-dilemma", title: "DIMENSION : DILEMMA", artistId: enhypen.id, releaseYear: 2021, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/e3/f4/a5/e3f4a5b6-c7d8-9e0f-1a2b-3c4d5e6f7a8b/196589022637_Cover.jpg/600x600bb.jpg" } });
  const enhypenBorder = await prisma.album.create({ data: { slug: "enhypen-border-day-one", title: "BORDER : DAY ONE", artistId: enhypen.id, releaseYear: 2020, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/f4/a5/b6/f4a5b6c7-d8e9-0f1a-2b3c-4d5e6f7a8b9c/20UMGIM76213.rgb.jpg/600x600bb.jpg" } });
  await addSong("enhypen-given-taken", "Given-Taken", enhypenBorder.id, enhypen.id, 2020, enhypenBorder.coverArt!, 68000, lyrics([
    ["주어진 것과 빼앗긴 것", "Jueojin geotgwa ppaeasgin geot", "What is given and what is taken"],
    ["경계 위에 서 있어", "Gyeonggye wie seo isseo", "I stand on the border"],
    ["Given-taken, 어느 쪽이야", "Given-taken, eoneu jjokiya", "Given-taken — which side am I on"],
    ["아직도 모르겠어", "Ajigdo moreugeseo", "I still don't know"],
    ["빛과 어둠 사이에서", "Bitgwa eodum saieseo", "Between light and darkness"],
    ["나는 어디쯤 있을까", "Naneun eodijjeum isseulkka", "Where do I belong"],
    ["Given-taken, 이게 나의 숙명", "Given-taken, ige naui sungmyeong", "Given-taken — this is my fate"],
    ["받아들이는 법을 배워", "Badadeullineun beobeul baeweo", "Learning how to accept it"],
  ]));
  await addSong("enhypen-drunk-dazed", "Drunk-Dazed", engyDimension.id, enhypen.id, 2021, engyDimension.coverArt!, 74000, lyrics([
    ["취한 듯 몽롱한 밤", "Chwiha deut mongronhan bam", "A drunk, hazy night"],
    ["현실과 꿈 사이를 걷는 나", "Hyeonsil gwa kkum saireul geomneun na", "I walk between reality and dreams"],
    ["Drunk-dazed, 멈출 수가 없어", "Drunk-dazed, meomchul suga eopseo", "Drunk-dazed — I can't stop"],
    ["이 감각에 빠져들어", "I gamgage ppajyeodeuro", "Sinking into this sensation"],
    ["네가 만든 미로 속에서", "Nega mandeun miro soge seo", "Inside the maze you made"],
    ["길을 잃었어", "Gireul ireoesseo", "I've lost my way"],
    ["Drunk-dazed, 꿈인 듯 현실", "Drunk-dazed, kkumin deut hyeonsil", "Drunk-dazed — like a dream, yet real"],
    ["네 안에 갇혀버린 나", "Ne ane gachyeobeolin na", "Me, trapped inside of you"],
  ]));
  await addSong("enhypen-future-perfect", "Future Perfect (Pass the MIC)", engyDimension.id, enhypen.id, 2022, engyDimension.coverArt!, 63000, lyrics([
    ["완벽한 미래를 향해", "Wanbyeokhan miraereul hyanghae", "Toward a perfect future"],
    ["한 걸음씩 나아가", "Han georeumssik naaga", "One step at a time"],
    ["Pass the MIC, 우리 차례야", "Pass the MIC, uri charyeya", "Pass the MIC — it's our turn"],
    ["세상에 외쳐봐", "Sesange oechyeobwa", "Shout it to the world"],
    ["Future perfect, 이미 이룬 것처럼", "Future perfect, imi irun geotcheoreom", "Future perfect — as if already achieved"],
    ["믿음 하나로 달려가", "Mideum hanaro dallyeoga", "Running on just one belief"],
    ["Pass the MIC, ENGENE와", "Pass the MIC, ENGENE wa", "Pass the MIC — with ENGENE"],
    ["함께라면 뭐든 가능해", "Hamkkeramyeon mwodeun ganeunghae", "Anything is possible together"],
  ]));

  // LE SSERAFIM
  const lesserafim = await prisma.artist.create({ data: {
    slug: "le-sserafim", type: "GROUP", stageName: "LE SSERAFIM", debutYear: 2022, labelId: sourceMusic.id,
    bio: "LE SSERAFIM (르세라핌) is a five-member girl group from Source Music (HYBE). Their name is an anagram of 'I'M FEARLESS'. Known for athletic, powerful choreography, and an empowering 'fearless' concept that encourages authenticity over perfection.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Le_Sserafim_at_2023_Melon_Music_Awards.jpg/960px-Le_Sserafim_at_2023_Melon_Music_Awards.jpg",
  }});
  const lsfFearless = await prisma.album.create({ data: { slug: "le-sserafim-fearless", title: "FEARLESS", artistId: lesserafim.id, releaseYear: 2022, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/a5/b6/c7/a5b6c7d8-e9f0-1a2b-3c4d-5e6f7a8b9c0d/196589148828_Cover.jpg/600x600bb.jpg" } });
  const lsfAntifragile = await prisma.album.create({ data: { slug: "le-sserafim-antifragile", title: "ANTIFRAGILE", artistId: lesserafim.id, releaseYear: 2022, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/b6/c7/d8/b6c7d8e9-f0a1-2b3c-4d5e-6f7a8b9c0d1e/196589489543_Cover.jpg/600x600bb.jpg" } });
  await addSong("le-sserafim-fearless", "FEARLESS", lsfFearless.id, lesserafim.id, 2022, lsfFearless.coverArt!, 89000, lyrics([
    ["두려움 없이 나아가", "Duryeoum eopsi naaga", "Moving forward without fear"],
    ["내 길을 막을 자 없어", "Nae gireul mageul ja eopseo", "Nothing can block my path"],
    ["FEARLESS, 이게 나야", "FEARLESS, ige naya", "FEARLESS — this is me"],
    ["완벽하지 않아도 괜찮아", "Wanbyeokaji anado gwaenchana", "It's okay not to be perfect"],
    ["I'm fearless, fearless", "I'm fearless, fearless", "I'm fearless — fearless"],
    ["나 자신을 믿어", "Na jasineul mideo", "I believe in myself"],
    ["FEARLESS, 흔들리지 않아", "FEARLESS, heundeulliji ana", "FEARLESS — I will not be shaken"],
    ["강한 나를 보여줄게", "Ganghan nareul boyeojulge", "I'll show you my strong self"],
  ]));
  await addSong("le-sserafim-antifragile", "ANTIFRAGILE", lsfAntifragile.id, lesserafim.id, 2022, lsfAntifragile.coverArt!, 97000, lyrics([
    ["부서져도 더 강해져", "Buseojyeo do deo ganghaehjyeo", "Even broken, I grow stronger"],
    ["이게 나의 방식이야", "Ige naui bangsigiya", "This is my way"],
    ["ANTIFRAGILE, 넘어져도 일어나", "ANTIFRAGILE, neomyeojyeo do ireona", "ANTIFRAGILE — I fall but I rise"],
    ["더 단단해지는 나", "Deo dandanhaehjineun na", "Becoming more solid"],
    ["Stress, pain — I turn it into gain", "Stress, pain — I turn it into gain", "Stress, pain — I turn it into gain"],
    ["부셔질수록 빛나는 나", "Busyeojilseorok bitnaneun na", "The more I break, the brighter I shine"],
    ["ANTIFRAGILE, 이게 내 힘", "ANTIFRAGILE, ige nae him", "ANTIFRAGILE — this is my strength"],
    ["시련이 날 더 강하게 해", "Siryeoni nal deo ganghage hae", "Hardship makes me stronger"],
  ]));
  await addSong("le-sserafim-perfect-night", "Perfect Night", lsfAntifragile.id, lesserafim.id, 2023, lsfAntifragile.coverArt!, 81000, lyrics([
    ["오늘 밤은 완벽해", "Oneul bameun wanbyeokhae", "Tonight is perfect"],
    ["네 옆에 있는 것만으로", "Ne yeope itneun geotmaneuro", "Just being beside you"],
    ["Perfect night, 이 순간이", "Perfect night, i sunganbi", "Perfect night — this moment"],
    ["영원히 기억될 거야", "Yeongwonhi gieokdoel geoya", "Will be remembered forever"],
    ["별빛 아래서 춤을 춰", "Byeolbit arae seo chumeul chwo", "Dancing under starlight"],
    ["걱정 없는 밤이야", "Geokjeong eopmneun bamiya", "A night without worries"],
    ["Perfect night, 너와 나", "Perfect night, neowa na", "Perfect night — you and me"],
    ["이 밤이 끝나지 않았으면", "I bami kkeunnaji aneotseumyeon", "I wish this night would never end"],
  ]));

  // (G)I-DLE
  const gidle = await prisma.artist.create({ data: {
    slug: "g-i-dle", type: "GROUP", stageName: "(G)I-DLE", debutYear: 2018, labelId: cubeEnt.id,
    bio: "(여자)아이들, romanized as (G)I-DLE, is a five-member girl group from Cube Entertainment. Led by self-producing member Soyeon, the group writes and produces much of their own music. Known for versatile genre-blending, fierce performances, and a bold artistic identity.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/%28G%29I-DLE_at_2023_MAMA_Awards.jpg/960px-%28G%29I-DLE_at_2023_MAMA_Awards.jpg",
  }});
  const gidleIAmAlbum = await prisma.album.create({ data: { slug: "g-i-dle-i-never-die", title: "I NEVER DIE", artistId: gidle.id, releaseYear: 2022, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/c7/d8/e9/c7d8e9f0-a1b2-3c4d-5e6f-7a8b9c0d1e2f/196922062849_Cover.jpg/600x600bb.jpg" } });
  const gidleIFeel = await prisma.album.create({ data: { slug: "g-i-dle-i-feel", title: "I feel", artistId: gidle.id, releaseYear: 2023, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d8/e9/f0/d8e9f0a1-b2c3-4d5e-6f7a-8b9c0d1e2f3a/196922767523_Cover.jpg/600x600bb.jpg" } });
  await addSong("g-i-dle-tomboy", "TOMBOY", gidleIAmAlbum.id, gidle.id, 2022, gidleIAmAlbum.coverArt!, 102000, lyrics([
    ["나는 말야 약간 특이해", "Naneun malya yakgan teukihae", "Me? I'm a bit unusual"],
    ["그냥 나처럼 살고 싶어", "Geunyang nacheoreom salgo sipeo", "I just want to live like myself"],
    ["Tomboy, 신경 꺼줘", "Tomboy, singyeong kkwojweo", "Tomboy — mind your business"],
    ["내가 하고 싶은 대로야", "Naega hago sipeun daeroya", "I do it my way"],
    ["Oh, I'm a tomboy", "Oh, I'm a tomboy", "Oh, I'm a tomboy"],
    ["판단하지 마", "Pandanhaji ma", "Don't judge me"],
    ["Tomboy, 이게 바로 나야", "Tomboy, ige baro naya", "Tomboy — this is exactly me"],
    ["변하지 않을 내 모습", "Byeonhaji aneul nae moseup", "My look that will never change"],
  ]));
  await addSong("g-i-dle-queencard", "Queencard", gidleIFeel.id, gidle.id, 2023, gidleIFeel.coverArt!, 88000, lyrics([
    ["나는 퀸카야 알아봐줘", "Naneun quinkaya arabwajweo", "I'm a queen card — acknowledge it"],
    ["내 매력은 숨길 수 없어", "Nae maeryeong eun sumgil su eopseo", "My charm can't be hidden"],
    ["Queencard, 나를 봐", "Queencard, nareul bwa", "Queencard — look at me"],
    ["이 세상의 주인공은 나야", "I sesange juingongeun naya", "I'm the main character of this world"],
    ["자신감 있게 걸어가", "Jasingam itge georeoga", "Walk with confidence"],
    ["누가 뭐래도 상관없어", "Nuga mwollaedo sanggwaneopseo", "It doesn't matter what anyone says"],
    ["Queencard, 빛나는 나", "Queencard, bitnaneun na", "Queencard — shining me"],
    ["오늘도 완벽해 나는", "Oneuldo wanbyeokhae naneun", "I'm perfect today too"],
  ]));
  await addSong("g-i-dle-nxde", "Nxde", gidleIAmAlbum.id, gidle.id, 2022, gidleIAmAlbum.coverArt!, 76000, lyrics([
    ["벗어던진 가면 뒤에", "Beoseodeonjin gamyeon dwie", "Behind the mask I've taken off"],
    ["진짜 내가 있어", "Jinjja naega isseo", "My true self exists"],
    ["Nxde, 꾸밈없는 나", "Nxde, kkumimeomneun na", "Nxde — me without adornment"],
    ["이게 진짜 아름다움", "Ige jinjja areumdaum", "This is true beauty"],
    ["예술처럼 완성된 나", "Yesulcheoreom wansseongdoen na", "Me, perfected like art"],
    ["Marilyn Monroe, yeah", "Marilyn Monroe, yeah", "Marilyn Monroe, yeah"],
    ["Nxde, 있는 그대로야", "Nxde, inneun geudaeroya", "Nxde — exactly as it is"],
    ["꾸밀 필요 없어 나는", "Kkumil piryo eopseo naneun", "I don't need to be dressed up"],
  ]));

  // ATEEZ
  const ateez = await prisma.artist.create({ data: {
    slug: "ateez", type: "GROUP", stageName: "ATEEZ", debutYear: 2018, labelId: kqEnt.id,
    bio: "ATEEZ (에이티즈) is an eight-member boy group from KQ Entertainment. Known for explosive, theatrical performances and an elaborate pirate/adventure lore narrative called the 'Treasure' universe. ATEEZ built one of the most dedicated international fanbases (ATINY) through relentless touring before achieving mainstream success.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/ATEEZ_at_2023_MAMA_Awards.jpg/960px-ATEEZ_at_2023_MAMA_Awards.jpg",
  }});
  const ateezTreasure = await prisma.album.create({ data: { slug: "ateez-treasure-ep-fin-all-to-action", title: "TREASURE EP.FIN: All to Action", artistId: ateez.id, releaseYear: 2019, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/e9/f0/a1/e9f0a1b2-c3d4-5e6f-7a8b-9c0d1e2f3a4b/19UMGIM43682.rgb.jpg/600x600bb.jpg" } });
  const ateezZero = await prisma.album.create({ data: { slug: "ateez-zero-fever-part-1", title: "ZERO : FEVER Part.1", artistId: ateez.id, releaseYear: 2021, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/f0/a1/b2/f0a1b2c3-d4e5-6f7a-8b9c-0d1e2f3a4b5c/21UMGIM07182.rgb.jpg/600x600bb.jpg" } });
  await addSong("ateez-fireworks", "Fireworks (I'll Be There)", ateezZero.id, ateez.id, 2021, ateezZero.coverArt!, 84000, lyrics([
    ["불꽃처럼 타오를게", "Bulkkotcheoreom taoreulge", "I'll burn like fireworks"],
    ["어둠을 밝혀줄게", "Eodumeul balkyeojulge", "I'll light up the darkness"],
    ["Fireworks, 내가 여기 있어", "Fireworks, naega yeogi isseo", "Fireworks — I am here"],
    ["ATINY 너의 곁에", "ATINY, neoui gyeote", "ATINY — right beside you"],
    ["하늘 가득 터져라", "Haneul gadeuk teojyeora", "Burst across the whole sky"],
    ["우리의 빛을 봐줘", "Uriui bireul bwajweo", "Look at our light"],
    ["Fireworks, 영원히 빛나", "Fireworks, yeongwonhi bitna", "Fireworks — shining forever"],
    ["꺼지지 않을 불꽃이야", "Kkeojiji aneul bulkkodiya", "A flame that will never go out"],
  ]));
  await addSong("ateez-bouncy", "BOUNCY (K-Hot Chilli Peppers)", ateezTreasure.id, ateez.id, 2018, ateezTreasure.coverArt!, 71000, lyrics([
    ["뛰어, 뛰어, 높이 뛰어", "Ttwio, ttwio, nophi ttwio", "Jump, jump, jump up high"],
    ["한계를 넘어서", "Hangyereul neomeoaseo", "Beyond the limit"],
    ["BOUNCY, 신나게 달려", "BOUNCY, sinnage dallyeo", "BOUNCY — run with excitement"],
    ["이 에너지 느껴봐", "I eneoji neukkyeobwa", "Feel this energy"],
    ["Hot like chilli peppers", "Hot like chilli peppers", "Hot like chilli peppers"],
    ["우릴 막을 수 없어", "Uril mageul su eopseo", "You can't stop us"],
    ["BOUNCY, 하늘까지 뛰어", "BOUNCY, haneulkkaji ttwio", "BOUNCY — jump to the sky"],
    ["멈추지 않을 우리야", "Meomchuji aneul uriya", "We will never stop"],
  ]));
  await addSong("ateez-inception", "INCEPTION", ateezZero.id, ateez.id, 2020, ateezZero.coverArt!, 78000, lyrics([
    ["꿈속에 빠져들어", "Kkumsoge ppajyeodeuro", "Falling deep into a dream"],
    ["현실이 흐릿해져", "Hyeonsiri heurithaejyeo", "Reality grows blurry"],
    ["Inception, 이건 꿈인가", "Inception, igeon kkuminga", "Inception — is this a dream"],
    ["아니면 현실인가", "Animyeon hyeonsiring a", "Or is it reality"],
    ["눈을 떠도 보이는 건 너야", "Nuneul tteodo boinneun geon neoya", "Even when I open my eyes, all I see is you"],
    ["깨어날 수 없는 꿈", "Kkaeeonal su eomneun kkum", "A dream I can't wake from"],
    ["Inception, deeper and deeper", "Inception, deeper and deeper", "Inception — deeper and deeper"],
    ["네 안에 갇혀버렸어", "Ne ane gachyeobeoryeosseo", "I've been trapped inside of you"],
  ]));

  // Red Velvet
  const redvelvet = await prisma.artist.create({ data: {
    slug: "red-velvet", type: "GROUP", stageName: "Red Velvet", debutYear: 2014, labelId: sm.id,
    bio: "Red Velvet (레드벨벳) is a five-member girl group from SM Entertainment known for their dual concept: the bright, upbeat 'Red' side and the dark, sensual 'Velvet' side. Acclaimed for outstanding vocal ability, experimental production, and visually arresting music videos.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Red_Velvet_at_2023_MAMA.jpg/960px-Red_Velvet_at_2023_MAMA.jpg",
  }});
  const rvPerfectvelvet = await prisma.album.create({ data: { slug: "red-velvet-perfect-velvet", title: "Perfect Velvet", artistId: redvelvet.id, releaseYear: 2017, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/0a/1b/2c/0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d/18UMGIM05672.rgb.jpg/600x600bb.jpg" } });
  const rvQueens = await prisma.album.create({ data: { slug: "red-velvet-queens", title: "Chill Kill", artistId: redvelvet.id, releaseYear: 2023, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/1b/2c/3d/1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e/196922785466_Cover.jpg/600x600bb.jpg" } });
  await addSong("red-velvet-psycho", "Psycho", rvPerfectvelvet.id, redvelvet.id, 2019, rvPerfectvelvet.coverArt!, 91000, lyrics([
    ["네가 없으면 나는 못 살아", "Nega eopsseumyeon naneun mot sara", "I can't live without you"],
    ["이건 말이 안 돼", "Igeon mari an dwae", "This doesn't make sense"],
    ["Psycho, 나 왜 이러는 걸까", "Psycho, na wae ireoneun geolkka", "Psycho — why am I like this"],
    ["너에게 중독됐어", "Neoege jungdoktdwaesseo", "I'm addicted to you"],
    ["우리 사이 설명하기 어려워", "Uri sai seolmyeonghagi eoryeowo", "Hard to explain what's between us"],
    ["비정상이 정상이야", "Bijeongsamgi jeongsamiya", "The abnormal is the normal"],
    ["Psycho, 이런 나를 봐줘", "Psycho, ireon nareul bwajweo", "Psycho — look at me like this"],
    ["너 없인 살 수 없어", "Neo eobsin sal su eopseo", "I cannot live without you"],
  ]));
  await addSong("red-velvet-red-flavor", "Red Flavor", rvPerfectvelvet.id, redvelvet.id, 2017, rvPerfectvelvet.coverArt!, 83000, lyrics([
    ["여름이 좋아 그 기분 알아", "Yeoreumi joa geu gibun ara", "I love summer — I know that feeling"],
    ["빨간 맛이 궁금해", "Ppalggan masi gunggeumhae", "I'm curious about the red flavor"],
    ["Red flavor, 새콤달콤해", "Red flavor, saekomdalkomhae", "Red flavor — sweet and tart"],
    ["이 여름날처럼 싱그러워", "I yeoreum nalcheoreom singeureowo", "Fresh like this summer day"],
    ["태양처럼 빛나는 너", "Taeyangcheoreom bitnaneun neo", "You shining like the sun"],
    ["내 맘을 달아오르게 해", "Nae mameul daraoreuge hae", "You make my heart heat up"],
    ["Red flavor, 너와 나", "Red flavor, neowa na", "Red flavor — you and me"],
    ["이 여름이 영원하면 좋겠어", "I yeoreumi yeongwonhamyeon jokesseo", "I wish this summer would last forever"],
  ]));
  await addSong("red-velvet-feel-my-rhythm", "Feel My Rhythm", rvQueens.id, redvelvet.id, 2022, rvQueens.coverArt!, 76000, lyrics([
    ["바흐의 선율 타고", "Baheue seonnyul tago", "Riding Bach's melody"],
    ["내 감정이 흘러가", "Nae gamjeong i heulleoga", "My emotions flow"],
    ["Feel my rhythm, 느껴봐", "Feel my rhythm, neukkkyeobwa", "Feel my rhythm — feel it"],
    ["클래식과 팝이 만나", "Keullaeseikgwa pabi manna", "Classic and pop meeting"],
    ["음악 속에 빠져들어", "Eumak soge ppajyeodeuro", "Falling into the music"],
    ["마음이 춤을 춰", "Maeumi chumeul chwo", "My heart is dancing"],
    ["Feel my rhythm, 함께 해", "Feel my rhythm, hamkke hae", "Feel my rhythm — join me"],
    ["선율에 몸을 맡겨봐", "Seonnyure momeul matkyeobwa", "Give yourself to the melody"],
  ]));

  // NCT 127
  const nct127 = await prisma.artist.create({ data: {
    slug: "nct-127", type: "GROUP", stageName: "NCT 127", debutYear: 2016, labelId: sm.id,
    bio: "NCT 127 is the Seoul-based fixed unit of SM Entertainment's rotating 'Neo Culture Technology' concept group NCT. Featuring ten members, they are known for experimental, genre-defying music and high-energy performances. The '127' refers to Seoul's longitude.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/NCT_127_at_2022_MAMA_Awards.jpg/960px-NCT_127_at_2022_MAMA_Awards.jpg",
  }});
  const nct127Regular = await prisma.album.create({ data: { slug: "nct-127-regular-irregular", title: "Regular-Irregular", artistId: nct127.id, releaseYear: 2018, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2c/3d/4e/2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f/18UMGIM56421.rgb.jpg/600x600bb.jpg" } });
  const nct127Sticker = await prisma.album.create({ data: { slug: "nct-127-sticker", title: "Sticker", artistId: nct127.id, releaseYear: 2021, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/3d/4e/5f/3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a/196589209663.jpg/600x600bb.jpg" } });
  await addSong("nct-127-kick-it", "Kick It", nct127Regular.id, nct127.id, 2020, nct127Regular.coverArt!, 85000, lyrics([
    ["이소룡처럼 나타나", "Isoryongcheoreom natana", "Appearing like Bruce Lee"],
    ["한 방에 쓰러트려", "Han bange sseuroreutriyeo", "Knocking you down in one hit"],
    ["Kick it, 멈출 수 없어", "Kick it, meomchul su eopseo", "Kick it — can't stop"],
    ["우리의 에너지", "Uriui eneoji", "Our energy"],
    ["무술처럼 정확해", "Musulcheoreom jeonghwakhae", "Precise like martial arts"],
    ["Kick it, 강렬하게", "Kick it, gangnyeolhage", "Kick it — intensely"],
    ["NCT 127이 왔어", "NCT 127i wasseo", "NCT 127 has arrived"],
    ["온 세상을 흔들 거야", "On sesangeul heundeul geoya", "We'll shake the whole world"],
  ]));
  await addSong("nct-127-sticker", "Sticker", nct127Sticker.id, nct127.id, 2021, nct127Sticker.coverArt!, 77000, lyrics([
    ["내 맘에 딱 붙어버린", "Nae mame ttak buteobeorin", "Stuck right onto my heart"],
    ["스티커처럼 떼어낼 수 없어", "Seutikkeocheoreom tteeonaeal su eopseo", "Like a sticker — can't peel off"],
    ["Sticker, 이 느낌이 뭐야", "Sticker, i neokkimi mwoya", "Sticker — what is this feeling"],
    ["점점 더 강해져", "Jeomjeom deo ganghaehjyeo", "Getting stronger and stronger"],
    ["네가 내 마음에 붙어", "Nega nae maeume buteo", "You've stuck to my heart"],
    ["Sticker, 잊을 수 없어", "Sticker, ijeul su eopseo", "Sticker — I can't forget"],
    ["온 세상이 우릴 봐", "On sesangi uril bwa", "The whole world looks at us"],
    ["NCT 127, 여기 있어", "NCT 127, yeogi isseo", "NCT 127 — right here"],
  ]));
  await addSong("nct-127-cherry-bomb", "Cherry Bomb", nct127Regular.id, nct127.id, 2017, nct127Regular.coverArt!, 81000, lyrics([
    ["I'm the biggest hit, 펑!",  "I'm the biggest hit, peong!", "I'm the biggest hit — boom!"],
    ["터지기 직전의 설렘", "Teojigi jikjeone seollem", "Excitement right before it explodes"],
    ["Cherry bomb, 위험하게 빛나", "Cherry bomb, wiheomhage bitna", "Cherry bomb — dangerously bright"],
    ["손대면 안 되는 것처럼", "Sondaemyeon an doeneun geotcheoreom", "As if you shouldn't touch it"],
    ["달콤하고 위험한", "Dalkomhago wiheomhan", "Sweet and dangerous"],
    ["Cherry bomb, I go off", "Cherry bomb, I go off", "Cherry bomb — I go off"],
    ["내 에너지가 폭발해", "Nae eneojiga pokbalhae", "My energy explodes"],
    ["멈출 수 없는 나야", "Meomchul su eomneun naya", "I can't be stopped"],
  ]));

  // ── BATCH 2: NCT Dream, Girls' Generation, SHINee, EXO, MAMAMOO, SISTAR, 2NE1, BIGBANG, WINNER, iKON ──

  // NCT Dream
  const nctdream = await prisma.artist.create({ data: {
    slug: "nct-dream", type: "GROUP", stageName: "NCT Dream", debutYear: 2016, labelId: sm.id,
    bio: "NCT Dream is the youth unit of SM Entertainment's NCT, originally composed of teenage members following an 'aging-out' system later revised. Known for a fresher, more youthful sound within the NCT universe, the unit has produced some of SM's best-selling albums.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/NCT_Dream_at_2022_MAMA.jpg/960px-NCT_Dream_at_2022_MAMA.jpg",
  }});
  const nctdreamHotSauce = await prisma.album.create({ data: { slug: "nct-dream-hot-sauce", title: "Hot Sauce", artistId: nctdream.id, releaseYear: 2021, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4e/5f/6a/4e5f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b/196589046247.jpg/600x600bb.jpg" } });
  const nctdreamGlitch = await prisma.album.create({ data: { slug: "nct-dream-glitch-mode", title: "Glitch Mode", artistId: nctdream.id, releaseYear: 2022, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/5f/6a/7b/5f6a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c/196589221863.jpg/600x600bb.jpg" } });
  await addSong("nct-dream-hot-sauce", "Hot Sauce", nctdreamHotSauce.id, nctdream.id, 2021, nctdreamHotSauce.coverArt!, 72000, lyrics([
    ["내 눈을 봐, Hot sauce", "Nae nuneul bwa, Hot sauce", "Look into my eyes — hot sauce"],
    ["뜨겁게 달아올라", "Tteugeopge daraolla", "Heating up fiercely"],
    ["한 방울이면 충분해", "Han bang-urimyeon chungbunhae", "One drop is enough"],
    ["이 맛에 중독돼", "I mase jungdokdwae", "You'll get addicted to this taste"],
    ["Hot sauce, 빠져나올 수 없어", "Hot sauce, ppajyeonaol su eopseo", "Hot sauce — you can't escape"],
    ["우리만의 특별한 맛", "Urimane teukbyeolhan mat", "Our one-of-a-kind flavor"],
    ["NCT Dream, 여기 있어", "NCT Dream, yeogi isseo", "NCT Dream — right here"],
    ["더 뜨겁게 타올라", "Deo tteugeopge taolla", "Burning even hotter"],
  ]));
  await addSong("nct-dream-glitch-mode", "Glitch Mode", nctdreamGlitch.id, nctdream.id, 2022, nctdreamGlitch.coverArt!, 68000, lyrics([
    ["버그처럼 튕겨져", "Beogeucheoreom twingyeojyeo", "Bouncing around like a glitch"],
    ["정상이 아닌 것 같아", "Jeongsamgi anin geot gata", "It feels like it's not normal"],
    ["Glitch mode, 오류 발생", "Glitch mode, oryu balsaeng", "Glitch mode — error occurring"],
    ["너 때문에 고장 났어", "Neo ttaemune gojang nasseo", "Broken because of you"],
    ["재부팅해도 소용없어", "Jaebuting haedo soyong eopseo", "Even rebooting doesn't help"],
    ["Glitch mode, 계속 돼", "Glitch mode, gyesok dwae", "Glitch mode — it keeps happening"],
    ["이 오류가 좋아진다", "I oryuga joajinda", "I'm starting to like this error"],
    ["네가 만든 버그야", "Nega mandeun beoguya", "You're the glitch you made"],
  ]));
  await addSong("nct-dream-chewing-gum", "Chewing Gum", nctdreamHotSauce.id, nctdream.id, 2016, nctdreamHotSauce.coverArt!, 61000, lyrics([
    ["껌처럼 달라붙어", "Kkeomcheoreom dallabucheo", "Sticking to me like chewing gum"],
    ["떨어지질 않아", "Tteoreojijil ana", "Won't come off"],
    ["Chewing gum, 달콤한 너", "Chewing gum, dalkomhan neo", "Chewing gum — sweet you"],
    ["내 입에서 사라지지 마", "Nae ibe seo sarajiji ma", "Don't disappear from my mouth"],
    ["쫄깃쫄깃 네 생각에", "Jjolgit-jjolgit ne saenggake", "Chewy, thinking of you"],
    ["하루가 달아올라", "Haruga daraolla", "My day heats up"],
    ["Chewing gum, 달콤해", "Chewing gum, dalkomhae", "Chewing gum — so sweet"],
    ["계속 씹고 싶어", "Gyesok ssipgo sipeo", "I keep wanting to chew"],
  ]));

  // Girls' Generation (SNSD)
  const snsd = await prisma.artist.create({ data: {
    slug: "girls-generation", type: "GROUP", stageName: "Girls' Generation", debutYear: 2007, labelId: sm.id,
    bio: "Girls' Generation (소녀시대), also known as SNSD, is a nine-member girl group from SM Entertainment. Widely considered the defining K-pop girl group of the second generation, their influence on Korean pop culture is immeasurable. Hits like 'Gee', 'I Got a Boy', and 'Into the New World' remain cultural touchstones.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Girls%27_Generation_at_the_2022_SMTOWN_Live.jpg/960px-Girls%27_Generation_at_the_2022_SMTOWN_Live.jpg",
  }});
  const snsdForever1 = await prisma.album.create({ data: { slug: "girls-generation-forever-1", title: "FOREVER 1", artistId: snsd.id, releaseYear: 2022, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/6a/7b/8c/6a7b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d/196589307018.jpg/600x600bb.jpg" } });
  const snsdIGotABoy = await prisma.album.create({ data: { slug: "girls-generation-i-got-a-boy", title: "I Got a Boy", artistId: snsd.id, releaseYear: 2013, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music3/v4/7b/8c/9d/7b8c9d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e/13UMGIM18463.rgb.jpg/600x600bb.jpg" } });
  await addSong("girls-generation-forever-1", "FOREVER 1", snsdForever1.id, snsd.id, 2022, snsdForever1.coverArt!, 79000, lyrics([
    ["영원히 하나야 우리", "Yeongwonhi hanaya uri", "We are forever one"],
    ["시간이 지나도 변하지 않아", "Sigani jinado byeonhaji ana", "No matter how time passes, we won't change"],
    ["Forever 1, 소녀시대야", "Forever 1, sonyeosidaeya", "Forever 1 — it's Girls' Generation"],
    ["다시 만나서 반가워", "Dasi mannaseo bangawo", "So glad to meet again"],
    ["추억들이 떠올라", "Chueokdeuri tteorolla", "Memories come flooding back"],
    ["Forever 1, 영원히 함께", "Forever 1, yeongwonhi hamkke", "Forever 1 — together forever"],
    ["소녀의 마음 그대로", "Sonyeoe maeum geudaero", "With the heart of a girl, unchanged"],
    ["시간을 거슬러 올라가", "Siganeul geoseulleo ollaga", "Going back against time"],
  ]));
  await addSong("girls-generation-i-got-a-boy", "I Got a Boy", snsdIGotABoy.id, snsd.id, 2013, snsdIGotABoy.coverArt!, 88000, lyrics([
    ["남자 생겼어 여자 친구야", "Namja saenggyeosseo yeoja chinguya", "A boy appeared — girlfriend"],
    ["이상형 딱이야 완전", "Isanghyeong ttakiya wanjeon", "He's exactly my ideal type"],
    ["I got a boy, 멋진 남자", "I got a boy, meotjin namja", "I got a boy — a great guy"],
    ["온 세상이 달라 보여", "On sesangi dalla boyeo", "The whole world looks different"],
    ["Ayo GG, 수줍게 웃어", "Ayo GG, sujupge useo", "Ayo GG — smiling shyly"],
    ["설레는 내 마음", "Seollenneun nae maeum", "My fluttering heart"],
    ["I got a boy, 내 꿈의 남자", "I got a boy, nae kkume namja", "I got a boy — the man of my dreams"],
    ["완벽한 그를 봐", "Wanbyeokhan geureul bwa", "Look at this perfect him"],
  ]));
  await addSong("girls-generation-gee", "Gee", snsdIGotABoy.id, snsd.id, 2009, snsdIGotABoy.coverArt!, 102000, lyrics([
    ["지 지 지 지 지 지 지 지", "Ji ji ji ji ji ji ji ji", "Gee gee gee gee baby baby"],
    ["너무 좋아 어떡하지", "Neomu joa eotteokaji", "I like you so much — what should I do"],
    ["Gee, 눈을 감아봐", "Gee, nuneul gamabwa", "Gee — try closing your eyes"],
    ["이 느낌이 뭔지 알아", "I neokkimi mwonji ara", "You know what this feeling is"],
    ["머릿속에 가득해 너", "Meorissoge gadeukae neo", "My head is filled with you"],
    ["Gee, 어떻게 말해", "Gee, eotteoke malhae", "Gee — how do I say it"],
    ["이 두근거림 뭘까", "I dugeungeorrim mwoilkka", "What is this pounding"],
    ["처음 느끼는 감정이야", "Cheoeum neukkinneun gamjeongiya", "It's a feeling I've never felt before"],
  ]));

  // SHINee
  const shinee = await prisma.artist.create({ data: {
    slug: "shinee", type: "GROUP", stageName: "SHINee", debutYear: 2008, labelId: sm.id,
    bio: "SHINee (샤이니) is a South Korean boy group from SM Entertainment, debuting in 2008. Known as 'Princes of K-pop', SHINee pioneered a sophisticated neo-soul and R&B-influenced approach within idol music. After the tragic passing of member Jonghyun in 2017, the group continues as a four-member act, honoring his legacy.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/SHINee_at_2022_SMTOWN_Live_%28cropped%29.jpg/960px-SHINee_at_2022_SMTOWN_Live_%28cropped%29.jpg",
  }});
  const shineeOdd = await prisma.album.create({ data: { slug: "shinee-odd", title: "Odd", artistId: shinee.id, releaseYear: 2015, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music6/v4/8c/9d/0e/8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f/15UMGIM51242.rgb.jpg/600x600bb.jpg" } });
  const shineeDon = await prisma.album.create({ data: { slug: "shinee-don-t-call-me", title: "Don't Call Me", artistId: shinee.id, releaseYear: 2021, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/9d/0e/1f/9d0e1f2a-3b4c-5d6e-7f8a-9b0c1d2e3f4a/196589082860.jpg/600x600bb.jpg" } });
  await addSong("shinee-view", "View", shineeOdd.id, shinee.id, 2015, shineeOdd.coverArt!, 74000, lyrics([
    ["세상에 가득해 빛이 나", "Sesange gadeukae bichi na", "Light fills the world"],
    ["너만 보고 싶어", "Neoman bogo sipeo", "I only want to see you"],
    ["View, 이 순간을 봐", "View, i sunganeul bwa", "View — look at this moment"],
    ["아름다운 우리 세계", "Areumdaun uri segye", "Our beautiful world"],
    ["네가 있어 충분해", "Nega isseo chungbunhae", "You being here is enough"],
    ["View, 영원히 기억해", "View, yeongwonhi gieokae", "View — remember this forever"],
    ["이 풍경을 담아둬", "I punggyeong eul damadweo", "Keep this scenery"],
    ["우리 함께한 모든 것", "Uri hamkkehan modeun geot", "Everything we shared together"],
  ]));
  await addSong("shinee-dont-call-me", "Don't Call Me", shineeDon.id, shinee.id, 2021, shineeDon.coverArt!, 69000, lyrics([
    ["전화하지 마", "Jeonhwahaji ma", "Don't call me"],
    ["다 끝났어 우리는", "Da kkeunna sseo urineun", "We're done — it's over"],
    ["Don't call me, 이미 늦었어", "Don't call me, imi neujeosseo", "Don't call me — it's already too late"],
    ["다시 돌아올 수 없어", "Dasi doraol su eopseo", "You can't come back"],
    ["미련 없이 끊어줘", "Miryeon eopsi kkeuneojweo", "Cut it off without regret"],
    ["Don't call me, 정말이야", "Don't call me, jeongmariya", "Don't call me — I mean it"],
    ["이제는 남인 우리", "Ije neun namin uri", "Now we are strangers"],
    ["잊어줘 나를 제발", "Ijeojweo nareul jebal", "Please forget me"],
  ]));
  await addSong("shinee-ring-ding-dong", "Ring Ding Dong", shineeOdd.id, shinee.id, 2009, shineeOdd.coverArt!, 85000, lyrics([
    ["Ring ding dong, ring ding dong", "Ring ding dong, ring ding dong", "Ring ding dong, ring ding dong"],
    ["Ring ding ding ding ding dong", "Ring ding ding ding ding dong", "Ring ding ding ding ding dong"],
    ["그녀의 눈빛에 반해버렸어", "Geunyeoe nunbiche banhaebeolyeosseo", "I fell for the look in her eyes"],
    ["어쩔 수 없어 나는", "Eojjeol su eopseo naneun", "I can't help it"],
    ["이 감정 표현하고 싶어", "I gamjeong pyohyeonhago sipeo", "I want to express this feeling"],
    ["어떻게 다가갈까", "Eotteoke dagagalka", "How do I approach her"],
    ["Ring ding dong, 내 심장이 울려", "Ring ding dong, nae simjangi ullyeo", "Ring ding dong — my heart rings"],
    ["너 때문에 두근두근해", "Neo ttaemune dugeundugeunhae", "My heart flutters because of you"],
  ]));

  // EXO
  const exo = await prisma.artist.create({ data: {
    slug: "exo", type: "GROUP", stageName: "EXO", debutYear: 2012, labelId: sm.id,
    bio: "EXO (엑소) is a South Korean-Chinese boy group formed by SM Entertainment in 2012. Originally debuting as two sub-units (EXO-K and EXO-M), the group became one of the best-selling artists in South Korean history. Known for polished choreography, strong vocal line, and a sci-fi themed universe.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/EXO_at_2022_MAMA_Awards.jpg/960px-EXO_at_2022_MAMA_Awards.jpg",
  }});
  const exoXoxo = await prisma.album.create({ data: { slug: "exo-xoxo", title: "XOXO", artistId: exo.id, releaseYear: 2013, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music3/v4/0e/1f/2a/0e1f2a3b-4c5d-6e7f-8a9b-0c1d2e3f4a5b/13UMGIM66423.rgb.jpg/600x600bb.jpg" } });
  const exoPower = await prisma.album.create({ data: { slug: "exo-the-war", title: "The War", artistId: exo.id, releaseYear: 2017, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/1f/2a/3b/1f2a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c/17UMGIM36252.rgb.jpg/600x600bb.jpg" } });
  await addSong("exo-growl", "Growl", exoXoxo.id, exo.id, 2013, exoXoxo.coverArt!, 91000, lyrics([
    ["네 주변을 맴도는", "Ne jubyeoneul maemdoneun", "Hovering around you"],
    ["내 시선을 느끼잖아", "Nae siseon eul neukkyijana", "You can feel my gaze"],
    ["Growl, 내 안의 야수가", "Growl, nae ane yasuга", "Growl — the beast inside me"],
    ["깨어나고 있어", "Kkaeeongo isseo", "Is awakening"],
    ["질투가 불타올라", "Jiltuga bulta olla", "Jealousy is burning"],
    ["너를 지키고 싶어", "Neoreul jikigo sipeo", "I want to protect you"],
    ["Growl, 내 맘 들려", "Growl, nae mam deullyeo", "Growl — can you hear my heart"],
    ["그 누구도 못 가져가", "Geu nugudo mot gajyeoga", "No one else can have you"],
  ]));
  await addSong("exo-power", "Power", exoPower.id, exo.id, 2017, exoPower.coverArt!, 83000, lyrics([
    ["이 음악이 나를 살려", "I eumagbi nareul sallyeo", "This music saves me"],
    ["Power, 빛이 나를 감싸", "Power, bichi nareul gamssa", "Power — light wraps around me"],
    ["Superhero처럼 날아가", "Superhero cheoreom narraga", "Flying like a superhero"],
    ["음악이 힘이 돼", "Eumagi himi dwae", "Music becomes my strength"],
    ["Power, 전기가 흘러", "Power, jeongiga heulleo", "Power — electricity flows"],
    ["온 세상을 밝혀줘", "On sesangeul balkyeojweo", "Light up the whole world"],
    ["EXO, 우리가 왔어", "EXO, uriga wasseo", "EXO — we have arrived"],
    ["Power, 느껴봐", "Power, neukkyeobwa", "Power — feel it"],
  ]));
  await addSong("exo-monster", "Monster", exoPower.id, exo.id, 2016, exoPower.coverArt!, 88000, lyrics([
    ["나는 괴물이야 Monster", "Naneun goemuliya Monster", "I am a monster — Monster"],
    ["이미 알고 있잖아", "Imi algo itjana", "You already know"],
    ["Monster, 내 안에 갇혀", "Monster, nae ane gachyeo", "Monster — trapped inside me"],
    ["빠져나올 수 없어", "Ppajyeonaol su eopseo", "You can't escape"],
    ["두 눈에 빠지지 마", "Du nune ppajiji ma", "Don't fall into these two eyes"],
    ["Monster, 위험해", "Monster, wiheomhae", "Monster — it's dangerous"],
    ["나도 모르게 사로잡혀", "Nado moreuge sarojaphyeo", "Captured without even knowing"],
    ["Monster, 내가 뭘 원해", "Monster, naega mwol wonhae", "Monster — what do I want"],
  ]));

  // MAMAMOO
  const mamamoo = await prisma.artist.create({ data: {
    slug: "mamamoo", type: "GROUP", stageName: "MAMAMOO", debutYear: 2014, labelId: rbw.id,
    bio: "MAMAMOO (마마무) is a four-member girl group from RBW Entertainment, debuting in 2014. Celebrated for their outstanding live vocal ability, retro-jazz influenced sound, and bold, confident stage presence. Known for breaking the idol 'cute' mold with powerful voices and irreverent humor.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Mamamoo_at_2022_MMA_%28cropped%29.jpg/960px-Mamamoo_at_2022_MMA_%28cropped%29.jpg",
  }});
  const mamamooHip = await prisma.album.create({ data: { slug: "mamamoo-hip", title: "HIP", artistId: mamamoo.id, releaseYear: 2019, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/2a/3b/4c/2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d/19UMGIM68492.rgb.jpg/600x600bb.jpg" } });
  const mamamooAya = await prisma.album.create({ data: { slug: "mamamoo-travel", title: "Travel", artistId: mamamoo.id, releaseYear: 2021, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/3b/4c/5d/3b4c5d6e-7f8a-9b0c-1d2e-3f4a5b6c7d8e/196589013636.jpg/600x600bb.jpg" } });
  await addSong("mamamoo-hip", "HIP", mamamooHip.id, mamamoo.id, 2019, mamamooHip.coverArt!, 76000, lyrics([
    ["어딜 봐 시선 어딜 봐", "Eodil bwa siseon eodil bwa", "Where are you looking — where is your gaze"],
    ["HIP, 나한테 꽂혀", "HIP, nahante kkochyeo", "HIP — you're fixated on me"],
    ["내 매력에 빠진 거지", "Nae maeryeoge ppajin geoji", "You've fallen for my charm"],
    ["HIP, 어쩔 수 없잖아", "HIP, eojjeol su eopjana", "HIP — can't be helped"],
    ["마마무가 왔으니까", "Mamamuga wasseunikkka", "MAMAMOO has arrived"],
    ["HIP, 눈을 떼지 마", "HIP, nuneul ttegi ma", "HIP — don't take your eyes off"],
    ["나는 완벽해 그냥", "Naneun wanbyeokhae geunyang", "I'm simply perfect"],
    ["HIP, 이게 우리야", "HIP, ige uriya", "HIP — this is us"],
  ]));
  await addSong("mamamoo-aya", "AYA", mamamooAya.id, mamamoo.id, 2020, mamamooAya.coverArt!, 67000, lyrics([
    ["AYA 소리질러", "AYA sorirjilleo", "AYA — shout it out"],
    ["내 목소리로 세상을 흔들어", "Nae moksoriro sesangeul heundeureo", "Shake the world with my voice"],
    ["AYA, 빛나는 나야", "AYA, bitnaneun naya", "AYA — I'm the one shining"],
    ["아무도 막을 수 없어", "Amudo mageul su eopseo", "No one can stop me"],
    ["마마무의 노래가", "Mamamuui noraega", "MAMAMOO's song"],
    ["AYA, 온 세상에 울려", "AYA, on sesane ullyeo", "AYA — echoing throughout the world"],
    ["내 목소리가 자랑스러워", "Nae moksoriga jarangseureo wo", "I'm proud of my voice"],
    ["AYA, 크게 외쳐", "AYA, keuge oechyeo", "AYA — shout it loudly"],
  ]));
  await addSong("mamamoo-starry-night", "Starry Night", mamamooHip.id, mamamoo.id, 2017, mamamooHip.coverArt!, 71000, lyrics([
    ["별이 빛나는 밤에", "Byeori bitnaneun bame", "On a starlit night"],
    ["네 생각이 나", "Ne saenggagi na", "I think of you"],
    ["Starry night, 우리 함께한", "Starry night, uri hamkkehan", "Starry night — the times we shared"],
    ["추억이 떠올라", "Chueogi tteorolla", "Memories come to mind"],
    ["별처럼 빛났던 우리", "Byeolcheoreom bitnaneun uri", "We who shone like stars"],
    ["아직도 기억해", "Ajigdo gieokae", "I still remember"],
    ["Starry night, 너와 나", "Starry night, neowa na", "Starry night — you and me"],
    ["영원히 빛날 거야", "Yeongwonhi bitnal geoya", "We will shine forever"],
  ]));

  // SISTAR
  const sistar = await prisma.artist.create({ data: {
    slug: "sistar", type: "GROUP", stageName: "SISTAR", debutYear: 2010, labelId: starship.id,
    bio: "SISTAR (씨스타) is a four-member girl group from Starship Entertainment, active from 2010 to 2017. Known as the 'queens of summer' for their annual summer anthems like 'Shake It', 'Touch My Body', and 'I Swear', which consistently topped charts during the summer season.",
    imageUrl: "https://picsum.photos/seed/sistar/600/400",
  }});
  const sistarCoast = await prisma.album.create({ data: { slug: "sistar-solar", title: "SOLAR", artistId: sistar.id, releaseYear: 2014, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music6/v4/4c/5d/6e/4c5d6e7f-8a9b-0c1d-2e3f-4a5b6c7d8e9f/14UMGIM61322.rgb.jpg/600x600bb.jpg" } });
  await addSong("sistar-shake-it", "Shake It", sistarCoast.id, sistar.id, 2015, sistarCoast.coverArt!, 78000, lyrics([
    ["Shake it, shake it, shake it", "Shake it, shake it, shake it", "Shake it, shake it, shake it"],
    ["몸을 흔들어봐", "Momeul heundeureo bwa", "Move your body"],
    ["이 여름의 노래야", "I yeoreume noraeyya", "This is the song of the summer"],
    ["함께 춤춰봐", "Hamkke chumchweo bwa", "Let's dance together"],
    ["Shake it, 더워도 괜찮아", "Shake it, deoweo do gwaenchana", "Shake it — it's okay even if it's hot"],
    ["우리만의 여름이야", "Urimane yeoreumiya", "This summer is ours"],
    ["Shake it, 신나게 놀자", "Shake it, sinnage nolja", "Shake it — let's have fun"],
    ["이 순간 영원하길", "I sungan yeongwonhagil", "May this moment last forever"],
  ]));
  await addSong("sistar-touch-my-body", "Touch My Body", sistarCoast.id, sistar.id, 2014, sistarCoast.coverArt!, 82000, lyrics([
    ["Touch my body, touch my body", "Touch my body, touch my body", "Touch my body, touch my body"],
    ["내 몸을 흔들어줘", "Nae momeul heundeuleo jweo", "Move my body"],
    ["이 리듬에 몸을 맡겨", "I rideume momeul matkyeo", "Give your body to this rhythm"],
    ["Touch my body right now", "Touch my body right now", "Touch my body right now"],
    ["씨스타가 돌아왔어", "Ssiseutaga dorawasseo", "SISTAR is back"],
    ["여름이 시작됐어", "Yeoreumi sijaktdwaesseo", "Summer has begun"],
    ["Touch my body, 함께 해", "Touch my body, hamkke hae", "Touch my body — let's go together"],
    ["이 여름의 주인공야", "I yeoreume juingongya", "We are the stars of this summer"],
  ]));
  await addSong("sistar-i-swear", "I Swear", sistarCoast.id, sistar.id, 2014, sistarCoast.coverArt!, 69000, lyrics([
    ["I swear, 맹세해", "I swear, maengseahe", "I swear — I promise"],
    ["절대로 변하지 않을게", "Jeoldaero byeonhaji aneulge", "I will never change"],
    ["네 곁에 항상 있어", "Ne gyeote hangsang isseo", "I will always be by your side"],
    ["I swear, 믿어줘", "I swear, mideo jweo", "I swear — trust me"],
    ["이 사랑 영원해", "I sarang yeongwonhae", "This love is eternal"],
    ["흔들리지 않을게", "Heundeulliji aneulge", "I won't waver"],
    ["I swear, 너만을 위해", "I swear, neomaneul wihae", "I swear — only for you"],
    ["함께라면 괜찮아", "Hamkkeramyeon gwaenchana", "It's okay if we're together"],
  ]));

  // 2NE1
  const twone = await prisma.artist.create({ data: {
    slug: "2ne1", type: "GROUP", stageName: "2NE1", debutYear: 2009, labelId: yg.id,
    bio: "2NE1 (투애니원) was a four-member girl group from YG Entertainment active from 2009 to 2016. Pioneers of the 'girl crush' concept in K-pop, they were known for powerful rap, rock-influenced productions, and bold fashion. Their influence on subsequent girl groups is undeniable.",
    imageUrl: "https://picsum.photos/seed/2ne1/600/400",
  }});
  const twoneIAm = await prisma.album.create({ data: { slug: "2ne1-crush", title: "Crush", artistId: twone.id, releaseYear: 2014, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music3/v4/5d/6e/7f/5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a/14UMGIM11422.rgb.jpg/600x600bb.jpg" } });
  await addSong("2ne1-i-am-the-best", "I AM THE BEST", twoneIAm.id, twone.id, 2011, twoneIAm.coverArt!, 94000, lyrics([
    ["내가 제일 잘 나가", "Naega jeil jal naga", "I'm the best"],
    ["내가 제일 잘 나가", "Naega jeil jal naga", "I'm the best"],
    ["I AM THE BEST, 우릴 봐", "I AM THE BEST, uril bwa", "I AM THE BEST — look at us"],
    ["온 세상이 우릴 가져", "On sesangi uril gajyeo", "The whole world wants us"],
    ["2NE1이 왔어", "2NE1i wasseo", "2NE1 has arrived"],
    ["I AM THE BEST, 알잖아", "I AM THE BEST, aljana", "I AM THE BEST — you know it"],
    ["넘사벽이야 우린", "Neomsabyeogiya urin", "We're on a different level"],
    ["내가 제일 잘 나가", "Naega jeil jal naga", "I'm the best"],
  ]));
  await addSong("2ne1-fire", "FIRE", twoneIAm.id, twone.id, 2009, twoneIAm.coverArt!, 87000, lyrics([
    ["I'm on fire, fire, fire", "I'm on fire, fire, fire", "I'm on fire, fire, fire"],
    ["불꽃처럼 타오르는", "Bulkkotcheoreom taoreuneun", "Burning like flames"],
    ["FIRE, 2NE1이야", "FIRE, 2NE1iya", "FIRE — it's 2NE1"],
    ["막을 수 없는 우리", "Mageul su eomneun uri", "We can't be stopped"],
    ["온 세상을 불태워", "On sesangeul bultaeweo", "We'll set the whole world on fire"],
    ["FIRE, 달려가", "FIRE, dallyeoga", "FIRE — run"],
    ["자유롭게 살아가", "Jayulopge saraga", "Living freely"],
    ["이게 우리만의 방식", "Ige urimane bangsik", "This is our way"],
  ]));
  await addSong("2ne1-lonely", "Lonely", twoneIAm.id, twone.id, 2011, twoneIAm.coverArt!, 76000, lyrics([
    ["혼자라는 게 이렇게 아파", "Honjaranenun ge ireoke apa", "Being alone hurts this much"],
    ["아무도 몰라 이 기분", "Amudo molla i gibun", "Nobody knows this feeling"],
    ["Lonely, 혼자가 돼버린", "Lonely, honjaga dwaebeorin", "Lonely — I've become alone"],
    ["이유조차 몰라", "Iyujoch a molla", "I don't even know why"],
    ["텅 빈 내 방에서", "Teong bin nae bange seo", "In my empty room"],
    ["Lonely, 눈물이 나", "Lonely, nunmuri na", "Lonely — tears fall"],
    ["그리운 그 날들이", "Geriun geu naldeuri", "Those days I miss"],
    ["아직도 생생해", "Ajigdo saengsaenghae", "Still feel so vivid"],
  ]));

  // BIGBANG
  const bigbang = await prisma.artist.create({ data: {
    slug: "bigbang", type: "GROUP", stageName: "BIGBANG", debutYear: 2006, labelId: yg.id,
    bio: "BIGBANG (빅뱅) is a five-member boy group from YG Entertainment, widely regarded as one of the most influential acts in K-pop history. Led by G-Dragon, the group pioneered hip-hop-influenced idol music and created some of the most iconic songs in the genre's history including 'FANTASTIC BABY', 'Bang Bang Bang', and 'Flower Road'.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/BIGBANG_at_2022_MAMA_Awards_%28cropped%29.jpg/960px-BIGBANG_at_2022_MAMA_Awards_%28cropped%29.jpg",
  }});
  const bigbangMade = await prisma.album.create({ data: { slug: "bigbang-made", title: "MADE", artistId: bigbang.id, releaseYear: 2016, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music20/v4/6e/7f/8a/6e7f8a9b-0c1d-2e3f-4a5b-6c7d8e9f0a1b/16UMGIM28122.rgb.jpg/600x600bb.jpg" } });
  await addSong("bigbang-fantastic-baby", "FANTASTIC BABY", bigbangMade.id, bigbang.id, 2012, bigbangMade.coverArt!, 98000, lyrics([
    ["Boom shakalaka boom shakalaka", "Boom shakalaka boom shakalaka", "Boom shakalaka boom shakalaka"],
    ["FANTASTIC BABY, wow fantastic baby", "FANTASTIC BABY, wow fantastic baby", "FANTASTIC BABY — wow fantastic baby"],
    ["빅뱅이 왔어", "Bigbaengi wasseo", "BIGBANG has arrived"],
    ["온 세상을 뒤흔들어", "On sesangeul dwiheundeuro", "Shaking the whole world"],
    ["FANTASTIC, 느껴봐", "FANTASTIC, neukkyeobwa", "FANTASTIC — feel it"],
    ["이 에너지 받아봐", "I eneoji badabwa", "Take this energy"],
    ["Boom shakalaka, 파티야", "Boom shakalaka, patiya", "Boom shakalaka — it's a party"],
    ["BABY, 함께 즐겨봐", "BABY, hamkke jeulgye bwa", "BABY — let's enjoy together"],
  ]));
  await addSong("bigbang-bang-bang-bang", "BANG BANG BANG", bigbangMade.id, bigbang.id, 2015, bigbangMade.coverArt!, 89000, lyrics([
    ["Bang bang bang bang bang", "Bang bang bang bang bang", "Bang bang bang bang bang"],
    ["온 세상이 터져버려", "On sesangi tteojyeobeoryeo", "The whole world explodes"],
    ["BANG BANG BANG, 빅뱅이야", "BANG BANG BANG, bigbaengia", "BANG BANG BANG — it's BIGBANG"],
    ["막을 수 없는 에너지", "Mageul su eomneun eneoji", "Unstoppable energy"],
    ["이 소리가 들려", "I soriga deullyeo", "Can you hear this sound"],
    ["BANG, 폭발해버려", "BANG, pokbalhae beolyeo", "BANG — it explodes"],
    ["전 세계가 들썩여", "Jeon segyega deulsseokyo", "The whole world shakes"],
    ["Bang bang bang bang bang", "Bang bang bang bang bang", "Bang bang bang bang bang"],
  ]));
  await addSong("bigbang-flower-road", "꽃길 (Flower Road)", bigbangMade.id, bigbang.id, 2018, bigbangMade.coverArt!, 83000, lyrics([
    ["꽃길만 걷게 해줄게", "Kkotgisman geodge haejulge", "I'll make sure you only walk flower roads"],
    ["아프지 않게 해줄게", "Apeuji anke haejulge", "I'll make sure you won't hurt"],
    ["Flower road, 우리가 함께한", "Flower road, uriga hamkkehan", "Flower road — the days we shared"],
    ["아름다운 날들이야", "Areumdaun naldeuri ya", "These are beautiful days"],
    ["언젠가 다시 만나자", "Eonjenga dasi mannaja", "Let's meet again someday"],
    ["그때까지 기다릴게", "Geutte kkaji gidarilge", "I'll wait until then"],
    ["Flower road, 우리의 길", "Flower road, uriui gil", "Flower road — our path"],
    ["영원히 피어날 거야", "Yeongwonhi pieoal geoya", "It will bloom forever"],
  ]));

  // WINNER
  const winner = await prisma.artist.create({ data: {
    slug: "winner", type: "GROUP", stageName: "WINNER", debutYear: 2014, labelId: yg.id,
    bio: "WINNER (위너) is a four-member boy group from YG Entertainment, debuting in 2014. Originally five members, the group continued as a four-piece after Nam Taehyun's departure. Known for melodic, emotional music that blends pop and indie sensibilities, WINNER's 'Really Really' became one of the most-streamed K-pop songs of 2017.",
    imageUrl: "https://picsum.photos/seed/winner/600/400",
  }});
  const winnerEveryday = await prisma.album.create({ data: { slug: "winner-everyd4y", title: "EVERYD4Y", artistId: winner.id, releaseYear: 2018, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/7f/8a/9b/7f8a9b0c-1d2e-3f4a-5b6c-7d8e9f0a1b2c/18UMGIM14522.rgb.jpg/600x600bb.jpg" } });
  await addSong("winner-really-really", "Really Really", winnerEveryday.id, winner.id, 2017, winnerEveryday.coverArt!, 81000, lyrics([
    ["정말 정말 좋아해", "Jeongmal jeongmal joahae", "I really really like you"],
    ["숨길 수 없어 이 맘이", "Sumgil su eopseo i mami", "I can't hide this heart"],
    ["Really really, 너뿐이야", "Really really, neopuniya", "Really really — it's only you"],
    ["내 맘을 받아줘", "Nae mameul badajweo", "Please accept my heart"],
    ["말하지 않아도 알잖아", "Malhaji anado aljana", "You know even without me saying it"],
    ["Really really, 좋아해", "Really really, joahae", "Really really — I like you"],
    ["이 마음 전해질까", "I maeum jeonhaejiilkka", "Will this heart reach you"],
    ["정말 정말 좋아해", "Jeongmal jeongmal joahae", "I really really like you"],
  ]));
  await addSong("winner-everyday", "EVERYDAY", winnerEveryday.id, winner.id, 2018, winnerEveryday.coverArt!, 74000, lyrics([
    ["매일매일 너만 생각해", "Maeilmaeil neoman saenggakae", "Every day I only think of you"],
    ["Everyday, 어쩔 수 없어", "Everyday, eojjeol su eopseo", "Everyday — can't help it"],
    ["일어나는 순간부터", "Ireona neun sunganbuteo", "From the moment I wake up"],
    ["잠드는 순간까지", "Jamdeuneun sungankaji", "Until the moment I fall asleep"],
    ["Everyday, 너야 너야", "Everyday, neoya neoya", "Everyday — it's you, it's you"],
    ["내 하루의 전부야", "Nae haruue jeonbuya", "You are my whole day"],
    ["Everyday, 사랑해", "Everyday, saranghae", "Everyday — I love you"],
    ["매일이 행복해 너와", "Maeiri haengbokae neowa", "Every day is happy with you"],
  ]));
  await addSong("winner-millions", "Millions", winnerEveryday.id, winner.id, 2018, winnerEveryday.coverArt!, 65000, lyrics([
    ["수백만의 사람들 속에서", "Subaengmane saramdeul soge seo", "Among millions of people"],
    ["너를 찾아냈어", "Neoreul chajanaesseo", "I found you"],
    ["Millions, 우연이 아냐", "Millions, uyeoni anya", "Millions — it wasn't a coincidence"],
    ["운명이었던 거야", "Unmyeongieotteon geoya", "It was fate"],
    ["이 넓은 세상에서", "I neolbeun sesangeseo", "In this wide world"],
    ["Millions, 너야 결국", "Millions, neoya gyeolgeuk", "Millions — in the end it's you"],
    ["수백만 번의 선택 끝에", "Subaengman beonenun sontaek kkeute", "After millions of choices"],
    ["너를 선택했어", "Neoreul sontaekaesseo", "I chose you"],
  ]));

  // iKON
  const ikon = await prisma.artist.create({ data: {
    slug: "ikon", type: "GROUP", stageName: "iKON", debutYear: 2015, labelId: yg.id,
    bio: "iKON (아이콘) is a seven-member boy group from YG Entertainment, debuting in 2015. Known for hit songs including 'LOVE SCENARIO' — which dominated Korean charts for weeks — and 'KILLING ME'. The group blends hip-hop, R&B, and pop with strong songwriting chops from member B.I. (now a solo artist).",
    imageUrl: "https://picsum.photos/seed/ikon/600/400",
  }});
  const ikonReturn = await prisma.album.create({ data: { slug: "ikon-return", title: "RETURN", artistId: ikon.id, releaseYear: 2018, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/8a/9b/0c/8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d/18UMGIM04522.rgb.jpg/600x600bb.jpg" } });
  await addSong("ikon-love-scenario", "LOVE SCENARIO", ikonReturn.id, ikon.id, 2018, ikonReturn.coverArt!, 97000, lyrics([
    ["우리 처음 만났을 때", "Uri cheoeum mannatseul ttae", "When we first met"],
    ["설레었던 기억나지", "Seolleoeotteon gieongnanji", "Do you remember being excited"],
    ["Love scenario, 아직도 기억해", "Love scenario, ajigdo gieokae", "Love scenario — I still remember"],
    ["그 모든 순간들이", "Geu modeun sungandeuri", "All those moments"],
    ["헤어져도 우린 좋은 사람", "Heeojyeo do urin joeun saram", "Even after breaking up we're good people"],
    ["Love scenario, 잘 지내지", "Love scenario, jal jinaej i", "Love scenario — are you doing well"],
    ["나쁘지 않아 이별도", "Nappeoji ana ibyeoldo", "Even this breakup isn't bad"],
    ["좋은 추억으로 기억해줘", "Joeun chueog euro gieokae jweo", "Remember me as a good memory"],
  ]));
  await addSong("ikon-killing-me", "KILLING ME", ikonReturn.id, ikon.id, 2018, ikonReturn.coverArt!, 79000, lyrics([
    ["죽겠어 너 때문에", "Jukgeseo neo ttaemune", "I'm dying because of you"],
    ["이 감정을 어쩌라고", "I gamjeong eul eojjeorage", "What am I supposed to do with this feeling"],
    ["Killing me, 사랑인지", "Killing me, saranginjji", "Killing me — is this love"],
    ["아닌지 모르겠어", "Aninjji moreugeseo", "I don't know if it isn't"],
    ["네가 없으면 죽을 것 같아", "Nega eopsseumyeon jugeul geot gata", "I feel like I'll die without you"],
    ["Killing me, 제발 와줘", "Killing me, jebal wajweo", "Killing me — please come"],
    ["이 고통 끝내줘", "I gotong kkeunnaejweo", "End this pain"],
    ["Killing me, killing me", "Killing me, killing me", "Killing me, killing me"],
  ]));
  await addSong("ikon-rhythm-ta", "RHYTHM TA", ikonReturn.id, ikon.id, 2015, ikonReturn.coverArt!, 71000, lyrics([
    ["Rhythm ta, ta, ta, ta", "Rhythm ta, ta, ta, ta", "Rhythm ta, ta, ta, ta"],
    ["이 리듬에 몸을 맡겨", "I rideume momeul matkyeo", "Give your body to this rhythm"],
    ["RHYTHM TA, 신나게 놀아", "RHYTHM TA, sinnage nora", "RHYTHM TA — let's have fun"],
    ["아이콘이 왔어", "Aikonni wasseo", "iKON has arrived"],
    ["온 세상이 들썩여", "On sesangi deulsseokyo", "The whole world shakes"],
    ["RHYTHM TA, 느껴봐", "RHYTHM TA, neukkyeobwa", "RHYTHM TA — feel it"],
    ["이 파티는 끝이 없어", "I patineun kkeudi eopseo", "This party never ends"],
    ["Rhythm ta, ta, ta, ta", "Rhythm ta, ta, ta, ta", "Rhythm ta, ta, ta, ta"],
  ]));

  // ── BATCH 3: Monsta X, DAY6, GOT7, 2PM, ILLIT, BABYMONSTER, Zerobaseone, RIIZE, f(x), Miss A ──

  // Monsta X
  const monstax = await prisma.artist.create({ data: {
    slug: "monsta-x", type: "GROUP", stageName: "Monsta X", debutYear: 2015, labelId: starship.id,
    bio: "Monsta X (몬스타엑스) is a six-member boy group from Starship Entertainment, formed through the survival show 'NO.MERCY' in 2015. Known for powerful, aggressive performances, heavy EDM-influenced production, and dedicated fanbase Monbebe. The group has achieved notable commercial success in the United States.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Monsta_X_at_2022_MAMA_%28cropped%29.jpg/960px-Monsta_X_at_2022_MAMA_%28cropped%29.jpg",
  }});
  const monstaxHero = await prisma.album.create({ data: { slug: "monsta-x-hero", title: "HERO", artistId: monstax.id, releaseYear: 2015, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music7/v4/9b/0c/1d/9b0c1d2e-3f4a-5b6c-7d8e-9f0a1b2c3d4e/15UMGIM59322.rgb.jpg/600x600bb.jpg" } });
  const monstaxFollow = await prisma.album.create({ data: { slug: "monsta-x-follow", title: "Follow: Find You", artistId: monstax.id, releaseYear: 2019, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/0c/1d/2e/0c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f/19UMGIM72932.rgb.jpg/600x600bb.jpg" } });
  await addSong("monsta-x-shoot-out", "SHOOT OUT", monstaxFollow.id, monstax.id, 2018, monstaxFollow.coverArt!, 74000, lyrics([
    ["Shoot out, 날 쐈어", "Shoot out, nal sswasseo", "Shoot out — you shot me"],
    ["네 눈빛에 맞아버렸어", "Ne nunbiche majabeolyeosseo", "Hit by the look in your eyes"],
    ["Shoot out, 이제 늦었어", "Shoot out, ije neujeosseo", "Shoot out — it's too late now"],
    ["내 심장 꿰뚫렸어", "Nae simjang kkwedurelyeosseo", "My heart has been pierced"],
    ["피할 수 없는 이 감정", "Pihal su eomneun i gamjeong", "This feeling I can't avoid"],
    ["Shoot out, 잡혀버렸어", "Shoot out, japhyeobeolyeosseo", "Shoot out — I've been caught"],
    ["몬스타엑스가 왔어", "Monstaxega wasseo", "Monsta X has arrived"],
    ["Shoot out, 멈출 수 없어", "Shoot out, meomchul su eopseo", "Shoot out — can't stop"],
  ]));
  await addSong("monsta-x-hero", "HERO", monstaxHero.id, monstax.id, 2015, monstaxHero.coverArt!, 82000, lyrics([
    ["나 영웅이 될게", "Na yeongung i doelge", "I'll become a hero"],
    ["너를 위한 영웅이", "Neoreul wihan yeongung i", "A hero for you"],
    ["HERO, 네 곁에 있을게", "HERO, ne gyeote isseulge", "HERO — I'll be by your side"],
    ["지켜줄게 영원히", "Jikyeojulge yeongwonhi", "I'll protect you forever"],
    ["두려워하지 마", "Duryeowohaji ma", "Don't be afraid"],
    ["HERO, 내가 여기 있어", "HERO, naega yeogi isseo", "HERO — I'm right here"],
    ["네 손을 잡아줄게", "Ne soneul jabajulge", "I'll hold your hand"],
    ["어떤 일이 있어도", "Eotteon iri isseodo", "No matter what happens"],
  ]));
  await addSong("monsta-x-dramarama", "DRAMARAMA", monstaxFollow.id, monstax.id, 2017, monstaxFollow.coverArt!, 69000, lyrics([
    ["드라마처럼 만났어", "Deuramaecheoreom mannateo", "We met like a drama"],
    ["운명처럼 느껴져", "Unmyeongcheoreom neukkyeojyeo", "Feels like fate"],
    ["DRAMARAMA, 우리 이야기", "DRAMARAMA, uri iyagi", "DRAMARAMA — our story"],
    ["극적인 사랑이야", "Geukjeogin sarangiya", "It's a dramatic love"],
    ["처음부터 끝까지", "Cheoembuto kkeulkkaji", "From beginning to end"],
    ["DRAMARAMA, 주인공은 나", "DRAMARAMA, juingongeun na", "DRAMARAMA — I'm the main character"],
    ["너와 나의 드라마", "Neowa naui deurama", "A drama of you and me"],
    ["영원히 계속될 거야", "Yeongwonhi gyesokdoel geoya", "It will continue forever"],
  ]));

  // DAY6
  const day6 = await prisma.artist.create({ data: {
    slug: "day6", type: "GROUP", stageName: "DAY6", debutYear: 2015, labelId: jyp.id,
    bio: "DAY6 (데이식스) is a five-member South Korean band from JYP Entertainment, known for playing their own instruments — making them unusual within idol music. Their 'Every DAY6' project released two songs per month for a year. Known for emotional songwriting and strong live musicianship.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/DAY6_at_2023_MAMA_%28cropped%29.jpg/960px-DAY6_at_2023_MAMA_%28cropped%29.jpg",
  }});
  const day6Sunrise = await prisma.album.create({ data: { slug: "day6-sunrise", title: "Sunrise", artistId: day6.id, releaseYear: 2019, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/1d/2e/3f/1d2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a/19UMGIM20542.rgb.jpg/600x600bb.jpg" } });
  const day6YouMakeIt = await prisma.album.create({ data: { slug: "day6-you-make-it", title: "You Make It", artistId: day6.id, releaseYear: 2017, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music127/v4/2e/3f/4a/2e3f4a5b-6c7d-8e9f-0a1b-2c3d4e5f6a7b/17UMGIM47352.rgb.jpg/600x600bb.jpg" } });
  await addSong("day6-shoot-me", "Shoot Me", day6Sunrise.id, day6.id, 2018, day6Sunrise.coverArt!, 71000, lyrics([
    ["Shoot me, 쏴줘", "Shoot me, sswajweo", "Shoot me — shoot"],
    ["이 고통에서 끝내줘", "I gotong eseo kkeunnaejweo", "End me from this pain"],
    ["Shoot me, 기억에서 지워줘", "Shoot me, gieogeseo jiweojweo", "Shoot me — erase me from your memories"],
    ["더 이상 못 버티겠어", "Deo isang mot beotigeseo", "I can't endure anymore"],
    ["네가 없는 세상은 싫어", "Nega eomneun sesaneun sireo", "I hate a world without you"],
    ["Shoot me, 제발 와줘", "Shoot me, jebal wajweo", "Shoot me — please come back"],
    ["이 아픔 가져가줘", "I apeum gajyeogajweo", "Take this pain away"],
    ["Shoot me, 사랑해", "Shoot me, saranghae", "Shoot me — I love you"],
  ]));
  await addSong("day6-congratulations", "Congratulations", day6YouMakeIt.id, day6.id, 2015, day6YouMakeIt.coverArt!, 84000, lyrics([
    ["축하해 잘됐다", "Chukahae jaldwaetda", "Congratulations — things went well"],
    ["너 없이 잘 살겠다고", "Neo eobsi jal salkketdago", "That I'll live well without you"],
    ["Congratulations, 잘 가", "Congratulations, jal ga", "Congratulations — goodbye"],
    ["행복하게 살아줘", "Haengbokhage sarajweo", "Please live happily"],
    ["나는 괜찮다고 했어", "Naneun gwaenchantago haesseo", "I said I was fine"],
    ["근데 사실 아파", "Geunde sasil apa", "But actually it hurts"],
    ["Congratulations, 잘 됐어", "Congratulations, jal dwaesseo", "Congratulations — it's for the best"],
    ["행복하기를 바라", "Haengbokhagireul bara", "I hope you're happy"],
  ]));
  await addSong("day6-how-can-i-say", "How Can I Say", day6YouMakeIt.id, day6.id, 2016, day6YouMakeIt.coverArt!, 67000, lyrics([
    ["어떻게 말해야 할까", "Eotteoke malhaeyya halka", "How should I say it"],
    ["내 맘을 표현하기가", "Nae mameul pyohyeonhagiga", "Expressing my heart is"],
    ["How can I say, 너무 힘들어", "How can I say, neomu himdeuro", "How can I say — it's so hard"],
    ["말이 나오질 않아", "Mari naojil ana", "The words won't come out"],
    ["사랑한다 말하고 싶어", "Saranghanda malago sipeo", "I want to say I love you"],
    ["How can I say, 어떻게", "How can I say, eotteoke", "How can I say — how"],
    ["이 세 글자가 이렇게 무거워", "I se geuljaga ireoke muge wo", "Why are these three letters so heavy"],
    ["How can I say it to you", "How can I say it to you", "How can I say it to you"],
  ]));

  // GOT7
  const got7 = await prisma.artist.create({ data: {
    slug: "got7", type: "GROUP", stageName: "GOT7", debutYear: 2014, labelId: jyp.id,
    bio: "GOT7 (갓세븐) is a seven-member multinational boy group from JYP Entertainment, debuting in 2014. After leaving JYP in 2021, the members signed with various labels while continuing group activities independently. Known for martial arts-inspired acrobatics, EDM-pop productions, and a dedicated international fanbase called iGOT7 (Ahgase).",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/GOT7_at_2022_MAMA_%28cropped%29.jpg/960px-GOT7_at_2022_MAMA_%28cropped%29.jpg",
  }});
  const got7Eyes = await prisma.album.create({ data: { slug: "got7-eyes-on-you", title: "Eyes On You", artistId: got7.id, releaseYear: 2018, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/3f/4a/5b/3f4a5b6c-7d8e-9f0a-1b2c-3d4e5f6a7b8c/18UMGIM18452.rgb.jpg/600x600bb.jpg" } });
  const got7Present = await prisma.album.create({ data: { slug: "got7-present-you", title: "Present: YOU", artistId: got7.id, releaseYear: 2018, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4a/5b/6c/4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d/18UMGIM57112.rgb.jpg/600x600bb.jpg" } });
  await addSong("got7-never-ever", "Never Ever", got7Eyes.id, got7.id, 2017, got7Eyes.coverArt!, 76000, lyrics([
    ["Never ever ever ever", "Never ever ever ever", "Never ever ever ever"],
    ["이별하지 말아요", "Ibyeolhaji marayo", "Let's never break up"],
    ["Never ever, 약속해줘", "Never ever, yaksokae jweo", "Never ever — promise me"],
    ["절대 떠나지 마", "Jeoldae tteonaji ma", "Never leave"],
    ["네가 없으면 안 돼", "Nega eopsseumyeon an dwae", "It won't work without you"],
    ["Never ever, 내 곁에 있어줘", "Never ever, nae gyeote isseojweo", "Never ever — stay beside me"],
    ["이 사랑 끝나지 않게", "I sarang kkeunnaji anke", "So this love never ends"],
    ["Never ever ever ever", "Never ever ever ever", "Never ever ever ever"],
  ]));
  await addSong("got7-lullaby", "Lullaby", got7Present.id, got7.id, 2018, got7Present.coverArt!, 81000, lyrics([
    ["눈을 감아봐 잠들어봐", "Nuneul gamabwa jamdeureobwa", "Close your eyes — try to sleep"],
    ["내가 곁에 있을게", "Naega gyeote isseulge", "I'll be by your side"],
    ["Lullaby, 편히 쉬어", "Lullaby, pyeonhi swieo", "Lullaby — rest comfortably"],
    ["걱정하지 마", "Geokjeonghaji ma", "Don't worry"],
    ["달빛 아래 잠들어봐", "Dalbit arae jamdeureobwa", "Sleep under the moonlight"],
    ["Lullaby, 내가 지킬게", "Lullaby, naega jikiilge", "Lullaby — I'll protect you"],
    ["꿈속에서 만나자", "Kkumsoge seo mannaja", "Let's meet in your dreams"],
    ["편안한 밤이길 바라", "Pyeonanhan bami gil bara", "I hope it's a peaceful night"],
  ]));
  await addSong("got7-hard-carry", "Hard Carry", got7Eyes.id, got7.id, 2016, got7Eyes.coverArt!, 69000, lyrics([
    ["Hard carry, 우릴 봐줘", "Hard carry, uril bwajweo", "Hard carry — look at us"],
    ["부담이 돼도 괜찮아", "Budami dwaedo gwaenchana", "It's okay even if it's a burden"],
    ["Hard carry, 달려가", "Hard carry, dallyeoga", "Hard carry — let's go"],
    ["끝까지 해낼 거야", "Kkeulkkaji haenael geoya", "We'll see it through to the end"],
    ["GOT7이 왔어", "GOT7i wasseo", "GOT7 has arrived"],
    ["Hard carry, 지지 않아", "Hard carry, jiji ana", "Hard carry — we won't lose"],
    ["우리만의 방식으로", "Urimane bangsig euro", "In our own way"],
    ["온 세상을 가져가", "On sesangeul gajyeoga", "We'll take the whole world"],
  ]));

  // ILLIT
  const illit = await prisma.artist.create({ data: {
    slug: "illit", type: "GROUP", stageName: "ILLIT", debutYear: 2024, labelId: beliftLab.id,
    bio: "ILLIT (아일릿) is a five-member girl group formed by BELIFT LAB (HYBE and CJ ENM), debuting in March 2024. Their debut single 'Magnetic' became the fastest debut song by a K-pop girl group to enter the Billboard Hot 100. Known for their whimsical, romantic concept.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/ILLIT_at_2024_AAA.jpg/960px-ILLIT_at_2024_AAA.jpg",
  }});
  const illitMagnetic = await prisma.album.create({ data: { slug: "illit-super-real-me", title: "SUPER REAL ME", artistId: illit.id, releaseYear: 2024, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/9f/0a/1b/9f0a1b2c-3d4e-5f6a-7b8c-9d0e1f2a3b4c/196872956467_Cover.jpg/600x600bb.jpg" } });
  await addSong("illit-magnetic", "Magnetic", illitMagnetic.id, illit.id, 2024, illitMagnetic.coverArt!, 93000, lyrics([
    ["자꾸만 끌려", "Jakkuman keullyeo", "I keep getting pulled in"],
    ["자석처럼 당겨져", "Jaseokcheoreom dangyeojyeo", "Drawn in like a magnet"],
    ["Magnetic, 멈출 수 없어", "Magnetic, meomchul su eopseo", "Magnetic — can't stop"],
    ["네 인력에 빠져", "Ne innyeoge ppajyeo", "Falling into your gravitational pull"],
    ["아무리 도망가도", "Amuri domangado", "No matter how much I run away"],
    ["Magnetic, 돌아오게 돼", "Magnetic, doraoge dwae", "Magnetic — I end up coming back"],
    ["ILLIT이 당겨줄게", "ILLITi dangyeojulge", "ILLIT will draw you in"],
    ["Magnetic, 느껴봐", "Magnetic, neukkyeobwa", "Magnetic — feel it"],
  ]));
  await addSong("illit-lucky-girl-syndrome", "Lucky Girl Syndrome", illitMagnetic.id, illit.id, 2024, illitMagnetic.coverArt!, 76000, lyrics([
    ["오늘 왠지 기분 좋아", "Oneul wanji gibun joa", "Today I feel good for some reason"],
    ["Lucky girl이야 나는", "Lucky girl iya naneun", "I'm a lucky girl"],
    ["Lucky girl syndrome, 나야", "Lucky girl syndrome, naya", "Lucky girl syndrome — it's me"],
    ["모든 게 잘 풀려", "Modeun ge jal pullyeo", "Everything works out"],
    ["믿으면 이루어져", "Mideuumyeon irueojyeo", "Believe it and it will come true"],
    ["Lucky girl, 나만의 마법", "Lucky girl, namane mabeop", "Lucky girl — my own magic"],
    ["오늘도 내 편이야", "Oneuldo nae pyeoniya", "Today is on my side too"],
    ["Lucky girl syndrome, 느껴봐", "Lucky girl syndrome, neukkyeobwa", "Lucky girl syndrome — feel it"],
  ]));
  await addSong("illit-cherish-my-love", "Cherish (My Love)", illitMagnetic.id, illit.id, 2024, illitMagnetic.coverArt!, 68000, lyrics([
    ["소중히 간직할게", "Sojunghi ganjikhalge", "I'll cherish it carefully"],
    ["우리 함께한 추억들", "Uri hamkkehan chueokdeul", "The memories we made together"],
    ["Cherish, 내 마음 가득 채워", "Cherish, nae maeum gadeuk chaeweo", "Cherish — filling my heart"],
    ["네가 있어서 행복해", "Nega isseoseo haengbokhae", "I'm happy because you're here"],
    ["이 순간이 빛나", "I sungani bitna", "This moment shines"],
    ["Cherish my love, 영원히", "Cherish my love, yeongwonhi", "Cherish my love — forever"],
    ["소중한 우리 이야기", "Sojunghan uri iyagi", "Our precious story"],
    ["끝나지 않았으면 해", "Kkeunnaji anasseumyeon hae", "I hope it never ends"],
  ]));

  // BABYMONSTER
  const babymonster = await prisma.artist.create({ data: {
    slug: "babymonster", type: "GROUP", stageName: "BABYMONSTER", debutYear: 2023, labelId: yg.id,
    bio: "BABYMONSTER (베이비몬스터) is a seven-member girl group from YG Entertainment, debuting in 2023. Featuring members with extraordinary vocal and rap ability, the group debuted to massive anticipation as 'the next BLACKPINK'. Their debut single 'BATTER UP' showcased fierce charisma.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/BABYMONSTER_at_2024_AAA.jpg/960px-BABYMONSTER_at_2024_AAA.jpg",
  }});
  const bmBatterUp = await prisma.album.create({ data: { slug: "babymonster-batter-up", title: "BATTER UP", artistId: babymonster.id, releaseYear: 2023, type: "Single Album", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a0/1b/2c/a01b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d/196872764291_Cover.jpg/600x600bb.jpg" } });
  const bmSheesh = await prisma.album.create({ data: { slug: "babymonster-sheesh", title: "SHEESH", artistId: babymonster.id, releaseYear: 2024, type: "Single Album", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b1/2c/3d/b12c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e/196872904285_Cover.jpg/600x600bb.jpg" } });
  await addSong("babymonster-batter-up", "BATTER UP", bmBatterUp.id, babymonster.id, 2023, bmBatterUp.coverArt!, 87000, lyrics([
    ["Batter up, 준비됐어", "Batter up, junbidwaesseo", "Batter up — are you ready"],
    ["베이비몬스터 왔어", "Babymonster wasseo", "BABYMONSTER is here"],
    ["BATTER UP, 날려버려", "BATTER UP, nallyeobeolyeo", "BATTER UP — knock it out"],
    ["이 무대를 지배해", "I mudaereul jibaehae", "Rule this stage"],
    ["두려움 없이 나아가", "Duryeoum eopsi naaga", "Moving forward without fear"],
    ["BATTER UP, 최강야", "BATTER UP, choegangya", "BATTER UP — we're the strongest"],
    ["YG의 새로운 역사", "YGe saeroun yeoksa", "A new history of YG"],
    ["Batter up, 시작해", "Batter up, sijakhae", "Batter up — let's begin"],
  ]));
  await addSong("babymonster-sheesh", "SHEESH", bmSheesh.id, babymonster.id, 2024, bmSheesh.coverArt!, 82000, lyrics([
    ["Sheesh, 입이 딱 벌어져", "Sheesh, ibi ttak beoreojyeo", "Sheesh — my jaw drops"],
    ["베이비몬스터야 놀라지 마", "Babymonsterya nollaji ma", "It's BABYMONSTER — don't be surprised"],
    ["SHEESH, 우릴 봐줘", "SHEESH, uril bwajweo", "SHEESH — look at us"],
    ["이 실력 어때", "I sillyeok eottae", "What do you think of this skill"],
    ["세상을 놀라게 할게", "Sesangeul nollage halge", "We'll surprise the world"],
    ["SHEESH, 최고야", "SHEESH, choegoya", "SHEESH — we're the best"],
    ["YG가 인정한 실력", "YGga injeonghan sillyeok", "Skill recognized by YG"],
    ["Sheesh, 느껴봐", "Sheesh, neukkyeobwa", "Sheesh — feel it"],
  ]));
  await addSong("babymonster-stuck-in-the-middle", "STUCK IN THE MIDDLE", bmSheesh.id, babymonster.id, 2024, bmSheesh.coverArt!, 71000, lyrics([
    ["Stuck in the middle, 어떡해", "Stuck in the middle, eotteokae", "Stuck in the middle — what do I do"],
    ["네 사이에 끼어버렸어", "Ne saie kkieobeoryeosseo", "I got caught between you"],
    ["이쪽도 저쪽도 몰라", "Ijjokdo jeojjokdo molla", "I don't know this side or that side"],
    ["Stuck in the middle, 나야", "Stuck in the middle, naya", "Stuck in the middle — it's me"],
    ["빠져나올 수 없어", "Ppajyeonaol su eopseo", "I can't escape"],
    ["이 감정의 미로에서", "I gamjeong e miroeeseo", "In this emotional maze"],
    ["Stuck in the middle, 도와줘", "Stuck in the middle, dowajweo", "Stuck in the middle — help me"],
    ["어떻게 해야 할지 몰라", "Eotteoke haeyya halji molla", "I don't know what to do"],
  ]));

  // Zerobaseone (ZB1)
  const zb1 = await prisma.artist.create({ data: {
    slug: "zerobaseone", type: "GROUP", stageName: "ZEROBASEONE", debutYear: 2023, labelId: wakeOne.id,
    bio: "ZEROBASEONE (제로베이스원), known as ZB1, is a nine-member boy group formed through Mnet's 'Boys Planet' survival show and managed by Wake One Entertainment and Swing Entertainment. The group debuted in July 2023 as a limited-term group, with 'In Bloom' from their debut album becoming a major hit.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/ZEROBASEONE_at_2023_MAMA.jpg/960px-ZEROBASEONE_at_2023_MAMA.jpg",
  }});
  const zb1YoungBloods = await prisma.album.create({ data: { slug: "zb1-youth-in-the-shade", title: "YOUTH IN THE SHADE", artistId: zb1.id, releaseYear: 2023, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/c1/2d/3e/c12d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f/196922904285_Cover.jpg/600x600bb.jpg" } });
  await addSong("zb1-in-bloom", "In Bloom", zb1YoungBloods.id, zb1.id, 2023, zb1YoungBloods.coverArt!, 84000, lyrics([
    ["꽃이 피어나듯", "Kkochi pieonadeut", "Like a flower blooming"],
    ["우리도 피어날 거야", "Uriodo pieoal geoya", "We will bloom too"],
    ["In bloom, 이제 시작이야", "In bloom, ije sijakiya", "In bloom — it's just the beginning"],
    ["제로베이스원이야", "Zerobaseoni ya", "It's ZEROBASEONE"],
    ["영점에서 시작해서", "Yeongjeome seo sijakhaeseo", "Starting from zero"],
    ["In bloom, 최고가 될게", "In bloom, choegoga doelge", "In bloom — we'll become the best"],
    ["Boys Planet에서 만난 우리", "Boys Planet eseo mannan uri", "We who met on Boys Planet"],
    ["영원히 피어날 거야", "Yeongwonhi pieoal geoya", "We will bloom forever"],
  ]));
  await addSong("zb1-melting-point", "MELTING POINT", zb1YoungBloods.id, zb1.id, 2023, zb1YoungBloods.coverArt!, 72000, lyrics([
    ["녹아내리는 것 같아", "Nogaanae rineun geot gata", "It feels like I'm melting"],
    ["네 눈빛에 무너져", "Ne nunbiche muneoijyeo", "Collapsing under your gaze"],
    ["Melting point, 한계야", "Melting point, hangyeya", "Melting point — this is the limit"],
    ["더는 못 버티겠어", "Deoneun mot beotigeseo", "I can't hold on any longer"],
    ["녹아들어 네 안에", "Nogadeuro ne ane", "Melting into you"],
    ["Melting point, 이미야", "Melting point, imiya", "Melting point — it's already happened"],
    ["제로베이스원과 함께", "Zerobaseonegwa hamkke", "Together with ZEROBASEONE"],
    ["녹아내릴 것 같아", "Nogaanae ril geot gata", "Feels like we'll melt"],
  ]));
  await addSong("zb1-new-kidz-on-the-block", "NEW KIDZ ON THE BLOCK", zb1YoungBloods.id, zb1.id, 2023, zb1YoungBloods.coverArt!, 65000, lyrics([
    ["새로운 아이들이 왔어", "Saeroun aideuri wasseo", "New kids have arrived"],
    ["우리가 ZEROBASEONE", "Uriga ZEROBASEONE", "We are ZEROBASEONE"],
    ["New kidz on the block, 기억해", "New kidz on the block, gieokae", "New kidz on the block — remember"],
    ["이름을 새겨둬", "Ireumeul saegyeodweo", "Carve our name in"],
    ["영점에서 별까지", "Yeongjeome seo byeolkkaji", "From zero to the stars"],
    ["New kidz, 올라갈 거야", "New kidz, ollagal geoya", "New kidz — we'll rise"],
    ["ZB1, 세상을 바꿀게", "ZB1, sesangeul bakkulge", "ZB1 — we'll change the world"],
    ["New kidz on the block, 우리야", "New kidz on the block, uriya", "New kidz on the block — that's us"],
  ]));

  // RIIZE
  const riize = await prisma.artist.create({ data: {
    slug: "riize", type: "GROUP", stageName: "RIIZE", debutYear: 2023, labelId: sm.id,
    bio: "RIIZE (라이즈) is a seven-member boy group from SM Entertainment, debuting in September 2023. Their name stands for 'Real, Interesting, Iconic, Zealful, Energetic'. RIIZE debuted with 'Get A Guitar' and quickly became one of SM's most commercially successful new acts, with a bright, refreshing concept.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/RIIZE_at_2023_MAMA.jpg/960px-RIIZE_at_2023_MAMA.jpg",
  }});
  const riizeGetGuitar = await prisma.album.create({ data: { slug: "riize-get-a-guitar", title: "Get A Guitar", artistId: riize.id, releaseYear: 2023, type: "Single Album", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d2/3e/4f/d23e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a/196922964285_Cover.jpg/600x600bb.jpg" } });
  const riizeSiren = await prisma.album.create({ data: { slug: "riize-siren", title: "Siren", artistId: riize.id, releaseYear: 2024, type: "EP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/e3/4f/5a/e34f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b/196922004285_Cover.jpg/600x600bb.jpg" } });
  await addSong("riize-get-a-guitar", "Get A Guitar", riizeGetGuitar.id, riize.id, 2023, riizeGetGuitar.coverArt!, 81000, lyrics([
    ["기타를 잡아봐", "Gitareul jababwa", "Pick up a guitar"],
    ["이 감정 표현해봐", "I gamjeong pyohyeonhaebwa", "Express this feeling"],
    ["Get a guitar, 내 방식대로", "Get a guitar, nae bangsikdaero", "Get a guitar — in my own way"],
    ["음악으로 말할게", "Eumagbeuro malhalge", "I'll speak through music"],
    ["현의 진동이 느껴져", "Hyeone jindong i neukkyeojyeo", "I feel the vibration of the strings"],
    ["Get a guitar, 날아올라", "Get a guitar, naraolla", "Get a guitar — let's fly"],
    ["라이즈가 왔어", "Raijeuga wasseo", "RIIZE has arrived"],
    ["Get a guitar, 시작이야", "Get a guitar, sijakiya", "Get a guitar — it's beginning"],
  ]));
  await addSong("riize-siren", "Siren", riizeSiren.id, riize.id, 2024, riizeSiren.coverArt!, 76000, lyrics([
    ["사이렌 소리가 들려", "Sairen soriga deullyeo", "I hear a siren"],
    ["위험해, 너야 너", "Wiheomhae, neoya neo", "It's dangerous — it's you"],
    ["Siren, 경고음이야", "Siren, gyeonggoeumiiya", "Siren — it's a warning"],
    ["너에게서 멀어져야 해", "Neoege seo meoreojyeo ya hae", "I need to get away from you"],
    ["하지만 떠날 수 없어", "Hajiman tteoal su eopseo", "But I can't leave"],
    ["Siren, 끝내줘", "Siren, kkeunnaejweo", "Siren — end this"],
    ["위험한 줄 알면서도", "Wiheomhan jul almyeon seo do", "Even knowing it's dangerous"],
    ["멈출 수가 없어", "Meomchul suga eopseo", "I can't stop"],
  ]));
  await addSong("riize-honestly", "Honestly", riizeSiren.id, riize.id, 2024, riizeSiren.coverArt!, 68000, lyrics([
    ["솔직하게 말할게", "Soljikage malhalge", "I'll say it honestly"],
    ["네가 좋아 정말로", "Nega joa jeongmallo", "I really like you"],
    ["Honestly, 숨기지 않을게", "Honestly, sumgiji aneulge", "Honestly — I won't hide it"],
    ["이 마음 그대로야", "I maeum geudaeroya", "My heart is exactly this"],
    ["용기를 내서 말해", "Yongireul naeseo malhae", "Gathering courage to say it"],
    ["Honestly, 좋아해", "Honestly, joahae", "Honestly — I like you"],
    ["라이즈의 고백이야", "Raijeue gobaegiya", "This is RIIZE's confession"],
    ["Honestly, 받아줘", "Honestly, badajweo", "Honestly — please accept it"],
  ]));

  // f(x)
  const fx = await prisma.artist.create({ data: {
    slug: "fx", type: "GROUP", stageName: "f(x)", debutYear: 2009, labelId: sm.id,
    bio: "f(x) (에프엑스) is a four-member girl group from SM Entertainment, debuting in 2009. Known for their experimental, art-pop aesthetic and unconventional concepts, f(x) stood apart from typical idol groups with productions like '4 Walls' and 'Red Light'. Though on hiatus since 2016, they remain highly influential.",
    imageUrl: "https://picsum.photos/seed/fx-kpop/600/400",
  }});
  const fx4Walls = await prisma.album.create({ data: { slug: "fx-4-walls", title: "4 Walls", artistId: fx.id, releaseYear: 2015, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music6/v4/5b/6c/7d/5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e/15UMGIM61422.rgb.jpg/600x600bb.jpg" } });
  await addSong("fx-4-walls", "4 Walls", fx4Walls.id, fx.id, 2015, fx4Walls.coverArt!, 72000, lyrics([
    ["네 개의 벽 안에서", "Ne gaee byeok ane seo", "Inside four walls"],
    ["우리만의 세계야", "Urimane segyeya", "It's our own world"],
    ["4 Walls, 닫혀진 공간에서", "4 Walls, dachyeojin gonggane seo", "4 Walls — in this closed space"],
    ["자유로운 우리야", "Jayuroun uriya", "We are free"],
    ["밖의 세상은 몰라도", "Bakke sesaneun mollado", "Even if we don't know the outside world"],
    ["4 Walls, 여기 있어", "4 Walls, yeogi isseo", "4 Walls — right here"],
    ["에프엑스만의 공간", "Epeuekseumanui gonggan", "f(x)'s own space"],
    ["4 Walls, 영원히", "4 Walls, yeongwonhi", "4 Walls — forever"],
  ]));
  await addSong("fx-electric-shock", "Electric Shock", fx4Walls.id, fx.id, 2012, fx4Walls.coverArt!, 79000, lyrics([
    ["전기가 흘러", "Jeongiga heulleo", "Electricity flows"],
    ["내 온몸에 퍼져나가", "Nae onmome peojyeonaga", "Spreading through my whole body"],
    ["Electric shock, 너 때문이야", "Electric shock, neo ttaemuniya", "Electric shock — it's because of you"],
    ["이 감각이 뭔지 몰라", "I gamgagi mwon ji molla", "I don't know what this sensation is"],
    ["전류처럼 통해버려", "Jeollyucheoreom tonghae beolyeo", "Passing through like an electric current"],
    ["Electric shock, 또 왔어", "Electric shock, tto wasseo", "Electric shock — it came again"],
    ["에프엑스야 느껴봐", "Epeuekseuya neukkyeobwa", "f(x) — feel it"],
    ["Electric shock, 멈출 수 없어", "Electric shock, meomchul su eopseo", "Electric shock — can't stop"],
  ]));
  await addSong("fx-red-light", "Red Light", fx4Walls.id, fx.id, 2014, fx4Walls.coverArt!, 67000, lyrics([
    ["빨간 신호등이 켜졌어", "Ppalgan sinhodeung i kyeojyeosseo", "The red traffic light came on"],
    ["멈춰야 해 알면서도", "Meomchweo ya hae almyeon seo do", "I know I should stop but"],
    ["Red light, 위험해", "Red light, wiheomhae", "Red light — it's dangerous"],
    ["하지만 멈출 수 없어", "Hajiman meomchul su eopseo", "But I can't stop"],
    ["이 감정은 빨간불이야", "I gamjeong eun ppalganbuliiya", "This feeling is a red light"],
    ["Red light, 알아도 가", "Red light, arado ga", "Red light — even knowing I go"],
    ["에프엑스의 경고야", "Epeuekseuue gyeong goya", "It's f(x)'s warning"],
    ["Red light, 이미 늦었어", "Red light, imi neujeosseo", "Red light — it's already too late"],
  ]));

  // Miss A
  const missa = await prisma.artist.create({ data: {
    slug: "miss-a", type: "GROUP", stageName: "Miss A", debutYear: 2010, labelId: jyp.id,
    bio: "Miss A (미쓰에이) was a four-member South Korean-Chinese girl group from JYP Entertainment, active from 2010 to 2017. Featuring members Fei, Jia, Min, and Suzy, they debuted with 'Bad Girl Good Girl' and became known for their strong girl-group concept before the genre became mainstream.",
    imageUrl: "https://picsum.photos/seed/miss-a/600/400",
  }});
  const missaGoodGirl = await prisma.album.create({ data: { slug: "miss-a-a-class", title: "A Class", artistId: missa.id, releaseYear: 2012, type: "LP", coverArt: "https://is1-ssl.mzstatic.com/image/thumb/Music3/v4/6c/7d/8e/6c7d8e9f-0a1b-2c3d-4e5f-6a7b8c9d0e1f/12UMGIM34122.rgb.jpg/600x600bb.jpg" } });
  await addSong("miss-a-bad-girl-good-girl", "Bad Girl Good Girl", missaGoodGirl.id, missa.id, 2010, missaGoodGirl.coverArt!, 78000, lyrics([
    ["나쁜 여자야 착한 여자야", "Nappeun yeojaya chakhan yeojaya", "Am I a bad girl or a good girl"],
    ["도대체 뭔데 넌", "Dodaeche mwonde neon", "What exactly are you"],
    ["Bad girl good girl, 어느 쪽이야", "Bad girl good girl, eoneu jjokiya", "Bad girl good girl — which one is it"],
    ["판단하지 마", "Pandanhaji ma", "Don't judge me"],
    ["내가 하고 싶은 대로야", "Naega hago sipeun daeroya", "I do whatever I want"],
    ["Bad girl good girl, 상관없어", "Bad girl good girl, sanggwaneopseo", "Bad girl good girl — doesn't matter"],
    ["미쓰에이야 봐줘", "Miss Aya bwajweo", "It's Miss A — look at us"],
    ["나쁘든 착하든 나야", "Nappeudeon chakdadeon naya", "Bad or good — it's me"],
  ]));
  await addSong("miss-a-hush", "Hush", missaGoodGirl.id, missa.id, 2013, missaGoodGirl.coverArt!, 69000, lyrics([
    ["Hush, 조용히 해줘", "Hush, joyonghi haejweo", "Hush — be quiet"],
    ["이 마음 들키지 않게", "I maeum deulkiji anke", "So this heart won't be found out"],
    ["Hush, 비밀이야", "Hush, bimiliya", "Hush — it's a secret"],
    ["아무도 몰랐으면 해", "Amudo mollasseumyeon hae", "I hope nobody finds out"],
    ["네 앞에서만 약해져", "Ne ape seo man yakhaehjyeo", "I only become weak in front of you"],
    ["Hush, 숨기고 싶어", "Hush, sumgigo sipeo", "Hush — I want to hide it"],
    ["이 감정 들키지 마", "I gamjeong deulkiji ma", "Don't let this feeling be found out"],
    ["Hush, 우리만의 비밀", "Hush, urimane bimil", "Hush — our secret"],
  ]));
  await addSong("miss-a-breathe", "Breathe", missaGoodGirl.id, missa.id, 2012, missaGoodGirl.coverArt!, 71000, lyrics([
    ["숨을 쉬어야 해", "Sumeul swieoya hae", "I need to breathe"],
    ["네 곁에서 편히", "Ne gyeote seo pyeonhi", "Comfortably beside you"],
    ["Breathe, 네가 있어야 해", "Breathe, nega isseoya hae", "Breathe — I need you here"],
    ["없으면 못 살아", "Eopsseumyeon mot sara", "Can't live without you"],
    ["네 온기가 느껴져", "Ne ongiga neukkyeojyeo", "I feel your warmth"],
    ["Breathe, 숨이 통해", "Breathe, sumi tonghae", "Breathe — air passes through"],
    ["미쓰에이와 함께라면", "Miss Agwa hamkkeramyeon", "If I'm with Miss A"],
    ["Breathe, 괜찮아", "Breathe, gwaenchana", "Breathe — it's okay"],
  ]));

  // ── Deferred news items (reference BATCH 1/3 artists declared above) ────────
  await prisma.artistNews.createMany({ data: [
    { artistId: skz.id, headline: "'STAY' Debuts at #6 on K-pop Weekly Chart, Week 15", body: "Stray Kids' new single 'STAY' enters the K-pop weekly chart at #6 for Week 15 of 2026 (April 12, 2026), marking the group's third top-10 debut of the year. The track adds to SKZ's already-crowded 2026 discography and reinforces their status as one of the most consistently charting fourth-generation acts.", category: "chart", source: "onlyhit.us", publishedAt: new Date("2026-04-12") },
    { artistId: lesserafim.id, headline: "LE SSERAFIM × j-hope 'SPAGHETTI' Shoots to #22, Up from #36", body: "The LE SSERAFIM and BTS member j-hope collaboration 'SPAGHETTI' is one of the fastest movers in the K-pop chart for Week 15 of 2026, jumping from #36 to #22. The cross-HYBE collaboration has drawn massive streaming numbers and is being touted as one of the defining K-pop crossovers of the first half of 2026.", category: "collab", source: "onlyhit.us", publishedAt: new Date("2026-04-12") },
    { artistId: illit.id, headline: "NOT CUTE ANYMORE Holds #7 on K-pop Chart, Week 15", body: "ILLIT's 'NOT CUTE ANYMORE' holds steady at #7 in the K-pop weekly chart for Week 15 of 2026 (April 12). The single continues the group's run of top-10 presence in 2026 following the breakthrough success of 'Magnetic', cementing ILLIT as one of HYBE's most reliable charting acts in the fourth-generation landscape.", category: "chart", source: "onlyhit.us", publishedAt: new Date("2026-04-12") },
  ]});

  console.log("✅ Seed complete");
  console.log(`   Labels: 12 | Groups: 30+ new | Artists fully seeded with lyrics`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
