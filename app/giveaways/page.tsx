import type { Metadata } from "next";
import Link from "next/link";
import SmartImage from "@/components/SmartImage";

export const metadata: Metadata = {
  title: "Giveaways | Aegyo Arena",
  description: "Win K-pop concert tickets and merch with Aegyo Arena - LE SSERAFIM, BTS, and more. Free to enter.",
};

type Card = {
  status: "open" | "closed" | "soon";
  artist: string;
  tour: string;
  img: string;
  accent: string;
  blurb: string;
  when: string;
  where: string;
  actions: { label: string; href: string; primary?: boolean }[];
};

const CARDS: Card[] = [
  {
    status: "open",
    artist: "LE SSERAFIM",
    tour: "PUREFLOW Tour",
    img: "/giveaway/le-sserafim.jpg",
    accent: "var(--sakura)",
    blurb: "Win two floor seats + a private merch line, or $200 in official merch for the runner-up.",
    when: "Concert: Thu, Oct 8, 2026",
    where: "Prudential Center - Newark, NJ",
    actions: [{ label: "Enter now", href: "/le-sserafim-giveaway", primary: true }],
  },
  {
    status: "closed",
    artist: "BTS",
    tour: "Concert Ticket Giveaway",
    img: "/giveaway/tickets.jpg",
    accent: "var(--volt)",
    blurb: "Entries are closed. See the provably-fair, Chainlink-verifiable winner selection.",
    when: "Winner selection complete",
    where: "Aegyo Arena",
    actions: [
      { label: "View giveaway", href: "/bts-giveaway" },
      { label: "See the selection", href: "/bts-giveaway/draw", primary: true },
    ],
  },
  {
    status: "soon",
    artist: "aespa",
    tour: "Next up",
    img: "/giveaway/aespa.jpg",
    accent: "var(--ink-dim)",
    blurb: "Our next drop: aespa concert tickets. Enter any giveaway above to join the newsletter and hear first.",
    when: "Mon, Jan 26, 2027",
    where: "Berlin, Germany",
    actions: [],
  },
];

const STATUS_LABEL: Record<Card["status"], string> = { open: "Open now", closed: "Closed", soon: "Coming soon" };

export default function GiveawaysPage() {
  return (
    <main style={{ padding: "0 0 80px" }}>
      <section style={{ background: "linear-gradient(180deg, var(--sakura-light), var(--bg))", borderBottom: "1px solid var(--border)", padding: "44px 24px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 14 }}>Aegyo Arena Giveaways</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem, 8vw, 3.6rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 14px", lineHeight: 1.05 }}>
            Win K-pop <em style={{ color: "var(--sakura)", fontStyle: "italic" }}>concert tickets</em>
          </h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "clamp(1rem, 3.5vw, 1.15rem)", lineHeight: 1.6, maxWidth: 560, margin: "0 auto" }}>
            Free to enter. Real seats, real merch, provably-fair winner selection. Here&apos;s what&apos;s live now - and what&apos;s next.
          </p>
        </div>
      </section>

      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))", gap: 22 }}>
          {CARDS.map((card) => (
            <div key={card.artist} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden", display: "flex", flexDirection: "column", opacity: card.status === "soon" ? 0.92 : 1 }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 10", overflow: "hidden", background: "var(--bg-light)" }}>
                {card.img
                  ? <SmartImage src={card.img} alt={`${card.artist} - ${card.tour}`} fill sizes="(max-width: 760px) 100vw, 480px" style={{ objectFit: "cover", filter: card.status === "closed" ? "grayscale(0.35)" : undefined }} />
                  : <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "var(--serif)", fontSize: "2.2rem", color: "var(--ink-faint)" }}>aespa</div>}
                <span style={{ position: "absolute", top: 14, left: 14, background: "rgba(15,15,18,0.82)", color: "#fff", fontFamily: "var(--mono)", fontSize: "0.64rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 100, border: `1px solid ${card.accent}` }}>{STATUS_LABEL[card.status]}</span>
              </div>
              <div style={{ padding: "20px 22px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 6 }}>{card.tour}</div>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.7rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 10px", lineHeight: 1.15 }}>{card.artist}</h2>
                <p style={{ color: "var(--ink-dim)", fontSize: "0.92rem", lineHeight: 1.6, margin: "0 0 14px" }}>{card.blurb}</p>
                <div style={{ fontSize: "0.85rem", color: "var(--ink-dim)", marginBottom: 18 }}>
                  <div>📅 {card.when}</div>
                  <div>📍 {card.where}</div>
                </div>
                <div style={{ marginTop: "auto", display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {card.actions.length === 0
                    ? <span style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)" }}>Details soon</span>
                    : card.actions.map((a) => (
                      <Link key={a.href} href={a.href} style={{
                        display: "inline-flex", alignItems: "center", padding: "11px 22px", borderRadius: 100, fontWeight: 800, fontSize: "0.85rem", letterSpacing: "0.02em", textTransform: "uppercase", textDecoration: "none",
                        background: a.primary ? "var(--sakura)" : "transparent", color: a.primary ? "var(--on-accent)" : "var(--ink)", border: a.primary ? "none" : "1px solid var(--border-strong)",
                      }}>{a.label}</Link>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
