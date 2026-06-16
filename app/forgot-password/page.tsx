"use client";

import { useState } from "react";
import Link from "next/link";

const labelStyle: React.CSSProperties = { fontSize: "0.78rem", fontWeight: 700, color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", border: "1px solid var(--genius-border)", borderRadius: 4, fontSize: "0.95rem", outline: "none", background: "#fff", color: "#000", boxSizing: "border-box" };

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "reset" | "done">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Something went wrong."); return; }
      setStep("reset");
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code, newPassword: password }) });
      const d = await res.json();
      if (!res.ok) { setError(d.error ?? "Something went wrong."); return; }
      setStep("done");
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ fontFamily: "monospace", fontSize: "1.5rem", fontWeight: 800, color: "var(--genius-yellow)", textDecoration: "none", background: "#000", padding: "4px 14px", borderRadius: 4 }}>
            Aegyo Arena
          </Link>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: 20, marginBottom: 6, color: "#fff" }}>Reset your password</h1>
          <p style={{ color: "var(--genius-gray)", fontSize: "0.88rem" }}>
            {step === "request" && "Enter your email and we'll send you a 6-digit reset code."}
            {step === "reset" && "Enter the code we emailed you and choose a new password."}
            {step === "done" && "All set."}
          </p>
        </div>

        {error && (
          <div style={{ background: "#fff0f0", border: "1px solid #ffcdd2", borderRadius: 4, padding: "10px 14px", fontSize: "0.85rem", color: "#c62828", marginBottom: 14 }}>{error}</div>
        )}

        {step === "request" && (
          <form onSubmit={requestCode} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} className="btn-yellow" style={{ width: "100%", padding: "12px", fontSize: "0.85rem", marginTop: 6, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Sending…" : "SEND RESET CODE"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={reset} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--genius-border)", borderRadius: 4, padding: "10px 14px", fontSize: "0.82rem", color: "var(--genius-gray)" }}>
              If an account exists for <strong style={{ color: "#fff" }}>{email}</strong>, a 6-digit code is on its way. It expires in 15 minutes.
            </div>
            <div>
              <label style={labelStyle}>Reset code</label>
              <input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required placeholder="123456" style={{ ...inputStyle, letterSpacing: "0.4em", fontWeight: 700 }} />
            </div>
            <div>
              <label style={labelStyle}>New password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Min. 6 characters" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Confirm new password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} placeholder="Re-enter password" style={inputStyle} />
            </div>
            <button type="submit" disabled={loading} className="btn-yellow" style={{ width: "100%", padding: "12px", fontSize: "0.85rem", marginTop: 6, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Resetting…" : "RESET PASSWORD"}
            </button>
            <button type="button" onClick={() => { setStep("request"); setError(""); }} style={{ background: "none", border: "none", color: "var(--genius-gray)", fontSize: "0.8rem", cursor: "pointer" }}>
              ← Use a different email
            </button>
          </form>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2.4rem", marginBottom: 10 }}>✅</div>
            <p style={{ color: "#fff", fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>Password updated</p>
            <p style={{ color: "var(--genius-gray)", fontSize: "0.88rem", marginBottom: 22 }}>You can now sign in with your new password.</p>
            <Link href="/login" className="btn-yellow" style={{ display: "inline-block", padding: "12px 28px", fontSize: "0.85rem", textDecoration: "none" }}>GO TO SIGN IN</Link>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 24, fontSize: "0.85rem", color: "var(--genius-gray)" }}>
          Remembered it?{" "}
          <Link href="/login" style={{ color: "var(--sakura)", fontWeight: 700, textDecoration: "none" }}>Back to sign in</Link>
        </div>
      </div>
    </main>
  );
}
