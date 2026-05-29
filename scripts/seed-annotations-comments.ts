/**
 * Seed high-quality annotations and contributor comments.
 *
 * Annotations: grounded in song backstory research (Sewol Ferry, Jungian psychology,
 * geomungo history, K-pop industry context, etc.)
 *
 * Comments: 30 contributors each reflecting their assigned artist sentiments
 * (BTS ARIRANG comeback, BLACKPINK DEADLINE/Met Gala, NewJeans lawsuit,
 * KiiiKiii debut momentum, etc.)
 *
 * Usage:
 *   DATABASE_URL="..." DIRECT_URL="..." \
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-annotations-comments.ts
 */
import { prisma } from "../lib/prisma";

// ─── helpers ─────────────────────────────────────────────────────────────────

async function getSongId(slug: string): Promise<string | null> {
  const s = await prisma.song.findUnique({ where: { slug }, select: { id: true } });
  return s?.id ?? null;
}

async function getArtistId(slug: string): Promise<string | null> {
  const a = await prisma.artist.findUnique({ where: { slug }, select: { id: true } });
  return a?.id ?? null;
}

async function getUserId(email: string): Promise<string | null> {
  const u = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return u?.id ?? null;
}

// ─── ANNOTATION DEFINITIONS ───────────────────────────────────────────────────
// Each entry: { song, lineIndex, word, note, userEmail }

