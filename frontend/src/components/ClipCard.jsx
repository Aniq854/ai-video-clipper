'use client';

import api from '../services/api';

export default function ClipCard({ clip }) {
  const getScoreColorClass = (score) => {
    if (score >= 8) return 'score-high';
    if (score >= 5) return 'score-med';
    return 'score-low';
  };

  const previewUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/preview/${clip._id}`;
  const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/download/${clip._id}`;
  const thumbnailUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/download/thumbnail/${clip._id}`;

  return (
    <div className="card clip-card">
      <div style={{ position: 'relative', width: '100%', paddingTop: '177.77%', backgroundColor: '#000', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '1rem' }}>
        <video 
          controls 
          poster={thumbnailUrl}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          src={previewUrl}
          preload="none"
        >
          Your browser does not support the video tag.
        </video>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {clip.title}
        </h4>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }}>
            ⏱️ {clip.duration}s
          </span>
          <span className={`score-badge ${getScoreColorClass(clip.viralityScore)}`}>
            Score: {clip.viralityScore}/10
          </span>
        </div>
        
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {clip.reason}
        </p>
      </div>

      <a 
        href={downloadUrl}
        download
        className="btn-secondary" 
        style={{ width: '100%', display: 'flex', justifyContent: 'center', textDecoration: 'none' }}
      >
        Download Clip
      </a>
    </div>
  );
}
