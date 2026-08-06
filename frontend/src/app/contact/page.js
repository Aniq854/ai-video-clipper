export const metadata = {
  title: 'Contact Us | Snipr AI',
  description: 'Get in touch with the Snipr AI team — for feedback, feature requests, partnership inquiries, or support.',
};

export default function ContactPage() {
  return (
    <div className="fade-in" style={{ maxWidth: '720px', margin: '0 auto', paddingBottom: '5rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9999px', padding: '0.35rem 1rem', fontSize: '0.78rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '1rem', letterSpacing: '0.06em' }}>
          GET IN TOUCH
        </div>
        <h1 style={{ fontSize: '2.75rem', color: '#ffffff', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
          Contact Us
        </h1>
        <p style={{ color: '#71717a', fontSize: '1.1rem', lineHeight: 1.65, maxWidth: '500px', margin: '0 auto' }}>
          We read every message and typically respond within 24–48 hours. Whether it is feedback, a bug, or a feature request — we want to hear from you.
        </p>
      </header>

      {/* Contact Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📧</div>
          <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>General Inquiries</h3>
          <p style={{ color: '#71717a', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>For general questions, partnerships, and business inquiries.</p>
          <a href="mailto:hello@sniprai.com" style={{ color: '#ffffff', fontWeight: '700', textDecoration: 'none', fontSize: '0.95rem' }}>hello@sniprai.com</a>
        </div>
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🐛</div>
          <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>Bug Reports & Support</h3>
          <p style={{ color: '#71717a', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>Having an issue with clipping or downloading? Let us know.</p>
          <a href="mailto:support@sniprai.com" style={{ color: '#ffffff', fontWeight: '700', textDecoration: 'none', fontSize: '0.95rem' }}>support@sniprai.com</a>
        </div>
      </div>

      {/* FAQ section */}
      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', padding: '2.5rem' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem', letterSpacing: '-0.02em' }}>Common Questions</h2>

        {[
          {
            q: 'My clip is not generating — what should I do?',
            a: 'Our processing server may be in a cold-start state (it spins down after inactivity). Wait 30 seconds and try again. If the issue persists after 2 attempts, email us at support@sniprai.com with the error message you see.'
          },
          {
            q: 'Are there any file size limits?',
            a: 'We accept video files up to 500MB using our chunked uploader. For larger files, consider compressing your video first using Handbrake (free) before uploading.'
          },
          {
            q: 'Can I use Snipr AI commercially?',
            a: 'Yes. The clips you generate are yours. You can use them for any commercial purpose including monetized YouTube channels, client deliverables, and paid social media campaigns.'
          },
          {
            q: 'How long are my clips stored?',
            a: 'Generated clips are automatically deleted from our Cloudflare R2 storage within 24 hours. Download your clips promptly after generation.'
          },
          {
            q: 'Do you offer a paid plan or API access?',
            a: 'We are currently fully free. API access for developers and teams is on our roadmap. Contact us at hello@sniprai.com to be added to the early access list.'
          },
        ].map((item, i) => (
          <div key={i} style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)', paddingTop: i === 0 ? 0 : '1.5rem', marginTop: i === 0 ? 0 : '1.5rem' }}>
            <h3 style={{ color: '#f4f4f5', fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem' }}>{item.q}</h3>
            <p style={{ color: '#71717a', fontSize: '0.95rem', lineHeight: 1.65 }}>{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
