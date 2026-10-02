/**
 * MIRA Frontend REST API Client
 * Connects to Phase 2 FastAPI backend (default: http://127.0.0.1:8000)
 */

export interface HealthCheckResponse {
  status: string;
  agent: string;
  version: string;
  timestamp: string;
  uptime_seconds: number;
  challenge: string;
  loop: string[];
  services: {
    api: string;
    context_core: string;
    streaming: string;
  };
}

export interface ChatRequestPayload {
  message: string;
  session_id?: string;
}

export interface ChatResponsePayload {
  session_id: string;
  message: string;
  response: string;
  timestamp: string;
}

export interface ContextResponsePayload {
  session_id: string;
  working_memory_summary?: string;
  working_memory?: Array<Record<string, unknown>>;
  modalities?: Record<string, unknown>;
  active_anchors?: Array<Record<string, unknown>>;
  token_budget?: Record<string, unknown>;
  environment?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export class MiraApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    const metaEnv =
      typeof import.meta !== 'undefined'
        ? (import.meta as unknown as { env?: Record<string, string> }).env
        : undefined;

    let defaultUrl = 'http://127.0.0.1:8000';
    if (
      typeof window !== 'undefined' &&
      window.location &&
      window.location.hostname &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      defaultUrl = window.location.origin;
    }

    this.baseUrl = (baseUrl || metaEnv?.VITE_API_URL || defaultUrl).replace(/\/+$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  /**
   * Check backend health and agent foundation status
   */
  public async checkHealth(): Promise<HealthCheckResponse> {
    const res = await fetch(`${this.baseUrl}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`Health check failed [${res.status}]: ${errText}`);
    }
    return res.json();
  }

  /**
   * Send a chat message to the Gemini-backed chat endpoint
   */
  public async sendChatMessage(message: string, sessionId?: string): Promise<ChatResponsePayload> {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, session_id: sessionId }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`Chat request failed [${res.status}]: ${errText}`);
    }
    return res.json();
  }

  /**
   * Retrieve ContextCore state for a given session
   */
  public async getContext(sessionId: string): Promise<ContextResponsePayload> {
    const res = await fetch(`${this.baseUrl}/api/context/${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`Get context failed [${res.status}]: ${errText}`);
    }
    return res.json();
  }

  /**
   * Create or update ContextCore state in memory
   */
  public async saveContext(payload: Record<string, unknown>): Promise<ContextResponsePayload> {
    const res = await fetch(`${this.baseUrl}/api/context`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`Save context failed [${res.status}]: ${errText}`);
    }
    return res.json();
  }

  /**
   * Analyze a real image / video frame using Gemini Multimodal Vision
   */
  public async analyzeVision(
    imageBase64: string,
    mimeType: string = 'image/jpeg',
    prompt?: string,
    sessionId?: string
  ): Promise<{
    session_id: string;
    description: string;
    detected_objects: Array<{
      id: string;
      label: string;
      confidence: number;
      box: [number, number, number, number];
      category: 'ui_element' | 'text_block' | 'human_face' | 'physical_object' | 'error_region';
    }>;
    ocr_snippets: Array<{ id: string; text: string; location: string }>;
    anchors: Array<Record<string, unknown>>;
    timestamp: string;
  }> {
    const res = await fetch(`${this.baseUrl}/api/vision/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_base64: imageBase64,
        mime_type: mimeType,
        prompt,
        session_id: sessionId,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`Vision analysis failed [${res.status}]: ${errText}`);
    }
    return res.json();
  }

  /**
   * Upload and ingest a real document (PDF, DOCX, TXT, MD, etc.) into ContextCore
   */
  public async uploadDocument(

    file: File,
    sessionId?: string
  ): Promise<{
    document_id: string;
    session_id: string;
    filename: string;
    file_size: number;
    token_count: number;
    chunks_count: number;
    summary: string;
    content_snippet: string;
    chunks: Array<{
      chunk_id: string;
      index: number;
      word_count: number;
      token_weight: number;
      content: string;
    }>;
    anchor: Record<string, unknown>;
    timestamp: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    if (sessionId) {
      formData.append('session_id', sessionId);
    }

    const res = await fetch(`${this.baseUrl}/api/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`Document upload failed [${res.status}]: ${errText}`);
    }
    return res.json();
  }

  /**
   * Retrieve all ingested documents for a session
   */
  public async getDocuments(sessionId: string): Promise<{
    session_id: string;
    documents: Array<Record<string, unknown>>;
    count: number;
  }> {
    const res = await fetch(`${this.baseUrl}/api/documents/${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`Get documents failed [${res.status}]: ${errText}`);
    }
    return res.json();
  }

  /**
   * Delete an ingested document from ContextCore
   */
  public async deleteDocument(
    sessionId: string,
    documentId: string
  ): Promise<{ session_id: string; deleted_document_id: string; status: string }> {
    const res = await fetch(
      `${this.baseUrl}/api/documents/${encodeURIComponent(sessionId)}/${encodeURIComponent(documentId)}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`Delete document failed [${res.status}]: ${errText}`);
    }
    return res.json();
  }

  /**
   * Execute an approved action tool / Python sandbox script
   */
  public async executeAction(
    actionId: string,
    toolName: string,
    parameters: Record<string, unknown> = {},
    sessionId?: string
  ): Promise<{
    action_id: string;
    session_id: string;
    tool_name: string;
    status: string;
    output: unknown;
    verification_score: number;
    verification_details: Record<string, unknown>;
    execution_time_ms: number;
    timestamp: string;
  }> {
    const res = await fetch(`${this.baseUrl}/api/actions/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action_id: actionId,
        tool_name: toolName,
        parameters,
        session_id: sessionId,
      }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`Action execution failed [${res.status}]: ${errText}`);
    }
    return res.json();
  }
}

export const apiClient = new MiraApiClient();


