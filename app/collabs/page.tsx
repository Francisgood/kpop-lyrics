import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CollabNetwork, { type GraphNode, type GraphLink } from "@/components/CollabNetwork";
import QuizButton from "@/components/QuizButton";

export const revalidate = 1800;

// Known western markets — artists with slug containing these are "western"
const WESTERN_SLUGS = new Set([
  "doja-cat","raye","future","megan-thee-stallion","tyla","rosalia",
  "lady-gaga","selena-gomez","cardi-b","charlie-puth","halsey","ed-sheeran",
  "the-weeknd","billie-eilish","ariana-grande","taylor-swift","nicki-minaj",
  "lizzo","coldplay","travis-scott","post-malone","olivia-rodrigo",
  "demi-lovato","marshmello","nile-rodgers","pharrell","j-balvin",
  "gunna","skillibeng","070-shake","sza",
]);

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
          <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            Collaboration Map
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, margin: "0 0 12px" }}>How Artists Connect</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 600, fontSize: "0.95rem", lineHeight: 1.6 }}>
            An interactive web of every collaboration — K-pop artists connected to their western features, group members, and cross-cultural song credits.
            <span style={{ color: "#FFFF64" }}> Lisa sits at the center</span> of the western collab network.
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
                        <Link href={`/artists/${edge.aSlug}`} style={{ fontWeight: 700, fontSize: "0.9rem", color: "#000", textDecoration: "none", display: "flex", alignItems: "center", gap: 7 }}>
                          {edge.aImg && <img src={edge.aImg} alt={edge.a} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />}
                          {edge.a}
                        </Link>
                        <span style={{ fontSize: "0.68rem", background: isWestern(edge.aSlug) || isWestern(edge.bSlug) ? "#e879f9" : "var(--genius-yellow)", color: "#000", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>
                          {isWestern(edge.aSlug) || isWestern(edge.bSlug) ? "CROSSOVER" : "COLLAB"}
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
              <div className="section-header">Group Rosters</div>
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
            <div className="section-header">Most Connected Artists</div>
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
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#000" }}>{label}</div>
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
