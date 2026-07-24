process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { execSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');

// Log interceptor for debugging on Render
const serverLogs = [];
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
  serverLogs.push(`[LOG] ${new Date().toISOString()}: ${args.map(a => a instanceof Error ? a.stack || a.message : (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ')}`);
  if (serverLogs.length > 500) serverLogs.shift();
  originalLog.apply(console, args);
};

console.error = (...args) => {
  serverLogs.push(`[ERROR] ${new Date().toISOString()}: ${args.map(a => a instanceof Error ? a.stack || a.message : (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ')}`);
  if (serverLogs.length > 500) serverLogs.shift();
  originalError.apply(console, args);
};

console.warn = (...args) => {
  serverLogs.push(`[WARN] ${new Date().toISOString()}: ${args.map(a => a instanceof Error ? a.stack || a.message : (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ')}`);
  if (serverLogs.length > 500) serverLogs.shift();
  originalWarn.apply(console, args);
};

const ffmpegDir = path.dirname(ffmpegInstaller.path);
const ffprobeDir = path.dirname(ffprobeInstaller.path);
const pathSep = path.delimiter;
const execEnv = {
  ...process.env,
  PATH: `${ffmpegDir}${pathSep}${ffprobeDir}${pathSep}${process.env.PATH}`
};

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

app.get('/api/logs', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(serverLogs.join('\n'));
});

// Check if local yt-dlp is available, else try global or fallback
const isWin = require('os').platform() === 'win32';
const localYtdlp = path.join(__dirname, 'bin', isWin ? 'yt-dlp.exe' : 'yt-dlp');
let ytdlpPath = 'yt-dlp';

if (fs.existsSync(localYtdlp)) {
  ytdlpPath = localYtdlp;
  console.log('✅ Using local yt-dlp binary:', ytdlpPath);
} else {
  try {
    execSync('yt-dlp --version', { stdio: 'pipe', env: execEnv });
    console.log('✅ System yt-dlp found');
  } catch {
    try {
      execSync('python3 -m pip install yt-dlp', { stdio: 'pipe', env: execEnv });
      console.log('✅ yt-dlp installed via pip');
    } catch {
      console.warn('⚠️ yt-dlp not available on system, using fallback');
    }
  }
}

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ClipAI Server running', version: '1.0.0' });
});

