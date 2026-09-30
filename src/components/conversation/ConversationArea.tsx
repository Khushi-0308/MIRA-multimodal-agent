import React, { useRef, useEffect } from 'react';
import { useMira } from '../../context/MiraContext';
import { MessageItem } from './MessageItem';
import { InputBar } from './InputBar';
import { MessageSquare, RotateCcw } from 'lucide-react';

const SUGGESTIONS = [
  'Summarize this',
  'Explain this',
  'Extract text',
];

export const ConversationArea: React.FC = () => {
  const { messages, agentState, sendMessage } = useMira();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, agentState]);

  return (
    <div className="mira-card conversation-workspace-card">
      {/* Header */}
      <div className="mira-card-header">
        <div className="mira-card-title">
          <div className="icon-circle-badge">
            <MessageSquare size={15} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <span>Conversation</span>
        </div>

        <button
          className="mira-btn mira-btn-sm"
          style={{ borderRadius: 'var(--radius-pill)', color: 'var(--text-muted)' }}
          onClick={() => {}}
          title="Clear Conversation"
        >
          <RotateCcw size={12} />
          <span>Clear</span>
        </button>
      </div>

      {/* Messages Timeline */}
      <div className="messages-timeline" ref={scrollRef}>
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}

        {/* Friendly Thinking Indicator */}
        {(agentState === 'thinking' || agentState === 'processing' || agentState === 'planning') && (
          <div className="message-bubble mira">
            <div className="message-content" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
              <span className="live-indicator-dot" style={{ backgroundColor: 'var(--brand-primary)' }} />
              <span>MIRA is thinking... ✨</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Suggestion Chips from Reference Image */}
      <div className="conversation-suggestions-row">
        {SUGGESTIONS.map((sug, i) => (
          <button
            key={i}
            className="suggestion-chip-btn"
            onClick={() => sendMessage(sug)}
          >
            <span>{sug}</span>
          </button>
        ))}
        <button className="suggestion-chip-btn" onClick={() => sendMessage('What do you see on my screen?')}>
          <span>•••</span>
        </button>
      </div>

      {/* Input Composer */}
      <InputBar />
    </div>
  );
};
