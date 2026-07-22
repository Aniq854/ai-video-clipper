# 🚀 ClipAI — 1-Step Single Platform Live Deployment Guide

Now you can host both the **Frontend UI** and **Backend AI Clipper** on **1 single platform (Render.com)** with **0 extra configuration**!

---

## ⚙️ Single Platform Setup (Render.com)

1. Go to [Render.com](https://render.com) and log in with GitHub.
2. Click **New +** ➔ **Web Service**.
3. Select your `ai-video-clipper` GitHub repository.
4. Set the following options:
   - **Name:** `clipai-app`
   - **Root Directory:** *(Leave empty / root)*
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   - `MONGODB_URI` = `YOUR_MONGODB_URI`
   - `GEMINI_API_KEY` = `YOUR_GEMINI_API_KEY`
6. Click **Create Web Service**.

---

## 🎉 Live App Ready!

Render will build the Next.js UI and run the Express AI Clipper server together under **one single URL** (e.g. `https://clipai-app.onrender.com`).

No extra Vercel setup or CORS configuration required! 🎬🔥
