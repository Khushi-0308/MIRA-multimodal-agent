# 🚀 MIRA Multimodal Agent — Deployment Guide

MIRA is built with a **React + TypeScript + Vite** frontend and a **Python FastAPI** backend powered by the **Google Gemini Multimodal API**.

You have multiple zero-cost deployment options depending on your preference:

---

## 🌟 Option 1: 1-Click Full-Stack Docker Deployment (Recommended on Render / Railway)

Both the frontend and backend are packaged into a single unified production container using the included `Dockerfile`.

### **Deploying on Render:**
1. Push your repository to GitHub: `https://github.com/tisa1101/MIRA-multimodal-agent.git`.
2. Go to [Render Dashboard](https://dashboard.render.com/) and click **New + → Web Service**.
3. Connect your GitHub repository.
4. Set **Environment** to `Docker` (Render will automatically detect the `Dockerfile` or `render.yaml`).
5. Add your Environment Variables:
   - `GEMINI_API_KEY`: `your_gemini_api_key_here`
   - `GEMINI_MODEL`: `gemini-3.5-flash-lite`
   - `PORT`: `8000`
   - `CORS_ORIGINS`: `*`
6. Click **Create Web Service**. Render builds the app and gives you a live URL like `https://mira-multimodal-agent.onrender.com`.

---

## ⚡ Option 2: Deploy Frontend to Vercel + Backend to Render / Railway

### **A. Deploy Frontend to Vercel:**
1. Import your GitHub repository into [Vercel](https://vercel.com/new).
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com` (Your live backend URL)
6. Click **Deploy**. Vercel will deploy your frontend on `https://your-app.vercel.app`.

### **B. Deploy Backend to Render:**
1. On Render, select **New + → Web Service**.
2. Root Directory: `.`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Environment Variables:
   - `GEMINI_API_KEY`: `your_gemini_api_key_here`
   - `GEMINI_MODEL`: `gemini-3.5-flash-lite`
   - `CORS_ORIGINS`: `*`

---

## 🐳 Option 3: Local / Self-Hosted Docker Deployment

Run the entire full-stack app locally in a production container with one command:

```bash
# Set your API key
export GEMINI_API_KEY="your_api_key_here"

# Build and run container
docker-compose up --build
```

Access the app at: **`http://localhost:8000`**

---

## 🔑 Required Environment Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API Key | `AIzaSy...` |
| `GEMINI_MODEL` | Gemini Model Identifier | `gemini-3.5-flash-lite` |
| `PORT` | Web Server Port | `8000` |
| `CORS_ORIGINS` | Allowed Frontend Domains | `*` or `https://your-app.vercel.app` |
| `VITE_API_URL` | Frontend Backend API URL | `http://127.0.0.1:8000` or production URL |
