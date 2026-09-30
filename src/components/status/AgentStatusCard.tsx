import React from 'react';
import { useMira } from '../../context/MiraContext';
import { AgentState } from '../../types/agent';
import { MiraAvatar } from '../mascot/MiraAvatar';
import {
  Activity,
  Mic,
  Eye,
  FileText,
  Monitor,
} from 'lucide-react';

const FLOW_STEPS: Array<{ id: AgentState; label: string }> = [
  { id: 'listening', label: 'Listening' },
  { id: 'observing', label: 'Observing' },
  { id: 'thinking', label: 'Processing' },
  { id: 'planning', label: 'Planning' },
  { id: 'waiting for approval', label: 'Approval' },
  { id: 'executing', label: 'Executing' },
  { id: 'verifying', label: 'Verifying' },
  { id: 'completed', label: 'Completed' },
];

export const AgentStatusCard: React.FC = () => {
  const {
    agentState,
    theme,
    mascotAccessory,
    devMode,
    setDevMode,
  } = useMira();

  const getStatusDescription = () => {
    switch (agentState) {
      case 'listening':
        return 'MIRA is listening... You can speak naturally or share a visual input.';
      case 'observing':
        return 'MIRA is observing your active screen and visual context.';
      case 'thinking':
      case 'processing':
      case 'planning':
        return 'MIRA is understanding your request and organizing the best next steps.';
      case 'waiting for approval':
        return 'MIRA has prepared an action and is waiting for your confirmation.';
      case 'executing':
        return 'MIRA is executing the action safely in your workspace.';
      case 'verifying':
        return 'MIRA is double-checking and verifying the outcome.';
      case 'completed':
        return 'All done! Action completed and verified.';
      case 'error':
        return 'Something went wrong. MIRA is ready to retry.';
      case 'idle':
      default:
        return 'MIRA is ready. Speak, share screen, or drop a document to begin.';
    }
  };

  const currentStepIdx = FLOW_STEPS.findIndex((s) => s.id === agentState);

  return (
    <div className="mira-card agent-status-card">
      {/* Header */}
      <div className="mira-card-header">
        <div className="mira-card-title">
          <div className="icon-circle-badge">
            <Activity size={15} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <span>Agent Status</span>
        </div>

        <button
          className="mira-btn mira-btn-sm"
          style={{ border: 'none', background: 'transparent', color: 'var(--brand-primary)', fontWeight: 700, gap: 4 }}
          onClick={() => setDevMode(!devMode)}
        >
          <span>{devMode ? 'Hide flow ←' : 'View flow →'}</span>
        </button>
      </div>

      <div className="mira-card-body" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Stepper Dots Progression from Reference Image */}
        <div className="agent-stepper-track">
          {FLOW_STEPS.map((step, idx) => {
            const isActive = step.id === agentState;
            const isPassed = currentStepIdx > idx;
            return (
              <div
                key={step.id}
                className={`stepper-node ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
              >
                <div className="stepper-dot" />
                <span className="stepper-label">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Status Box with Avatar from Reference */}
        <div className="agent-status-msg-box">
          <div style={{ flexShrink: 0 }}>
            <MiraAvatar size={38} state={agentState} theme={theme} accessory={mascotAccessory} interactive={false} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
              MIRA is {agentState}...
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
              {getStatusDescription()}
            </p>
          </div>
        </div>

        {/* Modality Filter Pills from Reference Image */}
        <div className="modality-pills-row">
          <div className="modality-pill">
            <Mic size={12} />
            <span>Voice</span>
          </div>
          <div className="modality-pill">
            <Eye size={12} />
            <span>Vision</span>
          </div>
          <div className="modality-pill">
            <FileText size={12} />
            <span>Documents</span>
          </div>
          <div className="modality-pill">
            <Monitor size={12} />
            <span>Screen</span>
          </div>
          <div className="modality-pill dot-more">
            <span>•••</span>
          </div>
        </div>
      </div>
    </div>
  );
};