const ANNOTATIONS = [

  // ─── BTS · 봄날 (Spring Day) ──────────────────────────────────────────────
  {
    song: "bts-spring-day", lineIndex: 0, word: "I miss you",
    userEmail: "sofiaRM_cdmx@aegyo.fan",
    note: `The opening phrase "I miss you" (보고 싶다) collapses several registers of longing at once. On its surface it's romantic—a person absent across seasons. But within Korean fan culture, 봄날 carries a second, grief-laden reading: many listeners interpret it as an oblique memorial to the 304 victims of the April 16, 2014 Sewol Ferry tragedy, in which 250 high school students drowned while crew abandoned ship under the watch of a government that delayed rescue. RM has publicly acknowledged multiple valid interpretations without confirming or denying. The music video makes the subtext visible: yellow ribbons (the Sewol remembrance symbol, worn by solidarity movements for years), a mountain of unclaimed clothing evoking recovered belongings, and a motel sign reading "OMELAS" — a direct nod to Ursula K. Le Guin's story "The Ones Who Walk Away from Omelas," a critique of societies that sacrifice youth for collective comfort. To open with "I miss you" is to invite the listener to bring their own grief. BTS's genius here is refusal to specify. The missing person could be a lover, a friend — or 304 strangers whose deaths the government hoped the country would forget.`,
  },
  {
    song: "bts-spring-day", lineIndex: 5, word: "too cruel",
    userEmail: "armyparis_camille@aegyo.fan",
    note: `"This time is too cruel" (이 시간이 너무 잔인해) uses winter — and specifically the suspension between winter and spring — as a Korean literary motif for grief that refuses to pass. In classical Korean poetry (시조, sijo), seasons carry emotional weight that moves beyond metaphor into cultural code: winter is not simply cold but the state of paralysis that precedes transformation. The cruelty isn't the season itself but its refusal to end — the way grief stretches time. This line arrives without percussion, stripped to voice and piano, creating a sonic embodiment of the wait. The word 잔인하다 (cruel) is stronger in Korean than its English translation suggests — it carries connotations of ruthlessness, even violence — making "too cruel" feel like an accusation against time itself. In the context of the Sewol reading, it's an accusation leveled at a system that let 250 students drown while officials failed to act. Fans in Korean and Spanish fan communities have annotated this line as the emotional center of the song — the moment where hope for spring becomes almost unbearable precisely because it keeps being delayed.`,
  },
  {
    song: "bts-spring-day", lineIndex: 2, word: "look at your photos",
    userEmail: "rmsbookclub_priya@aegyo.fan",
    note: `The act of looking at photographs as a mode of missing someone encodes a specifically Korean cultural relationship with visual memory. In Korean funeral and memorial culture, photographs of the deceased are prominently displayed — not tucked away but kept in full view as a form of active remembrance. The line "even when I look at your photos" makes the absent person paradoxically more absent: the image confirms absence rather than providing comfort. This tension is central to how 봄날 understands grief — not as something that heals with time but as something photographs perpetuate. In the Sewol memorial context, photographs of the 250 students became iconic in Korean public life: posted on walls, carried in protests, reproduced in newspapers. The families refused to let the images — and their grief — disappear. RM writing about photos within a song widely interpreted as Sewol memorial gives "look at your photos" a public dimension: this could be the bereaved nation, looking at the yearbook photos of children the government called "overdue dead."`,
  },

  // ─── BTS · Dynamite ──────────────────────────────────────────────────────
  {
    song: "bts-dynamite", lineIndex: 0, word: "complicated world",
    userEmail: "jimincdmx_lupita@aegyo.fan",
    note: `"Sometimes in this complicated world / I just wanna play" opens BTS's first fully English-language single with a deceptive simplicity. Released August 21, 2020 — six months into global COVID lockdowns and two months before the Billboard Hot 100 chart reported their #1 debut — the phrase "complicated world" lands differently than it would in a pre-pandemic context. RM later confirmed: "Dynamite wouldn't be here without coronavirus." The decision to write in English was strategic: with touring cancelled and physical fan interaction impossible, reaching new audiences digitally required lowering the language barrier. But "complicated world" is also honest about why escapism is necessary — not pretending the world is simple but acknowledging its weight before choosing, temporarily, to set it down. The disco-funk production (inspired by 1970s Chic, Earth Wind & Fire) grounds the escapism in eras of collective joy: people also danced through Vietnam, through Nixon. That lineage makes the escapism political. Not ignoring suffering but choosing to be alive within it.`,
  },
  {
    song: "bts-dynamite", lineIndex: 3, word: "Life is dynamite",
    userEmail: "bangtanparis_theo@aegyo.fan",
    note: `The claim "life is dynamite" performs an interesting semantic reversal. Dynamite is an explosive — dangerous, unstable, capable of destruction. In the pandemic context, BTS repurposes this explosive quality as the source of energy rather than terror: the same volatility that destroys can propel, illuminate, burst through walls. This is a specifically disco-era rhetorical move: finding ecstatic energy inside constraint. Released as the Hot 100's first #1 by an all-South Korean act (September 5, 2020), the song's title word also carries the K-pop slang meaning of "dynamite" as something extraordinary — "that performance was dynamite" in Korean fan speech means overwhelming, spectacular. The layered meaning (literal explosive + slang for brilliance) makes the line function as both pandemic coping and artistic declaration. During the 63rd Grammy Awards campaign, journalists writing about the song's first K-pop Grammy nomination for Best Pop Duo/Group Performance focused precisely on this quality: the ability to make joy feel like an act of resistance.`,
  },

  // ─── BTS · Life Goes On ──────────────────────────────────────────────────
  {
    song: "bts-life-goes-on", lineIndex: 0, word: "the world stopped",
    userEmail: "valeriabangtanmx@aegyo.fan",
    note: `"One day the world stopped / Without any warning" is the defining lyric of the pandemic era in K-pop. Released November 20, 2020 as the opening track of BE — the album BTS created while living through COVID-19 together in Seoul, with concerts cancelled and the world literally halted — the line does something unusual in pop music: it names the rupture without metaphor. No elaborate conceits, no romantic substitutions. The world stopped. Big Hit described BE as "a letter of hope...imparting a message of healing by declaring that even in the face of this new normality, our life goes on." The music video shows BTS members in isolation — gaming, reading, watching empty arenas on monitors, imagining performances for crowds that cannot be there. "The world stopped" is the album's wound, and the title phrase its bandage. In Mexico City fan communities, where concert culture (fan cafés, streaming parties, group viewings) was particularly shut down during the pandemic, this line became something of a sacred text: evidence that BTS was experiencing the same loss.`,
  },
  {
    song: "bts-life-goes-on", lineIndex: 2, word: "Life goes on",
    userEmail: "nycarmy_jasmine@aegyo.fan",
    note: `"Life goes on" as refrain operates simultaneously as resignation and affirmation — a contradiction that distinguishes it from toxic positivity anthems of the same era. It does not say "everything will be fine." It says existence continues regardless. In Korean, the phrase connects to the concept of 살아가다 — "to live forward," a verb that implies ongoing motion rather than arrival at a better place. The BE album was unusual in K-pop's commercial landscape for refusing uplift: tracks like Blue & Grey (depression), Fly to My Room (claustrophobia), Telepathy (longing for concerts) and this one formed a cohesive emotional document of lockdown psychology. "Life goes on" as title track carries the album's philosophical weight: grief is permitted, stasis is real, and yet — the comma implied between "Life goes on" and the next verse — we keep going anyway. Many ARMY point to this as their most-reached-for BTS song during personal crisis, precisely because it doesn't demand recovery.`,
  },

  // ─── BTS · ON ────────────────────────────────────────────────────────────
  {
    song: "bts-on", lineIndex: 0, word: "I've decided to go this way",
    userEmail: "sugacdmx_yolanda@aegyo.fan",
    note: `The opening "I've decided to go this way" plants ON firmly in Carl Jung's framework of individuation — the lifelong process of integrating conscious and unconscious, persona (the social mask) and shadow (the suppressed self). Map of the Soul: 7, the album containing ON, is BTS's most explicitly Jungian work, drawing on Murray Stein's "Jung's Map of the Soul" (1998) as conceptual architecture. "Going this way" refers to the path of conscious choice in becoming fully oneself — not the persona others expect (the cheerful idol, the global superstar) nor the unchecked shadow (fear, rage, exhaustion) but the integrated whole. The song's propulsive drum-heavy production — which RM described as representing BTS "carrying something heavy forward" — reinforces the decision's weight. This isn't easy resolution but hard-chosen direction. Released February 21, 2020, weeks before the pandemic would cancel the accompanying world tour, ON arrived at a moment when BTS's "decision" to go forward would be tested in ways they couldn't anticipate.`,
  },
  {
    song: "bts-on", lineIndex: 3, word: "Burn me up completely",
    userEmail: "jhopeharlem_marcus@aegyo.fan",
    note: `"Burn me up completely" reaches into a tradition of self-dissolution in Korean artistic expression — the concept of 소진 (sojin), a complete burning-out or expenditure of self as prerequisite for renewal. In the Map of the Soul framework, this phrase connects to the Jungian shadow's necessary integration: you cannot become whole without confronting and consuming what you've suppressed. The line appears in the chorus as an imperative — not a request for destruction but an invitation to the fire. The percussion that drives ON — layered Korean traditional drums (모듬북, modum-buk) beneath contemporary production — amplifies the ritualistic quality: this is not stadium rock but ceremony. Sia's collaboration on the Western remix of ON added crossover reach, but the original Korean version's insistence on traditional drum arrangements preserved the cultural specificity of the invitation. To be burned up completely is, in this register, to stop holding back the self you've been protecting from the world.`,
  },

  // ─── BTS · Blue & Grey ───────────────────────────────────────────────────
  {
    song: "bts-blue-grey", lineIndex: 0, word: "Alone in brilliant light",
    userEmail: "rmsbookclub_priya@aegyo.fan",
    note: `"Alone in brilliant light" captures the central paradox of K-pop idol existence: the individual inside the spectacle, isolated by the very brightness designed to connect. V (Kim Taehyung) wrote Blue & Grey after hearing RM describe his world as "seeming grey." The song's title maps two distinct psychological states — blue as the color of active sadness, grey as the color of numbness and affective flattening. Both are depression's registers: the ache of feeling too much and the terror of feeling nothing. "Brilliant light" in K-pop is stadium lights, broadcast lighting, the choreographed glow of light sticks in synchronized arenas. Being alone within it — not alone backstage but alone inside the experience of being seen by millions — describes celebrity dissociation. The cognitive dissonance between the spectacle's warmth and the performer's internal emptiness is a recurring BTS theme, but Blue & Grey makes it explicit rather than metaphorical. Released November 20, 2020, on BE, it became a touchstone for fans processing the pandemic's particular loneliness: surrounded by screens and yet alone.`,
  },
  {
    song: "bts-blue-grey", lineIndex: 3, word: "Blue & grey",
    userEmail: "sofiaRM_cdmx@aegyo.fan",
    note: `V's use of specific color names to name psychological states draws on both Western color psychology and Korean literary tradition. Blue (파랑/파란색) in Korean culture carries the Western associations of melancholy but also codes for "young" and "raw" — 파릇파릇하다 means fresh and green-blue, suggesting youth's particular sorrows. Grey (회색) in Korean appears in the idiomatic 회색지대 (grey area) — moral ambiguity, neither black nor white — and in the economic term 회색 코뿔소 (grey rhino), which refers to obvious, probable dangers that are nonetheless ignored until they arrive. V's choice of grey over black is deliberate: this isn't dramatic despair but the more dangerous flatness of burnout — the rhino approaching that everyone can see but nobody addresses. The song's warm acoustic guitar directly contradicts the lyrical darkness in a deliberate production choice: the music holds the listener even while the words describe inability to feel held. Blue & Grey thus functions as both diagnosis and therapy — naming the state, then providing sonic comfort for it.`,
  },

  // ─── BTS · Boy With Luv ──────────────────────────────────────────────────
  {
    song: "bts-boy-with-luv", lineIndex: 0, word: "what's so complicated",
    userEmail: "valeriabangtanmx@aegyo.fan",
    note: `The opening of Boy With Luv performs a philosophical simplification: "Ah, what's so complicated / Try thinking about it simply." In the Love Yourself series context — which ran through albums Her, Tear, and Answer — this marks a culminating shift from the grandiose (loving a distant ideal) to the intimate (loving the person in front of you through small attentions). The Korean title 작은 것들을 위한 시 (A Poem for Small Things) clarifies what the English title keeps implicit: this is not a love song about overwhelming passion but a poem about ordinary noticing. RM stated that Boy With Luv is "like a fan letter from BTS to ARMY" — which repositions the song from romance to gratitude. The "complicated" the narrator is asking us to set aside is not life's difficulty but the ideology of grand romance: the K-drama narrative, the star-crossed lovers, the dramatic confession. In its place: asking what you ate, noticing your laugh, wondering where you are right now. This reorientation from spectacle to attention is the Love Yourself series' deepest lesson.`,
  },
  {
    song: "bts-boy-with-luv", lineIndex: 4, word: "such small things",
    userEmail: "jungkookarmy_ana@aegyo.fan",
    note: `"I cry and laugh over such small things / That's me — so what?" is Boy With Luv's most vulnerable confession: a seven-member K-pop group that performed at the UN General Assembly, that has sold out stadiums on every continent, admitting that their emotional life is governed by tiny, ordinary experiences. "So what?" performs defiance — not seeking validation for this smallness but claiming it as sufficient. The Korean literary tradition of writing small things is long: the sijo form, classical Korean poetry, frequently finds its subject in the mundane (geese crossing the sky, a fire burning in cold weather) rather than the epic. 작은 것들 (small things) is not a new concept in Korean aesthetics but its application to K-pop — with all of K-pop's maximalism — is specifically BTS's innovation. In the context of ARMY relationship, the "small things" are the specific intimacies of fandom: the V-LIVE streams at 3am, the handwritten notes, the birthday tweets. Halsey's presence on the track adds a Western pop voice to this Korean aesthetics of the small.`,
  },

  // ─── BTS · Run BTS ───────────────────────────────────────────────────────
  {
    song: "bts-run-bts", lineIndex: 0, word: "Run BTS",
    userEmail: "armyparis_camille@aegyo.fan",
    note: `"Run BTS" as a title deploys the English verb "run" across at least four simultaneous meanings that Korean fans have catalogued extensively. Run as locomotion: keep moving, don't stop. Run as in run the show: lead, command, manage. Run as in a run of performances: a consecutive series. Run as an imperative directed at the group itself: this is a self-command. The PROOF anthology album context (released June 10, 2022, three days before BTS's 9th debut anniversary) adds historical weight — the album documented nine years of running, the verb now both retrospective and prospective. In June 2022, BTS simultaneously announced they would focus on solo projects, which positioned "Run" as a transition song: the group keeps running but now in multiple directions simultaneously. The ARMY fandom parsed this carefully — Korean fans particularly tuned to the ambiguity of the verb's direction. Does BTS run toward ARMY? Toward their solo futures? Toward the next chapter? Run BTS refuses to specify, which is precisely its wisdom: the running matters more than the destination.`,
  },
  {
    song: "bts-run-bts", lineIndex: 4, word: "Running again after 9 years",
    userEmail: "sugacdmx_yolanda@aegyo.fan",
    note: `"Running again after 9 years" (9년 만에 다시 달리다) is the PROOF album's most direct temporal marker — and in Korean, the phrasing 만에 (after/in the span of) carries a particular weight of waited time, not just elapsed time. It's the difference between "9 years later" and "after 9 whole years." The number 9 resonates in Korean cultural numerology: 구 (nine) sounds similar to 구 (久, eternal/long-lasting) in Chinese character traditions that Korean culture absorbed. Nine years is also the period most K-pop groups never survive — the industry's "7-year curse" (idol contracts typically last 7 years) means most groups dissolve or fracture before their 9th year. BTS reaching 9 years together is itself a defiance of industry norms. "Running again" implies a pause — the two years of pandemic-curtailed touring, the personal burnout V named in Blue & Grey and RM named in interviews — and a resumption that is conscious, not automatic. This is running as choice.`,
  },

  // ─── BTS · On the Street ─────────────────────────────────────────────────
  {
    song: "jhope-on-the-street", lineIndex: 0, word: "Standing on the street",
    userEmail: "jhopeharlem_marcus@aegyo.fan",
    note: `"Standing on the street" opens J-Hope's pre-military farewell with a return to origins: before BTS, before Hybe, before the choreographed stadium performances, there was a teenage boy dancing on streets in Gwangju, South Korea. J-Hope's B-boy background — popping and locking in competitions before he was cast by Big Hit Entertainment — is the biographical foundation the song builds on. "Street" in Korean hip-hop culture carries the same authenticity weight as in American hip-hop: real, unmediated, outside the system. For J-Hope to stand on the street the day before military service is to claim that whatever the industry made of him, the street self persists. Released March 3, 2023, days before his enlistment announcement, the song fulfilled a literal dream: J-Hope had referenced J. Cole in BTS lyrics since "Hip Hop Lover" in 2014, citing Cole's "Friday Night Lights" (2010) and "Cole World" (2011) as foundational. The collaboration is a passing of the torch — hip-hop's generational lineage made audible.`,
  },
  {
    song: "jhope-on-the-street", lineIndex: 3, word: "The path we walk together",
    userEmail: "epikhighnyc_deshawn@aegyo.fan",
    note: `"The path we walk together" (우리가 함께 걷는 길) uses the Korean word 우리 (we/our/together) that appears throughout BTS's catalog as a structural feature rather than a simple pronoun. 우리 in Korean is used where English uses "my" in many contexts — 우리 엄마 (our mother, meaning my mother), 우리 집 (our home). It implies a collective identity even when speaking of individual relationships. In J-Hope's context — the farewell song — "together" is suspended in irony: he's about to go on a path ARMY cannot follow, into military service where correspondence is limited and public activity is paused. The "path together" is thus simultaneously past (everything they've built together) and future promise (everything he'll return to). J. Cole's presence alongside J-Hope on this specific sentiment is notable: Cole is known for songs about loyalty to his Fayetteville, North Carolina community even through fame. Two rappers from different continents, different languages, singing about the path walked together with those who stayed.`,
  },

  // ─── BLACKPINK · DDU-DU DDU-DU ───────────────────────────────────────────
  {
    song: "blackpink-ddu-du-ddu-du", lineIndex: 0, word: "DDU-DU DDU-DU",
    userEmail: "blackpinkmx_carolina@aegyo.fan",
    note: `The onomatopoeia "DDU-DU DDU-DU" renders a gunshot sound in Korean — 뚜두뚜두 — placing BLACKPINK's power anthem within a tradition of female pop songs that weaponize sound itself. The title is not a word but a percussion, an assault on silence. Released June 15, 2018, DDU-DU DDU-DU marked BLACKPINK's aggressive response to industry skepticism about girl group longevity: they had been given limited release schedules under YG Entertainment, creating frustration within the fandom. The song answers critics not with argument but with volume. Producer Teddy Park's choice of gunshot onomatopoeia was deliberate: in Korean internet slang, describing something as 총을 쏘다 (shooting a gun) means making a devastating, unanswerable statement. The music video's visual of Lisa holding a katana inscribed with "BLACKPINK" literalizes this: talent itself as weapon. The phones-as-guns imagery added a 2018-specific media critique: social media fame as assault, paparazzi as shooters. DDU-DU DDU-DU is BLACKPINK announcing that they have arrived armed.`,
  },
  {
    song: "blackpink-ddu-du-ddu-du", lineIndex: 4, word: "biggest girl group",
    userEmail: "pinkvenom_ny_zoe@aegyo.fan",
    note: `"We're the biggest girl group, yeah" is a declaration that operates differently in K-pop's competitive landscape than it would in Western pop. Korean idol industry discourse has historically framed girl groups in opposition to one another — the "girl group wars" of each generation pit TWICE vs. BLACKPINK vs. Red Velvet in fan debates about chart positions, physical album sales, and digital streams. For BLACKPINK to claim "biggest" explicitly, without modesty or qualification, broke the unspoken rule of idol graciousness. In Korean culture, 자랑하다 (to boast) is generally frowned upon — humility is a social value. The English switch at "yeah" amplifies this: in Korean, the claim would require more cultural negotiation; in English it's simply stated. This code-switching is BLACKPINK's signature move throughout DDU-DU DDU-DU — the Korean sections establish the cultural context while English declarations make the boldest claims. By the time of their 2026 Met Gala reunion and DEADLINE EP's Spotify record (16.9M first-day streams — biggest female album debut in 2026), the claim had become fact.`,
  },

  // ─── BLACKPINK · Kill This Love ──────────────────────────────────────────
  {
    song: "blackpink-kill-this-love", lineIndex: 0, word: "kill this love",
    userEmail: "lisamexico_daniela@aegyo.fan",
    note: `The Korean verb 죽이다 (to kill) anchors Kill This Love in productive ambiguity: in standard usage it means to take a life, but in Korean slang, "죽이는" means extraordinary, devastating in quality — "that performance was 죽이는" means it was stunning. When Jennie sings 이 사랑을 죽여 (kill this love), the double reading is available: terminate this love AND make this love devastating/unforgettable. Producer Teddy Park — who has shaped BLACKPINK's sonic identity since debut and whose 2026 Grammy win for production on "Golden" confirmed his status as K-pop's most decorated producer — built this ambiguity into the song structure: the military percussion, the orchestral strings, the dramatic MV imagery all pull toward termination and grandeur simultaneously. Jennie later explained in a radio interview that the song addresses killing toxic love "that hurts us, makes us vulnerable" — framing this not as giving up on love but as an act of self-preservation. Kill this love to find yourself within it.`,
  },
  {
    song: "blackpink-kill-this-love", lineIndex: 4, word: "it's BLACKPINK",
    userEmail: "jennienyc_mia@aegyo.fan",
    note: `BLACKPINK's repeated self-naming across their discography ("DDU-DU DDU-DU — it's BLACKPINK", "Kill This Love — it's BLACKPINK") functions as what Korean media critics call 자기 브랜드화 (self-brandification): the group name itself becomes lyrical content, a claim of identity that fans interpret as both commercial strategy and authentic declaration. In K-pop's legal landscape — where artists operate under exclusive management contracts and their brand is technically co-owned by the label — artist self-naming represents a reclamation of identity within constraint. With the 2026 context of BLACKPINK's individual successes (Rosé's Brit Award, Jennie's Hot 100 top 10, Lisa's FIFA performance, Jisoo's Met Gala debut), "it's BLACKPINK" carries additional weight: these are four women who proved themselves individually, choosing to return and reassert the collective name. The group name as lyrical signature was never just branding — it was always also insistence.`,
  },

  // ─── BLACKPINK · Pink Venom ──────────────────────────────────────────────
  {
    song: "blackpink-pink-venom", lineIndex: 0, word: "Let my venom spread",
    userEmail: "soyeonfan_maxime@aegyo.fan",
    note: `Pink Venom opens with the geomungo (거문고) — a traditional Korean plucked zither originating in the Goguryeo kingdom (37 BCE–668 CE), pre-dating the unified Korean state. The instrument appears in the first four seconds before any vocal or contemporary production element, grounding the song in Korean historical identity before BLACKPINK's contemporary swagger enters. This was a deliberate decision: the geomungo was traditionally associated with Confucian scholarly self-cultivation, played by yangban (aristocratic) men as a form of character refinement. For four young women to open a global pop song with this instrument — and then follow it with "let my venom spread" — performs a specific cultural inversion: the scholar's instrument of refinement becomes a weapon of assertion. Jisoo can be seen playing the geomungo in the music video, adding biographical authenticity (she studied the instrument). In Korean fan discourse, this moment is frequently cited as BLACKPINK's most culturally precise choice — not nostalgia but active mobilization of heritage as contemporary power.`,
  },
  {
    song: "blackpink-pink-venom", lineIndex: 3, word: "flowers bloom",
    userEmail: "roseparis_sophie@aegyo.fan",
    note: `"Flowers bloom with every step" (발걸음마다 꽃이 피어) creates an image of beauty as byproduct of presence — not as decoration applied to the self but as spontaneous generation from movement. In Korean folk aesthetics, the image of 꽃이 피다 (flowers blooming) is pervasive in spring poetry and pansori narratives as a sign of regenerative power. For BLACKPINK to claim that their own footsteps generate flowers is to position them as forces of natural transformation, not performers of manufactured glamour. The "venom" + "flowers" pairing throughout Pink Venom mirrors the group's name: pink (floral, delicate, feminine) + black (venomous, powerful, dangerous). United, neither the flower nor the venom is more important. Rosé's Brit Award win in 2026 — first K-pop soloist to win at the Brit Awards — is a real-world counterpart to this lyrical claim: she literally walked into a British institution and made it bloom.`,
  },

  // ─── BLACKPINK · Lovesick Girls ──────────────────────────────────────────
  {
    song: "blackpink-lovesick-girls", lineIndex: 2, word: "lovesick girls",
    userEmail: "blackpinkmx_carolina@aegyo.fan",
    note: `The compound "lovesick" as a medical-adjacent metaphor pathologizes romantic feeling in ways that resonate with how Korean culture has long understood love's destructive potential. The Korean word 사랑병 (love-illness) appears in traditional songs (민요, minyo) and pansori narratives where love is categorized alongside other ailments of the heart. Jennie's line "No doctor could help when I'm lovesick" — the music video's original nurse imagery (later edited under protest from the Korean Health and Medical Workers' Union) — literalized this pathology in a way that brought the metaphor into contested cultural territory. YG removed the nurse scenes October 7, 2020, six days after release, responding to union criticism that the sexualized costume perpetuated medical workplace stereotypes. This controversy — rarely mentioned in Western fan coverage — is essential context: the song's metaphor of love as illness was taken seriously enough by Korean healthcare workers to demand revision. "Lovesick girls" is not just pop imagery but a claim about love's actual power to incapacitate.`,
  },

  // ─── BLACKPINK · How You Like That ───────────────────────────────────────
  {
    song: "blackpink-how-you-like-that", lineIndex: 5, word: "Walk walk walk this way",
    userEmail: "pinkvenom_ny_zoe@aegyo.fan",
    note: `"Walk walk walk this way" performs what rhetorical theorists call "deixis of power" — directing movement, claiming space, asserting that others will follow rather than lead. Released June 26, 2020, after BLACKPINK's longest hiatus since debut (one year, two months), the song functions as a comeback anthem that doesn't explain the absence but renders it irrelevant. YG Entertainment framed it as: "In whatever dark times or situations we encounter, we want everyone to have the strength and confidence to be able to rise up again." The "walk this way" imperative — borrowed from Aerosmith's title but deployed here as female directional authority — asks the listener to follow BLACKPINK out of whatever darkness they're in. The pandemic timing amplified this: "walk this way" toward what, exactly, when the world was in lockdown? Perhaps toward the screen, the stream, the parasocial companionship of K-pop. The instruction to walk became a metaphor for continuing to move even when nowhere specific is available to go.`,
  },

  // ─── BLACKPINK · Ice Cream ───────────────────────────────────────────────
  {
    song: "blackpink-selena-gomez-ice-cream", lineIndex: 0, word: "Sweet like ice cream",
    userEmail: "lisamexico_daniela@aegyo.fan",
    note: `Ice Cream's extended dessert metaphor deploys food as a proxy for desire in ways that Korean pop culture has long practiced. In K-pop promotional language, idols are frequently described in food terms — 떡볶이 style (spicy and fiery), 청량함 (refreshingly cool), 달콤해 (sweet) — connecting physical attractiveness to sensory pleasure that's simultaneously innocent and intimate. BLACKPINK and Selena Gomez's choice to extend the metaphor across an entire song takes this casual food comparison and elevates it to artistic conceit. "Sweet like ice cream" opens with the key word sweet — 달콤한 in Korean, which carries connotations of both gustatory sweetness and romantic tenderness. The ice cream metaphor works doubly: cold on the outside (aloof, inaccessible, "cool") but sweet once contact is made (warm, vulnerable, yielding). It's also, as the song implies, seasonal and temporary — ice cream melts. Desire in this frame is not permanent possession but a moment of shared pleasure that transforms and disappears. The Cardi B collaboration brought this framing to a global mainstream audience while keeping it "rated PG" — Cardi adjusted her typically explicit style to fit the concept.`,
  },

  // ─── BLACKPINK · Bet You Wanna ───────────────────────────────────────────
  {
    song: "blackpink-cardi-b-bet-you-wanna", lineIndex: 0, word: "Shall we make a bet",
    userEmail: "roseparis_sophie@aegyo.fan",
    note: `"Shall we make a bet" frames desire as a wager — a financial transaction where confidence is the currency. The betting frame transforms the traditional K-pop love song dynamic: instead of the narrator longing for someone who may or may not reciprocate, here the narrator is so certain of their own desirability that they're offering odds. This is a specifically Western financial metaphor placed into a K-pop context, and the framing works because BLACKPINK's brand has always been about calculated confidence rather than vulnerability. The "bet" structure also introduces a game theory element — the person being addressed can choose not to bet, which would mean conceding the narrator's point. Heads they win, tails the listener loses. Cardi B's contribution to the track added genuine credibility to the betting frame: Cardi's public persona is built on precisely this kind of confident, almost taunt-like assertion of desirability. The collaboration is two female artists with similar core postures — self-assured, unbothered by judgment — working in different musical traditions to articulate the same claim.`,
  },

  // ─── NewJeans · Ditto ────────────────────────────────────────────────────
  {
    song: "newjeans-ditto", lineIndex: 3, word: "Ditto",
    userEmail: "newjeansparis_florian@aegyo.fan",
    note: `"Ditto" as a single-word lyric performs something unusual in pop music: it refuses to say "I love you" by saying everything that phrase implies without the phrase itself. In Japanese (and via Japanese loan word to Korean internet culture), "ditto" (ディット) connotes exact replication — the same, identical, mirroring. As a response to unspoken feeling, it means: whatever you just felt, I feel exactly that. The song's VHS aesthetic — both "Side A" and "Side B" music video versions shot on camcorder format — creates temporal doubling: seeing the past in the present, the memory persisting in low-fi quality. Released December 19, 2022, as a pre-release from the "OMG" album, Ditto became NewJeans' first top 10 entry on the Billboard Global 200 (#8) and topped South Korea's Circle Digital Chart for 13 consecutive weeks. In the context of the HYBE/ADOR controversy (2024-2026) that has since overshadowed NewJeans' catalog, Ditto's theme of mutual understanding without explicit words carries ironic weight: the group that created lyrics about wordless recognition is now trapped in a legal dispute where words — contracts, motions, allegations — have destroyed whatever silent understanding existed.`,
  },
  {
    song: "newjeans-ditto", lineIndex: 5, word: "You reflecting like a mirror",
    userEmail: "epikhighnyc_deshawn@aegyo.fan",
    note: `The mirror metaphor in "You reflecting like a mirror" captures the Lacanian dimension of romantic projection that Ditto's VHS aesthetic reinforces. The mirror stage (Lacan) is the moment a child first recognizes their image in a mirror — not their actual self but a representation of their self, slightly out of sync with the experiencing body. To see a loved one as reflecting yourself is to acknowledge that love may be as much about self-recognition as about knowing the other. The VHS format amplifies this: home video creates representations that are already degraded copies, warm with nostalgia but not accurate. The "sixth friend" figure in the music video — unnamed, arm-casted, somehow both present and invisible in the group — represents the self who loves without being integrated into the image. The mirror that reflects isn't showing the narrator truly, just as the VHS recording doesn't show the past accurately. Ditto's emotional power comes from its honesty about this: it's okay to love imperfectly reflected things.`,
  },

  // ─── NewJeans · Super Shy ────────────────────────────────────────────────
  {
    song: "newjeans-super-shy", lineIndex: 2, word: "Super shy",
    userEmail: "kiiikibrooklyn_sam@aegyo.fan",
    note: `"Super shy" as a title paradox — shy is defined by not saying things, but "super shy" insists loudly on its own shyness — captures something specific about K-pop's relationship to aegyo (애교), the performance of cuteness and endearment. Traditional aegyo in K-pop idol culture involves performative smallness: speaking in high voices, making cutesy gestures, enacting vulnerability as a method of endearing oneself to audiences. "Super shy" occupies similar territory but with a 2023-era irony: the very declaration of shyness is an act of confidence. You can't be truly shy and title your song "Super Shy." The Jersey Club and breakbeat production underneath the vocal — urban, energetic, rhythmically complex — creates the same contradiction sonically. This is not shy music. It's music about shyness as an identity someone claims while clearly having already overcome whatever social terror it describes. The Lisbon flash mob music video — shot for the Y2K nostalgia aesthetic that became NewJeans' signature under ADOR's Min Hee-jin — embeds this paradox spatially: shy feelings, public declaration.`,
  },

  // ─── NewJeans · Attention ────────────────────────────────────────────────
  {
    song: "newjeans-attention", lineIndex: 2, word: "Attention",
    userEmail: "indiecitykpop_lily@aegyo.fan",
    note: `"Attention" as the title of NewJeans' surprise debut single (released July 22, 2022, without prior announcement or lineup reveal) performs a rare alignment between a song's meaning and its release strategy. The demand for attention — grammatically direct, in the imperative, with no please or qualifier — mirrors how the song entered the world: without traditional K-pop promotional buildup, without showcase, without pre-release content. You were given no preparation; suddenly, there was NewJeans. ADOR CEO Min Hee-jin's decision to debut this way was a deliberate rejection of K-pop's maximalist promotional machinery: no countdown content, no concept photos, no teaser videos. The song itself makes the same argument: "Please look only at me" is the request, but the Y2K aesthetic — butterfly clips, arcade machines, arm warmers, retro filters — says it without demanding. You look because it's beautiful, not because it was marketed to you. After Min's 2024 dismissal and the subsequent lawsuits, this debut strategy reads differently: radical clarity about what she wanted to create, before institutional pressures overwhelmed the vision.`,
  },

  // ─── NewJeans · Hype Boy ─────────────────────────────────────────────────
  {
    song: "newjeans-hype-boy", lineIndex: 5, word: "Hype boy",
    userEmail: "k2nyc_alexia@aegyo.fan",
    note: `"Hype boy" as romantic ideal transplants hip-hop infrastructure into pop romanticism. In hip-hop, the hype man (originating with Flavor Flav for Public Enemy) is the performer who amplifies the MC — creating energy, filling silence, elevating the main act. To call a romantic interest your "hype boy" is to describe a relationship built on mutual amplification: someone who makes you more, not less, yourself. This is a specifically 2020s K-pop reimagining: traditional K-pop love songs narrate longing, possession, and devotion; Hype Boy describes a relationship as collaborative performance. The song's four music videos (released across different platforms, each featuring different member groupings and relationships) embodied this collaborative quality structurally: no single correct narrative, no hierarchy of interpretation. Each viewer's hype boy is different. The pool party setting — Korean summer leisure culture encoded as romantic backdrop — grounds the hip-hop borrowing in Korean everyday life. The "hype boy" is not an abstract ideal but someone at a pool party in Seoul, making you feel seen.`,
  },

  // ─── NewJeans · Hurt ─────────────────────────────────────────────────────
  {
    song: "newjeans-hurt", lineIndex: 0, word: "It hurts",
    userEmail: "jinfanparis_marie@aegyo.fan",
    note: `"It hurts" opens NewJeans' most vulnerable debut track with a directness that's rare in K-pop idol debut albums. Standard K-pop debut strategy emphasizes energy, confidence, and aspirational imagery — showing the group at their most capable. NewJeans' decision to include Hurt on their debut EP "New Jeans" (released August 1, 2022) was characteristic of Min Hee-jin's ADOR era: aesthetic choices that prioritize emotional truth over commercial calculation. "It hurts because of you" (너 때문에 아파) is Korean in emotional logic even when sung in English — the construction 때문에 (because of / on account of) assigns cause without accusation, which is a specifically Korean interpersonal register: acknowledging someone's role in your pain without escalating to blame. The song's groovy R&B production sits in productive contradiction with the lyrical content: your body responds to the rhythm while the narrator describes emotional damage. This gap — the dissociation between physical feeling and psychological state — is precisely what the song describes. Hurt is rarely streamed but deeply loved in ARMY and fan communities who credit it as the key to understanding NewJeans' emotional intelligence.`,
  },

  // ─── KiiiKiii · I DO ME ──────────────────────────────────────────────────
  {
    song: "kiiikiii-i-do-me", lineIndex: 0, word: "I do it my way",
    userEmail: "fernanda_v_stan@aegyo.fan",
    note: `"I do it my way" opens KiiiKiii's debut with a reflexive construction — "me" as both agent and recipient of the action — that operates differently in English than in Korean. The phrase "I do me" (from AAVE, popularized in 2010s US internet culture) asserts self-determination by collapsing subject and object: I am what I do, I do what I am. In K-pop context — where groups operate within tight label management, synchronized promotional schedules, and carefully crafted concepts — the claim to "doing you" is radical. The irony, which KiiiKiii's fandom (TiiiKiii) has debated: can you genuinely "do yourself" within a Starship Entertainment debut framework? The song answers by simply enacting what it describes: the production is polished but personality-forward, the visual concept distinct from contemporaries. Won first music show trophy on Show! Music Core within 40 days of debut — the fastest K-pop rookie girl group win at the time — which fans read as validation of the approach. At HEAD IN THE CLOUDS Tokyo 2026, performing as the sole K-pop girl group at an 88rising hip-hop festival, the "my way" claim felt earned.`,
  },
  {
    song: "kiiikiii-i-do-me", lineIndex: 3, word: "the real me",
    userEmail: "kiiikifanmx_jorge@aegyo.fan",
    note: `"This is the real me" (이게 진짜 나야) performs the authenticity claim that is the central conceit of KiiiKiii's debut era: "UNCUT GEM" as album concept, "I DO ME" as debut single, the group's positioning as Starship's antidote to K-pop's over-polished idol aesthetic. In Korean, 진짜 (real/genuine) is an intensifier used colloquially but also philosophically — 진짜 나 (the real me) implies that other versions of the self have been constructed, performed, or managed. The "real me" declaration in K-pop debut tracks typically appears after a buildup — a reveal, a surprise. Here it's front-loaded: we meet the "real" KiiiKiii immediately, without teaser. The group's name itself encodes this — 키키 (kiki) is Korean onomatopoeia for giggling, a genuine spontaneous sound rather than a performed one. The fandom name TiiiKiii (from tiki-taka, the football possession strategy) extends the authenticity claim: fans are not passive observers but active participants in passing the energy. "The real me" in this context is also a challenge to post-Min Hee-jin K-pop: authenticity is possible, it's just rare.`,
  },

  // ─── KiiiKiii · UNCUT GEM ────────────────────────────────────────────────
  {
    song: "kiiikiii-uncut-gem", lineIndex: 0, word: "I'm an uncut gem",
    userEmail: "indiemx_carlos@aegyo.fan",
    note: `"I'm an uncut gem" reaches into gemology for a metaphor that reframes K-pop's idol perfectionism as a deficiency rather than a virtue. A cut gem — faceted, polished, graded — has had its natural form systematically altered to maximize light reflection. An uncut gem contains all the same crystalline potential but without the intervention of the cutter's judgment about what form that potential should take. KiiiKiii's debut concept inverts K-pop's typical debut promise (we are ready, refined, polished for you) with a different offer: we are raw, and the rawness is the value. The title's reference point in English is likely the 2019 Adam Sandler film "Uncut Gems" — a film about a New York jeweler whose unpolished gem from Ethiopia becomes both treasure and obsession, almost destroying him. The parallel: an uncut gem is valuable precisely because it's undetermined, full of possibility, not yet constrained by market expectations. KiiiKiii at their Festiiival fan concert (May 16-17, 2026) — barely 14 months into their career — performing to their own fandom is the uncut gem proving it can generate its own light without an industry cutter's intervention.`,
  },

  // ─── KiiiKiii · DANCING ALONE ────────────────────────────────────────────
  {
    song: "kiiikiii-dancing-alone", lineIndex: 0, word: "Dancing alone",
    userEmail: "kiiikifrance_hugo@aegyo.fan",
    note: `"Dancing alone" as a concept reframes one of pop culture's most persistent metaphors for loneliness — the single person on the dance floor — into an image of freedom. In K-pop's choreography-centric culture, dancing alone is structurally significant: K-pop performance is almost always synchronized group dance, and the lone dancer is either the featured soloist or the person left behind. KiiiKiii's city pop aesthetic (Japanese urban sound of the 1980s, which became a K-pop trend in the early 2020s via Citrus and IVE's "After LIKE") grounds the solitude in urban independence: the city as the dancer's space, not a ballroom requiring a partner. The 1980s Japanese city pop sound evokes a specific historical context — Japan's economic bubble era, when middle-class urban culture produced music that was aspirational, stylish, and individually focused. Imported into 2025 Korean pop, it arrives with the resonance of that aspiration translated: free, mobile, unconstrained by relationship obligation. "I'm free" closes the song with a word that gains meaning from everything the city pop aesthetic implies about urban self-determination.`,
  },
  {
    song: "kiiikiii-dancing-alone", lineIndex: 3, word: "I can shine",
    userEmail: "fernanda_v_stan@aegyo.fan",
    note: `"Even alone I can shine" positions the solo dancer not as someone compensating for absent companionship but as someone generating their own light. This is the UNCUT GEM concept's logical conclusion: the uncut gem shines without a cutter's intervention; the dancer shines without a partner. In K-pop's typical visual language, shining is collective — the light sticks in ARMY's hands, the synchronized fan colors, the group's unified performance under stage lighting. KiiiKiii's assertion that one person alone can shine breaks from this collective grammar. At HEAD IN THE CLOUDS Tokyo 2026 — an 88rising event designed for hip-hop community, not K-pop group spectacle — KiiiKiii performed as the sole K-pop girl group among acts whose genre framework is individual artistry rather than group synchronization. The capacity to shine in that context, among artists whose shine is individual by definition, validated the lyrical claim. "I can shine" is not self-consolation but a demonstrated capability — proven on a stage designed for exactly the kind of solo luminosity the song describes.`,
  },
];

