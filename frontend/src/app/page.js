'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadBox from '../components/UploadBox';
import DurationSelector from '../components/DurationSelector';
import PlatformSelector from '../components/PlatformSelector';
import api from '../services/api';

export default function Home() {
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGenerate = async () => {
    if (!file || !duration) return;
    
    try {
      setUploading(true);
      setError('');
      const { jobId } = await api.uploadVideo(file, duration, aspectRatio, (p) => {
        setProgress(p);
      });
      
      router.push(`/result/${jobId}`);
    } catch (err) {
      console.error(err);
      setError('Failed to upload video. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="fade-in">
      <section className="hero">
        <h1 className="gradient-text">Transform Long Videos into Viral Clips</h1>
        <p>Upload your video, select target platform & duration, and let our AI extract the most engaging clips automatically.</p>
      </section>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>1. Upload Video</h3>
          <UploadBox onFileSelect={setFile} selectedFile={file} />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>2. Target Platform / Aspect Ratio</h3>
          <PlatformSelector selected={aspectRatio} onSelect={setAspectRatio} />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>3. Target Clip Duration</h3>
          <DurationSelector selected={duration} onSelect={setDuration} />
        </div>

        {error && (
          <div style={{ color: '#f87171', marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
            {error}
          </div>
        )}

        {uploading && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        <button 
          className="btn-primary" 
          style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}
          onClick={handleGenerate}
          disabled={!file || !duration || uploading}
        >
          {uploading ? 'Processing...' : 'Generate Clips'}
        </button>
      </div>
    </div>
  );
}
