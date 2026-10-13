"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import { useLang } from "@/components/LangProvider";

// Cart for the BABY-T-S drop. Lives in localStorage only — there's no payment
// processor wired up to this site yet, so checkout ends in a waitlist capture
// rather than a charge. Swapping that last step for Stripe/Shopify means
// replacing `CheckoutPanel` below; nothing else in the cart has to change.

export type CartLine = {
  slug: string;
  title: string;
  price: number;
  qty: number;
  image: string;
  accent: string;
};

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "babyts-cart-v1";

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside <CartProvider>");
  return c;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* private mode / blocked storage — start empty */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* nothing to do — the cart just won't survive a reload */
    }
  }, [lines, hydrated]);

  const add = useCallback((line: Omit<CartLine, "qty">, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.slug === line.slug);
      if (i === -1) return [...prev, { ...line, qty }];
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + qty };
      return next;
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.slug !== slug) : prev.map((l) => (l.slug === slug ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback((slug: string) => setLines((prev) => prev.filter((l) => l.slug !== slug)), []);

  const value = useMemo<CartCtx>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((n, l) => n + l.qty * l.price, 0),
      add,
      setQty,
      remove,
      open,
      setOpen,
    }),
    [lines, open, add, setQty, remove],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartButton />
      <CartDrawer />
    </Ctx.Provider>
  );
}

/* ── Floating cart button ─────────────────────────────────────────────────── */

function CartButton() {
  const { count, setOpen } = useCart();
  if (count === 0) return null;
  return (
    <button
      onClick={() => setOpen(true)}
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      style={{
        position: "fixed", right: 20, bottom: 20, zIndex: 60,
        display: "flex", alignItems: "center", gap: 10,
        padding: "14px 22px", borderRadius: 100, border: "none", cursor: "pointer",
        background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 900, fontSize: "0.95rem",
        boxShadow: "0 10px 30px rgba(255,111,168,0.45)",
      }}
    >
      <span style={{ fontSize: "1.1rem" }}>🛒</span>
      <span>{count}</span>
    </button>
  );
}

/* ── Drawer ───────────────────────────────────────────────────────────────── */

