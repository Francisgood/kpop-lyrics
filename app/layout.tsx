import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import QuizButton from "@/components/QuizButton";
import FooterNewsletter from "@/components/FooterNewsletter";

export const metadata: Metadata = {
  title: "Aegyo Annotate — K-pop Lyrics & Fan Wiki",
  description: "K-pop lyrics, translations, and fan annotations",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="genius-nav" style={{ position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 32, height: 56 }}>
            <Link href="/" style={{ fontWeight: 700, fontSize: "1.4rem", letterSpacing: "0.04em", color: "var(--genius-yellow)", textDecoration: "none", fontFamily: "monospace" }}>
              Aegyo Annotate
            </Link>

            <form action="/search" style={{ flex: 1, maxWidth: 480 }}>
              <input
                name="q"
                type="search"
                placeholder="Search songs, artists, terms..."
                className="search-input"
              />
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: 24, marginLeft: "auto" }}>
              <Link href="/artists" className="genius-nav" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
                ARTISTS
              </Link>
              <Link href="/collabs" className="genius-nav" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
                COLLABS
              </Link>
              <Link href="/define" className="genius-nav" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600 }}>
                K-POP TERMS
              </Link>
              <QuizButton />
              <Link href="/search" className="btn-yellow" style={{ fontSize: "0.75rem" }}>
                EXPLORE
              </Link>
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
              <div style={{ fontWeight: 800, color: "var(--genius-yellow)", fontSize: "1.1rem", marginBottom: 10, fontFamily: "monospace" }}>Aegyo Annotate</div>
              <div style={{ fontSize: "0.78rem", lineHeight: 1.8, color: "rgba(255,255,255,0.4)" }}>
                K-pop lyrics, translations<br />fan wiki &amp; slang dictionary
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>Discover</div>
              {[["Artists", "/artists"], ["Collaborations", "/collabs"], ["K-pop Terms", "/define"], ["Search", "/search"]].map(([label, href]) => (
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
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px", textAlign: "center", fontSize: "0.72rem", color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} Aegyo Annotate · Fan-made K-pop resource · Not affiliated with any artist, label, or agency
          </div>
        </footer>
      </body>
    </html>
  );
}
