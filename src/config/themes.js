import { defaultTheme } from './theme.js';

export function createTheme(partial = {}) {
  return {
    ...defaultTheme,
    ...partial,
    bg: { ...defaultTheme.bg, ...(partial.bg || {}) },
    brand: { ...defaultTheme.brand, ...(partial.brand || {}) },
  };
}

export const darkTheme = {
  mode: 'dark',
  accent: '#22e4ff',
  bg: { top: '#0a0c1e', mid: '#0d1024', bottom: '#101430' },
  brand: { title: 'PIXEL', glow: 'DRIFT', sub: 'NO SIGNAL · RUN ANYWAY' },
  star: '#ffffff',
  body: '#e9f6ff',
  core: '#22e4ff',
  trail: '#22e4ff',
  eye: '#22e4ff',
  pupil: '#0b0d18',
  obs: '#3d1f6e',
  obsEdge: '#7c5cff',
  obsTip: '#ff2fd6',
  orb: '#22e4ff',
  pow: '#3dffb6',
  ground: '#3a4270',
  playfieldGlow: 'rgba(34,228,255,.08)',
  speedLine: '#22e4ff',
  groundGlow: 'rgba(34,228,255,.22)',
};

export const lightTheme = {
  mode: 'light',
  accent: '#1d6bf0',
  bg: { top: '#eef3fb', mid: '#dfe7f4', bottom: '#d0daea' },
  brand: { title: 'PIXEL', glow: 'DRIFT', sub: 'SINYAL HILANG · TETAP MAIN' },
  star: '#1b2a4a',
  body: '#1c2b4f',
  core: '#1d6bf0',
  trail: '#1d6bf0',
  eye: '#1d6bf0',
  pupil: '#ffffff',
  obs: '#6a4fb8',
  obsEdge: '#8f7bff',
  obsTip: '#ff2fd6',
  orb: '#1d6bf0',
  pow: '#12b76a',
  ground: '#7a87ad',
  playfieldGlow: 'rgba(29,107,240,.10)',
  speedLine: '#1d6bf0',
  groundGlow: 'rgba(29,107,240,.20)',
};

export const sobatPintarTheme = {
  mode: 'dark',
  accent: '#ff9f1c',
  bg: { top: '#1a1a2e', mid: '#16213e', bottom: '#0f3460' },
  brand: { title: 'SOBAT', glow: 'PINTAR', sub: 'BELAJAR · DI MANA SAJA' },
  star: '#ffffff',
  body: '#fff6e9',
  core: '#ff9f1c',
  trail: '#ff9f1c',
  eye: '#ff9f1c',
  pupil: '#1a1a2e',
  obs: '#16213e',
  obsEdge: '#4aa3ff',
  obsTip: '#ff9f1c',
  orb: '#ff9f1c',
  pow: '#7bdff2',
  ground: '#2a4a6b',
  playfieldGlow: 'rgba(255,159,28,.08)',
  speedLine: '#ff9f1c',
  groundGlow: 'rgba(255,159,28,.22)',
};

export const kantinTheme = {
  mode: 'dark',
  accent: '#ffd35c',
  bg: { top: '#2a0e14', mid: '#1c0a10', bottom: '#160810' },
  brand: { title: 'KANTIN', glow: 'RUN', sub: 'BAHAN PULANG · MAIN DULU' },
  star: '#ffffff',
  body: '#fff3e0',
  core: '#ff5c4d',
  trail: '#ffd35c',
  eye: '#ffd35c',
  pupil: '#2a0e14',
  obs: '#3d1420',
  obsEdge: '#ff6b6b',
  obsTip: '#ffd35c',
  orb: '#ffd35c',
  pow: '#7bdff2',
  ground: '#6b3a2a',
  playfieldGlow: 'rgba(255,211,92,.08)',
  speedLine: '#ffd35c',
  groundGlow: 'rgba(255,211,92,.22)',
};

export const themes = {
  default: defaultTheme,
  dark: darkTheme,
  light: lightTheme,
  'sobat-pintar': sobatPintarTheme,
  kantin: kantinTheme,
};