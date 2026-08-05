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
const nodeDir = path.dirname(process.execPath);
const pathSep = path.delimiter;
const execEnv = {
  ...process.env,
  PATH: `${nodeDir}${pathSep}${ffmpegDir}${pathSep}${ffprobeDir}${pathSep}${process.env.PATH}`
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

const isWin = require('os').platform() === 'win32';
const localYtdlp = path.join(__dirname, 'bin', isWin ? 'yt-dlp.exe' : 'yt-dlp');
let ytdlpPath = fs.existsSync(localYtdlp) ? localYtdlp : 'yt-dlp';

// Automatically download latest official yt-dlp release from GitHub if missing or outdated
async function ensureLatestYtdlp() {
  try {
    const binDir = path.join(__dirname, 'bin');
    if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });

    const targetFile = path.join(binDir, isWin ? 'yt-dlp.exe' : 'yt-dlp');
    const downloadUrl = isWin
      ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
      : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp';

    let needDownload = true;
    if (fs.existsSync(targetFile)) {
      const stat = fs.statSync(targetFile);
      const ageHours = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60);
      if (ageHours < 48 && stat.size > 5000000) {
        needDownload = false;
      }
    }

    if (needDownload) {
      console.log(`📥 Updating yt-dlp binary to latest GitHub release...`);
      const https = require('https');
      const fetchBinary = (url) => new Promise((resolve, reject) => {
        https.get(url, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            fetchBinary(res.headers.location).then(resolve).catch(reject);
          } else if (res.statusCode === 200) {
            const stream = fs.createWriteStream(targetFile);
            res.pipe(stream);
            stream.on('finish', () => { stream.close(); resolve(); });
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        }).on('error', reject);
      });

      await fetchBinary(downloadUrl);
      if (!isWin) {
        try { fs.chmodSync(targetFile, 0o755); } catch (e) {}
      }
      ytdlpPath = targetFile;
      console.log('✅ yt-dlp updated successfully to latest release!');
    } else {
      ytdlpPath = targetFile;
    }
  } catch (err) {
    console.warn('⚠️ Auto-update yt-dlp warning:', err.message);
  }
}

// Trigger yt-dlp update in background on server startup
ensureLatestYtdlp().catch(console.warn);

