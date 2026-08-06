import Link from 'next/link';

export const metadata = {
  title: 'Video Repurposing & Short-Form Growth Blog | Snipr AI',
  description: 'Expert guides on AI video clipping, YouTube Shorts, TikTok, and Instagram Reels growth strategies. Turn long videos into viral content with Snipr AI.',
};

export const posts = [
  {
    slug: 'how-to-turn-youtube-videos-into-tiktok-clips-2026-guide',
    title: 'How to Turn YouTube Videos into TikTok Clips & Shorts (2026 Ultimate Guide)',
    excerpt: 'Discover the exact step-by-step framework to repurpose long podcasts and interviews into high-retention 9:16 vertical TikTok clips that go viral.',
    date: 'August 6, 2026',
    readTime: '7 min read',
    category: 'Repurposing Guide',
    emoji: '🎬',
  },
  {
    slug: 'best-clip-length-reels-vs-shorts-vs-tiktok',
    title: 'Best Clip Length for Instagram Reels vs YouTube Shorts vs TikTok (2026 Data)',
    excerpt: 'Should your clips be 15s, 30s, or 60s? We analyze algorithm data across all three platforms to find the scientifically optimal clip duration for maximum reach.',
    date: 'August 5, 2026',
    readTime: '5 min read',
    category: 'Algorithm Strategy',
    emoji: '⏱️',
  },
  {
    slug: 'top-10-tools-to-repurpose-long-videos-2026',
    title: 'Top 10 AI Video Clipping Tools to Repurpose Long Content in 2026',
    excerpt: 'A comprehensive comparison of the best AI video clippers, benchmarked on speed, accuracy, free tier limits, watermark policies, and output quality.',
    date: 'August 4, 2026',
    readTime: '9 min read',
    category: 'Tool Comparison',
    emoji: '🛠️',
  },
  {
    slug: 'how-to-grow-youtube-channel-with-shorts',
    title: 'How to Grow Your YouTube Channel Fast Using YouTube Shorts in 2026',
    excerpt: 'YouTube Shorts is the fastest way to grow an existing channel from 0 to 10,000 subscribers. Here is the proven system creators use to explode their channel growth.',
    date: 'August 3, 2026',
    readTime: '6 min read',
    category: 'YouTube Growth',
    emoji: '📈',
  },
  {
    slug: 'podcast-to-viral-clips-complete-workflow',
    title: 'From Podcast to Viral Clips: The Complete 2026 Repurposing Workflow',
    excerpt: 'Step-by-step workflow to turn a 2-hour podcast episode into 30 days worth of short-form social media content across TikTok, Reels, and Shorts simultaneously.',
    date: 'August 2, 2026',
    readTime: '8 min read',
    category: 'Podcast Marketing',
    emoji: '🎙️',
  },
  {
    slug: 'ai-video-clipper-vs-manual-editing',
    title: 'AI Video Clipper vs Manual Editing: Which is Better for Creators in 2026?',
    excerpt: 'We compare the time, cost, and quality difference between using an AI video clipper like Snipr AI versus hiring a video editor or manually editing clips yourself.',
    date: 'August 1, 2026',
    readTime: '6 min read',
    category: 'Creator Economy',
    emoji: '🤖',
  },
  {
    slug: 'viral-short-form-video-hooks-guide',
    title: '27 Proven Viral Video Hook Formulas for TikTok & Shorts (With Examples)',
    excerpt: 'The hook is the most important 3 seconds of your clip. Master these 27 battle-tested hook formulas to maximize scroll-stop rate and viewer retention.',
    date: 'July 31, 2026',
    readTime: '10 min read',
    category: 'Content Strategy',
    emoji: '🪝',
  },
  {
    slug: 'how-to-add-captions-to-short-form-videos',
    title: 'How to Add Auto-Captions to Short-Form Videos for 10x More Views',
    excerpt: '85% of social media videos are watched without sound. Adding on-screen captions to your clips can increase watch time by up to 40% and dramatically boost reach.',
    date: 'July 30, 2026',
    readTime: '5 min read',
    category: 'Video Optimization',
    emoji: '💬',
  },
  {
    slug: 'best-time-to-post-tiktok-reels-shorts-2026',
    title: 'Best Time to Post on TikTok, Reels & YouTube Shorts in 2026',
    excerpt: 'Timing is a multiplier for short-form content. Post at the wrong time and even great clips will flop. Here are the exact optimal posting windows for each platform.',
    date: 'July 29, 2026',
    readTime: '5 min read',
    category: 'Algorithm Strategy',
    emoji: '🕐',
  },
  {
    slug: 'repurpose-webinar-into-social-clips',
    title: 'How to Repurpose a Webinar or Online Course into 50+ Social Media Clips',
    excerpt: 'Your recorded webinar is a goldmine of short-form content. This complete system shows you how to extract, clip, and distribute 50+ unique pieces of content from a single event recording.',
    date: 'July 28, 2026',
    readTime: '7 min read',
    category: 'Repurposing Guide',
    emoji: '🎓',
  },
];

