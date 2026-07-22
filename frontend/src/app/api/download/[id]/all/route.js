import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('ZIP File Placeholder', {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="clips.zip"'
    }
  });
}
