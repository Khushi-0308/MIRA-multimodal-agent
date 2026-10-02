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
  Check,
  AlertCircle,
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
    agentState,
    setActiveNavTab,
    activeNavTab,
    devMode,
    setDevMode,
    metrics,
  } = useMira();

  // Derive dynamic pipeline status for each stage based on live agent state
  const getStageStatus = (_stageId: LoopStage, index: number) => {
    if (agentState === 'completed') {
      return 'completed';
    }

    if (agentState === 'error') {
      let errIndex = 0;
      if (loopStage === 'SEES') errIndex = 1;
      else if (loopStage === 'UNDERSTANDS') errIndex = 2;
      else if (loopStage === 'REASONS') errIndex = 3;
      else if (loopStage === 'ACTS') errIndex = 4;
      else if (loopStage === 'VERIFIES') errIndex = 5;

      if (index === errIndex) return 'error';
      if (index < errIndex) return 'completed';
      return 'subtle';
    }

    let activeIndex = -1;
    switch (agentState) {
      case 'listening':
        activeIndex = 0; // HEARS
        break;
      case 'observing':
        activeIndex = 1; // SEES
        break;
      case 'thinking':
      case 'processing':
      case 'planning':
        activeIndex = 2; // UNDERSTANDS
        break;
      case 'speaking':
        activeIndex = 3; // REASONS
        break;
      case 'waiting for approval':
      case 'executing':
        activeIndex = 4; // ACTS
        break;
      case 'verifying':
        activeIndex = 5; // VERIFIES
        break;
      default:
        // Idle or resting
        activeIndex = -1;
        break;
    }

    if (activeIndex === -1) {
      return 'idle';
    }

    if (index === activeIndex) {
      return 'active';
    }
    if (index < activeIndex) {
      return 'completed';
    }
    return 'subtle';
  };

  return (
    <header className="mira-topbar">
      {/* Multimodal 6-Step Loop Tracker */}
      <div className="topbar-loop-tracker" role="navigation" aria-label="Agent Multimodal Pipeline">
        {LOOP_STAGES.map((step, idx) => {
          const Icon = step.icon;
          const status = getStageStatus(step.id, idx);
          const isAct = status === 'active';
          const isDone = status === 'completed';
          const isErr = status === 'error';

          return (
            <div
              key={step.id}
              className={`topbar-loop-pill ${isAct ? 'active' : ''} ${isDone ? 'completed' : ''} ${isErr ? 'error' : ''} ${status === 'subtle' ? 'subtle' : ''}`}
              title={`${step.label}: ${status.toUpperCase()}`}
            >
              {isDone ? (
                <Check size={13} strokeWidth={2.8} className="pipeline-check-icon" />
              ) : isErr ? (
                <AlertCircle size={13} className="pipeline-err-icon" />
              ) : (
                <Icon size={14} className={isAct ? 'pipeline-active-icon' : ''} />
              )}
              <span>{step.label}</span>
              {isAct && <span className="pipeline-pulse-dot" />}
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
