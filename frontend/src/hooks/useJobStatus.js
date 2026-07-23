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

    // Check client-side sessionStorage cache first
    if (typeof window !== 'undefined') {
      const cachedJob = sessionStorage.getItem(`job_${jobId}`);
      const cachedClips = sessionStorage.getItem(`clips_${jobId}`);
      if (cachedJob && cachedClips) {
        setJob(JSON.parse(cachedJob));
        setClips(JSON.parse(cachedClips));
        setLoading(false);
        return;
      }
    }

    let interval;
    
    const fetchStatus = async () => {
      try {
        const jobData = await api.getJobStatus(jobId);
        setJob(jobData);
        
        if (jobData.status === 'done') {
          const clipsData = await api.getJobClips(jobId);
          setClips(clipsData);
          setLoading(false);
          if (interval) clearInterval(interval);
        } else if (jobData.status === 'failed') {
          setError('Video processing failed.');
          setLoading(false);
          if (interval) clearInterval(interval);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch job status.');
        setLoading(false);
        if (interval) clearInterval(interval);
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 3000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [jobId]);

  return { job, clips, loading, error };
}