function CartDrawer() {
  const { lines, subtotal, setQty, remove, open, setOpen } = useCart();
  const { lang } = useLang();
  const es = lang === "es";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={es ? "Carrito" : "Cart"}
      style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", justifyContent: "flex-end" }}
    >
      <div onClick={() => setOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
      <aside
        style={{
          position: "relative", width: "min(420px, 100%)", height: "100%", overflowY: "auto",
          background: "var(--bg-card)", borderLeft: "1px solid var(--border-strong)",
          padding: "24px 22px 40px", boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", color: "var(--ink)", margin: 0 }}>
            {es ? "Tu carrito" : "Your cart"}
          </h2>
          <button
            onClick={() => setOpen(false)}
            aria-label={es ? "Cerrar" : "Close"}
            style={{ background: "none", border: "none", color: "var(--ink-dim)", fontSize: "1.6rem", cursor: "pointer", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <p style={{ color: "var(--ink-dim)" }}>{es ? "Tu carrito está vacío." : "Your cart is empty."}</p>
        ) : (
          <>
            <div style={{ display: "grid", gap: 14 }}>
              {lines.map((l) => (
                <div key={l.slug} style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
                  <Link
                    href={`/shop/${l.slug}`}
                    onClick={() => setOpen(false)}
                    style={{ position: "relative", width: 68, height: 68, flexShrink: 0, borderRadius: 10, overflow: "hidden", background: "#EEF0F3", border: `1px solid ${l.accent}44` }}
                  >
                    <SmartImage src={l.image} alt={l.title} fill sizes="68px" style={{ objectFit: "contain" }} />
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--ink)", lineHeight: 1.35 }}>{l.title}</div>
                    <div style={{ color: "var(--ink-dim)", fontSize: "0.85rem", marginTop: 3 }}>${l.price.toFixed(2)}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                      <Stepper qty={l.qty} onChange={(q) => setQty(l.slug, q)} />
                      <button
                        onClick={() => remove(l.slug)}
                        style={{ background: "none", border: "none", color: "var(--ink-faint)", fontSize: "0.78rem", cursor: "pointer", textDecoration: "underline" }}
                      >
                        {es ? "Quitar" : "Remove"}
                      </button>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: "var(--ink)", fontSize: "0.95rem" }}>${(l.price * l.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "20px 0 18px" }}>
              <span style={{ color: "var(--ink-dim)", fontSize: "0.95rem" }}>{es ? "Subtotal" : "Subtotal"}</span>
              <span style={{ fontWeight: 900, fontSize: "1.35rem", color: "var(--ink)" }}>${subtotal.toFixed(2)}</span>
            </div>

            <CheckoutPanel />
          </>
        )}
      </aside>
    </div>
  );
}

function Stepper({ qty, onChange }: { qty: number; onChange: (q: number) => void }) {
  const btn: React.CSSProperties = {
    width: 26, height: 26, borderRadius: 6, border: "1px solid var(--border-strong)",
    background: "var(--surface)", color: "var(--ink)", cursor: "pointer", fontSize: "1rem", lineHeight: 1,
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button style={btn} onClick={() => onChange(qty - 1)} aria-label="Decrease quantity">−</button>
      <span style={{ minWidth: 18, textAlign: "center", color: "var(--ink)", fontWeight: 700, fontSize: "0.9rem" }}>{qty}</span>
      <button style={btn} onClick={() => onChange(qty + 1)} aria-label="Increase quantity">+</button>
    </div>
  );
}

/* ── Checkout ─────────────────────────────────────────────────────────────── */

/**
 * There is no payment processor on this site yet, so the honest end of the
 * funnel is a launch-day alert rather than a fake card form. Replace this whole
 * component with the Stripe/Shopify redirect when that's live.
 */
function CheckoutPanel() {
  const { lines } = useCart();
  const { lang } = useLang();
  const es = lang === "es";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErr(null);
    try {
      const res = await fetch("/api/notify-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: `checkout-waitlist:${lines.map((l) => l.slug).join("+")}`, email }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErr(d.error ?? (es ? "Algo salió mal." : "Something went wrong."));
        setStatus("error");
        return;
      }
      setStatus("ok");
    } catch {
      setErr(es ? "Revisa tu conexión e inténtalo de nuevo." : "Check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div style={{ background: "var(--sakura-light)", border: "1px solid var(--sakura)", borderRadius: 12, padding: "18px 20px" }}>
        <div style={{ fontWeight: 800, color: "var(--ink)" }}>{es ? "¡Listo! 💜" : "You’re on the list 💜"}</div>
        <div style={{ color: "var(--ink-dim)", fontSize: "0.88rem", marginTop: 4 }}>
          {es
            ? "Te avisamos en cuanto abra el pago — tu carrito se queda guardado."
            : "We’ll email you the moment checkout opens — your cart stays saved."}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ fontWeight: 800, color: "var(--ink)", fontSize: "0.95rem" }}>
        {es ? "El pago abre el día del lanzamiento" : "Checkout opens on drop day"}
      </div>
      <div style={{ color: "var(--ink-dim)", fontSize: "0.85rem", margin: "6px 0 14px", lineHeight: 1.5 }}>
        {es
          ? "Deja tu correo y te mandamos el enlace de pago antes que a nadie."
          : "Leave your email and we’ll send you the checkout link before anyone else."}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={status === "loading"}
          aria-label={es ? "Correo electrónico" : "Email address"}
          style={{ flex: 1, minWidth: 170, padding: "12px 14px", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: "0.95rem", background: "#fff", color: "#000", boxSizing: "border-box" }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          style={{ padding: "12px 20px", borderRadius: 8, border: "none", background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.9rem", cursor: "pointer" }}
        >
          {status === "loading" ? (es ? "…" : "…") : es ? "Avísame" : "Notify me"}
        </button>
      </div>
      {err && <div style={{ color: "#FF8C9B", fontSize: "0.82rem", marginTop: 10 }}>{err}</div>}
    </form>
  );
}
