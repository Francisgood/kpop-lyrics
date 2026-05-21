import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export const revalidate = 300;

export default async function ContributorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // slug is the user ID
  const [profileUser, session] = await Promise.all([
    prisma.user.findUnique({
      where: { id: slug },
      include: {
        comments: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        suggestedEdits: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        favorites: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    }),
    getSession(),
  ]);

  if (!profileUser) notFound();

  const isOwn = session?.userId === profileUser.id;
  const displayName = profileUser.displayName ?? profileUser.email.split("@")[0];
  const joinDate = new Date(profileUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <main>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)", color: "#fff", padding: "60px 24px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Aegyo Arena</Link>
            {" / Contributors / "}
            {displayName}
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--genius-yellow)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "2rem", color: "#000", flexShrink: 0 }}>
              {displayName[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 6px" }}>{displayName}</h1>
              <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)" }}>
                Fan since {joinDate}
                {isOwn && <span style={{ marginLeft: 12, color: "var(--genius-yellow)", fontWeight: 700 }}>· This is you</span>}
              </div>
              {profileUser.bio && (
                <div style={{ marginTop: 10, color: "rgba(255,255,255,0.75)", maxWidth: 500, fontSize: "0.9rem", lineHeight: 1.6 }}>
                  {profileUser.bio}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 24, marginTop: 24, flexWrap: "wrap" }}>
            {[
              { label: "Comments", value: profileUser.comments.length },
              { label: "Edits Suggested", value: profileUser.suggestedEdits.length },
              { label: "Favorites", value: profileUser.favorites.length },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--genius-yellow)" }}>{value}</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <div className="responsive-sidebar-grid">
          <div>
            {/* Recent Comments */}
            {profileUser.comments.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <div className="section-header">Recent Comments</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {profileUser.comments.map((c) => (
                    <div key={c.id} className="genius-card" style={{ padding: 16 }}>
                      <div style={{ fontSize: "0.82rem", color: "#333", lineHeight: 1.65 }}>{c.body}</div>
                      <div style={{ marginTop: 6, fontSize: "0.72rem", color: "var(--genius-gray)" }}>
                        on {c.entityType} · {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Suggested Edits */}
            {profileUser.suggestedEdits.length > 0 && (
              <section>
                <div className="section-header">Suggested Edits</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {profileUser.suggestedEdits.map((e) => (
                    <div key={e.id} className="genius-card" style={{ padding: 16 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                        <span style={{
                          background: e.status === "approved" ? "#dcfce7" : e.status === "rejected" ? "#fee2e2" : "#fef9c3",
                          color: e.status === "approved" ? "#166534" : e.status === "rejected" ? "#991b1b" : "#854d0e",
                          fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, textTransform: "uppercase"
                        }}>
                          {e.status}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "var(--genius-gray)" }}>{e.entityType} · {e.field}</span>
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#333" }}>{e.suggestedVal.slice(0, 120)}{e.suggestedVal.length > 120 ? "…" : ""}</div>
                      {e.reason && <div style={{ marginTop: 4, fontSize: "0.75rem", color: "var(--genius-gray)", fontStyle: "italic" }}>{e.reason}</div>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {profileUser.comments.length === 0 && profileUser.suggestedEdits.length === 0 && (
              <div style={{ color: "var(--genius-gray)", fontSize: "0.9rem" }}>
                No public activity yet.
                {isOwn && (
                  <> <Link href="/artists" style={{ color: "#000", fontWeight: 700, textDecoration: "none" }}>Browse artists</Link> and leave a comment to get started!</>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            {/* Favorites */}
            {profileUser.favorites.length > 0 && (
              <div>
                <div className="section-header">Favorites</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {profileUser.favorites.slice(0, 12).map((f) => (
                    <div key={f.id} className="genius-card" style={{ padding: "10px 14px" }}>
                      <div style={{ fontSize: "0.72rem", color: "var(--genius-gray)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{f.entityType}</div>
                      <div style={{ fontSize: "0.82rem", color: "#000", fontWeight: 600 }}>{f.entityId.slice(0, 20)}…</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
