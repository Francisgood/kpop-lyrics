"use client";

import { useState } from "react";
import Link from "next/link";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const AGE_ERROR = "Sorry — this giveaway is only open to entrants who are 18 or older.";

export default function BtsGiveawayPage() {
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => thisYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [street, setStreet] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function computeAge(): number | null {
    if (!month || !day || !year) return null;
    const b = new Date(Number(year), Number(month) - 1, Number(day));
    const now = new Date();
    let age = now.getFullYear() - b.getFullYear();
    const md = now.getMonth() - b.getMonth();
    if (md < 0 || (md === 0 && now.getDate() < b.getDate())) age--;
    return age;
  }
  const age = computeAge();
  const under18 = age !== null && age < 18;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (under18) { setError(AGE_ERROR); return; }
    if (!firstName || !lastName || !phone || !month || !day || !year || !street) {
      setError("Please complete all fields to enter.");
      return;
    }
    setDone(true);
  }

  const field: React.CSSProperties = { width: "100%", padding: "13px 16px", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: "1rem", outline: "none", background: "#fff", color: "#000", boxSizing: "border-box" };
  const sel: React.CSSProperties = { ...field, padding: "13px 8px", flex: 1, minWidth: 0 };

  if (done) {
    return (
      <main style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 460 }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>💜</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "2.2rem", color: "var(--ink)", marginBottom: 12 }}>You&rsquo;re entered!</h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.05rem", lineHeight: 1.6 }}>
            Good luck, {firstName}. Winners will be contacted using the details you provided. See the{" "}
            <Link href="/bts-sweepstakes-terms" style={{ color: "var(--sakura)", fontWeight: 600 }}>Official Rules</Link> for full details.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: "48px 24px 72px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 12 }}>BTS Concert Sweepstakes</div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem, 6vw, 2.8rem)", fontWeight: 700, color: "var(--ink)", margin: "0 0 12px", lineHeight: 1.1 }}>Win tickets to see BTS live.</h1>
          <p style={{ color: "var(--ink-dim)", fontSize: "1.02rem", lineHeight: 1.6 }}>MetLife Stadium · East Rutherford, NJ · August 1, 2026. No purchase necessary. Open to U.S. residents 18+.</p>
        </div>

        <form onSubmit={submit} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 24px" }}>
          <h2 style={{ fontSize: "0.92rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink)", textAlign: "center", marginBottom: 22 }}>Complete the following:</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input style={field} placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} aria-label="First Name" />
            <input style={field} placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} aria-label="Last Name" />
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

            <input style={field} placeholder="Street Address" value={street} onChange={(e) => setStreet(e.target.value)} aria-label="Street Address" />
          </div>

          {(under18 || error) && (
            <div role="alert" style={{ marginTop: 16, color: "#ff5a5a", fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.5 }}>
              {under18 ? AGE_ERROR : error}
            </div>
          )}

          <button type="submit" disabled={under18} style={{ width: "100%", marginTop: 20, padding: "15px", borderRadius: 10, border: "none", background: under18 ? "var(--border-strong)" : "var(--sakura)", color: "var(--on-accent)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "0.04em", textTransform: "uppercase", cursor: under18 ? "not-allowed" : "pointer" }}>
            Submit Your Entry →
          </button>

          <p style={{ marginTop: 16, fontSize: "0.78rem", color: "var(--ink-faint)", textAlign: "center", lineHeight: 1.6 }}>
            No purchase necessary. By entering you agree to the{" "}
            <Link href="/bts-sweepstakes-terms" style={{ color: "var(--sakura)", fontWeight: 600 }}>Official Sweepstakes Rules</Link>.
          </p>
        </form>
      </div>
    </main>
  );
}
