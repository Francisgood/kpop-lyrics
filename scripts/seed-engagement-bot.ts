/**
 * engagement-bot-catchup — seeds realistic dummy users, annotations,
 * edits, comments, and point events for the 30 Daebak Leaderboard contributors.
 *
 * Safe to re-run: skips users that already exist (by email).
 * Usage:
 *   DATABASE_URL="..." DIRECT_URL="..." \
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-engagement-bot.ts
 */

import { prisma } from "../lib/prisma";
import crypto from "crypto";

// ── Point values (must match lib/points.ts) ──────────────────────────────────
const PV = { signup_bonus: 100, comment: 10, annotation: 30, edit_approved: 50, annotation_upvoted: 5 };

function hashPassword(pw: string): string {
  return crypto.createHash("sha256").update(pw + "aegyo-salt").digest("hex");
}

function rng(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function dateInRange(startIso: string, endIso: string): Date {
  const s = new Date(startIso).getTime();
  const e = new Date(endIso).getTime();
  return new Date(s + Math.random() * (e - s));
}

// ── Contributor definitions ───────────────────────────────────────────────────
interface Contrib {
  username: string; email: string; city: string;
  focusSlugs: string[];    // artist slugs to source songs from
  annotations: number; edits: number; comments: number; points: number;
  joinedIso: string;       // approximate join date
  lang: "es" | "en" | "fr";
}

const CONTRIBUTORS: Contrib[] = [
  // Mexico City
  { username:"SofiaRM_CDMX",          email:"sofiaRM_cdmx@aegyo.fan",          city:"Mexico City", focusSlugs:["rm","bts"],            annotations:42,  edits:31, comments:210, points:8450,  joinedIso:"2024-01-15", lang:"es" },
  { username:"ValeriaBangtanMX",       email:"valeriabangtanmx@aegyo.fan",      city:"Mexico City", focusSlugs:["bts"],                  annotations:36,  edits:27, comments:188, points:7180,  joinedIso:"2024-02-10", lang:"es" },
  { username:"Fernanda_V_Stan",        email:"fernanda_v_stan@aegyo.fan",       city:"Mexico City", focusSlugs:["kiiikiii","v"],         annotations:29,  edits:22, comments:167, points:6340,  joinedIso:"2024-03-01", lang:"es" },
  { username:"KiiikiiFanMX_Jorge",     email:"kiiikifanmx_jorge@aegyo.fan",     city:"Mexico City", focusSlugs:["kiiikiii"],             annotations:31,  edits:18, comments:142, points:5920,  joinedIso:"2024-03-15", lang:"es" },
  { username:"JiminCDMX_Lupita",       email:"jimincdmx_lupita@aegyo.fan",      city:"Mexico City", focusSlugs:["jimin","bts"],          annotations:24,  edits:20, comments:131, points:5110,  joinedIso:"2024-04-01", lang:"es" },
  { username:"LisaMexico_Daniela",     email:"lisamexico_daniela@aegyo.fan",    city:"Mexico City", focusSlugs:["lisa","blackpink"],     annotations:20,  edits:19, comments:118, points:4680,  joinedIso:"2024-04-15", lang:"es" },
  { username:"JungkookARMY_Ana",       email:"jungkookarmy_ana@aegyo.fan",      city:"Mexico City", focusSlugs:["jungkook","bts"],       annotations:18,  edits:14, comments:109, points:3970,  joinedIso:"2024-05-01", lang:"es" },
  { username:"BlackpinkMX_Carolina",   email:"blackpinkmx_carolina@aegyo.fan", city:"Mexico City", focusSlugs:["blackpink"],            annotations:16,  edits:12, comments:97,  points:3450,  joinedIso:"2024-05-15", lang:"es" },
  { username:"IndieMX_Carlos",         email:"indiemx_carlos@aegyo.fan",        city:"Mexico City", focusSlugs:["kiiikiii","twice"],     annotations:13,  edits:11, comments:85,  points:2890,  joinedIso:"2024-06-01", lang:"es" },
  { username:"SugaCDMX_Yolanda",       email:"sugacdmx_yolanda@aegyo.fan",      city:"Mexico City", focusSlugs:["suga","bts"],           annotations:10,  edits:9,  comments:74,  points:2310,  joinedIso:"2024-06-15", lang:"es" },
  // New York
  { username:"NYCArmy_Jasmine",        email:"nycarmy_jasmine@aegyo.fan",       city:"New York",    focusSlugs:["j-hope","bts"],         annotations:9,   edits:8,  comments:68,  points:2070,  joinedIso:"2024-07-01", lang:"en" },
  { username:"JennieNYC_Mia",          email:"jennienyc_mia@aegyo.fan",         city:"New York",    focusSlugs:["jennie","blackpink"],   annotations:8,   edits:8,  comments:62,  points:1920,  joinedIso:"2024-08-01", lang:"en" },
  { username:"SugaBarclays_Tyler",     email:"sugabarclays_tyler@aegyo.fan",    city:"New York",    focusSlugs:["suga","bts"],           annotations:8,   edits:7,  comments:57,  points:1760,  joinedIso:"2024-08-15", lang:"en" },
  { username:"KiiikiiBrooklyn_Sam",    email:"kiiikibrooklyn_sam@aegyo.fan",    city:"New York",    focusSlugs:["kiiikiii"],             annotations:7,   edits:7,  comments:53,  points:1640,  joinedIso:"2024-09-01", lang:"en" },
  { username:"RMsBookClub_Priya",      email:"rmsbookclub_priya@aegyo.fan",     city:"New York",    focusSlugs:["rm","bts"],             annotations:6,   edits:7,  comments:49,  points:1510,  joinedIso:"2024-10-01", lang:"en" },
  { username:"PinkVenomNY_Zoe",        email:"pinkvenom_ny_zoe@aegyo.fan",      city:"New York",    focusSlugs:["blackpink"],            annotations:6,   edits:6,  comments:44,  points:1390,  joinedIso:"2024-11-01", lang:"en" },
  { username:"JhopeHarlem_Marcus",     email:"jhopeharlem_marcus@aegyo.fan",    city:"New York",    focusSlugs:["j-hope","bts"],         annotations:5,   edits:6,  comments:40,  points:1240,  joinedIso:"2024-11-15", lang:"en" },
  { username:"EpikHighNYC_DeShawn",    email:"epikhighnyc_deshawn@aegyo.fan",   city:"New York",    focusSlugs:["bts","newjeans"],       annotations:5,   edits:5,  comments:36,  points:1080,  joinedIso:"2024-11-15", lang:"en" },
  { username:"IndieCityKpop_Lily",     email:"indiecitykpop_lily@aegyo.fan",    city:"New York",    focusSlugs:["kiiikiii","newjeans"],  annotations:4,   edits:4,  comments:30,  points:870,   joinedIso:"2024-12-01", lang:"en" },
  { username:"K2NYC_Alexia",           email:"k2nyc_alexia@aegyo.fan",          city:"New York",    focusSlugs:["bts","newjeans"],       annotations:3,   edits:4,  comments:28,  points:760,   joinedIso:"2024-12-01", lang:"en" },
  // Paris
  { username:"ARMYParis_Camille",      email:"armyparis_camille@aegyo.fan",     city:"Paris",       focusSlugs:["bts"],                  annotations:4,   edits:4,  comments:32,  points:980,   joinedIso:"2024-12-01", lang:"fr" },
  { username:"RoséParis_Sophie",       email:"roseparis_sophie@aegyo.fan",      city:"Paris",       focusSlugs:["rose","blackpink"],     annotations:4,   edits:3,  comments:28,  points:870,   joinedIso:"2025-01-01", lang:"fr" },
  { username:"KiiikiiFrance_Hugo",     email:"kiiikifrance_hugo@aegyo.fan",     city:"Paris",       focusSlugs:["kiiikiii"],             annotations:3,   edits:4,  comments:25,  points:780,   joinedIso:"2025-01-15", lang:"fr" },
  { username:"BangtanParis_Théo",      email:"bangtanparis_theo@aegyo.fan",     city:"Paris",       focusSlugs:["jungkook","bts"],       annotations:3,   edits:3,  comments:22,  points:680,   joinedIso:"2025-02-01", lang:"fr" },
  { username:"JinFanParis_Marie",      email:"jinfanparis_marie@aegyo.fan",     city:"Paris",       focusSlugs:["jin","bts"],            annotations:3,   edits:3,  comments:19,  points:610,   joinedIso:"2025-02-01", lang:"fr" },
  { username:"SeoulVibesParis_Emma",   email:"seoulvibesparis_emma@aegyo.fan",  city:"Paris",       focusSlugs:["iu"],                   annotations:2,   edits:3,  comments:18,  points:540,   joinedIso:"2025-03-01", lang:"fr" },
  { username:"HyukohParis_Inès",       email:"hyukohparis_ines@aegyo.fan",      city:"Paris",       focusSlugs:["bts","aespa"],          annotations:2,   edits:3,  comments:15,  points:470,   joinedIso:"2025-03-01", lang:"fr" },
  { username:"SoyeonFan_Maxime",       email:"soyeonfan_maxime@aegyo.fan",      city:"Paris",       focusSlugs:["g-i-dle"],              annotations:2,   edits:2,  comments:14,  points:410,   joinedIso:"2025-04-01", lang:"fr" },
  { username:"CrushParis_Léa",         email:"crushparis_lea@aegyo.fan",        city:"Paris",       focusSlugs:["bts","iu"],             annotations:2,   edits:2,  comments:11,  points:360,   joinedIso:"2025-04-01", lang:"fr" },
  { username:"NewJeansParis_Florian",  email:"newjeansparis_florian@aegyo.fan", city:"Paris",       focusSlugs:["newjeans"],             annotations:1,   edits:2,  comments:10,  points:310,   joinedIso:"2025-05-01", lang:"fr" },
];

// ── Annotation content pools ─────────────────────────────────────────────────
const NOTES: Record<"es"|"en"|"fr", string[]> = {
  es: [
    "Esta palabra conecta con el concepto principal del álbum. Los ARMYs de CDMX lo analizaron en profundidad durante las sesiones de escucha.",
    "El uso de este término aquí es muy significativo — hace referencia a la filosofía del artista sobre la identidad y el crecimiento personal.",
    "Referencia cultural importante: en el contexto K-pop esta palabra tiene un peso emocional enorme para los fans hispanohablantes.",
    "Esta línea es un guiño al concepto visual del MV. La comunidad Blink de México lo detectó inmediatamente en el estreno.",
    "El contraste aquí entre las letras en coreano e inglés muestra el bilingüismo artístico característico de esta generación de K-pop.",
    "En la cultura fandom, esta palabra es un marcador de identidad. Los stans CDMX la usan como grito de unión en los fancafés.",
    "Esta metáfora conecta con el lore del artista — toda la narrativa del álbum gira alrededor de este concepto.",
    "Importante para los nuevos fans: esta referencia viene de un vlive donde el artista explicó personalmente su significado.",
    "El peso lírico aquí es enorme. Esta es la línea que todo ARMY mexicano canta a todo pulmón en los conciertos.",
    "Contexto histórico del K-pop: este tipo de estructura poética viene de la tradición del sijo coreano adaptada al pop moderno.",
  ],
  en: [
    "This word carries significant weight in the context of the full album concept. The NYC fandom broke this down in a 3-hour Twitter Space.",
    "Cultural context: this term references a Korean philosophy of self-improvement that runs through the entire discography.",
    "The artist has referenced this concept in multiple interviews — it connects to the overarching narrative of their solo era.",
    "This lyric is a direct callback to an earlier song. The internal continuity of this discography is unmatched.",
    "New fans take note: this line has a double meaning in Korean that the English translation completely misses.",
    "The Harlem Shake cultural crossover here is subtle but intentional — confirmed by the producer in a behind-the-scenes clip.",
    "This is the moment where the entire concept of the album crystallizes. Every lyric before this has been building to this word.",
    "Brooklyn stans caught this reference first — it's a nod to the artist's debut era that casual listeners usually miss.",
    "The phonetic wordplay here only works in Korean romanization, which is why this song is so hard to translate faithfully.",
    "This line has been dissected in the NYC ARMY Discord server — the consensus is that it references the artist's time in the military.",
  ],
  fr: [
    "Ce mot porte une signification culturelle profonde — il fait référence au concept de l'artiste sur l'identité et la liberté.",
    "Les fans français ont analysé ce passage lors d'une session d'écoute à La Défense. Le consensus : c'est le meilleur vers de l'album.",
    "Contexte important : ce terme vient de la philosophie coréenne et a été adopté par la culture K-pop de manière très spécifique.",
    "Cette métaphore connecte avec l'esthétique visuelle du MV — les Blinks parisiens l'ont remarquée immédiatement lors de la sortie.",
    "Pour les nouveaux fans : cette référence est un clin d'œil à un vlive mémorable où l'artiste a expliqué sa vision artistique.",
    "Le poids émotionnel de cette ligne est énorme. C'est la phrase que chaque ARMY chante à pleine voix lors des concerts à Paris.",
    "L'utilisation du coréen et de l'anglais ici illustre parfaitement le caractère bilingue et multiculturel du K-pop moderne.",
    "Cette annotation a été validée par la communauté K-indie parisienne — c'est désormais la référence sur cette chanson.",
    "Le paradoxe lyrique ici est intentionnel — l'artiste l'a confirmé dans une interview pour Rolling Stone Korea.",
    "Cette structure poétique vient de la tradition du sijo coréen, réinterprétée pour le pop moderne. Fascinant culturellement.",
  ],
};

// Words to annotate (picked from song titles / K-pop vocabulary)
const ANNOTATION_WORDS = [
  "love", "dream", "night", "heart", "fire", "soul", "world", "light",
  "blue", "spring", "star", "run", "gold", "wild", "rise", "born",
  "daebak", "aegyo", "hwaiting", "chagiya", "sunbae", "maknae", "bias",
  "ditto", "fancy", "venom", "spicy", "drama", "hot", "super", "girls",
  "money", "lalisa", "dynamite", "butter", "life", "dance", "king", "queen",
];

// Comment content pools
const COMMENTS: Record<"es"|"en"|"fr", string[]> = {
  es: [
    "Esta canción me rompe el corazón cada vez que la escucho. Daebak.",
    "La anotación de este verso es perfecta. Gracias por explicarlo tan bien.",
    "Los ARMYs de CDMX representando siempre. Hwaiting! 💛",
    "Acabo de escuchar este álbum por primera vez y ya es mi favorito.",
    "¿Alguien más llorando en el grupo de WhatsApp del fandom? Solo yo? 😭",
    "El análisis de esta letra es lo mejor que he leído en la plataforma.",
    "Ojalá el artista haga una gira por México pronto. NECESITAMOS esa presentación.",
    "Esta rima en coreano no tiene traducción directa pero la anotación lo explica perfecto.",
    "Mi grupo de streaming en CDMX está obsesionado con este track esta semana.",
    "Primer comentario aquí pero he estado leyendo todas las anotaciones. ¡Increíble trabajo!",
    "El concepto visual del MV y la letra se complementan a la perfección. Genialidad.",
    "Compartí esta anotación en mi Discord de ARMYs mexicanos y todos quedaron impresionados.",
  ],
  en: [
    "This annotation just changed the way I hear this entire song. Thank you.",
    "The cultural context here is exactly what new K-pop fans need to understand.",
    "NYC ARMYs putting in work as always. This breakdown is impeccable.",
    "I've been listening to this album on repeat and this annotation finally made it click.",
    "The producer confirmed this reference in an interview — great catch in the note.",
    "This is why I love this platform. No other site goes this deep.",
    "Screaming at how accurate this annotation is. The fandom is so talented.",
    "First heard this at the Barclays Center show and it hit completely different live.",
    "The word play in Korean doesn't translate at all but this note captures it perfectly.",
    "Adding this to my K-pop deep dive playlist. The annotations make every track richer.",
    "Priya's note on this one is the most thorough analysis I've seen anywhere online.",
    "This song deserves way more attention. The annotation proves how layered it is.",
  ],
  fr: [
    "Cette annotation est exactement ce dont les nouveaux fans français ont besoin.",
    "J'ai partagé ça avec tout mon groupe K-pop de Paris. Tout le monde est impressionné.",
    "Le contexte culturel expliqué ici est fascinant. Merci pour ce travail incroyable.",
    "On a passé toute une soirée à analyser cet album à La Défense. Cette note dit tout.",
    "Les Bunnies français représentent ! Cette analyse est *daebak*.",
    "Je n'avais pas compris ce vers avant de lire cette annotation. Maintenant je pleure.",
    "Première fois que je commente mais je lis toutes les annotations depuis des semaines.",
    "L'esthétique Y2K de cette chanson est parfaitement capturée dans cette analyse.",
    "Hugo a encore frappé avec une annotation de qualité. Le meilleur de la communauté française.",
    "Cette chanson représente tout ce que j'aime dans le K-pop moderne. L'annotation est parfaite.",
    "Partagé dans notre serveur Discord K-indie Paris. Réaction unanime : *hwaiting* !",
    "Le lien avec la fashion week de Paris est génial — je n'y avais pas pensé.",
  ],
};

// Edit suggestions pool
const EDIT_FIELDS = ["lyricsRomanized", "lyricsEn", "bio", "lyricsKo"] as const;
const EDIT_REASONS: Record<"es"|"en"|"fr", string[]> = {
  es: [
    "Corrección de romanización — la transliteración oficial del título es diferente.",
    "Actualización de la biografía del artista con información del comeback más reciente.",
    "Fijé un error de traducción en la versión en inglés. La frase tiene un doble sentido.",
    "Añadí el contexto del concepto del álbum que faltaba en la descripción.",
    "Corrección menor de puntuación en la letra romanizada.",
  ],
  en: [
    "Fixed romanization — the official MV uses a different transliteration of this line.",
    "Updated artist bio with details from the most recent comeback and solo era.",
    "Corrected a translation error — the original Korean has a wordplay that was lost.",
    "Added missing album concept context to the description field.",
    "Minor punctuation fix in romanized lyrics per official release booklet.",
  ],
  fr: [
    "Correction de la romanisation — la translittération officielle est différente.",
    "Mise à jour de la biographie avec les informations du comeback le plus récent.",
    "Correction d'une erreur de traduction — le coréen original a un double sens.",
    "Ajout du contexte conceptuel de l'album manquant dans la description.",
    "Petite correction de ponctuation dans les paroles romanisées.",
  ],
};

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const password = hashPassword("AegyoBot2024!");
  let totalUsers = 0, totalAnnotations = 0, totalEdits = 0, totalComments = 0, totalPoints = 0;

  // Pre-load all songs grouped by artist slug for fast lookup
  console.log("📦 Loading song pool from DB…");
  const allArtistSongs = await prisma.artist.findMany({
    select: {
      slug: true,
      albums: {
        select: { songs: { select: { id: true, title: true, slug: true } } },
      },
    },
  });

  const songPool: Record<string, { id: string; title: string; slug: string }[]> = {};
  for (const artist of allArtistSongs) {
    songPool[artist.slug] = artist.albums.flatMap((al) => al.songs);
  }

  // Fallback pool: BTS + BLACKPINK songs
  const fallbackSongs = [...(songPool["bts"] ?? []), ...(songPool["blackpink"] ?? [])];

  // Pre-load artists for edit targets
  const allArtists = await prisma.artist.findMany({ select: { id: true, slug: true } });
  const artistIds = allArtists.map((a) => a.id);

  console.log(`✅ Loaded ${Object.keys(songPool).length} artist song pools`);
  console.log(`📝 Starting seeding for ${CONTRIBUTORS.length} contributors…\n`);

  for (const c of CONTRIBUTORS) {
    // ── 1. Create or find user ──────────────────────────────────────────────
    const existing = await prisma.user.findUnique({ where: { email: c.email } });
    if (existing) {
      console.log(`  ⏭  ${c.username} — already exists, skipping`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email:         c.email,
        displayName:   c.username,
        passwordHash:  password,
        emailVerified: true,
        role:          "user",
        rewardsEnrolled: true,
      },
    });
    totalUsers++;

    // ── 2. Resolve song pool for this user ──────────────────────────────────
    let userSongs = c.focusSlugs.flatMap((slug) => songPool[slug] ?? []);
    if (userSongs.length === 0) userSongs = fallbackSongs;
    if (userSongs.length === 0) {
      // Absolute fallback: any 20 songs
      const any = await prisma.song.findMany({ take: 20, select: { id: true, title: true, slug: true } });
      userSongs = any;
    }
    // Deduplicate by id
    const seenIds = new Set<string>();
    userSongs = userSongs.filter((s) => { if (seenIds.has(s.id)) return false; seenIds.add(s.id); return true; });

    const actEnd = "2026-05-28T00:00:00Z";

    // ── 3. Signup bonus ─────────────────────────────────────────────────────
    await prisma.pointEvent.create({
      data: { userId: user.id, type: "signup_bonus", points: PV.signup_bonus, reason: "Account created", createdAt: new Date(c.joinedIso) },
    });

    // ── 4. Annotations ──────────────────────────────────────────────────────
    const annotationIds: string[] = [];
    for (let i = 0; i < c.annotations; i++) {
      const song = pick(userSongs);
      const titleWords = song.title.replace(/[()[\]{}]/g, "").split(/\s+/).filter((w) => w.length > 2);
      const word = titleWords.length > 0 ? pick(titleWords).toLowerCase() : pick(ANNOTATION_WORDS);
      const note = pick(NOTES[c.lang]);
      const createdAt = dateInRange(c.joinedIso, actEnd);

      const ann = await prisma.lyricAnnotation.create({
        data: {
          songId:    song.id,
          userId:    user.id,
          lineIndex: rng(0, 12),
          word,
          note,
          createdAt,
        },
      });
      annotationIds.push(ann.id);
      await prisma.pointEvent.create({
        data: { userId: user.id, type: "annotation", points: PV.annotation, reason: `Annotated "${song.title}"`, refId: ann.id, createdAt },
      });
      totalAnnotations++;
    }

    // ── 5. Edits (SuggestedEdit with status=approved) ───────────────────────
    for (let i = 0; i < c.edits; i++) {
      const song = pick(userSongs);
      const field = pick([...EDIT_FIELDS]);
      const reason = pick(EDIT_REASONS[c.lang]);
      const createdAt = dateInRange(c.joinedIso, actEnd);

      const edit = await prisma.suggestedEdit.create({
        data: {
          userId:       user.id,
          entityType:   "song",
          entityId:     song.id,
          field,
          currentVal:   null,
          suggestedVal: `[corrected ${field} for "${song.title}"]`,
          reason,
          status:       "approved",
          reviewedAt:   new Date(createdAt.getTime() + 3_600_000),
          createdAt,
        },
      });
      await prisma.pointEvent.create({
        data: { userId: user.id, type: "edit_approved", points: PV.edit_approved, reason: `Edit approved on "${song.title}"`, refId: edit.id, createdAt },
      });
      totalEdits++;
    }

    // ── 6. Comments (distributed across songs and artists) ──────────────────
    const songCommentCount   = Math.ceil(c.comments * 0.7); // 70% on songs
    const artistCommentCount = c.comments - songCommentCount;

    for (let i = 0; i < songCommentCount; i++) {
      const song = pick(userSongs);
      const body = pick(COMMENTS[c.lang]);
      const createdAt = dateInRange(c.joinedIso, actEnd);
      const comment = await prisma.comment.create({
        data: { userId: user.id, entityType: "song", entityId: song.id, body, createdAt },
      });
      await prisma.pointEvent.create({
        data: { userId: user.id, type: "comment", points: PV.comment, reason: `Commented on "${song.title}"`, refId: comment.id, createdAt },
      });
      totalComments++;
    }

    for (let i = 0; i < artistCommentCount; i++) {
      const artistId = pick(artistIds);
      const body = pick(COMMENTS[c.lang]);
      const createdAt = dateInRange(c.joinedIso, actEnd);
      const comment = await prisma.comment.create({
        data: { userId: user.id, entityType: "artist", entityId: artistId, body, createdAt },
      });
      await prisma.pointEvent.create({
        data: { userId: user.id, type: "comment", points: PV.comment, reason: "Commented on artist page", refId: comment.id, createdAt },
      });
      totalComments++;
    }

    // ── 7. Upvote point events (to reach exact leaderboard total) ───────────
    const earnedSoFar = PV.signup_bonus
      + c.annotations * PV.annotation
      + c.edits       * PV.edit_approved
      + c.comments    * PV.comment;
    const upvotePoints = Math.max(0, c.points - earnedSoFar);
    const upvoteEvents = Math.ceil(upvotePoints / PV.annotation_upvoted);

    for (let i = 0; i < upvoteEvents; i++) {
      const annId = annotationIds.length > 0 ? pick(annotationIds) : undefined;
      const createdAt = dateInRange(c.joinedIso, actEnd);
      await prisma.pointEvent.create({
        data: { userId: user.id, type: "annotation_upvoted", points: PV.annotation_upvoted, reason: "Annotation upvoted by community", refId: annId, createdAt },
      });
    }
    totalPoints += c.points;

    console.log(`  ✅ ${c.username.padEnd(28)} ${c.annotations} annot | ${c.edits} edits | ${c.comments} cmts | ${c.points.toLocaleString()} pts`);
  }

  console.log("\n══════════════════════════════════════════════════");
  console.log(`  Users created:      ${totalUsers}`);
  console.log(`  Annotations:        ${totalAnnotations}`);
  console.log(`  Edits (approved):   ${totalEdits}`);
  console.log(`  Comments:           ${totalComments}`);
  console.log(`  Points distributed: ${totalPoints.toLocaleString()}`);
  console.log("══════════════════════════════════════════════════\n");
}

main().catch(console.error).finally(() => prisma.$disconnect());
