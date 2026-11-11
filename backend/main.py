import base64
import os
import time
import uuid
from pathlib import Path
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, status, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from backend.models import (
    ChatRequest,
    ChatResponse,
    ContextModel,
    ContextResponse,
    VisionAnalyzeRequest,
    VisionAnalyzeResponse,
    DocumentUploadResponse,
    ActionExecuteRequest,
    ActionExecuteResponse,
)
from backend.services.gemini_service import generate_response, analyze_image
from backend.services.document_service import (
    extract_text_from_file,
    chunk_document_text,
    estimate_token_count,
    retrieve_relevant_chunks,
)
from backend.services.tool_service import execute_tool


# Initialize startup time and in-memory storage
START_TIME = time.time()
CONTEXT_STORE: dict[str, dict] = {}
DOCUMENT_STORE: dict[str, list[dict]] = {}


app = FastAPI(
    title="MIRA Multimodal Agent Backend",
    description="Real-time Voice, Vision, and Multimodal Agent Service (AI Build Challenge 2026 PS-05)",
    version="0.1.0",
)

# CORS Configuration for Frontend Connectivity
allowed_origins_raw = os.getenv("CORS_ORIGINS", "*")
origins = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in origins or not origins else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def build_grounded_prompt(
    user_message: str,
    session_id: str,
    my_day_context: Optional[Dict[str, Any]] = None,
    client_documents: Optional[List[Dict[str, Any]]] = None,
) -> str:
    """Build RAG-augmented prompt incorporating active document chunks, My Day live schedule, and visual context."""
    ctx = CONTEXT_STORE.get(session_id, {})

    # Collect documents across this session, shared companion session, and all active stores
    collected_docs: List[Dict[str, Any]] = []
    seen_ids = set()

    def add_doc(doc: Dict[str, Any]):
        if not isinstance(doc, dict):
            return
        did = str(doc.get("document_id") or doc.get("id") or doc.get("filename") or doc.get("name") or "")
        if did and did in seen_ids:
            return
        if did:
            seen_ids.add(did)
        collected_docs.append(doc)

    # 1. Documents in current session
    for d in DOCUMENT_STORE.get(session_id, []):
        add_doc(d)

    # 2. Documents in shared companion session
    for d in DOCUMENT_STORE.get("mira-session-companion", []):
        add_doc(d)

    # 3. Documents anywhere in DOCUMENT_STORE
    for sid_key, doc_list in DOCUMENT_STORE.items():
        if isinstance(doc_list, list):
            for d in doc_list:
                add_doc(d)

    # 4. Client documents passed in request
    if client_documents and isinstance(client_documents, list):
        for cd in client_documents:
            if isinstance(cd, dict):
                norm_doc = {
                    "document_id": cd.get("id") or cd.get("document_id") or f"client-doc-{len(collected_docs)}",
                    "filename": cd.get("name") or cd.get("filename") or "Document",
                    "summary": cd.get("summary") or cd.get("snippet") or "",
                    "content_snippet": cd.get("snippet") or cd.get("content") or cd.get("summary") or "",
                    "full_text": cd.get("full_text") or cd.get("content") or "",
                    "token_count": cd.get("tokenCount") or cd.get("token_count") or 100,
                    "chunks": cd.get("chunks") or [],
                }
                add_doc(norm_doc)

    parts = []

    # === RAG & NLP DOCUMENT RETRIEVAL ===
    if collected_docs:
        parts.append("=== RETRIEVED DOCUMENT KNOWLEDGE (RAG & NLP) ===")
        parts.append(f"Total Available Ingested Documents: {len(collected_docs)}")
        for d in collected_docs[-10:]:
            fname = d.get('filename') or d.get('name') or 'Document'
            toks = d.get('token_count') or d.get('tokenCount') or 0
            summ = d.get('summary', '')
            parts.append(f"• Document: {fname} (Tokens: ~{toks})")
            if summ:
                parts.append(f"  Summary: {summ}")

        # Semantic chunk retrieval via NLP relevance
        retrieved_chunks = retrieve_relevant_chunks(user_message, collected_docs, top_k=6, max_chars=3000)
        if retrieved_chunks:
            parts.append("\n--- Most Relevant Semantic Excerpts (NLP Ranked) ---")
            for idx, ch in enumerate(retrieved_chunks, 1):
                doc_name = ch.get("filename", "Unknown Document")
                content = ch.get("content", "").strip()
                score = ch.get("score", 0.0)
                parts.append(f"[{idx}] Source: {doc_name} (Relevance Score: {score:.1f}):\n\"{content}\"")
        parts.append("==================================================")

    # === MY DAY PLANNER, SCHEDULE & SECRET DIARY ===
    active_my_day = my_day_context or ctx.get("my_day") or CONTEXT_STORE.get("mira-session-companion", {}).get("my_day")
    if active_my_day and isinstance(active_my_day, dict):
        parts.append("=== USER'S LIVE SCHEDULE, TASKS & MY DAY PLANNER ===")
        date_str = active_my_day.get("date_str") or datetime.now(timezone.utc).strftime("%A, %B %d, %Y")
        parts.append(f"Today's Date: {date_str}")

        stats = active_my_day.get("stats", {})
        if stats:
            parts.append(
                f"Task Progress: {stats.get('completed', 0)}/{stats.get('total', 0)} tasks completed "
                f"({stats.get('percentage', 0)}% done). Pending: {stats.get('pending', 0)}."
            )

        # Today's Tasks
        today_tasks = active_my_day.get("today_tasks", [])
        if today_tasks:
            parts.append("\nToday's Tasks:")
            for t in today_tasks:
                status_icon = "✓ [Completed]" if t.get("completed") else "⏳ [Pending]"
                prio = str(t.get("priority", "medium")).upper()
                due = f" (Due: {t.get('dueTime')})" if t.get("dueTime") else ""
                cat = f" [{t.get('category')}]" if t.get("category") else ""
                parts.append(f"  - {status_icon} {t.get('title')}{cat}{due} [Priority: {prio}]")

        # Upcoming Tasks
        upcoming_tasks = active_my_day.get("upcoming_tasks", [])
        if upcoming_tasks:
            parts.append("\nUpcoming Scheduled Tasks:")
            for t in upcoming_tasks:
                status_icon = "✓ [Completed]" if t.get("completed") else "⏳ [Pending]"
                prio = str(t.get("priority", "medium")).upper()
                due = f" (Date: {t.get('dueDate', 'Upcoming')})"
                parts.append(f"  - {status_icon} {t.get('title')}{due} [Priority: {prio}]")

        # Today's Schedule & Events Timeline
        events = active_my_day.get("events", [])
        if events:
            parts.append("\nToday's Calendar & Schedule:")
            for e in events:
                loc = f" @ {e.get('location')}" if e.get('location') else ""
                etype = f" ({e.get('type')})" if e.get('type') else ""
                parts.append(f"  - ⏰ {e.get('time')}: {e.get('title')}{etype}{loc}")

        # Active & Urgent Reminders
        reminders = active_my_day.get("reminders", [])
        if reminders:
            parts.append("\nActive Reminders:")
            for r in reminders:
                urg = " 🔥 [URGENT]" if r.get("urgent") or r.get("priority") == "urgent" else ""
                rep = f" ({r.get('repeat')})" if r.get("repeat") else ""
                status_str = " (Dismissed)" if r.get("dismissed") or r.get("completed") else ""
                parts.append(f"  - 🔔 {r.get('time')}: {r.get('title')}{urg}{rep}{status_str}")

        # Secret Diary Reflections
        reflections = active_my_day.get("reflections", [])
        if reflections:
            parts.append("\nDaily Reflections & Mood:")
            for ref in reflections[-3:]:
                mood = f" [Mood: {ref.get('mood')} {ref.get('moodLabel', '')}]" if ref.get('mood') else ""
                parts.append(f"  - {ref.get('dateStr', 'Today')}{mood}: \"{ref.get('text', '')[:200]}\"")

        parts.append("====================================================")

    # 3. Vision grounding anchors
    anchors = ctx.get("active_anchors", [])
    vision_anchors = [a for a in anchors if isinstance(a, dict) and a.get("modality") == "vision"]
    if vision_anchors:
        parts.append("=== ACTIVE VISION CONTEXT ANCHORS ===")
        for va in vision_anchors[-3:]:
            parts.append(f"- Visual Scene: {va.get('summary', va.get('title'))}")
        parts.append("=====================================")

    if parts:
        context_block = "\n".join(parts)
        return (
            f"You are MIRA, the intelligent, friendly, real-time Multimodal AI Companion.\n"
            f"You have comprehensive access to the user's workspace, including their live My Day schedule, "
            f"tasks, reminders, calendar events, personal reflections, and all uploaded documents via RAG (Retrieval-Augmented Generation).\n\n"
            f"GROUNDING RULES:\n"
            f"1. When the user asks about their schedule, what they have to do today, upcoming tasks, pending work, or reminders, "
            f"reference the 'LIVE SCHEDULE, TASKS & MY DAY PLANNER' section directly and give them clear, helpful, encouraging guidance.\n"
            f"2. When the user asks about uploaded documents, files, content, or data, answer accurately using the "
            f"'RETRIEVED DOCUMENT KNOWLEDGE' and semantic excerpts. Cite the document filename when relevant.\n"
            f"3. Be proactive, warm, and structured (use bullet points or emojis where appropriate for clarity).\n\n"
            f"MULTIMODAL CONTEXT:\n"
            f"{context_block}\n\n"
            f"User Prompt: {user_message}\n\n"
            f"MIRA Assistant Response:"
        )
    return user_message


