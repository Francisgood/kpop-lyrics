import Link from "next/link";
import type { Metadata } from "next";
import { CONTRIBUTORS } from "./leaderboard/data";
import HomeInteractions from "@/components/HomeInteractions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aegyo Arena — K-pop Lyrics, Translations & Fan Wiki",
  description: "Korean lyrics with romanization and English translation. Fan-edited annotations, K-pop slang explainers, and artist deep-dives. Updated daily.",
  openGraph: {
    title: "Aegyo Arena — K-pop Lyrics, Translations & Fan Wiki",
    description: "Every lyric. Every meaning. Korean lyrics, fan annotations, and the ultimate K-pop slang dictionary.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

const MARQUEE_ITEMS = [
  "HYBE Entertainment", "SM Entertainment", "YG Entertainment", "JYP Entertainment",
  "Aegyo Rewards", "K-Pop Lyrics", "Fan Annotations", "Slang Dictionary",
  "Concert Tickets", "Signed Memorabilia", "240,000 Members",
];

const REWARDS = [
  { cls: "rc-sakura",    badge: "Tier 1",  icon: "👕", name: "Merch Drop",        pts: "2,000 pts" },
  { cls: "rc-volt",      badge: "Tier 2",  icon: "🧸", name: "K-pop Plushie",     pts: "3,000 pts" },
  { cls: "rc-sky",       badge: "Tier 3",  icon: "✨", name: "Desk Toy",          pts: "4,000 pts" },
  { cls: "rc-tangerine", badge: "Tier 4",  icon: "🎫", name: "Concert Ticket",    pts: "5,000 pts" },
  { cls: "rc-lavender",  badge: "Auction", icon: "✍️", name: "Signed Memorabilia", pts: "Bid-based" },
];

const EARN_WAYS = [
  { icon: "🎤", iconCls: "ewi-1", name: "Post a Comment",      desc: "Share your thoughts on any song, artist, or album", pts: "+1 pt" },
  { icon: "✍️", iconCls: "ewi-2", name: "Add an Annotation",    desc: "Decode a lyric line for the community",             pts: "+20 pts" },
  { icon: "✅", iconCls: "ewi-3", name: "Annotation Approved", desc: "An editor accepts it; rejected ones lose 10",          pts: "+10 pts" },
  { icon: "⭐", iconCls: "ewi-4", name: "Sign-up Bonus",        desc: "One-time reward when you create your account",      pts: "+50 pts" },
  { icon: "🔗", iconCls: "ewi-5", name: "Link Social Profiles", desc: "Verify up to 3 social media accounts",              pts: "+10 each" },
];

const MERCH = [
  { img: "/images/redesign/merch-01.png", size: "wide", tag: "Drop 01", text: "\u201cHwaiting !!!\u201d — Neon Seoul" },
  { img: "/images/redesign/merch-02.png", size: "wide", tag: "Drop 02", text: "\u201cI Learned Korean For This\u201d" },
  { img: "/images/redesign/merch-03.png", size: "tall", tag: "Drop 03", text: "\u201cMy Parents Think It's A Phase\u201d" },
  { img: "/images/redesign/merch-04.png", size: "tall", tag: "Drop 04", text: "\u201cUnboxed 12 Albums. Got His Unit.\u201d" },
  { img: "/images/redesign/merch-05.png", size: "tall", tag: "Drop 05", text: "\u201cMukbang Made Me Do It\u201d" },
  { img: "/images/redesign/merch-06.png", size: "tall", tag: "Drop 06", text: "\u201cKilling Part Survivor\u201d" },
];

const AVATAR_TINTS = [
  { bg: "rgba(255,111,168,0.2)", color: "var(--sakura)" },
  { bg: "var(--lavender-dim)",   color: "var(--lavender)" },
  { bg: "var(--sky-dim)",        color: "var(--sky)" },
  { bg: "var(--volt-dim)",       color: "var(--volt)" },
  { bg: "rgba(255,140,66,0.18)", color: "var(--tangerine)" },
  { bg: "rgba(255,111,168,0.2)", color: "var(--sakura)" },
];

export default async function HomePage() {
  const topContributors = CONTRIBUTORS.slice(0, 6);

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-image-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/redesign/hero-plush.png" alt="Aegyo Arena Plush Collection — all seven chibi characters holding hands" />
        </div>

        <div className="hero-content">
          <div className="fade-up fade-up-1">
            <div className="hero-eyebrow">Fan-made · Fandom-powered</div>
            <p className="hero-body">
              The K-pop universe built by fans, for fans. Annotate lyrics, decode slang, and earn real rewards — including our iconic chibi plush collection.
            </p>
            <div className="hero-actions">
              <Link href="/signup" className="btn-primary">
                Start Earning
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link href="/artists" className="btn-ghost">Explore Artists</Link>
            </div>
          </div>

          <div className="hero-right-block fade-up fade-up-2">
            <div className="hero-collection-tag">
              <span style={{ width: 6, height: 6, background: "#fff", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
              Limited Collection · 490 units
            </div>
            <div className="hero-stat-grid">
              <div className="hsg-cell"><span className="hsg-num">240k+</span><span className="hsg-label">Fan Members</span></div>
              <div className="hsg-cell"><span className="hsg-num">18k+</span><span className="hsg-label">Songs Annotated</span></div>
              <div className="hsg-cell"><span className="hsg-num">7</span><span className="hsg-label">Plush Characters</span></div>
              <div className="hsg-cell"><span className="hsg-num">4</span><span className="hsg-label">Major Labels</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────────── */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span className="marquee-item" key={i}><span className="marquee-dot" />{item}</span>
          ))}
        </div>
      </div>

      {/* ── LEADERBOARD: TOP CONTRIBUTORS ────────────────────────────────── */}
      <section className="section section-dark">
        <div className="lb-layout">
          <div className="lb-intro">
            <div className="section-eyebrow">Hall of Fame</div>
            <h2 className="section-title">Top<br /><em>Contributors</em><br />This Month</h2>
            <p>The community champions who shape the wiki. Annotate lyrics, correct translations, decode slang — and climb the ranks to earn exclusive rewards.</p>
            <Link href="/leaderboard" className="btn-primary" style={{ display: "inline-flex" }}>View Full Leaderboard</Link>
          </div>

          <div className="leaderboard-list">
            {topContributors.map((c, i) => {
              const rankCls = i === 0 ? "lb-rank-gold" : i === 1 ? "lb-rank-silver" : i === 2 ? "lb-rank-bronze" : "";
              const tint = AVATAR_TINTS[i] ?? AVATAR_TINTS[0];
              return (
                <Link href="/leaderboard" className="lb-item" key={c.username}>
                  <span className={`lb-rank ${rankCls}`}>#{i + 1}</span>
                  <div className="lb-avatar" style={{ background: tint.bg, color: tint.color, overflow: "hidden", padding: 0 }}>
                    {c.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.avatar} alt={c.username} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      c.initial
                    )}
                  </div>
                  <span className="lb-name">{c.username}</span>
                  <span>{i === 0 ? <span className="pill"><span className="pill-dot" />Top Fan</span> : null}</span>
                  <span className="lb-pts">{c.points.toLocaleString()} pts</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── REWARDS ──────────────────────────────────────────────────────── */}
      <section className="section section-mid">
        <div className="section-head-row">
          <div>
            <div className="section-eyebrow">Aegyo Rewards</div>
            <h2 className="section-title">Collect Points.<br /><em>Win the Dream.</em></h2>
          </div>
          <p className="section-sub">Every annotation, comment, and approved edit brings you closer to your idol.</p>
        </div>

        <div className="rewards-grid">
          {REWARDS.map((r) => (
            <Link href="/daebak-rewards" className={`reward-card ${r.cls}`} key={r.name}>
              <span className="reward-badge">{r.badge}</span>
              <span className="reward-icon">{r.icon}</span>
              <div className="reward-name">{r.name}</div>
              <div className="reward-pts">{r.pts}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── EARN ─────────────────────────────────────────────────────────── */}
      <section className="section section-dark">
        <div className="earn-grid">
          <div>
            <div className="earn-card-stack">
              <div className="earn-card ec1">
                <div className="earn-card-label">Sign-Up Bonus</div>
                <div className="earn-card-pts">+50</div>
                <div className="earn-card-desc">One-time reward, just for creating your account.</div>
              </div>
              <div className="earn-card ec2">
                <div className="earn-card-label">Annotation</div>
                <div className="earn-card-pts">+20</div>
                <div className="earn-card-desc">Explain a lyric. Help the fandom understand.</div>
              </div>
              <div className="earn-card ec3">
                <div className="earn-card-label">Comment</div>
                <div className="earn-card-pts">+1</div>
                <div className="earn-card-desc">Join the conversation on any song page.</div>
              </div>
            </div>
          </div>

          <div>
            <div className="section-eyebrow">How to Earn</div>
            <h2 className="section-title" style={{ marginBottom: 40 }}>Five Ways<br /><em>to Win Points</em></h2>
            <ul className="earn-ways">
              {EARN_WAYS.map((w) => (
                <li className="earn-way" key={w.name}>
                  <div className="earn-way-left">
                    <div className={`earn-way-icon ${w.iconCls}`}>{w.icon}</div>
                    <div>
                      <span className="earn-way-name">{w.name}</span>
                      <span className="earn-way-desc">{w.desc}</span>
                    </div>
                  </div>
                  <span className="earn-pts-badge">{w.pts}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── MERCH ────────────────────────────────────────────────────────── */}
      <section className="merch-section section-mid">
        <div className="merch-header">
          <div>
            <div className="section-eyebrow">Aegyo Merch</div>
            <h2 className="section-title">Wear the<br /><em>Culture.</em></h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <p className="section-sub">Earned through points. Worn in the streets of Seoul.</p>
            <Link href="/merch" className="btn-primary" style={{ display: "inline-flex", marginTop: 20 }}>Shop the Merch</Link>
          </div>
        </div>

        <div className="merch-scroll" id="merchScroll">
          {MERCH.map((m) => (
            <div className={`merch-card ${m.size}`} key={m.tag}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.img} alt={m.text} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }} />
              <div className="merch-caption">
                <div className="merch-caption-tag">{m.tag}</div>
                <div className="merch-caption-text">{m.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── EXPLORE ──────────────────────────────────────────────────────── */}
      <section className="section section-dark">
        <div className="section-head-row">
          <div>
            <div className="section-eyebrow">The Universe</div>
            <h2 className="section-title">Explore<br /><em>Everything.</em></h2>
          </div>
          <p className="section-sub">Artists, lyrics, slang, collaborations, cities and sounds.</p>
        </div>

        <div className="featured-grid">
          <Link href="/artists" className="feat-card feat-main" style={{ backgroundImage: "url('/images/redesign/explore-artists.png')", backgroundSize: "cover", backgroundPosition: "center top", gridColumn: 1, gridRow: "1/3", minHeight: 500 }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(30,35,45,0.95) 0%,rgba(30,35,45,0.4) 50%,rgba(30,35,45,0.1) 100%)" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <div className="feat-tag" style={{ color: "var(--sakura)" }}>Artists</div>
              <div className="feat-title">Discover Every<br />Artist &amp; Group</div>
            </div>
          </Link>

          <Link href="/songs" className="feat-card feat-small" style={{ backgroundImage: "url('/images/redesign/explore-lyrics.png')", backgroundSize: "cover", backgroundPosition: "center 20%", border: "none" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(20,15,35,0.92) 0%,rgba(20,15,35,0.3) 60%,transparent 100%)" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <div className="feat-tag" style={{ color: "var(--lavender)" }}>Lyrics</div>
              <div className="feat-title">18k+ Songs Annotated</div>
            </div>
          </Link>

          <Link href="/korean-slang" className="feat-card feat-small-alt" style={{ backgroundImage: "url('/images/redesign/explore-slang.png')", backgroundSize: "cover", backgroundPosition: "center 30%", border: "none" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(25,20,45,0.92) 0%,rgba(25,20,45,0.3) 60%,transparent 100%)" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <div className="feat-tag" style={{ color: "var(--sky)" }}>Slang</div>
              <div className="feat-title">K-pop Slang Dictionary</div>
            </div>
          </Link>

          <Link href="/collabs" className="feat-card feat-small-volt" style={{ backgroundImage: "url('/images/redesign/explore-collabs.png')", backgroundSize: "cover", backgroundPosition: "center top", border: "none" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(20,30,25,0.92) 0%,rgba(20,30,25,0.25) 60%,transparent 100%)" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <div className="feat-tag" style={{ color: "var(--volt)" }}>Collabs</div>
              <div className="feat-title">Artist Collaborations</div>
            </div>
          </Link>

          <Link href="/cities" className="feat-card feat-small-sky" style={{ backgroundImage: "url('/images/redesign/explore-cities.png')", backgroundSize: "cover", backgroundPosition: "center 40%", border: "none" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(15,25,35,0.92) 0%,rgba(15,25,35,0.25) 60%,transparent 100%)" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <div className="feat-tag" style={{ color: "var(--sky)" }}>Cities</div>
              <div className="feat-title">Global K-pop Cities</div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────────────────── */}
      <div className="newsletter">
        <div className="nl-blob nl-b1" />
        <div className="nl-blob nl-b2" />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="nl-eyebrow">Stay in the Loop</div>
          <h2 className="nl-title">K-pop news,<br /><em>straight to you.</em></h2>
          <p className="nl-sub">New lyrics, artist breakdowns, slang drops, and chart alerts. No spam. Just K-pop.</p>
        </div>
        <HomeInteractions />
      </div>
    </main>
  );
}
