'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UploadBox from '../components/UploadBox';
import DurationSelector from '../components/DurationSelector';
import PlatformSelector from '../components/PlatformSelector';
import api from '../services/api';

export default function Home() {
  const [file, setFile] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [duration, setDuration] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const router = useRouter();

  // Auto-ping backend server on homepage mount to wake up Render cold-start in background
  useEffect(() => {
    api.warmupServer();
  }, []);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  const handleGenerate = async () => {
    if ((!file && !youtubeUrl) || !duration) return;

    try {
      setUploading(true);
      setError('');
      setProgress(0);

      let jobId;

      if (youtubeUrl) {
        setProgress(30);
        const res = await api.processYoutubeUrl(youtubeUrl, duration, aspectRatio);
        jobId = res.jobId;
        setProgress(100);
      } else {
        const res = await api.uploadVideo(file, duration, aspectRatio, (p) => {
          setProgress(p);
        });
        jobId = res.jobId;
      }

      if (!jobId) {
        throw new Error('No job ID returned from server');
      }

      router.push(`/result/${jobId}`);
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.error || err.message;
      if (serverMsg && !serverMsg.includes('Network Error')) {
        setError(serverMsg);
      } else {
        setError('Server is warming up or connecting. Please try again in 5 seconds.');
      }
      setUploading(false);
    }
  };

  const isFormValid = (file || youtubeUrl) && duration && !uploading;

  return (
    <div className="fade-in">
      {/* FAQ Schema for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How does Snipr AI clip long videos into shorts?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Snipr AI analyzes long-form videos, identifies peak engaging moments, and cuts high-quality 9:16 vertical clips for TikTok, YouTube Shorts, and Instagram Reels in 3 seconds flat."
                }
              },
              {
                "@type": "Question",
                "name": "Is Snipr AI free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, Snipr AI offers free video clipping with no sign-up required. You can upload local MP4 video files and instantly export dynamic viral clips."
                }
              },
              {
                "@type": "Question",
                "name": "What video formats are supported?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Snipr AI supports MP4, MOV, MKV, WEBM, and AVI video uploads up to 500MB+ with chunked fast processing."
                }
              }
            ]
          })
        }}
      />

      <section className="hero">
        <h1 className="gradient-text">Free AI Video Clipper – Turn Long Videos into Viral Shorts</h1>
        <p>Transform podcasts, interviews, and long YouTube videos into high-converting 9:16 Shorts, Reels, and TikTok clips in 3 seconds flat with Snipr AI.</p>
      </section>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto 4rem auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>1. Select Video Source</h2>
          <UploadBox 
            onFileSelect={handleFileSelect} 
            selectedFile={file} 
            onUrlSelect={setYoutubeUrl}
            youtubeUrl={youtubeUrl}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>2. Target Platform / Aspect Ratio</h2>
          <PlatformSelector selected={aspectRatio} onSelect={setAspectRatio} />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>3. Target Clip Duration</h2>
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
              <span>Processing Video...</span>
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
          disabled={!isFormValid}
        >
          {uploading ? 'Processing...' : 'Generate Viral Clips'}
        </button>
      </div>

      {/* SEO Content Section 1: How It Works */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 4rem auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2.5rem', color: '#ffffff' }}>
          How Snipr AI Repurposes Videos in 3 Simple Steps
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📁</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#ffffff' }}>1. Upload Video</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Drop your MP4, MOV, or podcast file into the 3MB chunked uploader. No file size bottleneck.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚡</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#ffffff' }}>2. AI Scene Detection</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Our ultra-fast FFmpeg engine detects viral hooks, dialogue climaxes, and peak engagement segments.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📱</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#ffffff' }}>3. Export 9:16 Shorts</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Download ready-to-post 9:16 vertical clips with engagement virality scores and Cloudflare R2 CDN streaming.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Content Section 2: Why Choose Snipr AI */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 4rem auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem', color: '#ffffff' }}>
          Why Content Creators & Marketers Trust Snipr AI
        </h2>
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.5rem' }}>🚀 3-Second Processing Speed</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Unlike slow cloud video editors that take 20 minutes to render, Snipr AI utilizes direct stream copying (`-c copy`) to generate clips in 3 seconds flat.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.5rem' }}>🔒 100% Free & Private</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                No credit card required, no account signup forced. Upload your files and download your MP4 clips instantly.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.5rem' }}>🎯 Multi-Platform Optimization</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Crop for TikTok (9:16), YouTube Shorts (9:16), Instagram Reels (9:16), or Square Posts (1:1) with automated aspect ratio reframing.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.5rem' }}>🌩️ Cloudflare R2 Cloud Delivery</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Generated media files stream directly from Cloudflare’s global CDN network for zero buffering and instant preview downloads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content Section 3: FAQ */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 4rem auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem', color: '#ffffff' }}>
          Frequently Asked Questions (FAQ)
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.5rem 2rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.5rem' }}>How does Snipr AI clip long videos into shorts?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Snipr AI uses advanced media analysis to identify peak emotional moments, intense dialogue, and comedy timing in long videos. It clips those segments into standalone 30s, 60s, or 90s MP4 files.
            </p>
          </div>
          <div className="card" style={{ padding: '1.5rem 2rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.5rem' }}>Is Snipr AI free to use?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Yes! Snipr AI offers free video clipping with no sign-up required. You can upload local MP4 video files and instantly export dynamic viral clips.
            </p>
          </div>
          <div className="card" style={{ padding: '1.5rem 2rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.5rem' }}>What video formats are supported?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Snipr AI supports MP4, MOV, MKV, WEBM, and AVI video uploads up to 500MB+ with chunked uploader integration.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
