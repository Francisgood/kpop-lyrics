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
                  { label: "X / Twitter", href: "https://x.com/aegyoarena", node: "✕" as React.ReactNode },
                  { label: "TikTok", href: "https://www.tiktok.com/@aegyo.arena", node: "♪" as React.ReactNode },
                  { label: "YouTube", href: "https://www.youtube.com/@Aegyoarena", node: (
                    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.8ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" /></svg>
                  ) },
                  { label: "Reddit", href: "https://www.reddit.com/user/aegyo-arena/", node: (
                    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M24 11.78a2.57 2.57 0 0 0-4.36-1.83 12.6 12.6 0 0 0-6.86-2.17l1.17-5.5 3.82.81a1.83 1.83 0 1 0 .19-.87l-4.27-.9a.45.45 0 0 0-.53.35l-1.3 6.11a12.63 12.63 0 0 0-6.96 2.17 2.57 2.57 0 1 0-2.84 4.22 5.16 5.16 0 0 0-.06.78c0 3.98 4.64 7.21 10.36 7.21s10.36-3.23 10.36-7.21a5.16 5.16 0 0 0-.06-.78A2.57 2.57 0 0 0 24 11.78ZM6.33 13.6a1.83 1.83 0 1 1 3.66 0 1.83 1.83 0 0 1-3.66 0Zm10.23 4.85a5.42 5.42 0 0 1-3.9 1.2h-.03a5.42 5.42 0 0 1-3.9-1.2.34.34 0 1 1 .48-.49 4.76 4.76 0 0 0 3.42 1.02h.03a4.76 4.76 0 0 0 3.42-1.02.34.34 0 0 1 .48.49Zm-.36-3.02a1.83 1.83 0 1 1 0-3.66 1.83 1.83 0 0 1 0 3.66Z" /></svg>
                  ) },
                ].map(({ label, href, node }) => (
                  <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="social-btn" aria-label={label}>
                    {node}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div className="footer-col-title">Discover</div>
              {[["Artists", "/artists"], ["Collaborations", "/collabs"], ["Signals", "/news"], ["Slang", "/korean-slang"], ["Cities", "/cities"], ["Events", "/events"], ["Search", "/search"]].map(([label, href]) => (
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

        {/* TikTok Pixel — paid-ads conversion tracking (D9AFTIJC77U1026600GG) */}
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

  ttq.load('D9AFTIJC77U1026600GG');
  ttq.page();
}(window, document, 'ttq');`}
        </Script>
      </body>
    </html>
  );
}
