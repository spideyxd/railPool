import React from 'react';
import FluidCanvas from './FluidCanvas';

/**
 * ShaderBackground Component
 * Wraps pages with fluid shader effects
 * 
 * Usage:
 * <ShaderBackground intensity={0.5}>
 *   <YourPageContent />
 * </ShaderBackground>
 */
const ShaderBackground = ({
  children,
  intensity = 0.6,
  opacity = 0.2,
  blendMode = 'screen',
  showDebug = false,
}) => {
  return (
    <div className="relative w-full min-h-screen">
      {/* Shader Canvas Background - Fixed Positioning */}
      <div
        className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
        style={{
          opacity: Math.max(opacity, 0.01), // Ensure some visibility
          mixBlendMode: blendMode,
          overflow: 'hidden',
        }}
      >
        <FluidCanvas intensity={Math.max(intensity, 0.1)} className="w-full h-full" />
      </div>

      {/* Debug Info */}
      {showDebug && (
        <div className="fixed top-4 right-4 z-50 bg-dark-800/90 backdrop-blur p-4 rounded-lg text-xs text-yellow-300 font-mono border border-yellow-500/30">
          <div className="font-bold mb-2">🎨 SHADER DEBUG</div>
          <div>Canvas: ACTIVE ✓</div>
          <div>Intensity: {intensity.toFixed(2)}</div>
          <div>Opacity: {opacity.toFixed(2)}</div>
          <div>Blend: {blendMode}</div>
          <div className="mt-2 text-yellow-200">Move mouse to see effect</div>
        </div>
      )}

      {/* Page Content - Relative Positioning */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};

export default ShaderBackground;
