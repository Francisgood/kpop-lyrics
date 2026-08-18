import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LE SSERAFIM Giveaway - Official Rules | Aegyo Arena",
  description: "Summary rules for the Aegyo Arena LE SSERAFIM PUREFLOW concert ticket giveaway.",
};

const wrap: React.CSSProperties = { maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px", color: "var(--ink-dim)", lineHeight: 1.7 };
const h2: React.CSSProperties = { fontFamily: "var(--serif)", fontSize: "1.3rem", color: "var(--ink)", margin: "30px 0 10px" };

export default function LeSserafimTerms() {
  return (
    <main style={wrap}>
      <div style={{ fontFamily: "var(--mono)", fontSize: "0.72rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sakura)", marginBottom: 12 }}>Aegyo Arena × LE SSERAFIM</div>
      <h1 style={{ fontFamily: "var(--serif)", fontSize: "2.4rem", color: "var(--ink)", margin: "0 0 6px" }}>Giveaway Rules</h1>
      <p style={{ fontSize: "0.85rem", color: "var(--ink-faint)" }}>Summary of terms - full Official Rules to be posted before the draw.</p>

      <div style={{ background: "var(--sakura-light)", border: "1px solid var(--sakura)", borderRadius: 12, padding: "14px 18px", margin: "18px 0", fontSize: "0.88rem", color: "var(--ink)" }}>
        NO PURCHASE NECESSARY. A purchase will not increase your chances of winning. Void where prohibited.
      </div>

      <h2 style={h2}>The prizes</h2>
      <p>One (1) grand-prize winner receives two (2) Section D floor seats to LE SSERAFIM&apos;s PUREFLOW tour at the Prudential Center in Newark, NJ on Thursday, October 8, 2026, plus access to a private merch line (approximate retail value $935). One (1) runner-up receives $200 in official LE SSERAFIM merchandise. Prizes are non-transferable and may not be resold. No cash alternative except at the sponsor&apos;s discretion.</p>

      <h2 style={h2}>Key dates</h2>
      <p>Entries close the night before the draw. Winners are drawn at random on Thursday, September 24, 2026, and winner outreach begins Friday, September 25, 2026. Concert: Thursday, October 8, 2026 at 7:30 PM.</p>

      <h2 style={h2}>Eligibility</h2>
      <p>Open to entrants who are 18 years of age or older at the time of entry. Winners must complete identity verification (KYC), be reachable and respond within the notification window, and accept the campaign terms in order to claim a prize. Eligibility is based on lawful residency and age, not citizenship. Void where prohibited by law.</p>

      <h2 style={h2}>How to enter</h2>
      <p>Complete the entry form on the <Link href="/le-sserafim-giveaway" style={{ color: "var(--sakura)", fontWeight: 600 }}>giveaway page</Link> with accurate information. Limit one (1) entry per person. Optional referrals may earn additional entries as described on the giveaway page.</p>

      <h2 style={h2}>Winner selection &amp; notification</h2>
      <p>Winners are selected at random. Ranked reserve candidates are drawn so that if a selected winner is unreachable, declines, or fails verification, the prize passes to the next eligible candidate. Winners will be contacted using the details provided at entry.</p>

      <h2 style={h2}>Privacy &amp; marketing</h2>
      <p>By entering, you agree to receive email from Aegyo Arena and to the handling of your information as described in our <Link href="/privacy-policy" style={{ color: "var(--sakura)", fontWeight: 600 }}>Privacy Policy</Link>. Winners may be required to consent to the use of their name/likeness for campaign marketing and to any applicable tax reporting.</p>

      <p style={{ marginTop: 30 }}><Link href="/le-sserafim-giveaway" style={{ color: "var(--sakura)", fontWeight: 700 }}>← Back to the giveaway</Link></p>
    </main>
  );
}
