import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CollabNetwork, { type GraphNode, type GraphLink } from "@/components/CollabNetwork";
import QuizButton from "@/components/QuizButton";
import { T, LangToggle } from "@/components/LangProvider";

export const revalidate = 1800;

// Known western markets — artists with slug containing these are "western"
const WESTERN_SLUGS = new Set([
  "doja-cat","raye","future","megan-thee-stallion","tyla","rosalia",
  "lady-gaga","selena-gomez","cardi-b","charlie-puth","halsey","ed-sheeran",
  "the-weeknd","billie-eilish","ariana-grande","taylor-swift","nicki-minaj",
  "lizzo","coldplay","travis-scott","post-malone","olivia-rodrigo",
  "demi-lovato","marshmello","nile-rodgers","pharrell","j-balvin",
  "gunna","skillibeng","070-shake","sza",
  "teddy-park","ryan-tedder","diplo","maxx-song","250-producer",
  "danny-chung","tobias-jesso-jr","slushii",
]);

// Key cross-cultural producers — spotlight these explicitly
// `songsEs` only exists where an entry is descriptive copy rather than a real
// song title; real titles fall back to the English array.
const PRODUCER_SPOTLIGHTS: {
  slug: string;
  name: string;
  groups: string[];
  role: string;
  roleEs: string;
  note: string;
  noteEs: string;
  songs: string[];
  songsEs?: string[];
}[] = [
  {
    slug: "teddy-park",
    name: "Teddy Park",
    groups: ["BLACKPINK"],
    role: "Chief Songwriter & Producer",
    roleEs: "Compositor Principal y Productor",
    note: "Produced every major BLACKPINK title track. LA-raised, Seoul-based architect of the YG × western hip-hop sound.",
    noteEs: "Produjo todos los title tracks importantes de BLACKPINK. Criado en LA y radicado en Seoul, es el arquitecto del sonido YG × hip-hop occidental.",
    songs: ["DDU-DU DDU-DU", "Kill This Love", "How You Like That", "Pink Venom"],
  },
  {
    slug: "pharrell",
    name: "Pharrell Williams",
    groups: ["BTS"],
    role: "Producer & Collaborator",
    roleEs: "Productor y Colaborador",
    note: "Collaborated with J-Hope on 'On the Street' (2023). Pharrell's Neptunes-era funk DNA meets HYBE's idol production.",
    noteEs: "Colaboró con J-Hope en 'On the Street' (2023). El ADN funk de la era Neptunes de Pharrell se encuentra con la producción idol de HYBE.",
    songs: ["On the Street (feat. J. Cole)"],
  },
  {
    slug: "nile-rodgers",
    name: "Nile Rodgers",
    groups: ["aespa"],
    role: "Guitar Producer",
    roleEs: "Productor de Guitarra",
    note: "Co-creator of CHIC. Brought signature disco-funk guitar stabs to aespa's 'Girls' — SM's most prestigious western collab.",
    noteEs: "Cocreador de CHIC. Llevó sus icónicos acordes disco-funk a 'Girls' de aespa, la colab occidental más prestigiosa de SM.",
    songs: ["Girls"],
  },
  {
    slug: "maxx-song",
    name: "Maxx Song",
    groups: ["NewJeans"],
    role: "Songwriter & Producer",
    roleEs: "Compositor y Productor",
    note: "Korean-American producer who co-crafted NewJeans' Y2K-minimalist sound. Primary architect of 'Attention' and 'Super Shy'.",
    noteEs: "Productor coreano-estadounidense que ayudó a crear el sonido Y2K minimalista de NewJeans. Arquitecto principal de 'Attention' y 'Super Shy'.",
    songs: ["Attention", "Super Shy", "Hype Boy"],
  },
  {
    slug: "ryan-tedder",
    name: "Ryan Tedder",
    groups: ["BTS"],
    role: "Songwriter",
    roleEs: "Compositor",
    note: "OneRepublic frontman and Grammy producer. Contributed to HYBE's international songwriter recruitment — part of the LA-Seoul pipeline.",
    noteEs: "Vocalista de OneRepublic y productor ganador del Grammy. Participó en el reclutamiento internacional de compositores de HYBE, parte del pipeline LA-Seoul.",
    songs: ["Life Goes On (co-write)"],
  },
  {
    slug: "diplo",
    name: "Diplo",
    groups: ["BLACKPINK"],
    role: "Producer",
    roleEs: "Productor",
    note: "Major Lazer founder, global bass music pioneer. Contributed production within YG's extended creative network.",
    noteEs: "Fundador de Major Lazer y pionero global del bass music. Aportó producción dentro de la red creativa extendida de YG.",
    songs: ["Extended collab credits"],
    songsEs: ["Créditos de colab extendidos"],
  },
];

