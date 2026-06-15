import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contribute — Aegyo Arena",
  description:
    "Aegyo Arena is the ultimate source of K-pop music knowledge, created by contributors like you. Learn how to annotate lyrics, earn points, and follow the 10 Annotation Commandments.",
};

const POINTS = [
  { action: "Sign-up bonus", pts: "+50", note: "One-time, just for creating your account." },
  { action: "Post a comment", pts: "+1", note: "On any song, artist, or album page." },
  { action: "Write an annotation", pts: "+20", note: "Appears as an “Unreviewed Annotation.”" },
  { action: "Annotation accepted", pts: "+10", note: "An editor reviews and approves it." },
  { action: "Annotation rejected", pts: "−10", note: "If an editor rejects your annotation." },
  { action: "Link a social profile", pts: "+10 each", note: "Verify up to 3 social media accounts." },
];

const GOOD = [
  "A breakdown of a reference",
  "Uncommon slang term definitions",
  "A description of poetic wordplay or double meanings",
  "Quotes from artist interviews that give context or explain meaning",
  "Connections to history or current events that expand the meaning",
  "Connections to lyrics or themes in other songs",
  "Connections to the artist’s real life",
  "Images, GIFs, or videos that help explain meaning or provide evidence",
];

const COMMANDMENTS = [
  { t: "Don’t Restate The Lyric", d: "Most lyrics don’t need explaining—the meaning is obvious. Don’t just paraphrase them in other words. Not all lines need to be annotated." },
  { t: "Write Like A Human", d: "Avoid overly complicated words, but don’t be too casual either. An annotation shouldn’t sound like a robot wrote it—so avoid generative AI programs, too." },
  { t: "Watch Grammar & Spelling", d: "Writing like a human doesn’t mean forgetting the basics of style. Don’t undermine an important annotation with sloppy writing." },
  { t: "Do Research & Hyperlink Sources", d: "Avoid plagiarism and speculation. Don’t copy Wikipedia, Urban Dictionary, or forums (tertiary sources)—link primary or secondary sources instead." },
  { t: "Highlight All Relevant Lyrics", d: "Don’t highlight a single word—annotate at least one full line. Sometimes you need two or four bars for context, but be wary of more than four lines." },
  { t: "Master Formatting", d: "Learn markdown—the basic code used in annotations for italics, bold, blockquotes, and the flourishes that make your ’tates a joy to read." },
  { t: "Include Media That Adds Depth", d: "If you add an image, it should illustrate something specific in the lyric, not just a general idea." },
  { t: "Be Objective", d: "Your annotations shouldn’t be rude or demeaning to the artist, and you shouldn’t write like a corny superfan." },
  { t: "Be Concise", d: "Say what you mean in the fewest words possible. Wordiness ruins annotations—but so does too little. Annotations should be more than 50 characters." },
  { t: "Be Evergreen", d: "Avoid time-sensitive phrasing that becomes inaccurate fast (“two years ago,” “next summer,” “recently,” “upcoming,” etc.)." },
];

