import type { Metadata } from "next";
import Link from "next/link";
import { T, LangToggle } from "@/components/LangProvider";
import ShopGrid from "@/components/shop/ShopGrid";
import { PLUSHIES, PRICE_SET, PRICE_SINGLE, SET_SAVINGS, SET_SLUG, SPECS, STOCK_PER_CHARACTER, TOTAL_PRODUCED } from "@/lib/plushies";

export const metadata: Metadata = {
  title: "BABY-T-S Plush Pendants — Aegyo Arena Shop",
  description:
    "Seven chibi plush pendants that spell DAEBAK! $25 each or $150 for the complete set of 7. Limited run — 100 of each character, 700 total.",
};

export default function ShopPage() {
  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: "52px 24px 46px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44, alignItems: "center" }} className="shop-hero">
          <div>
            <LangToggle align="flex-start" marginBottom={16} />
            <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 14 }}>
              <T en="New drop — BABY-T-S" es="Nuevo drop — BABY-T-S" />
            </div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.3rem, 6vw, 3.4rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 16px", lineHeight: 1.08 }}>
              <T en="Seven plushies. One word." es="Siete peluches. Una palabra." />
            </h1>
            <p style={{ color: "var(--ink-dim)", fontSize: "1.06rem", lineHeight: 1.7, marginBottom: 22 }}>
              <T
                en="Each BABY-T-S pendant wears one embroidered character on its tee. Line all seven up in order and they spell DAEBAK! — the only way to read the whole word is to collect the whole set."
                es="Cada colgante BABY-T-S lleva un carácter bordado en la camiseta. Ponlos los siete en orden y deletrean DAEBAK! — la única forma de leer la palabra completa es tener el set completo."
              />
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
              <Stat label={{ en: "Single", es: "Individual" }} value={`$${PRICE_SINGLE}`} />
              <Stat label={{ en: "Set of 7", es: "Set de 7" }} value={`$${PRICE_SET}`} accent />
              <Stat label={{ en: "You save", es: "Ahorras" }} value={`$${SET_SAVINGS}`} />
              <Stat label={{ en: "Units made", es: "Unidades" }} value={`${TOTAL_PRODUCED}`} />
            </div>

            <Link
              href={`/shop/${SET_SLUG}`}
              style={{ display: "inline-block", padding: "14px 30px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 900, fontSize: "0.95rem", textDecoration: "none", boxShadow: "0 8px 26px rgba(255,111,168,0.4)" }}
            >
              <T en="Shop the full set →" es="Compra el set completo →" />
            </Link>
          </div>

          {/* The set in motion — the clip already uploaded for the rewards page. */}
          <video
            src="/videos/daebak-plushies.mp4"
            poster="/images/plushies/set-1.png"
            autoPlay
            loop
            muted
            playsInline
            aria-label="All seven BABY-T-S plushies"
            style={{ width: "100%", borderRadius: 18, border: "1px solid var(--border-strong)", boxShadow: "0 24px 64px rgba(0,0,0,0.4)", display: "block", background: "#000" }}
          />
        </div>
      </section>

      {/* ── The word strip ───────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 8px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {PLUSHIES.map((p) => (
            <Link
              key={p.slug}
              href={`/shop/${p.slug}`}
              title={`${p.member} — “${p.letter}”`}
              style={{
                textDecoration: "none", display: "grid", placeItems: "center", width: 62, height: 62, borderRadius: 14,
                background: p.accent, color: "#1B2027", fontWeight: 900, fontSize: "1.7rem", lineHeight: 1,
                boxShadow: "0 6px 18px rgba(0,0,0,0.3)",
              }}
            >
              {p.letter}
            </Link>
          ))}
        </div>
        <p style={{ textAlign: "center", color: "var(--ink-faint)", fontSize: "0.82rem", marginTop: 14 }}>
          <T
            en="D is SUGA · A is RM · E is JIN · B is JIMIN · A is V · K is JUNGKOOK · ! is J-HOPE"
            es="D es SUGA · A es RM · E es JIN · B es JIMIN · A es V · K es JUNGKOOK · ! es J-HOPE"
          />
        </p>
      </section>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px 20px" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.9rem", color: "var(--ink)", margin: "0 0 6px" }}>
          <T en="Plush Pendant" es="Colgante de peluche" />
        </h2>
        <p style={{ color: "var(--ink-dim)", fontSize: "0.95rem", margin: "0 0 26px" }}>
          <T
            en={`8 products · ${STOCK_PER_CHARACTER} of each character produced`}
            es={`8 productos · ${STOCK_PER_CHARACTER} unidades de cada personaje`}
          />
        </p>
        <ShopGrid />
      </div>

      {/* ── Inspection strip ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "44px 24px 72px" }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: "32px 30px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 36, alignItems: "center" }} className="shop-insp">
            <div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--volt)", marginBottom: 12 }}>
                <T en="Inspected before shipping" es="Inspeccionado antes de enviar" />
              </div>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.8rem", color: "var(--ink)", margin: "0 0 12px", lineHeight: 1.2 }}>
                <T en="Every figure in this run was checked." es="Cada figura de este lote fue revisada." />
              </h2>
              <p style={{ color: "var(--ink-dim)", fontSize: "0.98rem", lineHeight: 1.65, margin: "0 0 18px" }}>
                <T
                  en={`All ${SPECS.inspection.qtyInspected} units were inspected against the ${SPECS.inspection.qtyOrdered}-piece order on ${SPECS.inspection.dateLabel.en} — measured, weighed, and pull-tested at the hanging ring. The full spec is published on every product page.`}
                  es={`Las ${SPECS.inspection.qtyInspected} unidades se inspeccionaron contra el pedido de ${SPECS.inspection.qtyOrdered} piezas el ${SPECS.inspection.dateLabel.es} — medidas, pesadas y sometidas a prueba de tracción en la argolla. La ficha completa está en cada página de producto.`}
                />
              </p>
              <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", color: "var(--ink-faint)", lineHeight: 1.8 }}>
                ITEM NO. {SPECS.inspection.itemNo} · O/C NO. {SPECS.inspection.orderNo}
              </div>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <SpecRow label={{ en: "Size", es: "Tamaño" }} value={`${SPECS.sizeCm} (${SPECS.sizeIn})`} />
              <SpecRow label={{ en: "Weight", es: "Peso" }} value={`${SPECS.weightG} g (${SPECS.weightOz})`} />
              <SpecRow label={{ en: "Tension test", es: "Prueba de tracción" }} value={{ en: "Passed", es: "Aprobada" }} accent />
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .shop-hero { grid-template-columns: 1fr !important; gap: 28px !important; }
          .shop-insp { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </main>
  );
}

function Stat({ label, value, accent }: { label: { en: string; es: string }; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        background: accent ? "var(--sakura-light)" : "var(--surface)",
        border: `1px solid ${accent ? "var(--sakura)" : "var(--border)"}`,
        borderRadius: 12, padding: "10px 16px", minWidth: 92,
      }}
    >
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
        <T en={label.en} es={label.es} />
      </div>
      <div style={{ fontWeight: 900, fontSize: "1.15rem", color: accent ? "var(--sakura)" : "var(--ink)", marginTop: 2 }}>{value}</div>
    </div>
  );
}

function SpecRow({
  label,
  value,
  accent,
}: {
  label: { en: string; es: string };
  value: string | { en: string; es: string };
  accent?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "12px 16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }}>
      <span style={{ color: "var(--ink-dim)", fontSize: "0.88rem" }}><T en={label.en} es={label.es} /></span>
      <span style={{ color: accent ? "var(--volt)" : "var(--ink)", fontWeight: 800, fontSize: "0.88rem", textAlign: "right" }}>
        {typeof value === "string" ? value : <T en={value.en} es={value.es} />}
      </span>
    </div>
  );
}
