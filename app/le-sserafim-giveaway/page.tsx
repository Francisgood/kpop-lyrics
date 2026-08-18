"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackLead } from "@/lib/conversions";
import SmartImage from "@/components/SmartImage";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const FEATURED_COUNTRIES = ["United States", "Canada", "Mexico", "Brazil", "Argentina", "Chile", "Colombia", "Peru", "Philippines", "Indonesia"];
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia",
  "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Brazzaville)",
  "Congo (Kinshasa)", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica",
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
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan",
  "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
  "Zambia", "Zimbabwe",
];

const PRIZES = [
  {
    img: "/giveaway/le-sserafim.jpg",
    accent: "var(--sakura)",
    badge: "Grand Prize",
    title: "Two floor seats + private merch line",
    sub: "Two (2) Section D floor seats to LE SSERAFIM's PUREFLOW tour at the Prudential Center in Newark, NJ on Thursday, October 8, 2026 - close to the action, with a clear view of the stage - plus access to a private merch line. A $935 value.",
  },
  {
    img: "",
    accent: "var(--volt)",
    badge: "Runner-Up",
    title: "$200 in official LE SSERAFIM merch",
    sub: "One runner-up takes home $200 worth of official LE SSERAFIM merchandise, shipped to you.",
  },
];

const DATES = [
  { k: "Winners drawn", v: "Thursday, Sept 24, 2026" },
  { k: "Outreach begins", v: "Friday, Sept 25, 2026" },
  { k: "Concert", v: "Thursday, Oct 8, 2026 - 7:30 PM" },
];

