import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Aegyo Arena',
  description: 'Aegyo Arena privacy policy — how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: '60px 24px 100px' }}>
      {/* Back link */}
      <div style={{ marginBottom: 32 }}>
        <Link href="/" style={{ fontSize: '0.82rem', color: '#7B2FBE', textDecoration: 'none', fontWeight: 600 }}>
          ← Aegyo Arena
        </Link>
      </div>

      <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, color: '#111', margin: '0 0 8px', letterSpacing: '-0.01em' }}>
        Privacy Policy
      </h1>
      <p style={{ fontSize: '0.85rem', color: '#888', margin: '0 0 40px' }}>
        Aegyo Arena · Last updated June 2026
      </p>

      <div style={{ fontSize: '0.95rem', color: '#222', lineHeight: 1.8 }}>
        <p style={{ color: '#888', fontStyle: 'italic' }}>
          Full privacy policy is being finalized and will be published here shortly.
          For privacy inquiries, contact{' '}
          <a href="mailto:privacy@aegyoarena.com" style={{ color: '#7B2FBE' }}>privacy@aegyoarena.com</a>.
        </p>
      </div>
    </main>
  );
}
