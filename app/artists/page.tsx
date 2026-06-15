import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 3600;

export default async function ArtistsPage() {
  const [groups, soloists, collabs] = await Promise.all([
    prisma.artist.findMany({
      where: { type: "GROUP" },
      include: {
        label: true,
        groupOf: true,
        albums: { include: { songs: true }, orderBy: { releaseYear: "desc" } },
      },
      orderBy: { stageName: "asc" },
    }),
    prisma.artist.findMany({
      where: { type: "SOLOIST" },
      include: {
        label: true,
        albums: { include: { songs: true }, orderBy: { releaseYear: "desc" } },
        memberships: { include: { group: true } },
      },
      orderBy: { stageName: "asc" },
    }),
    prisma.artist.findMany({
      where: { type: "COLLAB" },
      include: {
        albums: { include: { songs: true }, orderBy: { releaseYear: "desc" } },
        songs: {
          include: { song: { include: { album: { include: { artist: true } } } } },
          take: 5,
          orderBy: { song: { viewCount: "desc" } },
        },
      },
      orderBy: { stageName: "asc" },
    }),
  ]);

  const totalSongs = (a: { albums: { songs: unknown[] }[] }) =>
    a.albums.reduce((n, al) => n + al.songs.length, 0);

  const total = groups.length + soloists.length + collabs.length;

  return (
    <main>
      <section style={{ background: "#000", color: "#fff", padding: "60px 24px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            Artist Directory
          </div>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 800, margin: "0 0 12px" }}>Artists</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem" }}>
            {total} artists &middot; {groups.length} K-pop groups &middot; {soloists.length} soloists &middot; {collabs.length} western collaborators
          </p>
          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <Link href="/collabs" style={{ background: "var(--genius-yellow)", color: "#000", fontWeight: 700, fontSize: "0.78rem", padding: "8px 18px", borderRadius: 4, textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Collab Network
            </Link>
            <Link href="/korean-slang" style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: "0.78rem", padding: "8px 18px", borderRadius: 4, textDecoration: "none" }}>
              K-pop Dictionary
            </Link>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>

        {/* Groups */}
        <section style={{ marginBottom: 56 }}>
          <div className="section-header">K-pop Groups</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {groups.map((group) => (
              <Link key={group.id} href={`/artists/${group.slug}`} style={{ textDecoration: "none" }}>
                <div className="genius-card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    {group.imageUrl ? (
                      <img src={group.imageUrl} alt={group.stageName} style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: 8, background: "linear-gradient(135deg, #1a1a2e, #0f3460)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0 }}>
                        🎤
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#ff6fa8" }}>{group.stageName}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--genius-gray)", marginTop: 3 }}>
                        {group.label?.name} &middot; Debut {group.debutYear}
                      </div>
                      <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: "0.75rem", color: "var(--genius-gray)" }}>
                        <span>{group.groupOf.length} members</span>
                        <span>{group.albums.length} albums</span>
                        <span>{totalSongs(group)} songs</span>
                      </div>
                    </div>
                  </div>
                  {group.albums[0] && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--genius-border)", fontSize: "0.78rem", color: "var(--genius-gray)" }}>
                      Latest: <span style={{ color: "#ff6fa8", fontWeight: 600 }}>{group.albums[0].title}</span> ({group.albums[0].releaseYear})
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Soloists */}
        {soloists.length > 0 && (
          <section style={{ marginBottom: 56 }}>
            <div className="section-header">Solo Artists</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {soloists.map((artist) => (
                <Link key={artist.id} href={`/artists/${artist.slug}`} style={{ textDecoration: "none" }}>
                  <div className="genius-card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      {artist.imageUrl ? (
                        <img src={artist.imageUrl} alt={artist.stageName} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #1a1a2e, #0f3460)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0 }}>
                          ⭐
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#ff6fa8" }}>{artist.stageName}</div>
                        {artist.realName && (
                          <div style={{ fontSize: "0.78rem", color: "var(--genius-gray)", marginTop: 2 }}>{artist.realName}</div>
                        )}
                        <div style={{ fontSize: "0.78rem", color: "var(--genius-gray)", marginTop: 3 }}>
                          {artist.label?.name} &middot; Debut {artist.debutYear}
                        </div>
                        {artist.memberships.length > 0 && (
                          <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginTop: 4 }}>
                            Also in: {artist.memberships.map((m) => m.group.stageName).join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                    {artist.albums[0] && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--genius-border)", fontSize: "0.78rem", color: "var(--genius-gray)" }}>
                        Latest: <span style={{ color: "#ff6fa8", fontWeight: 600 }}>{artist.albums[0].title}</span> ({artist.albums[0].releaseYear})
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Western Artists & Collaborators */}
        {collabs.length > 0 && (
          <section>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
              <div className="section-header" style={{ margin: 0 }}>Western Artists &amp; Collaborators</div>
              <span style={{ fontSize: "0.65rem", background: "#e879f9", color: "#000", padding: "2px 8px", borderRadius: 999, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                CROSSOVER
              </span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--genius-gray)", marginBottom: 20, lineHeight: 1.5 }}>
              Western artists who have crossed into the K-pop cultural sphere through collaborations, features, and co-writes.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {collabs.map((artist) => {
                const kpopCollabs = artist.songs
                  .map((c) => c.song.album?.artist?.stageName)
                  .filter((v): v is string => Boolean(v))
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .slice(0, 3);
                return (
                  <Link key={artist.id} href={`/artists/${artist.slug}`} style={{ textDecoration: "none" }}>
                    <div className="genius-card" style={{ padding: 20, borderTop: "3px solid #e879f9" }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                        {artist.imageUrl ? (
                          <img src={artist.imageUrl} alt={artist.stageName} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #e879f9" }} />
                        ) : (
                          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #581c87, #1a1a2e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", flexShrink: 0 }}>
                            🌍
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#ff6fa8" }}>{artist.stageName}</div>
                          {artist.realName && (
                            <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", marginTop: 1 }}>{artist.realName}</div>
                          )}
                          <div style={{ fontSize: "0.75rem", color: "#e879f9", fontWeight: 700, marginTop: 4 }}>
                            {totalSongs(artist)} crossover track{totalSongs(artist) !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                      {kpopCollabs.length > 0 && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--genius-border)", fontSize: "0.75rem", color: "var(--genius-gray)" }}>
                          Collaborated with: <span style={{ color: "#ff6fa8", fontWeight: 600 }}>{kpopCollabs.join(", ")}</span>
                        </div>
                      )}
                      {artist.albums[0] && kpopCollabs.length === 0 && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--genius-border)", fontSize: "0.75rem", color: "var(--genius-gray)" }}>
                          Latest: <span style={{ color: "#ff6fa8", fontWeight: 600 }}>{artist.albums[0].title}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
