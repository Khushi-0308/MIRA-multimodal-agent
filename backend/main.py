import os
import time
import uuid
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from backend.models import (
    ChatRequest,
    ChatResponse,
    ContextModel,
    ContextResponse,
)
from backend.services.gemini_service import generate_response


# Initialize startup time and in-memory storage
START_TIME = time.time()
CONTEXT_STORE: dict[str, dict] = {}


app = FastAPI(
    title="MIRA Multimodal Agent Backend",
    description="Real-time Voice, Vision, and Multimodal Agent Service (AI Build Challenge 2026 PS-05)",
    version="0.1.0",
)

# CORS Configuration for Frontend Connectivity
allowed_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
origins = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "message": "Welcome to MIRA Multimodal Agent Backend API",
        "docs_url": "/docs",
        "health_url": "/api/health",
        "ws_url": "/ws/{session_id}",
        "version": "0.1.0",
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint for MIRA backend foundation."""
    uptime_seconds = round(time.time() - START_TIME, 2)
    return {
        "status": "healthy",
        "agent": "MIRA",
        "version": "0.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime_seconds": uptime_seconds,
        "challenge": "AI Build Challenge 2026 PS-05",
        "loop": [
            "HEARS",
            "SEES",
            "UNDERSTANDS",
            "REASONS",
            "ACTS",
            "VERIFIES",
        ],
        "services": {
            "api": "online",
            "context_core": "ready",
            "streaming": "ready",
        },
    }


@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest) -> ChatResponse:
    """Generate assistant reply via Gemini LLM service."""
    session_id = request.session_id if request.session_id else f"mira-{uuid.uuid4().hex[:8]}"

    try:
        reply_text = generate_response(request.message)
    except ValueError as err:
        if "GEMINI_API_KEY" in str(err):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(err),
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini API error: {str(err)}",
        )

    return ChatResponse(
        session_id=session_id,
        message=request.message,
        response=reply_text,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@app.get("/api/context/{session_id}", response_model=ContextResponse)
def get_context(session_id: str) -> ContextResponse:
    """Retrieve ContextCore state for an active session."""
    if session_id not in CONTEXT_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Context for session '{session_id}' not found",
        )
    return ContextResponse(**CONTEXT_STORE[session_id])


@app.post("/api/context", response_model=ContextResponse, status_code=status.HTTP_200_OK)
def save_context(payload: ContextModel) -> ContextResponse:
    """Create or update ContextCore session state in memory."""
    now = datetime.now(timezone.utc).isoformat()
    session_id = payload.session_id if payload.session_id else f"mira-{uuid.uuid4().hex[:8]}"

    existing = CONTEXT_STORE.get(session_id, {})
    new_data = payload.model_dump(exclude_unset=True)

    merged = {**existing, **new_data}
    merged["session_id"] = session_id
    merged["updated_at"] = now
    if "created_at" not in merged:
        merged["created_at"] = now

    context_obj = ContextResponse(**merged)
    CONTEXT_STORE[session_id] = context_obj.model_dump()
    return context_obj


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """Real-time WebSocket endpoint connected to ContextCore and Gemini LLM."""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            now = datetime.now(timezone.utc).isoformat()

            # 1. Retrieve or initialize this session's ContextCore state
            existing = CONTEXT_STORE.get(session_id)
            if existing:
                session_context = dict(existing)
            else:
                session_context = ContextResponse(
                    session_id=session_id,
                    created_at=now,
                    updated_at=now,
                ).model_dump()

            if "working_memory" not in session_context or not isinstance(session_context["working_memory"], list):
                session_context["working_memory"] = []

            # 2. Extract message prompt and store user message in working memory
            if isinstance(data, dict):
                user_prompt = (
                    data.get("message")
                    or data.get("text")
                    or data.get("content")
                    or data.get("prompt")
                    or str(data)
                )
                msg_entry = {"sender": data.get("sender", "user"), "timestamp": now, **data}
            else:
                user_prompt = str(data)
                msg_entry = {"sender": "user", "timestamp": now, "payload": data}

            session_context["working_memory"].append(msg_entry)
            session_context["working_memory_summary"] = f"User: {str(user_prompt)[:120]}"
            session_context["updated_at"] = now
            CONTEXT_STORE[session_id] = session_context

            # 3. Send the message to generate_response() with graceful error handling
            try:
                gemini_reply = generate_response(str(user_prompt))
                gemini_error = None
            except Exception as err:
                gemini_reply = None
                gemini_error = str(err)

            # Store assistant reply in ContextCore working memory if successful
            if gemini_reply:
                now_reply = datetime.now(timezone.utc).isoformat()
                assistant_entry = {
                    "sender": "mira",
                    "role": "assistant",
                    "message": gemini_reply,
                    "timestamp": now_reply,
                }
                session_context["working_memory"].append(assistant_entry)
                session_context["working_memory_summary"] = f"MIRA: {gemini_reply[:120]}"
                session_context["updated_at"] = now_reply
                CONTEXT_STORE[session_id] = session_context

            # 4. Return the Gemini response with the updated context
            if not gemini_error:
                response = {
                    "session_id": session_id,
                    "response": gemini_reply,
                    "message": gemini_reply,
                    "context": session_context,
                    "echo": data,
                }
                if isinstance(data, dict):
                    for k, v in data.items():
                        if k not in response:
                            response[k] = v
            else:
                response = {
                    "session_id": session_id,
                    "response": f"Gemini error: {gemini_error}",
                    "error": gemini_error,
                    "context": session_context,
                    "echo": data,
                }
                if isinstance(data, dict):
                    for k, v in data.items():
                        if k not in response:
                            response[k] = v

            await websocket.send_json(response)
    except WebSocketDisconnect:
        pass


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