// ─── COMMENT DEFINITIONS ──────────────────────────────────────────────────────
// Format: { userEmail, entityType, entitySlug, body }
// entitySlug is looked up to get entityId at runtime

const COMMENTS = [

  // ── Mexico City ──
  { userEmail: "sofiaRM_cdmx@aegyo.fan", entityType: "song", entitySlug: "bts-spring-day",
    body: "봄날 during BTS's ARIRANG tour must hit different — RM writing about missing someone during the years before military service, now they've all come back. The Sewol reading still makes me cry no matter how many times I revisit the annotations." },
  { userEmail: "sofiaRM_cdmx@aegyo.fan", entityType: "artist", entitySlug: "bts",
    body: "4M first-day sales for ARIRANG, 110M Spotify streams in 24 hours, then Artist of the Year at the AMAs. They literally set every K-pop record available and then some. The CDMX streaming parties were ELECTRIC." },
  { userEmail: "sofiaRM_cdmx@aegyo.fan", entityType: "song", entitySlug: "bts-boy-with-luv",
    body: "RM saying this was 'a fan letter from BTS to ARMY' — the whole 작은 것들을 위한 시 philosophy of small things — I think about this every time I'm at a fan café and we're just sitting together watching their content. The small things ARE the everything." },

  { userEmail: "valeriabangtanmx@aegyo.fan", entityType: "song", entitySlug: "bts-life-goes-on",
    body: "This song never leaves me. Released during lockdown, listened to it in my room when the whole world had stopped — now BTS is back touring stadiums and 'life goes on' still means the same thing it meant in 2020. Some songs just stay true." },
  { userEmail: "valeriabangtanmx@aegyo.fan", entityType: "artist", entitySlug: "bts",
    body: "SEVENTEEN going on hiatus for military service just as BTS is wrapping up their ARIRANG tour — the generational wave hits different when you watch one generation return while another prepares to leave. Seventeen's enlistment announcement hit their fandom so hard." },
  { userEmail: "valeriabangtanmx@aegyo.fan", entityType: "song", entitySlug: "bts-dynamite",
    body: "First fully English BTS song, first K-pop #1 on Billboard Hot 100, first Grammy nomination — and RM said it 'wouldn't exist without coronavirus.' Sometimes the best things come from the worst moments. Still use it as my morning pump-up song in 2026." },

  { userEmail: "fernanda_v_stan@aegyo.fan", entityType: "song", entitySlug: "kiiikiii-dancing-alone",
    body: "The city pop aesthetic on DANCING ALONE is doing something different from what NewJeans does with Y2K — this is 80s Japan, independence, urban freedom. KiiiKiii are carving their own lane and it's working. TiiiKiii we're watching something special form." },
  { userEmail: "fernanda_v_stan@aegyo.fan", entityType: "artist", entitySlug: "kiiikiii",
    body: "HEAD IN THE CLOUDS Tokyo as the only K-pop girl group at an 88rising event — that is not an accident, that is strategy. Starship is positioning them in a space that BTS pioneered (hip-hop adjacent) and that gives them longevity. I see the vision clearly." },
  { userEmail: "fernanda_v_stan@aegyo.fan", entityType: "song", entitySlug: "bts-on",
    body: "Map of the Soul era BTS and the Jungian framework felt so ambitious when it dropped. Now studying the annotations here about persona vs shadow makes me want to go back through the whole album with fresh eyes. V's Blue & Grey alongside this is such a complete picture of the group's psychology." },

  { userEmail: "kiiikifanmx_jorge@aegyo.fan", entityType: "song", entitySlug: "kiiikiii-i-do-me",
    body: "40 days from debut to first music show win — that's not normal. The 'I do it my way' concept proved itself fast. And now at the Festiiival fan concert, TiiiKiii showing up for them. This is year two and the foundation is solid." },
  { userEmail: "kiiikifanmx_jorge@aegyo.fan", entityType: "artist", entitySlug: "aespa",
    body: "aespa dropping LEMONADE on May 29 while their SYNK COMPLæXITY world tour is already announced — Karina at the Met Gala the week before — SM is operating at full power. The AI-avatar concept finally makes sense when they own this much cultural space." },
  { userEmail: "kiiikifanmx_jorge@aegyo.fan", entityType: "song", entitySlug: "kiiikiii-uncut-gem",
    body: "An uncut gem is more valuable before the cutter shapes it — KiiiKiii as a concept. I keep coming back to this because it's the opposite of everything the K-pop industry usually promises. Usually debut groups say 'we're ready, we're polished' — these five said 'we're raw and that's the gem.'" },

  { userEmail: "jimincdmx_lupita@aegyo.fan", entityType: "song", entitySlug: "bts-blue-grey",
    body: "V writing this after hearing RM describe his world as grey — the grey rhino economic metaphor for depression that approaches visibly but nobody addresses — I think about this annotation every time I feel the flatness of burnout rather than the sadness of grief. Grey is so much more dangerous than blue." },
  { userEmail: "jimincdmx_lupita@aegyo.fan", entityType: "artist", entitySlug: "bts",
    body: "Jimin's 'Who' at 2.4B streams, first solo K-pop song without a feature to reach that milestone — and now back with the full group. Suga's message 'I really missed you' after completing his service as the last member to discharge. The reunification narrative around ARIRANG is genuinely beautiful." },
  { userEmail: "jimincdmx_lupita@aegyo.fan", entityType: "song", entitySlug: "bts-run-bts",
    body: "PROOF anthology on the 9th anniversary with 'Run BTS' carrying all four meanings simultaneously — run as locomotion, run the show, a run of performances, and self-command. BTS as a word is also 방탄소년단 (bulletproof boy scouts) which implies running *through* things. The title is doing so much work." },

  { userEmail: "lisamexico_daniela@aegyo.fan", entityType: "song", entitySlug: "blackpink-pink-venom",
    body: "The geomungo opening — five seconds of ancient Korean zither before any contemporary production — is still one of the most powerful moments in recent K-pop. Teddy Park and BLACKPINK creating a Grammy-adjacent track (before Teddy's actual 2026 Grammy win) that's built on Goguryeo-era instrumentation. That's the dual timeline K-pop at its best." },
  { userEmail: "lisamexico_daniela@aegyo.fan", entityType: "artist", entitySlug: "blackpink",
    body: "DEADLINE EP, 16.9M Spotify streams on day one — biggest female album debut on Spotify in 2026. And then all four of them at the Met Gala. Lisa at the FIFA World Cup opening ceremony. Rosé at the Grammys, first Brit Award for K-pop. Jennie top 10 Hot 100. The year BLACKPINK individually proved they were each worth a solo career and then came back to do it as a group." },
  { userEmail: "lisamexico_daniela@aegyo.fan", entityType: "song", entitySlug: "blackpink-ddu-du-ddu-du",
    body: "Gunshot onomatopoeia as title, phones as guns in the MV, Lisa with the 'BLACKPINK' katana — and then six years later they're using their actual cultural power to shoot. The symbolism aged so well. DDU-DU DDU-DU as manifesto was literal." },

  { userEmail: "jungkookarmy_ana@aegyo.fan", entityType: "song", entitySlug: "newjeans-ditto",
    body: "Ditto went 13 weeks at #1 on Circle Digital Chart in 2022. Now in 2026 NewJeans is a legal battlefield. Listening to the VHS aesthetic and 'you reflecting like a mirror' knowing what happened to the group — the song gained a layer of tragedy it wasn't written with. Some annotations have to account for what happened after." },
  { userEmail: "jungkookarmy_ana@aegyo.fan", entityType: "artist", entitySlug: "newjeans",
    body: "Danielle donating 10M KRW to single-parent families while facing a $31M lawsuit, smiling at church — she's 18 years old and carrying this with more grace than the corporation suing her. The streaming numbers (7.3B total, 500M on 'New Jeans' alone) prove the music is bigger than the industry drama." },
  { userEmail: "jungkookarmy_ana@aegyo.fan", entityType: "song", entitySlug: "bts-dynamite",
    body: "BTS's first English song dropping during the pandemic while every stadium in the world was empty — and now ARIRANG opening stadiums again 6 years later. The arc from Dynamite to ARIRANG is BTS's whole story: explosion to homecoming." },

  { userEmail: "blackpinkmx_carolina@aegyo.fan", entityType: "song", entitySlug: "blackpink-kill-this-love",
    body: "The 죽이다 double meaning in Kill This Love — both 'kill' and 'make something devastating' — is impossible to translate cleanly which is why the English title loses nuance. The Korean is doing something the annotation captures that the song title alone doesn't. Context always lives in the language." },
  { userEmail: "blackpinkmx_carolina@aegyo.fan", entityType: "artist", entitySlug: "blackpink",
    body: "Teddy Park winning the Grammy for production on 'Golden' and simultaneously being BLACKPINK's architect since debut — he's behind DDU-DU DDU-DU, Kill This Love, Pink Venom, and now the Grammy. The Black Label at 1 trillion won valuation. He made BLACKPINK's sound and the sound made history." },
  { userEmail: "blackpinkmx_carolina@aegyo.fan", entityType: "song", entitySlug: "blackpink-lovesick-girls",
    body: "The nurse outfit controversy — the Korean Health and Medical Workers' Union protesting the sexualized costume within a week of release, YG editing the MV — rarely mentioned in Western discussions of Lovesick Girls. The pathologizing of love as 사랑병 was taken literally enough that healthcare workers responded. That says something about how seriously Korean institutions take pop cultural representation." },

  { userEmail: "indiemx_carlos@aegyo.fan", entityType: "song", entitySlug: "kiiikiii-dancing-alone",
    body: "Slushii's 'Begin Again' dropped the same month KiiiKiii was at HEAD IN THE CLOUDS — both representing how EDM and K-pop are converging in 2026. The city pop production on Dancing Alone has Slushii's melodic emotional DNA all over it even if it's a different production team." },
  { userEmail: "indiemx_carlos@aegyo.fan", entityType: "artist", entitySlug: "stray-kids",
    body: "First K-pop group to headline Rock in Rio, STRAYCITY tour hitting Mexico City in September — coming for us this fall. Bang Chan's 237 KOMCA credits and the Fendi collaboration while 40M albums have shipped. Stray Kids in 2026 is what K-pop global ambition looks like when it fully succeeds." },
  { userEmail: "indiemx_carlos@aegyo.fan", entityType: "song", entitySlug: "kiiikiii-uncut-gem",
    body: "The Uncut Gems film parallel — the Ethiopian opal that's both treasure and obsession — gives this concept more depth than the typical K-pop debut metaphor. An uncut gem is high stakes: it can be valuable or it can be crushed in the wrong hands. KiiiKiii choosing Starship as the cutter is itself a statement." },

  { userEmail: "sugacdmx_yolanda@aegyo.fan", entityType: "song", entitySlug: "bts-blue-grey",
    body: "Suga as the last BTS member to complete military service writing 'I really missed you' to ARMY — and then this album has Blue & Grey where V writes about the grey rhino of burnout approaching. The military separation and the pandemic era mental health honesty are both about forced stillness revealing what you actually need." },
  { userEmail: "sugacdmx_yolanda@aegyo.fan", entityType: "artist", entitySlug: "bts",
    body: "SEVENTEEN's enlistment announcement makes me think about 2020-2021 ARMY who watched BTS go into service one by one. Now we watch CARAT do the same. The waiting and the returning — that's just K-pop's relationship with Korea's military obligation. It shapes every group differently." },
  { userEmail: "sugacdmx_yolanda@aegyo.fan", entityType: "song", entitySlug: "bts-run-bts",
    body: "Agust D's whole solo discography is about the specific exhaustion of being always-on — and then 'Run BTS' on PROOF arrives as a group statement that the running continues. Suga the solo artist and Suga the BTS member running in parallel. The verb 'run' containing both." },

  // ── New York ──
  { userEmail: "nycarmy_jasmine@aegyo.fan", entityType: "song", entitySlug: "jhope-on-the-street",
    body: "J-Hope dropping On the Street with J. Cole before enlisting — fulfilling the dream he'd named since 2014's Hip Hop Lover — and then completing service and joining ARIRANG. The J. Cole collaboration was a passing of the torch and then J-Hope came back and picked it up again. Standing on the street, together." },
  { userEmail: "nycarmy_jasmine@aegyo.fan", entityType: "artist", entitySlug: "bts",
    body: "Barclays Center shows for the ARIRANG World Tour — New York ARMY is not sleeping. The sold-out Allegiant Stadium nights in Vegas, 82 dates globally. Post-military BTS hitting bigger than pre-military BTS is the kind of story only BTS gets to tell." },
  { userEmail: "nycarmy_jasmine@aegyo.fan", entityType: "artist", entitySlug: "g-i-dle",
    body: "Soyeon rebranding as icebluerabbit — inverting every known trait (not hot, not yellow, not puppy) to challenge herself artistically — while (G)I-DLE does the Taipei Dome and books Lollapalooza. She is doing the Agust D move: solo artistic challenge while the group scales globally. Smart." },

  { userEmail: "jennienyc_mia@aegyo.fan", entityType: "song", entitySlug: "blackpink-pink-venom",
    body: "Jennie getting her first Hot 100 top 10 solo ('Dracula' with Tame Impala) right when BLACKPINK releases DEADLINE and Pink Venom is still getting annotations on Aegyo Arena. The geomungo opening in Pink Venom and then 'Pink Venom' in the title — Teddy Park built something that grows over time." },
  { userEmail: "jennienyc_mia@aegyo.fan", entityType: "artist", entitySlug: "blackpink",
    body: "BLACKPINK bathroom selfie at the Met Gala — four women breaking the rules together in the bathroom of the most prestigious fashion event in the world. That photo generated more engagement than the DEADLINE chart numbers. They understand that cultural moments are the actual product." },
  { userEmail: "jennienyc_mia@aegyo.fan", entityType: "song", entitySlug: "blackpink-ddu-du-ddu-du",
    body: "DDU-DU DDU-DU in 2018 and then DEADLINE in 2026 — eight years of BLACKPINK's visual language of power and confidence. The gunshot title to the 16.9M Spotify first-day record. The manifesto held." },

  { userEmail: "sugabarclays_tyler@aegyo.fan", entityType: "song", entitySlug: "bts-on",
    body: "The Map of Soul series getting a full Jungian analysis in these annotations is what Aegyo Arena is for. The Persona/Shadow framework isn't just music criticism — RM read Jung's actual texts and that's in the music. This isn't metaphor, it's application. The library card annotations hit different." },
  { userEmail: "sugabarclays_tyler@aegyo.fan", entityType: "artist", entitySlug: "bts",
    body: "Suga's message 'I really missed you' closing his alternative service letter — and then getting on stage for ARIRANG. The Agust D duality (raw, experimental, darker) folded back into BTS's sound for the comeback. You can hear both Suga and Agust D in the production." },
  { userEmail: "sugabarclays_tyler@aegyo.fan", entityType: "song", entitySlug: "bts-run-bts",
    body: "Stray Kids hitting 8 consecutive #1 Billboard 200 debuts and Rock in Rio headline while BTS owns the Hot 100 sweep — two different eras of K-pop running in parallel but neither is slowing down. The SKZ STRAYCITY tour coming to Latin America while BTS does ARIRANG globally." },

  { userEmail: "kiiikibrooklyn_sam@aegyo.fan", entityType: "song", entitySlug: "kiiikiii-i-do-me",
    body: "KiiiKiii getting their Festiiival fan concert 14 months into debut — NewJeans at the same point in their career were in legal battle mode. The contrast is stark. TiiiKiii building something without the HYBE shadow is exactly what 'I do it my way' promised." },
  { userEmail: "kiiikibrooklyn_sam@aegyo.fan", entityType: "artist", entitySlug: "newjeans",
    body: "NewJeans 7.3B total streams with zero new releases since 2024 — that catalog is holding without content because Min Hee-jin made something with genuine staying power. Ditto, Attention, Super Shy, Hype Boy — these songs don't need promotion to find new listeners." },
  { userEmail: "kiiikibrooklyn_sam@aegyo.fan", entityType: "song", entitySlug: "newjeans-super-shy",
    body: "Super Shy on Billboard Global 200 at #2 with 63M streams in a week — debut at #8 with Ditto. NewJeans before the legal battle was on a trajectory that was genuinely historic. Super Shy in Lisbon, the Y2K flash mob, the Jersey Club rhythm. They were building something." },

  { userEmail: "rmsbookclub_priya@aegyo.fan", entityType: "song", entitySlug: "bts-spring-day",
    body: "The Omelas motel reference in the 봄날 MV — Le Guin's story about societies sacrificing youth for collective comfort — and the Sewol Ferry reading. RM said the song allows multiple interpretations. The annotations here have done the most rigorous reading of those multiple interpretations I've seen anywhere. This is what a lyrics wiki should be." },
  { userEmail: "rmsbookclub_priya@aegyo.fan", entityType: "artist", entitySlug: "bts",
    body: "RM's solo US trip to 'set everything' for ARIRANG — the creative leader flying ahead of the group to prepare their return. Then 4M first-day sales. He carries the creative weight and the annotations on his solo catalog (Indigo, Right Place Wrong Person) show a consistent philosophical project that feeds the group." },
  { userEmail: "rmsbookclub_priya@aegyo.fan", entityType: "artist", entitySlug: "g-i-dle",
    body: "Soyeon's icebluerabbit is the most interesting K-pop solo rebrand in years — deliberately choosing a persona that contradicts everything fans know about her. Compare to RM's Indigo (introspective, museum-visiting) or Suga's Agust D (darker, experimental). All three are using solo work to access parts of themselves the group context can't hold." },

  { userEmail: "pinkvenom_ny_zoe@aegyo.fan", entityType: "song", entitySlug: "blackpink-pink-venom",
    body: "Posting this from the DEADLINE World Tour waitlist. Pink Venom's geomungo intro still sends chills. The way Teddy Park used ancient instrumentation to build a contemporary power anthem — then went on to win the Grammy — the through-line from 2022 to 2026 is unbroken." },
  { userEmail: "pinkvenom_ny_zoe@aegyo.fan", entityType: "artist", entitySlug: "blackpink",
    body: "Rosé winning the Brit Award — first K-pop act — while BLACKPINK's group comeback is simultaneously the biggest female Spotify debut of 2026. The solo careers didn't fragment them; they expanded the brand in every direction and then pulled everything back together for DEADLINE." },
  { userEmail: "pinkvenom_ny_zoe@aegyo.fan", entityType: "song", entitySlug: "blackpink-how-you-like-that",
    body: "ILLIT getting 800M streams on Magnetic — fastest debut milestone — while BLACKPINK has 58.9M Spotify followers and is on their second world tour. Different eras, different scales. BLACKPINK opened the global door for 5th gen groups. How You Like That as comeback anthem in 2020 is part of why ILLIT's Magnetic was possible in 2024." },

  { userEmail: "jhopeharlem_marcus@aegyo.fan", entityType: "song", entitySlug: "jhope-on-the-street",
    body: "J-Hope's pre-enlistment release, the J. Cole collab fulfilling a dream named in 2014 — and then RIIZE makes Tokyo Dome in 2.5 years and books Lollapalooza South America. The K-pop industry that J-Hope helped build with the street culture credibility of On the Street is now producing groups that break records in half the time." },
  { userEmail: "jhopeharlem_marcus@aegyo.fan", entityType: "artist", entitySlug: "bts",
    body: "On the Street was the farewell; ARIRANG is the return. Harlem ARMY showed up for both. The 'path we walk together' — J-Hope and J. Cole sang it before service and BTS proved it on the ARIRANG tour. 82 dates, stadiums globally. They walked the path and it was real." },
  { userEmail: "jhopeharlem_marcus@aegyo.fan", entityType: "artist", entitySlug: "riize",
    body: "RIIZE first K-pop group at Lollapalooza South America, fastest to Tokyo Dome, June 15 second mini album — and Teddy Park winning Grammy the same year. The infrastructure that Teddy built for BLACKPINK is now producing awards-grade production across the whole industry. SM, YG, JYP, Hybe all benefiting from the foundation K-pop's architects laid." },

  { userEmail: "epikhighnyc_deshawn@aegyo.fan", entityType: "song", entitySlug: "newjeans-ditto",
    body: "Ditto's 13-week chart run in 2022 and now the annotations here connecting it to Lacan's mirror stage — the loved one reflecting the self, the VHS format creating copies of copies. This song was always philosophically richer than it seemed. Min Hee-jin's visual instincts created layers that hold up to this level of analysis." },
  { userEmail: "epikhighnyc_deshawn@aegyo.fan", entityType: "artist", entitySlug: "newjeans",
    body: "Epik High was doing what NewJeans did conceptually back in the early 2000s — the honest, lo-fi emotional intelligence in Korean music before it became a global industry. NewJeans at their best had that same DNA. The Slushii melodic emotional DNA in some of their production choices. Now in legal limbo." },
  { userEmail: "epikhighnyc_deshawn@aegyo.fan", entityType: "song", entitySlug: "bts-dynamite",
    body: "Dynamite wouldn't exist without COVID — RM's words. Slushii's Chrysalis album on the Grammy ballot in the same year BTS does ARIRANG. The pandemic transformed how music got made and who reached global audiences. Dynamite was the rupture point that proved K-pop could chart in English without losing itself." },

  { userEmail: "indiecitykpop_lily@aegyo.fan", entityType: "song", entitySlug: "kiiikiii-dancing-alone",
    body: "City pop in KiiiKiii's Dancing Alone and Slushii's melodic emotional production have more in common than the genre labels suggest — both are about the feeling of being in motion, alone, in a city, with something beautiful happening internally. Different cultures producing the same emotional frequency." },
  { userEmail: "indiecitykpop_lily@aegyo.fan", entityType: "artist", entitySlug: "newjeans",
    body: "NewJeans trio comeback in H2 2026 with Hanni, Haerin, and Hyein — BABYMONSTER releasing their debut album in October the same period — two different trajectories of girl group storytelling happening simultaneously. NewJeans reformed, BABYMONSTER ascending. Both worth watching carefully." },
  { userEmail: "indiecitykpop_lily@aegyo.fan", entityType: "song", entitySlug: "newjeans-attention",
    body: "The surprise no-announcement debut strategy for Attention — and then KiiiKiii's Festiiival fan concert with full TiiiKiii mobilization 14 months in — the anti-promotional playbook works when the music is actually good. Both groups proved it differently." },

  { userEmail: "k2nyc_alexia@aegyo.fan", entityType: "song", entitySlug: "newjeans-hype-boy",
    body: "Four different music videos for Hype Boy — four different relationship narratives — is still one of the most structurally interesting decisions in K-pop debut history. No single correct reading. The hearts2hearts of it: multiple valid interpretations co-existing. That's what good art does." },
  { userEmail: "k2nyc_alexia@aegyo.fan", entityType: "artist", entitySlug: "newjeans",
    body: "Hearts2Hearts winning their first Inkigayo award in March 2026 while NewJeans is in legal limbo — SM's newest group ascending as HYBE's biggest creative controversy continues. The industry keeps moving. But the NewJeans streaming numbers (7.3B) say the music is bigger than any one label's choices." },
  { userEmail: "k2nyc_alexia@aegyo.fan", entityType: "song", entitySlug: "bts-life-goes-on",
    body: "Life Goes On in 2020 and ARIRANG in 2026 — the pandemic album and the return album. BTS bookmarking a whole era of global history with music. Life goes on was the promise; ARIRANG is the proof it did." },

  // ── Paris ──
  { userEmail: "armyparis_camille@aegyo.fan", entityType: "song", entitySlug: "bts-spring-day",
    body: "봄날 annotated with the Sewol Ferry reading feels essential context for any serious engagement with BTS's catalog. In France the Sewol disaster was covered but its full political impact — the government's negligence, the years of activist pressure — wasn't. The annotations here are filling gaps that even dedicated ARMY miss without Korean context." },
  { userEmail: "armyparis_camille@aegyo.fan", entityType: "artist", entitySlug: "aespa",
    body: "aespa at the Met Gala — Karina in custom Prada while LEMONADE releases May 29 and the SYNK COMPLæXITY tour is announced. SM doing what SM does: luxury brand positioning, visual precision, global reach. The AI-avatar concept is finally mainstream enough that non-fans get it." },
  { userEmail: "armyparis_camille@aegyo.fan", entityType: "song", entitySlug: "bts-run-bts",
    body: "SEVENTEEN announcing hiatus and enlistment while BTS concludes their ARIRANG tour — watching the K-pop cycle from Paris, you feel the generational waves. Run BTS on PROOF was a 9th anniversary reflection; SEVENTEEN's farewell songs will become their equivalent once they return in 2028." },

  { userEmail: "roseparis_sophie@aegyo.fan", entityType: "song", entitySlug: "blackpink-pink-venom",
    body: "Rosé winning the Brit Award — first K-pop act at the Brit Awards, performing at the Grammys — and then the annotation on Pink Venom's geomungo opening connecting BLACKPINK to Goguryeo-era scholarship. Rosé is literally making that cultural claim real in Western awards spaces. The song was prophetic." },
  { userEmail: "roseparis_sophie@aegyo.fan", entityType: "artist", entitySlug: "blackpink",
    body: "French BLINK have known since BLACKPINK's Paris concerts that they understand French fashion energy differently from other markets. The DEADLINE World Tour Paris dates are going to be extraordinary. Four women who each built solo international careers and came back by choice — that's what agency looks like." },
  { userEmail: "roseparis_sophie@aegyo.fan", entityType: "song", entitySlug: "blackpink-lovesick-girls",
    body: "The Lovesick Girls nurse controversy — the Korean Health Workers Union protest, YG's re-edit — is rarely analyzed in French K-pop discussions. The pathologizing of love as illness being taken seriously enough by healthcare institutions to demand visual revision is a fascinating moment of pop culture intersecting with labor rights." },

  { userEmail: "kiiikifrance_hugo@aegyo.fan", entityType: "song", entitySlug: "kiiikiii-dancing-alone",
    body: "City pop in KiiiKiii's Dancing Alone is the French K-pop indie scene's preferred aesthetic right now — the 80s Japanese urban synthesis that feels both retro and forward. In Paris K-pop circles, KiiiKiii's Festiiival announcement this spring was discussed more than most 4th gen group comebacks. The authenticity reads differently from here." },
  { userEmail: "kiiikifrance_hugo@aegyo.fan", entityType: "artist", entitySlug: "stray-kids",
    body: "Stray Kids at Rock in Rio, STRAYCITY in Latin America, KARMA Golden Disc Album of Year, Bang Chan with 237 KOMCA production credits and Fendi collab — European K-pop fans often joke that Stray Kids is the most 'globally literate' 4th gen group. They speak in sounds that travel well." },
  { userEmail: "kiiikifrance_hugo@aegyo.fan", entityType: "song", entitySlug: "kiiikiii-uncut-gem",
    body: "The uncut gem as metaphor for pre-commercial artistic value — the value that exists before the industry shapes you — is a very French critical concept applied to K-pop. KiiiKiii debuting with this claim and then winning NYLON awards within 10 months without losing the rawness. Rare." },

  { userEmail: "bangtanparis_theo@aegyo.fan", entityType: "song", entitySlug: "bts-dynamite",
    body: "BTS first English song, first K-pop Billboard #1, first K-pop Grammy nomination — and Dynamite wouldn't exist without the pandemic. France was in lockdown too. The context annotation about how COVID created the conditions for BTS's global breakthrough is the kind of counter-intuitive history that belongs on a lyrics wiki." },
  { userEmail: "bangtanparis_theo@aegyo.fan", entityType: "artist", entitySlug: "illit",
    body: "ILLIT's Magnetic at 800M Spotify streams — fastest K-pop debut song to reach that milestone — and MAMIHLAPINATAPAI selling 410K copies week one. The album title is an untranslatable Yaghan word for mutual wordless longing. A K-pop group naming an album after a word from an extinct South American language says everything about how global the reference pool has become." },
  { userEmail: "bangtanparis_theo@aegyo.fan", entityType: "song", entitySlug: "bts-on",
    body: "The Map of the Soul Jungian framework — reading BTS through Murray Stein's 'Jung's Map of the Soul' — is what separates the annotation quality on Aegyo Arena from typical fan wikis. ON as the song where the persona/shadow integration becomes an imperative rather than a question. 'Burn me up completely' as integration ritual." },

  { userEmail: "jinfanparis_marie@aegyo.fan", entityType: "song", entitySlug: "newjeans-hurt",
    body: "NewJeans including Hurt on their debut EP — a song about emotional self-protection — alongside the more confident debut tracks. The production paradox (groovy drums beneath words about guarding yourself) is the most musically sophisticated thing on the EP. Hearts2Hearts's first Inkigayo win feels like a different era of K-pop innocence by comparison." },
  { userEmail: "jinfanparis_marie@aegyo.fan", entityType: "artist", entitySlug: "newjeans",
    body: "Minji's status still uncertain, Danielle's contract terminated, Hanni/Haerin/Hyein rebuilding as trio — watching the NewJeans situation from Paris where the narrative is mostly 'legal drama' misses how personal this is. These are teenagers. The music (7.3B streams) is carrying them through the institution's failure." },
  { userEmail: "jinfanparis_marie@aegyo.fan", entityType: "song", entitySlug: "bts-boy-with-luv",
    body: "Boy With Luv as fan letter — RM's explicit framing of the song as BTS writing to ARMY — and Jin having been the warmest, most fan-attentive member through years of military separation. The small things philosophy in French fan communities means something different when your group members have been absent and then return." },

  { userEmail: "seoulvibesparis_emma@aegyo.fan", entityType: "song", entitySlug: "bts-life-goes-on",
    body: "Life Goes On in French fan communities became the pandemic song across language barriers. The Korean lyrics and English title — 'life goes on, on, on' — needed no translation in 2020. aespa's AI-avatar concept is doing something similar: using digital identity language that bypasses cultural translation." },
  { userEmail: "seoulvibesparis_emma@aegyo.fan", entityType: "artist", entitySlug: "aespa",
    body: "LEMONADE as sophomore album title — transformation from bitterness to sweetness as the sophomore narrative — and the SYNK COMPLæXITY tour reaching Europe. aespa has the most coherent world-building of any 4th gen act: the æ-avatars, the KWANGYA universe, the metaverse concerts. It's ambitious and it's working." },
  { userEmail: "seoulvibesparis_emma@aegyo.fan", entityType: "artist", entitySlug: "g-i-dle",
    body: "Lollapalooza Chicago for (G)I-DLE alongside Jennie — two different aesthetic traditions of K-pop female empowerment on the same Western festival stage. Soyeon's icebluerabbit artistic challenge alongside the Syncopation World Tour and Taipei Dome. She is doing what an artist at the top of her career should do: challenge everything she's built." },

  { userEmail: "hyukohparis_ines@aegyo.fan", entityType: "song", entitySlug: "bts-blue-grey",
    body: "V's Blue & Grey and BABYMONSTER's CHOOM album arriving in the same year — different generational positions on mental health and performance. V writing about burnout in 2020 with acoustic guitar; BABYMONSTER announcing a world tour with high-octane production in 2026. The industry is healthier about acknowledging the grey rhino, but is it slower in arriving?" },
  { userEmail: "hyukohparis_ines@aegyo.fan", entityType: "artist", entitySlug: "aespa",
    body: "aespa's AI-human duality has always been the most philosophically interesting concept in 4th gen K-pop — the æ-avatars as Jungian doubles, the digital and real selves in tension. LEMONADE as sophomore album title is a sweet resolution: from the experimental weirdness of debut to the mature confidence of year 3+." },
  { userEmail: "hyukohparis_ines@aegyo.fan", entityType: "song", entitySlug: "bts-on",
    body: "BABYMONSTER's world tour ambition and BTS's ARIRANG 82-date global run happening simultaneously — two YG-adjacent groups (BABYMONSTER) and HYBE (BTS) both operating at maximum international scale. ON's 'burn me up completely' was BTS's 2020 manifesto for this kind of total commitment. Now they're living it." },

  { userEmail: "soyeonfan_maxime@aegyo.fan", entityType: "song", entitySlug: "blackpink-ddu-du-ddu-du",
    body: "Soyeon building (G)I-DLE's catalog as writer/producer and Teddy Park building BLACKPINK's — two Korean female-adjacent creative forces shaping girl group identity in K-pop. Teddy's Grammy in 2026 and Soyeon's icebluerabbit solo pivot are both producers claiming creative authorship publicly. DDU-DU DDU-DU is Teddy's manifesto as much as it's BLACKPINK's." },
  { userEmail: "soyeonfan_maxime@aegyo.fan", entityType: "artist", entitySlug: "g-i-dle",
    body: "(G)I-DLE at Lollapalooza, Taipei Dome first K-pop girl group, July album, Soyeon's icebluerabbit — four major events in one year while on a world tour. This is what sustainable K-pop looks like when the creative director is also a member. No waiting for label approval on artistic reinvention." },
  { userEmail: "soyeonfan_maxime@aegyo.fan", entityType: "song", entitySlug: "blackpink-kill-this-love",
    body: "Teddy Park winning the Grammy and having produced Kill This Love — 죽이다 as both destruction and excellence — the ambiguity of the Korean verb is now attached to a Grammy-winning producer's catalog. Kill This Love annotations deserve to be revisited with 2026 context: this is a Grammy-winning song." },

  { userEmail: "crushparis_lea@aegyo.fan", entityType: "song", entitySlug: "bts-spring-day",
    body: "봄날 and the Sewol annotations — the Le Guin Omelas reference, the yellow ribbons, the mountain of clothing — every time I read these I'm grateful that a lyrics wiki can hold this level of cultural documentation. French K-pop fans often don't have context for Korean political history. This is education." },
  { userEmail: "crushparis_lea@aegyo.fan", entityType: "artist", entitySlug: "newjeans",
    body: "2NE1's 17th anniversary reunion alongside NewJeans' legal crisis — two K-pop girl group stories about institutional failure and reunion happening simultaneously in 2026. 2NE1 persisting despite YG's disbandment. NewJeans persisting despite HYBE's legal offensive. The music always outlasts the institution." },
  { userEmail: "crushparis_lea@aegyo.fan", entityType: "song", entitySlug: "newjeans-attention",
    body: "The surprise no-announcement Attention debut and the post-Min Hee-jin retroactive reading — was the anti-promotional strategy genuine artistic vision or calculated brand differentiation? The annotations here support both readings. Good art holds the contradiction." },

  { userEmail: "newjeansparis_florian@aegyo.fan", entityType: "song", entitySlug: "newjeans-ditto",
    body: "Ditto's VHS aesthetic, the sixth friend with the arm cast, the mirror reflection — and now reading it in 2026 when the sixth figure is Danielle, excluded from the group photo, the lawsuit pending. The annotations on Ditto here are the most emotionally honest K-pop analysis I've found." },
  { userEmail: "newjeansparis_florian@aegyo.fan", entityType: "artist", entitySlug: "newjeans",
    body: "Copenhagen preproduction for the trio comeback — NewJeans still making music in 2026 despite everything — and ILLIT's MAMIHLAPINATAPAI (an untranslatable Yaghan word for wordless mutual longing) as album title. The word NewJeans invented for themselves (Ditto as wordless understanding) has descendants in the generation it influenced." },
  { userEmail: "newjeansparis_florian@aegyo.fan", entityType: "song", entitySlug: "kiiikiii-i-do-me",
    body: "KiiiKiii at HEAD IN THE CLOUDS Tokyo 2026, TiiiKiii fan concert announced, NYLON award in year one — and NewJeans trio comeback in H2 2026. Two parallel girl group narratives about authenticity, one damaged by institution, one still building. I DO ME as title carries different weight next to NewJeans' situation." },
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  Aegyo Arena — Seed Annotations + Comments");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // Pre-fetch all song, artist, user IDs
  const songSlugSet = new Set([
    ...ANNOTATIONS.map(a => a.song),
    ...COMMENTS.filter(c => c.entityType === "song").map(c => c.entitySlug),
  ]);
  const artistSlugSet = new Set(
    COMMENTS.filter(c => c.entityType === "artist").map(c => c.entitySlug)
  );
  const userEmailSet = new Set([
    ...ANNOTATIONS.map(a => a.userEmail),
    ...COMMENTS.map(c => c.userEmail),
  ]);

  const songMap = new Map<string, string>();
  for (const slug of songSlugSet) {
    const id = await getSongId(slug);
    if (id) songMap.set(slug, id);
    else console.warn(`  song not found: ${slug}`);
  }

  const artistMap = new Map<string, string>();
  for (const slug of artistSlugSet) {
    const id = await getArtistId(slug);
    if (id) artistMap.set(slug, id);
    else console.warn(`  artist not found: ${slug}`);
  }

  const userMap = new Map<string, string>();
  for (const email of userEmailSet) {
    const id = await getUserId(email);
    if (id) userMap.set(email, id);
    else console.warn(`  user not found: ${email}`);
  }

  // ── Seed annotations ──
  let annCreated = 0;
  let annSkipped = 0;
  for (const ann of ANNOTATIONS) {
    const songId = songMap.get(ann.song);
    if (!songId) { annSkipped++; continue; }
    const userId = userMap.get(ann.userEmail) ?? undefined;

    const exists = await prisma.lyricAnnotation.findFirst({
      where: { songId, lineIndex: ann.lineIndex, word: ann.word },
    });
    if (exists) { annSkipped++; continue; }

    await prisma.lyricAnnotation.create({
      data: { songId, lineIndex: ann.lineIndex, word: ann.word, note: ann.note, userId: userId ?? null },
    });
    annCreated++;
  }
  console.log(`Annotations: ${annCreated} created, ${annSkipped} skipped`);

  // ── Seed comments ──
  let cmtCreated = 0;
  let cmtSkipped = 0;
  for (const cmt of COMMENTS) {
    const userId = userMap.get(cmt.userEmail);
    if (!userId) { cmtSkipped++; continue; }

    const entityId = cmt.entityType === "song"
      ? songMap.get(cmt.entitySlug)
      : artistMap.get(cmt.entitySlug);
    if (!entityId) { cmtSkipped++; continue; }

    const exists = await prisma.comment.findFirst({
      where: { userId, entityType: cmt.entityType, entityId, body: cmt.body.slice(0, 50) },
    });
    if (exists) { cmtSkipped++; continue; }

    await prisma.comment.create({
      data: { userId, entityType: cmt.entityType, entityId, body: cmt.body },
    });
    cmtCreated++;
  }
  console.log(`Comments:    ${cmtCreated} created, ${cmtSkipped} skipped`);
  console.log("\n✅  Done.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
