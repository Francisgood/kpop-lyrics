import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CULTURE, TOPIC_ORDER, type CultureTopic } from "../content";
import CultureFeed from "@/components/CultureFeed";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOPIC_ORDER.map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  const m = CULTURE[topic as CultureTopic];
  if (!m) return { title: "Culture Vulture — Aegyo Arena" };
  return {
    title: `${m.title} — Culture Vulture | Aegyo Arena`,
    description: m.blurb,
  };
}

export default async function CultureTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const m = CULTURE[topic as CultureTopic];
  if (!m) notFound();

  return (
    <main>
      {/* Hero */}
      <section style={{ background: "linear-gradient(160deg, var(--sakura-light), var(--bg-card))", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 24px 30px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 14 }}>
            Culture Vulture
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 10px", lineHeight: 1.05 }}>
            {m.emoji} {m.title}
          </h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.05rem", lineHeight: 1.6, maxWidth: 620, margin: 0 }}>{m.blurb}</p>

          {/* Topic tabs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
            {TOPIC_ORDER.map((t) => {
              const active = t === m.key;
              const tt = CULTURE[t];
              return (
                <Link
                  key={t}
                  href={`/culture/${t}`}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 100, textDecoration: "none", fontWeight: 700, fontSize: "0.85rem",
                    border: active ? "1px solid var(--sakura)" : "1px solid var(--border)",
                    background: active ? "var(--sakura)" : "var(--bg-card)",
                    color: active ? "var(--on-accent)" : "var(--ink-dim)",
                  }}
                >
                  <span>{tt.emoji}</span>
                  {tt.title}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "34px 24px 80px" }}>
        {m.embeds.length > 0 ? (
          <CultureFeed embeds={m.embeds} />
        ) : (
          <div style={{ background: "var(--bg-card)", border: "1px dashed var(--border-strong)", borderRadius: 16, padding: "48px 28px", textAlign: "center" }}>
            <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>{m.emoji}</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
              {m.title} drops coming soon
            </div>
            <p style={{ color: "var(--ink-dim)", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: 460, margin: "0 auto 18px" }}>
              We&rsquo;re curating the best K-beauty looks and routines. Got a reel we should feature? Tag{" "}
              <a href="https://www.instagram.com/aegyoarena" target="_blank" rel="noopener noreferrer" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>@aegyoarena</a>.
            </p>
            <Link href="/culture/dance" style={{ color: "var(--sakura)", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}>
              Browse Dance instead →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
