import './globals.css';
import HeaderAds from '../components/HeaderAds';

export const metadata = {
  title: 'ClipAI — AI Video Clipping Tool',
  description: 'Transform your long videos into viral clips using AI.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="container">
            <a href="/" className="navbar-brand gradient-text">ClipAI</a>
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
