import { ThemeConfig, MiraThemeId } from '../types/agent';

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

const THEME_STORAGE_KEY = 'mira_user_theme';
const ACCESSORY_STORAGE_KEY = 'mira_mascot_accessory';

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