function isWestern(slug: string) {
  return WESTERN_SLUGS.has(slug) || WESTERN_SLUGS.has(slug.replace(/-\d+$/, ""));
}

export default async function CollabsPage() {
  const [songs, memberships, allArtists] = await Promise.all([
    prisma.song.findMany({
      include: {
        credits: { include: { artist: true } },
        album: { include: { artist: true } },
      },
    }),
    prisma.groupMembership.findMany({
      include: { group: true, member: true },
    }),
    prisma.artist.findMany({ select: { id: true, slug: true, stageName: true, type: true, imageUrl: true } }),
  ]);

  // ── Build collaboration edges ─────────────────────────────────────────
  type EdgeData = { a: string; b: string; aSlug: string; bSlug: string; aImg: string | null; bImg: string | null; songs: string[]; aId: string; bId: string };
  const edgeMap = new Map<string, EdgeData>();
  const artistSongCount = new Map<string, { name: string; slug: string; count: number; imageUrl: string | null; type: string; id: string }>();

  for (const song of songs) {
    const credited = song.credits.map((c) => c.artist);
    for (const art of credited) {
      if (!artistSongCount.has(art.id)) {
        artistSongCount.set(art.id, { name: art.stageName, slug: art.slug, count: 0, imageUrl: art.imageUrl, type: art.type, id: art.id });
      }
      artistSongCount.get(art.id)!.count++;
    }
    for (let i = 0; i < credited.length; i++) {
      for (let j = i + 1; j < credited.length; j++) {
        const a = credited[i]; const b = credited[j];
        const key = [a.id, b.id].sort().join("--");
        if (!edgeMap.has(key)) {
          edgeMap.set(key, { a: a.stageName, b: b.stageName, aSlug: a.slug, bSlug: b.slug, aImg: a.imageUrl, bImg: b.imageUrl, songs: [], aId: a.id, bId: b.id });
        }
        edgeMap.get(key)!.songs.push(song.title);
      }
    }
  }

  const collabEdges = Array.from(edgeMap.values());
  const topArtists = Array.from(artistSongCount.values()).sort((a, b) => b.count - a.count).slice(0, 14);

  // ── Build graph data for D3 ───────────────────────────────────────────
  // Only include artists that appear in at least one collab edge
  const connectedIds = new Set<string>();
  for (const e of collabEdges) { connectedIds.add(e.aId); connectedIds.add(e.bId); }

  const graphNodes: GraphNode[] = Array.from(artistSongCount.values())
    .filter((a) => connectedIds.has(a.id))
    .map((a) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      type: a.type,
      imageUrl: a.imageUrl,
      songCount: a.count,
      region: isWestern(a.slug) ? "western" : "kpop",
    }));

  const graphLinks: GraphLink[] = collabEdges.map((e) => ({
    source: e.aId,
    target: e.bId,
    songs: e.songs,
  }));

  // Find Lisa's ID for center positioning
  const lisaNode = graphNodes.find((n) => n.slug === "lisa");

  // Group memberships for the roster section
  const groupMap = new Map<string, { groupName: string; groupSlug: string; members: { name: string; slug: string; role: string | null }[] }>();
  for (const m of memberships) {
    if (!groupMap.has(m.groupId)) {
      groupMap.set(m.groupId, { groupName: m.group.stageName, groupSlug: m.group.slug, members: [] });
    }
    groupMap.get(m.groupId)!.members.push({ name: m.member.stageName, slug: m.member.slug, role: m.role });
  }
  const memberEdges = Array.from(groupMap.values());

  return (
    <main>
      <section style={{ background: "#000", color: "#fff", padding: "60px 24px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <LangToggle align="flex-start" marginBottom={16} />
          <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            <T en="Collaboration Map" es="Mapa de Colaboraciones" />
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, margin: "0 0 12px" }}>
            <T en="How Artists Connect" es="Cómo se Conectan los Artistas" />
          </h1>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 600, fontSize: "0.95rem", lineHeight: 1.6 }}>
            <T
              en="An interactive web of every collaboration — K-pop artists connected to their western features, group members, and cross-cultural song credits."
              es="Una red interactiva de cada colaboración: artistas de K-pop conectados con sus featurings occidentales, miembros de grupo y créditos de canciones interculturales."
            />
            <span style={{ color: "#FFFF64" }}>
              {" "}
              <T en="Lisa sits at the center" es="Lisa está en el centro" />
            </span>{" "}
            <T en="of the western collab network." es="de la red de colabs occidentales." />
          </p>
        </div>
      </section>

      {/* ── Network Graph ── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px 0" }}>
        {graphNodes.length > 0 && (
          <CollabNetwork
            nodes={graphNodes}
            links={graphLinks}
            centerId={lisaNode?.id}
          />
        )}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <div className="responsive-sidebar-grid">
          <div>
            {/* Song Collaborations list */}
            {collabEdges.length > 0 && (
              <section style={{ marginBottom: 48 }}>
                <div className="section-header"><T en="Cross-Artist Song Credits" es="Créditos de Canciones entre Artistas" /></div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {collabEdges.map((edge, i) => (
                    <div key={i} className="genius-card" style={{ padding: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <Link href={`/artists/${edge.aSlug}`} style={{ fontWeight: 700, fontSize: "0.9rem", color: "#000", textDecoration: "none", display: "flex", alignItems: "center", gap: 7 }}>
                          {edge.aImg && <img src={edge.aImg} alt={edge.a} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />}
                          {edge.a}
                        </Link>
                        <span style={{ fontSize: "0.68rem", background: isWestern(edge.aSlug) || isWestern(edge.bSlug) ? "#e879f9" : "var(--genius-yellow)", color: "#000", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>
                          {isWestern(edge.aSlug) || isWestern(edge.bSlug) ? "CROSSOVER" : <T en="COLLAB" es="COLAB" />}
                        </span>
                        <Link href={`/artists/${edge.bSlug}`} style={{ fontWeight: 700, fontSize: "0.9rem", color: "#000", textDecoration: "none", display: "flex", alignItems: "center", gap: 7 }}>
                          {edge.bImg && <img src={edge.bImg} alt={edge.b} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />}
                          {edge.b}
                        </Link>
                      </div>
                      <div style={{ marginTop: 6, fontSize: "0.78rem", color: "var(--genius-gray)", fontStyle: "italic" }}>
                        {edge.songs.join(", ")}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Group Rosters */}
            <section>
              <div className="section-header"><T en="Group Rosters" es="Integrantes de los Grupos" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {memberEdges.map((g) => (
                  <div key={g.groupSlug} className="genius-card" style={{ padding: 18 }}>
                    <Link href={`/artists/${g.groupSlug}`} style={{ fontWeight: 800, fontSize: "0.95rem", color: "#000", textDecoration: "none", display: "block", marginBottom: 10 }}>
                      {g.groupName}
                    </Link>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {g.members.map((m) => (
                        <Link key={m.slug} href={`/artists/${m.slug}`} style={{ textDecoration: "none" }}>
                          <div style={{ background: "#f8f8f8", border: "1px solid var(--genius-border)", borderRadius: 999, padding: "3px 10px", fontSize: "0.78rem" }}>
                            <span style={{ fontWeight: 600, color: "#000" }}>{m.name}</span>
                            {m.role && <span style={{ color: "var(--genius-gray)", marginLeft: 3 }}>· {m.role}</span>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside>
            {/* Producer Spotlight */}
            <div style={{ marginBottom: 28 }}>
              <div className="section-header"><T en="Producers Driving the Crossover" es="Productores que Impulsan el Crossover" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {PRODUCER_SPOTLIGHTS.map((p) => (
                  <Link key={p.slug} href={`/artists/${p.slug}`} style={{ textDecoration: "none" }}>
                    <div className="genius-card" style={{ padding: 14, borderLeft: "3px solid #e879f9" }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#000" }}>{p.name}</span>
                        <span style={{ background: "#e879f9", color: "#fff", fontSize: "0.62rem", fontWeight: 700, padding: "2px 7px", borderRadius: 999, whiteSpace: "nowrap" }}>
                          <T en={p.role.toUpperCase()} es={p.roleEs.toUpperCase()} />
                        </span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginBottom: 4 }}>
                        → {p.groups.join(", ")}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#444", lineHeight: 1.55 }}>
                        <T en={p.note} es={p.noteEs} />
                      </div>
                      <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {p.songs.map((s, i) => (
                          <span key={s} style={{ background: "#f0f0f0", fontSize: "0.65rem", padding: "1px 7px", borderRadius: 999, color: "#555" }}>
                            <T en={s} es={p.songsEs?.[i] ?? s} />
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="section-header"><T en="Most Connected Artists" es="Artistas Más Conectados" /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {topArtists.map((a, i) => (
                <Link key={a.slug} href={`/artists/${a.slug}`} style={{ textDecoration: "none" }}>
                  <div className="genius-card" style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: i < 3 ? "var(--genius-yellow)" : "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.72rem", flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    {a.imageUrl && (
                      <img src={a.imageUrl} alt={a.name} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #eee" }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--genius-gray)" }}>
                        <T
                          en={`${a.count} credit${a.count !== 1 ? "s" : ""}`}
                          es={`${a.count} crédito${a.count !== 1 ? "s" : ""}`}
                        />
                        {isWestern(a.slug) && (
                          <span style={{ marginLeft: 4, color: "#e879f9", fontWeight: 700 }}>
                            · <T en="western" es="occidental" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <div className="section-header"><T en="Crossover Hotspots" es="Focos del Crossover" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "🇺🇸 US Market", labelEs: "🇺🇸 Mercado de EE.UU.", desc: "Lisa, BLACKPINK, BTS", color: "#FFFF64" },
                  { label: "🇧🇷 Brazil", labelEs: "🇧🇷 Brasil", desc: "ATEEZ, Stray Kids, BTS", color: "#ACFA52" },
                  { label: "🇲🇽 Mexico", labelEs: "🇲🇽 México", desc: "BLACKPINK, TWICE, BTS", color: "#fb923c" },
                  { label: "🇪🇺 Europe", labelEs: "🇪🇺 Europa", desc: "BTS, BLACKPINK, Rosalía×Lisa", color: "#e879f9" },
                ].map(({ label, labelEs, desc, color }) => (
                  <div key={label} className="genius-card" style={{ padding: "10px 14px", borderLeft: `3px solid ${color}` }}>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#000" }}><T en={label} es={labelEs} /></div>
                    <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
      {/* Quiz CTA */}
      <section style={{ background: "#000", padding: "56px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 12 }}>
            <T en="Stan Mode: Activated" es="Modo Stan: Activado" />
          </div>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.8rem", margin: "0 0 12px" }}>
            <T en="Think you know your collabs?" es="¿Crees que te sabes todas las colabs?" />
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", lineHeight: 1.6, margin: "0 0 28px" }}>
            <T
              en="Put your knowledge to the test — artist history, lyrics challenges, mukbang moments, and more."
              es="Pon a prueba tus conocimientos: historia de los artistas, retos de letras, momentos mukbang y más."
            />
          </p>
          <QuizButton />
        </div>
      </section>
    </main>
  );
}
