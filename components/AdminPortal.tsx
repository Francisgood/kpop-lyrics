"use client";

import { useState } from "react";
import Link from "next/link";

type Ann = { id: string; authorName: string; authorSlug: string; songTitle: string; word: string; note: string; status: string; reviewedBy: string | null; reviewedAt: string | null };
type UserRow = { id: string; email: string; displayName: string | null; role: string };
type Stats = { approved: number; rejected: number; pending: number; total: number };

const ROLES = ["contributor", "moderator", "admin", "superadmin"];

function Badge({ status }: { status: string }) {
  const m: Record<string, { c: string; b: string; l: string }> = {
    approved: { c: "#3ecf8e", b: "rgba(62,207,142,0.12)", l: "Approved" },
    rejected: { c: "#ff6b6b", b: "rgba(255,107,107,0.12)", l: "Rejected" },
    pending: { c: "#f59e0b", b: "rgba(245,158,11,0.12)", l: "Pending" },
  };
  const x = m[status] ?? m.pending;
  return <span style={{ fontSize: "0.64rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: x.c, background: x.b, padding: "2px 8px", borderRadius: 100 }}>{x.l}</span>;
}

export default function AdminPortal({
  stats: stats0, pending: pending0, recent, users: users0, canManageRoles,
}: {
  stats: Stats; pending: Ann[]; recent: Ann[]; users: UserRow[]; canManageRoles: boolean;
}) {
  const [tab, setTab] = useState<"queue" | "roles">("queue");
  const [stats, setStats] = useState(stats0);
  const [pending, setPending] = useState(pending0);
  const [recent2, setRecent] = useState(recent);
  const [users, setUsers] = useState(users0);
  const [msg, setMsg] = useState("");

  async function decide(a: Ann, decision: "approved" | "rejected") {
    const res = await fetch("/api/admin/moderate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: a.id, decision }) });
    const d = await res.json().catch(() => ({}));
    if (res.ok) {
      setPending((p) => p.filter((x) => x.id !== a.id));
      setRecent((r) => [{ ...a, status: decision, reviewedBy: "you", reviewedAt: new Date().toISOString() }, ...r].slice(0, 40));
      if (d.stats) setStats(d.stats);
    } else setMsg(d.error ?? "Action failed");
  }

  async function changeRole(u: UserRow, role: string) {
    const res = await fetch("/api/admin/role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: u.id, role }) });
    const d = await res.json().catch(() => ({}));
    if (res.ok) setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, role } : x)));
    else setMsg(d.error === "superadmin_required" ? "Only the Superadmin can change an Admin." : d.error === "owner_locked" ? "The owner account is locked." : d.error ?? "Action failed");
  }

  const rate = stats.approved + stats.rejected > 0 ? Math.round((stats.approved / (stats.approved + stats.rejected)) * 100) : 0;
  const tabStyle = (active: boolean) => ({ padding: "9px 18px", borderRadius: 100, cursor: "pointer", border: active ? "1px solid var(--sakura)" : "1px solid var(--border)", background: active ? "var(--sakura)" : "var(--bg-card)", color: active ? "var(--on-accent)" : "var(--ink-dim)", fontWeight: 700, fontSize: "0.85rem" });

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 24 }}>
        {[["Approved", stats.approved], ["Rejected", stats.rejected], ["Pending", stats.pending], ["Approval rate", `${rate}%`]].map(([l, v]) => (
          <div key={l as string}>
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.7rem", fontWeight: 800, color: "var(--ink)" }}>{v}</div>
            <div style={{ fontSize: "0.66rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)" }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button type="button" onClick={() => setTab("queue")} style={tabStyle(tab === "queue")}>Moderation Queue</button>
        {canManageRoles && <button type="button" onClick={() => setTab("roles")} style={tabStyle(tab === "roles")}>Roles &amp; Permissions</button>}
      </div>

      {msg && <div style={{ marginBottom: 14, color: "#ff6b6b", fontSize: "0.85rem", fontWeight: 600 }}>{msg}</div>}

      {tab === "queue" && (
        <div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", color: "var(--ink)", margin: "0 0 12px" }}>Pending ({pending.length})</h2>
          {pending.length === 0 && <div style={{ color: "var(--ink-faint)", fontSize: "0.9rem", marginBottom: 28 }}>Queue is clear — no annotations awaiting review.</div>}
          {pending.map((a) => (
            <div key={a.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: "var(--ink)", fontSize: "0.9rem" }}>{a.word ? `“${a.word}” · ` : ""}{a.songTitle}</span>
                <Link href={`/u/${a.authorSlug}`} style={{ fontSize: "0.82rem", color: "var(--sakura)", textDecoration: "none" }}>{a.authorName} →</Link>
              </div>
              <div style={{ color: "var(--ink-dim)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 12 }}>{a.note}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => decide(a, "approved")} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#3ecf8e", color: "#06231a", fontWeight: 800, fontSize: "0.82rem", cursor: "pointer" }}>Approve</button>
                <button type="button" onClick={() => decide(a, "rejected")} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #ff6b6b", background: "transparent", color: "#ff6b6b", fontWeight: 800, fontSize: "0.82rem", cursor: "pointer" }}>Reject</button>
              </div>
            </div>
          ))}

          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", color: "var(--ink)", margin: "28px 0 12px" }}>Recently moderated</h2>
          {recent2.map((a) => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "11px 16px", marginBottom: 8 }}>
              <span style={{ minWidth: 0, flex: 1 }}>
                <Link href={`/annotation/${a.id}`} style={{ color: "var(--ink)", fontWeight: 600, fontSize: "0.88rem", textDecoration: "none" }}>{a.word ? `“${a.word}”` : a.songTitle}</Link>
                <span style={{ color: "var(--ink-faint)", fontSize: "0.78rem" }}> · {a.authorName} · {a.songTitle}</span>
              </span>
              <Badge status={a.status} />
            </div>
          ))}
        </div>
      )}

      {tab === "roles" && canManageRoles && (
        <div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", color: "var(--ink)", margin: "0 0 12px" }}>Registered users ({users.length})</h2>
          {users.length === 0 && <div style={{ color: "var(--ink-faint)", fontSize: "0.9rem" }}>No registered users yet.</div>}
          {users.map((u) => (
            <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px", marginBottom: 8 }}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 700, color: "var(--ink)", fontSize: "0.9rem" }}>{u.displayName ?? "—"}</span>
                <span style={{ display: "block", color: "var(--ink-faint)", fontSize: "0.78rem" }}>{u.email}</span>
              </span>
              <select value={u.role} onChange={(e) => changeRole(u, e.target.value)} disabled={u.role === "superadmin"}
                style={{ background: "#fff", color: "#000", border: "1px solid var(--border-strong)", borderRadius: 8, padding: "8px 10px", fontWeight: 600, fontSize: "0.82rem" }}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          ))}

          <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.05rem", color: "var(--ink)", margin: "28px 0 10px" }}>Permission reference</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ color: "var(--ink-faint)", textAlign: "left" }}>
                  {["Capability", "Contributor", "Moderator", "Admin", "Superadmin"].map((h) => <th key={h} style={{ padding: "6px 10px", fontWeight: 700 }}>{h}</th>)}
                </tr>
              </thead>
              <tbody style={{ color: "var(--ink-dim)" }}>
                {[
                  ["Annotate, vote, follow", "✓", "✓", "✓", "✓"],
                  ["Approve / reject edits", "—", "✓", "✓", "✓"],
                  ["Create / suspend lower roles", "—", "—", "✓", "✓"],
                  ["Act on another Admin", "—", "—", "—", "✓"],
                  ["Transfer ownership", "—", "—", "—", "✓"],
                ].map((row) => (
                  <tr key={row[0]} style={{ borderTop: "1px solid var(--border)" }}>
                    {row.map((cell, i) => <td key={i} style={{ padding: "8px 10px", color: i === 0 ? "var(--ink)" : "var(--ink-dim)" }}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
