import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BTS ARMY Giveaway — Aegyo Arena',
  description:
    'Enter to win exclusive BTS merchandise + concert tickets. Refer friends to earn extra entries!',
};

export default async function BtsGiveawayPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const iframeSrc = `/bts-giveaway-form${ref ? `?ref=${ref}` : ''}`;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0A0014 0%, #1A0035 40%, #0D001F 100%)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Purple glow blobs */}
      <div
        style={{
          position: 'absolute',
          top: -200,
          left: -200,
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(123,47,190,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -100,
          right: -100,
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(123,47,190,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '60px 24px 80px',
          position: 'relative',
        }}
      >
        {/* Header badge */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span
            style={{
              background: '#7B2FBE',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              padding: '6px 18px',
              borderRadius: 999,
            }}
          >
            💜 AEGYO ARENA × BTS ARMY
          </span>
        </div>

        {/* Main heading */}
        <h1
          style={{
            textAlign: 'center',
            fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
            fontWeight: 900,
            margin: '0 0 12px',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          BTS ARMY
          <br />
          <span style={{ color: '#B47FFF' }}>GIVEAWAY</span>
        </h1>
        <p
          style={{
            textAlign: 'center',
            fontSize: '1.1rem',
            color: 'rgba(255,255,255,0.65)',
            margin: '0 auto 56px',
            maxWidth: 560,
          }}
        >
          Enter for your chance to win exclusive BTS merchandise, signed albums &amp; concert
          tickets. Refer friends to multiply your entries.
        </p>

        {/* Two-column: prizes + iframe */}
        <div
          className="giveaway-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 48,
            alignItems: 'start',
          }}
        >
          {/* LEFT: prizes & info */}
          <div>
            <div style={{ marginBottom: 32 }}>
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#B47FFF',
                  marginBottom: 16,
                }}
              >
                🏆 Prizes
              </div>

              {[
                {
                  emoji: '🎫',
                  title: '2 Luxury Box Seat Tickets',
                  sub: 'BTS Arirang World Tour · MetLife Stadium, East Rutherford NJ · August 1, 2026',
                },
                {
                  emoji: '🛍️',
                  title: 'BTS Merch Bundle',
                  sub: '$300 value — hoodies, photobooks & more',
                },
              ].map(({ emoji, title, sub }) => (
                <div
                  key={title}
                  style={{
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.8rem',
                      lineHeight: 1,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {emoji}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                      {title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.83rem',
                        color: 'rgba(255,255,255,0.5)',
                        marginTop: 2,
                      }}
                    >
                      {sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* How Entries Work */}
            <div
              style={{
                background: 'rgba(123,47,190,0.15)',
                border: '1px solid rgba(123,47,190,0.3)',
                borderRadius: 12,
                padding: '20px 24px',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#B47FFF',
                  marginBottom: 12,
                }}
              >
                How Entries Work
              </div>

              {[
                ['1 entry', 'Just for signing up'],
                ['+10 entries', 'Per friend you refer'],
                ['No limit', 'Refer as many as you want'],
              ].map(([val, label]) => (
                <div
                  key={val}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '0.88rem',
                  }}
                >
                  <span style={{ color: '#B47FFF', fontWeight: 700 }}>{val}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
                </div>
              ))}

              <div
                style={{
                  marginTop: 14,
                  fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.35)',
                  lineHeight: 1.6,
                }}
              >
                Must be 18+ to enter. Giveaway ends when winner is drawn. No purchase necessary.
                Void where prohibited.{' '}
                <a
                  href="/bts-giveaway-sweepstakes-terms"
                  style={{ color: '#B47FFF', textDecoration: 'underline' }}
                >
                  Full promotional terms &amp; conditions.
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT: iframe form */}
          <div>
            <iframe
              src={iframeSrc}
              style={{
                width: '100%',
                height: 600,
                border: 'none',
                borderRadius: 16,
                boxShadow:
                  '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(123,47,190,0.3)',
              }}
              title="BTS Giveaway Entry Form"
            />
          </div>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .giveaway-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