@app.get("/")
def read_root():
    dist_dir = Path(__file__).resolve().parent.parent / "dist"
    index_file = dist_dir / "index.html"
    if index_file.exists():
        from fastapi.responses import FileResponse
        return FileResponse(index_file)
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
            "vision": "ready",
            "document_rag": "ready",
            "tool_sandbox": "ready",
        },
    }


@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest) -> ChatResponse:
    """Generate assistant reply via Gemini LLM service with ContextCore, My Day & RAG grounding."""
    session_id = request.session_id if request.session_id else "mira-session-companion"

    # Persist live My Day context if provided in request
    if request.my_day_context:
        ctx = CONTEXT_STORE.setdefault(session_id, {"session_id": session_id})
        ctx["my_day"] = request.my_day_context
        companion_ctx = CONTEXT_STORE.setdefault("mira-session-companion", {"session_id": "mira-session-companion"})
        companion_ctx["my_day"] = request.my_day_context

    prompt_to_send = build_grounded_prompt(
        request.message,
        session_id,
        my_day_context=request.my_day_context,
        client_documents=request.documents_context,
    )

    try:
        reply_text = generate_response(prompt_to_send)
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


@app.post("/api/myday/sync")
def sync_myday_endpoint(payload: Dict[str, Any]):
    """Sync My Day tasks, schedule, reminders and reflections directly into ContextCore."""
    now = datetime.now(timezone.utc).isoformat()
    sid = payload.get("session_id") or "mira-session-companion"
    my_day_data = payload.get("my_day_context") or payload

    for target_sid in [sid, "mira-session-companion"]:
        ctx = CONTEXT_STORE.setdefault(target_sid, {"session_id": target_sid, "created_at": now})
        ctx["my_day"] = my_day_data
        ctx["updated_at"] = now
        ctx["working_memory_summary"] = "My Day schedule and tasks synchronized with MIRA."

    return {
        "status": "success",
        "session_id": sid,
        "message": "My Day schedule synchronized with MIRA ContextCore",
        "timestamp": now,
    }


