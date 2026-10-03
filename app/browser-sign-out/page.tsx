"use client";

import { useEffect, useRef, useState } from "react";

const returnTo = {
  aegyo: "https://aegyoarena.com/",
  arcade: "https://arcade.aegyoarena.com/",
  daebak: "https://www.daebakmarkets.com/",
} as const;

export default function BrowserSignOutPage() {
  const started = useRef(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const product = new URLSearchParams(window.location.search).get("return");
    if (!product || !(product in returnTo)) {
      setError(true);
      return;
    }
    const destination = returnTo[product as keyof typeof returnTo];
    fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw new Error("logout_failed");
        window.location.replace(destination);
      })
      .catch(() => setError(true));
  }, []);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#17131f", color: "white", fontFamily: "system-ui, sans-serif" }}>
      <section style={{ maxWidth: 420, textAlign: "center" }}>
        <h1>{error ? "Sign-out needs another try" : "Signing you out"}</h1>
        <p>{error ? "We couldn't finish signing out in this browser." : "Finishing up across Aegyo Arena, Arcade and Daebak…"}</p>
        {error && <button type="button" onClick={() => window.location.reload()}>Try again</button>}
      </section>
    </main>
  );
}
