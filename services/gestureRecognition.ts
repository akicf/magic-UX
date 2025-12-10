import { GestureType, HandData } from '../constants';

// MediaPipe Hands global types (loaded via CDN)
declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

/**
 * Calculates Euclidean distance between two 3D points
 */
const distance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export const detectGesture = (landmarks: any[]): HandData => {
  if (!landmarks || landmarks.length === 0) {
    return { gesture: GestureType.NONE, x: 0.5, y: 0.5, rotation: 0, pinchDistance: 0 };
  }

  // Key landmarks
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const thumbBase = landmarks[2];
  const indexBase = landmarks[5];
  const middleBase = landmarks[9];
  const ringBase = landmarks[13];
  const pinkyBase = landmarks[17];

  // 1. Detect PINCH (Grab)
  // Distance between thumb tip and index tip
  const pinchDist = distance(thumbTip, indexTip);
  const isPinch = pinchDist < 0.05;

  // 2. Detect FIST vs OPEN
  // Check if fingertips are below their respective PIP joints (knuckles)
  // Simple heuristic: distance from wrist to tip vs wrist to base
  const isFingerFolded = (tip: any, base: any) => distance(wrist, tip) < distance(wrist, base);
  
  const thumbFolded = distance(wrist, thumbTip) < distance(wrist, thumbBase); // Thumb is tricky, simplified
  const indexFolded = isFingerFolded(indexTip, indexBase);
  const middleFolded = isFingerFolded(middleTip, middleBase);
  const ringFolded = isFingerFolded(ringTip, ringBase);
  const pinkyFolded = isFingerFolded(pinkyTip, pinkyBase);

  // Count folded fingers (excluding thumb for robustness)
  const foldedCount = [indexFolded, middleFolded, ringFolded, pinkyFolded].filter(Boolean).length;

  let gesture = GestureType.NONE;

  if (isPinch) {
    gesture = GestureType.PINCH;
  } else if (foldedCount >= 3) {
    gesture = GestureType.FIST;
  } else if (foldedCount === 0) {
    gesture = GestureType.OPEN;
  }

  // Calculate position (using wrist or center of palm)
  // MediaPipe coordinates: x (0 left - 1 right), y (0 top - 1 bottom)
  const x = 1 - wrist.x; // Mirror horizontally for intuitive control
  const y = wrist.y;

  // Calculate generic rotation (roll) based on wrist vs middle finger
  // This helps for "Hand rotation"
  const dx = middleBase.x - wrist.x;
  const dy = middleBase.y - wrist.y;
  const rotation = Math.atan2(dy, dx);

  return {
    gesture,
    x,
    y,
    rotation,
    pinchDistance: pinchDist
  };
};