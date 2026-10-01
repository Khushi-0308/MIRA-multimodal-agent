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
    this.baseUrl = baseUrl || metaEnv?.VITE_API_URL || 'http://127.0.0.1:8000';
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
}

export const apiClient = new MiraApiClient();
