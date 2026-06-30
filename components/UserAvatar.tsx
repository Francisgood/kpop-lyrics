import type { CSSProperties } from "react";

// Shared contributor avatar — renders the profile image when present, else the
// initial on the tier color. Plain component (no hooks) so it works in both server
// and client components. `size` may be a px number or a CSS length (clamp, etc.).
export default function UserAvatar({
  avatar,
  initial,
  color,
  size,
  ring,
}: {
  avatar?: string | null;
  initial: string;
  color: string;
  size: number | string;
  ring?: string | null;
}) {
  const border = ring ? `3px solid ${ring}` : avatar ? `2px solid ${color}` : "none";
  const base: CSSProperties = { width: size, height: size, borderRadius: "50%", flexShrink: 0, border };

  if (avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatar} alt={initial} style={{ ...base, display: "block", objectFit: "cover", background: color }} />
    );
  }
  const fontSize = typeof size === "number" ? size * 0.42 : `calc(${size} * 0.42)`;
  return (
    <span style={{ ...base, display: "grid", placeItems: "center", background: color, color: "#fff", fontWeight: 800, fontSize }}>
      {initial}
    </span>
  );
}
