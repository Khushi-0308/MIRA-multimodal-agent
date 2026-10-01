import { ThemeConfig, MiraThemeId } from '../types/agent';
import { MiraWorldSettings, WorldProfile } from '../types/world';

export const THEMES: Record<MiraThemeId, ThemeConfig> = {
  'liquid-rose': {
    id: 'liquid-rose',
    name: 'Liquid Rose',
    tagline: 'Warm ivory, liquid blush petals & soft mint',
    aesthetic: 'Playful, dreamy, Gen-Z digital companion',
    palette: {
      bg: '#fff5f7',
      surface: '#ffffff',
      primary: '#f43f5e',
      accent: '#818cf8',
      text: '#4a152d',
      tagBg: '#ffe4e6',
    },
  },
  'midnight': {
    id: 'midnight',
    name: 'Midnight',
    tagline: 'Deep violet dusk, electric coral & star dust',
    aesthetic: 'Chic night-owl hacker & cyberpunk salon',
    palette: {
      bg: '#0f0e17',
      surface: '#171527',
      primary: '#ff5470',
      accent: '#7f5af0',
      text: '#fffffe',
      tagBg: 'rgba(255, 84, 112, 0.15)',
    },
  },
  'glitter': {
    id: 'glitter',
    name: 'Glitter',
    tagline: 'Y2K pearlescent, dreamy lilac & chrome sparkle',
    aesthetic: 'Sparkling hyper-expressive pop idol',
    palette: {
      bg: '#faf5ff',
      surface: '#ffffff',
      primary: '#c084fc',
      accent: '#38bdf8',
      text: '#371b58',
      tagBg: '#f3e8ff',
    },
  },
  'bold': {
    id: 'bold',
    name: 'Bold',
    tagline: 'Neo-brutalist pop, electric mango & punchy lines',
    aesthetic: 'High-contrast graphic art & unapologetic energy',
    palette: {
      bg: '#fffbeb',
      surface: '#ffffff',
      primary: '#f97316',
      accent: '#84cc16',
      text: '#18181b',
      tagBg: '#fef3c7',
    },
  },
  'edge': {
    id: 'edge',
    name: 'Edge',
    tagline: 'Streetwear minimalist, bone chalk & acid citron',
    aesthetic: 'Technical editorial, raw micro-borders & high fashion',
    palette: {
      bg: '#f4f4f5',
      surface: '#ffffff',
      primary: '#18181b',
      accent: '#bef264',
      text: '#09090b',
      tagBg: '#e4e4e7',
    },
  },
};

export const WORLD_PROFILES: Record<MiraThemeId, WorldProfile> = {
  'liquid-rose': {
    themeId: 'liquid-rose',
    worldName: 'Blossom Sanctuary',
    worldTagline: 'Pastel dreamscape with cherry wind & glass mist',
    worldDescription: 'A serene Japanese garden floating in digital space with soft petal physics and warm light.',
    defaultSettings: {
      atmosphere: 'blossom-breeze',
      particle: 'petals-confetti',
      intensity: 'soft',
      mascotAura: 'pastel-mist',
      interfaceStyle: 'glass',
      cursorEffect: 'sparkle-trail',
      uiSoundEnabled: true,
      reducedMotion: false,
    },
  },
  'midnight': {
    themeId: 'midnight',
    worldName: 'Astral Nebula',
    worldTagline: 'Cosmic nightfall with twinkling stardust & holographic neon',
    worldDescription: 'An infinite deep-violet nebula filled with glowing stellar remnants and electric coral beacons.',
    defaultSettings: {
      atmosphere: 'deep-nebula',
      particle: 'stardust-sparkles',
      intensity: 'soft',
      mascotAura: 'celestial-halo',
      interfaceStyle: 'holographic',
      cursorEffect: 'neon-dot',
      uiSoundEnabled: true,
      reducedMotion: false,
    },
  },
  'glitter': {
    themeId: 'glitter',
    worldName: 'Prismatic Dimension',
    worldTagline: 'Y2K hyper-pop aurora with chrome reflections & diamonds',
    worldDescription: 'A crystalline dreamworld bursting with iridescent light rays and pearlescent starlight.',
    defaultSettings: {
      atmosphere: 'aurora-dream',
      particle: 'stardust-sparkles',
      intensity: 'energetic',
      mascotAura: 'celestial-halo',
      interfaceStyle: 'glass',
      cursorEffect: 'sparkle-trail',
      uiSoundEnabled: true,
      reducedMotion: false,
    },
  },
  'bold': {
    themeId: 'bold',
    worldName: 'Cyber Arcade',
    worldTagline: 'High-voltage neo-brutalist grid & digital matrix vibes',
    worldDescription: 'A punchy arcade realm characterized by Memphis geometry, neon vectors, and electric orange pulses.',
    defaultSettings: {
      atmosphere: 'cyber-grid',
      particle: 'matrix-rain',
      intensity: 'energetic',
      mascotAura: 'pulse-wave',
      interfaceStyle: 'solid',
      cursorEffect: 'aura-ring',
      uiSoundEnabled: true,
      reducedMotion: false,
    },
  },
  'edge': {
    themeId: 'edge',
    worldName: 'Monochrome Matrix',
    worldTagline: 'Tactical HUD grid with acid citron radar & precision lines',
    worldDescription: 'A high-contrast command terminal with stealth telemetry, scanline overlays, and razor-sharp borders.',
    defaultSettings: {
      atmosphere: 'retro-scanlines',
      particle: 'constellations',
      intensity: 'calm',
      mascotAura: 'neon-glow',
      interfaceStyle: 'solid',
      cursorEffect: 'neon-dot',
      uiSoundEnabled: true,
      reducedMotion: false,
    },
  },
};

const THEME_STORAGE_KEY = 'mira_user_theme';
const ACCESSORY_STORAGE_KEY = 'mira_mascot_accessory';
const WORLD_SETTINGS_STORAGE_KEY = 'mira_world_settings_v1';

export const getSavedTheme = (): MiraThemeId => {
  if (typeof window === 'undefined') return 'liquid-rose';
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as MiraThemeId | null;
  if (saved && THEMES[saved]) {
    return saved;
  }
  return 'liquid-rose';
};

export const saveTheme = (themeId: MiraThemeId): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  }
};

export const getSavedAccessory = (): string => {
  if (typeof window === 'undefined') return 'bunny-ears';
  return localStorage.getItem(ACCESSORY_STORAGE_KEY) || 'bunny-ears';
};

export const saveAccessory = (acc: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESSORY_STORAGE_KEY, acc);
  }
};

export const getSavedWorldSettings = (themeId: MiraThemeId): MiraWorldSettings => {
  const fallback = WORLD_PROFILES[themeId]?.defaultSettings || WORLD_PROFILES['liquid-rose'].defaultSettings;
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(WORLD_SETTINGS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<MiraWorldSettings>;
    return {
      ...fallback,
      ...parsed,
    };
  } catch {
    return fallback;
  }
};

export const saveWorldSettings = (settings: MiraWorldSettings): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(WORLD_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      document.documentElement.setAttribute('data-atmosphere', settings.atmosphere);
      document.documentElement.setAttribute('data-interface-style', settings.interfaceStyle);
      document.documentElement.setAttribute('data-anim-intensity', settings.intensity);
      document.documentElement.setAttribute('data-reduced-motion', String(settings.reducedMotion));
    } catch {
      // ignore
    }
  }
};
