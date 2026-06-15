import type { Metadata } from "next";
import LegalDoc from "@/components/LegalDoc";
import { CONTENT } from "./content";

export const metadata: Metadata = {
  title: "BTS Concert Sweepstakes — Official Rules | Aegyo Arena",
  description: "Official Rules for the Aegyo Arena BTS Concert Sweepstakes.",
};

export default function BtsSweepstakesTermsPage() {
  return <LegalDoc content={CONTENT} />;
}
