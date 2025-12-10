import React from 'react';
import { COLORS, GestureType } from '../constants';

interface ControlsProps {
  currentGesture: GestureType;
  selectedColor: string;
  onColorSelect: (color: string) => void;
  onGenerateWish: () => void;
  isWishLoading: boolean;
  handDetected: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ 
  currentGesture, 
  selectedColor, 
  onColorSelect,
  onGenerateWish,
  isWishLoading,
  handDetected
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
            <h1 className="text-4xl font-bold text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            HoloTree
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xs">
                Interactive 3D Particle Experience
            </p>
        </div>
        
        {/* Status Badge */}
        <div className={`px-4 py-2 rounded-full border backdrop-blur-md flex items-center gap-2 ${
            handDetected ? 'bg-green-500/20 border-green-500/50 text-green-300' : 'bg-red-500/20 border-red-500/50 text-red-300'
        }`}>
            <div className={`w-2 h-2 rounded-full ${handDetected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-xs font-mono uppercase">
                {handDetected ? `Gesture: ${currentGesture}` : 'No Hand Detected'}
            </span>
        </div>
      </div>

      {/* Guide & Legend */}
      <div className="absolute top-1/2 left-6 transform -translate-y-1/2 space-y-4 pointer-events-auto hidden md:block">
        <div className="bg-slate-900/50 backdrop-blur-md p-4 rounded-xl border border-slate-700/50 text-slate-300 text-sm space-y-2">
            <h3 className="text-white font-semibold mb-2">Gesture Guide</h3>
            <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs">✊</span>
                <span>Fist: Close Tree</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs">🖐</span>
                <span>Open: Expand / Cloud</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs">👋</span>
                <span>Move X: Rotate</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs">👌</span>
                <span>Pinch: Zoom / Focus</span>
            </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="pointer-events-auto flex flex-col md:flex-row items-end md:items-center justify-between gap-4">
        {/* Color Picker */}
        <div className="flex gap-3 bg-slate-900/60 backdrop-blur-md p-2 rounded-full border border-slate-700/50">
            {Object.entries(COLORS).map(([name, hex]) => (
                <button
                    key={name}
                    onClick={() => onColorSelect(hex)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 border-2 ${
                        selectedColor === hex ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: hex }}
                    aria-label={`Select ${name} color`}
                />
            ))}
        </div>

        {/* AI Action */}
        <button
            onClick={onGenerateWish}
            disabled={isWishLoading}
            className="group relative px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 overflow-hidden"
        >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center gap-2">
                {isWishLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                )}
                Generate Holiday Wish
            </span>
        </button>
      </div>
    </div>
  );
};