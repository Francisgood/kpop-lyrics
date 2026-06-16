import type { Metadata } from "next";
import { CONTRIBUTORS } from "./data";
import LeaderboardClient from "@/components/LeaderboardClient";

export const metadata: Metadata = {
  title: "Leaderboard — Aegyo Arena",
  description:
    "The top contributors shaping the Aegyo Arena K-pop wiki — ranked by points, annotations, and followers across Mexico City, New York, and Paris.",
};

export default function LeaderboardPage() {
  return <LeaderboardClient contributors={CONTRIBUTORS} />;
}
