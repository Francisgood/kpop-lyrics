"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", fontWeight: 700, padding: "5px 12px", borderRadius: 4, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.04em" }}
    >
      SIGN OUT
    </button>
  );
}