app.get('/api/health', (req, res) => {
  try {
    const { execSync } = require('child_process');
    const ffmpegVersion = execSync(`"${ffmpegInstaller.path}" -version`, { env: execEnv }).toString().split('\n')[0];
    const ffprobeVersion = execSync(`"${ffprobeInstaller.path}" -version`, { env: execEnv }).toString().split('\n')[0];
    res.json({ 
      status: 'ok', 
      ffmpeg: ffmpegVersion, 
      ffprobe: ffprobeVersion,
      ffmpegPath: ffmpegInstaller.path
    });
  } catch (err) {
    res.json({ 
      status: 'error', 
      message: err.message, 
      path: ffmpegInstaller.path 
    });
  }
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
    let usedSections = true;
    const ytCmd = `"${ytdlpPath}" --force-ipv4 --no-check-certificates -f "best[ext=mp4]/best" --download-sections "*${start}-${end}" -o "${downloadPath}" "${youtubeUrl}"`;

    await new Promise((resolve, reject) => {
      exec(ytCmd, { timeout: 120000, env: execEnv }, (error, stdout, stderr) => {
        if (error) {
          console.error('yt-dlp error:', stderr);
          usedSections = false;
          // Fallback: try downloading without sections (full video)
          const fallbackCmd = `"${ytdlpPath}" --force-ipv4 --no-check-certificates -f "best[height<=720][ext=mp4]/best" -o "${downloadPath}" "${youtubeUrl}"`;
          exec(fallbackCmd, { timeout: 180000, env: execEnv }, (err2, out2, serr2) => {
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

    console.log(`📥 Downloaded: ${downloadPath} (sections=${usedSections})`);

    // Step 2: Trim the video to exact timestamps using FFmpeg
    // If yt-dlp used --download-sections, the file already starts at 0
    // If fallback (full video), we need to seek to the actual start time
    const trimStart = usedSections ? 0 : start;

    // Try stream-copy first (fast), fallback to re-encode (accurate)
    await new Promise((resolve, reject) => {
      ffmpeg(downloadPath)
        .setStartTime(trimStart)
        .setDuration(duration)
        .output(trimmedPath)
        .outputOptions(['-y', '-c', 'copy', '-movflags', '+faststart', '-avoid_negative_ts', 'make_start'])
        .on('end', () => {
          console.log(`✅ Trimmed (stream-copy): ${trimmedPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.warn('FFmpeg stream-copy failed, trying re-encode:', err.message);
          // Re-encode fallback for accurate cuts
          ffmpeg(downloadPath)
            .setStartTime(trimStart)
            .setDuration(duration)
            .output(trimmedPath)
            .outputOptions(['-y', '-c:v', 'libx264', '-c:a', 'aac', '-preset', 'fast', '-crf', '23', '-movflags', '+faststart'])
            .on('end', () => {
              console.log(`✅ Trimmed (re-encoded): ${trimmedPath}`);
              resolve();
            })
            .on('error', (err2) => {
              console.error('FFmpeg re-encode also failed:', err2.message);
              // Last resort: use the downloaded file as-is
              if (fs.existsSync(downloadPath)) {
                fs.copyFileSync(downloadPath, trimmedPath);
              }
              resolve();
            })
            .run();
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

// Global set to track active background clip processing tasks
global.activeTasks = global.activeTasks || new Set();

// Background clip generator
async function prepareClipInBackground(youtubeId, start, end, cachedFilePath, taskId) {
  const duration = end - start;
  const clipId = `bg_${uuidv4().substring(0, 8)}`;
  const downloadPath = path.join(TEMP_DIR, `${clipId}_full.mp4`);
  
  try {
    console.log(`[BG] Starting download: ${youtubeId} (${start}s - ${end}s)`);
    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
    const ytCmd = `"${ytdlpPath}" --force-ipv4 --no-check-certificates -f "best[ext=mp4]/best" --download-sections "*${start}-${end}" -o "${downloadPath}" "${youtubeUrl}"`;

    await new Promise((resolve, reject) => {
      exec(ytCmd, { timeout: 120000, env: execEnv }, (error, stdout, stderr) => {
        if (error) {
          console.warn('[BG] yt-dlp sectioned failed, trying fallback...');
          const fallbackCmd = `"${ytdlpPath}" --force-ipv4 --no-check-certificates -f "best[height<=720][ext=mp4]/best" -o "${downloadPath}" "${youtubeUrl}"`;
          exec(fallbackCmd, { timeout: 180000, env: execEnv }, (err2, out2, serr2) => {
            if (err2) reject(new Error(`yt-dlp failed: ${serr2}`));
            else resolve();
          });
        } else {
          resolve();
        }
      });
    });

    if (!fs.existsSync(downloadPath)) {
      throw new Error('Downloaded file not found');
    }

    // Trim the downloaded video using FFmpeg
    // Try stream-copy first, fallback to re-encode for accurate cuts
    await new Promise((resolve, reject) => {
      ffmpeg(downloadPath)
        .setStartTime(0)
        .setDuration(duration)
        .output(cachedFilePath)
        .outputOptions(['-y', '-c', 'copy', '-movflags', '+faststart', '-avoid_negative_ts', 'make_start'])
        .on('end', resolve)
        .on('error', (err) => {
          console.warn('[BG] Stream-copy failed, re-encoding:', err.message);
          ffmpeg(downloadPath)
            .setStartTime(0)
            .setDuration(duration)
            .output(cachedFilePath)
            .outputOptions(['-y', '-c:v', 'libx264', '-c:a', 'aac', '-preset', 'fast', '-crf', '23', '-movflags', '+faststart'])
            .on('end', resolve)
            .on('error', reject)
            .run();
        })
        .run();
    });

    console.log(`[BG] Done! Cached clip generated: ${cachedFilePath}`);
  } catch (err) {
    console.error(`[BG] Generation failed for ${taskId}:`, err.message);
  } finally {
    try {
      if (fs.existsSync(downloadPath)) fs.unlinkSync(downloadPath);
    } catch (e) {}
    global.activeTasks.delete(taskId);
  }
}

// ===== YOUTUBE CLIP PREPARATION STATUS =====
// GET /api/youtube/status?youtubeId=...&startTime=...&endTime=...
app.get('/api/youtube/status', async (req, res) => {
  const { youtubeId, startTime, endTime } = req.query;

  if (!youtubeId) {
    return res.status(400).json({ error: 'youtubeId is required' });
  }

  const start = parseFloat(startTime) || 0;
  const end = parseFloat(endTime) || (start + 30);
  const cachedFileName = `stream_${youtubeId}_${start}_${end}.mp4`;
  const cachedFilePath = path.join(TEMP_DIR, cachedFileName);

  if (fs.existsSync(cachedFilePath)) {
    return res.json({ ready: true });
  }

  // Start background task if it's not already running
  const taskId = `${youtubeId}_${start}_${end}`;
  if (!global.activeTasks.has(taskId)) {
    global.activeTasks.add(taskId);
    prepareClipInBackground(youtubeId, start, end, cachedFilePath, taskId).catch(err => {
      console.error('Background process error:', err);
    });
  }

  res.json({ ready: false, message: 'Clip is being generated on the server...' });
});

// ===== STREAMING YOUTUBE CLIP ENDPOINT =====
// GET /api/youtube/stream?youtubeId=...&startTime=...&endTime=...
app.get('/api/youtube/stream', async (req, res) => {
  const { youtubeId, startTime, endTime } = req.query;

  if (!youtubeId) {
    return res.status(400).json({ error: 'youtubeId query parameter is required' });
  }

  const start = parseFloat(startTime) || 0;
  const end = parseFloat(endTime) || (start + 30);
  const duration = end - start;
  const cachedFileName = `stream_${youtubeId}_${start}_${end}.mp4`;
  const cachedFilePath = path.join(TEMP_DIR, cachedFileName);

  // If already cached, serve instantly!
  if (fs.existsSync(cachedFilePath)) {
    console.log(`🎯 Serving cached stream: ${cachedFileName}`);
    return res.sendFile(cachedFilePath);
  }

  const clipId = `stream_${uuidv4().substring(0, 8)}`;
  const downloadPath = path.join(TEMP_DIR, `${clipId}_full.mp4`);
  const trimmedPath = path.join(TEMP_DIR, `${clipId}_trimmed.mp4`);

  try {
    console.log(`🎬 Downloading YouTube Stream: ${youtubeId}`);
    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

    const ytCmd = `"${ytdlpPath}" --force-ipv4 --no-check-certificates -f "best[ext=mp4]/best" --download-sections "*${start}-${end}" -o "${downloadPath}" "${youtubeUrl}"`;

    await new Promise((resolve, reject) => {
      exec(ytCmd, { timeout: 120000, env: execEnv }, (error, stdout, stderr) => {
        if (error) {
          console.error('yt-dlp stream error:', stderr);
          // Fallback: try downloading without sections
          const fallbackCmd = `"${ytdlpPath}" --force-ipv4 --no-check-certificates -f "best[height<=720][ext=mp4]/best" -o "${downloadPath}" "${youtubeUrl}"`;
          exec(fallbackCmd, { timeout: 180000, env: execEnv }, (err2, out2, serr2) => {
            if (err2) reject(new Error(`yt-dlp failed: ${serr2}`));
            else resolve();
          });
        } else {
          resolve();
        }
      });
    });

    if (!fs.existsSync(downloadPath)) {
      return res.status(500).json({ error: 'Failed to download video stream' });
    }

    // Trim the video to exact timestamps using FFmpeg and cache it
    // Try stream-copy first, fallback to re-encode for accurate cuts
    await new Promise((resolve, reject) => {
      ffmpeg(downloadPath)
        .setStartTime(0)
        .setDuration(duration)
        .output(cachedFilePath)
        .outputOptions(['-y', '-c', 'copy', '-movflags', '+faststart', '-avoid_negative_ts', 'make_start'])
        .on('end', () => {
          console.log(`✅ Cached stream generated (stream-copy): ${cachedFilePath}`);
          resolve();
        })
        .on('error', (err) => {
          console.warn('FFmpeg stream-copy error, re-encoding:', err.message);
          ffmpeg(downloadPath)
            .setStartTime(0)
            .setDuration(duration)
            .output(cachedFilePath)
            .outputOptions(['-y', '-c:v', 'libx264', '-c:a', 'aac', '-preset', 'fast', '-crf', '23', '-movflags', '+faststart'])
            .on('end', () => {
              console.log(`✅ Cached stream generated (re-encoded): ${cachedFilePath}`);
              resolve();
            })
            .on('error', (err2) => {
              console.error('FFmpeg re-encode also failed:', err2.message);
              if (fs.existsSync(downloadPath)) {
                fs.copyFileSync(downloadPath, cachedFilePath);
              }
              resolve();
            })
            .run();
        })
        .run();
    });

    // Cleanup the un-trimmed download file
    try {
      if (fs.existsSync(downloadPath)) fs.unlinkSync(downloadPath);
    } catch (e) {}

    // Serve the cached trimmed file
    res.sendFile(cachedFilePath);

  } catch (err) {
    console.error('Stream generation error:', err);
    try {
      if (fs.existsSync(downloadPath)) fs.unlinkSync(downloadPath);
      if (fs.existsSync(trimmedPath)) fs.unlinkSync(trimmedPath);
    } catch (e) {}
    res.status(500).json({ error: 'Failed to stream clip', message: err.message });
  }
});


// ===== LOCAL VIDEO TRIM ENDPOINT =====
// Used for trimming uploaded local videos via the frontend
const multer = require('multer');
const localUpload = multer({
  dest: TEMP_DIR,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

app.post('/api/trim', localUpload.single('video'), async (req, res) => {
  const startTime = parseFloat(req.query.start) || 0;
  const endTime = parseFloat(req.query.end) || 30;
  const duration = endTime - startTime;
  const clipId = `local_${uuidv4().substring(0, 8)}`;
  const inputPath = req.file ? req.file.path : path.join(TEMP_DIR, `${clipId}_input.mp4`);
  const outputPath = path.join(TEMP_DIR, `${clipId}_output.mp4`);

  try {
    // If no multer file (raw body fallback)
    if (!req.file && req.body && Buffer.isBuffer(req.body)) {
      fs.writeFileSync(inputPath, req.body);
    } else if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    console.log(`✂️ Local trim: ${startTime}s -> ${endTime}s (${duration}s)`);

    // Try stream-copy first (fast), fallback to re-encode (accurate)
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .setDuration(duration)
        .output(outputPath)
        .outputOptions(['-y', '-c', 'copy', '-movflags', '+faststart', '-avoid_negative_ts', 'make_start'])
        .on('end', () => {
          console.log(`✅ Local trim done (stream-copy): ${outputPath}`);
          resolve();
        })
        .on('error', (err, stdout, stderr) => {
          console.warn(`Stream-copy failed. Error: ${err.message}. Stderr: ${stderr}`);
          ffmpeg(inputPath)
            .setStartTime(startTime)
            .setDuration(duration)
            .output(outputPath)
            .outputOptions(['-y', '-c:v', 'libx264', '-c:a', 'aac', '-preset', 'fast', '-crf', '23', '-movflags', '+faststart'])
            .on('end', () => {
              console.log(`✅ Local trim done (re-encoded): ${outputPath}`);
              resolve();
            })
            .on('error', (err2, stdout2, stderr2) => {
              console.error(`Re-encode failed. Error: ${err2.message}. Stderr: ${stderr2}`);
              reject(err2);
            })
            .run();
        })
        .run();
    });

    const stat = fs.statSync(outputPath);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `attachment; filename="clip_${Math.round(duration)}s.mp4"`);

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
    console.error('Local trim error:', err);
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
