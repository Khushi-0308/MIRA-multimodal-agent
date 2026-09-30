/**
 * MIRA ContextCore Types
 * Core multimodal session state aggregator
 */

export type ModalityType = 'audio' | 'vision' | 'screen' | 'documents' | 'session' | 'environment';

export interface ModalityStatus {
  type: ModalityType;
  label: string;
  active: boolean;
  statusText: string;
  lastUpdated: string;
  health: 'optimal' | 'warning' | 'idle' | 'offline';
  sampleRateOrFps?: string;
  dataThroughput?: string;
}

export interface ContextAnchor {
  id: string;
  modality: ModalityType;
  title: string;
  source: string;
  summary: string;
  tokenWeight: number;
  isPinned: boolean;
  timestamp: string;
  metadata?: Record<string, string | number>;
}

export interface TokenBudget {
  totalCapacity: number; // e.g., 128,000
  usedTokens: number;
  breakdown: {
    systemPrompt: number;
    visionFeed: number;
    audioStream: number;
    documents: number;
    conversationHistory: number;
    toolScratchpad: number;
  };
}

export interface EnvironmentContext {
  os: string;
  browser: string;
  activeApplication?: string;
  screenResolution: string;
  timezone: string;
  networkLatencyMs: number;
}

export interface ContextCoreState {
  version: string;
  sessionId: string;
  modalities: Record<ModalityType, ModalityStatus>;
  tokenBudget: TokenBudget;
  activeAnchors: ContextAnchor[];
  environment: EnvironmentContext;
  workingMemorySummary: string;
  lastFuseEffectTimestamp: string;
}
