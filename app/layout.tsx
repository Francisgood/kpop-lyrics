// Build: 2026-06-14 — sakura redesign
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import FooterNewsletter from "@/components/FooterNewsletter";
import HamburgerMenu from "@/components/HamburgerMenu";
import { getSession } from "@/lib/auth";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.aegyoarena.com"),
  title: "Aegyo Arena — K-pop Lyrics & Fan Wiki",
  description: "K-pop lyrics, translations, and fan annotations",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const isLoggedIn  = !!session;
  const displayName = session?.user.displayName ?? session?.user.email.split("@")[0];
  const userId      = session?.user.id;

  return (
    <html lang="en">
      <body>
        <nav className="genius-nav" style={{ position: "sticky", top: 0, zIndex: 100 }}>
          {/* Primary row: logo + search + hamburger */}
          <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 20, height: 64 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0, textDecoration: "none" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/aegyo-logo.png" alt="Aegyo Arena" style={{ height: 34, width: "auto", display: "block" }} />
            </Link>

            <form action="/search" className="nav-search-form" style={{ flex: 1, maxWidth: 380 }}>
              <input
                name="q"
                type="search"
                placeholder="Search songs, artists, terms..."
                className="search-input"
              />
            </form>

            <div style={{ marginLeft: "auto", flexShrink: 0 }}>
              <HamburgerMenu
                isLoggedIn={isLoggedIn}
                displayName={displayName}
                userId={userId}
              />
            </div>
          </div>
        </nav>
        {children}
        <footer style={{ background: "var(--bg-card)", color: "var(--ink-dim)", marginTop: 80, borderTop: "1px solid var(--border)" }}>
          {/* Newsletter strip */}
          <div style={{ borderBottom: "1px solid var(--border)", padding: "56px 24px 48px" }}>
            <FooterNewsletter />
          </div>

          {/* Footer links */}
          <div style={{ maxWidth: 1240, margin: "0 auto", padding: "56px 24px 36px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48 }} className="footer-top-grid">
            <div>
              <Link href="/" style={{ display: "inline-block", marginBottom: 16 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/aegyo-logo-footer.png" alt="Aegyo Arena" style={{ height: 34, width: "auto", display: "block" }} />
              </Link>
              <div style={{ fontSize: "1rem", fontWeight: 300, lineHeight: 1.7, color: "var(--ink-faint)", maxWidth: 240, marginBottom: 22 }}>
                K-pop lyrics, translations, fan wiki and slang dictionary. Fan-made and fandom-powered.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "X / Twitter", href: "https://x.com/aegyoarena", icon: "✕" },
                  { label: "TikTok", href: "https://www.tiktok.com/@aegyo.arena", icon: "♪" },
                ].map(({ label, href, icon }) => (
                  <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="social-btn" aria-label={label}>
                    {icon}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="footer-col-title">Discover</div>
              {[["Artists", "/artists"], ["Collaborations", "/collabs"], ["Signals", "/news"], ["Slang", "/korean-slang"], ["Cities", "/cities"], ["Search", "/search"]].map(([label, href]) => (
                <Link key={href} href={href} style={{ display: "block", fontSize: "1rem", fontWeight: 300, color: "var(--ink-dim)", textDecoration: "none", marginBottom: 10 }}>
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <div className="footer-col-title">Culture Vulture</div>
              {[["Dance", "/culture/dance"], ["Fashion", "/culture/fashion"], ["Beauty", "/culture/beauty"], ["Mukbang", "/culture/mukbang"]].map(([label, href]) => (
                <Link key={href} href={href} style={{ display: "block", fontSize: "1rem", fontWeight: 300, color: "var(--ink-dim)", textDecoration: "none", marginBottom: 10 }}>
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <div className="footer-col-title">Community</div>
              {[["Quiz", "/quiz"], ["Daebak Rewards", "/daebak-rewards"], ["Merch", "/merch"], ["Leaderboard", "/leaderboard"], ["Contribute", "/contribute"], ["BTS Giveaway", "/bts-giveaway"]].map(([label, href]) => (
                <Link key={label} href={href} style={{ display: "block", fontSize: "1rem", fontWeight: 300, color: "var(--ink-dim)", textDecoration: "none", marginBottom: 10 }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: "1px solid var(--border)", maxWidth: 1240, margin: "0 auto", padding: "28px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", fontSize: "0.78rem", color: "var(--ink-faint)", fontFamily: "var(--mono)", letterSpacing: "0.04em" }}>
            <span>
              © {new Date().getFullYear()} Aegyo Arena · Fan-made K-pop resource · Not affiliated with any artist, label, or agency
              {" · "}
              <Link href="/privacy-policy" style={{ color: "inherit", textDecoration: "underline" }}>Privacy Policy</Link>
            </span>
            <span>Made with ♡ by the fandom</span>
          </div>
        </footer>

        {/* Google Analytics (gtag.js) — site traffic + paid-ads/referral source tracking */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-700MXJM1FW" strategy="afterInteractive" />
        <Script id="ga4-gtag" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-700MXJM1FW');`}
        </Script>

        {/* Taboola Pixel — paid-ads conversion tracking (account 2066412) */}
        <Script id="taboola-tfa" strategy="afterInteractive">
          {`window._tfa = window._tfa || [];
window._tfa.push({notify: 'event', name: 'page_view', id: 2066412});
!function (t, f, a, x) {
  if (!document.getElementById(x)) {
    t.async = 1;t.src = a;t.id=x;f.parentNode.insertBefore(t, f);
  }
}(document.createElement('script'),
document.getElementsByTagName('script')[0],
'//cdn.taboola.com/libtrc/unip/2066412/tfa.js',
'tb_tfa_script');`}
        </Script>

        {/* Reddit Pixel — paid-ads conversion tracking (a2_j9m653pqhzu7) */}
        <Script id="reddit-pixel" strategy="afterInteractive">
          {`!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js?pixel_id=a2_j9m653pqhzu7",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','a2_j9m653pqhzu7');rdt('track', 'PageVisit');`}
        </Script>
      </body>
    </html>
  );
}
