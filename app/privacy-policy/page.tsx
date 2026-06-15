import type { Metadata } from "next";
import LegalDoc from "@/components/LegalDoc";
import { CONTENT } from "./content";

export const metadata: Metadata = {
  title: "Privacy Policy | Aegyo Arena",
  description: "How Aegyo Arena collects, uses, and shares information about you.",
};

export default function PrivacyPolicyPage() {
  return <LegalDoc content={CONTENT} />;
}
