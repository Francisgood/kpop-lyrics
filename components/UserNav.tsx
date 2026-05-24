import { getSession } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/permissions";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default async function UserNav() {
  const session = await getSession();

  if (!session) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <Link href="/login" style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
          SIGN IN
        </Link>
        <Link href="/signup" className="btn-yellow" style={{ fontSize: "0.72rem", color: "#000", padding: "6px 14px" }}>
          JOIN
        </Link>
      </div>
    );
  }

  const isAdmin = canAccessAdmin(session.user);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      {isAdmin && (
        <Link href="/admin/pending" style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--genius-yellow)", textDecoration: "none", whiteSpace: "nowrap", letterSpacing: "0.06em" }}>
          ADMIN
        </Link>
      )}
      <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap" }}>
        {session.user.displayName ?? session.user.email.split("@")[0]}
      </span>
      <LogoutButton />
    </div>
  );
}
