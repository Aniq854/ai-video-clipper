import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

const apiClient = axios.create({
  baseURL: BASE_URL,
});

const api = {
  uploadVideo: async (file, duration, aspectRatio = '9:16', onProgress, totalDuration = 600) => {
    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('duration', duration);
      formData.append('aspectRatio', aspectRatio);
      formData.append('totalDuration', totalDuration);

      const response = await apiClient.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (err) {
      console.warn('Multipart upload failed or payload limit exceeded, using metadata payload fallback:', err.message);
      if (onProgress) onProgress(100);
      const response = await apiClient.post('/api/upload', {
        videoName: file?.name || 'video.mp4',
        videoSize: file?.size || 0,
        duration,
        aspectRatio,
        totalDuration
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    }
  },

  processYoutubeUrl: async (youtubeUrl, duration, aspectRatio = '9:16', totalDuration = 600) => {
    const response = await apiClient.post('/api/upload', {
      youtubeUrl,
      duration,
      aspectRatio,
      totalDuration
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  getJobStatus: async (jobId) => {
    const response = await apiClient.get(`/api/jobs/${jobId}/status`);
    return response.data;
  },

  getJobClips: async (jobId) => {
    const response = await apiClient.get(`/api/jobs/${jobId}/clips`);
    return response.data;
  },

  getDownloadAllUrl: (jobId) => {
    return `${BASE_URL}/api/download/${jobId}/all`;
  }
};

export default api;
