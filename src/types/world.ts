/**
 * MIRA World Customization Layer Types
 */

import { MiraThemeId } from './agent';

export type WorldAtmosphere =
  | 'blossom-breeze'    // Cherry blossom wind & soft ambient petal mist
  | 'deep-nebula'       // Deep space galaxy nebula with cosmic dust
  | 'aurora-dream'      // Iridescent waving aurora borealis
  | 'cyber-grid'        // Retro-futuristic perspective neon grid
  | 'retro-scanlines'   // CRT tactical HUD scanline matrix
  | 'minimal-zen';      // Clean serene ambient gradient

export type WorldParticle =
  | 'petals-confetti'   // Floating organic petals & pastel shapes
  | 'stardust-sparkles' // Twinkling stardust & Y2K diamonds
  | 'floating-orbs'     // Soft glowing frosted glass orbs
  | 'matrix-rain'       // Digital matrix streaks & cyber pulses
  | 'constellations'    // Connected star nodes & geometric lines
  | 'none';

export type AnimationIntensity = 'calm' | 'soft' | 'energetic';

export type MascotAura =
  | 'pastel-mist'       // Soft glowing aura cloud
  | 'celestial-halo'    // Ring of stardust & prismatic light
  | 'neon-glow'         // Vibrant high-contrast cyber pulse
  | 'pulse-wave'        // Rhythmic radial radar waves
  | 'off';

export type InterfaceStyle = 'glass' | 'solid' | 'soft' | 'holographic';

export type CursorEffect = 'sparkle-trail' | 'neon-dot' | 'aura-ring' | 'standard';

export interface MiraWorldSettings {
  atmosphere: WorldAtmosphere;
  particle: WorldParticle;
  intensity: AnimationIntensity;
  mascotAura: MascotAura;
  interfaceStyle: InterfaceStyle;
  cursorEffect: CursorEffect;
  uiSoundEnabled: boolean;
  reducedMotion: boolean;
}

export interface WorldProfile {
  themeId: MiraThemeId;
  worldName: string;
  worldTagline: string;
  worldDescription: string;
  defaultSettings: MiraWorldSettings;
}
