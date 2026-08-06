import './globals.css';
import HeaderAds from '../components/HeaderAds';

export const metadata = {
  title: 'Snipr AI — AI Video Clipping Tool',
  description: 'Transform your long videos into viral clips using Snipr AI.',
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
          <div className="container">
            <a href="/" className="navbar-brand gradient-text">Snipr AI</a>
          </div>
        </nav>
        <HeaderAds />
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
