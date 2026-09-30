import React from 'react';
import { useMira } from '../../context/MiraContext';
import { MiraAvatar } from '../mascot/MiraAvatar';
import {
  Layers,
  Mic,
  Eye,
  FileText,
  Clock,
  Pin,
  PinOff,
  Trash2,
} from 'lucide-react';

export const ContextCorePanel: React.FC = () => {
  const {
    contextCore,
    togglePinAnchor,
    removeAnchor,
    devMode,
    theme,
    agentState,
  } = useMira();

  const { tokenBudget, activeAnchors } = contextCore;
  const usedPct = Math.round((tokenBudget.usedTokens / tokenBudget.totalCapacity) * 100);

  return (
    <div className="mira-card contextcore-companion-card">
      {/* Header */}
      <div className="mira-card-header">
        <div className="mira-card-title">
          <div className="icon-circle-badge">
            <Layers size={15} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <div>
            <span>ContextCore</span>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
              Your active context
            </div>
          </div>
        </div>

        {/* Cute Mascot Face Accent */}
        <div style={{ transform: 'scale(0.85)' }}>
          <MiraAvatar size={34} state={agentState} theme={theme} interactive={false} />
        </div>
      </div>

      <div className="mira-card-body" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Friendly Context Status Items from Reference Image */}
        <div className="context-items-list">
          {/* Voice */}
          <div className="context-status-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="context-icon-wrap" style={{ background: 'var(--brand-primary-light)' }}>
                <Mic size={15} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <span className="context-item-label">Voice</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Mini Sound Wave Graphic */}
              <div className="mini-soundwave">
                <span style={{ height: '8px' }} />
                <span style={{ height: '14px' }} />
                <span style={{ height: '6px' }} />
                <span style={{ height: '11px' }} />
              </div>
              <span className="status-pill-ready">Ready</span>
            </div>
          </div>

          {/* Vision */}
          <div className="context-status-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="context-icon-wrap" style={{ background: '#e0f2fe' }}>
                <Eye size={15} style={{ color: '#0284c7' }} />
              </div>
              <span className="context-item-label">Vision</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={14} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
              <span className="status-pill-ready">Ready</span>
            </div>
          </div>

          {/* Documents */}
          <div className="context-status-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="context-icon-wrap" style={{ background: 'var(--brand-mint-light)' }}>
                <FileText size={15} style={{ color: 'var(--brand-mint)' }} />
              </div>
              <span className="context-item-label">Documents</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={14} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
              <span className="status-pill-ready">Ready</span>
            </div>
          </div>

          {/* Session */}
          <div className="context-status-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="context-icon-wrap" style={{ background: 'var(--brand-lavender-light)' }}>
                <Clock size={15} style={{ color: 'var(--brand-lavender)' }} />
              </div>
              <span className="context-item-label">Session</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={14} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
              <span className="status-pill-active">Active</span>
            </div>
          </div>
        </div>

        {/* Developer Mode: Detailed Telemetry and Token Meter */}
        {devMode && (
          <div className="context-dev-telemetry" style={{ marginTop: 12, borderTop: '1px dashed var(--border-subtle)', paddingTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 6 }}>
              <span style={{ fontWeight: 700 }}>Token Budget Meter:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{tokenBudget.usedTokens.toLocaleString()} / {tokenBudget.totalCapacity.toLocaleString()} ({usedPct}%)</span>
            </div>

            <div className="token-progress-track" style={{ marginBottom: 10 }}>
              <div className="token-progress-fill token-progress-vision" style={{ width: '25%' }} />
              <div className="token-progress-fill token-progress-docs" style={{ width: '25%' }} />
              <div className="token-progress-fill token-progress-audio" style={{ width: '15%' }} />
              <div className="token-progress-fill token-progress-system" style={{ width: '15%' }} />
            </div>

            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Context Anchors ({activeAnchors.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {activeAnchors.map((anc) => (
                <div key={anc.id} className="anchor-item" style={{ padding: '6px 8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>{anc.title}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{anc.source}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    <button className="mira-btn mira-btn-icon" style={{ padding: 2 }} onClick={() => togglePinAnchor(anc.id)}>
                      {anc.isPinned ? <Pin size={11} className="text-amber-500 fill-amber-500" /> : <PinOff size={11} />}
                    </button>
                    <button className="mira-btn mira-btn-icon" style={{ padding: 2 }} onClick={() => removeAnchor(anc.id)}>
                      <Trash2 size={11} className="text-slate-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
