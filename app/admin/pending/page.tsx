import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/permissions";
import ReviewButtons from "@/components/ReviewButtons";

export const dynamic = "force-dynamic";

export default async function AdminPendingPage() {
  const session = await getSession();
  if (!session || !canAccessAdmin(session.user)) redirect("/");

  const pendingEdits = await prisma.suggestedEdit.findMany({
    where: { status: "pending" },
    include: { user: { select: { id: true, displayName: true, email: true } } },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  // Resolve entity names without N+1
  const artistIds = pendingEdits.filter((e) => e.entityType === "artist").map((e) => e.entityId);
  const songIds   = pendingEdits.filter((e) => e.entityType === "song").map((e) => e.entityId);
  const albumIds  = pendingEdits.filter((e) => e.entityType === "album").map((e) => e.entityId);

  const [artists, songs, albums] = await Promise.all([
    artistIds.length ? prisma.artist.findMany({ where: { id: { in: artistIds } }, select: { id: true, stageName: true, slug: true } }) : [],
    songIds.length   ? prisma.song.findMany  ({ where: { id: { in: songIds   } }, select: { id: true, title: true,     slug: true } }) : [],
    albumIds.length  ? prisma.album.findMany ({ where: { id: { in: albumIds  } }, select: { id: true, title: true,     slug: true } }) : [],
  ]);

  const nameMap = new Map<string, { name: string; slug: string }>();
  artists.forEach((a) => nameMap.set(a.id, { name: a.stageName, slug: `/artists/${a.slug}` }));
  songs.forEach  ((s) => nameMap.set(s.id, { name: s.title,     slug: `/songs/${s.slug}` }));
  albums.forEach ((a) => nameMap.set(a.id, { name: a.title,     slug: "#" }));

  const label = (u: { displayName: string | null; email: string }) =>
    u.displayName ?? u.email.split("@")[0];

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--genius-gray)", textTransform: "uppercase" }}>
            Admin
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900, margin: 0 }}>
            Pending Suggestions
          </h1>
        </div>
        <span style={{ marginLeft: "auto", background: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: "0.78rem", padding: "4px 12px", borderRadius: 20 }}>
          {pendingEdits.length} pending
        </span>
      </div>

      {pendingEdits.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--genius-gray)" }}>
          No pending suggestions — all caught up ✓
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pendingEdits.map((edit) => {
            const entity = nameMap.get(edit.entityId);
            return (
              <div key={edit.id} className="genius-card" style={{ padding: "16px 20px" }}>
                {/* Header row */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, background: "#f3f4f6", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>
                    {edit.entityType}
                  </span>
                  {entity ? (
                    <a href={entity.slug} style={{ fontSize: "0.85rem", fontWeight: 700, color: "#000", textDecoration: "none" }}>
                      {entity.name}
                    </a>
                  ) : (
                    <span style={{ fontSize: "0.85rem", color: "var(--genius-gray)" }}>{edit.entityId}</span>
                  )}
                  <span style={{ fontSize: "0.78rem", color: "var(--genius-gray)" }}>
                    field: <strong>{edit.field}</strong>
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "var(--genius-gray)" }}>
                    {label(edit.user)} · {fmtDate(edit.createdAt)}
                  </span>
                </div>

                {/* Values */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12, fontSize: "0.82rem" }}>
                  <div>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--genius-gray)", marginBottom: 4 }}>CURRENT</div>
                    <div style={{ fontFamily: "monospace", background: "#f8f8f8", padding: "6px 10px", borderRadius: 4, whiteSpace: "pre-wrap", maxHeight: 80, overflow: "hidden" }}>
                      {edit.currentVal?.slice(0, 200) ?? <em style={{ color: "var(--genius-gray)" }}>empty</em>}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#16a34a", marginBottom: 4 }}>SUGGESTED</div>
                    <div style={{ fontFamily: "monospace", background: "#f0fdf4", padding: "6px 10px", borderRadius: 4, whiteSpace: "pre-wrap", maxHeight: 80, overflow: "hidden" }}>
                      {edit.suggestedVal.slice(0, 200)}
                    </div>
                  </div>
                </div>

                {edit.reason && (
                  <div style={{ fontSize: "0.75rem", color: "var(--genius-gray)", fontStyle: "italic", marginBottom: 10 }}>
                    "{edit.reason}"
                  </div>
                )}

                <ReviewButtons editId={edit.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