const categoryColors = {
  'Repurposing Guide': { bg: 'rgba(255,255,255,0.08)', color: '#ffffff' },
  'Algorithm Strategy': { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa' },
  'Tool Comparison': { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  'YouTube Growth': { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  'Podcast Marketing': { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  'Creator Economy': { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
  'Content Strategy': { bg: 'rgba(236,72,153,0.15)', color: '#f472b6' },
  'Video Optimization': { bg: 'rgba(6,182,212,0.15)', color: '#22d3ee' },
};

export default function BlogIndex() {
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '5rem' }}>

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9999px', padding: '0.4rem 1.2rem', fontSize: '0.85rem', color: '#a1a1aa', fontWeight: '600', marginBottom: '1.25rem', letterSpacing: '0.05em' }}>
          BLOG & GUIDES
        </div>
        <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1.15 }}>
          Video Repurposing<br />& Growth Guides
        </h1>
        <p style={{ color: '#71717a', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Actionable guides on AI video clipping, short-form algorithms, and creator growth strategies.
        </p>
      </header>

      {/* Featured Article */}
      <Link href={`/blog/${featured.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '2.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #111111 0%, #0d0d0d 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1.25rem',
          padding: '2.5rem',
          transition: 'border-color 0.3s, transform 0.3s',
          cursor: 'pointer',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ background: '#ffffff', color: '#000000', padding: '0.3rem 0.9rem', borderRadius: '9999px', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.04em' }}>
              ✦ FEATURED
            </span>
            <span style={{ background: 'rgba(255,255,255,0.08)', color: '#a1a1aa', padding: '0.3rem 0.9rem', borderRadius: '9999px', fontWeight: '600', fontSize: '0.8rem' }}>
              {featured.category}
            </span>
            <span style={{ color: '#52525b', fontSize: '0.85rem' }}>{featured.date}</span>
            <span style={{ color: '#52525b', fontSize: '0.85rem' }}>• {featured.readTime}</span>
          </div>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{featured.emoji}</div>
          <h2 style={{ fontSize: '1.85rem', color: '#ffffff', lineHeight: 1.3, marginBottom: '1rem', fontWeight: '800' }}>
            {featured.title}
          </h2>
          <p style={{ color: '#71717a', lineHeight: 1.7, fontSize: '1.05rem', maxWidth: '700px' }}>
            {featured.excerpt}
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: '700', fontSize: '0.95rem' }}>
            Read Full Guide <span>→</span>
          </div>
        </div>
      </Link>

      {/* Articles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: '1.5rem' }}>
        {rest.map((post) => {
          const catStyle = categoryColors[post.category] || { bg: 'rgba(255,255,255,0.08)', color: '#a1a1aa' };
          return (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <article
                style={{
                  background: '#0d0d0d',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '1rem',
                  padding: '1.75rem',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                  transition: 'border-color 0.25s, transform 0.25s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: '1.75rem' }}>{post.emoji}</div>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ background: catStyle.bg, color: catStyle.color, padding: '0.2rem 0.75rem', borderRadius: '9999px', fontWeight: '700', fontSize: '0.75rem' }}>
                    {post.category}
                  </span>
                  <span style={{ color: '#52525b', fontSize: '0.8rem' }}>{post.readTime}</span>
                </div>

                <h2 style={{ fontSize: '1.15rem', color: '#f4f4f5', lineHeight: 1.4, fontWeight: '700', margin: 0 }}>
                  {post.title}
                </h2>

                <p style={{ color: '#71717a', lineHeight: 1.65, fontSize: '0.9rem', margin: 0, flex: 1 }}>
                  {post.excerpt}
                </p>

                <div style={{ color: '#a1a1aa', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: 'auto' }}>
                  <span>{post.date}</span>
                  <span style={{ marginLeft: 'auto', color: '#ffffff' }}>Read →</span>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
