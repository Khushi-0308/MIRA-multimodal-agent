# ==============================================================================
# Multi-Stage Production Dockerfile for MIRA Multimodal Agent
# Stage 1: Build React/Vite Frontend
# Stage 2: Python 3.12+ FastAPI Backend serving API, WebSocket & static frontend
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Frontend Build
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY package*.json tsconfig*.json vite.config.ts index.html ./
RUN npm ci

COPY src/ ./src/
COPY public/ ./public/
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Backend & Full-Stack Runner
# ------------------------------------------------------------------------------
FROM python:3.12-slim AS runner

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/
COPY .env.example ./.env

# Copy built frontend assets from Stage 1 into dist/
COPY --from=frontend-builder /app/dist/ ./dist/

ENV PORT=8000
ENV HOST=0.0.0.0
ENV ENVIRONMENT=production

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Start FastAPI application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
