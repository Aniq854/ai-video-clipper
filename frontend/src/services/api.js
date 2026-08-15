import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://2da170ee053354e2-139-135-36-186.serveousercontent.com';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'serveo-skip-browser-warning': 'true'
  }
});

const api = {
  warmupServer: async () => {
    try {
      await apiClient.get('/api/health', { timeout: 15000 });
    } catch (e) {
      // Ignore background warmup ping errors
    }
  },

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

      // Send chunk with up to 3 automatic retries if network drops
      let attempts = 0;
      let response = null;
      while (attempts < 3) {
        try {
          response = await apiClient.post('/api/upload/chunk', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          break;
        } catch (err) {
          attempts++;
          if (attempts >= 3) throw err;
          await new Promise(r => setTimeout(r, 1000));
        }
      }

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
