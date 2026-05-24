"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  editId: string;
  canRevert?: boolean; // show revert instead of approve/reject
}

export default function ReviewButtons({ editId, canRevert = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function act(action: "approve" | "reject" | "revert") {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/edits/review?id=${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); return; }
      setDone(true);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  if (done) return <span style={{ fontSize: "0.72rem", color: "#22c55e", fontWeight: 700 }}>✓ Done</span>;

  return (
    <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      {error && <span style={{ fontSize: "0.72rem", color: "#c62828" }}>{error}</span>}
      {canRevert ? (
        <button onClick={() => act("revert")} disabled={loading}
          style={{ fontSize: "0.72rem", padding: "3px 10px", background: "#6b7280", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
          {loading ? "…" : "Revert"}
        </button>
      ) : (
        <>
          <button onClick={() => act("approve")} disabled={loading}
            style={{ fontSize: "0.72rem", padding: "3px 10px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
            {loading ? "…" : "Approve"}
          </button>
          <button onClick={() => act("reject")} disabled={loading}
            style={{ fontSize: "0.72rem", padding: "3px 10px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}>
            {loading ? "…" : "Reject"}
          </button>
        </>
      )}
    </span>
  );
}
