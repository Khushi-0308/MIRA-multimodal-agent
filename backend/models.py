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

