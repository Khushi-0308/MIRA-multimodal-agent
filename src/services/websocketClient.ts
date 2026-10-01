/**
 * MIRA Frontend WebSocket Client Layer
 * Connects to Phase 2 FastAPI WebSocket: ws://127.0.0.1:8000/ws/{session_id}
 */

export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WebSocketMessagePayload {
  session_id?: string;
  response?: string;
  message?: string;
  context?: Record<string, unknown>;
  echo?: unknown;
  error?: string;
  type?: string;
  [key: string]: unknown;
}

export type MessageListener = (data: WebSocketMessagePayload) => void;
export type StatusListener = (status: WebSocketStatus) => void;
export type ErrorListener = (error: Event | Error) => void;

export interface WebSocketClientOptions {
  wsBaseUrl?: string;
  autoReconnect?: boolean;
  reconnectIntervalMs?: number;
  maxReconnectAttempts?: number;
}

export class MiraWebSocketClient {
  private wsBaseUrl: string;
  private socket: WebSocket | null = null;
  private sessionId: string | null = null;
  private status: WebSocketStatus = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private options: Required<WebSocketClientOptions>;

  private messageListeners: Set<MessageListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private errorListeners: Set<ErrorListener> = new Set();

  constructor(options: WebSocketClientOptions = {}) {
    const metaEnv =
      typeof import.meta !== 'undefined'
        ? (import.meta as unknown as { env?: Record<string, string> }).env
        : undefined;
    const defaultWsUrl = metaEnv?.VITE_WS_URL || 'ws://127.0.0.1:8000';

    this.options = {
      wsBaseUrl: options.wsBaseUrl || defaultWsUrl,
      autoReconnect: options.autoReconnect ?? true,
      reconnectIntervalMs: options.reconnectIntervalMs ?? 3000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 5,
    };
    this.wsBaseUrl = this.options.wsBaseUrl.replace(/\/+$/, '');
  }

  public getStatus(): WebSocketStatus {
    return this.status;
  }

  public getSessionId(): string | null {
    return this.sessionId;
  }

  private setStatus(newStatus: WebSocketStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusListeners.forEach((listener) => {
        try {
          listener(newStatus);
        } catch (err) {
          console.error('[MiraWebSocketClient] Error in status listener:', err);
        }
      });
    }
  }

  /**
   * Connect to WebSocket for a given session ID
   */
  public connect(sessionId: string): Promise<void> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN && this.sessionId === sessionId) {
      return Promise.resolve();
    }

    this.disconnect();
    this.sessionId = sessionId;
    this.setStatus('connecting');

    const url = `${this.wsBaseUrl}/ws/${encodeURIComponent(sessionId)}`;

    return new Promise((resolve, reject) => {
      let isSettled = false;

      try {
        const ws = new WebSocket(url);
        this.socket = ws;

        ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.setStatus('connected');
          if (!isSettled) {
            isSettled = true;
            resolve();
          }
        };

        ws.onmessage = (event: MessageEvent) => {
          try {
            const parsed = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            this.messageListeners.forEach((listener) => {
              try {
                listener(parsed);
              } catch (err) {
                console.error('[MiraWebSocketClient] Error in message listener:', err);
              }
            });
          } catch {
            console.warn('[MiraWebSocketClient] Received non-JSON WebSocket frame:', event.data);
          }
        };

        ws.onerror = (event: Event) => {
          this.setStatus('error');
          this.errorListeners.forEach((listener) => {
            try {
              listener(event);
            } catch (err) {
              console.error('[MiraWebSocketClient] Error in error listener:', err);
            }
          });
          if (!isSettled) {
            isSettled = true;
            reject(new Error(`WebSocket connection failed to ${url}`));
          }
        };

        ws.onclose = () => {
          this.socket = null;
          this.setStatus('disconnected');

          if (this.options.autoReconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.reconnectTimer = setTimeout(() => {
              if (this.sessionId && this.status === 'disconnected') {
                this.connect(this.sessionId).catch(() => {});
              }
            }, this.options.reconnectIntervalMs);
          }
        };
      } catch (err) {
        this.setStatus('error');
        if (!isSettled) {
          isSettled = true;
          reject(err);
        }
      }
    });
  }

  /**
   * Disconnect the current WebSocket connection
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;

    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
    this.setStatus('disconnected');
  }

  /**
   * Send a JSON message through the WebSocket
   */
  public sendMessage(payload: unknown): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error(
        `Cannot send message: WebSocket is not open (current state: ${this.socket?.readyState ?? 'null'})`
      );
    }
    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
    this.socket.send(serialized);
  }

  /**
   * Send a chat message convenience method
   */
  public sendChatMessage(message: string, extra: Record<string, unknown> = {}): void {
    this.sendMessage({
      type: 'chat',
      message,
      sender: 'user',
      timestamp: new Date().toISOString(),
      ...extra,
    });
  }

  // Event subscription helpers
  public onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  public onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  public onError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }
}

export const wsClient = new MiraWebSocketClient();
