'use client';

import { useState, useEffect } from 'react';
import api from '../services/api';

export default function useJobStatus(jobId) {
  const [job, setJob] = useState({ status: 'processing', progress: 10 });
  const [clips, setClips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!jobId) return;

    let interval;
    let isMounted = true;
    let consecutiveFailures = 0;

    const fetchStatus = async () => {
      try {
        const jobData = await api.getJobStatus(jobId);
        if (!isMounted) return;

        consecutiveFailures = 0;

        if (jobData.status === 'done') {
          try {
            const clipsData = await api.getJobClips(jobId);
            if (!isMounted) return;
            setJob(jobData);
            setClips(clipsData);
            setLoading(false);
            if (interval) clearInterval(interval);
          } catch (clipErr) {
            console.warn('Clips fetch retry:', clipErr.message);
          }
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
        consecutiveFailures++;
        console.warn(`Job status poll warning (${consecutiveFailures}/10):`, err.message);

        if (consecutiveFailures >= 10) {
          setError('Failed to fetch job status. Make sure the backend server is running.');
          setLoading(false);
          if (interval) clearInterval(interval);
        }
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