@app.post("/api/vision/analyze", response_model=VisionAnalyzeResponse)
def vision_analyze_endpoint(request: VisionAnalyzeRequest) -> VisionAnalyzeResponse:
    """Analyze a visual frame (webcam, screen share, or uploaded image) using Gemini Multimodal Vision."""
    now = datetime.now(timezone.utc).isoformat()
    session_id = request.session_id if request.session_id else f"mira-{uuid.uuid4().hex[:8]}"

    # Decode base64 payload
    raw_b64 = request.image_base64.strip()
    if "," in raw_b64:
        raw_b64 = raw_b64.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(raw_b64)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Base64 image payload: {str(err)}",
        )

    try:
        analysis_result = analyze_image(
            image_bytes=image_bytes,
            mime_type=request.mime_type or "image/jpeg",
            prompt=request.prompt,
        )
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
            detail=f"Gemini Vision API error: {str(err)}",
        )

    description = analysis_result.get("description", "Visual scene analyzed.")
    detected_objects = analysis_result.get("detected_objects", [])
    ocr_snippets = analysis_result.get("ocr_snippets", [])

    visual_anchor = {
        "id": f"anchor-vision-{uuid.uuid4().hex[:6]}",
        "modality": "vision",
        "title": f"Visual Scene: {description[:40]}...",
        "source": "Vision Frame Ingestion",
        "summary": description,
        "token_weight": 350,
        "detected_count": len(detected_objects),
        "ocr_count": len(ocr_snippets),
        "created_at": now,
    }

    # Automatically persist visual grounding into ContextCore memory
    existing_ctx = CONTEXT_STORE.get(session_id, {})
    anchors = list(existing_ctx.get("active_anchors", []))
    anchors.append(visual_anchor)

    modalities = dict(existing_ctx.get("modalities", {}))
    modalities["vision"] = {
        "status": "active",
        "last_analyzed": now,
        "objects_count": len(detected_objects),
        "ocr_count": len(ocr_snippets),
    }

    merged = {
        **existing_ctx,
        "session_id": session_id,
        "active_anchors": anchors,
        "modalities": modalities,
        "working_memory_summary": f"Visual context updated: {description[:100]}",
        "updated_at": now,
    }
    if "created_at" not in merged:
        merged["created_at"] = now

    CONTEXT_STORE[session_id] = merged

    return VisionAnalyzeResponse(
        session_id=session_id,
        description=description,
        detected_objects=detected_objects,
        ocr_snippets=ocr_snippets,
        anchors=[visual_anchor],
        timestamp=now,
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


@app.post("/api/documents/upload", response_model=DocumentUploadResponse)
async def upload_document_endpoint(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
) -> DocumentUploadResponse:
    """Ingest, extract text, chunk, and anchor a document into ContextCore and RAG store."""
    now = datetime.now(timezone.utc).isoformat()
    sid = session_id if session_id else "mira-session-companion"

    try:
        file_bytes = await file.read()
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(err)}",
        )

    filename = file.filename or "uploaded_doc.txt"
    extracted_text = extract_text_from_file(filename, file_bytes)
    chunks = chunk_document_text(extracted_text)
    token_count = estimate_token_count(extracted_text)
    doc_id = f"doc-{uuid.uuid4().hex[:8]}"

    summary = f"Ingested {filename} ({len(file_bytes)} bytes, ~{token_count} tokens). {len(chunks)} semantic chunks."
    snippet = extracted_text[:800] if extracted_text else "Document is empty."

    anchor = {
        "id": f"anchor-doc-{uuid.uuid4().hex[:6]}",
        "modality": "documents",
        "title": f"Doc: {filename}",
        "source": filename,
        "summary": summary,
        "token_weight": token_count,
        "chunks_count": len(chunks),
        "created_at": now,
    }

    doc_record = {
        "document_id": doc_id,
        "session_id": sid,
        "filename": filename,
        "file_size": len(file_bytes),
        "token_count": token_count,
        "chunks_count": len(chunks),
        "summary": summary,
        "content_snippet": snippet,
        "full_text": extracted_text,
        "chunks": chunks,
        "anchor": anchor,
        "timestamp": now,
    }

    if sid not in DOCUMENT_STORE:
        DOCUMENT_STORE[sid] = []
    DOCUMENT_STORE[sid].append(doc_record)

    # Also store under shared companion session for universal accessibility
    if sid != "mira-session-companion":
        if "mira-session-companion" not in DOCUMENT_STORE:
            DOCUMENT_STORE["mira-session-companion"] = []
        DOCUMENT_STORE["mira-session-companion"].append(doc_record)

    # Sync into ContextCore active anchors
    existing_ctx = CONTEXT_STORE.get(sid, {})
    anchors = list(existing_ctx.get("active_anchors", []))
    anchors.append(anchor)

    modalities = dict(existing_ctx.get("modalities", {}))
    modalities["documents"] = {
        "status": "ready",
        "count": len(DOCUMENT_STORE[sid]),
        "total_tokens": sum(d.get("token_count", 0) for d in DOCUMENT_STORE[sid]),
        "last_upload": now,
    }

    merged = {
        **existing_ctx,
        "session_id": sid,
        "active_anchors": anchors,
        "modalities": modalities,
        "working_memory_summary": f"Context updated with document '{filename}'.",
        "updated_at": now,
    }
    if "created_at" not in merged:
        merged["created_at"] = now

    CONTEXT_STORE[sid] = merged

    return DocumentUploadResponse(**doc_record)


