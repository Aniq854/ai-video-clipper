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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="/" className="navbar-brand gradient-text">Snipr AI</a>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <a href="/" className="nav-link">Tool</a>
              <a href="/blog" className="nav-link">Blog & Guides</a>
            </div>
          </div>
        </nav>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
