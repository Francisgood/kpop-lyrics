"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackLead } from "@/lib/conversions";
import { useLang, LangToggle, type Lang } from "@/components/LangProvider";

const MONTHS: Record<Lang, string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
};

// Country picker — top traffic markets pinned first, then the full list A–Z.
// Values stay in English so the admin export / API data stays consistent across languages.
const FEATURED_COUNTRIES = ["Mexico", "Brazil", "Argentina", "Chile", "Colombia", "Peru", "Philippines", "Indonesia", "United States", "Canada"];
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Brazzaville)",
  "Congo (Kinshasa)", "Costa Rica", "Côte d’Ivoire", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica",
  "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea",
  "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq",
  "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
  "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Madagascar",
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
  "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "São Tomé and Príncipe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan",
  "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
  "Zambia", "Zimbabwe",
];

const PRIZE_META = [
  { img: "/giveaway/tickets.jpg", accent: "var(--sakura)" },
  { img: "/giveaway/merch.jpg", accent: "var(--volt)" },
];

type Copy = {
  eyebrow: string; heroPre: string; heroEm: string; subhead: string; cta: string; referred: string;
  closedTitle: string; closedBody: string; closedCta: string;
  prizesLabel: string;
  prizes: { badge: string; title: string; sub: string }[];
  disclaimerPre: string; disclaimerLink: string; disclaimerPost: string;
  formTitle: string; formSubtitle: string;
  phFirst: string; phLast: string; phEmail: string; phPhone: string; birthday: string;
  phMonth: string; phDay: string; phYear: string; phCountry: string; phPostal: string;
  submit: string; submitting: string;
  ageError: string; errFields: string; errGeneric: string;
  finePre: string; fineLink: string; finePost: string;
  entered: string; alreadyEntered: string;
  resultSubPre: string; resultSubBold: string; resultSubPost: string;
  referralLinkLabel: string; copy: string; copied: string; referralsSoFar: string;
  resultFinePre: string; resultFineLink: string; resultFinePost: string;
};

