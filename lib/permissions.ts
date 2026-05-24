export interface PermUser {
  id: string;
  role: string;
  is_owner: boolean;
}

export const canDirectEdit  = (u: PermUser) => u.role === "admin" || u.is_owner;
export const canReview      = (u: PermUser) => ["moderator", "admin"].includes(u.role) || u.is_owner;
export const canSeeAuditLog = (u: PermUser) => ["moderator", "admin"].includes(u.role) || u.is_owner;
export const canAccessAdmin = (u: PermUser) => ["moderator", "admin"].includes(u.role) || u.is_owner;
// Contributors (editor+), moderators, and admins can submit annotations
export const canAnnotate    = (u: PermUser) => ["editor", "moderator", "admin"].includes(u.role) || u.is_owner;
