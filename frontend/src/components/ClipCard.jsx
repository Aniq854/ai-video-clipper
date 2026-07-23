'use client';

import { useState, useEffect, useRef } from 'react';

const CLIP_SERVER = process.env.NEXT_PUBLIC_CLIP_SERVER || 'https://clipai-server.onrender.com';

export default function ClipCard({ clip }) {
  const [videoSrc, setVideoSrc] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [clipCurrentTime, setClipCurrentTime] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const videoRef = useRef(null);

  const startTime = clip.startTime || 0;
  const endTime = clip.endTime || (startTime + 30);
  const clipDuration = Math.max(1, endTime - startTime);
  const isYoutube = Boolean(clip.youtubeId);

  useEffect(() => {
    if (!isYoutube && typeof window !== 'undefined') {
      const blobUrl = sessionStorage.getItem('current_video_blob_' + clip.jobId);
      if (blobUrl) {
        setVideoSrc(blobUrl);
      }
    }
  }, [clip, isYoutube]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      if (cur >= endTime || cur < startTime) {
        videoRef.current.currentTime = startTime;
        videoRef.current.pause();
        setIsPlaying(false);
        setClipCurrentTime(0);
      } else {
        setClipCurrentTime(Math.max(0, cur - startTime));
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime >= endTime || videoRef.current.currentTime < startTime) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const relativePercent = parseFloat(e.target.value);
    const newTime = startTime + (relativePercent / 100) * clipDuration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setClipCurrentTime(newTime - startTime);
    }
  };

  const getScoreColorClass = (score) => {
    if (score >= 8) return 'score-high';
    if (score >= 5) return 'score-med';
    return 'score-low';
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ===== REAL TRIM & DOWNLOAD =====
  const handleDownloadTrimmed = async () => {
    if (downloading) return;

    // YouTube clip: call backend server to download + trim
    if (isYoutube && clip.youtubeId) {
      if (!CLIP_SERVER) {
        alert('Clip server not configured. Please set NEXT_PUBLIC_CLIP_SERVER environment variable.');
        return;
      }

      try {
        setDownloading(true);
        setDownloadProgress(10);

        const youtubeUrl = `https://www.youtube.com/watch?v=${clip.youtubeId}`;
        
        setDownloadProgress(20);

        const response = await fetch(`${CLIP_SERVER}/api/youtube/clip`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            youtubeUrl,
            startTime,
            endTime,
            clipIndex: clip._id
          })
        });

        setDownloadProgress(70);

        if (!response.ok) {
          throw new Error('Server returned error');
        }

        const blob = await response.blob();
        setDownloadProgress(90);

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(clip.title || 'clip').replace(/[^a-zA-Z0-9 ]/g, '').trim()}_${clipDuration}s.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setDownloadProgress(100);
      } catch (err) {
        console.error('YouTube clip download error:', err);
        alert('Clip download failed. Server may be starting up — please try again in 30 seconds.');
      } finally {
        setTimeout(() => {
          setDownloading(false);
          setDownloadProgress(0);
        }, 1000);
      }
      return;
    }

    // Local video: in-browser trim using Canvas + MediaRecorder
    if (!videoRef.current) return;

    try {
      setDownloading(true);
      setDownloadProgress(0);

      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1080;
      canvas.height = video.videoHeight || 1920;
      const ctx = canvas.getContext('2d');

      const canvasStream = canvas.captureStream(30);

      const mediaRecorder = new MediaRecorder(canvasStream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm'
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(clip.title || 'clip').replace(/[^a-zA-Z0-9 ]/g, '').trim()}_${clipDuration}s.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloading(false);
        setDownloadProgress(0);
      };

      video.currentTime = startTime;
      await new Promise(resolve => { video.onseeked = resolve; });

      mediaRecorder.start();
      video.play();

      const drawFrame = () => {
        if (video.currentTime >= endTime || video.paused) {
          video.pause();
          mediaRecorder.stop();
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const elapsed = video.currentTime - startTime;
        setDownloadProgress(Math.min(100, Math.round((elapsed / clipDuration) * 100)));
        requestAnimationFrame(drawFrame);
      };
      drawFrame();
    } catch (err) {
      console.error('Local trim error:', err);
      setDownloading(false);
      // Fallback: download full video
      const blobUrl = sessionStorage.getItem('current_video_blob_' + clip.jobId);
      if (blobUrl) {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${clip.title || 'clip'}_${clipDuration}s.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
  };

  const progressPercent = Math.min(100, Math.max(0, (clipCurrentTime / clipDuration) * 100));

  return (
    <div className="card clip-card">
      <div style={{ position: 'relative', width: '100%', paddingTop: '177.77%', backgroundColor: '#000', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '1rem' }}>
        {isYoutube ? (
          <iframe
            src={`https://www.youtube.com/embed/${clip.youtubeId}?start=${startTime}&end=${endTime}&autoplay=0`}
            title={clip.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          />
        ) : videoSrc ? (
          <>
            <video
              ref={videoRef}
              playsInline
              crossOrigin="anonymous"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              src={videoSrc}
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={togglePlay} style={{ background: '#ffffff', border: 'none', color: '#000000', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold' }}>
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <input type="range" min="0" max="100" value={progressPercent} onChange={handleSeek} style={{ flex: 1, accentColor: '#ffffff', cursor: 'pointer' }} />
                <span style={{ color: '#fff', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  {formatTime(clipCurrentTime)} / {formatTime(clipDuration)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
            Loading preview...
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {clip.title}
        </h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', color: '#ffffff', fontWeight: '600' }}>
            ✂️ {formatTime(startTime)} → {formatTime(endTime)} ({clipDuration}s)
          </span>
          <span className={`score-badge ${getScoreColorClass(clip.viralityScore)}`}>
            Score: {clip.viralityScore}/10
          </span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {clip.reason}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {downloading ? (
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem', color: '#ffffff' }}>
              <span>✂️ {isYoutube ? 'Downloading & trimming...' : 'Trimming clip...'}</span>
              <span>{downloadProgress}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#27272a', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${downloadProgress}%`, height: '100%', background: '#ffffff', transition: 'width 0.3s', boxShadow: '0 0 8px rgba(255,255,255,0.5)' }}></div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleDownloadTrimmed}
            className="btn-primary"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
          >
            ✂️ Trim & Download {clipDuration}s MP4 Clip
          </button>
        )}
      </div>
    </div>
  );
}
