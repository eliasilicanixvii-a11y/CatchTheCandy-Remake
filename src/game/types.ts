export type SurfaceType = 'normal' | 'ice' | 'bouncy' | 'movable' | 'hazard';

export interface LevelObject {
  id?: string;
  type: SurfaceType;
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
  color?: string;
  isStatic?: boolean;
  shape?: 'rectangle' | 'circle';
  radius?: number;
  label?: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  theme: 'meadow' | 'ice' | 'candy' | 'sunset' | 'crystal';
  playerStart: { x: number; y: number };
  candyStart: { x: number; y: number; isMovable?: boolean };
  objects: LevelObject[];
  starsClicks: [number, number]; // [3 stars threshold, 2 stars threshold] e.g. [3, 6]
  hint?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape: 'circle' | 'star' | 'shard' | 'crumb';
  angle?: number;
  va?: number;
}

export interface PlayerStats {
  completedLevels: Record<number, { stars: number; bestClicks: number }>;
  selectedLevel: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  skin: string;
}
