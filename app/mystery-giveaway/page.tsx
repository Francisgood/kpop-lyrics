"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackLead } from "@/lib/conversions";
import { useLang, LangToggle, type Lang } from "@/components/LangProvider";
import SmartImage from "@/components/SmartImage";
import { FEATURED_COUNTRIES, COUNTRIES } from "@/lib/countries";

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGN CONFIG — edit here, not in the copy below.
//
// PLACEHOLDERS that must be confirmed before this campaign is promoted:
//   • GRAND_PRIZE_ARV — no value is published anywhere yet. Sweepstakes rules
//     normally state an approximate retail value; leave it null and the page and
//     terms both say it will be posted before entries close.
//   • The artist, venue and exact concert date are intentionally unrevealed —
//     that is the campaign concept, not a gap. Only the month is promised.
//   • CUTOFF must stay in step with app/api/mystery-2027/route.ts.
// ─────────────────────────────────────────────────────────────────────────────
const GRAND_PRIZE_ARV: string | null = null;      // e.g. "$935" once decided
const REVEAL_DATE_EN = "Monday, January 18, 2027";
const REVEAL_DATE_ES = "lunes 18 de enero de 2027";
const CONCERT_MONTH_EN = "February 2027";
const CONCERT_MONTH_ES = "febrero de 2027";

// Prize art — deliberately generic. Using artist imagery here would give away
// the reveal, so these are the unbranded ticket and merch shots.
const PRIZE_META = [
  { img: "/giveaway/tickets.jpg", accent: "var(--volt)" },
  { img: "/giveaway/merch.jpg", accent: "var(--sky)" },
];

