import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CollabNetwork, { type GraphNode, type GraphLink } from "@/components/CollabNetwork";
import QuizButton from "@/components/QuizButton";

export const dynamic = "force-dynamic";

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
const PRODUCER_SPOTLIGHTS = [
  {
    slug: "teddy-park",
    name: "Teddy Park",
    groups: ["BLACKPINK"],
    role: "Chief Songwriter & Producer",
    note: "Produced every major BLACKPINK title track. LA-raised, Seoul-based architect of the YG × western hip-hop sound.",
    songs: ["DDU-DU DDU-DU", "Kill This Love", "How You Like That", "Pink Venom"],
  },
  {
    slug: "pharrell",
    name: "Pharrell Williams",
    groups: ["BTS"],
    role: "Producer & Collaborator",
    note: "Collaborated with J-Hope on 'On the Street' (2023). Pharrell's Neptunes-era funk DNA meets HYBE's idol production.",
    songs: ["On the Street (feat. J. Cole)"],
  },
  {
    slug: "nile-rodgers",
    name: "Nile Rodgers",
    groups: ["aespa"],
    role: "Guitar Producer",
    note: "Co-creator of CHIC. Brought signature disco-funk guitar stabs to aespa's 'Girls' — SM's most prestigious western collab.",
    songs: ["Girls"],
  },
  {
    slug: "maxx-song",
    name: "Maxx Song",
    groups: ["NewJeans"],
    role: "Songwriter & Producer",
    note: "Korean-American producer who co-crafted NewJeans' Y2K-minimalist sound. Primary architect of 'Attention' and 'Super Shy'.",
    songs: ["Attention", "Super Shy", "Hype Boy"],
  },
  {
    slug: "ryan-tedder",
    name: "Ryan Tedder",
    groups: ["BTS"],
    role: "Songwriter",
    note: "OneRepublic frontman and Grammy producer. Contributed to HYBE's international songwriter recruitment — part of the LA-Seoul pipeline.",
    songs: ["Life Goes On (co-write)"],
  },
  {
    slug: "diplo",
    name: "Diplo",
    groups: ["BLACKPINK"],
    role: "Producer",
    note: "Major Lazer founder, global bass music pioneer. Contributed production within YG's extended creative network.",
    songs: ["Extended collab credits"],
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

  // ── Role classification ───────────────────────────────────────────────
  const PRODUCTION_ROLES = new Set(["producer", "songwriter", "composer", "co-producer", "lyricist"]);

  // ── Build collaboration edges (role-aware) ────────────────────────────
  type EdgeData = {
    a: string; b: string; aSlug: string; bSlug: string;
    aImg: string | null; bImg: string | null;
    songs: string[]; aId: string; bId: string;
    linkType: "performance" | "production" | "mixed";
    aRoles: Set<string>; bRoles: Set<string>;
  };
  const edgeMap = new Map<string, EdgeData>();
  const artistSongCount = new Map<string, { name: string; slug: string; count: number; imageUrl: string | null; type: string; id: string; roles: Set<string> }>();

  for (const song of songs) {
    const credits = song.credits; // { artist, role }[]
    for (const c of credits) {
      const art = c.artist;
      if (!artistSongCount.has(art.id)) {
        artistSongCount.set(art.id, { name: art.stageName, slug: art.slug, count: 0, imageUrl: art.imageUrl, type: art.type, id: art.id, roles: new Set() });
      }
      const entry = artistSongCount.get(art.id)!;
      entry.count++;
      entry.roles.add(c.role);
    }

    for (let i = 0; i < credits.length; i++) {
      for (let j = i + 1; j < credits.length; j++) {
        const ca = credits[i]; const cb = credits[j];
        const a = ca.artist; const b = cb.artist;
        const key = [a.id, b.id].sort().join("--");

        const aIsProduction = PRODUCTION_ROLES.has(ca.role);
        const bIsProduction = PRODUCTION_ROLES.has(cb.role);
        const thisType: EdgeData["linkType"] = (aIsProduction || bIsProduction) ? "production" : "performance";

        if (!edgeMap.has(key)) {
          edgeMap.set(key, {
            a: a.stageName, b: b.stageName, aSlug: a.slug, bSlug: b.slug,
            aImg: a.imageUrl, bImg: b.imageUrl, songs: [],
            aId: a.id, bId: b.id, linkType: thisType,
            aRoles: new Set([ca.role]), bRoles: new Set([cb.role]),
          });
        } else {
          const edge = edgeMap.get(key)!;
          edge.aRoles.add(ca.role);
          edge.bRoles.add(cb.role);
          if (edge.linkType !== thisType) edge.linkType = "mixed";
        }
        edgeMap.get(key)!.songs.push(song.title);
      }
    }
  }

  const collabEdges = Array.from(edgeMap.values());
  const topArtists = Array.from(artistSongCount.values()).sort((a, b) => b.count - a.count).slice(0, 14);

  // ── Determine per-artist primary role ────────────────────────────────
  function artistNodeRole(roles: Set<string>): "producer" | "songwriter" | "performer" | "mixed" {
    const hasProduction = [...roles].some((r) => PRODUCTION_ROLES.has(r));
    const hasPerformance = [...roles].some((r) => !PRODUCTION_ROLES.has(r));
    if (hasProduction && hasPerformance) return "mixed";
    if (hasProduction) return [...roles].some((r) => r === "songwriter" || r === "lyricist") ? "songwriter" : "producer";
    return "performer";
  }

  // ── Build graph data for D3 ───────────────────────────────────────────
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
      nodeRole: artistNodeRole(a.roles),
    }));

  const graphLinks: GraphLink[] = collabEdges.map((e) => ({
    source: e.aId,
    target: e.bId,
    songs: e.songs,
    linkType: e.linkType,
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
          <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            Collaboration Map
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, margin: "0 0 12px" }}>How Artists Connect</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 600, fontSize: "0.95rem", lineHeight: 1.6 }}>
            An interactive web of every collaboration — K-pop artists connected to their western features, group members, and cross-cultural song credits.
            <span style={{ color: "var(--sakura)" }}> Lisa sits at the center</span> of the western collab network.
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
                <div className="section-header">Cross-Artist Song Credits</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {collabEdges.map((edge, i) => (
                    <div key={i} className="genius-card" style={{ padding: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <Link href={`/artists/${edge.aSlug}`} style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)", textDecoration: "none", display: "flex", alignItems: "center", gap: 7 }}>
                          {edge.aImg && <img src={edge.aImg} alt={edge.a} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />}
                          {edge.a}
                        </Link>
                        <span style={{ fontSize: "0.68rem", background: isWestern(edge.aSlug) || isWestern(edge.bSlug) ? "#e879f9" : "var(--genius-yellow)", color: "var(--on-accent)", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>
                          {isWestern(edge.aSlug) || isWestern(edge.bSlug) ? "CROSSOVER" : "COLLAB"}
                        </span>
                        <Link href={`/artists/${edge.bSlug}`} style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)", textDecoration: "none", display: "flex", alignItems: "center", gap: 7 }}>
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
              <div className="section-header">Group Rosters</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {memberEdges.map((g) => (
                  <div key={g.groupSlug} className="genius-card" style={{ padding: 18 }}>
                    <Link href={`/artists/${g.groupSlug}`} style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--ink)", textDecoration: "none", display: "block", marginBottom: 10 }}>
                      {g.groupName}
                    </Link>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {g.members.map((m) => (
                        <Link key={m.slug} href={`/artists/${m.slug}`} style={{ textDecoration: "none" }}>
                          <div style={{ background: "var(--surface)", border: "1px solid var(--genius-border)", borderRadius: 999, padding: "3px 10px", fontSize: "0.78rem" }}>
                            <span style={{ fontWeight: 600, color: "var(--ink)" }}>{m.name}</span>
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
              <div className="section-header">Producers Driving the Crossover</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {PRODUCER_SPOTLIGHTS.map((p) => (
                  <Link key={p.slug} href={`/artists/${p.slug}`} style={{ textDecoration: "none" }}>
                    <div className="genius-card" style={{ padding: 14, borderLeft: "3px solid #e879f9" }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--ink)" }}>{p.name}</span>
                        <span style={{ background: "#e879f9", color: "#fff", fontSize: "0.62rem", fontWeight: 700, padding: "2px 7px", borderRadius: 999, whiteSpace: "nowrap" }}>
                          {p.role.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginBottom: 4 }}>
                        → {p.groups.join(", ")}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--ink-dim)", lineHeight: 1.55 }}>{p.note}</div>
                      <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {p.songs.map((s) => (
                          <span key={s} style={{ background: "var(--surface)", fontSize: "0.65rem", padding: "1px 7px", borderRadius: 999, color: "var(--ink-dim)" }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="section-header">Most Connected Artists</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {topArtists.map((a, i) => (
                <Link key={a.slug} href={`/artists/${a.slug}`} style={{ textDecoration: "none" }}>
                  <div className="genius-card" style={{ padding: "11px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: i < 3 ? "var(--genius-yellow)" : "#f0f0f0", color: "var(--on-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.72rem", flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    {a.imageUrl && (
                      <img src={a.imageUrl} alt={a.name} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid var(--border)" }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--genius-gray)" }}>
                        {a.count} credit{a.count !== 1 ? "s" : ""}
                        {isWestern(a.slug) && <span style={{ marginLeft: 4, color: "#e879f9", fontWeight: 700 }}>· western</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <div className="section-header">Crossover Hotspots</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "🇺🇸 US Market", desc: "Lisa, BLACKPINK, BTS", color: "#FFFF64" },
                  { label: "🇧🇷 Brazil", desc: "ATEEZ, Stray Kids, BTS", color: "#ACFA52" },
                  { label: "🇲🇽 Mexico", desc: "BLACKPINK, TWICE, BTS", color: "#fb923c" },
                  { label: "🇪🇺 Europe", desc: "BTS, BLACKPINK, Rosalía×Lisa", color: "#e879f9" },
                ].map(({ label, desc, color }) => (
                  <div key={label} className="genius-card" style={{ padding: "10px 14px", borderLeft: `3px solid ${color}` }}>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--ink)" }}>{label}</div>
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
            Stan Mode: Activated
          </div>
          <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.8rem", margin: "0 0 12px" }}>
            Think you know your collabs?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", lineHeight: 1.6, margin: "0 0 28px" }}>
            Put your knowledge to the test — artist history, lyrics challenges, mukbang moments, and more.
          </p>
          <QuizButton />
        </div>
      </section>
    </main>
  );
}
