export const metadata = {
  title: 'About Us | Snipr AI — Free AI Video Clipper',
  description: 'Learn the story behind Snipr AI — why we built the fastest free AI video clipper for content creators who want to repurpose long videos into viral shorts.',
};

export default function AboutPage() {
  return (
    <div className="fade-in" style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '5rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9999px', padding: '0.35rem 1rem', fontSize: '0.78rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '1rem', letterSpacing: '0.06em' }}>
          OUR STORY
        </div>
        <h1 style={{ fontSize: '2.75rem', color: '#ffffff', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
          About Snipr AI
        </h1>
        <p style={{ color: '#71717a', fontSize: '1.15rem', lineHeight: 1.65 }}>
          The fastest free AI video clipper — built for creators who are tired of spending hours editing.
        </p>
      </header>

      <div className="article-content" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', padding: '2.75rem', lineHeight: 1.8, fontSize: '1.05rem', color: '#d4d4d8' }}>

        <h2>Why We Built Snipr AI</h2>
        <p>We were content creators before we were developers. Like most creators, we spent hours every week doing the same repetitive task: scrubbing through long podcast recordings, finding the good 45-second moments, cutting them out, and reformatting from 16:9 horizontal to 9:16 vertical for TikTok and Reels.</p>
        <p>It took us 3 to 4 hours every Sunday to produce a week's worth of short-form clips from our long-form content. We knew there had to be a better way. Every existing AI clipper we tried was either too slow, too expensive, riddled with watermarks, or required us to create yet another subscription account.</p>
        <p>So we built <strong>Snipr AI</strong>.</p>

        <h2>What Makes Snipr AI Different</h2>
        <p>Most AI video clippers re-encode your video from scratch, which takes 5 to 20 minutes per clip. Snipr AI uses <strong>FFmpeg stream copying</strong> — instead of re-encoding every frame, it surgically cuts your video at the exact timestamps you specify, copying the raw video and audio streams directly. The result is a perfectly cut MP4 clip generated in 3 seconds, with zero quality loss.</p>
        <p>We also refuse to hide useful features behind a paywall. Snipr AI is completely free, requires no account creation, and puts no watermark on your generated clips. We believe creators should own their content, period.</p>

        <h2>Our Mission</h2>
        <p>Our mission is simple: <em>remove the technical barrier between a creator and their viral moment.</em> The best clip from your last podcast or interview should take 30 seconds to create and post — not 3 hours. Snipr AI exists to make that the reality for every creator, regardless of their technical skill level or budget.</p>

        <h2>Who Snipr AI Is For</h2>
        <ul>
          <li><strong>Podcasters</strong> who want to distribute their episode highlights across TikTok, Reels, and Shorts without hiring an editor</li>
          <li><strong>YouTubers</strong> who want to repurpose their long-form content into Shorts without re-editing their whole video</li>
          <li><strong>Businesses and Coaches</strong> who record webinars or online sessions and want to extract key moments as social proof content</li>
          <li><strong>Social Media Managers</strong> who manage high-volume content calendars and need a fast, reliable clip extraction tool with no per-clip cost</li>
        </ul>

        <h2>Our Technology</h2>
        <p>Snipr AI is powered by a Node.js backend running FFmpeg for video processing, with React and Next.js on the frontend. Generated clips are stored on Cloudflare's R2 global CDN network, which means your clips are served from the data center nearest to you — giving you near-instant download speeds regardless of where you are in the world.</p>

        <h2>What Is Coming Next</h2>
        <p>We are actively developing the next version of Snipr AI, which will include AI-powered scene detection (automatically identifying the most engaging moments in your video without you having to specify timestamps), burned-in caption generation, and direct upload integration with TikTok, Instagram, and YouTube. If you want to be the first to access these features, follow our <a href="/blog">blog</a> for updates.</p>

        <h2>Get in Touch</h2>
        <p>We genuinely want to hear from creators who are using Snipr AI. Your feedback directly shapes what we build next. Reach us through our <a href="/contact">Contact page</a> — we read every message.</p>
      </div>

      {/* Stats section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2.5rem' }}>
        {[
          { number: '3s', label: 'Average clip generation time' },
          { number: '100%', label: 'Free — no subscription ever' },
          { number: '0', label: 'Watermarks on your clips' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.04em', marginBottom: '0.5rem' }}>{stat.number}</div>
            <div style={{ color: '#71717a', fontSize: '0.875rem', lineHeight: 1.4 }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
