# 🎬 ClipAI — AI Video Clipping Tool

AI-powered tool that analyzes long videos, finds the most engaging moments, and automatically generates short viral clips (20s/30s/40s/60s).

## ✨ Features

- 🎥 **Upload any video** (MP4, MOV, MKV, AVI, WebM)
- 🤖 **AI-powered analysis** using Google Gemini to find viral moments
- 🎙️ **Auto transcription** using local Whisper (FREE, offline)
- ✂️ **Smart clip cutting** with FFmpeg — no mid-sentence cuts
- 📊 **Virality scoring** — each clip rated 1-10
- 📥 **Download individual clips** or all as ZIP
- 🖥️ **Premium dark UI** with real-time progress tracking

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (React) |
| Backend | Express.js |
| AI Analysis | Google Gemini API |
| Transcription | Local Whisper (Python, FREE) |
| Video Processing | FFmpeg |
| Job Queue | BullMQ + Redis |
| Database | MongoDB |

## 📋 Prerequisites

Before starting, make sure you have:

- [Node.js](https://nodejs.org/) v18+
- [Python](https://python.org/) 3.9+
- [FFmpeg](https://ffmpeg.org/download.html) (must be in PATH)
- [Docker](https://docker.com/) (for MongoDB + Redis)
- [Google Gemini API Key](https://aistudio.google.com/apikey)

## 🚀 Quick Start

### 1. Start MongoDB & Redis (Docker)

```bash
docker-compose up -d
```

### 2. Install Whisper (one-time)

```bash
pip install openai-whisper
python scripts/setup_whisper.py
```

### 3. Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
npm install
```

### 4. Setup Frontend

```bash
cd frontend
npm install
```

### 5. Run the App

Open 3 terminals:

**Terminal 1 — Backend API:**
```bash
cd backend
npm start
```

**Terminal 2 — Background Worker:**
```bash
cd backend
npm run worker
```

**Terminal 3 — Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Open in Browser

Go to: **http://localhost:3000**

## 📁 Project Structure

```
Clipping Tool/
├── frontend/          # Next.js 14 UI
│   └── src/
│       ├── app/       # Pages (upload, results)
│       ├── components/# UI components
│       ├── hooks/     # Custom hooks
│       └── services/  # API client
│
├── backend/           # Express.js API + Worker
│   └── src/
│       ├── routes/    # API endpoints
│       ├── models/    # MongoDB schemas
│       ├── services/  # FFmpeg, Whisper, Gemini
│       ├── queue/     # BullMQ config
│       └── worker/    # Background processor
│
├── storage/           # Video & clip storage
├── scripts/           # Setup utilities
├── docker-compose.yml # MongoDB + Redis
└── README.md
```

## 🔧 Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/video-clipper
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
GEMINI_API_KEY=your_api_key_here
WHISPER_MODEL=base
STORAGE_PATH=../storage
```

## 💰 Cost

| Service | Cost |
|---|---|
| Whisper (Local) | **FREE** |
| Gemini API | **FREE** (1500 req/day) or ~$0.005/video |
| FFmpeg | **FREE** |

## 📝 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload` | Upload video + select duration |
| GET | `/api/jobs/:id/status` | Check processing status |
| GET | `/api/jobs/:id/clips` | Get generated clips |
| GET | `/api/preview/:clipId` | Stream clip preview |
| GET | `/api/download/:clipId` | Download single clip |
| GET | `/api/download/:jobId/all` | Download all as ZIP |

## ⚠️ Notes

- Long videos (1hr+) will take several minutes to process on CPU
- GPU significantly speeds up Whisper transcription
- Original videos are kept in storage — set up cleanup as needed
- For production, use S3/R2 for storage instead of local filesystem
