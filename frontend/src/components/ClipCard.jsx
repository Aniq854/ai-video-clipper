'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const CLIP_SERVER = process.env.NEXT_PUBLIC_CLIP_SERVER || 'https://clipai-server.onrender.com';

export default function ClipCard({ clip }) {
  const [videoSrc, setVideoSrc] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [clipCurrentTime, setClipCurrentTime] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepareMessage, setPrepareMessage] = useState('');
  const videoRef = useRef(null);

  const startTime = clip.startTime || 0;
  const endTime = clip.endTime || (startTime + 30);
  const clipDuration = Math.max(1, endTime - startTime);
  const isYoutube = Boolean(clip.youtubeId);

  const isStreamed = isYoutube;
  const playStart = isStreamed ? 0 : startTime;
  const playEnd = isStreamed ? clipDuration : endTime;

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
      videoRef.current.currentTime = playStart;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      if (cur >= playEnd || cur < playStart) {
        videoRef.current.currentTime = playStart;
        videoRef.current.pause();
        setIsPlaying(false);
        setClipCurrentTime(0);
      } else {
        setClipCurrentTime(Math.max(0, cur - playStart));
      }
    }
  };

  const checkStatusAndPlay = async () => {
    if (!isYoutube) {
      playVideo();
      return;
    }

    try {
      setIsPreparing(true);
      setPrepareMessage('Waking up server...');

      const checkStatus = async () => {
        try {
          const res = await fetch(`${CLIP_SERVER}/api/youtube/status?youtubeId=${clip.youtubeId}&startTime=${startTime}&endTime=${endTime}`);
          const data = await res.json();
          
          if (data.ready) {
            setVideoSrc(`${CLIP_SERVER}/api/youtube/stream?youtubeId=${clip.youtubeId}&startTime=${startTime}&endTime=${endTime}`);
            setIsPreparing(false);
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.play();
                setIsPlaying(true);
              }
            }, 300);
            return true;
          } else {
            setPrepareMessage('Processing clip (10-15s)...');
            return false;
          }
        } catch (e) {
          console.warn('Status check error:', e);
          return false;
        }
      };

      const isReady = await checkStatus();
      if (isReady) return;

      const interval = setInterval(async () => {
        const ready = await checkStatus();
        if (ready) {
          clearInterval(interval);
        }
      }, 2500);

      setTimeout(() => {
        clearInterval(interval);
        setIsPreparing(prev => {
          if (prev) {
            alert('Clip preparation timed out. Please try again.');
          }
          return false;
        });
      }, 90000);

    } catch (err) {
      console.error(err);
      setIsPreparing(false);
      alert('Failed to connect to clip server.');
    }
  };

  const playVideo = () => {
    if (!videoRef.current) return;
    if (videoRef.current.currentTime >= playEnd || videoRef.current.currentTime < playStart) {
      videoRef.current.currentTime = playStart;
    }
    videoRef.current.play();
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (videoRef.current) videoRef.current.pause();
      setIsPlaying(false);
    } else {
      checkStatusAndPlay();
    }
  };

  const handleSeek = (e) => {
    const relativePercent = parseFloat(e.target.value);
    const newTime = playStart + (relativePercent / 100) * clipDuration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setClipCurrentTime(newTime - playStart);
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

    // Local video: server-side trim using clipserver's FFmpeg /api/trim endpoint
    try {
      setDownloading(true);
      setDownloadProgress(5);

      // Get the video blob from sessionStorage
      const blobUrl = typeof window !== 'undefined' 
        ? sessionStorage.getItem('current_video_blob_' + clip.jobId) 
        : null;

      if (!blobUrl) {
        throw new Error('Video file not found in session. Please re-upload.');
      }

      setDownloadProgress(10);

      // Fetch the blob from the object URL
      const blobResponse = await fetch(blobUrl);
      const videoBlob = await blobResponse.blob();

      setDownloadProgress(20);

      // Create FormData and send to clipserver for proper FFmpeg trimming
      const formData = new FormData();
      formData.append('video', videoBlob, 'video.mp4');

      const trimUrl = `${CLIP_SERVER}/api/trim?start=${startTime}&end=${endTime}`;
      
      setDownloadProgress(30);

      const response = await axios.post(trimUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob',
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // Scale upload progress between 30% and 75%
            const scaledProgress = 30 + Math.round((percentCompleted * 45) / 100);
            setDownloadProgress(scaledProgress);
          }
        }
      });

      setDownloadProgress(80);

      const trimmedBlob = response.data;
      setDownloadProgress(90);

      // Download the properly trimmed MP4
      const downloadUrl = URL.createObjectURL(trimmedBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${(clip.title || 'clip').replace(/[^a-zA-Z0-9 ]/g, '').trim()}_${clipDuration}s.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      setDownloadProgress(100);
    } catch (err) {
      console.error('Server-side trim error:', err);
      
      // Fallback: download full video blob from sessionStorage
      const blobUrl = sessionStorage.getItem('current_video_blob_' + clip.jobId);
      if (blobUrl) {
        alert('Clip server unavailable. Downloading full video instead.');
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${clip.title || 'clip'}_full.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert('Trim failed: ' + err.message);
      }
    } finally {
      setTimeout(() => {
        setDownloading(false);
        setDownloadProgress(0);
      }, 1000);
    }
  };

  const progressPercent = Math.min(100, Math.max(0, (clipCurrentTime / clipDuration) * 100));

  return (
    <div className="card clip-card">
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .play-overlay:hover {
          transform: scale(1.1);
          background: rgba(0,0,0,0.8) !important;
        }
      `}</style>
      <div style={{ position: 'relative', width: '100%', paddingTop: '177.77%', backgroundColor: '#000', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '1rem' }}>
        {/* Loading Overlay */}
        {isPreparing && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20, gap: '1rem', color: '#fff', padding: '1rem', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{prepareMessage}</span>
          </div>
        )}

        {/* Downloading Overlay */}
        {downloading && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9,9,11,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 25, gap: '1rem', color: '#ffffff', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>Downloading clip...</span>
            <div style={{ width: '100%', height: '6px', background: '#27272a', borderRadius: '3px', overflow: 'hidden', marginTop: '0.5rem' }}>
              <div style={{ width: `${downloadProgress}%`, height: '100%', background: '#ffffff', transition: 'width 0.3s' }}></div>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{downloadProgress}% completed</span>
          </div>
        )}

        {videoSrc ? (
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
              poster={clip.thumbnailUrl || null}
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
          <div 
            onClick={togglePlay}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer', backgroundImage: clip.thumbnailUrl ? `url(${clip.thumbnailUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
