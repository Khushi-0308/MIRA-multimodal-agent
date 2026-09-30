import React from 'react';
import { useMira } from '../../context/MiraContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
} from 'lucide-react';

export const VoicePanel: React.FC = () => {
  const {
    audioStream,
    toggleListening,
    toggleMute,
    setSpeechRate,
    simulateSpeechInput,
  } = useMira();

  return (
    <div className="mira-card voice-card">
      {/* Card Header */}
      <div className="mira-card-header">
        <div className="mira-card-title">
          <Mic size={15} style={{ color: audioStream.isListening ? 'var(--state-listening)' : 'var(--text-secondary)' }} />
          <span>Voice Control & Audio Stream</span>
          {audioStream.isListening && (
            <span className="mira-badge" style={{ background: '#ffe4e6', color: '#e11d48' }}>
              <span className="live-indicator-dot" style={{ backgroundColor: '#e11d48' }} />
              LIVE DUPLEX
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            className={`mira-btn mira-btn-sm ${audioStream.isListening ? 'mira-btn-danger' : 'mira-btn-primary'}`}
            onClick={toggleListening}
          >
            {audioStream.isListening ? <MicOff size={12} /> : <Mic size={12} />}
            <span>{audioStream.isListening ? 'Stop Mic' : 'Start Mic'}</span>
          </button>
        </div>
      </div>

      <div className="mira-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Real-Time Frequency Spectrum Visualizer */}
        <div className="voice-spectrum-container">
          {audioStream.audioFrequencies.map((val, idx) => {
            const heightPct = Math.max(8, Math.min(100, Math.round(val * 100)));
            return (
              <div
                key={idx}
                className={`spectrum-bar ${audioStream.vadActive ? 'active' : ''}`}
                style={{ height: `${heightPct}%` }}
              />
            );
          })}
        </div>

        {/* Audio Status & Volume Meter */}
        <div className="voice-status-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="mira-btn mira-btn-icon"
              onClick={toggleMute}
              title={audioStream.isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {audioStream.isMuted ? <VolumeX size={15} className="text-red-500" /> : <Volume2 size={15} />}
            </button>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {audioStream.audioInputDevice}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                16kHz PCM • Opus Ingress • VAD: {audioStream.vadActive ? 'DETECTED' : 'QUIET'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              className="mira-badge mira-badge-mono"
              style={{
                background: audioStream.vadActive ? '#fee2e2' : '#f1f5f9',
                color: audioStream.vadActive ? '#b91c1c' : '#64748b',
                fontWeight: 600,
              }}
            >
              <Radio size={10} className={audioStream.vadActive ? 'animate-pulse' : ''} />
              {audioStream.inputVolume}% VOL
            </span>
          </div>
        </div>

        {/* Quick Voice Demo Triggers */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
              TEST VOICE PROMPTS:
            </span>
            <span style={{ fontSize: '10px', color: 'var(--brand-primary)', cursor: 'pointer' }} onClick={() => setSpeechRate(150)}>
              Rate: {audioStream.speechRate} wpm
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              className="mira-btn mira-btn-sm"
              style={{ fontSize: '10.5px' }}
              onClick={() => simulateSpeechInput('MIRA, inspect the pod logs and check why memory exceeded.')}
            >
              <Sparkles size={11} />
              "Inspect pod logs"
            </button>
            <button
              className="mira-btn mira-btn-sm"
              style={{ fontSize: '10.5px' }}
              onClick={() => simulateSpeechInput('Explain the difference between the YAML manifest and current cluster state.')}
            >
              <Sparkles size={11} />
              "Compare manifest"
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
