import { NextResponse } from 'next/server';

global.jobsStore = global.jobsStore || new Map();

export async function GET(request, { params }) {
  const jobId = params.id;
  const job = global.jobsStore.get(jobId);

  const isYt = jobId.startsWith('job_yt_');
  const youtubeId = isYt ? jobId.split('_')[2] : null;

  if (!job) {
    return NextResponse.json({
      status: 'done',
      progress: 100,
      totalClips: 15,
      youtubeId
    });
  }

  return NextResponse.json({
    status: job.status,
    progress: job.progress,
    totalClips: job.totalClips
  });
}