const COPY: Record<Lang, Copy> = {
  en: {
    eyebrow: "Aegyo Arena · BTS ARMY",
    heroPre: "BTS ARMY ", heroEm: "Giveaway.",
    subhead: "Enter for your chance to win exclusive BTS merch, signed albums & concert tickets. Refer friends to multiply your entries.",
    cta: "Enter Now →",
    closedTitle: "Entries are closed",
    closedBody: "The subscriber roster is frozen. Follow the public draw page for the manifest commitment, rehearsal, and Chainlink verification evidence.",
    closedCta: "View draw transparency →",
    referred: "A friend referred you — enter below so their referral counts! 💜",
    prizesLabel: "Prizes",
    prizes: [
      { badge: "🏆 Grand Prize", title: "2 Luxury Box Seat Tickets", sub: "BTS Arirang World Tour · MetLife Stadium, East Rutherford NJ · August 1, 2026" },
      { badge: "Runner-up Prize", title: "BTS Merch Bundle", sub: "$300 value · hoodies, photobooks, official lightstick & more" },
    ],
    disclaimerPre: "No purchase necessary. Open to entrants 18+ where permitted by law. Prizes shown are illustrative. See the ",
    disclaimerLink: "Official Rules", disclaimerPost: ".",
    formTitle: "Enter the sweepstakes",
    formSubtitle: "Free to enter. One entry per person — then refer friends to boost your odds.",
    phFirst: "First Name", phLast: "Last Name", phEmail: "Email Address",
    phPhone: "Phone number (with country code, e.g. +52…)", birthday: "Birthday",
    phMonth: "Month", phDay: "Day", phYear: "Year", phCountry: "Country", phPostal: "Postal code",
    submit: "Submit Your Entry →", submitting: "Submitting…",
    ageError: "Sorry — this giveaway is only open to entrants who are 18 or older.",
    errFields: "Please complete all fields to enter.",
    errGeneric: "Something went wrong. Please try again.",
    finePre: "No purchase necessary. By submitting your entry, you agree to the ",
    fineLink: "Official Sweepstakes Rules", finePost: " and to subscribe to the Aegyo Arena email newsletter.",
    entered: "You’re entered!", alreadyEntered: "You’re already entered!",
    resultSubPre: "Want better odds? Refer friends — every valid referral is an extra shot at the tickets, up to ",
    resultSubBold: "50 referrals", resultSubPost: ".",
    referralLinkLabel: "Your referral link", copy: "Copy", copied: "Copied!", referralsSoFar: "Referrals so far:",
    resultFinePre: "Referrals count only when your friend is 18+, accepts the rules, and joins the newsletter. See the ",
    resultFineLink: "Official Rules", resultFinePost: " (Section 16).",
  },
  es: {
    eyebrow: "Aegyo Arena · BTS ARMY",
    heroPre: "Sorteo ", heroEm: "BTS ARMY.",
    subhead: "Participa por la oportunidad de ganar merch exclusivo de BTS, álbumes firmados y boletos para el concierto. Invita a tus amigos para multiplicar tus participaciones.",
    cta: "Participa ahora →",
    closedTitle: "Las inscripciones están cerradas",
    closedBody: "La lista de suscriptores ya está congelada. Sigue la página pública del sorteo para ver el manifiesto, el ensayo y la evidencia de verificación de Chainlink.",
    closedCta: "Ver la transparencia del sorteo →",
    referred: "Un amigo te invitó — participa abajo para que su invitación cuente. 💜",
    prizesLabel: "Premios",
    prizes: [
      { badge: "🏆 Premio mayor", title: "2 boletos de palco de lujo", sub: "BTS Arirang World Tour · MetLife Stadium, East Rutherford NJ · 1 de agosto de 2026" },
      { badge: "Premio secundario", title: "Paquete de merch de BTS", sub: "Valor de $300 · sudaderas, photobooks, lightstick oficial y más" },
    ],
    disclaimerPre: "No es necesario comprar. Abierto a mayores de 18 años donde lo permita la ley. Las imágenes de los premios son ilustrativas. Consulta las ",
    disclaimerLink: "Reglas Oficiales", disclaimerPost: ".",
    formTitle: "Participa en el sorteo",
    formSubtitle: "Participación gratuita. Una participación por persona — luego invita a tus amigos para mejorar tus posibilidades.",
    phFirst: "Nombre", phLast: "Apellido", phEmail: "Correo electrónico",
    phPhone: "Teléfono (con código de país, ej. +52…)", birthday: "Fecha de nacimiento",
    phMonth: "Mes", phDay: "Día", phYear: "Año", phCountry: "País", phPostal: "Código postal",
    submit: "Enviar mi participación →", submitting: "Enviando…",
    ageError: "Lo sentimos — este sorteo solo está abierto a mayores de 18 años.",
    errFields: "Por favor completa todos los campos para participar.",
    errGeneric: "Algo salió mal. Inténtalo de nuevo.",
    finePre: "No es necesario comprar. Al enviar tu participación, aceptas las ",
    fineLink: "Reglas Oficiales del Sorteo", finePost: " y te suscribes al boletín de Aegyo Arena.",
    entered: "¡Ya estás participando!", alreadyEntered: "¡Ya te habías registrado!",
    resultSubPre: "¿Quieres más posibilidades? Invita a tus amigos — cada invitación válida es una oportunidad extra de ganar los boletos, hasta ",
    resultSubBold: "50 invitaciones", resultSubPost: ".",
    referralLinkLabel: "Tu enlace de invitación", copy: "Copiar", copied: "¡Copiado!", referralsSoFar: "Invitaciones hasta ahora:",
    resultFinePre: "Las invitaciones cuentan solo cuando tu amigo es mayor de 18 años, acepta las reglas y se suscribe al boletín. Consulta las ",
    resultFineLink: "Reglas Oficiales", resultFinePost: " (Sección 16).",
  },
};

