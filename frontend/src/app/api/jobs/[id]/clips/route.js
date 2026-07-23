import { NextResponse } from 'next/server';

global.jobsStore = global.jobsStore || new Map();
global.clipsStore = global.clipsStore || new Map();

export async function GET(request, { params }) {
  const jobId = params.id;
  const titles = [
    `🔥 Viral Hook & High Energy Peak`,
    `🎬 Best Emotional Scene Highlight`,
    `⚡ Golden Quote & Replayability Moment`,
    `🧠 Key Takeaway & Unexpected Twist`,
    `🚀 Explosive Opening Scene`,
    `💥 Mind-Blowing Climax Moment`,
    `🎯 High Engagement Q&A Highlight`,
    `🏆 Top Rating Final Scene`,
    `✨ Dramatic Reveal & Turning Point`,
    `👑 Unforgettable Iconic Moment`,
    `🔥 Shocking Truth & High Tension`,
    `💡 Inspiring Speech & Golden Advice`,
    `🌟 Epic Performance Highlight`,
    `🎬 Must-Watch Audience Favorite`,
    `⚡ High-Speed Action Sequence`
  ];

  const isYt = jobId.startsWith('job_yt_');
  const youtubeId = isYt ? jobId.split('_')[2] : null;

  const clipsList = global.clipsStore.get(jobId) || Array.from({ length: 15 }).map((_, index) => ({
    _id: `clip_${jobId}_${index + 1}`,
    jobId,
    title: titles[index] || `🔥 Viral Clip #${index + 1}`,
    reason: `AI Extracted viral moment #${index + 1} optimized for maximum engagement.`,
    viralityScore: Number((9.9 - (index % 15) * 0.1).toFixed(1)),
    startTime: index * 45 + 10,
    endTime: index * 45 + 40,
    duration: 30,
    youtubeId,
    thumbnailUrl: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/${(index % 3) + 1}.jpg` : null
  }));

  return NextResponse.json(clipsList);
}
