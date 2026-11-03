import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ISP.coop — Internet Service Provider Cooperative",
  description:
    "Member-owned fiber internet on open-access networks. Every member who joins lowers the price for everyone.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <header className="site-header">
          <div className="wrap header-inner">
            <a href="/" className="wordmark">
              ISP<span>.coop</span>
            </a>
            <nav>
              <a href="/#how">How it works</a>
              <a href="/#pricing">Pricing</a>
              <a href="/#governance">Governance</a>
              <a href="/#broadlinc" className="btn btn-small">Broadlinc</a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="wrap footer-inner">
            <div>
              <div className="wordmark">ISP<span>.coop</span></div>
              <p>Internet Service Provider Cooperative. A Utah cooperative (in formation).</p>
            </div>
            <p className="muted">
              Self-managed by members. No phone support; help lives in the member forum.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
