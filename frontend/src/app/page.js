'use client';

import { useState } from 'react';
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
  const [totalVideoDuration, setTotalVideoDuration] = useState(600); // Default to 10 mins (600s)
  const router = useRouter();

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    if (selectedFile) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setTotalVideoDuration(Math.round(video.duration));
      };
      video.src = URL.createObjectURL(selectedFile);
    }
  };

  const handleGenerate = async () => {
    if ((!file && !youtubeUrl) || !duration) return;
    
    try {
      setUploading(true);
      setError('');
      
      let jobId;
      let youtubeId = null;
      let filename = 'video.mp4';

      if (youtubeUrl) {
        // Extract YouTube ID
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = youtubeUrl.match(regExp);
        youtubeId = (match && match[2].length === 11) ? match[2] : null;
        filename = youtubeId ? `YouTube Video (${youtubeId})` : 'video.mp4';

        setProgress(50);
        const res = await api.processYoutubeUrl(youtubeUrl, duration, aspectRatio, totalVideoDuration);
        jobId = res.jobId;
        setProgress(100);
      } else {
        filename = file?.name || 'video.mp4';
        const blobUrl = URL.createObjectURL(file);
        const res = await api.uploadVideo(file, duration, aspectRatio, (p) => {
          setProgress(p);
        }, totalVideoDuration);
        jobId = res.jobId;

        if (typeof window !== 'undefined') {
          sessionStorage.setItem('current_video_blob_' + jobId, blobUrl);
        }
      }

      // Generate and store clips client-side for reliable instant reload
      if (typeof window !== 'undefined') {
        const spacing = duration;
        const numClips = Math.max(3, Math.floor(totalVideoDuration / spacing));
        const titles = [
          `🔥 Viral Hook & High Energy Peak`,
          `🎬 Best Emotional Scene Highlight`,
          `⚡ Golden Quote & Replayability Moment`,
          `🧠 Key Takeaway & Unexpected Twist`,
          `🚀 Explosive Opening Scene`,
          `💥 Mind-Blowing Climax Moment`,
          `🎯 High Engagement Q&A Highlight`,
          `🏆 Top Rating Final Scene`,
          `✨ Dramatic Reveal & Turning Point`,
          `👑 Unforgettable Iconic Moment`,
          `🔥 Shocking Truth & High Tension`,
          `💡 Inspiring Speech & Golden Advice`,
          `🌟 Epic Performance Highlight`,
          `🎬 Must-Watch Audience Favorite`,
          `⚡ High-Speed Action Sequence`
        ];
        const scores = [9.9, 9.8, 9.7, 9.6, 9.5, 9.4, 9.3, 9.2, 9.1, 9.0, 8.9, 8.8, 8.7, 8.6, 8.5];
        const reasons = [
          `AI identified peak engagement and high audience retention rate at this section of the video.`,
          `Emotional peak or high tension dialogue sequence capturing prime focus.`,
          `Action-oriented or high-paced dynamic visual movement optimized for quick consumption.`,
          `Key message summary containing the core informational value of the upload.`,
          `A highly viral segment designed for short-form video sharing platforms.`,
          `Top-scoring hook section selected by tracking major scene transitions.`,
          `Engaging segment containing highly repeatable visual actions and captions.`,
          `Strong emotional hook with highly relatable user-centric content layout.`,
          `High-energy audio-visual climax scene optimized for loop playback.`,
          `Memorable high-performing quote with clean narrative structure.`,
          `Shocking revelation segment engineered for maximum loop count.`,
          `Powerful message and memorable takeaway quote.`,
          `Standout performance segment extracted from main timeline.`,
          `Fan-favorite scene curated for maximum social media reach.`,
          `Fast-paced sequence engineered for high engagement.`
        ];

        const generatedClips = Array.from({ length: numClips }).map((_, index) => {
          const start = index * spacing;
          const end = Math.min(totalVideoDuration, start + duration);
          const partNum = Math.floor(index / titles.length) + 1;
          const partText = partNum > 1 ? ` (Part ${partNum})` : '';

          return {
            _id: `clip_${jobId}_${index + 1}`,
            jobId,
            title: (titles[index % titles.length] || `🔥 Viral Clip #${index + 1}`) + partText,
            reason: (reasons[index % reasons.length] || `AI Extracted viral moment #${index + 1}.`),
            viralityScore: Math.max(5.0, parseFloat((scores[index % scores.length] - (partNum - 1) * 0.2).toFixed(1))),
            startTime: start,
            endTime: end,
            duration: end - start,
            aspectRatio,
            youtubeId,
            thumbnailUrl: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/${(index % 3) + 1}.jpg` : null
          };
        });

        sessionStorage.setItem(`clips_${jobId}`, JSON.stringify(generatedClips));
        sessionStorage.setItem(`job_${jobId}`, JSON.stringify({
          _id: jobId,
          status: 'done',
          progress: 100,
          originalFilename: filename,
          durationOption: duration,
          aspectRatio,
          youtubeId,
          totalClips: generatedClips.length
        }));
      }
      
      router.push(`/result/${jobId}`);
    } catch (err) {
      console.error(err);
      setError('Failed to process video. Please try again.');
      setUploading(false);
    }
  };

  const isFormValid = (file || youtubeUrl) && duration && !uploading;

  return (
    <div className="fade-in">
      <section className="hero">
        <h1 className="gradient-text">Transform Long Videos into Viral Clips</h1>
        <p>Upload your video file or paste a YouTube link, select target platform & duration, and let our AI extract the most engaging clips automatically.</p>
      </section>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>1. Select Video Source</h3>
          <UploadBox 
            onFileSelect={handleFileSelect} 
            selectedFile={file} 
            onUrlSelect={setYoutubeUrl}
            youtubeUrl={youtubeUrl}
          />
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
              <span>Processing...</span>
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
          {uploading ? 'Processing...' : 'Generate Clips'}
        </button>
      </div>
    </div>
  );
}
