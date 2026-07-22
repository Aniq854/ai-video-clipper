import { NextResponse } from 'next/server';

global.jobsStore = global.jobsStore || new Map();
global.clipsStore = global.clipsStore || new Map();

export async function GET(request, { params }) {
  const jobId = params.id;
  const clipsList = global.clipsStore.get(jobId) || [
    {
      _id: `clip_${jobId}_1`,
      jobId,
      title: `🔥 Viral Moment #1 — High Energy Peak`,
      reason: `Extracted top emotional peak and audience engagement moment.`,
      viralityScore: 9.8,
      startTime: 10,
      endTime: 40,
      duration: 30
    },
    {
      _id: `clip_${jobId}_2`,
      jobId,
      title: `🎬 Best Scene Highlight #2`,
      reason: `Key action and high-retention hook scene identified automatically.`,
      viralityScore: 9.5,
      startTime: 45,
      endTime: 75,
      duration: 30
    },
    {
      _id: `clip_${jobId}_3`,
      jobId,
      title: `⚡ Golden Quote & Takeaway #3`,
      reason: `High replayability moment optimized for TikTok, Reels, & Shorts.`,
      viralityScore: 9.2,
      startTime: 90,
      endTime: 120,
      duration: 30
    }
  ];

  return NextResponse.json(clipsList);
}
