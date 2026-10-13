"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SmartImage from "@/components/SmartImage";
import { useLang } from "@/components/LangProvider";
import { useCart } from "@/components/shop/CartProvider";
import NotifyMeModal from "@/components/shop/NotifyMeModal";
import { PRICE_SINGLE, SET_SLUG } from "@/lib/plushies";

export type DetailRow = { label: { en: string; es: string }; value: string | { en: string; es: string } };

export type DetailProduct = {
  slug: string;
  title: string;
  titleEs: string;
  letter: string;
  accent: string;
  price: number;
  images: string[];
  stock: number;
  isSet: boolean;
  description: { en: string; es: string };
  rows: DetailRow[];
  /** Rendered under "Product Details" — the long-form section at the bottom. */
  story: { en: string; es: string }[];
};

export default function ProductDetail({ product }: { product: DetailProduct }) {
  const { lang } = useLang();
  const es = lang === "es";
  const router = useRouter();
  const { add } = useCart();

  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [openSection, setOpenSection] = useState<"details" | "delivery" | null>("details");

  const soldOut = product.stock <= 0;
  const title = es ? product.titleEs : product.title;
  const max = Math.max(product.stock, 0);

  function addToCart() {
    add(
      // Store the title as the shopper saw it, so the cart reads in their language.
      { slug: product.slug, title, price: product.price, image: product.images[0], accent: product.accent },
      Math.min(qty, max) || 1,
    );
  }

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "flex-start" }} className="pdp-grid">
        {/* ── Gallery ──────────────────────────────────────────────────── */}
        <div>
          <div
            style={{
              position: "relative", aspectRatio: product.isSet ? "4 / 3" : "1 / 1", background: "#EEF0F3",
              borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)",
            }}
          >
            <SmartImage
              src={product.images[active]}
              alt={`${title} — ${active + 1}`}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 520px"
              style={{ objectFit: "contain", padding: 18 }}
            />
            <div
              style={{
                position: "absolute", bottom: 12, left: 12, padding: "5px 11px", borderRadius: 100,
                background: "rgba(27,32,39,0.72)", color: "#fff", fontFamily: "var(--mono)", fontSize: "0.72rem",
              }}
            >
              {active + 1} / {product.images.length}
            </div>
          </div>

          {product.images.length > 1 && (
            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              {product.images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActive(i)}
                  aria-label={`${es ? "Imagen" : "Image"} ${i + 1}`}
                  aria-current={i === active}
                  style={{
                    position: "relative", width: 72, height: 72, borderRadius: 10, overflow: "hidden", cursor: "pointer",
                    background: "#EEF0F3", padding: 0,
                    border: i === active ? `2px solid ${product.accent}` : "1px solid var(--border-strong)",
                  }}
                >
                  <SmartImage src={src} alt="" fill sizes="72px" style={{ objectFit: "contain", padding: 4 }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Buy box ──────────────────────────────────────────────────── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span
              style={{
                display: "grid", placeItems: "center", minWidth: 34, height: 34, padding: "0 10px", borderRadius: 9,
                background: product.accent, color: "#1B2027", fontWeight: 900, fontSize: product.isSet ? "0.7rem" : "1.15rem",
              }}
            >
              {product.letter}
            </span>
            {soldOut ? (
              <span style={{ background: "#4A5366", color: "#fff", borderRadius: 5, padding: "4px 9px", fontSize: "0.62rem", fontWeight: 900, letterSpacing: "0.1em" }}>
                {es ? "AGOTADO" : "OUT OF STOCK"}
              </span>
            ) : (
              <span style={{ background: "var(--volt)", color: "var(--on-accent)", borderRadius: 5, padding: "4px 9px", fontSize: "0.62rem", fontWeight: 900, letterSpacing: "0.1em" }}>
                {es ? "NUEVO" : "NEW"}
              </span>
            )}
          </div>

          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 10px", lineHeight: 1.15 }}>
            {title}
          </h1>

          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
            <span style={{ fontWeight: 900, fontSize: "1.9rem", color: "var(--ink)" }}>${product.price.toFixed(2)}</span>
            {product.isSet && (
              <>
                <span style={{ fontSize: "1rem", color: "var(--ink-faint)", textDecoration: "line-through" }}>
                  ${(PRICE_SINGLE * 7).toFixed(2)}
                </span>
                <span style={{ background: "var(--sakura-light)", border: "1px solid var(--sakura)", color: "var(--sakura)", borderRadius: 100, padding: "4px 12px", fontSize: "0.76rem", fontWeight: 800 }}>
                  {es ? "Ahorras $25" : "Save $25"}
                </span>
              </>
            )}
          </div>

          <p style={{ color: "var(--ink-dim)", fontSize: "1rem", lineHeight: 1.7, margin: "0 0 24px" }}>
            {es ? product.description.es : product.description.en}
          </p>

          {/* Size selector — mirrors Pop Mart's Single Item / Whole Set switch. */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "0.68rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 10 }}>
              {es ? "Formato" : "Size"}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <VariantButton
                active={!product.isSet}
                label={es ? "Individual" : "Single Item"}
                sub="$25"
                onClick={() => { if (product.isSet) router.push("/shop"); }}
              />
              <VariantButton
                active={product.isSet}
                label={es ? "Set completo" : "Whole Set"}
                sub="$150"
                onClick={() => { if (!product.isSet) router.push(`/shop/${SET_SLUG}`); }}
              />
            </div>
          </div>

          {/* Quantity */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "0.68rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-faint)", marginBottom: 10 }}>
              {es ? "Cantidad" : "Quantity"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-strong)", borderRadius: 10, overflow: "hidden" }}>
                <QtyBtn onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={soldOut || qty <= 1} label="−" />
                <span style={{ minWidth: 48, textAlign: "center", color: "var(--ink)", fontWeight: 800 }}>{soldOut ? 0 : qty}</span>
                <QtyBtn onClick={() => setQty((q) => Math.min(max, q + 1))} disabled={soldOut || qty >= max} label="+" />
              </div>
              {!soldOut && (
                <span style={{ color: "var(--ink-faint)", fontSize: "0.84rem" }}>
                  {es ? `${product.stock} disponibles` : `${product.stock} available`}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {soldOut ? (
            <button
              onClick={() => setNotifyOpen(true)}
              style={{
                width: "100%", padding: "17px 0", borderRadius: 100, border: "none", cursor: "pointer",
                background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 900, fontSize: "0.98rem", letterSpacing: "0.04em",
                boxShadow: "0 8px 26px rgba(255,111,168,0.4)",
              }}
            >
              {es ? "AVÍSAME CUANDO ESTÉ DISPONIBLE" : "NOTIFY ME WHEN AVAILABLE"}
            </button>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <button
                onClick={addToCart}
                style={{
                  width: "100%", padding: "16px 0", borderRadius: 100, cursor: "pointer",
                  background: "transparent", border: "2px solid var(--sakura)", color: "var(--sakura)",
                  fontWeight: 900, fontSize: "0.95rem", letterSpacing: "0.04em",
                }}
              >
                {es ? "AÑADIR AL CARRITO" : "ADD TO CART"}
              </button>
              <button
                onClick={addToCart}
                style={{
                  width: "100%", padding: "17px 0", borderRadius: 100, border: "none", cursor: "pointer",
                  background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 900, fontSize: "0.98rem", letterSpacing: "0.04em",
                  boxShadow: "0 8px 26px rgba(255,111,168,0.4)",
                }}
              >
                {es ? "COMPRAR AHORA" : "BUY NOW"}
              </button>
            </div>
          )}

          {/* Accordions */}
          <div style={{ marginTop: 28, borderTop: "1px solid var(--border)" }}>
            <Section
              title={es ? "Detalles" : "Details"}
              open={openSection === "details"}
              onToggle={() => setOpenSection(openSection === "details" ? null : "details")}
            >
              <div style={{ display: "grid", gap: 2 }}>
                {product.rows.map((r) => (
                  <div key={r.label.en} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 14, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--ink-faint)", fontSize: "0.85rem" }}>{es ? r.label.es : r.label.en}</span>
                    <span style={{ color: "var(--ink)", fontSize: "0.88rem", lineHeight: 1.55 }}>
                      {typeof r.value === "string" ? r.value : es ? r.value.es : r.value.en}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              title={es ? "Envíos y devoluciones" : "Delivery & Returns"}
              open={openSection === "delivery"}
              onToggle={() => setOpenSection(openSection === "delivery" ? null : "delivery")}
            >
              <p style={{ color: "var(--ink-dim)", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>
                {es
                  ? "Se envía desde Nueva York, EE. UU. Cada figura va en su bolsa holográfica individual con etiqueta colgante. Cambios por defectos de fábrica dentro de los 30 días posteriores a la entrega; por tratarse de una edición limitada, no hay devoluciones por cambio de opinión una vez abierta la bolsa."
                  : "Ships from New York, USA. Each figure arrives in its own holographic bag with its hangtag attached. Manufacturing defects can be exchanged within 30 days of delivery; because this is a limited run, opened bags can’t be returned for change of mind."}
              </p>
            </Section>
          </div>
        </div>
      </div>

      {/* ── Product details long-form ───────────────────────────────────── */}
      <section style={{ marginTop: 64, paddingTop: 40, borderTop: "1px solid var(--border)" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.7rem", color: "var(--ink)", margin: "0 0 18px" }}>
          {es ? "Detalles del producto" : "Product Details"}
        </h2>
        <div style={{ display: "grid", gap: 14, maxWidth: 760 }}>
          {product.story.map((s, i) => (
            <p key={i} style={{ color: "var(--ink-dim)", fontSize: "1rem", lineHeight: 1.75, margin: 0 }}>
              {es ? s.es : s.en}
            </p>
          ))}
        </div>
      </section>

      {notifyOpen && (
        <NotifyMeModal product={product.slug} title={title} onClose={() => setNotifyOpen(false)} />
      )}

      <style>{`
        @media (max-width: 900px) {
          .pdp-grid { grid-template-columns: 1fr !important; gap: 30px !important; }
        }
      `}</style>
    </>
  );
}

function VariantButton({ active, label, sub, onClick }: { active: boolean; label: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: "11px 20px", borderRadius: 10, cursor: "pointer", textAlign: "left",
        border: active ? "2px solid var(--sakura)" : "1px solid var(--border-strong)",
        background: active ? "var(--sakura-light)" : "transparent",
        color: "var(--ink)", fontWeight: 800, fontSize: "0.88rem",
      }}
    >
      {label}
      <span style={{ display: "block", color: "var(--ink-faint)", fontWeight: 600, fontSize: "0.76rem", marginTop: 2 }}>{sub}</span>
    </button>
  );
}

function QtyBtn({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label === "+" ? "Increase quantity" : "Decrease quantity"}
      style={{
        width: 42, height: 42, border: "none", background: "var(--surface)", color: "var(--ink)",
        fontSize: "1.1rem", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
      }}
    >
      {label}
    </button>
  );
}

function Section({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 0", background: "none", border: "none", cursor: "pointer",
          color: "var(--ink)", fontWeight: 800, fontSize: "1rem", textAlign: "left",
        }}
      >
        {title}
        <span style={{ color: "var(--ink-faint)", fontSize: "1.2rem", lineHeight: 1 }}>{open ? "−" : "+"}</span>
      </button>
      {open && <div style={{ paddingBottom: 20 }}>{children}</div>}
    </div>
  );
}
