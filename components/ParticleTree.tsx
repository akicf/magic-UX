import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleState, COLORS } from '../constants';

interface ParticleTreeProps {
  state: ParticleState;
  color: string;
  handX: number; // 0 to 1
  rotationOffset: number;
}

const COUNT = 3000;

export const ParticleTree: React.FC<ParticleTreeProps> = ({ state, color, handX, rotationOffset }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Initialize particles
  const { positions, treeTarget, cloudTarget, colors } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const tree = new Float32Array(COUNT * 3);
    const cloud = new Float32Array(COUNT * 3);
    const cols = new Float32Array(COUNT * 3);
    
    const colorObj = new THREE.Color(color);

    for (let i = 0; i < COUNT; i++) {
      // Tree Shape (Spiral Cone)
      const t = i / COUNT;
      const angle = t * Math.PI * 20; // 10 revolutions
      const radius = 0.1 + t * 4; // Cone gets wider at bottom
      // Invert Y so 0 is top
      const x = Math.cos(angle) * radius * (1 - t * 0.5); // Taper
      const y = (1 - t) * 8 - 4; // Height from -4 to 4
      const z = Math.sin(angle) * radius * (1 - t * 0.5);
      
      tree[i * 3] = x;
      tree[i * 3 + 1] = y;
      tree[i * 3 + 2] = z;

      // Cloud Shape (Sphere/Random)
      const r = 5 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      cloud[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      cloud[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      cloud[i * 3 + 2] = r * Math.cos(phi);

      // Initial positions (start as tree)
      pos[i * 3] = tree[i * 3];
      pos[i * 3 + 1] = tree[i * 3 + 1];
      pos[i * 3 + 2] = tree[i * 3 + 2];

      // Colors
      cols[i * 3] = colorObj.r;
      cols[i * 3 + 1] = colorObj.g;
      cols[i * 3 + 2] = colorObj.b;
    }
    
    return { positions: pos, treeTarget: tree, cloudTarget: cloud, colors: cols };
  }, []);

  // Update color when prop changes
  useEffect(() => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry;
    const colorAttr = geom.getAttribute('color') as THREE.BufferAttribute;
    const c = new THREE.Color(color);
    
    for (let i = 0; i < COUNT; i++) {
        colorAttr.setXYZ(i, c.r, c.g, c.b);
    }
    colorAttr.needsUpdate = true;
  }, [color]);

  useFrame((stateCtx, delta) => {
    if (!pointsRef.current) return;

    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const currentPositions = posAttr.array as Float32Array;

    const target = state === ParticleState.CLOUD || state === ParticleState.ZOOM ? cloudTarget : treeTarget;
    
    // Lerp speed - increased for agility
    const speed = 6 * delta;

    // Movement Logic
    for (let i = 0; i < COUNT; i++) {
      const idx = i * 3;
      
      // Interpolate towards target
      currentPositions[idx] += (target[idx] - currentPositions[idx]) * speed;
      currentPositions[idx + 1] += (target[idx + 1] - currentPositions[idx + 1]) * speed;
      currentPositions[idx + 2] += (target[idx + 2] - currentPositions[idx + 2]) * speed;
      
      // Add some "life" or noise based on state
      if (state === ParticleState.CLOUD) {
          // Drifting effect
          currentPositions[idx] += Math.sin(stateCtx.clock.elapsedTime + i) * 0.01;
          currentPositions[idx + 1] += Math.cos(stateCtx.clock.elapsedTime + i) * 0.01;
      }
    }
    
    posAttr.needsUpdate = true;

    // Rotation based on hand gesture (Mapped handX to Y rotation)
    // Smooth rotation - Increased lerp factor for agility (was 2, now 6)
    const targetRotationY = (handX - 0.5) * Math.PI * 2; // -180 to 180 degrees
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, targetRotationY + rotationOffset, delta * 6);
    
    // Zoom/Scale effect for FIST/PINCH - Increased lerp factor for agility
    const targetScale = state === ParticleState.ZOOM ? 1.5 : (state === ParticleState.TREE ? 1 : 1.2);
    pointsRef.current.scale.setScalar(THREE.MathUtils.lerp(pointsRef.current.scale.x, targetScale, delta * 6));
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};