@app.get("/api/documents/{session_id}")
def get_documents_endpoint(session_id: str):
    """Retrieve all ingested documents and chunks for a session."""
    docs = DOCUMENT_STORE.get(session_id, [])
    # If specific session has no docs, also check shared companion store
    if not docs and session_id != "mira-session-companion":
        docs = DOCUMENT_STORE.get("mira-session-companion", [])
    return {"session_id": session_id, "documents": docs, "count": len(docs)}


@app.delete("/api/documents/{session_id}/{document_id}")
def delete_document_endpoint(session_id: str, document_id: str):
    """Delete an ingested document from memory and ContextCore."""
    if session_id in DOCUMENT_STORE:
        DOCUMENT_STORE[session_id] = [
            d for d in DOCUMENT_STORE[session_id] if d.get("document_id") != document_id
        ]
    if "mira-session-companion" in DOCUMENT_STORE:
        DOCUMENT_STORE["mira-session-companion"] = [
            d for d in DOCUMENT_STORE["mira-session-companion"] if d.get("document_id") != document_id
        ]
    return {"session_id": session_id, "deleted_document_id": document_id, "status": "deleted"}


@app.post("/api/actions/execute", response_model=ActionExecuteResponse)
def execute_action_endpoint(request: ActionExecuteRequest) -> ActionExecuteResponse:
    """Execute an approved tool / sandbox script with verification check."""
    now = datetime.now(timezone.utc).isoformat()
    sid = request.session_id if request.session_id else f"mira-{uuid.uuid4().hex[:8]}"

    res = execute_tool(request.tool_name, request.parameters)

    # Record action in ContextCore working memory
    existing_ctx = CONTEXT_STORE.get(sid, {})
    working_memory = list(existing_ctx.get("working_memory", []))
    working_memory.append({
        "sender": "mira_action_engine",
        "action_id": request.action_id,
        "tool_name": request.tool_name,
        "status": res.get("status"),
        "output": res.get("output"),
        "verification_score": res.get("verification_score"),
        "timestamp": now,
    })

    merged = {
        **existing_ctx,
        "session_id": sid,
        "working_memory": working_memory,
        "working_memory_summary": f"Executed tool '{request.tool_name}': {str(res.get('output'))[:100]}",
        "updated_at": now,
    }
    if "created_at" not in merged:
        merged["created_at"] = now
    CONTEXT_STORE[sid] = merged

    return ActionExecuteResponse(
        action_id=request.action_id,
        session_id=sid,
        tool_name=request.tool_name,
        status=res.get("status", "success"),
        output=res.get("output", ""),
        verification_score=res.get("verification_score", 98.0),
        verification_details=res.get("verification_details", {}),
        execution_time_ms=res.get("execution_time_ms", 10.0),
        timestamp=now,
    )


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """Real-time WebSocket endpoint connected to ContextCore, My Day & Gemini LLM."""
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

            # Sync My Day if passed in WebSocket payload
            my_day_ctx = data.get("my_day_context") if isinstance(data, dict) else None
            client_docs = data.get("documents_context") if isinstance(data, dict) else None
            if my_day_ctx:
                session_context["my_day"] = my_day_ctx
                companion_ctx = CONTEXT_STORE.setdefault("mira-session-companion", {"session_id": "mira-session-companion"})
                companion_ctx["my_day"] = my_day_ctx

            CONTEXT_STORE[session_id] = session_context

            # 3. Send grounded prompt to generate_response() with graceful error handling
            grounded_prompt = build_grounded_prompt(
                str(user_prompt),
                session_id,
                my_day_context=my_day_ctx,
                client_documents=client_docs,
            )
            try:
                gemini_reply = generate_response(grounded_prompt)
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


# Mount compiled frontend static assets and provide client-side SPA fallback
dist_dir = Path(__file__).resolve().parent.parent / "dist"
if dist_dir.exists():
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse

    assets_dir = dist_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="frontend_assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("ws") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        target_file = dist_dir / full_path
        if target_file.is_file():
            return FileResponse(str(target_file))
        index_file = dist_dir / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return {"message": "MIRA Frontend active"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
