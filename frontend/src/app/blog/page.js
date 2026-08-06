import Link from 'next/link';

export const metadata = {
  title: 'Video Repurposing & Short-Form Growth Blog | Snipr AI',
  description: 'Expert guides on AI video clipping, YouTube Shorts, TikTok, and Instagram Reels growth strategies. Turn long videos into viral content with Snipr AI.',
};

const posts = [
  {
    slug: 'how-to-turn-youtube-videos-into-tiktok-clips-2026-guide',
    title: 'How to Turn YouTube Videos into TikTok Clips & Shorts (2026 Ultimate Guide)',
    excerpt: 'Discover the exact step-by-step framework to repurpose long podcasts and interviews into high-retention 9:16 vertical TikTok clips that go viral.',
    date: 'August 6, 2026',
    readTime: '7 min read',
    category: 'Repurposing Guide',
    emoji: '🎬',
    catColor: '#ffffff',
    catBg: 'rgba(255,255,255,0.1)',
  },
  {
    slug: 'best-clip-length-reels-vs-shorts-vs-tiktok',
    title: 'Best Clip Length for Instagram Reels vs YouTube Shorts vs TikTok (2026 Data)',
    excerpt: 'Should your clips be 15s, 30s, or 60s? We analyze algorithm data across all three platforms to find the scientifically optimal clip duration for maximum reach.',
    date: 'August 5, 2026',
    readTime: '5 min read',
    category: 'Algorithm Strategy',
    emoji: '⏱️',
    catColor: '#c4b5fd',
    catBg: 'rgba(139,92,246,0.2)',
  },
  {
    slug: 'top-10-tools-to-repurpose-long-videos-2026',
    title: 'Top 10 AI Video Clipping Tools to Repurpose Long Content in 2026',
    excerpt: 'A comprehensive comparison of the best AI video clippers — benchmarked on speed, free tier limits, watermark policy, and output quality.',
    date: 'August 4, 2026',
    readTime: '9 min read',
    category: 'Tool Comparison',
    emoji: '🛠️',
    catColor: '#93c5fd',
    catBg: 'rgba(59,130,246,0.2)',
  },
  {
    slug: 'how-to-grow-youtube-channel-with-shorts',
    title: 'How to Grow Your YouTube Channel Fast Using YouTube Shorts in 2026',
    excerpt: 'YouTube Shorts is the fastest way to grow an existing channel from 0 to 10,000 subscribers. Here is the proven system creators use to explode their growth.',
    date: 'August 3, 2026',
    readTime: '6 min read',
    category: 'YouTube Growth',
    emoji: '📈',
    catColor: '#fca5a5',
    catBg: 'rgba(239,68,68,0.2)',
  },
  {
    slug: 'podcast-to-viral-clips-complete-workflow',
    title: 'From Podcast to Viral Clips: The Complete 2026 Repurposing Workflow',
    excerpt: 'Step-by-step workflow to turn a 2-hour podcast episode into 30 days worth of short-form social media content across TikTok, Reels, and Shorts simultaneously.',
    date: 'August 2, 2026',
    readTime: '8 min read',
    category: 'Podcast Marketing',
    emoji: '🎙️',
    catColor: '#fcd34d',
    catBg: 'rgba(245,158,11,0.2)',
  },
  {
    slug: 'ai-video-clipper-vs-manual-editing',
    title: 'AI Video Clipper vs Manual Editing: Which Is Better for Creators in 2026?',
    excerpt: 'We compare the time, cost, and quality difference between using an AI video clipper versus hiring a video editor or manually editing clips yourself.',
    date: 'August 1, 2026',
    readTime: '6 min read',
    category: 'Creator Economy',
    emoji: '🤖',
    catColor: '#6ee7b7',
    catBg: 'rgba(16,185,129,0.2)',
  },
  {
    slug: 'viral-short-form-video-hooks-guide',
    title: '27 Proven Viral Video Hook Formulas for TikTok & YouTube Shorts (With Examples)',
    excerpt: 'The hook is the most important 3 seconds of your clip. Master these 27 battle-tested hook formulas to maximize scroll-stop rate and viewer retention.',
    date: 'July 31, 2026',
    readTime: '10 min read',
    category: 'Content Strategy',
    emoji: '🪝',
    catColor: '#f9a8d4',
    catBg: 'rgba(236,72,153,0.2)',
  },
  {
    slug: 'how-to-add-captions-to-short-form-videos',
    title: 'How to Add Auto-Captions to Short-Form Videos for 10x More Views',
    excerpt: '85% of social media videos are watched without sound. Adding on-screen captions can increase watch time by up to 40% and dramatically boost reach.',
    date: 'July 30, 2026',
    readTime: '5 min read',
    category: 'Video Optimization',
    emoji: '💬',
    catColor: '#67e8f9',
    catBg: 'rgba(6,182,212,0.2)',
  },
  {
    slug: 'best-time-to-post-tiktok-reels-shorts-2026',
    title: 'Best Time to Post on TikTok, Reels & YouTube Shorts in 2026',
    excerpt: 'Timing is a multiplier for short-form content. Post at the wrong time and even great clips will flop. Here are the exact optimal posting windows for each platform.',
    date: 'July 29, 2026',
    readTime: '5 min read',
    category: 'Algorithm Strategy',
    emoji: '🕐',
    catColor: '#c4b5fd',
    catBg: 'rgba(139,92,246,0.2)',
  },
  {
    slug: 'repurpose-webinar-into-social-clips',
    title: 'How to Repurpose a Webinar or Online Course into 50+ Social Media Clips',
    excerpt: 'Your recorded webinar is a goldmine of short-form content. This complete system shows you how to extract 50+ unique clips from a single event recording.',
    date: 'July 28, 2026',
    readTime: '7 min read',
    category: 'Repurposing Guide',
    emoji: '🎓',
    catColor: '#ffffff',
    catBg: 'rgba(255,255,255,0.1)',
  },
  // --- 10 NEW ARTICLES ---
  {
    slug: 'how-to-make-money-with-short-form-video-2026',
    title: 'How to Make Money with Short-Form Video in 2026 (7 Proven Revenue Streams)',
    excerpt: 'Short-form video is not just a growth tool — it is a full business model. Discover 7 real ways creators monetize TikTok, Reels, and YouTube Shorts in 2026.',
    date: 'July 27, 2026',
    readTime: '8 min read',
    category: 'Creator Economy',
    emoji: '💰',
    catColor: '#6ee7b7',
    catBg: 'rgba(16,185,129,0.2)',
  },
  {
    slug: 'youtube-shorts-algorithm-explained-2026',
    title: 'YouTube Shorts Algorithm Explained: How to Get Your Clips Recommended in 2026',
    excerpt: 'A deep dive into exactly how the YouTube Shorts recommendation engine works in 2026 — and the specific actions you can take to trigger viral distribution.',
    date: 'July 26, 2026',
    readTime: '7 min read',
    category: 'Algorithm Strategy',
    emoji: '🔍',
    catColor: '#c4b5fd',
    catBg: 'rgba(139,92,246,0.2)',
  },
  {
    slug: 'tiktok-seo-guide-rank-in-tiktok-search-2026',
    title: 'TikTok SEO Guide: How to Rank Your Videos in TikTok Search in 2026',
    excerpt: 'TikTok is now a search engine. Millions of Gen Z users search TikTok instead of Google. Here is how to optimize your clips for TikTok search discovery.',
    date: 'July 25, 2026',
    readTime: '6 min read',
    category: 'Algorithm Strategy',
    emoji: '🔎',
    catColor: '#c4b5fd',
    catBg: 'rgba(139,92,246,0.2)',
  },
  {
    slug: 'best-video-formats-for-social-media-2026',
    title: 'Best Video Formats, Codecs & Resolutions for Every Social Platform in 2026',
    excerpt: 'Upload the wrong format and your video quality tanks instantly. Here are the exact recommended specs for TikTok, Reels, YouTube Shorts, LinkedIn, and X.',
    date: 'July 24, 2026',
    readTime: '5 min read',
    category: 'Video Optimization',
    emoji: '🎞️',
    catColor: '#67e8f9',
    catBg: 'rgba(6,182,212,0.2)',
  },
  {
    slug: 'how-to-batch-create-content-30-days-clips-in-one-day',
    title: 'How to Batch Create 30 Days of Short-Form Content in a Single Day',
    excerpt: 'Top creators do not post every day — they create once and schedule everything in advance. This system lets you generate a full month of clips in one focused session.',
    date: 'July 23, 2026',
    readTime: '7 min read',
    category: 'Content Strategy',
    emoji: '📅',
    catColor: '#f9a8d4',
    catBg: 'rgba(236,72,153,0.2)',
  },
  {
    slug: 'instagram-reels-algorithm-guide-2026',
    title: 'Instagram Reels Algorithm Guide 2026: How to Go Viral on the Explore Page',
    excerpt: 'Instagram completely overhauled its Reels algorithm in 2026. Here is what actually drives Explore page distribution now — and the old advice that will hurt you.',
    date: 'July 22, 2026',
    readTime: '6 min read',
    category: 'Algorithm Strategy',
    emoji: '📸',
    catColor: '#c4b5fd',
    catBg: 'rgba(139,92,246,0.2)',
  },
  {
    slug: 'video-repurposing-mistakes-creators-make',
    title: '9 Video Repurposing Mistakes That Are Killing Your Short-Form Content Performance',
    excerpt: 'Most creators repurpose their content the wrong way and wonder why their clips get zero views. Here are the 9 critical mistakes destroying your clip performance.',
    date: 'July 21, 2026',
    readTime: '6 min read',
    category: 'Content Strategy',
    emoji: '⚠️',
    catColor: '#f9a8d4',
    catBg: 'rgba(236,72,153,0.2)',
  },
  {
    slug: 'how-to-grow-instagram-reels-from-zero',
    title: 'How to Grow Instagram Reels from Zero to 10K Followers in 90 Days (2026 Strategy)',
    excerpt: 'A step-by-step 90-day Instagram Reels growth roadmap for new accounts and stagnant creators — based on the algorithm mechanics that actually work in 2026.',
    date: 'July 20, 2026',
    readTime: '8 min read',
    category: 'YouTube Growth',
    emoji: '🌱',
    catColor: '#fca5a5',
    catBg: 'rgba(239,68,68,0.2)',
  },
  {
    slug: 'how-to-use-capcut-for-short-form-video-editing',
    title: 'How to Use CapCut for Short-Form Video Editing: Complete Beginner Guide 2026',
    excerpt: 'CapCut is the most powerful free video editor for short-form content. This complete guide covers everything from auto-captions to beat sync and AI backgrounds.',
    date: 'July 19, 2026',
    readTime: '9 min read',
    category: 'Video Optimization',
    emoji: '✂️',
    catColor: '#67e8f9',
    catBg: 'rgba(6,182,212,0.2)',
  },
];


