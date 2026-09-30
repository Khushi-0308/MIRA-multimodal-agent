import React from 'react';
import { useMira } from '../context/MiraContext';
import { MiraAvatar } from '../components/mascot/MiraAvatar';
import { THEMES } from '../utils/themeConfig';
import { MiraThemeId, MascotAccessory, AgentState } from '../types/agent';
import {
  Sparkles,
  Palette,
  Check,
  Smile,
  Crown,
} from 'lucide-react';

interface AccessoryOption {
  id: MascotAccessory;
  name: string;
  tagline: string;
  badge: string;
}

const ACCESSORY_OPTIONS: AccessoryOption[] = [
  {
    id: 'bunny-ears',
    name: 'Bunny Ears',
    tagline: 'Cute, playful anime aesthetic with lively ear bobs',
    badge: 'Popular',
  },
  {
    id: 'cyber-headphones',
    name: 'Cyber Headset',
    tagline: 'Futuristic spatial audio cans with RGB earcups',
    badge: 'Tech',
  },
  {
    id: 'star-clip',
    name: 'Star Hairpin',
    tagline: 'Sparkly Y2K golden star pinned to the cloud',
    badge: 'Y2K',
  },
  {
    id: 'hologram-visor',
    name: 'Holo Visor',
    tagline: 'Iridescent holographic AR HUD scanner',
    badge: 'Cyber',
  },
  {
    id: 'none',
    name: 'Pure Minimal',
    tagline: 'Clean, unadorned organic jelly cloud companion',
    badge: 'Clean',
  },
];

const PREVIEW_STATES: Array<{ id: AgentState; label: string; icon: string }> = [
  { id: 'idle', label: 'Idle / Breathing', icon: '💖' },
  { id: 'listening', label: 'Listening Live', icon: '👂' },
  { id: 'observing', label: 'Observing Scene', icon: '👀' },
  { id: 'thinking', label: 'Thinking Deep', icon: '💭' },
  { id: 'speaking', label: 'Speaking Out', icon: '💬' },
  { id: 'waiting for approval', label: 'Waiting Approval', icon: '⏳' },
  { id: 'executing', label: 'Executing Action', icon: '⚡' },
  { id: 'verifying', label: 'Verifying Telemetry', icon: '🔍' },
  { id: 'completed', label: 'Celebrating', icon: '🎉' },
  { id: 'error', label: 'Cute Concerned', icon: '🥺' },
];

