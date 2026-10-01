import React, { useState } from 'react';
import { useMira } from '../context/MiraContext';
import { MiraAvatar } from '../components/mascot/MiraAvatar';
import { THEMES, WORLD_PROFILES } from '../utils/themeConfig';
import {
  MiraThemeId,
  MascotAccessory,
  AgentState,
  WorldAtmosphere,
  WorldParticle,
  MascotAura,
  InterfaceStyle,
  CursorEffect,
} from '../types/agent';
import {
  Sparkles,
  Palette,
  Check,
  Smile,
  Crown,
  Globe2,
  Sliders,
  Volume2,
  VolumeX,
  RotateCcw,
  Zap,
  Layers,
  MousePointer,
  Wind,
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

const ATMOSPHERE_OPTIONS: Array<{ id: WorldAtmosphere; name: string; icon: string; desc: string }> = [
  { id: 'blossom-breeze', name: 'Blossom Breeze', icon: '🌸', desc: 'Warm petal drift & organic blush mist' },
  { id: 'deep-nebula', name: 'Deep Nebula', icon: '🌌', desc: 'Violet starlight & cosmic galactic clouds' },
  { id: 'aurora-dream', name: 'Aurora Dream', icon: '✨', desc: 'Iridescent shimmering borealis waves' },
  { id: 'cyber-grid', name: 'Cyber Grid', icon: '🌐', desc: 'Perspective neon wireframe horizon' },
  { id: 'retro-scanlines', name: 'Retro Scanlines', icon: '📟', desc: 'Tactical HUD grid & CRT monitor sweep' },
  { id: 'minimal-zen', name: 'Minimal Zen', icon: '🍃', desc: 'Serene ambient radial gradient' },
];

const PARTICLE_OPTIONS: Array<{ id: WorldParticle; name: string; icon: string }> = [
  { id: 'petals-confetti', name: 'Petals & Confetti', icon: '🌸' },
  { id: 'stardust-sparkles', name: 'Stardust Sparkles', icon: '✨' },
  { id: 'floating-orbs', name: 'Floating Orbs', icon: '🔮' },
  { id: 'matrix-rain', name: 'Matrix Rain', icon: '⚡' },
  { id: 'constellations', name: 'Constellations', icon: '🌌' },
  { id: 'none', name: 'No Particles', icon: '🚫' },
];

const AURA_OPTIONS: Array<{ id: MascotAura; name: string; icon: string; desc: string }> = [
  { id: 'pastel-mist', name: 'Pastel Mist', icon: '🌸', desc: 'Soft glowing cloud aura' },
  { id: 'celestial-halo', name: 'Celestial Halo', icon: '👑', desc: 'Prismatic stardust ring' },
  { id: 'neon-glow', name: 'Neon Cyber Glow', icon: '⚡', desc: 'High-contrast edge pulse' },
  { id: 'pulse-wave', name: 'Pulse Radar', icon: '📡', desc: 'Expanding rhythmic waves' },
  { id: 'off', name: 'No Aura', icon: '🚫', desc: 'Crisp minimal silhouette' },
];

const INTERFACE_STYLES: Array<{ id: InterfaceStyle; name: string; icon: string; desc: string }> = [
  { id: 'glass', name: 'Frosted Glass', icon: '🪟', desc: 'Translucent blur, delicate light borders' },
  { id: 'solid', name: 'Neo-Brutalist Solid', icon: '⬛', desc: 'Crisp high-contrast borders & solid surfaces' },
  { id: 'soft', name: 'Soft Pastel', icon: '☁️', desc: 'Warm rounded cards & gentle ambient depth' },
  { id: 'holographic', name: 'Holographic Cyber', icon: '💿', desc: 'Iridescent chromatic sheen & cyber borders' },
];

const CURSOR_EFFECTS: Array<{ id: CursorEffect; name: string; icon: string }> = [
  { id: 'sparkle-trail', name: 'Sparkle Trail', icon: '✨' },
  { id: 'neon-dot', name: 'Neon Dot Trail', icon: '🟣' },
  { id: 'aura-ring', name: 'Aura Rings', icon: '⭕' },
  { id: 'standard', name: 'Standard Pointer', icon: '🖱️' },
];

export const StudioPage: React.FC = () => {
  const {
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

  const [activeTab, setActiveTab] = useState<'world' | 'mascot' | 'themes'>('world');

  const currentProfile = WORLD_PROFILES[theme] || WORLD_PROFILES['liquid-rose'];

  return (
    <div className="page-container studio-page-container">
      {/* Studio Header */}
      <div className="studio-page-header">
        <div className="studio-header-info">
          <div className="icon-circle-badge studio-icon-badge">
            <Globe2 size={22} style={{ color: 'var(--brand-primary)' }} />
          </div>
          <div>
            <div className="studio-title-row">
              <h2 className="studio-header-title">MIRA World Customization</h2>
              <span className="status-pill ready">Immersive Studio</span>
            </div>
            <p className="studio-header-sub">
              Shape MIRA's living universe: tune atmospheres, particles, motion intensity, mascot aura, and tactile UI feedback.
            </p>
          </div>
        </div>

        {/* Global Controls in Header */}
        <div className="studio-header-actions">
          <button
            className="mira-btn my-day-sub-btn"
            onClick={() => {
              resetWorldToThemeDefault(theme);
              playWorldSound('sparkle');
            }}
            title="Restore default atmosphere and settings for this theme"
          >
            <RotateCcw size={13} />
            <span>Reset to Theme Defaults</span>
          </button>
        </div>
      </div>

      {/* TOP HERO: Interactive Real-Time Live Preview Stage */}
      <div className="studio-hero-stage-card world-stage-card">
        <div className="studio-stage-left">
          {/* Mascot Live Stage with Aura */}
          <div className="studio-mascot-pod world-mascot-pod">
            <MiraAvatar
              size={124}
              state={agentState}
              theme={theme}
              accessory={mascotAccessory}
              aura={worldSettings.mascotAura}
              interactive={true}
            />
            <span className="studio-touch-hint">Interactive Mascot • Click to Wave!</span>
          </div>

          <div className="studio-mascot-details">
            <div className="studio-active-title-row">
              <h3>{currentProfile.worldName}</h3>
              <span className="active-theme-pill">{THEMES[theme].name} Palette</span>
            </div>
            <p className="studio-active-desc">
              {currentProfile.worldDescription}
            </p>

            {/* Current Active Properties Badges */}
            <div className="world-active-badges-row">
              <span className="world-tag-chip">
                <span>Atmosphere:</span>
                <strong>{worldSettings.atmosphere}</strong>
              </span>
              <span className="world-tag-chip">
                <span>UI Style:</span>
                <strong>{worldSettings.interfaceStyle}</strong>
              </span>
              <span className="world-tag-chip">
                <span>Motion:</span>
                <strong>{worldSettings.intensity}</strong>
              </span>
              <span className="world-tag-chip">
                <span>Aura:</span>
                <strong>{worldSettings.mascotAura}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right Preview Sub-Card: Live Interface Demonstration Card */}
        <div className="studio-stage-right-preview">
          <div className="world-ui-preview-card">
            <div className="preview-card-header">
              <span className="preview-label">Live Interface Style Preview</span>
              <span className="style-badge">{worldSettings.interfaceStyle.toUpperCase()}</span>
            </div>
            <p className="preview-body-text">
              This widget renders your active {worldSettings.interfaceStyle} styling with realtime border shaders.
            </p>
            <div className="preview-actions-row">
              <button
                className="mira-btn mira-btn-primary"
                onClick={() => playWorldSound('sparkle')}
              >
                <Sparkles size={13} />
                <span>Test Sound FX</span>
              </button>
              <button
                className="mira-btn my-day-sub-btn"
                onClick={() => playWorldSound('toggle')}
              >
                <span>Preview Action</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Studio */}
      <div className="studio-category-tabs">
        <button
          className={`studio-category-tab ${activeTab === 'world' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('world');
            playWorldSound('click');
          }}
        >
          <Sliders size={15} />
          <span>World & Atmosphere (8 Controls)</span>
        </button>
        <button
          className={`studio-category-tab ${activeTab === 'themes' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('themes');
            playWorldSound('click');
          }}
        >
          <Palette size={15} />
          <span>5 Themes & Color Palettes</span>
        </button>
        <button
          className={`studio-category-tab ${activeTab === 'mascot' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('mascot');
            playWorldSound('click');
          }}
        >
          <Crown size={15} />
          <span>Accessories & Expressions</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: MIRA WORLD CUSTOMIZATION (8 CONTROLS)
          ========================================================================= */}
      {activeTab === 'world' && (
        <div className="studio-world-controls-grid">
          {/* 1. Background Atmosphere Preset */}
          <div className="studio-section world-section-card">
            <div className="studio-section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe2 size={17} style={{ color: 'var(--brand-primary)' }} />
                <h3 className="studio-section-title">1. Background Atmosphere</h3>
              </div>
              <span className="studio-section-sub">
                Choose the environmental backdrop mood
              </span>
            </div>

            <div className="atmosphere-cards-grid">
              {ATMOSPHERE_OPTIONS.map((atm) => {
                const isSelected = worldSettings.atmosphere === atm.id;
                return (
                  <div
                    key={atm.id}
                    className={`atmosphere-choice-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      updateWorldSettings({ atmosphere: atm.id });
                      playWorldSound('toggle');
                    }}
                  >
                    <div className="atm-card-top">
                      <span className="atm-icon">{atm.icon}</span>
                      <span className="atm-name">{atm.name}</span>
                      {isSelected && <Check size={14} className="atm-check" />}
                    </div>
                    <p className="atm-desc">{atm.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Particle / Effect Type */}
          <div className="studio-section world-section-card">
            <div className="studio-section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={17} style={{ color: 'var(--brand-primary)' }} />
                <h3 className="studio-section-title">2. Particle & Effect FX</h3>
              </div>
              <span className="studio-section-sub">
                Interactive ambient particle simulation
              </span>
            </div>

            <div className="particle-pills-grid">
              {PARTICLE_OPTIONS.map((part) => {
                const isSelected = worldSettings.particle === part.id;
                return (
                  <button
                    key={part.id}
                    className={`particle-pill-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      updateWorldSettings({ particle: part.id });
                      playWorldSound('sparkle');
                    }}
                  >
                    <span className="part-icon">{part.icon}</span>
                    <span className="part-name">{part.name}</span>
                    {isSelected && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Animation Intensity */}
          <div className="studio-section world-section-card">
            <div className="studio-section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={17} style={{ color: 'var(--brand-primary)' }} />
                <h3 className="studio-section-title">3. Animation Intensity</h3>
              </div>
              <span className="studio-section-sub">
                Adjust the speed and energy of ambient motions
              </span>
            </div>

            <div className="intensity-selector-row">
              {(
                [
                  { id: 'calm', label: '🕊️ Calm (0.5x)', desc: 'Slow, subtle, meditative pacing' },
                  { id: 'soft', label: '🍃 Soft (1.0x)', desc: 'Smooth, natural standard motion' },
                  { id: 'energetic', label: '⚡ Energetic (1.5x)', desc: 'Snappy, vibrant, high-tempo pop' },
                ] as const
              ).map((lvl) => {
                const isSelected = worldSettings.intensity === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    className={`intensity-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      updateWorldSettings({ intensity: lvl.id });
                      playWorldSound('toggle');
                    }}
                  >
                    <div className="intensity-label">{lvl.label}</div>
                    <div className="intensity-desc">{lvl.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. MIRA Mascot Aura / Glow */}
          <div className="studio-section world-section-card">
            <div className="studio-section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Crown size={17} style={{ color: 'var(--brand-primary)' }} />
                <h3 className="studio-section-title">4. MIRA Mascot Aura & Glow</h3>
              </div>
              <span className="studio-section-sub">
                Radiant light surrounding your MIRA companion
              </span>
            </div>

            <div className="aura-cards-grid">
              {AURA_OPTIONS.map((aur) => {
                const isSelected = worldSettings.mascotAura === aur.id;
                return (
                  <div
                    key={aur.id}
                    className={`aura-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      updateWorldSettings({ mascotAura: aur.id });
                      playWorldSound('sparkle');
                    }}
                  >
                    <div className="aura-top">
                      <span className="aura-icon">{aur.icon}</span>
                      <span className="aura-name">{aur.name}</span>
                      {isSelected && <Check size={12} />}
                    </div>
                    <p className="aura-desc">{aur.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Interface Style: Glass / Solid / Soft / Holographic */}
          <div className="studio-section world-section-card">
            <div className="studio-section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Layers size={17} style={{ color: 'var(--brand-primary)' }} />
                <h3 className="studio-section-title">5. Interface Style</h3>
              </div>
              <span className="studio-section-sub">
                Select the physical texture & surface shader for cards
              </span>
            </div>

            <div className="interface-styles-grid">
              {INTERFACE_STYLES.map((style) => {
                const isSelected = worldSettings.interfaceStyle === style.id;
                return (
                  <div
                    key={style.id}
                    className={`interface-style-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      updateWorldSettings({ interfaceStyle: style.id });
                      playWorldSound('warp');
                    }}
                  >
                    <div className="style-card-header">
                      <span className="style-icon">{style.icon}</span>
                      <span className="style-title">{style.name}</span>
                      {isSelected && <Check size={13} />}
                    </div>
                    <p className="style-desc">{style.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 6. Cursor Interactive Effect */}
          <div className="studio-section world-section-card">
            <div className="studio-section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MousePointer size={17} style={{ color: 'var(--brand-primary)' }} />
                <h3 className="studio-section-title">6. Cursor Trail Effect</h3>
              </div>
              <span className="studio-section-sub">
                Interactive particle trail following your mouse
              </span>
            </div>

            <div className="cursor-options-row">
              {CURSOR_EFFECTS.map((eff) => {
                const isSelected = worldSettings.cursorEffect === eff.id;
                return (
                  <button
                    key={eff.id}
                    className={`cursor-pill-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      updateWorldSettings({ cursorEffect: eff.id });
                      playWorldSound('click');
                    }}
                  >
                    <span>{eff.icon}</span>
                    <span>{eff.name}</span>
                    {isSelected && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7 & 8. UI Audio Sound & Accessibility Switches */}
          <div className="studio-section world-section-card">
            <div className="studio-section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Volume2 size={17} style={{ color: 'var(--brand-primary)' }} />
                <h3 className="studio-section-title">7 & 8. Audio & Accessibility</h3>
              </div>
              <span className="studio-section-sub">
                Tactile feedback and motion sensitivity settings
              </span>
            </div>

            <div className="audio-access-grid">
              {/* UI Sound Toggle */}
              <div className="toggle-box-card">
                <div className="toggle-box-info">
                  <div className="toggle-title">
                    {worldSettings.uiSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    <span>UI Sound Feedback</span>
                  </div>
                  <p className="toggle-desc">
                    Plays subtle synthesized micro-tones on clicks, toggles, and theme shifts.
                  </p>
                </div>
                <button
                  className={`mira-switch ${worldSettings.uiSoundEnabled ? 'active' : ''}`}
                  onClick={() => {
                    const next = !worldSettings.uiSoundEnabled;
                    updateWorldSettings({ uiSoundEnabled: next });
                    if (next) playWorldSound('chime');
                  }}
                  title="Toggle UI Sounds"
                >
                  <span className="switch-knob" />
                </button>
              </div>

              {/* Reduced Motion Toggle */}
              <div className="toggle-box-card">
                <div className="toggle-box-info">
                  <div className="toggle-title">
                    <Wind size={16} />
                    <span>Reduced Motion Mode</span>
                  </div>
                  <p className="toggle-desc">
                    Pauses background particles and floating mascot physics for comfort.
                  </p>
                </div>
                <button
                  className={`mira-switch ${worldSettings.reducedMotion ? 'active' : ''}`}
                  onClick={() => {
                    const next = !worldSettings.reducedMotion;
                    updateWorldSettings({ reducedMotion: next });
                    playWorldSound('toggle');
                  }}
                  title="Toggle Reduced Motion"
                >
                  <span className="switch-knob" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: 5 PRESERVED THEMES & COLOR PALETTES
          ========================================================================= */}
      {activeTab === 'themes' && (
        <div className="studio-section">
          <div className="studio-section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Palette size={18} style={{ color: 'var(--brand-primary)' }} />
              <h3 className="studio-section-title">5 Distinct Theme Palettes</h3>
            </div>
            <span className="studio-section-sub">
              Updates core color palette, typography tokens, and default world atmosphere
            </span>
          </div>

          <div className="studio-themes-grid-refined">
            {(Object.keys(THEMES) as MiraThemeId[]).map((thmId) => {
              const cfg = THEMES[thmId];
              const profile = WORLD_PROFILES[thmId];
              const isSelected = theme === thmId;
              return (
                <div
                  key={thmId}
                  className={`theme-card-refined ${isSelected ? 'selected' : ''}`}
                  onClick={() => setTheme(thmId)}
                >
                  <div className="theme-card-top-row">
                    <div>
                      <span className="theme-name" style={{ color: cfg.palette.text }}>
                        {cfg.name}
                      </span>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-primary)', marginTop: 2 }}>
                        {profile?.worldName || 'World'}
                      </div>
                    </div>
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
      )}

      {/* =========================================================================
          TAB 3: PRESERVED ACCESSORIES & EXPRESSIONS
          ========================================================================= */}
      {activeTab === 'mascot' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Visual Accessories Picker */}
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

          {/* Mascot Emotional Expressions */}
          <div className="studio-section">
            <div className="studio-section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Smile size={18} style={{ color: 'var(--brand-primary)' }} />
                <h3 className="studio-section-title">Mascot Emotional Expressions (10 States)</h3>
              </div>
              <span className="studio-section-sub">
                Test how MIRA reacts across the multimodal loop
              </span>
            </div>

            <div className="expressions-chips-grid">
              {PREVIEW_STATES.map((st) => (
                <button
                  key={st.id}
                  className={`expression-chip-btn ${agentState === st.id ? 'active' : ''}`}
                  onClick={() => {
                    setAgentState(st.id);
                    playWorldSound('click');
                  }}
                >
                  <span className="expression-icon">{st.icon}</span>
                  <span className="expression-label">{st.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
