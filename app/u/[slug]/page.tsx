import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { contributorBySlug, type Contributor } from "@/app/leaderboard/data";
import { getSession } from "@/lib/auth";
import { ROLE_LABEL, ROLE_COLOR } from "@/lib/roles";
import FollowButton from "@/components/FollowButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = contributorBySlug(slug);
  if (!c) return { title: "Profile — Aegyo Arena" };
  return {
    title: `${c.username} — Aegyo Arena`,
    description: `${c.username} · ${c.city} · ${c.points.toLocaleString("en-US")} points · ${c.annotations} annotations on the Aegyo Arena K-pop wiki.`,
  };
}

function statCards(c: Contributor) {
  return [
    { label: "Points", value: c.points.toLocaleString("en-US"), accent: true },
    { label: "Rank", value: `#${c.rank}` },
    { label: "Annotations", value: String(c.annotations) },
    { label: "Edits", value: String(c.edits) },
    { label: "Comments", value: String(c.comments) },
    { label: "Followers", value: c.followers.toLocaleString("en-US") },
  ];
}

// Derived activity for the showcase contributors (the leaderboard is mock data).
// Real registered users render their actual comments/annotations through this
// same dashboard once their data exists.
function activityFor(c: Contributor) {
  const annotations = [
    { word: c.focusTag, note: c.recentAct },
  ];
  const comments = [
    `This breakdown of ${c.focus} is exactly why I joined Aegyo Arena — ${c.city} fandom represent. 🔥`,
    `Cleaned up the ${c.focusTag} romanization on a few lines; ping me if anything still reads off.`,
  ];
  return { annotations, comments };
}

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = contributorBySlug(slug);
  if (!c) notFound();

  const session = await getSession();
  const isLoggedIn = !!session;
  const role = "contributor" as const; // showcase contributors are community members
  const { annotations, comments } = activityFor(c);

  return (
    <main>
      {/* Profile header band */}
      <section style={{ background: "linear-gradient(160deg, var(--sakura-light), var(--bg-card))", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "44px 24px 36px", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", background: c.tierColor, color: "#fff", fontWeight: 800, fontSize: "2.6rem", border: "4px solid var(--bg-card)", boxShadow: "0 8px 28px rgba(0,0,0,0.3)" }}>
            {c.initial}
          </div>
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", background: ROLE_COLOR[role], padding: "3px 10px", borderRadius: 100 }}>{ROLE_LABEL[role]}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", background: c.tierColor, padding: "3px 10px", borderRadius: 100 }}>{c.tier}</span>
            </div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem, 5vw, 2.4rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 6px", lineHeight: 1.1 }}>{c.username}</h1>
            <div style={{ color: "var(--ink-dim)", fontSize: "0.95rem", marginBottom: 16 }}>
              {c.flag} {c.city} · Rank #{c.rank} · Focus: {c.focus} · Joined {c.joinedMonth}
            </div>
            <FollowButton targetSlug={c.slug} baseFollowers={c.followers} isLoggedIn={isLoggedIn} displayName={c.username} />
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 36 }}>
          {statCards(c).map((s) => (
            <div key={s.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 800, color: s.accent ? "var(--sakura)" : "var(--ink)" }}>{s.value}</div>
              <div style={{ fontSize: "0.66rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 28 }}>
          {/* Annotations */}
          <div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", color: "var(--ink)", margin: "0 0 14px" }}>Recent annotations</h2>
            {annotations.map((a, i) => (
              <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderLeft: "3px solid var(--sakura)", borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: "var(--sakura)", fontSize: "0.95rem", marginBottom: 6 }}>&ldquo;{a.word}&rdquo;</div>
                <div style={{ color: "var(--ink-dim)", lineHeight: 1.7, fontSize: "0.92rem" }}>{a.note}</div>
              </div>
            ))}
            <div style={{ fontSize: "0.82rem", color: "var(--ink-faint)" }}>
              + {Math.max(0, c.annotations - annotations.length)} more annotations across the wiki.
            </div>
          </div>

          {/* Comments */}
          <div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.3rem", color: "var(--ink)", margin: "0 0 14px" }}>Recent comments</h2>
            {comments.map((body, i) => (
              <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", marginBottom: 12, color: "var(--ink-dim)", fontSize: "0.9rem", lineHeight: 1.65 }}>
                {body}
              </div>
            ))}
            <div style={{ fontSize: "0.82rem", color: "var(--ink-faint)" }}>
              + {Math.max(0, c.comments - comments.length)} more comments.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 36 }}>
          <Link href="/leaderboard" style={{ color: "var(--sakura)", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>← Back to the leaderboard</Link>
        </div>
      </div>
    </main>
  );
}
