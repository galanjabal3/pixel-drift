export interface ThemeColors {
  top: string;
  mid: string;
  bottom: string;
}

export interface BrandColors {
  title: string;
  glow: string;
  sub: string;
}

export interface Theme {
  mode: 'light' | 'dark';
  accent: string;
  bg: ThemeColors;
  brand: BrandColors;
  star: string;
  body: string;
  core: string;
  trail: string;
  eye: string;
  pupil: string;
  obs: string;
  obsEdge: string;
  obsTip: string;
  orb: string;
  pow: string;
  ground: string;
  playfieldGlow: string;
  speedLine: string;
  groundGlow: string;
}

export interface Callbacks {
  onScore?: (score: number) => void;
  onGameOver?: (score: number) => void;
  onLevelUp?: (level: number) => void;
}

export interface PixelDriftOptions {
  canvas: HTMLCanvasElement;
  theme?: Partial<Theme>;
  callbacks?: Callbacks;
}

export interface GameState {
  mode: 'start' | 'playing' | 'over';
  score: number;
  level: number;
  speed: number;
  best: number;
}

export declare class PixelDrift {
  constructor(options: PixelDriftOptions);
  start(): void;
  pause(): void;
  resume(): void;
  destroy(): void;
  getState(): GameState;
}
