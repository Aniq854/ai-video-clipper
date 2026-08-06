export default async function sitemap() {
  const baseUrl = 'https://sniprai.vercel.app';

  const blogSlugs = [
    'how-to-turn-youtube-videos-into-tiktok-clips-2026-guide',
    'best-clip-length-reels-vs-shorts-vs-tiktok',
    'top-10-tools-to-repurpose-long-videos-2026',
    'how-to-grow-youtube-channel-with-shorts',
    'podcast-to-viral-clips-complete-workflow',
    'ai-video-clipper-vs-manual-editing',
    'viral-short-form-video-hooks-guide',
    'how-to-add-captions-to-short-form-videos',
    'best-time-to-post-tiktok-reels-shorts-2026',
    'repurpose-webinar-into-social-clips',
    'how-to-make-money-with-short-form-video-2026',
    'youtube-shorts-algorithm-explained-2026',
    'tiktok-seo-guide-rank-in-tiktok-search-2026',
    'best-video-formats-for-social-media-2026',
    'how-to-batch-create-content-30-days-clips-in-one-day',
    'instagram-reels-algorithm-guide-2026',
    'video-repurposing-mistakes-creators-make',
    'how-to-grow-instagram-reels-from-zero',
    'how-to-use-capcut-for-short-form-video-editing',
  ];

  const blogUrls = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  return [...staticUrls, ...blogUrls];
}
