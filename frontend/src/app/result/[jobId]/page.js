'use client';

import { useParams, useRouter } from 'next/navigation';
import useJobStatus from '../../../hooks/useJobStatus';
import ProgressTracker from '../../../components/ProgressTracker';
import ClipCard from '../../../components/ClipCard';
import api from '../../../services/api';

export default function ResultPage() {
  const params = useParams();
  const jobId = params?.jobId;
  const { job, clips, loading, error } = useJobStatus(jobId);
  const router = useRouter();

  if (error) {
    return (
      <div className="card fade-in" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '650px', margin: '0 auto' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ color: '#f87171', marginBottom: '1rem' }}>Video Processing Notice</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>{error}</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => router.push('/')}>
            📁 Upload Local Video File (Fast 3s Cut)
          </button>
          <button className="btn-secondary" onClick={() => router.push('/')}>
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (loading || !job) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="spin" style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-purple)', borderRadius: '50%' }}></div>
      </div>
    );
  }

  const isDone = job.status === 'done';

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="gradient-text">Job Status</h1>
        <button className="btn-secondary" onClick={() => router.push('/')}>New Video</button>
      </div>

      {!isDone ? (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Processing Video...</h3>
          <ProgressTracker status={job.status} progress={job.progress || 0} />
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Generated Clips ({clips.length})</h2>
            <a href={api.getDownloadAllUrl(jobId)} className="btn-primary" download>
              Download All as ZIP
            </a>
          </div>
          
          {clips.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No clips could be generated from this video.</p>
            </div>
          ) : (
            <div className="clips-grid">
              {clips.map(clip => (
                <ClipCard key={clip._id} clip={clip} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
