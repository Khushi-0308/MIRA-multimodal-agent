import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User prompt or transcript message")
    session_id: Optional[str] = Field(
        default=None, description="Active session ID, auto-generated if omitted"
    )


class ChatResponse(BaseModel):
    session_id: str = Field(..., description="Active session ID")
    message: str = Field(..., description="The user's original message")
    response: str = Field(..., description="MIRA's assistant reply")
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 UTC timestamp",
    )


class ContextModel(BaseModel):
    """Pydantic model representing incoming ContextCore session state."""

    model_config = ConfigDict(extra="allow")

    session_id: Optional[str] = Field(
        default=None, description="Active session ID, auto-generated if omitted"
    )
    working_memory_summary: Optional[str] = Field(
        default="", description="Summary of current working memory or dialogue state"
    )
    working_memory: Optional[List[Dict[str, Any]]] = Field(
        default_factory=list, description="Stored messages and events in working memory"
    )
    modalities: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Status and throughput of active modalities"
    )
    active_anchors: Optional[List[Dict[str, Any]]] = Field(
        default_factory=list, description="Pinned context anchors"
    )
    token_budget: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Token budget capacity and usage"
    )
    environment: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Environment and runtime context"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Arbitrary custom metadata attributes"
    )


class ContextResponse(ContextModel):
    """Pydantic model representing persisted ContextCore state with timestamps."""

    session_id: str = Field(..., description="Active session ID")
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 UTC creation timestamp",
    )
    updated_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 UTC timestamp of last update",
    )


class VisionAnalyzeRequest(BaseModel):
    """Request payload for real multimodal visual frame analysis."""

    image_base64: str = Field(
        ..., description="Raw Base64 string or data URL (data:image/jpeg;base64,...) of frame"
    )
    mime_type: Optional[str] = Field(
        default="image/jpeg", description="MIME type of image (e.g. image/jpeg, image/png)"
    )
    prompt: Optional[str] = Field(
        default=None, description="Optional custom prompt or focus for vision grounding"
    )
    session_id: Optional[str] = Field(
        default=None, description="Active session ID for ContextCore sync"
    )


class VisionAnalyzeResponse(BaseModel):
    """Response payload containing real visual scene grounding, objects, and OCR."""

    session_id: str = Field(..., description="Active session ID")
    description: str = Field(..., description="Natural language scene description")
    detected_objects: List[Dict[str, Any]] = Field(
        default_factory=list, description="Visual bounding boxes and classified objects"
    )
    ocr_snippets: List[Dict[str, Any]] = Field(
        default_factory=list, description="Extracted text blocks and locations"
    )
    anchors: List[Dict[str, Any]] = Field(
        default_factory=list, description="ContextCore visual anchors generated"
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 UTC timestamp",
    )


class DocumentUploadResponse(BaseModel):
    """Response payload for ingested document."""

    document_id: str = Field(..., description="Unique document ID")
    session_id: str = Field(..., description="Active session ID")
    filename: str = Field(..., description="Uploaded file name")
    file_size: int = Field(..., description="File size in bytes")
    token_count: int = Field(..., description="Estimated token count")
    chunks_count: int = Field(..., description="Number of semantic chunks")
    summary: str = Field(..., description="Semantic summary of document")
    content_snippet: str = Field(..., description="Preview snippet of extracted text")
    chunks: List[Dict[str, Any]] = Field(
        default_factory=list, description="Semantic chunks with token weights"
    )
    anchor: Dict[str, Any] = Field(
        default_factory=dict, description="ContextCore document anchor"
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 UTC timestamp",
    )


class ActionExecuteRequest(BaseModel):
    """Request payload for executing an action tool."""

    action_id: str = Field(..., description="ID of the action proposal")
    tool_name: str = Field(..., description="Tool name to execute (e.g. python_sandbox, calculate, system_diagnostic)")
    parameters: Dict[str, Any] = Field(
        default_factory=dict, description="Tool execution parameters"
    )
    session_id: Optional[str] = Field(
        default=None, description="Active session ID"
    )


class ActionExecuteResponse(BaseModel):
    """Response payload after executing an action tool."""

    action_id: str = Field(..., description="ID of the action proposal")
    session_id: str = Field(..., description="Active session ID")
    tool_name: str = Field(..., description="Tool executed")
    status: str = Field(..., description="Execution status: 'success' or 'error'")
    output: Any = Field(..., description="Execution stdout/result output")
    verification_score: float = Field(
        ..., description="Verification confidence score (0-100)"
    )
    verification_details: Dict[str, Any] = Field(
        default_factory=dict, description="Post-flight checks and telemetry"
    )
    execution_time_ms: float = Field(..., description="Execution duration in milliseconds")
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 UTC timestamp",
    )



