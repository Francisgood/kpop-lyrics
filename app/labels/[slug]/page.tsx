import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 3600;

export default async function LabelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const label = await prisma.label.findUnique({
    where: { slug },
    include: {
      artists: {
        orderBy: { stageName: "asc" },
        include: { albums: { include: { songs: true } } },
      },
    },
  });

  if (!label) notFound();

  const groups = label.artists.filter((a) => a.type === "GROUP");
  const soloists = label.artists.filter((a) => a.type === "SOLOIST");

  return (
    <main>
      {/* Label Hero */}
      <section style={{ background: "#000", color: "#fff", padding: "60px 24px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Aegyo Arena</Link> / Labels / {label.name}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--genius-yellow)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>
            Record Label
          </div>
          <h1 style={{ fontSize: "3rem", fontWeight: 800, margin: "0 0 12px", color: "#fff" }}>{label.name}</h1>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
            {label.country} &middot; Founded {label.foundedYear}
          </div>
          {label.bio && (
            <p style={{ marginTop: 20, color: "rgba(255,255,255,0.7)", maxWidth: 600, lineHeight: 1.7 }}>
              {label.bio}
            </p>
          )}
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        {groups.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div className="section-header">Groups</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {groups.map((group) => (
                <Link key={group.id} href={`/artists/${group.slug}`} style={{ textDecoration: "none" }}>
                  <div className="genius-card" style={{ padding: 20, textAlign: "center" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>🎤</div>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "#000" }}>{group.stageName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--genius-gray)", marginTop: 4 }}>
                      Debut {group.debutYear}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--genius-gray)", marginTop: 2 }}>
                      {group.albums.length} album{group.albums.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {soloists.length > 0 && (
          <section>
            <div className="section-header">Solo Artists</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {soloists.map((artist) => (
                <Link key={artist.id} href={`/artists/${artist.slug}`} style={{ textDecoration: "none" }}>
                  <div className="genius-card" style={{ padding: 20, textAlign: "center" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>⭐</div>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "#000" }}>{artist.stageName}</div>
                    {artist.realName && (
                      <div style={{ fontSize: "0.75rem", color: "var(--genius-gray)", marginTop: 4 }}>{artist.realName}</div>
                    )}
                    <div style={{ fontSize: "0.75rem", color: "var(--genius-gray)", marginTop: 2 }}>
                      Debut {artist.debutYear}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
