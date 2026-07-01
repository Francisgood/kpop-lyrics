import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daebak Rewards — Aegyo Arena",
  description:
    "Earn points by contributing to Aegyo Arena and claim real merch — exclusive drops, our iconic chibi plushies, desk toys, concert tickets, and signed memorabilia.",
};

const TIERS: { tier: string; icon: string; name: string; pts: string; accent: string; note: string; link?: string; linkLabel?: string }[] = [
  { tier: "Tier 1", icon: "👕", name: "Merch Drop", pts: "2,000 points", accent: "var(--sakura)", note: "Early access to limited-run Aegyo Arena apparel & accessories." },
  { tier: "Tier 2", icon: "🧸", name: "K-pop Plushie", pts: "3,000 points", accent: "var(--volt)", note: "Our iconic chibi plush collection — collect your bias." },
  { tier: "Tier 3", icon: "✨", name: "Desk Toy", pts: "4,000 points", accent: "var(--sky)", note: "Collectible desk figures to flex your fandom at work or in stream." },
  { tier: "Tier 4", icon: "🎫", name: "Concert Tickets", pts: "5,000 points", accent: "var(--tangerine)", note: "Only 4 tickets are available per season — first qualified, first served.", link: "/bts-giveaway", linkLabel: "🎟 Enter the BTS Ticket Giveaway →" },
  { tier: "Auction", icon: "✍️", name: "Signed Memorabilia", pts: "Bid-based", accent: "var(--lavender)", note: "Spend your points to bid on one-of-a-kind signed items. Highest bid wins." },
];

export default function DaebakRewardsPage() {
  return (
    <main>
      {/* Hero with plushie video */}
      <section style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "56px 24px 48px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }} className="dr-hero">
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 16 }}>
              Daebak Rewards
            </div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem, 6vw, 3.2rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 16px", lineHeight: 1.1 }}>
              Earn points. Claim real merch.
            </h1>
            <p style={{ color: "var(--ink-dim)", fontSize: "1.08rem", lineHeight: 1.7, marginBottom: 24 }}>
              Contribute to the wiki, rack up points, and trade them for exclusive drops, our chibi plush collection, desk toys, concert tickets, and signed memorabilia.
            </p>
            <Link href="/contribute" style={{ display: "inline-block", padding: "13px 28px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", textDecoration: "none" }}>
              How to earn points →
            </Link>
          </div>
          <video
            src="/videos/daebak-plushies.mp4"
            poster="/images/redesign/hero-plush.png"
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "100%", borderRadius: 18, border: "1px solid var(--border-strong)", boxShadow: "0 24px 64px rgba(0,0,0,0.4)", display: "block", background: "#000" }}
          />
        </div>
      </section>

      {/* Reward tiers */}
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "64px 24px" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--ink)", margin: "0 0 8px" }}>The reward tiers</h2>
        <p style={{ color: "var(--ink-dim)", marginBottom: 32, fontSize: "1rem" }}>The more you contribute, the higher you climb. Points are cumulative.</p>

        <div style={{ display: "grid", gap: 14 }}>
          {TIERS.map((t) => (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 20, background: "var(--bg-card)", border: "1px solid var(--border)", borderLeft: `4px solid ${t.accent}`, borderRadius: 14, padding: "22px 26px" }} className="dr-tier">
              <div style={{ fontSize: "2.2rem", flexShrink: 0, width: 56, textAlign: "center" }}>{t.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--ink)" }}>{t.name}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-faint)" }}>{t.tier}</span>
                </div>
                <div style={{ color: "var(--ink-dim)", fontSize: "0.92rem", marginTop: 4, lineHeight: 1.55 }}>{t.note}</div>
                {t.link && (
                  <Link href={t.link} style={{ display: "inline-block", marginTop: 12, padding: "9px 20px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.85rem", textDecoration: "none", boxShadow: "0 4px 16px rgba(255,111,168,0.4)" }}>
                    {t.linkLabel}
                  </Link>
                )}
              </div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ fontWeight: 800, fontSize: "1.05rem", color: t.accent }}>{t.pts}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Earn points callout */}
        <div style={{ marginTop: 56, textAlign: "center", background: "var(--sakura-light)", border: "1px solid var(--sakura)", borderRadius: 16, padding: "44px 28px" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.9rem", color: "var(--ink)", margin: "0 0 10px" }}>No points yet? Start earning.</h2>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.05rem", marginBottom: 24, maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}>
            Annotate lyrics, decode slang, and suggest edits. Every accepted contribution — and every upvote — banks points toward these rewards.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contribute" style={{ padding: "13px 28px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", textDecoration: "none" }}>
              Start contributing
            </Link>
            <Link href="/signup" style={{ padding: "13px 28px", borderRadius: 100, border: "1px solid var(--border-strong)", color: "var(--ink)", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
