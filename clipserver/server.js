const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { execSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Check if yt-dlp is available
let ytdlpPath = 'yt-dlp';
try {
  execSync('yt-dlp --version', { stdio: 'pipe' });
  console.log('✅ yt-dlp found');
} catch {
  try {
    execSync('python3 -m pip install yt-dlp', { stdio: 'pipe' });
    console.log('✅ yt-dlp installed via pip');
  } catch {
    console.warn('⚠️ yt-dlp not available - YouTube features will be limited');
  }
}

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ClipAI Server running', version: '1.0.0' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ===== YOUTUBE CLIP ENDPOINT =====
// POST /api/youtube/clip
// Body: { youtubeUrl, startTime, endTime, clipIndex }
app.post('/api/youtube/clip', async (req, res) => {
  const { youtubeUrl, startTime, endTime, clipIndex } = req.body;

  if (!youtubeUrl) {
    return res.status(400).json({ error: 'youtubeUrl is required' });
  }

  const start = parseFloat(startTime) || 0;
  const end = parseFloat(endTime) || (start + 30);
  const duration = end - start;
  const clipId = `clip_${uuidv4().substring(0, 8)}`;
  const downloadPath = path.join(TEMP_DIR, `${clipId}_full.mp4`);
  const trimmedPath = path.join(TEMP_DIR, `${clipId}_trimmed.mp4`);

  try {
    console.log(`🎬 Downloading YouTube: ${youtubeUrl}`);
    console.log(`✂️ Trim: ${start}s -> ${end}s (${duration}s)`);

    // Step 1: Download the YouTube video using yt-dlp
    // Only download the portion we need using --download-sections
    const ytCmd = `yt-dlp -f "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best" --merge-output-format mp4 --download-sections "*${start}-${end}" -o "${downloadPath}" "${youtubeUrl}"`;

    await new Promise((resolve, reject) => {
      exec(ytCmd, { timeout: 120000 }, (error, stdout, stderr) => {
        if (error) {
          console.error('yt-dlp error:', stderr);
          // Fallback: try downloading without sections
          const fallbackCmd = `yt-dlp -f "best[height<=720][ext=mp4]/best" -o "${downloadPath}" "${youtubeUrl}"`;
          exec(fallbackCmd, { timeout: 180000 }, (err2, out2, serr2) => {
            if (err2) {
              reject(new Error(`yt-dlp failed: ${serr2}`));
            } else {
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    });

    if (!fs.existsSync(downloadPath)) {
      return res.status(500).json({ error: 'Failed to download video' });
    }

    console.log(`📥 Downloaded: ${downloadPath}`);

    // Step 2: Trim the video to exact timestamps using FFmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(downloadPath)
        .setStartTime(0) // Already sectioned by yt-dlp, or trim from full
        .setDuration(duration)
        .output(trimmedPath)
        .outputOptions(['-c:v', 'libx264', '-c:a', 'aac', '-preset', 'fast', '-movflags', '+faststart'])
        .on('end', () => {
          console.log(`✅ Trimmed: ${trimmedPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          // If FFmpeg trim fails, use the downloaded file as-is
          if (fs.existsSync(downloadPath)) {
            fs.copyFileSync(downloadPath, trimmedPath);
          }
          resolve();
        })
        .run();
    });

    const filePath = fs.existsSync(trimmedPath) ? trimmedPath : downloadPath;
    const stat = fs.statSync(filePath);

    // Step 3: Send the trimmed clip
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `attachment; filename="clip_${clipIndex || 1}_${duration}s.mp4"`);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    // Cleanup after sending
    stream.on('end', () => {
      setTimeout(() => {
        try {
          if (fs.existsSync(downloadPath)) fs.unlinkSync(downloadPath);
          if (fs.existsSync(trimmedPath)) fs.unlinkSync(trimmedPath);
        } catch (e) { /* ignore cleanup errors */ }
      }, 5000);
    });

  } catch (err) {
    console.error('Clip generation error:', err);
    // Cleanup on error
    try {
      if (fs.existsSync(downloadPath)) fs.unlinkSync(downloadPath);
      if (fs.existsSync(trimmedPath)) fs.unlinkSync(trimmedPath);
    } catch (e) { /* ignore */ }
    res.status(500).json({ error: 'Failed to create clip', message: err.message });
  }
});

// ===== LOCAL VIDEO TRIM ENDPOINT =====
// Kept for future use with uploaded videos
app.post('/api/trim', express.raw({ type: 'video/*', limit: '500mb' }), async (req, res) => {
  const startTime = parseFloat(req.query.start) || 0;
  const endTime = parseFloat(req.query.end) || 30;
  const duration = endTime - startTime;
  const clipId = `local_${uuidv4().substring(0, 8)}`;
  const inputPath = path.join(TEMP_DIR, `${clipId}_input.mp4`);
  const outputPath = path.join(TEMP_DIR, `${clipId}_output.mp4`);

  try {
    fs.writeFileSync(inputPath, req.body);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .output(outputPath)
        .outputOptions(['-c:v', 'libx264', '-c:a', 'aac', '-preset', 'fast', '-movflags', '+faststart'])
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    const stat = fs.statSync(outputPath);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `attachment; filename="clip_${duration}s.mp4"`);

    const stream = fs.createReadStream(outputPath);
    stream.pipe(res);

    stream.on('end', () => {
      setTimeout(() => {
        try {
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        } catch (e) { /* ignore */ }
      }, 5000);
    });
  } catch (err) {
    try {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    } catch (e) { /* ignore */ }
    res.status(500).json({ error: 'Trim failed', message: err.message });
  }
});

// Cleanup old temp files every 10 minutes
setInterval(() => {
  try {
    const files = fs.readdirSync(TEMP_DIR);
    const now = Date.now();
    files.forEach(file => {
      const filepath = path.join(TEMP_DIR, file);
      const stat = fs.statSync(filepath);
      if (now - stat.mtimeMs > 10 * 60 * 1000) {
        fs.unlinkSync(filepath);
      }
    });
  } catch (e) { /* ignore */ }
}, 10 * 60 * 1000);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 ClipAI Server running on port ${PORT}`);
});