export const StudioPage: React.FC = () => {
  const {
    theme,
    setTheme,
    mascotAccessory,
    setMascotAccessory,
    agentState,
    setAgentState,
  } = useMira();

  return (
    <div className="page-container studio-page-container">
      {/* Studio Header */}
      <div className="studio-page-header">
        <div className="studio-header-info">
          <div className="icon-circle-badge studio-icon-badge">
            <Sparkles size={20} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <div>
            <div className="studio-title-row">
              <h2 className="studio-header-title">MIRA Studio</h2>
              <span className="status-pill ready">Gen-Z Customizer</span>
            </div>
            <p className="studio-header-sub">
              Personalize MIRA's theme palette, mascot accessories, and live emotional expressions
            </p>
          </div>
        </div>
      </div>

      {/* Top Hero: Live Avatar Preview Stage */}
      <div className="studio-hero-stage-card">
        <div className="studio-stage-left">
          <div className="studio-mascot-pod">
            <MiraAvatar
              size={120}
              state={agentState}
              theme={theme}
              accessory={mascotAccessory}
              interactive={true}
            />
            <span className="studio-touch-hint">Tap avatar to giggle & wave!</span>
          </div>

          <div className="studio-mascot-details">
            <div className="studio-active-title-row">
              <h3>MIRA • {THEMES[theme].name}</h3>
              <span className="active-theme-pill">{THEMES[theme].tagline}</span>
            </div>
            <p className="studio-active-desc">
              {THEMES[theme].aesthetic}. All changes automatically persist and update MIRA's appearance across every page.
            </p>

            {/* Current Active Accessory Pill */}
            <div className="current-accessory-display">
              <span className="acc-label">Active Accessory:</span>
              <strong className="acc-name">
                {ACCESSORY_OPTIONS.find((a) => a.id === mascotAccessory)?.name || 'None'}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: VISUAL ACCESSORY PICKER TILES (Requirement 7) */}
      <div className="studio-section">
        <div className="studio-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Crown size={18} style={{ color: 'var(--brand-primary)' }} />
            <h3 className="studio-section-title">Visual Accessory Picker</h3>
          </div>
          <span className="studio-section-sub">
            Select an accessory to dress your MIRA companion
          </span>
        </div>

        <div className="accessory-tiles-grid">
          {ACCESSORY_OPTIONS.map((acc) => {
            const isSelected = mascotAccessory === acc.id;
            return (
              <div
                key={acc.id}
                className={`accessory-tile ${isSelected ? 'selected' : ''}`}
                onClick={() => setMascotAccessory(acc.id)}
              >
                {/* Visual Avatar Preview Tile */}
                <div className="accessory-tile-preview-pod">
                  <MiraAvatar
                    size={58}
                    state="idle"
                    theme={theme}
                    accessory={acc.id}
                    interactive={false}
                  />
                  {isSelected && (
                    <div className="accessory-check-badge">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>

                <div className="accessory-tile-info">
                  <div className="accessory-tile-header">
                    <span className="accessory-tile-name">{acc.name}</span>
                    <span className="accessory-tile-tag">{acc.badge}</span>
                  </div>
                  <p className="accessory-tile-desc">{acc.tagline}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: 5 THEMES (Liquid Rose, Midnight, Glitter, Bold, Edge) */}
      <div className="studio-section">
        <div className="studio-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Palette size={18} style={{ color: 'var(--brand-primary)' }} />
            <h3 className="studio-section-title">5 Distinct Theme Palettes</h3>
          </div>
          <span className="studio-section-sub">
            Updates color system and organic background motion
          </span>
        </div>

        <div className="studio-themes-grid-refined">
          {(Object.keys(THEMES) as MiraThemeId[]).map((thmId) => {
            const cfg = THEMES[thmId];
            const isSelected = theme === thmId;
            return (
              <div
                key={thmId}
                className={`theme-card-refined ${isSelected ? 'selected' : ''}`}
                onClick={() => setTheme(thmId)}
              >
                <div className="theme-card-top-row">
                  <span className="theme-name" style={{ color: cfg.palette.text }}>
                    {cfg.name}
                  </span>
                  {isSelected && (
                    <div className="theme-selected-dot">
                      <Check size={11} strokeWidth={3} />
                    </div>
                  )}
                </div>

                <p className="theme-tagline-text">{cfg.tagline}</p>

                {/* Color Swatch Bar */}
                <div className="theme-swatch-row">
                  <div
                    className="swatch-cell"
                    style={{ background: cfg.palette.bg, border: '1px solid rgba(0,0,0,0.1)' }}
                    title="Background"
                  />
                  <div className="swatch-cell" style={{ background: cfg.palette.primary }} title="Primary" />
                  <div className="swatch-cell" style={{ background: cfg.palette.accent }} title="Accent" />
                  <div className="swatch-cell" style={{ background: cfg.palette.surface }} title="Surface" />
                  <div className="swatch-cell" style={{ background: cfg.palette.text }} title="Text" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: MASCOT EXPRESSIONS & EMOTIONS */}
      <div className="studio-section">
        <div className="studio-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Smile size={18} style={{ color: 'var(--brand-primary)' }} />
            <h3 className="studio-section-title">Mascot Emotional Expressions (10 States)</h3>
          </div>
          <span className="studio-section-sub">
            Test how MIRA reacts across the multimodal pipeline
          </span>
        </div>

        <div className="expressions-chips-grid">
          {PREVIEW_STATES.map((st) => (
            <button
              key={st.id}
              className={`expression-chip-btn ${agentState === st.id ? 'active' : ''}`}
              onClick={() => setAgentState(st.id)}
            >
              <span className="expression-icon">{st.icon}</span>
              <span className="expression-label">{st.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