export default function ContributePage() {
  return (
    <main>
      {/* Hero */}
      <section style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "72px 24px 56px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 16 }}>
            How to get involved
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.1rem, 5.5vw, 3.2rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 18px", lineHeight: 1.12 }}>
            The ultimate source of K-pop knowledge, built by contributors like you.
          </h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: 660 }}>
            Fans from around the world share facts and insight about the songs and artists they love. Earn <strong style={{ color: "var(--ink)" }}>points</strong> by adding knowledge about an artist, a song lyric, or an album—every contributor has a point total next to their name that shows how knowledgeable they are.
          </p>
          <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/signup" style={{ padding: "13px 26px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", textDecoration: "none" }}>Start contributing</Link>
            <Link href="/daebak-rewards" style={{ padding: "13px 26px", borderRadius: 100, border: "1px solid var(--border-strong)", color: "var(--ink)", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}>See the rewards →</Link>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "64px 24px" }}>
        {/* Points */}
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--ink)", margin: "0 0 8px" }}>How points work</h2>
        <p style={{ color: "var(--ink-dim)", marginBottom: 28, fontSize: "1rem" }}>Every contribution moves the needle. Points bank toward <Link href="/daebak-rewards" style={{ color: "var(--sakura)", fontWeight: 600 }}>Daebak Rewards</Link>.</p>
        <div style={{ display: "grid", gap: 10, marginBottom: 72 }}>
          {POINTS.map((p) => {
            const neg = p.pts.startsWith("−");
            return (
              <div key={p.action} style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ flexShrink: 0, minWidth: 78, fontFamily: "var(--mono)", fontWeight: 800, fontSize: "1.05rem", color: neg ? "#ff7a7a" : "var(--sakura)" }}>{p.pts}</div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: "0.98rem" }}>{p.action}</div>
                  <div style={{ color: "var(--ink-dim)", fontSize: "0.86rem", marginTop: 2 }}>{p.note}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* How to annotate */}
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--ink)", margin: "0 0 16px" }}>How to annotate a lyric</h2>
        <div style={{ color: "var(--ink-dim)", fontSize: "1.02rem", lineHeight: 1.8, marginBottom: 16 }}>
          <p style={{ margin: "0 0 14px" }}>Highlight any line in a song to start an annotation, then click the <strong style={{ color: "var(--sakura)" }}>&ldquo;Start the Annotation&rdquo;</strong> button. The easiest way is on a laptop, but you can do it on your phone too—hold down on the text and drag the selector across all the lines you need.</p>
          <p style={{ margin: "0 0 14px" }}>You’ll get <strong style={{ color: "var(--ink)" }}>+20 points</strong> for writing one, which appears as an &ldquo;Unreviewed Annotation.&rdquo; An editor then reviews it: if it’s good, they accept it and you earn <strong style={{ color: "var(--ink)" }}>+10 more</strong>. If they reject it, you <strong style={{ color: "#ff7a7a" }}>lose 10</strong>. Spot a poor unreviewed annotation? Tag <code style={{ color: "var(--sakura)", fontFamily: "var(--mono)" }}>@red-removers</code> and an editor will take a look.</p>
        </div>

        {/* Good annotation includes */}
        <div style={{ background: "var(--sakura-light)", border: "1px solid var(--sakura)", borderRadius: 16, padding: "28px 28px 12px", marginBottom: 72 }}>
          <h3 style={{ fontWeight: 800, color: "var(--ink)", fontSize: "1.2rem", margin: "0 0 16px" }}>A good annotation can include:</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "8px 24px" }}>
            {GOOD.map((g) => (
              <div key={g} style={{ display: "flex", gap: 10, color: "var(--ink-dim)", fontSize: "0.94rem", lineHeight: 1.5, marginBottom: 12 }}>
                <span style={{ color: "var(--sakura)", flexShrink: 0 }}>✦</span>{g}
              </div>
            ))}
          </div>
        </div>

        {/* 10 Commandments */}
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--ink)", margin: "0 0 8px" }}>The 10 Annotation Commandments</h2>
        <p style={{ color: "var(--ink-dim)", marginBottom: 32, fontSize: "1rem" }}>Follow these rules of thumb to keep your annotations from getting rejected.</p>
        <div style={{ display: "grid", gap: 12, marginBottom: 72 }}>
          {COMMANDMENTS.map((c, i) => (
            <div key={c.t} style={{ display: "flex", gap: 18, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 22px" }}>
              <div style={{ flexShrink: 0, fontFamily: "var(--serif)", fontWeight: 700, fontSize: "1.6rem", color: "var(--sakura)", lineHeight: 1, minWidth: 32 }}>{i + 1}</div>
              <div>
                <div style={{ fontWeight: 800, color: "var(--ink)", fontSize: "1.02rem", marginBottom: 4 }}>{c.t}</div>
                <div style={{ color: "var(--ink-dim)", fontSize: "0.92rem", lineHeight: 1.6 }}>{c.d}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", background: "var(--bg-card)", border: "1px solid var(--border-strong)", borderRadius: 16, padding: "48px 28px" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "2rem", color: "var(--ink)", margin: "0 0 10px" }}>Ready to add your knowledge?</h2>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.05rem", marginBottom: 24, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>Create a free account, grab your +50 sign-up bonus, and start annotating.</p>
          <Link href="/signup" style={{ display: "inline-block", padding: "14px 32px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "1rem", textDecoration: "none" }}>Become a Contributor</Link>
        </div>
      </div>
    </main>
  );
}
