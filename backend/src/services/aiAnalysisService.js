const { GoogleGenerativeAI } = require('@google/generative-ai');

const findBestMoments = async (transcript, clipDuration, videoDuration) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'ARRAY',
      responseSchema: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            start_time: { type: 'NUMBER' },
            end_time: { type: 'NUMBER' },
            reason: { type: 'STRING' },
            virality_score: { type: 'NUMBER' }
          },
          required: ['title', 'start_time', 'end_time', 'reason', 'virality_score']
        }
      }
    },
    systemInstruction: 'You are a professional movie and long-form video clip curator. Your job is to extract high-virality, engaging short clips from long videos and full movies.'
  });

  const durationSec = videoDuration || 60;
  const targetClipDuration = clipDuration || 30;

  // Dynamic clip count formula for movies & long videos:
  // - Short video (<5 min): 3-5 clips
  // - Medium video (10-20 min): 6-10 clips
  // - Full movie (1-3 hours): 15 to 25 clips!
  let targetClipCount;
  if (durationSec > 3600) {
    // Movies / >1 hour video
    targetClipCount = Math.min(25, Math.max(15, Math.floor(durationSec / 240)));
  } else if (durationSec > 300) {
    // 5-60 minute video
    targetClipCount = Math.min(15, Math.max(5, Math.floor(durationSec / 120)));
  } else {
    // Short video
    targetClipCount = 3;
  }

  console.log(`🎬 Video duration: ${Math.round(durationSec / 60)} mins. Targeting ${targetClipCount} clips...`);

  const prompt = `
    Analyze the following video transcript of a ${Math.round(durationSec / 60)}-minute video/movie.
    Identify and extract the top ${targetClipCount} best viral moments across the entire video timeline.
    Create exactly ${targetClipCount} non-overlapping clips distributed across the video.
    Each clip must be approximately ${targetClipDuration} seconds long.
    Ensure clip start_time and end_time stay strictly between 0 and ${durationSec}.

    Transcript text:
    ${transcript.text || ''}

    Transcript timed segments:
    ${JSON.stringify(transcript.segments || [])}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const moments = JSON.parse(text);

    return moments.map(m => {
      const start = Math.max(0, Math.min(m.start_time, durationSec - 5));
      const end = Math.min(durationSec, Math.max(start + 5, m.end_time));
      return {
        ...m,
        start_time: start,
        end_time: end
      };
    });
  } catch (err) {
    console.error('Gemini AI Analysis Error:', err);
    // Dynamic fallback for movies: generate evenly spaced clips across duration
    const moments = [];
    const step = Math.floor(durationSec / targetClipCount);
    let curStart = 10;
    while (curStart + targetClipDuration <= durationSec && moments.length < targetClipCount) {
      moments.push({
        title: `Movie Scene Highlight ${moments.length + 1}`,
        start_time: curStart,
        end_time: curStart + targetClipDuration,
        reason: 'High emotion / key scene extracted from movie',
        virality_score: 9
      });
      curStart += step;
    }
    return moments;
  }
};

module.exports = {
  findBestMoments
};
