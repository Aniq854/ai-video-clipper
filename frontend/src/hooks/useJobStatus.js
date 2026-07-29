'use client';

import { useState, useEffect } from 'react';
import api from '../services/api';

export default function useJobStatus(jobId) {
  const [job, setJob] = useState(null);
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!jobId) return;

    let interval;
    let isMounted = true;

    // Load from sessionStorage immediately for instant display
    if (typeof window !== 'undefined') {
      const cachedJob = sessionStorage.getItem(`job_${jobId}`);
      const cachedClips = sessionStorage.getItem(`clips_${jobId}`);
      if (cachedJob && cachedClips) {
        setJob(JSON.parse(cachedJob));
        setClips(JSON.parse(cachedClips));
        setLoading(false);
      }
    }

    // Always try to fetch from backend (for real AI-generated clips)
    const fetchStatus = async () => {
      try {
        const jobData = await api.getJobStatus(jobId);
        if (!isMounted) return;
        
        if (jobData.status === 'done') {
          const clipsData = await api.getJobClips(jobId);
          if (!isMounted) return;
          
          // Backend returned real AI clips — update state and cache
          setJob(jobData);
          setClips(clipsData);
          setLoading(false);
          if (interval) clearInterval(interval);

          // Update sessionStorage with real AI data
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(`job_${jobId}`, JSON.stringify(jobData));
            sessionStorage.setItem(`clips_${jobId}`, JSON.stringify(clipsData));
          }
        } else if (jobData.status === 'failed') {
          if (!isMounted) return;
          // Backend processing failed — keep showing cached clips if available
          setJob(prev => prev || jobData);
          setLoading(false);
          if (interval) clearInterval(interval);
        } else {
          if (!isMounted) return;
          // Still processing — update job status but keep cached clips visible
          setJob(prev => ({ ...(prev || {}), ...jobData }));
          setLoading(false);
        }
      } catch (err) {
        // Backend unreachable — use cached data silently
        if (!isMounted) return;
        console.warn('Backend fetch failed, using cached data:', err.message);
        setLoading(false);
        if (interval) clearInterval(interval);
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 3000);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [jobId]);

  return { job, clips, loading, error };
}