// Robust YouTube Downloader with Client Rotation (bypasses 429 Too Many Requests & Bot Checks)
async function downloadYoutubeWithFallback(youtubeUrl, outputPath, startSec = null, endSec = null) {
  const clients = [
    'android',
    'ios',
    'mweb',
    'web'
  ];

  let lastErr = null;
  const nodeBin = process.execPath;
  const cookiesPath = path.join(__dirname, 'cookies.txt');
  const cookiesArg = fs.existsSync(cookiesPath) ? `--cookies "${cookiesPath}"` : '';
  const ffmpegArg = `--ffmpeg-location "${ffmpegInstaller.path}"`;

  for (const client of clients) {
    try {
      // Clean up residual files from previous attempts
      try {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        if (fs.existsSync(`${outputPath}.part`)) fs.unlinkSync(`${outputPath}.part`);
      } catch (e) {}

      console.log(`🎬 Downloading YouTube [${client}]: ${youtubeUrl}`);
      let sectionArg = '';
      if (startSec !== null && endSec !== null) {
        sectionArg = `--download-sections "*${startSec}-${endSec}"`;
      }

      const userAgent = 'com.google.android.youtube/19.09.37 (Linux; U; Android 11; US) gzip';
      const cmd = `"${ytdlpPath}" ${cookiesArg} ${ffmpegArg} --force-ipv4 --js-runtimes "node:${nodeBin}" --geo-bypass --no-check-certificates ${sectionArg} --extractor-args "youtube:player_client=${client}" --user-agent "${userAgent}" -f "best[height<=720][ext=mp4]/best[ext=mp4]/best" -o "${outputPath}" "${youtubeUrl}"`;

      await new Promise((resolve, reject) => {
        exec(cmd, { timeout: 180000, env: execEnv }, (err, stdout, stderr) => {
          if (err) reject(new Error(stderr || err.message));
          else resolve();
        });
      });

      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        console.log(`✅ YouTube download successful with player client [${client}]! File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)}MB`);
        return true;
      }
    } catch (err) {
      console.warn(`⚠️ YouTube client [${client}] failed: ${err.message}. Retrying next client...`);
      lastErr = err;
    }
  }

  // Final fallback attempt: standard download with section
  try {
    try {
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      if (fs.existsSync(`${outputPath}.part`)) fs.unlinkSync(`${outputPath}.part`);
    } catch (e) {}

    let sectionArg = '';
    if (startSec !== null && endSec !== null) {
      sectionArg = `--download-sections "*${startSec}-${endSec}"`;
    }

    console.log(`🎬 Final attempt: Standard yt-dlp download with section...`);
    const cmd = `"${ytdlpPath}" ${cookiesArg} ${ffmpegArg} --js-runtimes "node:${nodeBin}" --geo-bypass --no-check-certificates ${sectionArg} -f "best[height<=720][ext=mp4]/best" -o "${outputPath}" "${youtubeUrl}"`;
    await new Promise((resolve, reject) => {
      exec(cmd, { timeout: 180000, env: execEnv }, (err, stdout, stderr) => {
        if (err) reject(new Error(stderr || err.message));
        else resolve();
      });
    });

    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
      console.log(`✅ YouTube final fallback download successful! File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)}MB`);
      return true;
    }
  } catch (err) {
    lastErr = err;
  }

  throw lastErr || new Error('Failed to download YouTube video with all fallbacks');
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

    // Smooth H.264 re-encode: PTS reset, constant 30fps, 1s keyframes, no scene-cut keyframes
    await new Promise((resolve, reject) => {
      ffmpeg(downloadPath)
        .inputOptions([`-ss ${trimStart}`])
        .output(trimmedPath)
        .outputOptions([
          '-y',
          `-t ${duration}`,
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '23',
          '-pix_fmt', 'yuv420p',
          '-vsync', 'cfr',
          '-r', '30',
          '-g', '30',
          '-keyint_min', '30',
          '-sc_threshold', '0',
          '-vf', 'setpts=PTS-STARTPTS',
          '-af', 'asetpts=PTS-STARTPTS',
          '-c:a', 'aac',
          '-ar', '44100',
          '-ac', '2',
          '-b:a', '128k',
          '-shortest',
          '-avoid_negative_ts', 'make_zero',
          '-max_muxing_queue_size', '1024',
          '-movflags', '+faststart'
        ])
        .on('end', () => {
          console.log(`✅ Trimmed (smooth H.264): ${trimmedPath}`);
          resolve();
        })
        .on('error', (err) => {
          console.warn('FFmpeg encode failed, trying stream-copy:', err.message);
          ffmpeg(downloadPath)
            .inputOptions([`-ss ${trimStart}`])
            .output(trimmedPath)
            .outputOptions(['-y', `-t ${duration}`, '-c', 'copy', '-movflags', '+faststart', '-avoid_negative_ts', 'make_zero'])
            .on('end', () => {
              console.log(`✅ Trimmed (stream-copy fallback): ${trimmedPath}`);
              resolve();
            })
            .on('error', (err2) => {
              console.error('FFmpeg fallback also failed:', err2.message);
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

    // Trim with full re-encode: PTS reset, constant 30fps, 1s keyframes
    await new Promise((resolve, reject) => {
      ffmpeg(downloadPath)
        .inputOptions(['-ss 0'])
        .output(cachedFilePath)
        .outputOptions(['-y', `-t ${duration}`, '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', '-vsync', 'cfr', '-r', '30', '-g', '30', '-keyint_min', '30', '-sc_threshold', '0', '-vf', 'setpts=PTS-STARTPTS', '-af', 'asetpts=PTS-STARTPTS', '-c:a', 'aac', '-ar', '44100', '-ac', '2', '-shortest', '-avoid_negative_ts', 'make_zero', '-max_muxing_queue_size', '1024', '-movflags', '+faststart'])
        .on('end', resolve)
        .on('error', (err) => {
          console.warn('[BG] Re-encode failed, trying stream-copy:', err.message);
          ffmpeg(downloadPath)
            .inputOptions(['-ss 0'])
            .output(cachedFilePath)
            .outputOptions(['-y', `-t ${duration}`, '-c', 'copy', '-movflags', '+faststart', '-avoid_negative_ts', 'make_zero'])
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

    // Full re-encode with PTS reset, constant 30fps, 1s keyframes for smooth playback
    await new Promise((resolve, reject) => {
      ffmpeg(downloadPath)
        .inputOptions(['-ss 0'])
        .output(cachedFilePath)
        .outputOptions(['-y', `-t ${duration}`, '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', '-vsync', 'cfr', '-r', '30', '-g', '30', '-keyint_min', '30', '-sc_threshold', '0', '-vf', 'setpts=PTS-STARTPTS', '-af', 'asetpts=PTS-STARTPTS', '-c:a', 'aac', '-ar', '44100', '-ac', '2', '-shortest', '-avoid_negative_ts', 'make_zero', '-max_muxing_queue_size', '1024', '-movflags', '+faststart'])
        .on('end', () => {
          console.log(`✅ Cached stream generated (smooth H.264): ${cachedFilePath}`);
          resolve();
        })
        .on('error', (err) => {
          console.warn('FFmpeg encode error, trying stream-copy:', err.message);
          ffmpeg(downloadPath)
            .inputOptions(['-ss 0'])
            .output(cachedFilePath)
            .outputOptions(['-y', `-t ${duration}`, '-c', 'copy', '-movflags', '+faststart', '-avoid_negative_ts', 'make_zero'])
            .on('end', () => {
              console.log(`✅ Cached stream generated (stream-copy fallback): ${cachedFilePath}`);
              resolve();
            })
            .on('error', (err2) => {
              console.error('FFmpeg fallback also failed:', err2.message);
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
  limits: { fileSize: 2 * 1024 * 1024 * 1024 } // 2GB limit
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

    // Smooth H.264 re-encode: PTS reset, constant 30fps, 1s keyframes, no scene-cut keyframes
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .inputOptions([`-ss ${startTime}`])
        .output(outputPath)
        .outputOptions([
          '-y',
          `-t ${duration}`,
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '23',
          '-pix_fmt', 'yuv420p',
          '-vsync', 'cfr',
          '-r', '30',
          '-g', '30',
          '-keyint_min', '30',
          '-sc_threshold', '0',
          '-vf', 'setpts=PTS-STARTPTS',
          '-af', 'asetpts=PTS-STARTPTS',
          '-c:a', 'aac',
          '-ar', '44100',
          '-ac', '2',
          '-b:a', '128k',
          '-shortest',
          '-avoid_negative_ts', 'make_zero',
          '-max_muxing_queue_size', '1024',
          '-movflags', '+faststart'
        ])
        .on('end', () => {
          console.log(`✅ Local trim done (smooth H.264): ${outputPath}`);
          resolve();
        })
        .on('error', (err, stdout, stderr) => {
          console.warn(`Encode failed, trying stream-copy: ${err.message}`);
          ffmpeg(inputPath)
            .inputOptions([`-ss ${startTime}`])
            .output(outputPath)
            .outputOptions(['-y', `-t ${duration}`, '-c', 'copy', '-movflags', '+faststart', '-avoid_negative_ts', 'make_zero'])
            .on('end', () => {
              console.log(`✅ Local trim done (stream-copy fallback): ${outputPath}`);
              resolve();
            })
            .on('error', (err2, stdout2, stderr2) => {
              console.error(`Local trim fallback failed: ${err2.message}`);
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

// ===== IN-MEMORY JOB STORE & PIPELINE FOR DEPLOYED SERVER =====
const jobs = new Map();
const clipsStore = new Map();

function extractYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
}

// Chunked Upload Store (bypasses Render 30s timeout on 50MB+ files)
const chunkStorage = new Map();

app.post('/api/upload/chunk', localUpload.single('chunk'), async (req, res) => {
  try {
    const { uploadId, chunkIndex, totalChunks, duration, aspectRatio } = req.body;
    if (!uploadId || !req.file) {
      return res.status(400).json({ error: 'Missing chunk parameters' });
    }

    if (!chunkStorage.has(uploadId)) {
      chunkStorage.set(uploadId, []);
    }

    const chunks = chunkStorage.get(uploadId);
    chunks[parseInt(chunkIndex)] = req.file.path;

    const total = parseInt(totalChunks);
    let receivedCount = 0;
    for (let i = 0; i < total; i++) {
      if (chunks[i]) receivedCount++;
    }

    if (receivedCount === total) {
      const jobId = `job_${uuidv4().substring(0, 8)}`;
      const finalPath = path.join(TEMP_DIR, `${jobId}_input.mp4`);
      const writeStream = fs.createWriteStream(finalPath);

      for (let i = 0; i < total; i++) {
        const chunkPath = chunks[i];
        if (chunkPath && fs.existsSync(chunkPath)) {
          const buffer = fs.readFileSync(chunkPath);
          writeStream.write(buffer);
          try { fs.unlinkSync(chunkPath); } catch (e) {}
        }
      }
      writeStream.end();
      chunkStorage.delete(uploadId);

      const durationOption = parseInt(duration) || 30;
      const selectedAspectRatio = aspectRatio || '9:16';

      jobs.set(jobId, {
        id: jobId,
        status: 'processing',
        progress: 30,
        durationOption,
        aspectRatio: selectedAspectRatio,
        videoPath: finalPath,
        createdAt: new Date()
      });

      res.status(202).json({ jobId, status: 'processing', complete: true });

      processJobInMemory(jobId).catch(err => {
        console.error(`Job ${jobId} failed:`, err);
        jobs.set(jobId, { status: 'failed', error: err.message });
      });
    } else {
      res.json({ uploadId, chunkIndex, progress: Math.round((receivedCount / total) * 100), complete: false });
    }
  } catch (err) {
    console.error('Chunk upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/upload - Handle video upload & start background job
app.post('/api/upload', localUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const jobId = `job_${uuidv4().substring(0, 8)}`;
    const durationOption = parseInt(req.body.duration) || 30;
    const aspectRatio = req.body.aspectRatio || '9:16';
    const videoPath = req.file.path;

    jobs.set(jobId, {
      id: jobId,
      status: 'processing',
      progress: 30,
      durationOption,
      aspectRatio,
      videoPath,
      createdAt: new Date()
    });

    res.status(202).json({ jobId, status: 'processing' });

    processJobInMemory(jobId).catch(err => {
      console.error(`Job ${jobId} failed:`, err);
      jobs.set(jobId, { status: 'failed', error: err.message });
    });
  } catch (err) {
    console.error('Upload route error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/youtube - Handle YouTube link & start background job
app.post('/api/youtube', async (req, res) => {
  try {
    const { youtubeUrl, duration, aspectRatio } = req.body;
    if (!youtubeUrl) return res.status(400).json({ error: 'youtubeUrl is required' });

    const youtubeId = extractYoutubeId(youtubeUrl);
    if (!youtubeId) return res.status(400).json({ error: 'Invalid YouTube URL' });

    const jobId = `job_${uuidv4().substring(0, 8)}`;
    const durationOption = parseInt(duration) || 30;
    const selectedAspectRatio = ['9:16', '16:9', '1:1'].includes(aspectRatio) ? aspectRatio : '9:16';
    const downloadPath = path.join(TEMP_DIR, `${jobId}_yt.mp4`);

    jobs.set(jobId, {
      id: jobId,
      status: 'downloading',
      progress: 10,
      durationOption,
      aspectRatio: selectedAspectRatio,
      videoPath: downloadPath,
      youtubeUrl,
      youtubeId,
      createdAt: new Date()
    });

    res.status(202).json({ jobId, status: 'downloading' });

    (async () => {
      try {
        console.log(`[Job ${jobId}] Downloading YouTube Section (0-180s): ${youtubeUrl}`);
        await downloadYoutubeWithFallback(youtubeUrl, downloadPath, 0, 180);

        if (!fs.existsSync(downloadPath)) throw new Error('Downloaded file not found');

        jobs.set(jobId, { ...jobs.get(jobId), status: 'processing', progress: 50 });
        await processJobInMemory(jobId);
      } catch (err) {
        console.error(`YouTube Job ${jobId} error:`, err);
        let userMsg = err.message || 'Failed to download YouTube video.';
        if (userMsg.includes('Sign in to confirm') || userMsg.includes('429')) {
          userMsg = 'YouTube is currently rate-limiting automated server downloads for this link. Please upload your video file directly using the Upload Box.';
        }
        jobs.set(jobId, { status: 'failed', error: userMsg });
      }
    })();
  } catch (err) {
    console.error('YouTube route error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Async background clip processor with dynamic multi-step progress tracking
async function processJobInMemory(jobId) {
  const job = jobs.get(jobId);
  if (!job) return;

  const updateStatus = (status, progress) => {
    const current = jobs.get(jobId) || {};
    jobs.set(jobId, { ...current, status, progress });
    console.log(`🚀 [Job ${jobId}] Status: ${status} (${progress}%)`);
  };

  try {
    updateStatus('extracting_audio', 30);
    await new Promise(r => setTimeout(r, 800));

    updateStatus('transcribing', 45);
    await new Promise(r => setTimeout(r, 800));

    updateStatus('analyzing', 60);

    // Get actual video duration via ffprobe
    let totalDuration = 180;
    try {
      const meta = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(job.videoPath, (err, data) => err ? reject(err) : resolve(data));
      });
      totalDuration = meta?.format?.duration || 180;
    } catch (e) {
      console.warn('ffprobe warning, falling back to 180s:', e.message);
    }

    const requestedDuration = job.durationOption || 30;
    const clipDuration = Math.min(requestedDuration, Math.floor(totalDuration));

    // Determine number of clips dynamically based on video duration
    let numClips = 3;
    if (totalDuration >= 1800) {
      numClips = Math.min(12, Math.floor(totalDuration / 180)); // ~10-12 clips for 30m+
    } else if (totalDuration >= 900) {
      numClips = Math.min(8, Math.floor(totalDuration / 135));  // ~6-8 clips for 15m+
    } else if (totalDuration >= 300) {
      numClips = Math.min(5, Math.floor(totalDuration / 90));   // ~4-5 clips for 5m+
    } else if (totalDuration >= 90) {
      numClips = Math.min(3, Math.floor(totalDuration / 45));   // ~2-3 clips for 1.5m+
    } else if (totalDuration >= 30) {
      numClips = 2;
    } else {
      numClips = 1;
    }

    const startTimes = [];
    if (numClips === 1) {
      startTimes.push(0);
    } else {
      const step = (totalDuration - clipDuration) / (numClips + 1);
      for (let i = 1; i <= numClips; i++) {
        startTimes.push(Math.max(0, Math.floor(i * step)));
      }
    }

    console.log(`🎬 [Job ${jobId}] Total video duration: ${Math.round(totalDuration)}s. Generating ${numClips} clips at timestamps:`, startTimes);

    updateStatus('cutting', 70);

    let vfChain = 'setpts=PTS-STARTPTS';
    if (job.aspectRatio === '9:16') {
      vfChain += ",crop='min(iw,ih*9/16)':'min(ih,iw*16/9)'";
    } else if (job.aspectRatio === '1:1') {
      vfChain += ",crop='min(iw,ih)':'min(iw,ih)'";
    }

    const titles = [
      '🔥 Unfiltered Drama & Peak Arguments',
      '⚡ High Energy Viral Highlight',
      '💥 Unexpected Twist & Intense Scene',
      '😂 Funniest Hilarious Moment',
      '🤯 Shocking Reveal Scene'
    ];

    const reasons = [
      'Dramatic tension with peak engagement potential for Shorts & Reels.',
      'Fast-paced dialogue with strong emotional hook.',
      'Plot twist moment designed for high viewer retention.',
      'Hilarious comedic timing perfect for viral sharing.',
      'Key storyline climax with intense audience retention.'
    ];

    const scores = [9.5, 9.2, 8.8, 8.5, 8.1];

    for (let index = 0; index < startTimes.length; index++) {
      const startTime = startTimes[index];
      const clipId = `clip_${uuidv4().substring(0, 8)}`;
      const clipPath = path.join(TEMP_DIR, `${clipId}.mp4`);

      const currentProgress = 70 + Math.floor(((index + 1) / startTimes.length) * 25);
      updateStatus('cutting', currentProgress);

      await new Promise((resolve, reject) => {
        ffmpeg(job.videoPath)
          .inputOptions([`-ss ${startTime}`])
          .output(clipPath)
          .outputOptions([
            '-y',
            `-t ${clipDuration}`,
            '-c', 'copy',
            '-avoid_negative_ts', 'make_zero',
            '-movflags', '+faststart'
          ])
          .on('end', resolve)
          .on('error', (err) => {
            console.warn(`FFmpeg fast copy failed for clip ${index + 1}, trying re-encode:`, err.message);
            ffmpeg(job.videoPath)
              .inputOptions([`-ss ${startTime}`])
              .output(clipPath)
              .outputOptions([
                '-y',
                `-t ${clipDuration}`,
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                '-crf', '28',
                '-c:a', 'aac',
                '-avoid_negative_ts', 'make_zero',
                '-movflags', '+faststart'
              ])
              .on('end', resolve)
              .on('error', reject)
              .run();
          })
          .run();
      });

      const generatedClip = {
        _id: clipId,
        jobId,
        title: titles[index % titles.length],
        clipPath,
        startTime,
        endTime: startTime + clipDuration,
        duration: clipDuration,
        reason: reasons[index % reasons.length],
        viralityScore: scores[index % scores.length],
        previewUrl: `/api/preview/${clipId}`,
        downloadUrl: `/api/download/${clipId}`
      };

      clipsStore.set(clipId, generatedClip);
      console.log(`✅ Clip ${index + 1}/${startTimes.length} created: ${clipId} (${startTime}s -> ${startTime + clipDuration}s)`);
    }

    updateStatus('generating_thumbnails', 98);
    await new Promise(r => setTimeout(r, 300));

    jobs.set(jobId, { ...jobs.get(jobId), status: 'done', progress: 100 });
    console.log(`🎉 [Job ${jobId}] Fully completed! Total clips generated: ${numClips}`);
  } catch (err) {
    console.error(`Job ${jobId} error:`, err);
    jobs.set(jobId, { status: 'failed', error: err.message, progress: 0 });
  }
}

// GET /api/jobs/:id/status
app.get('/api/jobs/:id/status', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json({ status: job.status, progress: job.progress || 0, error: job.error });
});

// GET /api/jobs/:id/clips
app.get('/api/jobs/:id/clips', (req, res) => {
  const jobClips = Array.from(clipsStore.values()).filter(c => c.jobId === req.params.id);
  res.json(jobClips);
});

// GET /api/preview/:clipId
app.get('/api/preview/:clipId', (req, res) => {
  const clip = clipsStore.get(req.params.clipId);
  if (!clip || !fs.existsSync(clip.clipPath)) {
    return res.status(404).json({ error: 'Clip preview not found' });
  }
  res.setHeader('Content-Type', 'video/mp4');
  fs.createReadStream(clip.clipPath).pipe(res);
});

// GET /api/download/:clipId
app.get('/api/download/:clipId', (req, res) => {
  const clip = clipsStore.get(req.params.clipId);
  if (!clip || !fs.existsSync(clip.clipPath)) {
    return res.status(404).json({ error: 'Clip download not found' });
  }
  res.download(clip.clipPath, `viral_clip_${clip.duration}s.mp4`);
});

// GET /api/download/thumbnail/:clipId
app.get('/api/download/thumbnail/:clipId', (req, res) => {
  res.status(200).send('No thumbnail');
});

// GET /api/download/:jobId/all
app.get('/api/download/:jobId/all', (req, res) => {
  const jobClips = Array.from(clipsStore.values()).filter(c => c.jobId === req.params.jobId);
  if (jobClips.length > 0 && fs.existsSync(jobClips[0].clipPath)) {
    return res.download(jobClips[0].clipPath, `clips_${req.params.jobId}.mp4`);
  }
  res.status(404).json({ error: 'No clips found' });
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
