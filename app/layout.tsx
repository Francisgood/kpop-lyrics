// Build: 2026-05-25
import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import FooterNewsletter from "@/components/FooterNewsletter";
import HamburgerMenu from "@/components/HamburgerMenu";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
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
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", gap: 16, height: 52 }}>
            <Link href="/" style={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: "0.04em", color: "var(--genius-yellow)", textDecoration: "none", fontFamily: "monospace", whiteSpace: "nowrap", flexShrink: 0 }}>
              Aegyo Arena
            </Link>

            <form action="/search" className="nav-search-form" style={{ flex: 1, maxWidth: 400 }}>
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
        <footer style={{ background: "#000", color: "rgba(255,255,255,0.5)", marginTop: 80 }}>
          {/* Newsletter strip */}
          <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "56px 24px 48px" }}>
            <FooterNewsletter />
          </div>

          {/* Footer links */}
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 24px 28px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 32 }}>
            <div>
              <div style={{ fontWeight: 800, color: "var(--genius-yellow)", fontSize: "1.1rem", marginBottom: 10, fontFamily: "monospace" }}>Aegyo Arena</div>
              <div style={{ fontSize: "0.78rem", lineHeight: 1.8, color: "rgba(255,255,255,0.4)" }}>
                K-pop lyrics, translations<br />fan wiki &amp; slang dictionary
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>Discover</div>
              {[["Artists", "/artists"], ["Collaborations", "/collabs"], ["Signals", "/news"], ["Slang", "/define"], ["Cities", "/cities"], ["Search", "/search"]].map(([label, href]) => (
                <Link key={href} href={href} style={{ display: "block", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: 8, lineHeight: 1 }}>
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>Labels</div>
              {[["HYBE", "/labels/hybe-entertainment"], ["SM Entertainment", "/labels/sm-entertainment"], ["YG Entertainment", "/labels/yg-entertainment"], ["JYP Entertainment", "/labels/jyp-entertainment"]].map(([label, href]) => (
                <Link key={href} href={href} style={{ display: "block", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: 8, lineHeight: 1 }}>
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>Community</div>
              {[["Daebak Rewards", "/dashboard"], ["Contribute", "/signup"], ["Leaderboard", "/dashboard"]].map(([label, href]) => (
                <Link key={label} href={href} style={{ display: "block", fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: 8, lineHeight: 1 }}>
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>Follow</div>
              {[
                { label: "TikTok", href: "https://tiktok.com/@aegyoarena", icon: "♪" },
                { label: "YouTube", href: "https://youtube.com/@aegyoarena", icon: "▶" },
                { label: "X / Twitter", href: "https://x.com/aegyoarena", icon: "✕" },
                { label: "Reddit", href: "https://reddit.com/r/aegyoarena", icon: "○" },
              ].map(({ label, href, icon }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", textDecoration: "none", marginBottom: 8, lineHeight: 1 }}>
                  <span style={{ fontSize: "0.72rem", opacity: 0.6 }}>{icon}</span>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px", textAlign: "center", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} Aegyo Arena · Fan-made K-pop resource · Not affiliated with any artist, label, or agency
          </div>
        </footer>
      </body>
    </html>
  );
}
