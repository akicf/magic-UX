import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { ParticleTree } from './ParticleTree';
import { ParticleState } from '../constants';

interface SceneProps {
  particleState: ParticleState;
  color: string;
  handX: number;
  rotationOffset: number;
  wishText: string;
}

export const Scene: React.FC<SceneProps> = ({ particleState, color, handX, rotationOffset, wishText }) => {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }} gl={{ antialias: false }}>
        <color attach="background" args={['#050505']} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color={color} />
        
        <Suspense fallback={null}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ParticleTree 
                state={particleState} 
                color={color} 
                handX={handX} 
                rotationOffset={rotationOffset}
            />
            {wishText && (
                <Text
                    position={[0, -4.5, 0]}
                    fontSize={0.5}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={8}
                    textAlign="center"
                    font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
                >
                    {wishText}
                </Text>
            )}
        </Suspense>

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
        </EffectComposer>
        
        {/* Allow mouse override if hand is not detected/active, but handX usually dictates rotation */}
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
};