type Copy = {
  eyebrow: string; heroPre: string; heroEm: string; heroPost: string; subhead: string; cta: string; referred: string;
  mysteryLabel: string; mysteryBody: string;
  prizesLabel: string;
  prizes: { badge: string; title: string; sub: string }[];
  arvPending: string;
  disclaimerPre: string; disclaimerLink: string; disclaimerPost: string;
  dates: { k: string; v: string }[];
  formTitle: string; formSubtitle: string;
  phFirst: string; phLast: string; phEmail: string; phCountry: string; phPostal: string;
  submit: string; submitting: string;
  errFields: string; errGeneric: string;
  finePre: string; fineLink: string; finePost: string;
  seeAll: string;
  entered: string; alreadyEntered: string;
  resultSubPre: string; resultSubBold: string; resultSubPost: string;
  referralLinkLabel: string; copy: string; copied: string; referralsSoFar: string;
  resultFinePre: string; resultFineLink: string; resultFinePost: string; allGiveaways: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    eyebrow: "Aegyo Arena · Mystery Drop",
    heroPre: "Win two seats to a show we ", heroEm: "can't name yet", heroPost: ".",
    subhead: `One K-pop concert, ${CONCERT_MONTH_EN}. The artist stays sealed until the reveal — enter now and find out what you're holding tickets to on ${REVEAL_DATE_EN}.`,
    cta: "Enter the mystery drop",
    referred: "A friend sent you — you're both in the running. 🔒",
    mysteryLabel: "What you're entering",
    mysteryBody: `We've secured two seats to a K-pop show in ${CONCERT_MONTH_EN}. We're not naming the artist, the venue or the date yet — that's the point. Entries close first, the artist is revealed on ${REVEAL_DATE_EN}, and the draw runs the same day. You're betting on the drop, not shopping for a lineup.`,
    prizesLabel: "The prizes",
    prizes: [
      { badge: "Grand Prize", title: "Two seats to the mystery concert", sub: `Two (2) tickets to one K-pop concert in ${CONCERT_MONTH_EN}. The artist, venue and exact date are revealed on ${REVEAL_DATE_EN} — after entries have already closed.` },
      { badge: "Runner-Up", title: "$200 in official merch", sub: "One runner-up takes home $200 of official merchandise from the revealed artist, shipped after the reveal." },
    ],
    arvPending: "The approximate retail value of the grand prize will be posted in the Official Rules before entries close.",
    disclaimerPre: "No purchase necessary. Open to entrants 18+. Winners must complete identity verification and accept the campaign terms to claim. See the ",
    disclaimerLink: "Official Rules", disclaimerPost: ".",
    dates: [
      { k: "Entries close", v: "Fri, Jan 15, 2027 · 11:59 PM ET" },
      { k: "Artist revealed", v: "Monday, Jan 18, 2027" },
      { k: "Winners drawn", v: "Monday, Jan 18, 2027" },
      { k: "Concert", v: `${CONCERT_MONTH_EN} — date revealed with the artist` },
    ],
    formTitle: "Enter the mystery drop",
    formSubtitle: "One entry per person. We'll email you if you win — and add you to the Aegyo Arena newsletter so you get the reveal first.",
    phFirst: "First name", phLast: "Last name", phEmail: "Email address",
    phCountry: "Country", phPostal: "Postal code",
    submit: "Enter to win", submitting: "Entering…",
    errFields: "Please complete all fields to enter.",
    errGeneric: "Something went wrong. Please try again.",
    finePre: "By entering you confirm you are 18+ and agree to the ",
    fineLink: "Official Rules", finePost: " and to receive email from Aegyo Arena.",
    seeAll: "← See all Aegyo Arena giveaways",
    entered: "You're in!", alreadyEntered: "You're already entered!",
    resultSubPre: "The artist is revealed and winners are drawn ", resultSubBold: REVEAL_DATE_EN, resultSubPost: ". Share your link below — every friend who enters is another entry for you.",
    referralLinkLabel: "Your referral link", copy: "Copy", copied: "Copied!", referralsSoFar: "Referrals so far:",
    resultFinePre: "By entering you agree to the ", resultFineLink: "Official Rules", resultFinePost: ". Winners must be 18+, complete identity verification, and accept the campaign terms to claim.",
    allGiveaways: "← All giveaways",
  },
  es: {
    eyebrow: "Aegyo Arena · Drop Misterioso",
    heroPre: "Gana dos asientos a un show que ", heroEm: "aún no podemos nombrar", heroPost: ".",
    subhead: `Un concierto de K-pop en ${CONCERT_MONTH_ES}. El artista queda sellado hasta la revelación — participa ahora y descubre a qué show tienes boletos el ${REVEAL_DATE_ES}.`,
    cta: "Participa en el drop",
    referred: "Un amigo te invitó — ambos están participando. 🔒",
    mysteryLabel: "En qué estás participando",
    mysteryBody: `Aseguramos dos asientos para un show de K-pop en ${CONCERT_MONTH_ES}. Todavía no decimos el artista, el recinto ni la fecha — ese es el punto. Primero cierran las inscripciones, el artista se revela el ${REVEAL_DATE_ES}, y el sorteo ocurre ese mismo día. Estás apostando al drop, no eligiendo un cartel.`,
    prizesLabel: "Los premios",
    prizes: [
      { badge: "Premio mayor", title: "Dos asientos al concierto misterioso", sub: `Dos (2) boletos para un concierto de K-pop en ${CONCERT_MONTH_ES}. El artista, el recinto y la fecha exacta se revelan el ${REVEAL_DATE_ES} — después de que cierren las inscripciones.` },
      { badge: "Premio secundario", title: "$200 en merch oficial", sub: "Un ganador secundario se lleva $200 en mercancía oficial del artista revelado, enviada tras la revelación." },
    ],
    arvPending: "El valor aproximado del premio mayor se publicará en las Reglas Oficiales antes del cierre de inscripciones.",
    disclaimerPre: "No es necesario comprar. Abierto a mayores de 18 años. Los ganadores deben completar la verificación de identidad y aceptar los términos de la campaña para reclamar. Consulta las ",
    disclaimerLink: "Reglas Oficiales", disclaimerPost: ".",
    dates: [
      { k: "Cierre de inscripciones", v: "vie 15 de enero de 2027 · 11:59 PM ET" },
      { k: "Revelación del artista", v: "lunes 18 de enero de 2027" },
      { k: "Sorteo de ganadores", v: "lunes 18 de enero de 2027" },
      { k: "Concierto", v: `${CONCERT_MONTH_ES} — fecha revelada con el artista` },
    ],
    formTitle: "Participa en el drop misterioso",
    formSubtitle: "Una participación por persona. Te enviaremos un correo si ganas — y te añadiremos al boletín de Aegyo Arena para que recibas la revelación primero.",
    phFirst: "Nombre", phLast: "Apellido", phEmail: "Correo electrónico",
    phCountry: "País", phPostal: "Código postal",
    submit: "Participar", submitting: "Enviando…",
    errFields: "Por favor completa todos los campos para participar.",
    errGeneric: "Algo salió mal. Inténtalo de nuevo.",
    finePre: "Al participar confirmas que eres mayor de 18 años y aceptas las ",
    fineLink: "Reglas Oficiales", finePost: " y recibir correos de Aegyo Arena.",
    seeAll: "← Ver todos los sorteos de Aegyo Arena",
    entered: "¡Ya estás participando!", alreadyEntered: "¡Ya te habías registrado!",
    resultSubPre: "El artista se revela y los ganadores se sortean el ", resultSubBold: REVEAL_DATE_ES, resultSubPost: ". Comparte tu enlace abajo — cada amigo que participe es otra participación para ti.",
    referralLinkLabel: "Tu enlace de invitación", copy: "Copiar", copied: "¡Copiado!", referralsSoFar: "Invitaciones hasta ahora:",
    resultFinePre: "Al participar aceptas las ", resultFineLink: "Reglas Oficiales", resultFinePost: ". Los ganadores deben ser mayores de 18 años, completar la verificación de identidad y aceptar los términos de la campaña para reclamar.",
    allGiveaways: "← Todos los sorteos",
  },
};

