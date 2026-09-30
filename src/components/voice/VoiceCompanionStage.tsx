import React from 'react';
import { useMira } from '../../context/MiraContext';
import { MiraAvatar } from '../mascot/MiraAvatar';
import {
  Mic,
  VolumeX,
  Square,
  Settings,
} from 'lucide-react';

export const VoiceCompanionStage: React.FC = () => {
  const {
    agentState,
    theme,
    mascotAccessory,
    audioStream,
    toggleListening,
    toggleMute,
    setIsStudioOpen,
  } = useMira();

  const getStatusLabel = () => {
    switch (agentState) {
      case 'listening':
        return 'Listening...';
      case 'observing':
        return 'Observing...';
      case 'thinking':
      case 'processing':
      case 'planning':
        return 'Thinking...';
      case 'speaking':
        return 'Speaking...';
      case 'waiting for approval':
        return 'Approval Needed';
      case 'executing':
        return 'Working...';
      case 'verifying':
        return 'Checking...';
      case 'completed':
        return 'All Done! ✨';
      case 'error':
        return 'Oops! Error';
      case 'idle':
      default:
        return 'Ready';
    }
  };

  return (
    <div className="mira-card voice-mascot-stage-card">
      {/* Top Status Pill from Reference */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 14 }}>
        <div className="mascot-stage-pill">
          <span className="live-indicator-dot" style={{ backgroundColor: 'currentColor' }} />
          <span>{getStatusLabel()}</span>
        </div>
      </div>

      {/* Center: Big Animated MIRA Mascot with Flanking Soundwave Graphics */}
      <div className="mascot-stage-center">
        {/* Left Soundwave Bars */}
        <div className="stage-side-waves left">
          {audioStream.audioFrequencies.slice(0, 5).map((val, idx) => (
            <span
              key={idx}
              style={{
                height: `${Math.max(8, Math.min(38, Math.round(val * 40) + idx * 3))}px`,
                backgroundColor: audioStream.isListening ? 'var(--brand-primary)' : 'var(--border-medium)',
              }}
            />
          ))}
        </div>

        {/* Big Prominent Animated MIRA Mascot */}
        <div style={{ padding: '0 10px', position: 'relative' }}>
          <MiraAvatar
            size={110}
            state={agentState}
            theme={theme}
            accessory={mascotAccessory}
            interactive={true}
          />
        </div>

        {/* Right Soundwave Bars */}
        <div className="stage-side-waves right">
          {audioStream.audioFrequencies.slice(5, 10).map((val, idx) => (
            <span
              key={idx}
              style={{
                height: `${Math.max(8, Math.min(38, Math.round(val * 40) + (4 - idx) * 3))}px`,
                backgroundColor: audioStream.isListening ? 'var(--brand-primary)' : 'var(--border-medium)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Controls Row from Reference: Mute, Big Round Record/Stop, Settings */}
      <div className="mascot-stage-controls">
        {/* Mute Button */}
        <button
          className="stage-ctrl-btn"
          onClick={toggleMute}
          title={audioStream.isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          <div className="stage-ctrl-icon-circle">
            {audioStream.isMuted ? <VolumeX size={16} /> : <Mic size={16} />}
          </div>
          <span>{audioStream.isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        {/* Big Round Circular Coral/Rose Record/Stop Button */}
        <button
          className={`stage-big-action-btn ${audioStream.isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          title={audioStream.isListening ? 'Stop Listening' : 'Start Voice Streaming'}
        >
          {audioStream.isListening ? (
            <Square size={20} fill="white" />
          ) : (
            <Mic size={24} />
          )}
        </button>

        {/* Settings / Studio Button */}
        <button
          className="stage-ctrl-btn"
          onClick={() => setIsStudioOpen(true)}
          title="Open MIRA Studio Settings"
        >
          <div className="stage-ctrl-icon-circle">
            <Settings size={16} />
          </div>
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};
