import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Scene } from './components/Scene';
import { Controls } from './components/Controls';
import { ParticleState, GestureType, COLORS, HandData } from './constants';
import { detectGesture } from './services/gestureRecognition';
import { generateHolidayWish } from './services/geminiService';

// MediaPipe global types
declare global {
  interface Window {
    Hands: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

const App: React.FC = () => {
  // State
  const [particleState, setParticleState] = useState<ParticleState>(ParticleState.TREE);
  const [gestureType, setGestureType] = useState<GestureType>(GestureType.NONE);
  const [handX, setHandX] = useState(0.5);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [color, setColor] = useState(COLORS.GREEN);
  const [handDetected, setHandDetected] = useState(false);
  const [wishText, setWishText] = useState("");
  const [isWishLoading, setIsWishLoading] = useState(false);

  // Refs for MediaPipe
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const handsRef = useRef<any>(null);
  const lastGestureRef = useRef<GestureType>(GestureType.NONE);

  // Initialize MediaPipe
  useEffect(() => {
    const initHands = async () => {
      if (!window.Hands) {
        console.warn("MediaPipe Hands script not loaded yet. Retrying...");
        setTimeout(initHands, 500);
        return;
      }

      const hands = new window.Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      // Start Camera directly using getUserMedia for better performance/latency control
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480, facingMode: 'user' } 
        });
        
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current?.play();
                startDetectionLoop();
            };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    const startDetectionLoop = () => {
        const loop = async () => {
            if (handsRef.current && videoRef.current && videoRef.current.readyState === 4) {
                await handsRef.current.send({ image: videoRef.current });
            }
            requestRef.current = requestAnimationFrame(loop);
        };
        loop();
    };

    initHands();

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const onResults = useCallback((results: any) => {
    // Draw skeleton on canvas
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (canvas && ctx) {
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            for (const landmarks of results.multiHandLandmarks) {
                // Draw connectors
                if (window.drawConnectors && window.HAND_CONNECTIONS) {
                    window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
                        color: '#10B981', // Emerald Green
                        lineWidth: 4
                    });
                }
                // Draw landmarks
                if (window.drawLandmarks) {
                    window.drawLandmarks(ctx, landmarks, {
                        color: '#FBBF24', // Amber/Gold
                        lineWidth: 2,
                        radius: 4
                    });
                }
            }
        }
        ctx.restore();
    }

    // Process logic
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setHandDetected(true);
      const landmarks = results.multiHandLandmarks[0];
      
      const handData: HandData = detectGesture(landmarks);
      
      setHandX(handData.x);
      setGestureType(handData.gesture);

      // State Transition Logic
      if (handData.gesture !== lastGestureRef.current) {
        lastGestureRef.current = handData.gesture;
        
        switch (handData.gesture) {
          case GestureType.OPEN:
            setParticleState(ParticleState.CLOUD);
            break;
          case GestureType.FIST:
            setParticleState(ParticleState.TREE);
            break;
          case GestureType.PINCH:
            setParticleState(ParticleState.ZOOM);
            break;
          default:
            break;
        }
      }
    } else {
      setHandDetected(false);
      setGestureType(GestureType.NONE);
    }
  }, []);

  const handleGenerateWish = async () => {
    setIsWishLoading(true);
    const theme = color === COLORS.RED ? "Passion and Warmth" : 
                  color === COLORS.GOLD ? "Wealth and Light" : 
                  color === COLORS.GREEN ? "Growth and Nature" : "Winter Wonder";
    
    const text = await generateHolidayWish(theme);
    setWishText(text);
    setIsWishLoading(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      
      {/* Main 3D Scene */}
      <Scene 
        particleState={particleState}
        color={color}
        handX={handX}
        rotationOffset={rotationOffset}
        wishText={wishText}
      />

      {/* Camera Preview with direct visibility */}
      <div className={`absolute bottom-6 right-6 w-48 h-36 bg-slate-900 rounded-lg overflow-hidden border-2 transition-colors z-50 shadow-2xl ${handDetected ? 'border-emerald-500' : 'border-rose-500/50'}`}>
         {/* Container for Video & Canvas */}
         <div className="relative w-full h-full">
            <video 
                ref={videoRef} 
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" 
                playsInline 
                muted
            />
            {/* Canvas overlay for Skeleton - also mirrored to match video */}
            <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
            />
            
            {!handDetected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
                    <span className="text-xs font-medium text-white/80 animate-pulse">Show Hand</span>
                </div>
            )}
         </div>
      </div>

      {/* UI Overlay */}
      <Controls 
        currentGesture={gestureType}
        selectedColor={color}
        onColorSelect={setColor}
        onGenerateWish={handleGenerateWish}
        isWishLoading={isWishLoading}
        handDetected={handDetected}
      />
    </div>
  );
};

export default App;