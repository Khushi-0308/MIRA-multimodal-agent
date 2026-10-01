import React, { useState } from 'react';
import { useMira } from '../../context/MiraContext';
import { MiraAvatar } from '../mascot/MiraAvatar';
import { THEMES, WORLD_PROFILES } from '../../utils/themeConfig';
import {
  MiraThemeId,
  MascotAccessory,
  AgentState,
  WorldAtmosphere,
  WorldParticle,
  MascotAura,
  InterfaceStyle,
  CursorEffect,
} from '../../types/agent';
import {
  Sparkles,
  X,
  Palette,
  Check,
  Globe2,
  Sliders,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  Layers,
  MousePointer,
  Wind,
  Crown,
} from 'lucide-react';

const ACCESSORIES: Array<{ id: MascotAccessory; label: string; icon: string }> = [
  { id: 'bunny-ears', label: 'Bunny Ears', icon: '🐰' },
  { id: 'cyber-headphones', label: 'Cyber Headset', icon: '🎧' },
  { id: 'star-clip', label: 'Star Hairpin', icon: '⭐' },
  { id: 'hologram-visor', label: 'Holo Visor', icon: '🕶️' },
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

const ATMOSPHERE_OPTIONS: Array<{ id: WorldAtmosphere; name: string; icon: string }> = [
  { id: 'blossom-breeze', name: 'Blossom Breeze', icon: '🌸' },
  { id: 'deep-nebula', name: 'Deep Nebula', icon: '🌌' },
  { id: 'aurora-dream', name: 'Aurora Dream', icon: '✨' },
  { id: 'cyber-grid', name: 'Cyber Grid', icon: '🌐' },
  { id: 'retro-scanlines', name: 'Retro Scanlines', icon: '📟' },
  { id: 'minimal-zen', name: 'Minimal Zen', icon: '🍃' },
];

const PARTICLE_OPTIONS: Array<{ id: WorldParticle; name: string; icon: string }> = [
  { id: 'petals-confetti', name: 'Petals & Confetti', icon: '🌸' },
  { id: 'stardust-sparkles', name: 'Stardust Sparkles', icon: '✨' },
  { id: 'floating-orbs', name: 'Floating Orbs', icon: '🔮' },
  { id: 'matrix-rain', name: 'Matrix Rain', icon: '⚡' },
  { id: 'constellations', name: 'Constellations', icon: '🌌' },
  { id: 'none', name: 'No Particles', icon: '🚫' },
];

const AURA_OPTIONS: Array<{ id: MascotAura; name: string; icon: string }> = [
  { id: 'pastel-mist', name: 'Pastel Mist', icon: '🌸' },
  { id: 'celestial-halo', name: 'Celestial Halo', icon: '👑' },
  { id: 'neon-glow', name: 'Neon Cyber Glow', icon: '⚡' },
  { id: 'pulse-wave', name: 'Pulse Radar', icon: '📡' },
  { id: 'off', name: 'No Aura', icon: '🚫' },
];

const INTERFACE_STYLES: Array<{ id: InterfaceStyle; name: string; icon: string }> = [
  { id: 'glass', name: 'Frosted Glass', icon: '🪟' },
  { id: 'solid', name: 'Neo-Brutalist Solid', icon: '⬛' },
  { id: 'soft', name: 'Soft Pastel', icon: '☁️' },
  { id: 'holographic', name: 'Holographic Cyber', icon: '💿' },
];

const CURSOR_EFFECTS: Array<{ id: CursorEffect; name: string; icon: string }> = [
  { id: 'sparkle-trail', name: 'Sparkle Trail', icon: '✨' },
  { id: 'neon-dot', name: 'Neon Dot', icon: '🟣' },
  { id: 'aura-ring', name: 'Aura Rings', icon: '⭕' },
  { id: 'standard', name: 'Standard', icon: '🖱️' },
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
    worldSettings,
    updateWorldSettings,
    resetWorldToThemeDefault,
    playWorldSound,
  } = useMira();

  const [modalTab, setModalTab] = useState<'world' | 'theme' | 'mascot'>('world');

  if (!isStudioOpen) return null;

  const currentProfile = WORLD_PROFILES[theme] || WORLD_PROFILES['liquid-rose'];

  return (
    <div className="mira-modal-backdrop" onClick={() => setIsStudioOpen(false)}>
      <div
        className="mira-modal studio-modal world-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 780, borderRadius: '28px', maxHeight: '90vh', overflowY: 'auto' }}
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
              <Globe2 size={16} />
            </div>
            <span>MIRA World • Customization Studio</span>
            <span
              className="mira-badge"
              style={{ background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontWeight: 700 }}
            >
              LIVE STUDIO
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              className="mira-btn my-day-sub-btn"
              style={{ padding: '4px 8px', fontSize: '11px' }}
              onClick={() => {
                resetWorldToThemeDefault(theme);
                playWorldSound('sparkle');
              }}
              title="Reset to theme defaults"
            >
              <RotateCcw size={11} />
              <span>Reset</span>
            </button>
            <button
              className="mira-btn mira-btn-icon"
              onClick={() => setIsStudioOpen(false)}
              title="Close MIRA Studio"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Category Navigation Tabs */}
        <div style={{ padding: '0 22px', display: 'flex', gap: 6, borderBottom: '1px solid var(--border-subtle)' }}>
          <button
            className={`studio-category-tab ${modalTab === 'world' ? 'active' : ''}`}
            style={{ padding: '8px 14px', fontSize: '12px' }}
            onClick={() => {
              setModalTab('world');
              playWorldSound('click');
            }}
          >
            <Sliders size={13} />
            <span>World Layers</span>
          </button>
          <button
            className={`studio-category-tab ${modalTab === 'theme' ? 'active' : ''}`}
            style={{ padding: '8px 14px', fontSize: '12px' }}
            onClick={() => {
              setModalTab('theme');
              playWorldSound('click');
            }}
          >
            <Palette size={13} />
            <span>5 Themes</span>
          </button>
          <button
            className={`studio-category-tab ${modalTab === 'mascot' ? 'active' : ''}`}
            style={{ padding: '8px 14px', fontSize: '12px' }}
            onClick={() => {
              setModalTab('mascot');
              playWorldSound('click');
            }}
          >
            <Crown size={13} />
            <span>Mascot & Expressions</span>
          </button>
        </div>

        {/* Studio Body */}
        <div className="mira-card-body" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Top Hero: Live Avatar Preview Stage with Active Aura */}
          <div className="studio-avatar-stage" style={{ background: 'var(--bg-surface-secondary)', borderRadius: '20px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <MiraAvatar
                  state={agentState}
                  size={92}
                  theme={theme}
                  accessory={mascotAccessory}
                  aura={worldSettings.mascotAura}
                  interactive={true}
                />
              </div>

              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {currentProfile.worldName}
                  </h3>
                  <span className="mira-badge" style={{ background: 'var(--brand-primary)', color: 'white', fontWeight: 600 }}>
                    {THEMES[theme].name}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 8 }}>
                  {currentProfile.worldTagline}
                </p>

                {/* Quick Info Badges */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className="world-tag-chip" style={{ fontSize: '10px', padding: '2px 6px' }}>
                    Atmosphere: <strong>{worldSettings.atmosphere}</strong>
                  </span>
                  <span className="world-tag-chip" style={{ fontSize: '10px', padding: '2px 6px' }}>
                    Style: <strong>{worldSettings.interfaceStyle}</strong>
                  </span>
                  <span className="world-tag-chip" style={{ fontSize: '10px', padding: '2px 6px' }}>
                    Motion: <strong>{worldSettings.intensity}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: WORLD CONTROLS */}
          {modalTab === 'world' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 1. Atmosphere */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Globe2 size={13} style={{ color: 'var(--brand-primary)' }} />
                  <span>1. Atmosphere Backdrop</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 6 }}>
                  {ATMOSPHERE_OPTIONS.map((atm) => (
                    <button
                      key={atm.id}
                      className={`particle-pill-btn ${worldSettings.atmosphere === atm.id ? 'selected' : ''}`}
                      onClick={() => {
                        updateWorldSettings({ atmosphere: atm.id });
                        playWorldSound('toggle');
                      }}
                    >
                      <span>{atm.icon}</span>
                      <span>{atm.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Particles */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={13} style={{ color: 'var(--brand-primary)' }} />
                  <span>2. Particle / FX Simulation</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 6 }}>
                  {PARTICLE_OPTIONS.map((part) => (
                    <button
                      key={part.id}
                      className={`particle-pill-btn ${worldSettings.particle === part.id ? 'selected' : ''}`}
                      onClick={() => {
                        updateWorldSettings({ particle: part.id });
                        playWorldSound('sparkle');
                      }}
                    >
                      <span>{part.icon}</span>
                      <span>{part.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Animation Intensity */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={13} style={{ color: 'var(--brand-primary)' }} />
                  <span>3. Animation Intensity</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['calm', 'soft', 'energetic'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      className={`particle-pill-btn ${worldSettings.intensity === lvl ? 'selected' : ''}`}
                      style={{ flex: 1 }}
                      onClick={() => {
                        updateWorldSettings({ intensity: lvl });
                        playWorldSound('toggle');
                      }}
                    >
                      <span>{lvl === 'calm' ? '🕊️ Calm' : lvl === 'soft' ? '🍃 Soft' : '⚡ Energetic'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Mascot Aura */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Crown size={13} style={{ color: 'var(--brand-primary)' }} />
                  <span>4. MIRA Mascot Aura / Glow</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 6 }}>
                  {AURA_OPTIONS.map((aur) => (
                    <button
                      key={aur.id}
                      className={`particle-pill-btn ${worldSettings.mascotAura === aur.id ? 'selected' : ''}`}
                      onClick={() => {
                        updateWorldSettings({ mascotAura: aur.id });
                        playWorldSound('sparkle');
                      }}
                    >
                      <span>{aur.icon}</span>
                      <span>{aur.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Interface Style */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Layers size={13} style={{ color: 'var(--brand-primary)' }} />
                  <span>5. Interface Physical Style</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 6 }}>
                  {INTERFACE_STYLES.map((st) => (
                    <button
                      key={st.id}
                      className={`particle-pill-btn ${worldSettings.interfaceStyle === st.id ? 'selected' : ''}`}
                      onClick={() => {
                        updateWorldSettings({ interfaceStyle: st.id });
                        playWorldSound('warp');
                      }}
                    >
                      <span>{st.icon}</span>
                      <span>{st.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Cursor Effect */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MousePointer size={13} style={{ color: 'var(--brand-primary)' }} />
                  <span>6. Cursor Trail Effect</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 6 }}>
                  {CURSOR_EFFECTS.map((eff) => (
                    <button
                      key={eff.id}
                      className={`particle-pill-btn ${worldSettings.cursorEffect === eff.id ? 'selected' : ''}`}
                      onClick={() => {
                        updateWorldSettings({ cursorEffect: eff.id });
                        playWorldSound('click');
                      }}
                    >
                      <span>{eff.icon}</span>
                      <span>{eff.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 7 & 8. Audio & Motion Switches */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* Sound Toggle */}
                <div className="toggle-box-card" style={{ padding: '10px 12px' }}>
                  <div className="toggle-box-info">
                    <div className="toggle-title" style={{ fontSize: '12px' }}>
                      {worldSettings.uiSoundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                      <span>UI Audio Sound</span>
                    </div>
                  </div>
                  <button
                    className={`mira-switch ${worldSettings.uiSoundEnabled ? 'active' : ''}`}
                    onClick={() => {
                      const next = !worldSettings.uiSoundEnabled;
                      updateWorldSettings({ uiSoundEnabled: next });
                      if (next) playWorldSound('chime');
                    }}
                  >
                    <span className="switch-knob" />
                  </button>
                </div>

                {/* Reduced Motion Toggle */}
                <div className="toggle-box-card" style={{ padding: '10px 12px' }}>
                  <div className="toggle-box-info">
                    <div className="toggle-title" style={{ fontSize: '12px' }}>
                      <Wind size={14} />
                      <span>Reduced Motion</span>
                    </div>
                  </div>
                  <button
                    className={`mira-switch ${worldSettings.reducedMotion ? 'active' : ''}`}
                    onClick={() => {
                      updateWorldSettings({ reducedMotion: !worldSettings.reducedMotion });
                      playWorldSound('toggle');
                    }}
                  >
                    <span className="switch-knob" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 5 THEMES */}
          {modalTab === 'theme' && (
            <div className="studio-themes-grid">
              {(Object.keys(THEMES) as MiraThemeId[]).map((thmId) => {
                const cfg = THEMES[thmId];
                const profile = WORLD_PROFILES[thmId];
                const isSelected = theme === thmId;
                return (
                  <div
                    key={thmId}
                    className={`studio-theme-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setTheme(thmId)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
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

                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: 4 }}>
                      {profile?.worldName}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 8, minHeight: '28px' }}>
                      {cfg.tagline}
                    </div>

                    {/* Color Swatch Bar */}
                    <div style={{ display: 'flex', gap: 4, borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ height: 14, flex: 1, background: cfg.palette.bg, border: '1px solid rgba(0,0,0,0.1)', borderRadius: '3px' }} title="Background" />
                      <div style={{ height: 14, flex: 1, background: cfg.palette.primary, borderRadius: '3px' }} title="Primary" />
                      <div style={{ height: 14, flex: 1, background: cfg.palette.accent, borderRadius: '3px' }} title="Accent" />
                      <div style={{ height: 14, flex: 1, background: cfg.palette.text, borderRadius: '3px' }} title="Text" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: MASCOT & EXPRESSIONS */}
          {modalTab === 'mascot' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  CHOOSE ACCESSORY:
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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

              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  PREVIEW MASCOT EXPRESSION:
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PREVIEW_STATES.map((st) => (
                    <button
                      key={st}
                      className={`studio-pill-btn ${agentState === st ? 'active' : ''}`}
                      onClick={() => {
                        setAgentState(st);
                        playWorldSound('click');
                      }}
                    >
                      <span>{st}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
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
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            ✨ Customizations are persisted automatically in local storage.
          </div>

          <button
            className="mira-btn mira-btn-primary"
            style={{ borderRadius: 'var(--radius-pill)', padding: '8px 18px' }}
            onClick={() => {
              setIsStudioOpen(false);
              playWorldSound('sparkle');
            }}
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
