import React from 'react';
import { MultimodalMessage } from '../../types/multimodal';
import { useMira } from '../../context/MiraContext';
import { MiraAvatar } from '../mascot/MiraAvatar';
import {
  Mic,
  FileText,
  Brain,
  ShieldCheck,
} from 'lucide-react';

interface MessageItemProps {
  message: MultimodalMessage;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { devMode, theme, agentState } = useMira();
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  return (
    <div className={`message-bubble ${message.sender}`}>
      {/* Header Tag with Avatar */}
      <div className="message-header">
        {isUser ? (
          <>
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{message.timestamp}</span>
            <span style={{ fontWeight: 700 }}>You</span>
            <div className="user-mini-bubble-tag">You</div>
          </>
        ) : isSystem ? (
          <>
            <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>System Notice</span>
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{message.timestamp}</span>
          </>
        ) : (
          <>
            <div style={{ marginRight: 2 }}>
              <MiraAvatar size={26} state={agentState} theme={theme} interactive={false} />
            </div>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>MIRA</span>
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{message.timestamp}</span>
          </>
        )}
      </div>

      {/* Bubble Content */}
      <div className="message-content">
        {message.transcription && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '10.5px',
              fontWeight: 600,
              background: isUser ? 'rgba(255,255,255,0.2)' : 'var(--brand-primary-light)',
              color: isUser ? 'white' : 'var(--brand-primary)',
              padding: '2px 8px',
              borderRadius: '9999px',
              marginBottom: 6,
            }}
          >
            <Mic size={10} />
            <span>Voice Transcribed</span>
          </div>
        )}

        <div>{message.text}</div>

        {/* Attachments */}
        {message.attachments && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {message.attachments.documents?.map((doc, i) => (
              <span
                key={i}
                className="mira-badge"
                style={{
                  background: isUser ? 'rgba(255,255,255,0.2)' : 'var(--bg-surface-secondary)',
                  color: isUser ? 'white' : 'var(--text-primary)',
                }}
              >
                <FileText size={11} />
                <span>{doc}</span>
              </span>
            ))}
          </div>
        )}

        {/* Developer Mode Reasoning Trace (Only shown when devMode === true) */}
        {devMode && message.agentTrace && (
          <div className="agent-trace-box" style={{ marginTop: 10 }}>
            <div className="agent-trace-title">
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Brain size={12} style={{ color: 'var(--brand-lavender)' }} />
                <span>Dev Reasoning Trace</span>
                <span className="mira-badge mira-badge-mono" style={{ background: '#fef3c7', color: '#b45309' }}>
                  {message.agentTrace.stage}
                </span>
              </div>
              {message.agentTrace.executionTimeMs && (
                <span style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>
                  {message.agentTrace.executionTimeMs}ms
                </span>
              )}
            </div>

            {message.agentTrace.thought && (
              <div className="agent-trace-thought">
                "{message.agentTrace.thought}"
              </div>
            )}

            {message.agentTrace.verification && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 6,
                  padding: '4px 8px',
                  background: 'var(--brand-mint-light)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: 'var(--brand-mint)',
                  fontWeight: 600,
                }}
              >
                <ShieldCheck size={12} />
                <span>Verification Guardrail: {message.agentTrace.verification.confidenceScore}%</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
