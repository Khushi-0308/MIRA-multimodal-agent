# 🌸 MIRA — Multimodal Intelligent Real-Time Assistant
> **AI Build Challenge 2026 — Problem Statement PS-05**  
> *A Living, Reactive Multimodal Companion with Real-Time Voice, Vision Grounding, Document RAG, and Safe Action Execution.*

[![Deploy on Render](https://img.shields.io/badge/Render-Live%20Production-success?logo=render&style=for-the-badge)](https://mira-multimodal-agent.onrender.com/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?logo=github&style=for-the-badge)](https://github.com/Khushi-0308/MIRA-multimodal-agent)
[![Backend Status](https://img.shields.io/badge/FastAPI-Health%20Online-009688?logo=fastapi&style=for-the-badge)](https://mira-multimodal-agent.onrender.com/api/health)
[![API Docs](https://img.shields.io/badge/Swagger-OpenAPI%20Docs-85EA2D?logo=swagger&style=for-the-badge)](https://mira-multimodal-agent.onrender.com/docs)

---

## 🌐 Live Production Deployment

- 🌟 **Live Web App:** **[https://mira-multimodal-agent.onrender.com/](https://mira-multimodal-agent.onrender.com/)**
- 🩺 **Backend Health API:** [https://mira-multimodal-agent.onrender.com/api/health](https://mira-multimodal-agent.onrender.com/api/health)
- 📖 **Interactive Swagger Docs:** [https://mira-multimodal-agent.onrender.com/docs](https://mira-multimodal-agent.onrender.com/docs)
- 🐙 **GitHub Repository:** [https://github.com/Khushi-0308/MIRA-multimodal-agent](https://github.com/Khushi-0308/MIRA-multimodal-agent)

---

## 🏆 Project Overview & 6-Step Loop

MIRA implements a real-time multimodal perception and reasoning loop grounded in a centralized **ContextCore Engine**:

$$\text{HEARS} \longrightarrow \text{SEES} \longrightarrow \text{UNDERSTANDS} \longrightarrow \text{REASONS} \longrightarrow \text{ACTS} \longrightarrow \text{VERIFIES}$$

1. **HEARS (Audio & Voice Stream):** Real-time Voice Activity Detection (VAD), 32-band audio spectrum visualizer, and low-latency speech transcription.
2. **SEES (Multimodal Vision):** Real-time camera ingestion, screen capture, bounding box detection, and OCR snippet extraction powered by Gemini Vision.
3. **UNDERSTANDS (ContextCore):** Unified working memory aggregator tracking token budgets (128k capacity), pinned grounding anchors, and environment telemetry.
4. **REASONS (Gemini Multimodal LLM):** Chain-of-thought planning grounded in retrieved document chunks and visual context.
5. **ACTS (Safe Tool Execution):** User-approved action proposals (Python sandbox code execution, document generation, and system diagnostics).
6. **VERIFIES (Execution Verification):** Real-time execution verification gate confirming action integrity and safety before returning to IDLE.

---

## ✨ Key Features & Capabilities

### 1. 🎭 Reactive MIRA Mascot & 5 Living Worlds
- **Mascot States:** Visibly transitions between `idle`, `listening`, `observing`, `thinking`, `speaking`, `waiting for approval`, `executing`, `verifying`, `completed`, and `error`.
- **5 Immersive World Themes:**
  - 🌸 **Liquid Rose:** Soft fluid petals and dreamy glassmorphism.
  - 🌌 **Midnight:** Deep cosmic constellation space and stardust orbits.
  - ✨ **Glitter:** Y2K cyber sparkle gloss and pearlescent shimmer.
  - ⚡ **Bold:** Neo-pop high-contrast vibrancy and geometric energy.
  - 🧬 **Edge:** Cyberpunk HUD telemetry, scanlines, and neon matrix.
- **Mascot Accessories:** Pure MIRA ✨, Bunny Ears 🐰, Cyber Headset 🎧, Star Clip ⭐, Holo Visor 🥽.

### 2. 👤 Individual Onboarding & Account Management
- **4-Step User Onboarding:** Personal identity, career/organization domain, world/mascot customization, and AI conversation alignment.
- **Real-Time Sticky Profile Preview:** Live preview card updating dynamically with custom avatars and badges.
- **ContextCore Grounding:** Syncs user profile attributes directly into working memory anchors.
- **Multi-User Directory:** Single-click account switcher for multiple individuals on the same device.

### 3. ☀️ "My Day" Personal Home Command Center
- Time-aware personal greetings and context-driven daily insights.
- Interactive task management with completion tracking.
- Visual daily timeline with priority tags and empty-state guidance.

### 4. 📚 Document RAG & Knowledge Hub
- Instant upload and chunking of PDF, DOCX, and TXT files.
- Live token weight estimation and automatic context anchor grounding.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 18, TypeScript, Vite, CSS Custom Properties (Theme Engine), Lucide Icons, Web Speech API, Canvas API.
- **Backend:** Python 3.12, FastAPI, WebSockets, Uvicorn, Pydantic v2, Python-Multipart.
- **AI Models:** Google Gemini 2.0 / Flash Multimodal Vision & Reasoning (`google-genai`).
- **Deployment:** Multi-Stage Docker Container (Node 20 Builder + Python 3.12 Runner) deployed globally on Render.

---

## ⚡ Local Setup & Development

```bash
# 1. Clone repository
git clone https://github.com/Khushi-0308/MIRA-multimodal-agent.git
cd MIRA-multimodal-agent

# 2. Install backend dependencies
pip install -r requirements.txt

# 3. Install frontend dependencies
npm install

# 4. Set Gemini API Key in .env
echo "GEMINI_API_KEY=your_key_here" > .env

# 5. Run backend server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

# 6. Run frontend dev server (in a separate terminal)
npm run dev
```

---

## 🐳 Docker Production Build

```bash
# Build & run full-stack container
docker compose up --build -d
```
Access at `http://localhost:8000`.

---

## 👥 Demo Profiles for Evaluators

- 👑 **Khushi (Founder & CEO, MIRA AI Labs):** `khushi@miralabs.ai`
- 🌟 **Tisa (Lead AI Architect, Neural Labs):** `tisa@neurallabs.io`
- ⚡ **Guest Mode:** Instant 1-click sandbox access without sign-in.

---

© 2026 MIRA Team — AI Build Challenge PS-05. All rights reserved.
