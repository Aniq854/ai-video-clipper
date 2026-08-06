import Link from 'next/link';

export const metadata = {
  title: 'Blog & Content Repurposing Guides | Snipr AI',
  description: 'Learn how to transform long-form podcasts and YouTube videos into viral TikToks, Instagram Reels, and YouTube Shorts.',
};

const posts = [
  {
    slug: 'how-to-turn-youtube-videos-into-tiktok-clips-2026-guide',
    title: 'How to Turn YouTube Videos into TikTok Clips & Shorts (2026 Ultimate Guide)',
    excerpt: 'Discover the exact step-by-step framework to repurpose long podcasts and interviews into high-retention 9:16 vertical TikTok clips.',
    date: 'August 6, 2026',
    readTime: '6 min read',
    category: 'Repurposing Guide'
  },
  {
    slug: 'best-clip-length-reels-vs-shorts-vs-tiktok',
    title: 'Best Clip Length for Instagram Reels vs YouTube Shorts vs TikTok',
    excerpt: 'Should your clips be 15s, 30s, or 60s? We analyze algorithm data across TikTok, Shorts, and Reels to find the optimal clip duration.',
    date: 'August 5, 2026',
    readTime: '5 min read',
    category: 'Algorithm Strategy'
  },
  {
    slug: 'top-10-tools-to-repurpose-long-videos-2026',
    title: 'Top 10 AI Video Clipping Tools to Repurpose Long Content in 2026',
    excerpt: 'A comprehensive comparison of the best AI video clippers, comparing speed, features, free tiers, and output quality.',
    date: 'August 4, 2026',
    readTime: '8 min read',
    category: 'Tool Comparison'
  }
];

export default function BlogIndex() {
  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '2.75rem', marginBottom: '1rem' }}>
          Video Repurposing & Growth Blog
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '650px', margin: '0 auto' }}>
          Actionable guides, algorithm insights, and AI tools to help creators scale short-form content.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {posts.map((post) => (
          <article
            key={post.slug}
            style={{
              background: 'var(--surface)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '1rem',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition: 'border-color 0.2s',
            }}
          >
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.85rem', color: '#71717a' }}>
              <span style={{ background: '#27272a', color: '#ffffff', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontWeight: '600', fontSize: '0.8rem' }}>
                {post.category}
              </span>
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime}</span>
            </div>

            <h2 style={{ fontSize: '1.5rem', color: '#ffffff', lineHeight: 1.3, margin: 0 }}>
              <Link href={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {post.title}
              </Link>
            </h2>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1rem', margin: 0 }}>
              {post.excerpt}
            </p>

            <div>
              <Link
                href={`/blog/${post.slug}`}
                style={{
                  display: 'inline-block',
                  padding: '0.6rem 1.25rem',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  border: '1px solid rgba(255,255,255,0.15)',
                  transition: 'background 0.2s',
                }}
              >
                Read Full Guide →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
