import './globals.css';
import HeaderAds from '../components/HeaderAds';

export const metadata = {
  title: 'ClipAI — AI Video Clipping Tool',
  description: 'Transform your long videos into viral clips using AI.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script type="text/javascript" src="https://pl30711070.effectivecpmnetwork.com/8b/e9/2e/8be92e7aac2c6f089c73f5a55de9bee9.js"></script>
      </head>
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