export default function MysteryGiveaway() {
  const { lang } = useLang();
  const c = COPY[lang];

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [ref, setRef] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ referralLink: string; referralCount: number; alreadyEntered?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("ref");
    if (r) setRef(r);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName || !lastName || !email || !country || !zip) {
      setError(c.errFields); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/mystery-2027", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, zip, country, ref }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? c.errGeneric); return; }
      if (!data.alreadyEntered) trackLead(data.rdtConversionId);
      setResult({ referralLink: data.referralLink, referralCount: data.referralCount ?? 0, alreadyEntered: data.alreadyEntered });
    } catch {
      setError(c.errGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  function copyLink() {
    if (!result) return;
    navigator.clipboard?.writeText(result.referralLink).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const field: React.CSSProperties = { width: "100%", padding: "13px 16px", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: "1rem", outline: "none", background: "#fff", color: "#000", boxSizing: "border-box" };
  const sel: React.CSSProperties = { ...field, padding: "13px 8px", flex: 1, minWidth: 0 };

  if (result) {
    return (
      <main style={{ padding: "56px 24px 80px" }}>
        <div style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 10 }}>🔒</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "2.2rem", color: "var(--ink)", marginBottom: 10 }}>
            {result.alreadyEntered ? c.alreadyEntered : c.entered}
          </h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: 28 }}>
            {c.resultSubPre}<strong style={{ color: "var(--ink)" }}>{c.resultSubBold}</strong>{c.resultSubPost}
          </p>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--volt)", borderRadius: 14, padding: 22, textAlign: "left" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--volt)", marginBottom: 10 }}>{c.referralLinkLabel}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input readOnly value={result.referralLink} style={{ ...field, flex: 1, minWidth: 200, fontSize: "0.88rem" }} onFocus={(e) => e.currentTarget.select()} />
              <button type="button" onClick={copyLink} style={{ padding: "13px 20px", borderRadius: 8, border: "none", background: "var(--volt)", color: "var(--on-accent)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                {copied ? c.copied : c.copy}
              </button>
            </div>
            <div style={{ marginTop: 14, fontSize: "0.9rem", color: "var(--ink-dim)" }}>
              {c.referralsSoFar} <strong style={{ color: "var(--volt)" }}>{result.referralCount}</strong> / 50
            </div>
          </div>
          <p style={{ marginTop: 20, fontSize: "0.78rem", color: "var(--ink-faint)", lineHeight: 1.6 }}>
            {c.resultFinePre}
            <Link href="/mystery-terms" style={{ color: "var(--volt)", fontWeight: 600 }}>{c.resultFineLink}</Link>{c.resultFinePost}
          </p>
          <p style={{ marginTop: 20 }}>
            <Link href="/giveaways" style={{ color: "var(--ink-dim)", fontWeight: 600, fontSize: "0.9rem" }}>{c.allGiveaways}</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: "0 0 72px" }}>
      {/* Hero — no artist imagery, by design */}
      <section style={{ background: "linear-gradient(180deg, rgba(20,20,28,0.96), var(--bg))", borderBottom: "1px solid var(--border)", padding: "40px 24px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <LangToggle />
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--volt)", marginBottom: 16 }}>{c.eyebrow}</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.4rem, 9vw, 4rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 14px", lineHeight: 1.05 }}>
            {c.heroPre}<em style={{ color: "var(--volt)", fontStyle: "italic" }}>{c.heroEm}</em>{c.heroPost}
          </h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "clamp(1rem, 3.5vw, 1.15rem)", lineHeight: 1.6, maxWidth: 560, margin: "0 auto 24px" }}>
            {c.subhead}
          </p>
          <div style={{ position: "relative", width: "100%", maxWidth: 560, margin: "0 auto 26px", aspectRatio: "16 / 10", borderRadius: 18, overflow: "hidden", border: "1px dashed var(--volt)", background: "linear-gradient(135deg, rgba(10,10,14,0.98), rgba(40,30,60,0.9))", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span aria-hidden style={{ fontFamily: "var(--serif)", fontSize: "clamp(5rem, 22vw, 9rem)", color: "var(--volt)", lineHeight: 1, opacity: 0.92 }}>?</span>
            <span style={{ position: "absolute", bottom: 16, fontFamily: "var(--mono)", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
              {lang === "es" ? "Artista sellado hasta la revelación" : "Artist sealed until the reveal"}
            </span>
          </div>
          <a href="#enter" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 34px", borderRadius: 100, background: "var(--volt)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.03em", textTransform: "uppercase", textDecoration: "none" }}>
            {c.cta}
          </a>
          {ref && <p style={{ marginTop: 16, fontSize: "0.85rem", color: "var(--volt)" }}>{c.referred}</p>}
        </div>
      </section>

      {/* What the mystery actually is — the honesty section */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px 0" }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, padding: "24px 26px" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--volt)", marginBottom: 10 }}>{c.mysteryLabel}</div>
          <p style={{ color: "var(--ink-dim)", fontSize: "0.98rem", lineHeight: 1.7, margin: 0 }}>{c.mysteryBody}</p>
        </div>
      </section>

      {/* Prizes */}
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "36px 24px 8px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--volt)", marginBottom: 18 }}>{c.prizesLabel}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 20 }}>
          {PRIZE_META.map((m, i) => {
            const p = c.prizes[i];
            return (
              <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 10", overflow: "hidden" }}>
                  <SmartImage src={m.img} alt={p.title} fill sizes="(max-width: 760px) 100vw, 500px" style={{ objectFit: "cover" }} />
                  <span style={{ position: "absolute", top: 14, left: 14, background: "rgba(15,15,18,0.82)", color: "#fff", fontFamily: "var(--mono)", fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 100, border: `1px solid ${m.accent}` }}>{p.badge}</span>
                </div>
                <div style={{ padding: "20px 22px 24px" }}>
                  <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 8px", lineHeight: 1.2 }}>{p.title}</h2>
                  <p style={{ color: "var(--ink-dim)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>{p.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
        {!GRAND_PRIZE_ARV && (
          <p style={{ marginTop: 14, fontSize: "0.78rem", color: "var(--ink-faint)", lineHeight: 1.6 }}>{c.arvPending}</p>
        )}
        <p style={{ marginTop: 10, fontSize: "0.74rem", color: "var(--ink-faint)", lineHeight: 1.6 }}>
          {c.disclaimerPre}
          <Link href="/mystery-terms" style={{ color: "var(--volt)", fontWeight: 600 }}>{c.disclaimerLink}</Link>{c.disclaimerPost}
        </p>
      </section>

      {/* Key dates */}
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "28px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 14 }}>
          {c.dates.map((d) => (
            <div key={d.k} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--volt)", marginBottom: 6 }}>{d.k}</div>
              <div style={{ color: "var(--ink)", fontWeight: 700, fontSize: "0.98rem" }}>{d.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Entry form */}
      <section id="enter" style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 0", scrollMarginTop: 24 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.7rem, 5vw, 2.2rem)", fontWeight: 700, color: "var(--ink)", textAlign: "center", margin: "0 0 8px" }}>{c.formTitle}</h2>
        <p style={{ textAlign: "center", color: "var(--ink-dim)", fontSize: "0.98rem", lineHeight: 1.6, marginBottom: 28 }}>
          {c.formSubtitle}
        </p>
        <form onSubmit={submit} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input style={field} placeholder={c.phFirst} value={firstName} onChange={(e) => setFirstName(e.target.value)} aria-label={c.phFirst} />
            <input style={field} placeholder={c.phLast} value={lastName} onChange={(e) => setLastName(e.target.value)} aria-label={c.phLast} />
            <input style={field} type="email" placeholder={c.phEmail} value={email} onChange={(e) => setEmail(e.target.value)} aria-label={c.phEmail} />
            <div style={{ display: "flex", gap: 8 }}>
              <select style={{ ...sel, flex: "1 1 45%" }} value={country} onChange={(e) => setCountry(e.target.value)} aria-label={c.phCountry}>
                <option value="">{c.phCountry}</option>
                {FEATURED_COUNTRIES.map((cn) => <option key={`f-${cn}`} value={cn}>{cn}</option>)}
                <option value="" disabled>──────────</option>
                {COUNTRIES.map((cn) => <option key={cn} value={cn}>{cn}</option>)}
              </select>
              <input style={{ ...field, flex: "1 1 55%", minWidth: 0 }} autoComplete="postal-code" placeholder={c.phPostal} value={zip} onChange={(e) => setZip(e.target.value)} aria-label={c.phPostal} />
            </div>
          </div>
          {error && (
            <div role="alert" style={{ marginTop: 16, color: "#ff5a5a", fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.5 }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={submitting} style={{ width: "100%", marginTop: 20, padding: "15px", borderRadius: 10, border: "none", background: submitting ? "var(--border-strong)" : "var(--volt)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.04em", textTransform: "uppercase", cursor: submitting ? "not-allowed" : "pointer" }}>
            {submitting ? c.submitting : c.submit}
          </button>
          <p style={{ marginTop: 16, fontSize: "0.78rem", color: "var(--ink-faint)", textAlign: "center", lineHeight: 1.6 }}>
            {c.finePre}
            <Link href="/mystery-terms" style={{ color: "var(--volt)", fontWeight: 600 }}>{c.fineLink}</Link>{c.finePost}
          </p>
        </form>
        <p style={{ marginTop: 22, textAlign: "center" }}>
          <Link href="/giveaways" style={{ color: "var(--ink-dim)", fontWeight: 600, fontSize: "0.9rem" }}>{c.seeAll}</Link>
        </p>
      </section>
    </main>
  );
}