export default function BtsGiveawayPage() {
  const entryClosed = true;
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => thisYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const { lang } = useLang();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [ref, setRef] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ referralLink: string; referralCount: number; alreadyEntered?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const c = COPY[lang];

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("ref");
    if (r) setRef(r);
  }, []);
  // Language now comes from the site-wide LangProvider, which owns persistence
  // and the Spanish-browser default — so the choice follows the user off this page.

  function computeAge(): number | null {
    if (!month || !day || !year) return null;
    const b = new Date(Number(year), Number(month) - 1, Number(day));
    const now = new Date();
    let age = now.getFullYear() - b.getFullYear();
    const md = now.getMonth() - b.getMonth();
    if (md < 0 || (md === 0 && now.getDate() < b.getDate())) age--;
    return age;
  }
  const under18 = (() => { const a = computeAge(); return a !== null && a < 18; })();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (under18) { setError(c.ageError); return; }
    if (!firstName || !lastName || !email || !phone || !month || !day || !year || !country || !zip) {
      setError(c.errFields);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/giveaway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, zip, country, birthMonth: month, birthDay: day, birthYear: year, ref }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? c.errGeneric); return; }
      // Ad-pixel conversion: fire "lead" only on a NEW entry (not a returning entrant)
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
          <div style={{ fontSize: "3rem", marginBottom: 10 }}>💜</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "2.2rem", color: "var(--ink)", marginBottom: 10 }}>
            {result.alreadyEntered ? c.alreadyEntered : c.entered}
          </h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: 28 }}>
            {c.resultSubPre}<strong style={{ color: "var(--ink)" }}>{c.resultSubBold}</strong>{c.resultSubPost}
          </p>

          <div style={{ background: "var(--bg-card)", border: "1px solid var(--sakura)", borderRadius: 14, padding: 22, textAlign: "left" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 10 }}>{c.referralLinkLabel}</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input readOnly value={result.referralLink} style={{ ...field, flex: 1, minWidth: 200, fontSize: "0.88rem" }} onFocus={(e) => e.currentTarget.select()} />
              <button type="button" onClick={copyLink} style={{ padding: "13px 20px", borderRadius: 8, border: "none", background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                {copied ? c.copied : c.copy}
              </button>
            </div>
            <div style={{ marginTop: 14, fontSize: "0.9rem", color: "var(--ink-dim)" }}>
              {c.referralsSoFar} <strong style={{ color: "var(--sakura)" }}>{result.referralCount}</strong> / 50
            </div>
          </div>

          <p style={{ marginTop: 20, fontSize: "0.78rem", color: "var(--ink-faint)", lineHeight: 1.6 }}>
            {c.resultFinePre}
            <Link href="/bts-sweepstakes-terms" style={{ color: "var(--sakura)", fontWeight: 600 }}>{c.resultFineLink}</Link>{c.resultFinePost}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: "0 0 72px" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(180deg, var(--sakura-light), var(--bg))", borderBottom: "1px solid var(--border)", padding: "40px 24px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <LangToggle />
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 16 }}>{c.eyebrow}</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.4rem, 9vw, 4rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 16px", lineHeight: 1.05 }}>
            {c.heroPre}<em style={{ color: "var(--sakura)", fontStyle: "italic" }}>{c.heroEm}</em>
          </h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "clamp(1rem, 3.5vw, 1.15rem)", lineHeight: 1.6, maxWidth: 540, margin: "0 auto 28px" }}>
            {c.subhead}
          </p>
          <a href={entryClosed ? "/bts-giveaway/draw" : "#enter"} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 34px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.03em", textTransform: "uppercase", textDecoration: "none" }}>
            {entryClosed ? c.closedCta : c.cta}
          </a>
          {ref && <p style={{ marginTop: 16, fontSize: "0.85rem", color: "var(--volt)" }}>{c.referred}</p>}
        </div>
      </section>

      {/* Prizes */}
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "44px 24px 8px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 18 }}>{c.prizesLabel}</div>
        {/* minmax(min(300px,100%)) → side-by-side on desktop, full-width stacked (tickets above merch) on mobile, never overflows narrow screens */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 20 }}>
          {PRIZE_META.map((m, i) => {
            const p = c.prizes[i];
            return (
              <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 10", overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.img} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <span style={{ position: "absolute", top: 14, left: 14, background: "rgba(15,15,18,0.82)", color: "#fff", fontFamily: "var(--mono)", fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 100, border: `1px solid ${m.accent}` }}>
                    {p.badge}
                  </span>
                </div>
                <div style={{ padding: "20px 22px 24px" }}>
                  <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 8px", lineHeight: 1.2 }}>{p.title}</h2>
                  <p style={{ color: "var(--ink-dim)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>{p.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ marginTop: 16, fontSize: "0.74rem", color: "var(--ink-faint)", lineHeight: 1.6 }}>
          {c.disclaimerPre}
          <Link href="/bts-sweepstakes-terms" style={{ color: "var(--sakura)", fontWeight: 600 }}>{c.disclaimerLink}</Link>{c.disclaimerPost}
        </p>
      </section>

      {/* Entry form */}
      <section id="enter" style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px 0", scrollMarginTop: 24 }}>
        {entryClosed ? (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 24px", textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.7rem, 5vw, 2.2rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 10px" }}>{c.closedTitle}</h2>
            <p style={{ color: "var(--ink-dim)", fontSize: "0.98rem", lineHeight: 1.6, margin: "0 0 20px" }}>{c.closedBody}</p>
            <Link href="/bts-giveaway/draw" className="btn-yellow">{c.closedCta}</Link>
          </div>
        ) : (
          <>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.7rem, 5vw, 2.2rem)", fontWeight: 700, color: "var(--ink)", textAlign: "center", margin: "0 0 8px" }}>{c.formTitle}</h2>
        <p style={{ textAlign: "center", color: "var(--ink-dim)", fontSize: "0.98rem", lineHeight: 1.6, marginBottom: 28 }}>
          {c.formSubtitle}
        </p>

        <form onSubmit={submit} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input style={field} placeholder={c.phFirst} value={firstName} onChange={(e) => setFirstName(e.target.value)} aria-label={c.phFirst} />
            <input style={field} placeholder={c.phLast} value={lastName} onChange={(e) => setLastName(e.target.value)} aria-label={c.phLast} />
            <input style={field} type="email" placeholder={c.phEmail} value={email} onChange={(e) => setEmail(e.target.value)} aria-label={c.phEmail} />
            <input style={field} type="tel" autoComplete="tel" placeholder={c.phPhone} value={phone} onChange={(e) => setPhone(e.target.value)} aria-label={c.phPhone} />

            <div>
              <label style={{ display: "block", fontWeight: 700, color: "var(--ink)", fontSize: "0.95rem", marginBottom: 8 }}>{c.birthday}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <select style={sel} value={month} onChange={(e) => setMonth(e.target.value)} aria-label={c.phMonth}>
                  <option value="">{c.phMonth}</option>
                  {MONTHS[lang].map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select style={sel} value={day} onChange={(e) => setDay(e.target.value)} aria-label={c.phDay}>
                  <option value="">{c.phDay}</option>
                  {days.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select style={sel} value={year} onChange={(e) => setYear(e.target.value)} aria-label={c.phYear}>
                  <option value="">{c.phYear}</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

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

          {(under18 || error) && (
            <div role="alert" style={{ marginTop: 16, color: "#ff5a5a", fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.5 }}>
              {under18 ? c.ageError : error}
            </div>
          )}

          <button type="submit" disabled={under18 || submitting} style={{ width: "100%", marginTop: 20, padding: "15px", borderRadius: 10, border: "none", background: (under18 || submitting) ? "var(--border-strong)" : "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.04em", textTransform: "uppercase", cursor: (under18 || submitting) ? "not-allowed" : "pointer" }}>
            {submitting ? c.submitting : c.submit}
          </button>

          <p style={{ marginTop: 16, fontSize: "0.78rem", color: "var(--ink-faint)", textAlign: "center", lineHeight: 1.6 }}>
            {c.finePre}
            <Link href="/bts-sweepstakes-terms" style={{ color: "var(--sakura)", fontWeight: 600 }}>{c.fineLink}</Link>{c.finePost}
          </p>
        </form>
          </>
        )}
      </section>
    </main>
  );
}
