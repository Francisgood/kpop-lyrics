'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface EntryResult {
  referralCode: string;
  totalEntries: number;
  referralCount: number;
}

// ─── Inner component that reads search params ──────────────────────────────

function GiveawayForm() {
  const searchParams = useSearchParams();
  const referredBy = searchParams.get('ref') ?? undefined;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [entry, setEntry] = useState<EntryResult | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [p1, setP1] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    streetAddress: '',
  });

  const [p2, setP2] = useState({
    email: '',
    gender: '',
    newsletter: false,
  });

  // ─── Styles ──────────────────────────────────────────────────────────────

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    padding: '12px 14px',
    fontSize: '0.95rem',
    border: `2px solid ${focusedField === field ? '#7B2FBE' : '#e0e0e0'}`,
    borderRadius: 8,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
    fontFamily: 'inherit',
    background: '#fff',
    color: '#111',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#555',
    marginBottom: 6,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: 16,
  };

  const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    background: '#7B2FBE',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: '1rem',
    fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    letterSpacing: '0.04em',
    marginTop: 8,
    transition: 'opacity 0.15s',
    opacity: loading ? 0.7 : 1,
    fontFamily: 'inherit',
  };

  // ─── Step 1 validation & age check ───────────────────────────────────────

  function handleStep1() {
    setError('');
    const { firstName, lastName, phone, dateOfBirth, streetAddress } = p1;
    if (!firstName || !lastName || !phone || !dateOfBirth || !streetAddress) {
      setError('Please fill in all fields.');
      return;
    }
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    if (
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    ) {
      age--;
    }
    if (age < 18) {
      setError('You must be 18 or older to enter.');
      return;
    }
    setStep(2);
  }

  // ─── Step 2 submit ───────────────────────────────────────────────────────

  async function handleSubmit() {
    setError('');
    const { email, gender } = p2;
    if (!email || !gender) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/sweepstakes/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...p1,
          ...p2,
          referredBy,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setEntry(data as EntryResult);
      setStep(3);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Share helpers ────────────────────────────────────────────────────────

  async function copyLink(platform: string) {
    await navigator.clipboard.writeText(
      `https://www.aegyoarena.com/bts-giveaway?ref=${entry!.referralCode}`
    );
    setCopied(platform);
    setTimeout(() => setCopied(null), 2000);
  }

  function shareTwitter() {
    const text = encodeURIComponent(
      `I just entered the @AegyoArena BTS ARMY Giveaway! 💜 Enter for your chance to win signed merch + concert tickets!`
    );
    const url = encodeURIComponent(
      `https://www.aegyoarena.com/bts-giveaway?ref=${entry!.referralCode}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }

  // ─── Shared step indicator ────────────────────────────────────────────────

  const StepIndicator = () => (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        marginBottom: 28,
        justifyContent: 'center',
      }}
    >
      {[1, 2, 3].map((s) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: step >= s ? '#7B2FBE' : '#f0f0f0',
              color: step >= s ? '#fff' : '#999',
              fontSize: '0.85rem',
              fontWeight: 700,
              transition: 'all 0.2s',
            }}
          >
            {s}
          </div>
          {s < 3 && (
            <div
              style={{
                width: 40,
                height: 2,
                background: step > s ? '#7B2FBE' : '#f0f0f0',
                transition: 'all 0.2s',
              }}
            />
          )}
        </div>
      ))}
    </div>
  );

  // ─── Shared card wrapper ──────────────────────────────────────────────────

  const cardStyle: React.CSSProperties = {
    maxWidth: 480,
    margin: '0 auto',
    padding: '40px 40px 36px',
    background: '#fff',
    boxSizing: 'border-box',
    minHeight: '100vh',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '1.55rem',
    fontWeight: 900,
    color: '#111',
    margin: '0 0 6px',
    letterSpacing: '-0.01em',
  };

  const subStyle: React.CSSProperties = {
    fontSize: '0.83rem',
    color: '#888',
    margin: '0 0 24px',
  };

  // ─── Error box ────────────────────────────────────────────────────────────

  const ErrorBox = () =>
    error ? (
      <div
        style={{
          background: '#FFF3F3',
          border: '1.5px solid #FFAAAA',
          borderRadius: 8,
          padding: '10px 14px',
          color: '#C00',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: 16,
        }}
      >
        {error}
      </div>
    ) : null;

  // ─── STEP 1 ───────────────────────────────────────────────────────────────

  if (step === 1) {
    return (
      <div style={cardStyle}>
        <StepIndicator />
        <h1 style={headingStyle}>YOUR DETAILS</h1>
        <p style={subStyle}>Tell us a bit about yourself to enter the giveaway.</p>
        <ErrorBox />

        <div style={fieldStyle}>
          <label style={labelStyle}>First Name</label>
          <input
            type="text"
            placeholder="Jane"
            value={p1.firstName}
            onChange={(e) => setP1({ ...p1, firstName: e.target.value })}
            onFocus={() => setFocusedField('firstName')}
            onBlur={() => setFocusedField(null)}
            style={inputStyle('firstName')}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Last Name</label>
          <input
            type="text"
            placeholder="Kim"
            value={p1.lastName}
            onChange={(e) => setP1({ ...p1, lastName: e.target.value })}
            onFocus={() => setFocusedField('lastName')}
            onBlur={() => setFocusedField(null)}
            style={inputStyle('lastName')}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Phone Number</label>
          <input
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={p1.phone}
            onChange={(e) => setP1({ ...p1, phone: e.target.value })}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
            style={inputStyle('phone')}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Date of Birth</label>
          <input
            type="date"
            value={p1.dateOfBirth}
            onChange={(e) => setP1({ ...p1, dateOfBirth: e.target.value })}
            onFocus={() => setFocusedField('dateOfBirth')}
            onBlur={() => setFocusedField(null)}
            style={inputStyle('dateOfBirth')}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Street Address</label>
          <input
            type="text"
            placeholder="123 Main St, City, State"
            value={p1.streetAddress}
            onChange={(e) => setP1({ ...p1, streetAddress: e.target.value })}
            onFocus={() => setFocusedField('streetAddress')}
            onBlur={() => setFocusedField(null)}
            style={inputStyle('streetAddress')}
          />
        </div>

        <button style={btnStyle} onClick={handleStep1}>
          NEXT →
        </button>
      </div>
    );
  }

  // ─── STEP 2 ───────────────────────────────────────────────────────────────

  if (step === 2) {
    return (
      <div style={cardStyle}>
        <StepIndicator />
        <h1 style={headingStyle}>CONTACT INFO</h1>
        <p style={subStyle}>Almost there — just a few more details.</p>
        <ErrorBox />

        <div style={fieldStyle}>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            placeholder="jane@example.com"
            value={p2.email}
            onChange={(e) => setP2({ ...p2, email: e.target.value })}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            style={inputStyle('email')}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Gender</label>
          <select
            value={p2.gender}
            onChange={(e) => setP2({ ...p2, gender: e.target.value })}
            onFocus={() => setFocusedField('gender')}
            onBlur={() => setFocusedField(null)}
            style={{
              ...inputStyle('gender'),
              appearance: 'none',
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath fill=\'%23666\' d=\'M6 8L0 0h12z\'/%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
              paddingRight: 38,
              cursor: 'pointer',
            }}
          >
            <option value="">Select gender…</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            marginBottom: 20,
            cursor: 'pointer',
          }}
          onClick={() => setP2({ ...p2, newsletter: !p2.newsletter })}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: 5,
              border: `2px solid ${p2.newsletter ? '#7B2FBE' : '#ccc'}`,
              background: p2.newsletter ? '#7B2FBE' : '#fff',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 1,
              transition: 'all 0.15s',
            }}
          >
            {p2.newsletter && (
              <svg viewBox="0 0 12 10" width={12} height={10} fill="none">
                <path
                  d="M1 5l3.5 3.5L11 1"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span style={{ fontSize: '0.83rem', color: '#444', lineHeight: 1.5, userSelect: 'none' }}>
            Add me to the Aegyo Arena newsletter for exclusive K-pop updates
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            style={{
              flex: '0 0 auto',
              padding: '14px 20px',
              background: '#f0f0f0',
              color: '#444',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onClick={() => { setError(''); setStep(1); }}
          >
            ← Back
          </button>
          <button
            style={{ ...btnStyle, flex: 1, marginTop: 0 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Submitting…' : 'ENTER GIVEAWAY 💜'}
          </button>
        </div>
      </div>
    );
  }

  // ─── STEP 3 — Success ─────────────────────────────────────────────────────

  if (step === 3 && entry) {
    const referralUrl = `https://www.aegyoarena.com/bts-giveaway?ref=${entry.referralCode}`;

    const shareBtnBase: React.CSSProperties = {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      height: 48,
      border: 'none',
      borderRadius: 999,
      fontSize: '0.82rem',
      fontWeight: 700,
      color: '#fff',
      cursor: 'pointer',
      fontFamily: 'inherit',
      letterSpacing: '0.02em',
      transition: 'opacity 0.15s',
    };

    return (
      <div style={cardStyle}>
        <StepIndicator />

        {/* Big entry count */}
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <div
            style={{
              fontSize: '3.5rem',
              fontWeight: 900,
              color: '#7B2FBE',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            🎉 {entry.totalEntries}
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111', marginTop: 4 }}>
            {entry.totalEntries === 1 ? 'Entry' : 'Entries'}
          </div>
        </div>

        <h1
          style={{
            textAlign: 'center',
            fontSize: '1.6rem',
            fontWeight: 900,
            color: '#111',
            margin: '20px 0 6px',
            letterSpacing: '-0.01em',
          }}
        >
          YOU&apos;RE IN! 💜
        </h1>
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.88rem',
            color: '#666',
            margin: '0 0 28px',
            lineHeight: 1.5,
          }}
        >
          Refer friends to earn{' '}
          <strong style={{ color: '#7B2FBE' }}>10 more entries</strong> each!
        </p>

        {/* Referral link box */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ ...labelStyle, marginBottom: 8 }}>Your referral link</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              readOnly
              value={referralUrl}
              style={{
                ...inputStyle('referralUrl'),
                flex: 1,
                fontSize: '0.78rem',
                color: '#555',
                background: '#fafafa',
                cursor: 'text',
              }}
            />
            <button
              onClick={() => copyLink('link')}
              style={{
                flexShrink: 0,
                padding: '0 18px',
                background: copied === 'link' ? '#22c55e' : '#7B2FBE',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {copied === 'link' ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Share label */}
        <div style={{ ...labelStyle, marginBottom: 10 }}>Share your link:</div>

        {/* Share buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Instagram */}
          <button
            onClick={() => copyLink('instagram')}
            style={{
              ...shareBtnBase,
              background:
                'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
            }}
          >
            <svg viewBox="0 0 24 24" width={20} height={20} fill="white">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            {copied === 'instagram' ? 'Copied!' : 'Instagram'}
          </button>

          {/* TikTok */}
          <button
            onClick={() => copyLink('tiktok')}
            style={{ ...shareBtnBase, background: '#000' }}
          >
            <svg viewBox="0 0 24 24" width={20} height={20} fill="white">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.23a8.17 8.17 0 004.78 1.52V7.3a4.85 4.85 0 01-1.01-.61z" />
            </svg>
            {copied === 'tiktok' ? 'Copied!' : 'TikTok'}
          </button>

          {/* X / Twitter */}
          <button
            onClick={() => shareTwitter()}
            style={{ ...shareBtnBase, background: '#000' }}
          >
            <svg viewBox="0 0 24 24" width={18} height={18} fill="white">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Post on X
          </button>
        </div>

        {/* Referral code display */}
        <div
          style={{
            marginTop: 28,
            padding: '14px 18px',
            background: '#F5EFFF',
            border: '1.5px solid #D4AAFF',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#7B2FBE',
                marginBottom: 2,
              }}
            >
              Your referral code
            </div>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#5A1F9A', letterSpacing: '0.12em' }}>
              {entry.referralCode}
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#7B2FBE', textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{entry.referralCount}</div>
            <div style={{ opacity: 0.75 }}>referrals so far</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Page export wrapped in Suspense ──────────────────────────────────────────

export default function BtsGiveawayFormPage() {
  return (
    <Suspense
        fallback={
          <div
            style={{
              maxWidth: 480,
              margin: '0 auto',
              padding: '80px 40px',
              textAlign: 'center',
              color: '#888',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Loading…
          </div>
        }
      >
        <GiveawayForm />
      </Suspense>
  );
}
