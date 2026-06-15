"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  onClose: () => void;
}

export default function AnnotationSignUpModal({ onClose }: Props) {
  const [tab, setTab]           = useState<"signup" | "login">("signup");
  const [displayName, setName]  = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = tab === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const body     = tab === "signup"
        ? { email, password, displayName }
        : { email, password };

      const res  = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json() as { ok?: boolean; error?: string };

      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      // Reload so the page re-renders with the new session
      window.location.reload();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position:   "fixed",
        inset:      0,
        background: "rgba(0,0,0,0.65)",
        zIndex:     500,
        display:    "flex",
        alignItems: "center",
        justifyContent: "center",
        padding:    "16px",
      }}
    >
      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:   "var(--genius-yellow)",
          borderRadius: 8,
          width:        "100%",
          maxWidth:     480,
          padding:      "36px 40px 32px",
          position:     "relative",
          boxShadow:    "0 20px 60px rgba(0,0,0,0.4)",
          maxHeight:    "90vh",
          overflowY:    "auto",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position:   "absolute",
            top:        14,
            right:      16,
            background: "#000",
            border:     "none",
            borderRadius: "50%",
            width:      32,
            height:     32,
            display:    "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor:     "pointer",
            fontSize:   "1.1rem",
            color:      "#fff",
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Heading */}
        <h2 style={{ fontSize: "clamp(2rem, 6vw, 2.6rem)", fontWeight: 900, margin: "0 0 6px", color: "var(--ink)", textAlign: "center" }}>
          {tab === "signup" ? "Sign Up" : "Sign In"}
        </h2>
        <p style={{ textAlign: "center", color: "var(--ink)", fontSize: "0.9rem", margin: "0 0 24px", lineHeight: 1.5 }}>
          {tab === "signup"
            ? "Create an Aegyo Arena account to annotate lyrics"
            : "Welcome back — sign in to keep annotating"}
        </p>

        {/* Social buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {[
            { label: "f", bg: "#1877f2", title: "Continue with Facebook" },
            { label: "𝕏", bg: "#000",    title: "Continue with X / Twitter" },
            { label: "G", bg: "#fff",    title: "Continue with Google", color: "#333", border: "1px solid #ccc" },
          ].map(({ label, bg, title, color, border }) => (
            <button
              key={title}
              title={title}
              onClick={() => window.location.href = tab === "signup" ? "/signup" : "/login"}
              style={{
                flex:        1,
                height:      48,
                background:  bg,
                border:      border ?? "none",
                borderRadius: 999,
                cursor:      "pointer",
                fontWeight:  800,
                fontSize:    "1.1rem",
                color:       color ?? "#fff",
                display:     "flex",
                alignItems:  "center",
                justifyContent: "center",
                transition:  "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 20px" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.2)" }} />
          <span style={{ fontSize: "0.82rem", color: "var(--ink-dim)", whiteSpace: "nowrap" }}>Or {tab === "signup" ? "Sign Up" : "Sign In"} with Email</span>
          <div style={{ flex: 1, height: 1, background: "rgba(0,0,0,0.2)" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tab === "signup" && (
            <input
              type="text"
              placeholder="Username"
              value={displayName}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#000")}
              onBlur={(e)  => (e.target.style.borderColor = "rgba(0,0,0,0.25)")}
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#000")}
            onBlur={(e)  => (e.target.style.borderColor = "rgba(0,0,0,0.25)")}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#000")}
            onBlur={(e)  => (e.target.style.borderColor = "rgba(0,0,0,0.25)")}
          />

          {error && (
            <div style={{ fontSize: "0.8rem", color: "#c00", fontWeight: 600, textAlign: "center" }}>{error}</div>
          )}

          {tab === "signup" && (
            <p style={{ fontSize: "0.72rem", color: "var(--ink-dim)", textAlign: "center", margin: 0 }}>
              By clicking &ldquo;Sign Up&rdquo; you agree to our{" "}
              <Link href="/terms" style={{ color: "var(--ink)", fontWeight: 700 }}>Terms of Service</Link>.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop:    4,
              background:   "#000",
              color:        "#fff",
              border:       "none",
              borderRadius: 999,
              padding:      "14px 0",
              fontSize:     "1rem",
              fontWeight:   800,
              cursor:       loading ? "not-allowed" : "pointer",
              opacity:      loading ? 0.6 : 1,
              transition:   "opacity 0.15s",
            }}
          >
            {loading ? "…" : tab === "signup" ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {/* Toggle */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.88rem", color: "var(--ink)" }}>
          {tab === "signup" ? (
            <>Already have an account?{" "}
              <button onClick={() => { setTab("login"); setError(""); }} style={{ background: "none", border: "none", fontWeight: 700, color: "var(--ink)", cursor: "pointer", textDecoration: "underline", fontSize: "inherit" }}>
                Sign in
              </button>
            </>
          ) : (
            <>Don&apos;t have an account?{" "}
              <button onClick={() => { setTab("signup"); setError(""); }} style={{ background: "none", border: "none", fontWeight: 700, color: "var(--ink)", cursor: "pointer", textDecoration: "underline", fontSize: "inherit" }}>
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width:        "100%",
  padding:      "12px 16px",
  border:       "1px solid rgba(0,0,0,0.25)",
  borderRadius: 6,
  fontSize:     "0.95rem",
  background:   "rgba(255,255,255,0.7)",
  outline:      "none",
  boxSizing:    "border-box",
  transition:   "border-color 0.15s",
  color:        "#000",
};
