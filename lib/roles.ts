// Role-based access control for the wiki, per the permissions spec.
// One anonymous tier + four authenticated, strictly-hierarchical roles.

export type Role = "public" | "contributor" | "moderator" | "admin" | "superadmin";

export const RANK: Record<Role, number> = {
  public: 0,
  contributor: 1,
  moderator: 2,
  admin: 3,
  superadmin: 4,
};

export const ROLE_LABEL: Record<Role, string> = {
  public: "Visitor",
  contributor: "Contributor",
  moderator: "Moderator",
  admin: "Admin",
  superadmin: "Superadmin",
};

export const ROLE_COLOR: Record<Role, string> = {
  public: "#9aa0a6",
  contributor: "#ff6fa8",
  moderator: "#8b5cf6",
  admin: "#f59e0b",
  superadmin: "#ef4444",
};

// The permission matrix — minimum role rank required for each action.
export type Action =
  | "view"
  | "vote" | "save" | "follow"
  | "add_record" | "add_artist" | "suggest_edit" | "suggest_removal" | "retract_own"
  | "approve" | "reject" | "view_mod_queue" | "revert"
  | "create_contributor" | "create_moderator" | "create_admin" | "suspend_lower"
  | "act_on_admin" | "transfer_ownership";

const MIN_RANK: Record<Action, number> = {
  view: 0,
  // Engagement — login required (spec §2/§4.4), i.e. at least contributor.
  vote: 1, save: 1, follow: 1,
  // Contribution (write).
  add_record: 1, add_artist: 1, suggest_edit: 1, suggest_removal: 1, retract_own: 1,
  // Review & moderation.
  approve: 2, reject: 2, view_mod_queue: 2, revert: 2,
  // User & role management.
  create_contributor: 3, create_moderator: 3, create_admin: 3, suspend_lower: 3,
  // Reserved for the owner.
  act_on_admin: 4, transfer_ownership: 4,
};

export function rankOf(role: Role | null | undefined): number {
  return RANK[(role ?? "public") as Role] ?? 0;
}

export function isAuthed(role: Role | null | undefined): boolean {
  return rankOf(role) >= RANK.contributor;
}

/**
 * can(role, action, ctx) — the single permission check.
 * Hierarchical rank gate, plus the conditional predicates from spec §4.
 * Enforce this on the server for every gated action; the UI's disabled state
 * is a separate, non-authoritative layer (spec §5.1).
 */
export function can(
  role: Role | null | undefined,
  action: Action,
  ctx?: { authorId?: string; userId?: string },
): boolean {
  if (rankOf(role) < MIN_RANK[action]) return false;

  // §4.1 — self-approval blocked for Moderator/Admin; Superadmin may break-glass.
  if (action === "approve" && ctx?.authorId && ctx.authorId === ctx.userId && role !== "superadmin") {
    return false;
  }
  // §4.3 — only the Superadmin may act on a peer Admin (also gated by rank above).
  if (action === "act_on_admin" && role !== "superadmin") return false;

  return true;
}

/**
 * The role for an authenticated user. Every logged-in user is at least a
 * Contributor (spec §2). The owner account (OWNER_EMAIL) is the Superadmin.
 * Moderator/Admin grants are issued through the management tools (follow-up),
 * and would be read from User.role here once that lands.
 */
export function roleForUser(user: { email?: string | null; role?: string | null } | null | undefined): Role {
  if (!user) return "public";
  if (user.role && user.role in RANK) return user.role as Role;
  const owner = process.env.OWNER_EMAIL?.toLowerCase();
  if (owner && user.email && user.email.toLowerCase() === owner) return "superadmin";
  return "contributor";
}
