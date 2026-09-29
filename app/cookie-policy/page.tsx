import type { Metadata } from "next";
import LegalDoc from "@/components/LegalDoc";
import { CONTENT } from "./content";

export const metadata: Metadata = {
  title: "Cookie Policy | Aegyo Arena",
  description: "How Aegyo Arena uses cookies and similar technologies, and how you can control them.",
};

export default function CookiePolicyPage() {
  return <LegalDoc content={CONTENT} />;
}
