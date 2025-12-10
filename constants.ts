export enum ParticleState {
  TREE = 'TREE',
  CLOUD = 'CLOUD',
  ZOOM = 'ZOOM'
}

export enum GestureType {
  NONE = 'NONE',
  OPEN = 'OPEN',
  FIST = 'FIST',
  PINCH = 'PINCH',
  ROTATE = 'ROTATE'
}

export const COLORS = {
  GREEN: '#10B981', // emerald-500
  GOLD: '#FBBF24',  // amber-400
  RED: '#EF4444',   // red-500
  WHITE: '#FFFFFF',
};

export interface HandData {
  gesture: GestureType;
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
  rotation: number; // Hand rotation/tilt
  pinchDistance: number;
}