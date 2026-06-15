import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contribute — Aegyo Arena",
  description:
    "Aegyo Arena is built by fans. Annotate K-pop lyrics, decode slang, suggest edits, earn points, and climb the Contributor ranks to unlock real rewards.",
};

const WAYS = [
  {
    icon: "✍️",
    title: "Annotate lyrics",
    body: "Highlight a line and explain the slang, the reference, or the cultural meaning behind it. Your annotation shows up in the slide-out panel for every fan who reads the song.",
  },
  {
    icon: "🔁",
    title: "Suggest edits",
    body: "Spot a shaky translation or a typo in the romanization? Suggest a fix. Approved edits keep the wiki accurate — and earn you points.",
  },
  {
    icon: "📖",
    title: "Decode slang",
    body: "Add or sharpen definitions in the Korean Slang dictionary so newcomers can actually follow the lyrics.",
  },
  {
    icon: "🎤",
    title: "Transcribe lyrics",
    body: "Add Korean lyrics, romanization, and English translations for songs that are still missing them.",
  },
];

const LEVELS = [
  { name: "New Fan", pts: "0 pts", desc: "You just joined. Browse the wiki, read annotations, and make your first contribution." },
  { name: "Contributor", pts: "100 pts", desc: "Your annotations and edits are landing. You can now suggest edits across the whole site." },
  { name: "Editor", pts: "2,500 pts", desc: "A trusted voice — your edits are fast-tracked and you help review what others submit." },
  { name: "Curator", pts: "10,000 pts", desc: "Top of the ranks. You shape the wiki and unlock every Daebak Rewards tier." },
];

const ACCENTS = ["var(--sakura)", "var(--volt)", "var(--sky)", "var(--lavender)"];

export default function ContributePage() {
  return (
    <main>
      {/* Hero */}
      <section style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "72px 24px 56px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 16 }}>
            How Aegyo Arena works
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem, 6vw, 3.4rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 16px", lineHeight: 1.1 }}>
            Built by fans, for fans.
          </h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: 640 }}>
            Every annotation, translation, and slang definition on Aegyo Arena comes from contributors like you. The more you add, the more <strong style={{ color: "var(--ink)" }}>points</strong> you earn — and points unlock real-world <Link href="/daebak-rewards" style={{ color: "var(--sakura)", fontWeight: 600 }}>Daebak Rewards</Link>.
          </p>
          <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/signup" style={{ padding: "13px 26px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", textDecoration: "none" }}>
              Start contributing
            </Link>
            <Link href="/daebak-rewards" style={{ padding: "13px 26px", borderRadius: 100, border: "1px solid var(--border-strong)", color: "var(--ink)", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}>
              See the rewards →
            </Link>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "64px 24px" }}>
        {/* Ways to contribute */}
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--ink)", margin: "0 0 8px" }}>Four ways to contribute</h2>
        <p style={{ color: "var(--ink-dim)", marginBottom: 32, fontSize: "1rem" }}>Pick whatever you&rsquo;re good at. Every accepted contribution earns points.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 72 }}>
          {WAYS.map((w, i) => (
            <div key={w.title} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, borderTop: `3px solid ${ACCENTS[i % ACCENTS.length]}` }}>
              <div style={{ fontSize: "1.8rem", marginBottom: 12 }}>{w.icon}</div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--ink)", marginBottom: 8 }}>{w.title}</div>
              <div style={{ color: "var(--ink-dim)", fontSize: "0.92rem", lineHeight: 1.65 }}>{w.body}</div>
            </div>
          ))}
        </div>

        {/* How points work */}
        <div style={{ background: "var(--sakura-light)", border: "1px solid var(--sakura)", borderRadius: 16, padding: "32px 28px", marginBottom: 72 }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", color: "var(--ink)", margin: "0 0 12px" }}>How you earn points</h2>
          <ul style={{ color: "var(--ink-dim)", fontSize: "1rem", lineHeight: 1.9, margin: 0, paddingLeft: 22 }}>
            <li>Every <strong style={{ color: "var(--ink)" }}>accepted annotation, edit, or definition</strong> earns points.</li>
            <li>When other fans <strong style={{ color: "var(--ink)" }}>upvote</strong> your contributions, you earn even more.</li>
            <li>Points are cumulative — they raise your Contributor level <em>and</em> bank toward rewards.</li>
            <li>New here? You get <strong style={{ color: "var(--sakura)" }}>+100 points</strong> just for signing up.</li>
          </ul>
        </div>

        {/* Contributor levels */}
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--ink)", margin: "0 0 8px" }}>Contributor ranks</h2>
        <p style={{ color: "var(--ink-dim)", marginBottom: 32, fontSize: "1rem" }}>Earn points to climb the ranks and earn the community&rsquo;s trust.</p>
        <div style={{ display: "grid", gap: 12, marginBottom: 72 }}>
          {LEVELS.map((lv, i) => (
            <div key={lv.name} style={{ display: "flex", alignItems: "center", gap: 18, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 22px" }}>
              <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "50%", background: ACCENTS[i % ACCENTS.length], color: "var(--on-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontFamily: "var(--mono)" }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--ink)" }}>{lv.name}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: "0.8rem", color: "var(--sakura)" }}>{lv.pts}</span>
                </div>
                <div style={{ color: "var(--ink-dim)", fontSize: "0.9rem", marginTop: 3 }}>{lv.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", background: "var(--bg-card)", border: "1px solid var(--border-strong)", borderRadius: 16, padding: "48px 28px" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--ink)", margin: "0 0 10px" }}>Ready to leave your mark?</h2>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.05rem", marginBottom: 24, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
            Create a free account, start annotating, and watch your points — and your rewards — stack up.
          </p>
          <Link href="/signup" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "1rem", textDecoration: "none" }}>
            Become a Contributor
          </Link>
        </div>
      </div>
    </main>
  );
}
