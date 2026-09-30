import React, { useState } from 'react';
import { useMira } from '../../context/MiraContext';
import { MiraAvatar } from '../mascot/MiraAvatar';
import {
  Zap,
  Check,
  X,
  ShieldAlert,
  Settings,
  ShieldCheck,
  Terminal,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export const ActionPanel: React.FC = () => {
  const {
    currentActionProposal,
    approveAction,
    rejectAction,
    verificationResult,
    agentState,
    theme,
    devMode,
  } = useMira();

  const [showParams, setShowParams] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

  const isPendingApproval = currentActionProposal?.status === 'pending_approval' && agentState === 'waiting for approval';

  const handleApprove = () => {
    if (currentActionProposal) {
      approveAction(currentActionProposal.id);
    }
  };

  const handleConfirmReject = () => {
    if (currentActionProposal) {
      rejectAction(currentActionProposal.id, rejectReason || 'Declined by user.');
      setIsRejecting(false);
      setRejectReason('');
    }
  };

  return (
    <div className="mira-card current-action-card">
      {/* Header */}
      <div className="mira-card-header">
        <div className="mira-card-title">
          <div className="icon-circle-badge">
            <Zap size={15} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <span>Current Action</span>
        </div>

        {/* Peeking Cute Mascot */}
        <div style={{ transform: 'scale(0.85)' }}>
          <MiraAvatar size={34} state={agentState} theme={theme} interactive={false} />
        </div>
      </div>

      <div className="mira-card-body" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* State 1: Human-In-The-Loop Approval Required */}
        {isPendingApproval && currentActionProposal ? (
          <div className="companion-approval-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="icon-circle-badge" style={{ background: '#ffedd5', color: '#ea580c' }}>
                <ShieldAlert size={16} />
              </div>
              <div>
                <span className="companion-approval-badge">PERMISSION NEEDED</span>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                  {currentActionProposal.summary}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              {currentActionProposal.description}
            </p>

            <div style={{ fontSize: '11.5px', background: 'var(--bg-surface)', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
              ✨ <strong>Note:</strong> {currentActionProposal.impactStatement}
            </div>

            {/* Developer Mode Parameters Accordion */}
            {devMode && (
              <div>
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}
                  onClick={() => setShowParams(!showParams)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Terminal size={11} />
                    <span>Tool Parameters ({currentActionProposal.toolName})</span>
                  </div>
                  {showParams ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                </div>
                {showParams && (
                  <pre className="sensitive-params-box" style={{ marginTop: 4 }}>
                    {JSON.stringify(currentActionProposal.parameters, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* Approval Buttons */}
            {isRejecting ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input
                  type="text"
                  className="input-field"
                  style={{ background: 'white', border: '1px solid #f87171', padding: '6px 10px', borderRadius: '8px', fontSize: '12px' }}
                  placeholder="Optional note for declining..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="mira-btn mira-btn-sm mira-btn-danger" onClick={handleConfirmReject}>
                    Confirm Decline
                  </button>
                  <button className="mira-btn mira-btn-sm" onClick={() => setIsRejecting(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  className="mira-btn mira-btn-primary"
                  style={{ flex: 1, borderRadius: 'var(--radius-pill)', padding: '8px 16px' }}
                  onClick={handleApprove}
                >
                  <Check size={14} />
                  <span>Allow Action</span>
                </button>
                <button
                  className="mira-btn"
                  style={{ borderRadius: 'var(--radius-pill)', color: 'var(--text-muted)' }}
                  onClick={() => setIsRejecting(true)}
                >
                  <X size={14} />
                  <span>Decline</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* State 2: Clean Idle State from Reference Image */
          <div className="action-idle-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="action-gear-circle">
                <Settings size={18} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {agentState === 'executing' ? 'Executing Action...' : agentState === 'verifying' ? 'Verifying Results...' : 'Idle'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {agentState === 'executing' ? 'MIRA is safely running your request' : 'No action in progress'}
                </div>
              </div>
            </div>

            {/* Friendly Banner from Reference Image */}
            <div className="action-ready-banner">
              <span>I'm ready when you are! ✨</span>
            </div>
          </div>
        )}

        {/* Developer Mode Diagnostics */}
        {devMode && verificationResult && (
          <div className="verification-box" style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--brand-mint)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <ShieldCheck size={14} />
                <span>Verification Guardrail</span>
              </div>
              <span>{verificationResult.confidenceScore}%</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 2 }}>
              {verificationResult.summary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
