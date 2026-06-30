import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contributorBySlug, slugify, type Contributor } from "@/app/leaderboard/data";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { roleForUser, ROLE_LABEL, ROLE_COLOR, type Role } from "@/lib/roles";
import { getUserAnnotations, getUserComments, type AnnRow } from "@/lib/community-db";
import FollowButton from "@/components/FollowButton";

export const dynamic = "force-dynamic";

type Profile = {
  slug: string;
  name: string;
  initial: string;
  avatar: string | null;
  tierColor: string;
  role: Role;
  city: string | null;
  flag: string;
  rank: number | null;
  tier: string | null;
  focus: string | null;
  joined: string;
  baseFollowers: number;
  bio: string | null;
  counts: { annotations: number | null; edits: number | null; comments: number | null; points: number | null };
};

async function resolveProfile(slug: string): Promise<Profile | null> {
  const c = contributorBySlug(slug);
  if (c) {
    return {
      slug: c.slug, name: c.username, initial: c.initial, avatar: c.avatar, tierColor: c.tierColor,
      role: "contributor", city: c.city, flag: c.flag, rank: c.rank, tier: c.tier, focus: c.focus,
      joined: c.joinedMonth, baseFollowers: c.followers, bio: null,
      counts: { annotations: c.annotations, edits: c.edits, comments: c.comments, points: c.points },
    };
  }
  // Real registered user (matched by slugified display name).
  const users = await prisma.user.findMany({ select: { id: true, email: true, displayName: true, avatarUrl: true, bio: true, createdAt: true }, take: 500 });
  const u = users.find((x) => x.displayName && slugify(x.displayName) === slug);
  if (!u) return null;
  const commentCount = await prisma.comment.count({ where: { userId: u.id } });
  return {
    slug, name: u.displayName ?? "Member", initial: (u.displayName ?? "M").charAt(0).toUpperCase(), avatar: u.avatarUrl ?? null,
    tierColor: "#ff6fa8", role: roleForUser(u), city: null, flag: "", rank: null, tier: null, focus: null,
    joined: u.createdAt.toLocaleDateString("en-US", { month: "short", year: "numeric" }), baseFollowers: 0, bio: u.bio,
    counts: { annotations: null, edits: null, comments: commentCount, points: null },
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await resolveProfile(slug);
  if (!p) return { title: "Profile — Aegyo Arena" };
  return { title: `${p.name} — Aegyo Arena`, description: `${p.name}${p.city ? ` · ${p.city}` : ""} — contributions on the Aegyo Arena K-pop wiki.` };
}

function StatusBadge({ status }: { status: AnnRow["status"] }) {
  const map = {
    approved: { label: "Approved", color: "#3ecf8e", bg: "rgba(62,207,142,0.12)" },
    rejected: { label: "Rejected", color: "#ff6b6b", bg: "rgba(255,107,107,0.12)" },
    pending: { label: "Pending review", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  }[status];
  return <span style={{ fontSize: "0.66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: map.color, background: map.bg, padding: "2px 8px", borderRadius: 100 }}>{map.label}</span>;
}

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await resolveProfile(slug);
  if (!p) notFound();

  const [annotations, comments, session] = await Promise.all([
    getUserAnnotations(slug, 5),
    getUserComments(slug, 10),
    getSession(),
  ]);
  const isLoggedIn = !!session;

  const stats: { label: string; value: string; accent?: boolean }[] = [];
  if (p.counts.points != null) stats.push({ label: "Points", value: p.counts.points.toLocaleString("en-US"), accent: true });
  if (p.rank != null) stats.push({ label: "Rank", value: `#${p.rank}` });
  if (p.counts.annotations != null) stats.push({ label: "Annotations", value: String(p.counts.annotations) });
  if (p.counts.edits != null) stats.push({ label: "Edits", value: String(p.counts.edits) });
  if (p.counts.comments != null) stats.push({ label: "Comments", value: String(p.counts.comments) });
  stats.push({ label: "Followers", value: p.baseFollowers.toLocaleString("en-US") });

  return (
    <main>
      <section style={{ background: "linear-gradient(160deg, var(--sakura-light), var(--bg-card))", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "44px 24px 36px", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          {p.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatar} alt={p.name} style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", flexShrink: 0, display: "block", background: p.tierColor, border: "4px solid var(--bg-card)", boxShadow: "0 8px 28px rgba(0,0,0,0.3)" }} />
          ) : (
            <div style={{ width: 96, height: 96, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: p.tierColor, color: "#fff", fontWeight: 800, fontSize: "2.6rem", border: "4px solid var(--bg-card)", boxShadow: "0 8px 28px rgba(0,0,0,0.3)" }}>
              {p.initial}
            </div>
          )}
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", background: ROLE_COLOR[p.role], padding: "3px 10px", borderRadius: 100 }}>{ROLE_LABEL[p.role]}</span>
              {p.tier && <span style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", background: p.tierColor, padding: "3px 10px", borderRadius: 100 }}>{p.tier}</span>}
            </div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 6px", lineHeight: 1.1 }}>{p.name}</h1>
            <div style={{ color: "var(--ink-dim)", fontSize: "0.95rem", marginBottom: 16 }}>
              {p.city ? `${p.flag} ${p.city} · ` : ""}{p.rank ? `Rank #${p.rank} · ` : ""}{p.focus ? `Focus: ${p.focus} · ` : ""}Joined {p.joined}
            </div>
            {p.bio && <p style={{ color: "var(--ink-dim)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: 16, maxWidth: 520 }}>{p.bio}</p>}
            <FollowButton targetSlug={p.slug} baseFollowers={p.baseFollowers} isLoggedIn={isLoggedIn} displayName={p.name} />
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 36 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 800, color: s.accent ? "var(--sakura)" : "var(--ink)" }}>{s.value}</div>
              <div style={{ fontSize: "0.66rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 28 }}>
          {/* Recent annotations (click-through to detail) */}
          <div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", color: "var(--ink)", margin: "0 0 14px" }}>Recent annotations</h2>
            {annotations.length === 0 && <div style={{ color: "var(--ink-faint)", fontSize: "0.9rem" }}>No annotations yet.</div>}
            {annotations.map((a) => (
              <Link key={a.id} href={`/annotation/${a.id}`} style={{ textDecoration: "none", display: "block", background: "var(--bg-card)", border: "1px solid var(--border)", borderLeft: "3px solid var(--sakura)", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: "var(--sakura)", fontSize: "0.92rem" }}>{a.word ? `“${a.word}”` : a.songTitle}</span>
                  <StatusBadge status={a.status} />
                </div>
                <div style={{ color: "var(--ink-dim)", lineHeight: 1.6, fontSize: "0.88rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.note}</div>
                <div style={{ fontSize: "0.74rem", color: "var(--ink-faint)", marginTop: 8 }}>on {a.songTitle} · view →</div>
              </Link>
            ))}
            {p.counts.annotations != null && p.counts.annotations > annotations.length && (
              <div style={{ fontSize: "0.82rem", color: "var(--ink-faint)" }}>+ {p.counts.annotations - annotations.length} more annotations across the wiki.</div>
            )}
          </div>

          {/* Recent comments */}
          <div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", color: "var(--ink)", margin: "0 0 14px" }}>Recent comments</h2>
            {comments.length === 0 && <div style={{ color: "var(--ink-faint)", fontSize: "0.9rem" }}>No comments yet.</div>}
            {comments.map((m) => (
              <div key={m.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "13px 16px", marginBottom: 12 }}>
                <div style={{ color: "var(--ink-dim)", fontSize: "0.9rem", lineHeight: 1.6 }}>{m.body}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--ink-faint)", marginTop: 6 }}>on {m.context}</div>
              </div>
            ))}
            {p.counts.comments != null && p.counts.comments > comments.length && (
              <div style={{ fontSize: "0.82rem", color: "var(--ink-faint)" }}>+ {p.counts.comments - comments.length} more comments.</div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 36 }}>
          <Link href="/leaderboard" style={{ color: "var(--sakura)", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>← Back to the leaderboard</Link>
        </div>
      </div>
    </main>
  );
}
