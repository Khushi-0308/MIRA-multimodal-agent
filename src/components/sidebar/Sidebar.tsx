import React, { useState } from 'react';
import { useMira } from '../../context/MiraContext';
import { MiraAvatar } from '../mascot/MiraAvatar';
import {
  Home,
  Sun,
  MessageSquare,
  Camera,
  FileText,
  Zap,
  Settings,
  Sparkles,
  LucideIcon,
  Code2,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'Home', label: 'Home', icon: Home },
  { id: 'MyDay', label: 'My Day', icon: Sun, badge: 'Today' },
  { id: 'Chat', label: 'Chat', icon: MessageSquare },
  { id: 'Vision', label: 'Vision', icon: Camera },
  { id: 'Documents', label: 'Documents', icon: FileText },
  { id: 'Actions', label: 'Actions', icon: Zap },
  { id: 'Studio', label: 'MIRA Studio', icon: Sparkles, badge: '5 Themes' },
  { id: 'Account', label: 'Account & Login', icon: User, badge: 'Accounts' },
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
    user,
  } = useMira();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mira_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('mira_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  return (
    <aside className={`mira-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Edge Collapse / Expand Toggle Button */}
      <button
        className="sidebar-collapse-toggle-btn"
        onClick={toggleCollapse}
        title={isCollapsed ? 'Expand Navigation Panel' : 'Collapse Navigation Panel'}
        aria-label={isCollapsed ? 'Expand Navigation Panel' : 'Collapse Navigation Panel'}
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Top Brand Logo */}
      <div
        className="sidebar-brand"
        onClick={() => setActiveNavTab('Home')}
        style={{ cursor: 'pointer' }}
        title={isCollapsed ? 'MIRA - Home' : undefined}
      >
        <div className="sidebar-logo-avatar">
          <MiraAvatar
            size={isCollapsed ? 32 : 38}
            state={agentState}
            theme={theme}
            accessory={mascotAccessory}
            interactive={true}
          />
        </div>
        {!isCollapsed && (
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-name">MIRA</div>
            <div className="sidebar-brand-sub">Real-Time Multimodal Agent</div>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNavTab === item.id;
          const isAccountItem = item.id === 'Account';
          const displayLabel = isAccountItem && user ? user.name : item.label;
          const displayBadge = isAccountItem && user ? user.role : item.badge;

          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveNavTab(item.id)}
              title={isCollapsed ? undefined : displayLabel}
            >
              {isAccountItem && user ? (
                <span style={{ fontSize: isCollapsed ? '16px' : '15px', lineHeight: 1 }}>{user.avatar}</span>
              ) : (
                <Icon size={isCollapsed ? 20 : 18} />
              )}
              {!isCollapsed && <span>{displayLabel}</span>}
              {!isCollapsed && displayBadge && <span className="sidebar-badge-new">{displayBadge}</span>}
              {isCollapsed && <span className="sidebar-tooltip">{displayLabel}</span>}
            </button>
          );
        })}

        {/* Developer Mode Toggle */}
        {!isCollapsed ? (
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
        ) : (
          <button
            className={`sidebar-nav-item ${devMode ? 'active' : ''}`}
            onClick={() => setDevMode(!devMode)}
            style={{ marginTop: 8 }}
            aria-label="Toggle Developer View"
          >
            <Code2 size={20} style={{ color: devMode ? 'var(--brand-primary)' : 'var(--text-muted)' }} />
            <span className="sidebar-tooltip">Developer View: {devMode ? 'ON' : 'OFF'}</span>
          </button>
        )}
      </nav>

      {/* Bottom Companion Greeting Card */}
      {!isCollapsed ? (
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
      ) : (
        <div
          className="sidebar-companion-mini"
          onClick={() => setActiveNavTab('Home')}
          title="Hi, I'm MIRA ✨"
        >
          <MiraAvatar size={34} state={agentState} theme={theme} accessory={mascotAccessory} interactive={true} />
          <span className="sidebar-tooltip">Hi, I'm MIRA ✨</span>
        </div>
      )}
    </aside>
  );
};
