/**
 * MIRA Event & Protocol Types
 * Prepared for Phase 2 WebSocket and streaming backend integration
 */

import { AgentState } from './agent';
import { ModalityType } from './context';

export type EventType =
  // Inbound from Backend / Agent
  | 'AGENT_STATE_CHANGED'
  | 'AUDIO_STREAM_CHUNK'
  | 'TRANSCRIPT_PARTIAL'
  | 'TRANSCRIPT_FINAL'
  | 'VISION_FRAME_ANALYZED'
  | 'REASONING_STEP_EMITTED'
  | 'ACTION_PROPOSED'
  | 'ACTION_APPROVAL_REQUIRED'
  | 'ACTION_EXECUTING'
  | 'ACTION_VERIFIED'
  | 'CONTEXT_CORE_UPDATED'
  | 'ERROR_OCCURRED'
  
  // Outbound from Client
  | 'CLIENT_AUDIO_PACKET'
  | 'CLIENT_VIDEO_FRAME'
  | 'CLIENT_USER_PROMPT'
  | 'CLIENT_APPROVE_ACTION'
  | 'CLIENT_REJECT_ACTION'
  | 'CLIENT_INTERRUPT'
  | 'CLIENT_DOCUMENT_UPLOADED';

export interface BaseSocketMessage<T = unknown> {
  type: EventType;
  timestamp: string;
  sessionId: string;
  payload: T;
}

export interface StateChangeEventPayload {
  previousState: AgentState;
  newState: AgentState;
  reason?: string;
}

export interface ActionApprovalPayload {
  actionId: string;
  approved: boolean;
  notes?: string;
  modifiedParams?: Record<string, unknown>;
}

export interface ContextUpdatePayload {
  modality: ModalityType;
  tokensDelta: number;
  newAnchor?: unknown;
}
