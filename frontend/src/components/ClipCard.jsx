'use client';

import { useState, useEffect } from 'react';

export default function ClipCard({ clip }) {
  const [videoSrc, setVideoSrc] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const blobUrl = sessionStorage.getItem('current_video_blob_' + clip.jobId);
      if (blobUrl) {
        setVideoSrc(`${blobUrl}#t=${clip.startTime || 0},${clip.endTime || 30}`);
      } else {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
        setVideoSrc(`${baseUrl}/api/preview/${clip._id}`);
      }
    }
  }, [clip]);

  const getScoreColorClass = (score) => {
    if (score >= 8) return 'score-high';
    if (score >= 5) return 'score-med';
    return 'score-low';
  };

  const handleDownload = () => {
    if (typeof window !== 'undefined') {
      const blobUrl = sessionStorage.getItem('current_video_blob_' + clip.jobId);
      if (blobUrl) {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${clip.title || 'clip'}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
    window.open(`${baseUrl}/api/download/${clip._id}`, '_blank');
  };

  return (
    <div className="card clip-card">
      <div style={{ position: 'relative', width: '100%', paddingTop: '177.77%', backgroundColor: '#000', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '1rem' }}>
        {videoSrc ? (
          <video 
            controls 
            playsInline
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            src={videoSrc}
          >
            Your browser does not support the video tag.
          </video>
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
          <span style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }}>
            ⏱️ {clip.startTime || 0}s - {clip.endTime || 30}s ({clip.duration}s)
          </span>
          <span className={`score-badge ${getScoreColorClass(clip.viralityScore)}`}>
            Score: {clip.viralityScore}/10
          </span>
        </div>
        
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {clip.reason}
        </p>
      </div>

      <button 
        onClick={handleDownload}
        className="btn-secondary" 
        style={{ width: '100%', display: 'flex', justifyContent: 'center', cursor: 'pointer' }}
      >
        Download Clip
      </button>
    </div>
  );
}
