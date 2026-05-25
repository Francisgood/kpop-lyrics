import { prisma } from "@/lib/prisma";

export const POINT_VALUES = {
  signup_bonus:       100,
  comment:            10,
  annotation:         30,
  edit_approved:      50,
  annotation_upvoted: 5,
} as const;

export type PointType = keyof typeof POINT_VALUES;

export const PRIZE_TIERS = [
  {
    key:         "merch",
    label:       "Merchandise",
    points:      1000,
    emoji:       "👕",
    color:       "#3b82f6",
    description: "Official Aegyo Arena branded merch",
  },
  {
    key:         "plushie",
    label:       "Plushie",
    points:      2000,
    emoji:       "🧸",
    color:       "#8b5cf6",
    description: "K-pop character plushies",
  },
  {
    key:         "desk-toy",
    label:       "Desk Toy",
    points:      3000,
    emoji:       "✨",
    color:       "#ec4899",
    description: "Exclusive desktop collectibles",
  },
  {
    key:         "concert",
    label:       "Concert Ticket",
    points:      4000,
    emoji:       "🎫",
    color:       "#f59e0b",
    description: "Live K-pop concert experiences",
  },
  {
    key:         "signed",
    label:       "Signed Memorabilia",
    points:      null,  // auction-based
    emoji:       "✍️",
    color:       "#ef4444",
    description: "Bid your points — highest bidder wins your idol's autograph",
  },
] as const;

export type PrizeTierKey = typeof PRIZE_TIERS[number]["key"];

export interface Rank {
  label:   string;
  color:   string;
  next:    string | null;
  nextPts: number | null;
}

export function getRank(points: number): Rank {
  if (points >= 4000) return { label: "Legend",      color: "#ef4444", next: null,          nextPts: null };
  if (points >= 2000) return { label: "Superstar",   color: "#f59e0b", next: "Legend",      nextPts: 4000 };
  if (points >= 1000) return { label: "Idol",        color: "#8b5cf6", next: "Superstar",   nextPts: 2000 };
  if (points >= 250)  return { label: "Rising Star", color: "#3b82f6", next: "Idol",        nextPts: 1000 };
  return                     { label: "Trainee",     color: "#6b7280", next: "Rising Star", nextPts: 250  };
}

export async function awardPoints(
  userId: string,
  type:   PointType,
  reason: string,
  refId?: string,
): Promise<void> {
  await prisma.pointEvent.create({
    data: { userId, type, points: POINT_VALUES[type], reason, refId },
  });
}

export async function getUserPointTotal(userId: string): Promise<number> {
  const result = await prisma.pointEvent.aggregate({
    where: { userId },
    _sum:  { points: true },
  });
  return result._sum.points ?? 0;
}
