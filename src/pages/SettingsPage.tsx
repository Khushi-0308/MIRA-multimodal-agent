import React from 'react';
import { useMira } from '../context/MiraContext';
import {
  Settings,
  Mic,
  Code2,
  Info,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    audioStream,
    setSpeechRate,
    devMode,
    setDevMode,
  } = useMira();

  return (
    <div className="page-container settings-page-container">
      {/* Settings Header */}
      <div className="settings-page-header">
        <div className="settings-header-info">
          <div className="icon-circle-badge settings-icon-badge">
            <Settings size={20} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <div>
            <div className="settings-title-row">
              <h2 className="settings-header-title">System Settings & Preferences</h2>
              <span className="status-pill ready">Active Session</span>
            </div>
            <p className="settings-header-sub">
              Audio I/O configuration, developer diagnostics, and hackathon system architecture
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="settings-main-grid">
        {/* Left Column: Config Groups */}
        <div className="settings-left-col">
          {/* Audio & Voice Configuration */}
          <div className="mira-card settings-group-card">
            <div className="mira-card-header">
              <div className="mira-card-title">
                <Mic size={16} style={{ color: 'var(--brand-primary)' }} />
                <span>Voice & Audio Stream Configuration</span>
              </div>
            </div>

            <div className="settings-card-body">
              <div className="setting-row">
                <div className="setting-meta">
                  <label className="setting-label">Active Audio Input Device</label>
                  <span className="setting-help">Microphone hardware stream used for VAD detection</span>
                </div>
                <select className="mira-select" defaultValue="default">
                  <option value="default">{audioStream.audioInputDevice}</option>
                  <option value="headset">Built-in Array Microphone</option>
                  <option value="virtual">Virtual Audio Cable (Stereo Mix)</option>
                </select>
              </div>

              <div className="setting-row">
                <div className="setting-meta">
                  <label className="setting-label">Text-to-Speech (TTS) Rate</label>
                  <span className="setting-help">Speech speed for MIRA's vocal responses ({audioStream.speechRate} WPM)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 200 }}>
                  <input
                    type="range"
                    min="100"
                    max="220"
                    step="5"
                    value={audioStream.speechRate}
                    onChange={(e) => setSpeechRate(Number(e.target.value))}
                    className="mira-slider"
                  />
                  <span style={{ fontSize: '12px', fontWeight: 700, minWidth: 50 }}>
                    {audioStream.speechRate} wpm
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Developer Mode & Diagnostics Toggle */}
          <div className="mira-card settings-group-card">
            <div className="mira-card-header">
              <div className="mira-card-title">
                <Code2 size={16} style={{ color: 'var(--brand-lavender)' }} />
                <span>Developer View & Raw Diagnostics</span>
              </div>
            </div>

            <div className="settings-card-body">
              <div className="setting-row">
                <div className="setting-meta">
                  <label className="setting-label">Developer Telemetry & State Simulator Bar</label>
                  <span className="setting-help">
                    Enable raw token budgets, Kubernetes logs, simulator bar, and technical engine metrics
                  </span>
                </div>
                <button
                  className={`mira-switch ${devMode ? 'active' : ''}`}
                  onClick={() => setDevMode(!devMode)}
                  title="Toggle Developer Mode"
                >
                  <span className="switch-knob" />
                </button>
              </div>

              <div style={{ padding: '8px 12px', background: 'var(--bg-surface-secondary)', borderRadius: '12px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                {devMode
                  ? '⚡ Developer View is ON. The top state simulator bar is visible across all pages to let you easily simulate and test any loop stage or emotion.'
                  : '✨ Companion View is ON. The interface shows friendly companion states by default ("Voice Ready", "Vision Ready", "Documents Ready").'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Project & Architecture Info */}
        <div className="settings-right-col">
          <div className="mira-card project-info-card">
            <div className="mira-card-header">
              <div className="mira-card-title">
                <Info size={16} style={{ color: 'var(--brand-primary)' }} />
                <span>Hackathon Project Specs</span>
              </div>
            </div>

            <div className="project-specs-list">
              <div className="spec-item">
                <span className="spec-label">Project Name:</span>
                <span className="spec-val">MIRA (Multimodal Intelligent Real-time Assistant)</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Hackathon:</span>
                <span className="spec-val">AI Build Challenge 2026</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Problem Statement:</span>
                <span className="spec-val">PS-05: Real-Time Voice & Multimodal Agents</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Core Loop:</span>
                <span className="spec-val">HEARS → SEES → UNDERSTANDS → REASONS → ACTS → VERIFIES</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Context Fusion:</span>
                <span className="spec-val">ContextCore Multimodal Ingestion</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Safety Gate:</span>
                <span className="spec-val">Human-in-the-Loop Verified Execution</span>
              </div>
            </div>

            <div className="project-badge-row">
              <span className="badge-tech">React 18</span>
              <span className="badge-tech">TypeScript</span>
              <span className="badge-tech">ContextCore</span>
              <span className="badge-tech">WebAudio API</span>
              <span className="badge-tech">Liquid Rose UI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
