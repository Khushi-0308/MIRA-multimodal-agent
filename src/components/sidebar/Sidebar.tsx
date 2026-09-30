import React from 'react';
import { useMira } from '../../context/MiraContext';
import { MiraAvatar } from '../mascot/MiraAvatar';
import {
  Home,
  MessageSquare,
  Camera,
  FileText,
  Zap,
  Settings,
  Sparkles,
  LucideIcon,
  Code2,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'Home', label: 'Home', icon: Home },
  { id: 'Chat', label: 'Chat', icon: MessageSquare },
  { id: 'Vision', label: 'Vision', icon: Camera },
  { id: 'Documents', label: 'Documents', icon: FileText },
  { id: 'Actions', label: 'Actions', icon: Zap },
  { id: 'Studio', label: 'MIRA Studio', icon: Sparkles, badge: '5 Themes' },
  { id: 'Settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const {
    activeNavTab,
    setActiveNavTab,
    theme,
    agentState,
    mascotAccessory,
    devMode,
    setDevMode,
  } = useMira();

  return (
    <aside className="mira-sidebar">
      {/* Top Brand Logo */}
      <div className="sidebar-brand" onClick={() => setActiveNavTab('Home')} style={{ cursor: 'pointer' }}>
        <div className="sidebar-logo-avatar">
          <MiraAvatar size={38} state={agentState} theme={theme} accessory={mascotAccessory} interactive={true} />
        </div>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">MIRA</div>
          <div className="sidebar-brand-sub">Real-Time Multimodal Agent</div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNavTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveNavTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="sidebar-badge-new">{item.badge}</span>}
            </button>
          );
        })}

        {/* Developer Mode Toggle */}
        <div className="sidebar-dev-mode-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Code2 size={14} style={{ color: devMode ? 'var(--brand-primary)' : 'var(--text-muted)' }} />
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Developer View
              </span>
            </div>
            <button
              className={`mira-switch ${devMode ? 'active' : ''}`}
              onClick={() => setDevMode(!devMode)}
              title="Toggle Technical Telemetry & Developer View"
            >
              <span className="switch-knob" />
            </button>
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 3 }}>
            {devMode ? 'Showing token budgets & simulator' : 'Companion view active'}
          </div>
        </div>
      </nav>

      {/* Bottom Companion Greeting Card */}
      <div
        className="sidebar-companion-card"
        onClick={() => setActiveNavTab('Home')}
        style={{ cursor: 'pointer' }}
        title="Go to Home"
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
          <MiraAvatar size={74} state={agentState} theme={theme} accessory={mascotAccessory} interactive={true} />
        </div>
        <div className="sidebar-companion-title">
          Hi, I'm MIRA ✨
        </div>
        <p className="sidebar-companion-desc">
          Click me to head home or test my reactions! 💖
        </p>
      </div>
    </aside>
  );
};
