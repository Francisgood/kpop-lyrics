import { expediaHotelSearch, affiliateEnabled } from "@/lib/expedia";
import { T } from "@/components/LangProvider";

// Renders a "find somewhere to stay" affiliate link, with the disclosure the FTC
// requires attached to the link rather than buried in a footer. Returns null
// while EXPEDIA_AFFILIATE_ID is unset, so an unconfigured build shows nothing
// instead of sending untracked traffic to Expedia.
type Props = {
  destination: string;          // "Newark, NJ" / "Seoul"
  label?: React.ReactNode;      // overrides the default heading
  checkIn?: string | Date | null;
  nights?: number;
  compact?: boolean;            // inline row rather than a bordered card
};

export default function TravelCTA({ destination, label, checkIn, nights, compact }: Props) {
  if (!affiliateEnabled()) return null;
  const href = expediaHotelSearch({ destination, checkIn, nights });
  if (!href) return null;

  const link = (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener noreferrer"
      style={{ color: "var(--sky)", fontWeight: 700, textDecoration: "none" }}
    >
      {label ?? <T en={`Find a hotel in ${destination} →`} es={`Busca hotel en ${destination} →`} />}
    </a>
  );

  const disclosure = (
    <span style={{ color: "var(--ink-faint)", fontSize: "0.72rem" }}>
      <T en="Affiliate link — we may earn a commission, at no extra cost to you."
         es="Enlace de afiliado — podemos ganar una comisión, sin costo adicional para ti." />
    </span>
  );

  if (compact) {
    return <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10 }}>{link}{disclosure}</div>;
  }

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px", display: "grid", gap: 6 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sky)" }}>
        <T en="Getting there" es="Cómo llegar" />
      </div>
      {link}
      {disclosure}
    </div>
  );
}
