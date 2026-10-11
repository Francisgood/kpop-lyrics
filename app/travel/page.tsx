import type { Metadata } from "next";
import Link from "next/link";
import { T } from "@/components/LangProvider";
import TravelCTA from "@/components/TravelCTA";
import { CITY_NAMES } from "@/lib/city-names";
import { affiliateEnabled } from "@/lib/expedia";

export const metadata: Metadata = {
  title: "Concert Travel — Where to Stay for a K-pop Show | Aegyo Arena",
  description: "Every city Aegyo Arena covers, with its city guide and somewhere to stay for the show.",
};

const card: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: 16,
  padding: "18px 20px",
};

export default function TravelPage() {
  const cities = [...CITY_NAMES].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "52px 24px 80px" }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sky)", marginBottom: 14 }}>
        <T en="Concert travel" es="Viajes a conciertos" />
      </div>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.2rem, 7vw, 3.4rem)", color: "var(--ink)", margin: "0 0 14px", lineHeight: 1.05 }}>
        <T en="Getting to the show." es="Cómo llegar al show." />
      </h1>
      <p style={{ color: "var(--ink-dim)", fontSize: "1.03rem", lineHeight: 1.7, maxWidth: 640, margin: "0 0 10px" }}>
        <T
          en="Every city we cover, with its guide — venues, meetups, K-pop spots — and somewhere to stay when a tour lands there."
          es="Todas las ciudades que cubrimos, con su guía — recintos, meetups, lugares de K-pop — y dónde quedarte cuando una gira llega."
        />
      </p>
      {affiliateEnabled() && (
        <p style={{ color: "var(--ink-faint)", fontSize: "0.78rem", lineHeight: 1.6, maxWidth: 640, margin: "0 0 26px" }}>
          <T
            en="Hotel links are affiliate links. If you book through one we may earn a commission, at no extra cost to you. It never changes which city guides we write or what we put in them."
            es="Los enlaces de hoteles son de afiliados. Si reservas con uno podemos ganar una comisión, sin costo adicional para ti. Nunca cambia qué guías escribimos ni lo que ponemos en ellas."
          />
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: 16, marginTop: 26 }}>
        {cities.map((c) => (
          <div key={c.slug} style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span aria-hidden style={{ fontSize: "1.1rem" }}>{c.flag}</span>
              <Link href={`/cities/${c.slug}`} style={{ color: "var(--ink)", fontWeight: 800, fontSize: "1.02rem", textDecoration: "none" }}>
                {c.name}
              </Link>
              <span style={{ color: "var(--ink-faint)", fontFamily: "var(--mono)", fontSize: "0.68rem" }}>{c.country}</span>
            </div>
            <Link href={`/cities/${c.slug}`} style={{ color: "var(--sakura)", fontWeight: 600, fontSize: "0.82rem", textDecoration: "none" }}>
              <T en="City guide →" es="Guía de la ciudad →" />
            </Link>
            <div style={{ marginTop: 10 }}>
              <TravelCTA destination={`${c.name}, ${c.country}`} compact />
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 30 }}>
        <Link href="/events" style={{ color: "var(--ink-dim)", fontWeight: 600, fontSize: "0.9rem" }}>
          <T en="← What's on near you" es="← Qué hay cerca de ti" />
        </Link>
      </p>
    </main>
  );
}
