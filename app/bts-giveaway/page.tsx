"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { taboolaEvent } from "@/lib/taboola";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const AGE_ERROR = "Sorry — this giveaway is only open to entrants who are 18 or older.";

const PRIZES = [
  {
    img: "/giveaway/tickets.jpg",
    badge: "🏆 Grand Prize",
    accent: "var(--sakura)",
    title: "2 Luxury Box Seat Tickets",
    sub: "BTS Arirang World Tour · MetLife Stadium, East Rutherford NJ · August 1, 2026",
  },
  {
    img: "/giveaway/merch.jpg",
    badge: "Runner-up Prize",
    accent: "var(--volt)",
    title: "BTS Merch Bundle",
    sub: "$300 value · hoodies, photobooks, official lightstick & more",
  },
];

export default function BtsGiveawayPage() {
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => thisYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [zip, setZip] = useState("");
  const [ref, setRef] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ referralLink: string; referralCount: number; alreadyEntered?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("ref");
    if (r) setRef(r);
  }, []);

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
    if (under18) { setError(AGE_ERROR); return; }
    if (!firstName || !lastName || !email || !phone || !month || !day || !year || !zip) {
      setError("Please complete all fields to enter.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/giveaway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, zip, birthMonth: month, birthDay: day, birthYear: year, ref }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong. Please try again."); return; }
      // Taboola conversion: fire "lead" only on a NEW entry (not a returning entrant)
      if (!data.alreadyEntered) taboolaEvent("lead");
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
          <div style={{ fontSize: "3rem", marginBottom: 10 }}>💜</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "2.2rem", color: "var(--ink)", marginBottom: 10 }}>
            {result.alreadyEntered ? "You’re already entered!" : "You’re entered!"}
          </h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: 28 }}>
            Want better odds? Refer friends — every valid referral is an extra shot at the tickets, up to <strong style={{ color: "var(--ink)" }}>50 referrals</strong>.
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
            Referrals count only when your friend is 18+, a U.S. resident, accepts the rules, and joins the newsletter. See the{" "}
            <Link href="/bts-sweepstakes-terms" style={{ color: "var(--sakura)", fontWeight: 600 }}>Official Rules</Link> (Section 16).
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: "0 0 72px" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(180deg, var(--sakura-light), var(--bg))", borderBottom: "1px solid var(--border)", padding: "56px 24px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 16 }}>Aegyo Arena · BTS ARMY</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.4rem, 9vw, 4rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 16px", lineHeight: 1.05 }}>
            BTS ARMY <em style={{ color: "var(--sakura)", fontStyle: "italic" }}>Giveaway.</em>
          </h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "clamp(1rem, 3.5vw, 1.15rem)", lineHeight: 1.6, maxWidth: 540, margin: "0 auto 28px" }}>
            Enter for your chance to win exclusive BTS merch, signed albums & concert tickets. Refer friends to multiply your entries.
          </p>
          <a href="#enter" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 34px", borderRadius: 100, background: "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.03em", textTransform: "uppercase", textDecoration: "none" }}>
            Enter Now →
          </a>
          {ref && <p style={{ marginTop: 16, fontSize: "0.85rem", color: "var(--volt)" }}>A friend referred you — enter below so their referral counts! 💜</p>}
        </div>
      </section>

      {/* Prizes */}
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "44px 24px 8px" }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 18 }}>Prizes</div>
        {/* minmax(min(300px,100%)) → side-by-side on desktop, full-width stacked (tickets above merch) on mobile, never overflows narrow screens */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 20 }}>
          {PRIZES.map((p) => (
            <div key={p.title} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 18, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 10", overflow: "hidden" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <span style={{ position: "absolute", top: 14, left: 14, background: "rgba(15,15,18,0.82)", color: "#fff", fontFamily: "var(--mono)", fontSize: "0.66rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 100, border: `1px solid ${p.accent}` }}>
                  {p.badge}
                </span>
              </div>
              <div style={{ padding: "20px 22px 24px" }}>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)", margin: "0 0 8px", lineHeight: 1.2 }}>{p.title}</h2>
                <p style={{ color: "var(--ink-dim)", fontSize: "0.92rem", lineHeight: 1.6, margin: 0 }}>{p.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 16, fontSize: "0.74rem", color: "var(--ink-faint)", lineHeight: 1.6 }}>
          No purchase necessary. Open to U.S. residents 18+. Prizes shown are illustrative. See the{" "}
          <Link href="/bts-sweepstakes-terms" style={{ color: "var(--sakura)", fontWeight: 600 }}>Official Rules</Link>.
        </p>
      </section>

      {/* Entry form */}
      <section id="enter" style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px 0", scrollMarginTop: 24 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.7rem, 5vw, 2.2rem)", fontWeight: 700, color: "var(--ink)", textAlign: "center", margin: "0 0 8px" }}>Enter the sweepstakes</h2>
        <p style={{ textAlign: "center", color: "var(--ink-dim)", fontSize: "0.98rem", lineHeight: 1.6, marginBottom: 28 }}>
          Free to enter. One entry per person — then refer friends to boost your odds.
        </p>

        <form onSubmit={submit} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input style={field} placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} aria-label="First Name" />
            <input style={field} placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} aria-label="Last Name" />
            <input style={field} type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email Address" />
            <input style={field} type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} aria-label="Phone Number" />

            <div>
              <label style={{ display: "block", fontWeight: 700, color: "var(--ink)", fontSize: "0.95rem", marginBottom: 8 }}>Birthday</label>
              <div style={{ display: "flex", gap: 8 }}>
                <select style={sel} value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Birth month">
                  <option value="">Month</option>
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <select style={sel} value={day} onChange={(e) => setDay(e.target.value)} aria-label="Birth day">
                  <option value="">Day</option>
                  {days.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <select style={sel} value={year} onChange={(e) => setYear(e.target.value)} aria-label="Birth year">
                  <option value="">Year</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <input style={field} inputMode="numeric" placeholder="Zip Code" value={zip} onChange={(e) => setZip(e.target.value)} aria-label="Zip Code" />
          </div>

          {(under18 || error) && (
            <div role="alert" style={{ marginTop: 16, color: "#ff5a5a", fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.5 }}>
              {under18 ? AGE_ERROR : error}
            </div>
          )}

          <button type="submit" disabled={under18 || submitting} style={{ width: "100%", marginTop: 20, padding: "15px", borderRadius: 10, border: "none", background: (under18 || submitting) ? "var(--border-strong)" : "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.04em", textTransform: "uppercase", cursor: (under18 || submitting) ? "not-allowed" : "pointer" }}>
            {submitting ? "Submitting…" : "Submit Your Entry →"}
          </button>

          <p style={{ marginTop: 16, fontSize: "0.78rem", color: "var(--ink-faint)", textAlign: "center", lineHeight: 1.6 }}>
            No purchase necessary. By submitting your entry, you agree to the{" "}
            <Link href="/bts-sweepstakes-terms" style={{ color: "var(--sakura)", fontWeight: 600 }}>Official Sweepstakes Rules</Link>{" "}
            and to subscribe to the Aegyo Arena email newsletter.
          </p>
        </form>
      </section>
    </main>
  );
}
