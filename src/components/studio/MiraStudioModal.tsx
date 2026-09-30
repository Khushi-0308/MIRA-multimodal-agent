import React from 'react';
import { useMira } from '../../context/MiraContext';
import { MiraAvatar } from '../mascot/MiraAvatar';
import { THEMES } from '../../utils/themeConfig';
import { MiraThemeId, MascotAccessory, AgentState } from '../../types/agent';
import {
  Sparkles,
  X,
  Palette,
  Check,
  Smile,
} from 'lucide-react';

const ACCESSORIES: Array<{ id: MascotAccessory; label: string; icon: string }> = [
  { id: 'bunny-ears', label: 'Bunny Ears', icon: '🐰' },
  { id: 'cyber-headphones', label: 'Cyber Headset', icon: '🎧' },
  { id: 'star-clip', label: 'Star Hairpin', icon: '⭐' },
  { id: 'none', label: 'Sleek Minimal', icon: '✨' },
];

const PREVIEW_STATES: AgentState[] = [
  'idle',
  'listening',
  'observing',
  'thinking',
  'speaking',
  'waiting for approval',
  'executing',
  'verifying',
  'completed',
  'error',
];

export const MiraStudioModal: React.FC = () => {
  const {
    isStudioOpen,
    setIsStudioOpen,
    theme,
    setTheme,
    mascotAccessory,
    setMascotAccessory,
    agentState,
    setAgentState,
  } = useMira();

  if (!isStudioOpen) return null;

  return (
    <div className="mira-modal-backdrop" onClick={() => setIsStudioOpen(false)}>
      <div
        className="mira-modal studio-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 740, borderRadius: '28px' }}
      >
        {/* Studio Modal Header */}
        <div className="mira-card-header" style={{ padding: '16px 22px' }}>
          <div className="mira-card-title" style={{ fontSize: '16px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '12px',
                background: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Sparkles size={16} />
            </div>
            <span>MIRA Studio • Companion Customization</span>
            <span
              className="mira-badge"
              style={{ background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontWeight: 700 }}
            >
              GEN-Z AESTHETICS
            </span>
          </div>

          <button
            className="mira-btn mira-btn-icon"
            onClick={() => setIsStudioOpen(false)}
            title="Close MIRA Studio"
          >
            <X size={18} />
          </button>
        </div>

        {/* Studio Body */}
        <div className="mira-card-body" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top Hero: Live Avatar Preview Stage */}
          <div className="studio-avatar-stage">
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ background: 'var(--bg-surface-secondary)', padding: '16px', borderRadius: '24px', border: '1px solid var(--border-subtle)' }}>
                <MiraAvatar
                  state={agentState}
                  size={100}
                  theme={theme}
                  accessory={mascotAccessory}
                  interactive={true}
                />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    MIRA Companion • {THEMES[theme].name}
                  </h3>
                  <span className="mira-badge" style={{ background: 'var(--brand-primary)', color: 'white', fontWeight: 600 }}>
                    Active
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {THEMES[theme].tagline}. {THEMES[theme].aesthetic}.
                </p>

                {/* Accessory Selector Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                    ACCESSORY:
                  </span>
                  {ACCESSORIES.map((acc) => (
                    <button
                      key={acc.id}
                      className={`studio-pill-btn ${mascotAccessory === acc.id ? 'active' : ''}`}
                      onClick={() => setMascotAccessory(acc.id)}
                    >
                      <span>{acc.icon}</span>
                      <span>{acc.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Theme Palette Cards: All 5 Themes */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Palette size={15} style={{ color: 'var(--brand-primary)' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  CHOOSE THEME PALETTE (Saved Locally)
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                5 Gen-Z Themes with Custom Palettes & Typographies
              </span>
            </div>

            <div className="studio-themes-grid">
              {(Object.keys(THEMES) as MiraThemeId[]).map((thmId) => {
                const cfg = THEMES[thmId];
                const isSelected = theme === thmId;
                return (
                  <div
                    key={thmId}
                    className={`studio-theme-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setTheme(thmId)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: cfg.palette.text }}>
                        {cfg.name}
                      </span>
                      {isSelected && (
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: cfg.palette.primary,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check size={11} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 10, minHeight: '28px' }}>
                      {cfg.tagline}
                    </div>

                    {/* Color Swatch Bar */}
                    <div style={{ display: 'flex', gap: 5, borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ height: 16, flex: 1, background: cfg.palette.bg, border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }} title="Background" />
                      <div style={{ height: 16, flex: 1, background: cfg.palette.primary, borderRadius: '4px' }} title="Primary" />
                      <div style={{ height: 16, flex: 1, background: cfg.palette.accent, borderRadius: '4px' }} title="Accent" />
                      <div style={{ height: 16, flex: 1, background: cfg.palette.text, borderRadius: '4px' }} title="Text" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Mascot State Tester */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Smile size={14} style={{ color: 'var(--brand-primary)' }} />
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                PREVIEW MASCOT EXPRESSIONS ({PREVIEW_STATES.length} States)
              </span>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PREVIEW_STATES.map((st) => (
                <button
                  key={st}
                  className={`studio-pill-btn ${agentState === st ? 'active' : ''}`}
                  onClick={() => setAgentState(st)}
                >
                  <span>{st}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-secondary)',
          }}
        >
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            ✨ Theme settings are saved automatically in your browser's local storage.
          </div>

          <button
            className="mira-btn mira-btn-primary"
            style={{ borderRadius: 'var(--radius-pill)', padding: '8px 18px' }}
            onClick={() => setIsStudioOpen(false)}
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
