'use client';

import { useState, useRef } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://clipai-server.onrender.com';

export default function ClipCard({ clip }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const videoRef = useRef(null);

  const clipDuration = Math.max(1, Math.round(clip.duration || (clip.endTime - clip.startTime) || 30));

  // Backend serves the already-cut clip files (FFmpeg output, smooth playback)
  const previewUrl = clip.previewUrl ? `${API_BASE}${clip.previewUrl}` : '';
  const downloadUrl = clip.downloadUrl ? `${API_BASE}${clip.downloadUrl}` : '';
  const thumbnailUrl = clip.thumbnailUrl
    ? (clip.thumbnailUrl.startsWith('http') ? clip.thumbnailUrl : `${API_BASE}${clip.thumbnailUrl}`)
    : null;

  const togglePlay = () => {
    if (!videoRef.current) {
      // First click: mount the video element lazily
      setLoaded(true);
      setIsPlaying(true);
      return;
    }
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      // Pause other playing videos on the page to avoid decoder conflicts
      if (typeof document !== 'undefined') {
        document.querySelectorAll('video').forEach(v => {
          if (v !== videoRef.current) {
            try { v.pause(); } catch (e) {}
          }
        });
      }
      videoRef.current.play().catch(err => console.warn('Play error:', err));
      setIsPlaying(true);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && isPlaying) {
      videoRef.current.play().catch(err => console.warn('Auto-play error:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !videoRef.current.seeking) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e) => {
    const percent = parseFloat(e.target.value);
    if (videoRef.current) {
      const newTime = (percent / 100) * (videoRef.current.duration || clipDuration);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleDownload = async () => {
    if (downloading || !downloadUrl) return;
    setDownloading(true);
    try {
      // Fetch the actual server-side FFmpeg-cut MP4 as a binary blob
      // This prevents Chrome from saving its own WebM stream recording
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${(clip.title || 'clip').replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'clip'}_${clipDuration}s.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Cleanup the blob URL after download starts
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      console.error('Download error:', err);
      // Fallback: try direct link download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${(clip.title || 'clip').replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'clip'}_${clipDuration}s.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => setDownloading(false), 1500);
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

  const progressPercent = Math.min(100, Math.max(0, (currentTime / clipDuration) * 100));

  return (
    <div className="card clip-card">
      <style>{`
        .play-overlay:hover {
          transform: scale(1.1);
          background: rgba(0,0,0,0.8) !important;
        }
      `}</style>
      <div style={{ position: 'relative', width: '100%', paddingTop: '177.77%', backgroundColor: '#000', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '1rem' }}>
        {loaded ? (
          <>
            <video
              key={previewUrl}
              ref={videoRef}
              playsInline
              preload="auto"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              src={previewUrl}
              poster={thumbnailUrl || undefined}
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={togglePlay} style={{ background: '#ffffff', border: 'none', color: '#000000', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold' }}>
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <input type="range" min="0" max="100" value={progressPercent} onChange={handleSeek} style={{ flex: 1, accentColor: '#ffffff', cursor: 'pointer' }} />
                <span style={{ color: '#fff', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  {formatTime(currentTime)} / {formatTime(clipDuration)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div
            onClick={togglePlay}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', backgroundImage: thumbnailUrl ? `url(${thumbnailUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ background: 'rgba(0,0,0,0.6)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', border: '2px solid #ffffff' }} className="play-overlay">
              <span style={{ color: '#ffffff', fontSize: '1.5rem', marginLeft: '4px' }}>▶</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {clip.title}
        </h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', color: '#ffffff', fontWeight: '600' }}>
            ✂️ {formatTime(clip.startTime || 0)} → {formatTime(clip.endTime || clipDuration)} ({clipDuration}s)
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
        <button
          onClick={handleDownload}
          className="btn-primary"
          disabled={downloading}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
        >
          {downloading ? 'Downloading...' : `Download ${clipDuration}s MP4 Clip`}
        </button>
      </div>
    </div>
  );
}
