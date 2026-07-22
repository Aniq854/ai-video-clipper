import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: BASE_URL,
});

const api = {
  uploadVideo: async (file, duration, aspectRatio = '9:16', onProgress) => {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('duration', duration);
    formData.append('aspectRatio', aspectRatio);

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
