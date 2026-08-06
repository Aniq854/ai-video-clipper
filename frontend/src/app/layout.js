import './globals.css';

export const metadata = {
  title: 'Free AI Video Clipper – Turn Long Videos into Viral Shorts | Snipr AI',
  description: 'Snipr AI is the fastest free AI video clipper. Transform long podcasts, YouTube videos, and MP4 files into viral TikToks, Instagram Reels, and YouTube Shorts in 3 seconds.',
  keywords: ['AI video clipper', 'video to shorts', 'repurpose long videos', 'free clip generator', 'YouTube to TikTok clipper', 'Snipr AI'],
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
  verification: {
    google: '9NXg-dFTqTBZ1ug-Dx1ifzCUK1CCSfzoTKpOuhoM7-Y',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Navbar */}
        <nav className="navbar">
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="/" className="navbar-brand gradient-text">Snipr AI</a>
            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
              <a href="/" className="nav-link">Tool</a>
              <a href="/blog" className="nav-link">Blog</a>
              <a href="/about" className="nav-link">About</a>
              <a href="/contact" className="nav-link">Contact</a>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container">
          {children}
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          marginTop: '5rem',
          padding: '3rem 0 2rem 0',
          background: '#000000',
        }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>

              {/* Brand */}
              <div>
                <a href="/" style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ffffff', textDecoration: 'none', letterSpacing: '-0.03em', display: 'block', marginBottom: '0.75rem' }}>
                  Snipr AI
                </a>
                <p style={{ color: '#52525b', fontSize: '0.875rem', lineHeight: 1.65, maxWidth: '220px' }}>
                  The fastest free AI video clipper. Turn long videos into viral Shorts, Reels, and TikToks in 3 seconds.
                </p>
              </div>

              {/* Tool */}
              <div>
                <h4 style={{ color: '#a1a1aa', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.08em', marginBottom: '1rem' }}>TOOL</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <a href="/" className="footer-link">Video Clipper</a>
                  <a href="/#how-it-works" className="footer-link">How It Works</a>
                  <a href="/#faq" className="footer-link">FAQ</a>
                </div>
              </div>

              {/* Content */}
              <div>
                <h4 style={{ color: '#a1a1aa', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.08em', marginBottom: '1rem' }}>GUIDES</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <a href="/blog" className="footer-link">All Guides</a>
                  <a href="/blog/how-to-turn-youtube-videos-into-tiktok-clips-2026-guide" className="footer-link">YouTube to TikTok</a>
                  <a href="/blog/best-clip-length-reels-vs-shorts-vs-tiktok" className="footer-link">Optimal Clip Length</a>
                  <a href="/blog/viral-short-form-video-hooks-guide" className="footer-link">Viral Hook Formulas</a>
                </div>
              </div>

              {/* Company */}
              <div>
                <h4 style={{ color: '#a1a1aa', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.08em', marginBottom: '1rem' }}>COMPANY</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <a href="/about" className="footer-link">About Us</a>
                  <a href="/contact" className="footer-link">Contact</a>
                  <a href="/privacy" className="footer-link">Privacy Policy</a>
                  <a href="/terms" className="footer-link">Terms of Service</a>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <p style={{ color: '#3f3f46', fontSize: '0.85rem' }}>
                © 2026 Snipr AI. All rights reserved.
              </p>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <a href="/privacy" className="footer-link" style={{ fontSize: '0.85rem' }}>Privacy Policy</a>
                <a href="/terms" className="footer-link" style={{ fontSize: '0.85rem' }}>Terms of Service</a>
                <a href="/contact" className="footer-link" style={{ fontSize: '0.85rem' }}>Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