export default function BlogIndex() {
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '5rem' }}>

      {/* Blog Header */}
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '9999px',
          padding: '0.4rem 1.2rem',
          fontSize: '0.8rem',
          color: '#a1a1aa',
          fontWeight: '700',
          marginBottom: '1.25rem',
          letterSpacing: '0.08em',
        }}>
          BLOG & GUIDES
        </div>
        <h1 className="gradient-text" style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1.15, letterSpacing: '-0.03em' }}>
          Video Repurposing<br />& Growth Guides
        </h1>
        <p style={{ color: '#71717a', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.65 }}>
          Actionable guides on AI video clipping, short-form algorithms, and creator growth strategies.
        </p>
      </header>

      {/* Featured Article */}
      <Link href={`/blog/${featured.slug}`} className="blog-card-featured" style={{ textDecoration: 'none', display: 'block', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <span style={{ background: '#ffffff', color: '#000000', padding: '0.3rem 0.9rem', borderRadius: '9999px', fontWeight: '700', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
            ✦ FEATURED
          </span>
          <span style={{ background: featured.catBg, color: featured.catColor, padding: '0.3rem 0.9rem', borderRadius: '9999px', fontWeight: '600', fontSize: '0.75rem' }}>
            {featured.category}
          </span>
          <span style={{ color: '#52525b', fontSize: '0.85rem' }}>{featured.date} • {featured.readTime}</span>
        </div>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{featured.emoji}</div>
        <h2 style={{ fontSize: '1.9rem', color: '#ffffff', lineHeight: 1.25, marginBottom: '1rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
          {featured.title}
        </h2>
        <p style={{ color: '#71717a', lineHeight: 1.7, fontSize: '1.05rem', maxWidth: '680px' }}>
          {featured.excerpt}
        </p>
        <div style={{ marginTop: '1.5rem', color: '#ffffff', fontWeight: '700', fontSize: '0.95rem' }}>
          Read Full Guide →
        </div>
      </Link>

      {/* Articles Grid */}
      <div className="blog-grid">
        {rest.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{post.emoji}</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.875rem' }}>
              <span style={{ background: post.catBg, color: post.catColor, padding: '0.2rem 0.7rem', borderRadius: '9999px', fontWeight: '700', fontSize: '0.72rem', letterSpacing: '0.02em' }}>
                {post.category}
              </span>
              <span style={{ color: '#52525b', fontSize: '0.8rem' }}>{post.readTime}</span>
            </div>
            <h2 style={{ fontSize: '1.1rem', color: '#f4f4f5', lineHeight: 1.45, fontWeight: '700', margin: '0 0 0.75rem 0' }}>
              {post.title}
            </h2>
            <p style={{ color: '#71717a', lineHeight: 1.65, fontSize: '0.875rem', margin: '0 0 auto 0', flex: 1 }}>
              {post.excerpt}
            </p>
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#52525b', fontSize: '0.8rem' }}>{post.date}</span>
              <span style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: '700' }}>Read →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
