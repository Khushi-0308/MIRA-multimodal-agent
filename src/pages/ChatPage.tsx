import React, { useRef, useEffect, useState } from 'react';
import { useMira } from '../context/MiraContext';
import { MessageItem } from '../components/conversation/MessageItem';
import { MiraAvatar } from '../components/mascot/MiraAvatar';
import { apiClient, wsClient } from '../services';
import { MultimodalMessage } from '../types/multimodal';
import { LoopStage } from '../types/agent';
import {
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  Sliders,
  ShieldCheck,
  Send,
  Paperclip,
  X,
  Eye,
  FileText,
  Lightbulb,
  Play,
  Layers,
  Activity,
} from 'lucide-react';

const PROMPT_SUGGESTIONS = [
  'What do you see on my screen right now?',
  'Summarize the uploaded architectural document',
  'Check system pods and verify cluster health',
  'Explain how ContextCore integrates audio and vision',
];

const COGNITIVE_STAGES: Array<{ id: LoopStage; label: string; icon: typeof Mic }> = [
  { id: 'HEARS', label: 'HEARS', icon: Mic },
  { id: 'SEES', label: 'SEES', icon: Eye },
  { id: 'UNDERSTANDS', label: 'UNDERSTANDS', icon: Lightbulb },
  { id: 'REASONS', label: 'REASONS', icon: Sparkles },
  { id: 'ACTS', label: 'ACTS', icon: Play },
  { id: 'VERIFIES', label: 'VERIFIES', icon: ShieldCheck },
];

const STATE_DISPLAY: Record<string, { label: string; icon: string }> = {
  idle: { label: 'Idle / Ready', icon: '💖' },
  listening: { label: 'Listening Live', icon: '👂' },
  observing: { label: 'Observing Scene', icon: '👀' },
  thinking: { label: 'Thinking Deeply', icon: '💭' },
  processing: { label: 'Processing Anchors', icon: '⚡' },
  planning: { label: 'Planning Safe Action', icon: '🧠' },
  speaking: { label: 'Speaking Out', icon: '💬' },
  'waiting for approval': { label: 'Waiting for Approval', icon: '⏳' },
  executing: { label: 'Executing Tool', icon: '⚡' },
  verifying: { label: 'Verifying Telemetry', icon: '🔍' },
  completed: { label: 'Task Completed', icon: '🎉' },
  error: { label: 'Needs Attention', icon: '🥺' },
};

