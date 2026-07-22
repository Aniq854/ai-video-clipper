const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
const path = require('path');

// Set static paths for FFmpeg and FFprobe
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const extractAudio = (videoPath, outputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec('pcm_s16le')
      .audioFrequency(16000)
      .audioChannels(1)
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => {
        console.error('FFmpeg extractAudio error:', err);
        reject(err);
      });
  });
};

const cutClip = (videoPath, startTime, endTime, outputPath, aspectRatio = '9:16') => {
  return new Promise((resolve, reject) => {
    const duration = Math.max(1, endTime - startTime);
    const command = ffmpeg(videoPath)
      .setStartTime(startTime)
      .setDuration(duration)
      .videoCodec('libx264')
      .audioCodec('aac');

    const outputOpts = ['-preset fast', '-crf 23'];

    if (aspectRatio === '9:16') {
      outputOpts.push('-vf', 'crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920');
    } else if (aspectRatio === '1:1') {
      outputOpts.push('-vf', 'crop=ih:ih:(iw-ih)/2:0,scale=1080:1080');
    }

    command
      .outputOptions(outputOpts)
      .save(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => {
        console.error('FFmpeg cutClip error:', err);
        reject(err);
      });
  });
};

const generateThumbnail = (videoPath, outputPath, timestamp) => {
  return new Promise((resolve) => {
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [Math.max(0, timestamp)],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '1280x720'
      })
      .on('end', () => resolve(outputPath))
      .on('error', (err) => {
        console.error('FFmpeg generateThumbnail error:', err);
        resolve(outputPath);
      });
  });
};

const getVideoDuration = (videoPath) => {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        console.error('ffprobe error:', err);
        return resolve(60);
      }
      const duration = metadata?.format?.duration || 60;
      resolve(duration);
    });
  });
};

module.exports = {
  extractAudio,
  cutClip,
  generateThumbnail,
  getVideoDuration
};
