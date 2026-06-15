import { prisma } from "@/lib/prisma";
import type { PermUser } from "@/lib/permissions";
import ReviewButtons from "./ReviewButtons";

interface Props {
  entityType: string;
  entityId: string;
  currentUser: PermUser;
}

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: "PENDING",  color: "#92400e", bg: "#fef3c7" },
  approved: { label: "APPROVED", color: "#14532d", bg: "#dcfce7" },
  rejected: { label: "REJECTED", color: "#7f1d1d", bg: "#fee2e2" },
  reverted: { label: "REVERTED", color: "#1e3a5f", bg: "#dbeafe" },
};

const ACTION_LABEL: Record<string, string> = {
  approve:     "Approved edit",
  reject:      "Rejected edit",
  revert:      "Reverted edit",
  direct_edit: "Direct edit",
};

export default async function AuditLogPanel({ entityType, entityId, currentUser }: Props) {
  const [pendingEdits, recentLog] = await Promise.all([
    prisma.suggestedEdit.findMany({
      where: { entityType, entityId, status: "pending" },
      include: { user: { select: { id: true, displayName: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.auditLog.findMany({
      where: { entityType, entityId },
      include: { user: { select: { id: true, displayName: true, email: true } } },
      take: 30,
    }),
  ]);

  // Sort audit log in JS (never orderBy on nested includes)
  const sortedLog = recentLog.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const hasPending = pendingEdits.length > 0;
  const hasLog = sortedLog.length > 0;

  if (!hasPending && !hasLog) return null;

  const label = (u: { displayName: string | null; email: string }) =>
    u.displayName ?? u.email.split("@")[0];

  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <section style={{ marginTop: 48, paddingTop: 32, borderTop: "2px solid #000" }}>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--genius-gray)", textTransform: "uppercase", marginBottom: 20 }}>
        Edit History &amp; Audit Log
      </div>

      {/* ── Pending suggestions ── */}
      {hasPending && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 12 }}>
            Pending Suggestions ({pendingEdits.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pendingEdits.map((edit) => {
              const badge = STATUS_BADGE.pending;
              return (
                <div key={edit.id} style={{ background: "var(--surface)", border: "1px solid var(--genius-border)", borderRadius: 6, padding: "12px 16px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--genius-gray)" }}>
                      field: <strong style={{ color: "var(--ink)" }}>{edit.field}</strong>
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--genius-gray)" }}>
                      by {label(edit.user)} · {fmtDate(edit.createdAt)}
                    </span>
                  </div>
                  {edit.currentVal && (
                    <div style={{ fontSize: "0.78rem", color: "var(--genius-gray)", marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>Before:</span>{" "}
                      <span style={{ fontFamily: "monospace" }}>{edit.currentVal.slice(0, 120)}{edit.currentVal.length > 120 ? "…" : ""}</span>
                    </div>
                  )}
                  <div style={{ fontSize: "0.78rem", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>Suggested:</span>{" "}
                    <span style={{ fontFamily: "monospace" }}>{edit.suggestedVal.slice(0, 120)}{edit.suggestedVal.length > 120 ? "…" : ""}</span>
                  </div>
                  {edit.reason && (
                    <div style={{ fontSize: "0.75rem", color: "var(--genius-gray)", marginBottom: 8, fontStyle: "italic" }}>
                      Reason: {edit.reason}
                    </div>
                  )}
                  <ReviewButtons editId={edit.id} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Audit log ── */}
      {hasLog && (
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 12 }}>
            Recent Activity
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sortedLog.map((entry) => (
              <div key={entry.id} style={{ display: "flex", gap: 10, fontSize: "0.78rem", alignItems: "flex-start", padding: "6px 0", borderBottom: "1px solid var(--genius-border)" }}>
                <span style={{ color: "var(--genius-gray)", whiteSpace: "nowrap", minWidth: 140 }}>
                  {fmtDate(entry.createdAt)}
                </span>
                <span style={{ fontWeight: 600, minWidth: 100 }}>
                  {ACTION_LABEL[entry.action] ?? entry.action}
                </span>
                <span style={{ color: "var(--genius-gray)" }}>
                  by {label(entry.user)}
                  {entry.detail && (
                    <> · <span style={{ fontFamily: "monospace", fontSize: "0.72rem" }}>{entry.detail.slice(0, 80)}</span></>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
