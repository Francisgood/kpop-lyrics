import Link from "next/link";
import type { Metadata } from "next";
import { CONTRIBUTORS } from "@/app/leaderboard/data";
import HomeInteractions from "@/components/HomeInteractions";
import { T, LangToggle } from "@/components/LangProvider";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contribute & Explore — Aegyo Arena",
  description: "Join Aegyo Arena: annotate lyrics, decode slang, earn Daebak points and rewards, and explore every artist, city and collaboration in the K-pop universe.",
  openGraph: {
    title: "Contribute & Explore — Aegyo Arena",
    description: "Annotate lyrics, earn rewards, and explore the K-pop universe — built by fans, for fans.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

/** A localized string. `es` is omitted for proper nouns that stay as-is. */
type L = { en: string; es?: string };

const MARQUEE_ITEMS: L[] = [
  { en: "HYBE Entertainment" }, { en: "SM Entertainment" }, { en: "YG Entertainment" }, { en: "JYP Entertainment" },
  { en: "Aegyo Rewards" },
  { en: "K-Pop Lyrics", es: "Letras de K-Pop" },
  { en: "Fan Annotations", es: "Anotaciones de Fans" },
  { en: "Slang Dictionary", es: "Diccionario de Jerga" },
  { en: "Concert Tickets", es: "Boletos de Concierto" },
  { en: "Signed Memorabilia", es: "Memorabilia Firmada" },
  { en: "240,000 Members", es: "240,000 Miembros" },
];

const REWARDS: { cls: string; badge: L; icon: string; name: L; pts: L }[] = [
  { cls: "rc-sakura",    badge: { en: "Tier 1",  es: "Nivel 1" }, icon: "👕", name: { en: "Merch Drop",         es: "Drop de Merch" },       pts: { en: "2,000 pts" } },
  { cls: "rc-volt",      badge: { en: "Tier 2",  es: "Nivel 2" }, icon: "🧸", name: { en: "K-pop Plushie",      es: "Peluche K-pop" },       pts: { en: "3,000 pts" } },
  { cls: "rc-sky",       badge: { en: "Tier 3",  es: "Nivel 3" }, icon: "✨", name: { en: "Desk Toy",           es: "Figura de Escritorio" }, pts: { en: "4,000 pts" } },
  { cls: "rc-tangerine", badge: { en: "Tier 4",  es: "Nivel 4" }, icon: "🎫", name: { en: "Concert Ticket",     es: "Boleto de Concierto" }, pts: { en: "5,000 pts" } },
  { cls: "rc-lavender",  badge: { en: "Auction", es: "Subasta" }, icon: "✍️", name: { en: "Signed Memorabilia", es: "Memorabilia Firmada" }, pts: { en: "Bid-based", es: "Por subasta" } },
];

const EARN_WAYS: { icon: string; iconCls: string; name: L; desc: L; pts: L }[] = [
  { icon: "🎤", iconCls: "ewi-1", name: { en: "Post a Comment",      es: "Publica un Comentario" }, desc: { en: "Share your thoughts on any song, artist, or album", es: "Comparte lo que piensas de cualquier canción, artista o álbum" }, pts: { en: "+1 pt" } },
  { icon: "✍️", iconCls: "ewi-2", name: { en: "Add an Annotation",    es: "Agrega una Anotación" },  desc: { en: "Decode a lyric line for the community",             es: "Descifra una línea de la letra para la comunidad" },            pts: { en: "+20 pts" } },
  { icon: "✅", iconCls: "ewi-3", name: { en: "Annotation Approved", es: "Anotación Aprobada" },    desc: { en: "An editor accepts it; rejected ones lose 10",       es: "Un editor la acepta; las rechazadas te quitan 10" },            pts: { en: "+10 pts" } },
  { icon: "⭐", iconCls: "ewi-4", name: { en: "Sign-up Bonus",        es: "Bono de Registro" },      desc: { en: "One-time reward when you create your account",      es: "Recompensa única al crear tu cuenta" },                         pts: { en: "+50 pts" } },
  { icon: "🔗", iconCls: "ewi-5", name: { en: "Link Social Profiles", es: "Vincula tus Redes" },     desc: { en: "Verify up to 3 social media accounts",              es: "Verifica hasta 3 cuentas de redes sociales" },                  pts: { en: "+10 each", es: "+10 c/u" } },
];

// Merch slogans are the graphics printed on the products in the photos — they stay
// in English in both languages, the same way a song title would.
const MERCH = [
  { img: "/images/redesign/merch-01.png", size: "wide", tag: "Drop 01", text: "“Hwaiting !!!” — Neon Seoul" },
  { img: "/images/redesign/merch-02.png", size: "wide", tag: "Drop 02", text: "“I Learned Korean For This”" },
  { img: "/images/redesign/merch-03.png", size: "tall", tag: "Drop 03", text: "“My Parents Think It's A Phase”" },
  { img: "/images/redesign/merch-04.png", size: "tall", tag: "Drop 04", text: "“Unboxed 12 Albums. Got His Unit.”" },
  { img: "/images/redesign/merch-05.png", size: "tall", tag: "Drop 05", text: "“Mukbang Made Me Do It”" },
  { img: "/images/redesign/merch-06.png", size: "tall", tag: "Drop 06", text: "“Killing Part Survivor”" },
];

const AVATAR_TINTS = [
  { bg: "rgba(255,111,168,0.2)", color: "var(--sakura)" },
  { bg: "var(--lavender-dim)",   color: "var(--lavender)" },
  { bg: "var(--sky-dim)",        color: "var(--sky)" },
  { bg: "var(--volt-dim)",       color: "var(--volt)" },
  { bg: "rgba(255,140,66,0.18)", color: "var(--tangerine)" },
  { bg: "rgba(255,111,168,0.2)", color: "var(--sakura)" },
];

export default async function ContributePage() {
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
            <LangToggle align="flex-start" marginBottom={16} />
            <div className="hero-eyebrow"><T en="Fan-made · Fandom-powered" es="Hecho por fans · Impulsado por el fandom" /></div>
            <p className="hero-body">
              <T
                en="The K-pop universe built by fans, for fans. Annotate lyrics, decode slang, and earn real rewards — including our iconic chibi plush collection."
                es="El universo del K-pop hecho por fans, para fans. Anota letras, descifra la jerga y gana recompensas reales — incluyendo nuestra icónica colección de peluches chibi."
              />
            </p>
            <div className="hero-actions">
              <Link href="/signup" className="btn-primary">
                <T en="Start Earning" es="Empieza a Ganar" />
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link href="/artists" className="btn-ghost"><T en="Explore Artists" es="Explora Artistas" /></Link>
            </div>
          </div>

          <div className="hero-right-block fade-up fade-up-2">
            <div className="hero-collection-tag">
              <span style={{ width: 6, height: 6, background: "#fff", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
              <T en="Limited Collection · 490 units" es="Colección Limitada · 490 unidades" />
            </div>
            <div className="hero-stat-grid">
              <div className="hsg-cell"><span className="hsg-num">240k+</span><span className="hsg-label"><T en="Fan Members" es="Miembros del Fandom" /></span></div>
              <div className="hsg-cell"><span className="hsg-num">18k+</span><span className="hsg-label"><T en="Songs Annotated" es="Canciones Anotadas" /></span></div>
              <div className="hsg-cell"><span className="hsg-num">7</span><span className="hsg-label"><T en="Plush Characters" es="Personajes de Peluche" /></span></div>
              <div className="hsg-cell"><span className="hsg-num">4</span><span className="hsg-label"><T en="Major Labels" es="Grandes Sellos" /></span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────────── */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span className="marquee-item" key={i}><span className="marquee-dot" /><T en={item.en} es={item.es} /></span>
          ))}
        </div>
      </div>

      {/* ── LEADERBOARD: TOP CONTRIBUTORS ────────────────────────────────── */}
      <section className="section section-dark">
        <div className="lb-layout">
          <div className="lb-intro">
            <div className="section-eyebrow"><T en="Hall of Fame" es="Salón de la Fama" /></div>
            <h2 className="section-title">
              <T en="Top" es="Mejores" /><br /><em><T en="Contributors" es="Colaboradores" /></em><br /><T en="This Month" es="del Mes" />
            </h2>
            <p>
              <T
                en="The community champions who shape the wiki. Annotate lyrics, correct translations, decode slang — and climb the ranks to earn exclusive rewards."
                es="Los campeones de la comunidad que le dan forma a la wiki. Anota letras, corrige traducciones, descifra la jerga — y sube en el ranking para ganar recompensas exclusivas."
              />
            </p>
            <Link href="/leaderboard" className="btn-primary" style={{ display: "inline-flex" }}><T en="View Full Leaderboard" es="Ver Ranking Completo" /></Link>
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
            <h2 className="section-title">
              <T en="Collect Points." es="Junta Puntos." /><br /><em><T en="Win the Dream." es="Cumple el Sueño." /></em>
            </h2>
          </div>
          <p className="section-sub">
            <T
              en="Every annotation, comment, and approved edit brings you closer to your idol."
              es="Cada anotación, comentario y edición aprobada te acerca más a tu ídolo."
            />
          </p>
        </div>

        <div className="rewards-grid">
          {REWARDS.map((r) => (
            <Link href="/daebak-rewards" className={`reward-card ${r.cls}`} key={r.name.en}>
              <span className="reward-badge"><T en={r.badge.en} es={r.badge.es} /></span>
              <span className="reward-icon">{r.icon}</span>
              <div className="reward-name"><T en={r.name.en} es={r.name.es} /></div>
              <div className="reward-pts"><T en={r.pts.en} es={r.pts.es} /></div>
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
                <div className="earn-card-label"><T en="Sign-Up Bonus" es="Bono de Registro" /></div>
                <div className="earn-card-pts">+50</div>
                <div className="earn-card-desc"><T en="One-time reward, just for creating your account." es="Recompensa única, solo por crear tu cuenta." /></div>
              </div>
              <div className="earn-card ec2">
                <div className="earn-card-label"><T en="Annotation" es="Anotación" /></div>
                <div className="earn-card-pts">+20</div>
                <div className="earn-card-desc"><T en="Explain a lyric. Help the fandom understand." es="Explica una letra. Ayuda al fandom a entender." /></div>
              </div>
              <div className="earn-card ec3">
                <div className="earn-card-label"><T en="Comment" es="Comentario" /></div>
                <div className="earn-card-pts">+1</div>
                <div className="earn-card-desc"><T en="Join the conversation on any song page." es="Súmate a la conversación en cualquier página de canción." /></div>
              </div>
            </div>
          </div>

          <div>
            <div className="section-eyebrow"><T en="How to Earn" es="Cómo Ganar" /></div>
            <h2 className="section-title" style={{ marginBottom: 40 }}>
              <T en="Five Ways" es="Cinco Formas" /><br /><em><T en="to Win Points" es="de Ganar Puntos" /></em>
            </h2>
            <ul className="earn-ways">
              {EARN_WAYS.map((w) => (
                <li className="earn-way" key={w.name.en}>
                  <div className="earn-way-left">
                    <div className={`earn-way-icon ${w.iconCls}`}>{w.icon}</div>
                    <div>
                      <span className="earn-way-name"><T en={w.name.en} es={w.name.es} /></span>
                      <span className="earn-way-desc"><T en={w.desc.en} es={w.desc.es} /></span>
                    </div>
                  </div>
                  <span className="earn-pts-badge"><T en={w.pts.en} es={w.pts.es} /></span>
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
            <h2 className="section-title">
              <T en="Wear the" es="Viste la" /><br /><em><T en="Culture." es="Cultura." /></em>
            </h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <p className="section-sub"><T en="Earned through points. Worn in the streets of Seoul." es="Se gana con puntos. Se luce en las calles de Seoul." /></p>
            <Link href="/merch" className="btn-primary" style={{ display: "inline-flex", marginTop: 20 }}><T en="Shop the Merch" es="Compra la Merch" /></Link>
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
            <div className="section-eyebrow"><T en="The Universe" es="El Universo" /></div>
            <h2 className="section-title">
              <T en="Explore" es="Explora" /><br /><em><T en="Everything." es="Todo." /></em>
            </h2>
          </div>
          <p className="section-sub"><T en="Artists, lyrics, slang, collaborations, cities and sounds." es="Artistas, letras, jerga, colaboraciones, ciudades y sonidos." /></p>
        </div>

        <div className="featured-grid">
          <Link href="/artists" className="feat-card feat-main" style={{ backgroundImage: "url('/images/redesign/explore-artists.png')", backgroundSize: "cover", backgroundPosition: "center top", gridColumn: 1, gridRow: "1/3", minHeight: 500 }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(30,35,45,0.95) 0%,rgba(30,35,45,0.4) 50%,rgba(30,35,45,0.1) 100%)" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <div className="feat-tag" style={{ color: "var(--sakura)" }}><T en="Artists" es="Artistas" /></div>
              <div className="feat-title"><T en="Discover Every" es="Descubre Cada" /><br /><T en="Artist & Group" es="Artista y Grupo" /></div>
            </div>
          </Link>

          <Link href="/songs" className="feat-card feat-small" style={{ backgroundImage: "url('/images/redesign/explore-lyrics.png')", backgroundSize: "cover", backgroundPosition: "center 20%", border: "none" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(20,15,35,0.92) 0%,rgba(20,15,35,0.3) 60%,transparent 100%)" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <div className="feat-tag" style={{ color: "var(--lavender)" }}><T en="Lyrics" es="Letras" /></div>
              <div className="feat-title"><T en="18k+ Songs Annotated" es="18k+ Canciones Anotadas" /></div>
            </div>
          </Link>

          <Link href="/korean-slang" className="feat-card feat-small-alt" style={{ backgroundImage: "url('/images/redesign/explore-slang.png')", backgroundSize: "cover", backgroundPosition: "center 30%", border: "none" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(25,20,45,0.92) 0%,rgba(25,20,45,0.3) 60%,transparent 100%)" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <div className="feat-tag" style={{ color: "var(--sky)" }}><T en="Slang" es="Jerga" /></div>
              <div className="feat-title"><T en="K-pop Slang Dictionary" es="Diccionario de Jerga K-pop" /></div>
            </div>
          </Link>

          <Link href="/collabs" className="feat-card feat-small-volt" style={{ backgroundImage: "url('/images/redesign/explore-collabs.png')", backgroundSize: "cover", backgroundPosition: "center top", border: "none" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(20,30,25,0.92) 0%,rgba(20,30,25,0.25) 60%,transparent 100%)" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <div className="feat-tag" style={{ color: "var(--volt)" }}><T en="Collabs" es="Colabs" /></div>
              <div className="feat-title"><T en="Artist Collaborations" es="Colaboraciones de Artistas" /></div>
            </div>
          </Link>

          <Link href="/cities" className="feat-card feat-small-sky" style={{ backgroundImage: "url('/images/redesign/explore-cities.png')", backgroundSize: "cover", backgroundPosition: "center 40%", border: "none" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(15,25,35,0.92) 0%,rgba(15,25,35,0.25) 60%,transparent 100%)" }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <div className="feat-tag" style={{ color: "var(--sky)" }}><T en="Cities" es="Ciudades" /></div>
              <div className="feat-title"><T en="Global K-pop Cities" es="Ciudades K-pop del Mundo" /></div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────────────────── */}
      <div className="newsletter">
        <div className="nl-blob nl-b1" />
        <div className="nl-blob nl-b2" />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="nl-eyebrow"><T en="Stay in the Loop" es="No te Pierdas Nada" /></div>
          <h2 className="nl-title">
            <T en="K-pop news," es="Noticias de K-pop," /><br /><em><T en="straight to you." es="directo a ti." /></em>
          </h2>
          <p className="nl-sub">
            <T
              en="New lyrics, artist breakdowns, slang drops, and chart alerts. No spam. Just K-pop."
              es="Nuevas letras, análisis de artistas, drops de jerga y alertas de charts. Nada de spam. Puro K-pop."
            />
          </p>
        </div>
        <HomeInteractions />
      </div>
    </main>
  );
}
