/**
 * Multimodal Stream & Conversation Types
 */

import { ActionProposal, VerificationResult, LoopStage } from './agent';

export interface BoundingBox {
  id: string;
  label: string;
  confidence: number;
  box: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in 0-100%
  category: 'ui_element' | 'text_block' | 'human_face' | 'physical_object' | 'error_region';
  color?: string;
}

export interface VisionFeedState {
  sourceType: 'camera' | 'screen' | 'synthetic_test' | 'paused';
  isActive: boolean;
  resolution: string;
  currentFps: number;
  detectedBoxes: BoundingBox[];
  ocrSnippets: Array<{ id: string; text: string; location: string }>;
  sceneDescription: string;
  lastFrameSnapshotUrl?: string;
}

export interface AudioStreamState {
  isListening: boolean;
  isMuted: boolean;
  isSpeakingTTS: boolean;
  audioInputDevice: string;
  inputVolume: number; // 0 - 100
  vadActive: boolean; // Voice activity detected
  speechRate: number; // wpm estimate
  audioFrequencies: number[]; // frequency spectrum array
}

export interface DocumentItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  tokenCount: number;
  status: 'processing' | 'ready' | 'error';
  summary?: string;
  chunksCount?: number;
  previewUrl?: string;
  contentSnippet?: string;
}

export interface MultimodalMessage {
  id: string;
  sender: 'user' | 'mira' | 'system';
  timestamp: string;
  text: string;
  transcription?: {
    isAudioFinal: boolean;
    confidence: number;
  };
  attachments?: {
    images?: string[];
    documents?: string[];
    snapshots?: string[];
  };
  agentTrace?: {
    stage: LoopStage;
    thought?: string;
    actionProposal?: ActionProposal;
    verification?: VerificationResult;
    executionTimeMs?: number;
  };
}
