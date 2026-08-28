import { T } from "@/components/LangProvider";

// Reusable cross-promo to the Arcade (arcade.aegyoarena.com) — the site's flagship,
// most-popular feature. Dropped into high-traffic templated pages (artists, songs,
// events, …) so many internal links point back to the Arcade subdomain. Plain <a>
// because it's a separate subdomain app; OutboundTracker treats `arcade.` as internal,
// so this is NOT flagged as an outbound/external link.
export default function ArcadeCTA({ margin = "28px 0" }: { margin?: string }) {
  return (
    <a
      href="https://arcade.aegyoarena.com"
      aria-label="Play the Aegyo Arena Arcade"
      style={{
        display: "flex", alignItems: "center", gap: 14, textDecoration: "none",
        border: "1px solid var(--sakura)",
        background: "linear-gradient(120deg, rgba(255,111,168,0.15), rgba(255,111,168,0.03))",
        borderRadius: 14, padding: "14px 18px", margin,
      }}
    >
      <span aria-hidden style={{ fontSize: "1.9rem", lineHeight: 1, flexShrink: 0 }}>🕹️</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontWeight: 800, color: "var(--ink)", fontSize: "1rem", marginBottom: 2 }}>
          <T en="Play the Aegyo Arena Arcade" es="Juega en el Arcade de Aegyo Arena" />
        </span>
        <span style={{ display: "block", fontSize: "0.85rem", color: "var(--ink-dim)", lineHeight: 1.5 }}>
          <T
            en="Free K-pop mini-games — claw machines, Bias Flap, slang guessing & more."
            es="Minijuegos de K-pop gratis — máquinas de garra, Bias Flap, adivina la jerga y más."
          />
        </span>
      </span>
      <span style={{ marginLeft: "auto", color: "var(--sakura)", fontWeight: 800, fontSize: "0.85rem", whiteSpace: "nowrap", flexShrink: 0 }}>
        <T en="Enter →" es="Entrar →" />
      </span>
    </a>
  );
}
