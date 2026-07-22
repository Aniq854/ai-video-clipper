import { NextResponse } from 'next/server';

global.jobsStore = global.jobsStore || new Map();

export async function GET(request, { params }) {
  const jobId = params.id;
  const job = global.jobsStore.get(jobId);

  if (!job) {
    return NextResponse.json({
      status: 'done',
      progress: 100,
      totalClips: 3
    });
  }

  return NextResponse.json({
    status: job.status,
    progress: job.progress,
    totalClips: job.totalClips
  });
}
