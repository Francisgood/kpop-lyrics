"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import { useLang } from "@/components/LangProvider";
import {
  PLUSHIES, PRICE_SET, PRICE_SINGLE, SET_IMAGES, SET_SLUG,
  STOCK_PER_CHARACTER, setStock, type Plushie,
} from "@/lib/plushies";

type Card = {
  slug: string;
  title: string;
  titleEs?: string;
  letter: string;
  price: number;
  image: string;
  accent: string;
  stock: number;
  isSet: boolean;
  order: number;
};

const cards = (): Card[] => [
  {
    slug: SET_SLUG,
    title: "Complete DAEBAK! Set of 7",
    titleEs: "Set completo DAEBAK! de 7",
    letter: "DAEBAK!",
    price: PRICE_SET,
    image: SET_IMAGES[0],
    accent: "var(--sakura)",
    stock: setStock(),
    isSet: true,
    order: -1,
  },
  ...PLUSHIES.map((p: Plushie) => ({
    slug: p.slug,
    title: `${p.member} Plush Pendant`,
    titleEs: `Colgante de peluche ${p.member}`,
    letter: p.letter,
    price: PRICE_SINGLE,
    image: p.images[0],
    accent: p.accent,
    stock: p.stock,
    isSet: false,
    order: p.order,
  })),
];

type Filter = "all" | "single" | "set";
type Sort = "featured" | "word" | "price-asc" | "price-desc";

export default function ShopGrid() {
  const { lang } = useLang();
  const es = lang === "es";
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("featured");

  const visible = useMemo(() => {
    const list = cards().filter((c) => (filter === "all" ? true : filter === "set" ? c.isSet : !c.isSet));
    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...list].sort((a, b) => b.price - a.price);
      case "word":
        // Strict DAEBAK! reading order, with the set card after the letters.
        return [...list].sort((a, b) => (a.isSet ? 99 : a.order) - (b.isSet ? 99 : b.order));
      default:
        return list; // featured — the set first, then the seven in word order
    }
  }, [filter, sort]);

  const chip = (active: boolean): React.CSSProperties => ({
    padding: "9px 18px", borderRadius: 100, cursor: "pointer", fontSize: "0.82rem", fontWeight: 800,
    letterSpacing: "0.03em", textTransform: "uppercase",
    border: active ? "1px solid var(--sakura)" : "1px solid var(--border-strong)",
    background: active ? "var(--sakura)" : "transparent",
    color: active ? "var(--on-accent)" : "var(--ink-dim)",
  });

  return (
    <>
      {/* Filter / sort bar */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
          paddingBottom: 20, marginBottom: 28, borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={chip(filter === "all")} onClick={() => setFilter("all")}>{es ? "Todo" : "All"}</button>
          <button style={chip(filter === "single")} onClick={() => setFilter("single")}>{es ? "Individuales" : "Singles"}</button>
          <button style={chip(filter === "set")} onClick={() => setFilter("set")}>{es ? "Set completo" : "Full set"}</button>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
            {es ? "Ordenar" : "Sort"}
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            style={{
              padding: "9px 12px", borderRadius: 8, border: "1px solid var(--border-strong)",
              background: "var(--bg-card)", color: "var(--ink)", fontSize: "0.85rem", cursor: "pointer",
            }}
          >
            <option value="featured">{es ? "Destacados" : "Featured"}</option>
            <option value="word">{es ? "Orden de DAEBAK!" : "DAEBAK! order"}</option>
            <option value="price-asc">{es ? "Precio: menor a mayor" : "Price: low to high"}</option>
            <option value="price-desc">{es ? "Precio: mayor a menor" : "Price: high to low"}</option>
          </select>
        </label>
      </div>

      {/* Product grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(236px, 1fr))", gap: 22 }}>
        {visible.map((c) => {
          const soldOut = c.stock <= 0;
          const low = !soldOut && c.stock <= 10;
          return (
            <Link
              key={c.slug}
              href={`/shop/${c.slug}`}
              style={{
                textDecoration: "none", display: "flex", flexDirection: "column",
                background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden",
              }}
            >
              <div style={{ position: "relative", aspectRatio: c.isSet ? "4 / 3" : "1 / 1", background: "#EEF0F3" }}>
                <SmartImage
                  src={c.image}
                  alt={es ? c.titleEs ?? c.title : c.title}
                  fill
                  sizes="(max-width: 760px) 50vw, 260px"
                  style={{ objectFit: "contain", padding: c.isSet ? 8 : 14 }}
                />
                <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {soldOut ? <Badge bg="#4A5366" fg="#FFF">{es ? "AGOTADO" : "OUT OF STOCK"}</Badge> : null}
                  {low ? <Badge bg="var(--tangerine)" fg="var(--on-accent)">{es ? "ÚLTIMAS" : "LOW STOCK"}</Badge> : null}
                  {!soldOut && !low ? <Badge bg="var(--volt)" fg="var(--on-accent)">{es ? "NUEVO" : "NEW"}</Badge> : null}
                </div>
                <div
                  aria-hidden
                  style={{
                    position: "absolute", bottom: 10, right: 10, minWidth: 30, height: 30, padding: "0 9px",
                    borderRadius: 8, background: c.accent, color: "#1B2027", display: "grid", placeItems: "center",
                    fontWeight: 900, fontSize: c.isSet ? "0.68rem" : "0.95rem", letterSpacing: c.isSet ? "0.04em" : 0,
                  }}
                >
                  {c.letter}
                </div>
              </div>
              <div style={{ padding: "16px 16px 18px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: "0.64rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
                  BABY-T-S
                </div>
                <div style={{ fontWeight: 800, fontSize: "0.98rem", color: "var(--ink)", lineHeight: 1.35 }}>
                  {es ? c.titleEs ?? c.title : c.title}
                </div>
                <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontWeight: 900, fontSize: "1.1rem", color: "var(--ink)" }}>${c.price.toFixed(2)}</span>
                  {c.isSet && (
                    <span style={{ fontSize: "0.8rem", color: "var(--ink-dim)" }}>
                      {es ? "los 7 babies" : "all 7 babies"}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.76rem", color: soldOut ? "var(--ink-faint)" : "var(--ink-dim)" }}>
                  {soldOut
                    ? es ? "Avísame cuando esté disponible" : "Notify me when available"
                    : c.isSet
                      ? es ? `${c.stock} sets disponibles` : `${c.stock} sets available`
                      : es ? `${c.stock} de ${STOCK_PER_CHARACTER} disponibles` : `${c.stock} of ${STOCK_PER_CHARACTER} available`}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function Badge({ children, bg, fg }: { children: React.ReactNode; bg: string; fg: string }) {
  return (
    <span
      style={{
        background: bg, color: fg, borderRadius: 5, padding: "4px 8px",
        fontSize: "0.6rem", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}
