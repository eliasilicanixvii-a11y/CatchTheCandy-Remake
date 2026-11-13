export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Calculates number of stars earned based on number of clicks/stretches used.
 */
export function calculateStars(clicks: number, threshold3: number, threshold2: number): number {
  if (clicks <= threshold3) return 3;
  if (clicks <= threshold2) return 2;
  return 1;
}

/**
 * Distance between two points.
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Tests if distance between creature and candy is within eating reach.
 */
export function isCandyReached(playerPos: Point, candyPos: Point, playerRadius = 32, candyRadius = 24): boolean {
  const reach = playerRadius + candyRadius + 6;
  return distance(playerPos, candyPos) <= reach;
}

/**
 * Check if a point is inside an axis-aligned box
 */
export function isPointInBox(p: Point, box: { x: number; y: number; width: number; height: number }): boolean {
  return (
    p.x >= box.x - box.width / 2 &&
    p.x <= box.x + box.width / 2 &&
    p.y >= box.y - box.height / 2 &&
    p.y <= box.y + box.height / 2
  );
}

/**
 * Creature skin definitions with rich gradients
 */
export interface SkinDef {
  id: string;
  name: string;
  bodyGradient: [string, string, string]; // inner, mid, shadow
  highlightColor: string;
  tongueGradient: [string, string];
  eyeColor: string;
}

export const SKINS: Record<string, SkinDef> = {
  purple: {
    id: 'purple',
    name: 'Viola Classico',
    bodyGradient: ['#c084fc', '#8b5cf6', '#581c87'],
    highlightColor: '#f3e8ff',
    tongueGradient: ['#f472b6', '#db2777'],
    eyeColor: '#1e1b4b',
  },
  candyPink: {
    id: 'candyPink',
    name: 'Zucchero Filato',
    bodyGradient: ['#f472b6', '#ec4899', '#9d174d'],
    highlightColor: '#fdf2f8',
    tongueGradient: ['#fb7185', '#e11d48'],
    eyeColor: '#4c0519',
  },
  mint: {
    id: 'mint',
    name: 'Menta Fresca',
    bodyGradient: ['#34d399', '#10b981', '#064e3b'],
    highlightColor: '#ecfdf5',
    tongueGradient: ['#f43f5e', '#be123c'],
    eyeColor: '#022c22',
  },
  sunset: {
    id: 'sunset',
    name: 'Tramonto d\'Oro',
    bodyGradient: ['#fbbf24', '#f59e0b', '#78350f'],
    highlightColor: '#fffbeb',
    tongueGradient: ['#f43f5e', '#be123c'],
    eyeColor: '#451a03',
  },
  cosmic: {
    id: 'cosmic',
    name: 'Indaco Cosmico',
    bodyGradient: ['#60a5fa', '#3b82f6', '#172554'],
    highlightColor: '#eff6ff',
    tongueGradient: ['#ec4899', '#be185d'],
    eyeColor: '#0f172a',
  },
};