export const ChatPage: React.FC = () => {
  const {
    messages,
    agentState,
    setAgentState,
    theme,
    mascotAccessory,
    audioStream,
    toggleListening,
    loopStage,
    setLoopStage,
    addDocument,
    documents,
    visionFeed,
    contextCore,
  } = useMira();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showVoiceInfo, setShowVoiceInfo] = useState(false);
  const [chatMessages, setChatMessages] = useState<MultimodalMessage[]>(messages);
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef<string>(`mira-chat-${Date.now().toString(36)}`);

  // Connect to Phase 3 WebSocket on mount
  useEffect(() => {
    const sessionId = sessionIdRef.current;
    wsClient.connect(sessionId).catch((err) => {
      console.warn('[ChatPage] WebSocket initial connect:', err);
    });

    return () => {
      wsClient.disconnect();
    };
  }, []);

  // Auto-scroll on new message or state change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, agentState]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed && attachedFiles.length === 0) return;

    const userMsg: MultimodalMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: trimmed,
      attachments: attachedFiles.length > 0 ? { documents: attachedFiles } : undefined,
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setAttachedFiles([]);
    setAgentState('thinking');
    setLoopStage('UNDERSTANDS');

    try {
      let replyText = '';

      if (wsClient.getStatus() === 'connected') {
        const replyPromise = new Promise<string>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('WebSocket timeout')), 30000);
          const unsubscribe = wsClient.onMessage((payload) => {
            if (payload.response || payload.message) {
              clearTimeout(timeout);
              unsubscribe();
              resolve(payload.response || payload.message || '');
            } else if (payload.error) {
              clearTimeout(timeout);
              unsubscribe();
              reject(new Error(payload.error));
            }
          });
        });

        wsClient.sendChatMessage(trimmed);
        replyText = await replyPromise;
      } else {
        const res = await apiClient.sendChatMessage(trimmed, sessionIdRef.current);
        replyText = res.response;
      }

      setAgentState('speaking');
      setLoopStage('REASONS');

      const miraReply: MultimodalMessage = {
        id: `msg-mira-${Date.now()}`,
        sender: 'mira',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: replyText,
        agentTrace: {
          stage: 'UNDERSTANDS',
          thought: 'Generated in real-time by Gemini API with ContextCore working memory.',
        },
      };

      setChatMessages((prev) => [...prev, miraReply]);
      setTimeout(() => {
        setAgentState('idle');
      }, 1500);
    } catch (err) {
      console.error('[ChatPage] Backend call error:', err);
      setAgentState('error');
      const errorReply: MultimodalMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'mira',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `I encountered an issue connecting to the backend: ${(err as Error).message}`,
      };
      setChatMessages((prev) => [...prev, errorReply]);
      setTimeout(() => {
        setAgentState('idle');
      }, 2500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      addDocument(file);
      setAttachedFiles((prev) => [...prev, file.name]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const hasActivePerception =
    audioStream.isListening ||
    (visionFeed.isActive && (visionFeed.sourceType === 'screen' || visionFeed.sourceType === 'camera')) ||
    documents.length > 0;

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

      {/* Responsive Dual-Pane Layout: Left (Messages + Perception + Composer) | Right (Companion & Loop HUD) */}
      <div className="chat-dual-grid">
        {/* Left Pane: Conversation Viewport + Active Perception + Composer */}
        <div className="chat-left-pane">
          <div className="chat-messages-viewport" ref={scrollRef}>
            {chatMessages.map((msg) => (
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

          {/* Active Perception Chips: Only shown when corresponding modality is active */}
          {hasActivePerception && (
            <div className="active-perception-bar">
              <span className="perception-label">
                <Activity size={12} />
                <span>Active Perception:</span>
              </span>
              {audioStream.isListening && (
                <span className="perception-chip voice-active">
                  <Mic size={11} />
                  <span>Voice Stream</span>
                </span>
              )}
              {visionFeed.isActive && (visionFeed.sourceType === 'screen' || visionFeed.sourceType === 'camera') && (
                <span className="perception-chip vision-active">
                  <Eye size={11} />
                  <span>{visionFeed.sourceType === 'screen' ? 'Screen Feed' : 'Camera Feed'}</span>
                </span>
              )}
              {documents.length > 0 && (
                <span className="perception-chip docs-active">
                  <FileText size={11} />
                  <span>{documents.length} Doc{documents.length > 1 ? 's' : ''}</span>
                </span>
              )}
            </div>
          )}

          {/* Quick Suggestion Chips */}
          <div className="chat-quick-suggestions">
            <span className="suggestions-label">Suggestions:</span>
            <div className="suggestions-scroll">
              {PROMPT_SUGGESTIONS.map((prompt, idx) => (
                <button
                  key={idx}
                  className="chat-prompt-chip"
                  onClick={() => handleSendMessage(prompt)}
                >
                  <Sparkles size={12} style={{ color: 'var(--brand-primary)' }} />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Composer Input Bar */}
          <div className="chat-composer-dock">
            <div className="input-bar-container">
              {attachedFiles.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingBottom: 4 }}>
                  {attachedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="mira-badge"
                      style={{
                        background: 'var(--brand-primary-light)',
                        color: 'var(--brand-primary)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Paperclip size={10} />
                      <span>{file}</span>
                      <X
                        size={11}
                        style={{ cursor: 'pointer', marginLeft: 2 }}
                        onClick={() => removeAttachment(idx)}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="input-composer">
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />

                <button
                  className="mira-btn mira-btn-icon"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach Document or Image"
                >
                  <Paperclip size={17} style={{ color: 'var(--text-muted)' }} />
                </button>

                <input
                  type="text"
                  className="input-field"
                  placeholder="Speak or type a message to MIRA..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <button
                  className={`mic-toggle-btn ${audioStream.isListening ? 'listening' : ''}`}
                  onClick={toggleListening}
                  title={audioStream.isListening ? 'Stop Listening' : 'Start Voice Streaming'}
                >
                  {audioStream.isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <button
                  className="mira-btn mira-btn-icon send-btn"
                  onClick={() => handleSendMessage(inputText)}
                  disabled={!inputText.trim() && attachedFiles.length === 0}
                  title="Send message"
                >
                  <Send size={16} style={{ color: inputText.trim() ? 'var(--brand-primary)' : 'var(--text-muted)' }} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: MIRA Companion + ContextCore HUD */}
        <div className="chat-right-companion-panel">
          {/* MIRA Companion Prominent Mascot Card (~90px) */}
          <div className="companion-mascot-card">
            <div className="companion-avatar-stage">
              <MiraAvatar
                size={92}
                state={agentState}
                theme={theme}
                accessory={mascotAccessory}
                interactive={true}
              />
            </div>
            <div className="companion-mascot-name">MIRA Companion ✨</div>
            <span className="companion-mascot-tag">Real-Time Multimodal Assistant</span>

            <div className={`companion-state-pill ${agentState}`}>
              <span>{STATE_DISPLAY[agentState]?.icon || '✨'}</span>
              <span>{STATE_DISPLAY[agentState]?.label || agentState}</span>
            </div>
          </div>

          {/* 6-Stage Loop HUD Card */}
          <div className="cognitive-loop-hud-card">
            <div className="loop-hud-header">
              <div className="loop-hud-title">
                <Layers size={13} style={{ color: 'var(--brand-primary)' }} />
                <span>Cognitive Loop</span>
              </div>
              <span className="mira-badge mira-badge-mono" style={{ background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontWeight: 800 }}>
                {loopStage}
              </span>
            </div>

            <div className="loop-stages-stack">
              {COGNITIVE_STAGES.map((st) => {
                const Icon = st.icon;
                const isActive = loopStage === st.id;
                return (
                  <div key={st.id} className={`loop-stage-row ${isActive ? 'active' : ''}`}>
                    <div className="loop-stage-left">
                      <Icon size={13} />
                      <span>{st.label}</span>
                    </div>
                    {isActive && <span className="loop-stage-pill-badge">Active</span>}
                  </div>
                );
              })}
            </div>

            {/* ContextCore Anchors summary */}
            <div className="contextcore-mini-anchors">
              <span>ContextCore Anchors:</span>
              <strong style={{ color: 'var(--brand-primary)' }}>
                {contextCore.activeAnchors.length} tracked
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


