import React, { useState, useEffect, useRef } from 'react';
import { useMira } from '../context/MiraContext';
import { MiraAvatar } from '../components/mascot/MiraAvatar';
import { apiClient, wsClient } from '../services';
import {
  Zap,
  Check,
  X,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';

export const ActionsPage: React.FC = () => {
  const {
    currentActionProposal,
    approveAction,
    rejectAction,
    verificationResult,
    resetActionDemo,
    agentState,
    theme,
    mascotAccessory,
  } = useMira();

  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [showJsonParams, setShowJsonParams] = useState(false);
  const sessionIdRef = useRef<string>(`mira-action-${Date.now().toString(36)}`);

  // Connect WebSocket and initialize action context on mount
  useEffect(() => {
    const sessionId = sessionIdRef.current;
    wsClient.connect(sessionId).catch((err) => {
      console.warn('[ActionsPage] WebSocket initial connect:', err);
    });

    if (currentActionProposal) {
      apiClient.saveContext({
        session_id: sessionId,
        modalities: {
          action: {
            proposal_id: currentActionProposal.id,
            tool_name: currentActionProposal.toolName,
            status: currentActionProposal.status,
            summary: currentActionProposal.summary,
            updated_at: new Date().toISOString(),
          },
        },
        active_anchors: [
          {
            modality: 'system',
            title: `Action: ${currentActionProposal.summary}`,
            source: `Safety Gate: ${currentActionProposal.toolName}`,
            summary: currentActionProposal.description,
            token_weight: 180,
          },
        ],
      }).catch((err) => console.warn('[ActionsPage] Initial context sync error:', err));
    }

    return () => {
      wsClient.disconnect();
    };
  }, []);

  const getStepStatus = (stepIndex: number) => {
    // 0: Proposed Action, 1: User Approval, 2: Execution, 3: Verification
    if (agentState === 'waiting for approval') {
      if (stepIndex === 0) return 'completed';
      if (stepIndex === 1) return 'active';
      return 'pending';
    }
    if (agentState === 'executing') {
      if (stepIndex <= 1) return 'completed';
      if (stepIndex === 2) return 'active';
      return 'pending';
    }
    if (agentState === 'verifying') {
      if (stepIndex <= 2) return 'completed';
      if (stepIndex === 3) return 'active';
      return 'pending';
    }
    if (agentState === 'completed' || currentActionProposal?.status === 'completed') {
      return 'completed';
    }
    if (currentActionProposal?.status === 'rejected') {
      if (stepIndex === 0) return 'completed';
      if (stepIndex === 1) return 'rejected';
      return 'pending';
    }
    return 'pending';
  };

  const steps = [
    { title: 'Proposed Action', desc: 'Agent reasons & drafts action' },
    { title: 'User Approval', desc: 'Safety gate & confirmation' },
    { title: 'Execution', desc: 'Safe tool dispatch' },
    { title: 'Verification', desc: 'Telemetry proof & validation' },
  ];

  const handleApprove = () => {
    if (!currentActionProposal) return;
    const proposal = currentActionProposal;
    const sessionId = sessionIdRef.current;

    approveAction(proposal.id);

    // Sync approval event to backend ContextCore
    apiClient.saveContext({
      session_id: sessionId,
      modalities: {
        action: {
          proposal_id: proposal.id,
          tool_name: proposal.toolName,
          status: 'approved',
          updated_at: new Date().toISOString(),
        },
      },
    }).catch((err) => console.warn('[ActionsPage] Save context error:', err));

    if (wsClient.getStatus() === 'connected') {
      wsClient.sendMessage({
        type: 'action_approved',
        action_id: proposal.id,
        toolName: proposal.toolName,
        message: `Action "${proposal.summary}" was APPROVED by user. Safe dispatch executing via tool "${proposal.toolName}".`,
      });
    }

    // After execution transition (~1200ms in context), dispatch execution event
    setTimeout(() => {
      if (wsClient.getStatus() === 'connected') {
        wsClient.sendMessage({
          type: 'action_executed',
          action_id: proposal.id,
          toolName: proposal.toolName,
          message: `Action execution completed for "${proposal.summary}". Entering verification loop stage.`,
        });
      }

      // After verification transition (~2600ms total), dispatch verification event
      setTimeout(() => {
        apiClient.saveContext({
          session_id: sessionId,
          modalities: {
            action: {
              proposal_id: proposal.id,
              tool_name: proposal.toolName,
              status: 'completed',
              verified: true,
              confidence_score: 98.4,
              updated_at: new Date().toISOString(),
            },
          },
          active_anchors: [
            {
              modality: 'system',
              title: `Verified Action: ${proposal.summary}`,
              source: 'Telemetry Health Check',
              summary: 'Execution confirmed 3 pods back online in healthy state with 98.4% confidence.',
              token_weight: 180,
            },
          ],
        }).catch((err) => console.warn('[ActionsPage] Verification sync error:', err));

        if (wsClient.getStatus() === 'connected') {
          wsClient.sendMessage({
            type: 'action_verified',
            action_id: proposal.id,
            confidence_score: 98.4,
            message: `Action verified safely! Telemetry health check passed with 98.4% confidence score.`,
          });
        }
      }, 1400);
    }, 1200);
  };

  const handleConfirmReject = () => {
    if (!currentActionProposal) return;
    const proposal = currentActionProposal;
    const reason = rejectReason || 'Declined by user.';
    const sessionId = sessionIdRef.current;

    rejectAction(proposal.id, reason);
    setIsRejecting(false);
    setRejectReason('');

    apiClient.saveContext({
      session_id: sessionId,
      modalities: {
        action: {
          proposal_id: proposal.id,
          tool_name: proposal.toolName,
          status: 'rejected',
          reason,
          updated_at: new Date().toISOString(),
        },
      },
    }).catch((err) => console.warn('[ActionsPage] Save context error:', err));

    if (wsClient.getStatus() === 'connected') {
      wsClient.sendMessage({
        type: 'action_rejected',
        action_id: proposal.id,
        reason,
        message: `Action "${proposal.summary}" REJECTED by user: "${reason}". Execution safely aborted.`,
      });
    }
  };

  const handleResetDemo = () => {
    resetActionDemo();
    const sessionId = sessionIdRef.current;

    setTimeout(() => {
      apiClient.saveContext({
        session_id: sessionId,
        modalities: {
          action: {
            status: 'waiting for approval',
            updated_at: new Date().toISOString(),
          },
        },
      }).catch((err) => console.warn('[ActionsPage] Reset context error:', err));

      if (wsClient.getStatus() === 'connected') {
        wsClient.sendMessage({
          type: 'action_proposed',
          message: 'MIRA generated action proposal for review: Restart Stale Pods (k8s_restart_pods). Awaiting user approval.',
        });
      }
    }, 50);
  };

  return (
    <div className="page-container actions-page-container">
      {/* Actions Header */}
      <div className="actions-page-header">
        <div className="actions-header-info">
          <div className="icon-circle-badge actions-icon-badge">
            <Zap size={20} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <div>
            <div className="actions-title-row">
              <h2 className="actions-header-title">Action Center & Verification</h2>
              <span className={`status-pill ${agentState === 'waiting for approval' ? 'warning' : 'ready'}`}>
                {agentState === 'waiting for approval' ? 'Approval Required' : 'Action Engine Ready'}
              </span>
            </div>
            <p className="actions-header-sub">
              Human-in-the-Loop Safe Execution: Proposed Action → User Approval → Execution → Verification
            </p>
          </div>
        </div>

        <div className="actions-header-actions">
          <button
            className="mira-btn mira-btn-secondary"
            onClick={handleResetDemo}
            title="Reset and replay action proposal demo"
          >
            <RotateCcw size={14} />
            <span>Replay Action Demo</span>
          </button>
        </div>
      </div>

      {/* 4-Step Pipeline Stepper Bar */}
      <div className="action-pipeline-card">
        <div className="pipeline-steps-track">
          {steps.map((st, idx) => {
            const status = getStepStatus(idx);
            return (
              <React.Fragment key={idx}>
                <div className={`pipeline-step-node ${status}`}>
                  <div className="step-circle">
                    {status === 'completed' && <Check size={14} strokeWidth={3} />}
                    {status === 'rejected' && <X size={14} strokeWidth={3} />}
                    {status === 'active' && <span className="step-pulsing-dot" />}
                    {status === 'pending' && <span>{idx + 1}</span>}
                  </div>
                  <div className="step-node-text">
                    <span className="step-title">{st.title}</span>
                    <span className="step-desc">{st.desc}</span>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`pipeline-step-divider ${getStepStatus(idx + 1) !== 'pending' ? 'filled' : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Active Action Card + Mascot & Verification Result */}
      <div className="actions-main-grid">
        {/* Left Column: Action Details / Approval Card */}
        <div className="actions-left-column">
          {currentActionProposal ? (
            <div className="mira-card action-detail-card">
              <div className="mira-card-header">
                <div className="mira-card-title">
                  <div className="icon-circle-badge" style={{ background: '#ffedd5', color: '#ea580c' }}>
                    <ShieldAlert size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: 800 }}>
                      {currentActionProposal.summary}
                    </span>
                    <span className="safety-tier-badge">
                      CONFIRMATION REQUIRED
                    </span>
                  </div>
                </div>

                <span className={`status-pill ${currentActionProposal.status}`}>
                  {currentActionProposal.status.toUpperCase()}
                </span>
              </div>

              <div className="action-card-body-content">
                <p className="action-full-description">
                  {currentActionProposal.description}
                </p>

                <div className="action-impact-callout">
                  <AlertTriangle size={16} className="text-amber-500" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Impact Statement:</strong> {currentActionProposal.impactStatement}
                  </div>
                </div>

                {/* Parameters & Targets */}
                <div className="action-params-section">
                  <div className="params-header" onClick={() => setShowJsonParams(!showJsonParams)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Terminal size={14} />
                      <span>Tool Invocation: <strong>{currentActionProposal.toolName}</strong></span>
                    </div>
                    <span className="toggle-text">{showJsonParams ? 'Hide JSON' : 'View Parameters'}</span>
                  </div>

                  {showJsonParams && (
                    <pre className="params-json-viewer">
                      {JSON.stringify(currentActionProposal.parameters, null, 2)}
                    </pre>
                  )}
                </div>

                {/* Human-In-The-Loop Approval Action Buttons */}
                {currentActionProposal.status === 'pending_approval' && (
                  <div className="approval-buttons-row">
                    {!isRejecting ? (
                      <>
                        <button
                          className="mira-btn mira-btn-primary approve-big-btn"
                          onClick={handleApprove}
                        >
                          <Check size={18} />
                          <span>Approve & Execute Safely</span>
                        </button>

                        <button
                          className="mira-btn mira-btn-secondary reject-btn"
                          onClick={() => setIsRejecting(true)}
                        >
                          <X size={16} />
                          <span>Reject Action</span>
                        </button>
                      </>
                    ) : (
                      <div className="reject-reason-box">
                        <input
                          type="text"
                          className="reject-input"
                          placeholder="Reason for declining (optional)..."
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <button
                          className="mira-btn mira-btn-danger"
                          onClick={handleConfirmReject}
                        >
                          Confirm Rejection
                        </button>
                        <button
                          className="mira-btn mira-btn-secondary"
                          onClick={() => setIsRejecting(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Execution / Completed Message */}
                {currentActionProposal.status === 'approved' && (
                  <div className="action-status-banner executing">
                    <span className="pulsing-spinner" />
                    <span>Executing safe cluster rollout in progress...</span>
                  </div>
                )}

                {currentActionProposal.status === 'completed' && (
                  <div className="action-status-banner completed">
                    <CheckCircle2 size={18} />
                    <span>Action safely executed and verified! System stable.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mira-card empty-action-card">
              <CheckCircle2 size={32} style={{ color: 'var(--brand-mint)' }} />
              <h3>No Action Pending</h3>
              <p>MIRA is standing by. When a complex tool call is planned, it will appear here for your review.</p>
              <button className="mira-btn mira-btn-primary" onClick={handleResetDemo}>
                Load Demo Action
              </button>
            </div>
          )}

          {/* Past Actions Audit Trail */}
          <div className="mira-card action-history-card">
            <div className="mira-card-header">
              <div className="mira-card-title">
                <Clock size={15} style={{ color: 'var(--brand-primary)' }} />
                <span>Action Safety Log & Audit Trail</span>
              </div>
            </div>
            <div className="history-list">
              <div className="history-item">
                <div className="history-icon approved">
                  <Check size={12} strokeWidth={3} />
                </div>
                <div className="history-info">
                  <span className="history-title">K8s Cluster Node Ingress Sync</span>
                  <span className="history-meta">Approved by User • Verified 100% • 5m ago</span>
                </div>
              </div>
              <div className="history-item">
                <div className="history-icon approved">
                  <Check size={12} strokeWidth={3} />
                </div>
                <div className="history-info">
                  <span className="history-title">ContextCore Document Vector Indexing</span>
                  <span className="history-meta">Auto-safeguarded • Verified • 12m ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Mascot Companion & Verification Proof Card */}
        <div className="actions-right-column">
          {/* Mascot Waiting / Verifying Status Card */}
          <div className="mira-card actions-mascot-card">
            <div className="actions-mascot-avatar">
              <MiraAvatar
                size={84}
                state={agentState}
                theme={theme}
                accessory={mascotAccessory}
                interactive={true}
              />
            </div>
            <h3 className="actions-mascot-title">
              {agentState === 'waiting for approval' && 'Awaiting Your Approval! ✨'}
              {agentState === 'executing' && 'Executing Action... ⚡'}
              {agentState === 'verifying' && 'Verifying Telemetry... 🔍'}
              {agentState === 'completed' && 'Action Verified & Safe! 🎉'}
              {agentState === 'idle' && 'MIRA Safety Gate Ready'}
            </h3>
            <p className="actions-mascot-desc">
              Sensitive actions require explicit user confirmation before any modifications occur.
            </p>
          </div>

          {/* Verification Result Card */}
          {verificationResult && (
            <div className="mira-card verification-result-card">
              <div className="mira-card-header">
                <div className="mira-card-title">
                  <ShieldCheck size={16} style={{ color: '#10b981' }} />
                  <span>Verification Proof</span>
                </div>
                <span className="verification-score-badge">
                  {verificationResult.confidenceScore}% Confidence
                </span>
              </div>

              <div className="verification-body">
                <div className="verification-check-item">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <div>
                    <span className="check-title">Telemetry Health Check</span>
                    <p className="check-sub">{verificationResult.details[0] || 'Verification passed without error.'}</p>
                  </div>
                </div>

                <div className="verification-check-item">
                  <CheckCircle2 size={15} className="text-emerald-500" />
                  <div>
                    <span className="check-title">Rollback Safety</span>
                    <p className="check-sub">{verificationResult.details[1] || 'Safe rollback state verified.'}</p>
                  </div>
                </div>

                <div className="verification-summary-box">
                  <FileCheck size={14} style={{ color: '#10b981' }} />
                  <span>{verificationResult.summary}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
