/**
 * MIRA Agent Core Types
 * Phase 1: Foundation and UI Shell with Gen-Z Personalization System
 */

export * from './world';

export type AgentState =
  | 'idle'
  | 'listening'
  | 'observing'
  | 'thinking'
  | 'speaking'
  | 'waiting for approval'
  | 'executing'
  | 'verifying'
  | 'completed'
  | 'error'
  // Synonyms preserved for compatibility
  | 'processing'
  | 'planning';

export type LoopStage =
  | 'HEARS'
  | 'SEES'
  | 'UNDERSTANDS'
  | 'REASONS'
  | 'ACTS'
  | 'VERIFIES';

export type MiraThemeId = 'liquid-rose' | 'midnight' | 'glitter' | 'bold' | 'edge';

export type MascotAccessory = 'bunny-ears' | 'cyber-headphones' | 'star-clip' | 'hologram-visor' | 'none';

export interface ThemeConfig {
  id: MiraThemeId;
  name: string;
  tagline: string;
  aesthetic: string;
  palette: {
    bg: string;
    surface: string;
    primary: string;
    accent: string;
    text: string;
    tagBg: string;
  };
}

export type SensitiveRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ActionProposal {
  id: string;
  toolName: string;
  summary: string;
  description: string;
  parameters: Record<string, unknown>;
  isSensitive: boolean;
  riskLevel: SensitiveRiskLevel;
  requiredPermissions: string[];
  impactStatement: string;
  reversibility: 'reversible' | 'partially-reversible' | 'irreversible';
  status: 'pending_approval' | 'approved' | 'rejected' | 'executing' | 'completed' | 'failed';
  requestedAt: string;
  approvedAt?: string;
  rejectedReason?: string;
}

export interface VerificationResult {
  id: string;
  actionId: string;
  passed: boolean;
  confidenceScore: number; // 0 - 100
  method: 'self_reflection' | 'visual_grounding' | 'schema_validation' | 'execution_output' | 'system_sensor';
  summary: string;
  details: string[];
  metrics?: Record<string, string | number>;
  verifiedAt: string;
}

export interface ReasoningStep {
  id: string;
  stage: LoopStage;
  title: string;
  thought: string;
  observation?: string;
  timestamp: string;
  durationMs?: number;
  toolCall?: {
    name: string;
    input: Record<string, unknown>;
    output?: unknown;
  };
}

export interface AgentMetrics {
  fps: number;
  audioBitrateKbps: number;
  sttLatencyMs: number;
  reasoningLatencyMs: number;
  ttsLatencyMs: number;
  totalTokensUsed: number;
  activeContextTokens: number;
  connectionState: 'connected' | 'reconnecting' | 'standby' | 'disconnected';
}
