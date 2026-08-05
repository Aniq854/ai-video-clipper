import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://clipai-server.onrender.com';

const apiClient = axios.create({
  baseURL: BASE_URL,
});

const api = {
  uploadVideo: async (file, duration, aspectRatio = '9:16', onProgress) => {
    const CHUNK_SIZE = 3 * 1024 * 1024; // 3MB chunks to bypass Render 30s timeout

    if (file.size <= CHUNK_SIZE) {
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
            onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });
      return response.data;
    }

    // Chunked upload for files larger than 3MB
    const uploadId = `up_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let finalData = null;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunk', chunk, `chunk_${i}.bin`);
      formData.append('uploadId', uploadId);
      formData.append('chunkIndex', i);
      formData.append('totalChunks', totalChunks);
      formData.append('duration', duration);
      formData.append('aspectRatio', aspectRatio);

      const response = await apiClient.post('/api/upload/chunk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      finalData = response.data;
      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalChunks) * 100));
      }
    }

    return finalData;
  },

  processYoutubeUrl: async (youtubeUrl, duration, aspectRatio = '9:16') => {
    const response = await apiClient.post('/api/youtube', {
      youtubeUrl,
      duration,
      aspectRatio,
    }, {
      headers: {
        'Content-Type': 'application/json',
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