export default function LeSserafimGiveaway() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [ref, setRef] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ referralLink: string; referralCount: number; alreadyEntered?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("ref");
    if (r) setRef(r);
  }, []);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 90 }, (_, i) => new Date().getFullYear() - 18 - i);

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
    if (under18) { setError("Sorry - this giveaway is only open to entrants who are 18 or older."); return; }
    if (!firstName || !lastName || !email || !phone || !month || !day || !year || !country || !zip) {
      setError("Please complete all fields to enter."); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/le-sserafim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, zip, country, birthMonth: month, birthDay: day, birthYear: year, ref }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong. Please try again."); return; }
      if (!data.alreadyEntered) trackLead(data.rdtConversionId);
      setResult({ referralLink: data.referralLink, referralCount: data.referralCount ?? 0, alreadyEntered: data.alreadyEntered });
    } catch {
      setError("Something went wrong. Please try again.");
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
          <div style={{ fontSize: "3rem", marginBottom: 10 }}>🖤</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "2.2rem", color: "var(--ink)", marginBottom: 10 }}>
            {result.alreadyEntered ? "You're already entered!" : "You're in!"}
          </h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: 28 }}>
            Winners are drawn <strong style={{ color: "var(--ink)" }}>Thursday, September 24, 2026</strong>. Share your link below - every friend who enters is another entry for you.
          </p>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--sakura)", borderRadius: 14, padding: 22, textAlign: "left" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 10 }}>Your referral link</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input readOnly value={result.referralLink} style={{ ...field, flex: 1, minWidth: 200, fontSize: "0.88rem" }} onFocus={(e) => e.currentTarget.select()} />
              <button type="button" onClick={copyLink} style={{ padding: "13px 20px", borderRadius: 8, border: "none", background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div style={{ marginTop: 14, fontSize: "0.9rem", color: "var(--ink-dim)" }}>
              Referrals so far: <strong style={{ color: "var(--sakura)" }}>{result.referralCount}</strong> / 50
            </div>
          </div>
          <p style={{ marginTop: 20, fontSize: "0.78rem", color: "var(--ink-faint)", lineHeight: 1.6 }}>
            By entering you agree to the{" "}
            <Link href="/le-sserafim-terms" style={{ color: "var(--sakura)", fontWeight: 600 }}>Official Rules</Link>. Winners must be 18+, complete identity verification, and accept the campaign terms to claim.
          </p>
          <p style={{ marginTop: 20 }}>
            <Link href="/giveaways" style={{ color: "var(--ink-dim)", fontWeight: 600, fontSize: "0.9rem" }}>← All giveaways</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: "0 0 72px" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(180deg, var(--sakura-light), var(--bg))", borderBottom: "1px solid var(--border)", padding: "40px 24px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 16 }}>Aegyo Arena × LE SSERAFIM</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.4rem, 9vw, 4rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 14px", lineHeight: 1.05 }}>
            Win <em style={{ color: "var(--sakura)", fontStyle: "italic" }}>PUREFLOW</em> floor seats
          </h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "clamp(1rem, 3.5vw, 1.15rem)", lineHeight: 1.6, maxWidth: 560, margin: "0 auto 24px" }}>
            LE SSERAFIM live at the Prudential Center in Newark, NJ - Thursday, October 8, 2026. Enter to win two floor seats plus a private merch line.
          </p>
          <div style={{ position: "relative", width: "100%", maxWidth: 560, margin: "0 auto 26px", aspectRatio: "651 / 557", borderRadius: 18, overflow: "hidden", border: "1px solid var(--border)" }}>
            <SmartImage src="/giveaway/le-sserafim.jpg" alt="LE SSERAFIM - PUREFLOW tour" fill sizes="(max-width: 760px) 100vw, 560px" style={{ objectFit: "cover" }} priority />
          </div>
          <a href="#enter" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 34px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.03em", textTransform: "uppercase", textDecoration: "none" }}>
            Enter to win
          </a>
          {ref && <p style={{ marginTop: 16, fontSize: "0.85rem", color: "var(--volt)" }}>A friend sent you - you're both in the running. 🖤</p>}
        </div>
      </section>

      {/* Prizes */}
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "44px 24px 8px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 18 }}>The prizes</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 20 }}>
          {PRIZES.map((p, i) => (
            <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 10", overflow: "hidden" }}>
                {p.img
                  ? <SmartImage src={p.img} alt={p.title} fill sizes="(max-width: 760px) 100vw, 500px" style={{ objectFit: "cover" }} />
                  : <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "linear-gradient(135deg, var(--volt-dim), var(--bg-light))", color: "var(--ink-dim)", fontFamily: "var(--serif)", fontSize: "1.25rem", textAlign: "center", padding: 22 }}>Official LE SSERAFIM merch</div>}
                <span style={{ position: "absolute", top: 14, left: 14, background: "rgba(15,15,18,0.82)", color: "#fff", fontFamily: "var(--mono)", fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 100, border: `1px solid ${p.accent}` }}>{p.badge}</span>
              </div>
              <div style={{ padding: "20px 22px 24px" }}>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 8px", lineHeight: 1.2 }}>{p.title}</h2>
                <p style={{ color: "var(--ink-dim)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>{p.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 16, fontSize: "0.74rem", color: "var(--ink-faint)", lineHeight: 1.6 }}>
          No purchase necessary. Open to entrants 18+. Winners must complete identity verification and accept the campaign terms to claim. See the{" "}
          <Link href="/le-sserafim-terms" style={{ color: "var(--sakura)", fontWeight: 600 }}>Official Rules</Link>.
        </p>
      </section>

      {/* Key dates */}
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "28px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 14 }}>
          {DATES.map((d) => (
            <div key={d.k} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "0.66rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 6 }}>{d.k}</div>
              <div style={{ color: "var(--ink)", fontWeight: 700, fontSize: "0.98rem" }}>{d.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Entry form */}
      <section id="enter" style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px 0", scrollMarginTop: 24 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.7rem, 5vw, 2.2rem)", fontWeight: 700, color: "var(--ink)", textAlign: "center", margin: "0 0 8px" }}>Enter the giveaway</h2>
        <p style={{ textAlign: "center", color: "var(--ink-dim)", fontSize: "0.98rem", lineHeight: 1.6, marginBottom: 28 }}>
          One entry per person. We'll email you if you win - and add you to the Aegyo Arena newsletter for the next drop.
        </p>
        <form onSubmit={submit} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input style={field} placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} aria-label="First name" />
            <input style={field} placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} aria-label="Last name" />
            <input style={field} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email address" />
            <input style={field} type="tel" autoComplete="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} aria-label="Phone number" />
            <div>
              <label style={{ display: "block", fontWeight: 700, color: "var(--ink)", fontSize: "0.95rem", marginBottom: 8 }}>Date of birth</label>
              <div style={{ display: "flex", gap: 8 }}>
                <select style={sel} value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Month">
                  <option value="">Month</option>
                  {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select style={sel} value={day} onChange={(e) => setDay(e.target.value)} aria-label="Day">
                  <option value="">Day</option>
                  {days.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select style={sel} value={year} onChange={(e) => setYear(e.target.value)} aria-label="Year">
                  <option value="">Year</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <select style={{ ...sel, flex: "1 1 45%" }} value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Country">
                <option value="">Country</option>
                {FEATURED_COUNTRIES.map((cn) => <option key={`f-${cn}`} value={cn}>{cn}</option>)}
                <option value="" disabled>──────────</option>
                {COUNTRIES.map((cn) => <option key={cn} value={cn}>{cn}</option>)}
              </select>
              <input style={{ ...field, flex: "1 1 55%", minWidth: 0 }} autoComplete="postal-code" placeholder="Postal code" value={zip} onChange={(e) => setZip(e.target.value)} aria-label="Postal code" />
            </div>
          </div>
          {(under18 || error) && (
            <div role="alert" style={{ marginTop: 16, color: "#ff5a5a", fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.5 }}>
              {under18 ? "Sorry - this giveaway is only open to entrants who are 18 or older." : error}
            </div>
          )}
          <button type="submit" disabled={under18 || submitting} style={{ width: "100%", marginTop: 20, padding: "15px", borderRadius: 10, border: "none", background: (under18 || submitting) ? "var(--border-strong)" : "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.04em", textTransform: "uppercase", cursor: (under18 || submitting) ? "not-allowed" : "pointer" }}>
            {submitting ? "Entering..." : "Enter to win"}
          </button>
          <p style={{ marginTop: 16, fontSize: "0.78rem", color: "var(--ink-faint)", textAlign: "center", lineHeight: 1.6 }}>
            By entering you confirm you are 18+ and agree to the{" "}
            <Link href="/le-sserafim-terms" style={{ color: "var(--sakura)", fontWeight: 600 }}>Official Rules</Link> and to receive email from Aegyo Arena.
          </p>
        </form>
        <p style={{ marginTop: 22, textAlign: "center" }}>
          <Link href="/giveaways" style={{ color: "var(--ink-dim)", fontWeight: 600, fontSize: "0.9rem" }}>← See all Aegyo Arena giveaways</Link>
        </p>
      </section>
    </main>
  );
}
