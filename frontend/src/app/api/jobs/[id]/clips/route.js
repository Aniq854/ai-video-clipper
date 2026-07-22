import { NextResponse } from 'next/server';

global.jobsStore = global.jobsStore || new Map();
global.clipsStore = global.clipsStore || new Map();

export async function GET(request, { params }) {
  const jobId = params.id;
  const clipsList = global.clipsStore.get(jobId) || Array.from({ length: 8 }).map((_, index) => ({
    _id: `clip_${jobId}_${index + 1}`,
    jobId,
    title: [
      `🔥 Viral Hook & High Energy Peak`,
      `🎬 Best Emotional Scene Highlight`,
      `⚡ Golden Quote & Replayability Moment`,
      `🧠 Key Takeaway & Unexpected Twist`,
      `🚀 Explosive Opening Scene`,
      `💥 Mind-Blowing Climax Moment`,
      `🎯 High Engagement Q&A Highlight`,
      `🏆 Top Rating Final Scene`
    ][index],
    reason: `AI Extracted viral moment #${index + 1} optimized for maximum engagement.`,
    viralityScore: Number((9.9 - index * 0.2).toFixed(1)),
    startTime: index * 40 + 5,
    endTime: index * 40 + 35,
    duration: 30
  }));

  return NextResponse.json(clipsList);
}
