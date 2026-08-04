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

    const fetchStatus = async () => {
      try {
        const jobData = await api.getJobStatus(jobId);
        if (!isMounted) return;

        if (jobData.status === 'done') {
          const clipsData = await api.getJobClips(jobId);
          if (!isMounted) return;

          setJob(jobData);
          setClips(clipsData);
          setLoading(false);
          if (interval) clearInterval(interval);
        } else if (jobData.status === 'failed') {
          setJob(jobData);
          setError(jobData.error || 'Video processing failed.');
          setLoading(false);
          if (interval) clearInterval(interval);
        } else {
          setJob(jobData);
          setLoading(false);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to fetch job status:', err);
        setError('Failed to fetch job status. Make sure the backend server is running.');
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
