import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'BTS ARMY Giveaway — Official Sweepstakes Terms & Conditions | Aegyo Arena',
  description: 'Full promotional terms and conditions for the Aegyo Arena BTS ARMY Giveaway sweepstakes.',
};

export default function SweepstakesTermsPage() {
  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: '60px 24px 100px' }}>
      {/* Back link */}
      <div style={{ marginBottom: 32 }}>
        <Link href="/bts-giveaway" style={{ fontSize: '0.82rem', color: '#7B2FBE', textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Giveaway
        </Link>
      </div>

      <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: '#111', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
        BTS ARMY Giveaway
      </h1>
      <p style={{ fontSize: '1rem', color: '#666', margin: '0 0 40px' }}>
        Official Sweepstakes Terms &amp; Conditions
      </p>

      <div style={{ fontSize: '0.95rem', color: '#222', lineHeight: 1.8 }}>
        <p style={{ color: '#888', fontStyle: 'italic' }}>
          Terms and conditions are being finalized and will be published here shortly.
          For questions, contact{' '}
          <a href="mailto:hello@aegyoarena.com" style={{ color: '#7B2FBE' }}>hello@aegyoarena.com</a>.
        </p>
      </div>
    </main>
  );
}
