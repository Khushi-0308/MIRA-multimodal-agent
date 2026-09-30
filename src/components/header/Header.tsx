import React from 'react';
import { useMira } from '../../context/MiraContext';
import { LoopStage } from '../../types/agent';
import {
  Activity,
  Mic,
  Eye,
  Lightbulb,
  Sparkles,
  Play,
  ShieldCheck,
  Bell,
  LucideIcon,
  Code2,
} from 'lucide-react';

const LOOP_STAGES: Array<{ id: LoopStage; label: string; icon: LucideIcon }> = [
  { id: 'HEARS', label: 'Hear', icon: Mic },
  { id: 'SEES', label: 'See', icon: Eye },
  { id: 'UNDERSTANDS', label: 'Understand', icon: Lightbulb },
  { id: 'REASONS', label: 'Reason', icon: Sparkles },
  { id: 'ACTS', label: 'Act', icon: Play },
  { id: 'VERIFIES', label: 'Verify', icon: ShieldCheck },
];

export const Header: React.FC = () => {
  const {
    loopStage,
    setActiveNavTab,
    activeNavTab,
    devMode,
    setDevMode,
    metrics,
  } = useMira();

  return (
    <header className="mira-topbar">
      {/* Multimodal 6-Step Loop Tracker */}
      <div className="topbar-loop-tracker">
        {LOOP_STAGES.map((step) => {
          const Icon = step.icon;
          const isActive = loopStage === step.id;
          return (
            <div
              key={step.id}
              className={`topbar-loop-pill ${isActive ? 'active' : ''}`}
            >
              <Icon size={14} />
              <span>{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Right Controls: Online Status, Studio, Dev Mode, Notifications, User */}
      <div className="topbar-right">
        {/* Friendly Online Status */}
        <div className="topbar-status-badge">
          <span className="live-green-dot" />
          <span>Session Active</span>
        </div>

        {/* Developer Mode telemetry indicator if enabled */}
        {devMode && (
          <div className="mira-badge mira-badge-mono" style={{ background: '#fef3c7', color: '#92400e' }}>
            <Activity size={12} className="text-amber-500" />
            <span>{metrics.fps} FPS • {metrics.sttLatencyMs}ms</span>
          </div>
        )}

        {/* MIRA Studio Button */}
        <button
          className={`mira-btn topbar-studio-btn ${activeNavTab === 'Studio' ? 'mira-btn-primary' : ''}`}
          onClick={() => setActiveNavTab('Studio')}
          title="Open MIRA Studio to change themes & companion style"
        >
          <Sparkles size={14} />
          <span>MIRA Studio</span>
        </button>

        {/* Developer Mode Quick Toggle */}
        <button
          className={`mira-btn mira-btn-sm ${devMode ? 'mira-btn-primary' : ''}`}
          onClick={() => setDevMode(!devMode)}
          title="Toggle Developer Telemetry View"
        >
          <Code2 size={13} />
          <span>{devMode ? 'Dev View: ON' : 'Dev View'}</span>
        </button>

        {/* Bell Notifications */}
        <button className="topbar-icon-btn" title="Notifications">
          <Bell size={16} />
        </button>

        {/* User Profile Chip */}
        <div className="topbar-user-avatar" title="User Profile">
          <span style={{ fontSize: '15px' }}>🌸</span>
        </div>
      </div>
    </header>
  );
};
