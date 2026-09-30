import React, { useRef, useEffect, useState } from 'react';
import { useMira } from '../context/MiraContext';
import { MessageItem } from '../components/conversation/MessageItem';
import { InputBar } from '../components/conversation/InputBar';
import { MiraAvatar } from '../components/mascot/MiraAvatar';
import {
  Sparkles,
  Volume2,
  Mic,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

const PROMPT_SUGGESTIONS = [
  'What do you see on my screen right now?',
  'Summarize the uploaded architectural document',
  'Check system pods and verify cluster health',
  'Explain how ContextCore integrates audio and vision',
];

export const ChatPage: React.FC = () => {
  const {
    messages,
    agentState,
    theme,
    mascotAccessory,
    sendMessage,
    audioStream,
    toggleListening,
    loopStage,
  } = useMira();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showVoiceInfo, setShowVoiceInfo] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, agentState]);

  return (
    <div className="page-container chat-page-container">
      {/* Chat Page Header */}
      <div className="chat-page-header">
        <div className="chat-header-info">
          <div className="chat-avatar-mini">
            <MiraAvatar
              size={44}
              state={agentState}
              theme={theme}
              accessory={mascotAccessory}
              interactive={true}
            />
          </div>
          <div>
            <div className="chat-header-title-row">
              <h2 className="chat-header-title">MIRA Multimodal Dialogue</h2>
              <span className={`status-pill ${audioStream.isListening ? 'listening' : 'ready'}`}>
                {audioStream.isListening ? 'Listening Live' : 'Voice & Text Ready'}
              </span>
            </div>
            <p className="chat-header-sub">
              Active Stage: <strong>{loopStage}</strong> • Powered by ContextCore Real-time Ingestion
            </p>
          </div>
        </div>

        <div className="chat-header-actions">
          <button
            className={`mira-btn mira-btn-sm ${audioStream.isListening ? 'mira-btn-primary' : ''}`}
            onClick={toggleListening}
            title={audioStream.isListening ? 'Stop listening' : 'Start voice mode'}
          >
            <Mic size={14} />
            <span>{audioStream.isListening ? 'Live Mic On' : 'Voice Mode'}</span>
          </button>

          <button
            className="mira-btn mira-btn-sm mira-btn-secondary"
            onClick={() => setShowVoiceInfo(!showVoiceInfo)}
            title="Audio pipeline status"
          >
            <Sliders size={14} />
            <span>Audio Status</span>
          </button>
        </div>
      </div>

      {/* Voice Status Drawer if toggled */}
      {showVoiceInfo && (
        <div className="voice-status-drawer">
          <div className="drawer-item">
            <Volume2 size={15} className="text-rose-500" />
            <span>Device: <strong>{audioStream.audioInputDevice}</strong></span>
          </div>
          <div className="drawer-item">
            <ShieldCheck size={15} className="text-emerald-500" />
            <span>VAD Speech Detection: <strong>{audioStream.vadActive ? 'Speaking' : 'Quiet'}</strong></span>
          </div>
          <div className="drawer-item">
            <Sparkles size={15} className="text-purple-500" />
            <span>TTS Rate: <strong>{audioStream.speechRate} WPM</strong></span>
          </div>
        </div>
      )}

      {/* Main Spacious Chat Messages Area */}
      <div className="chat-messages-viewport" ref={scrollRef}>
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}

        {/* Live Friendly Mascot Reaction during processing */}
        {(agentState === 'thinking' || agentState === 'processing' || agentState === 'planning') && (
          <div className="message-bubble mira thinking-bubble">
            <div className="thinking-mascot-row">
              <MiraAvatar size={34} state="thinking" theme={theme} accessory={mascotAccessory} />
              <div className="thinking-text-group">
                <span className="thinking-label">MIRA is thinking... ✨</span>
                <span className="thinking-sub">Synthesizing audio and ContextCore anchors</span>
              </div>
            </div>
          </div>
        )}

        {agentState === 'speaking' && (
          <div className="message-bubble mira speaking-bubble">
            <div className="thinking-mascot-row">
              <MiraAvatar size={34} state="speaking" theme={theme} accessory={mascotAccessory} />
              <div className="thinking-text-group">
                <span className="thinking-label">MIRA is speaking 💬</span>
                <span className="thinking-sub">Transmitting real-time response</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      <div className="chat-quick-suggestions">
        <span className="suggestions-label">Suggestions:</span>
        <div className="suggestions-scroll">
          {PROMPT_SUGGESTIONS.map((prompt, idx) => (
            <button
              key={idx}
              className="chat-prompt-chip"
              onClick={() => sendMessage(prompt)}
            >
              <Sparkles size={12} style={{ color: 'var(--brand-primary)' }} />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Composer Input Bar */}
      <div className="chat-composer-dock">
        <InputBar />
      </div>
    </div>
  );
};
