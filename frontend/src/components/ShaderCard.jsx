import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * ShaderCard Component
 * Card with interactive shader glow effects
 * 
 * Usage:
 * <ShaderCard>
 *   <YourCardContent />
 * </ShaderCard>
 */
const ShaderCard = ({
  children,
  className = '',
  glowColor = 'from-primary-500 to-accent-500',
  hoverEffect = true,
  interactive = true,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!hoverEffect || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    if (interactive) setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (interactive) setIsHovering(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={hoverEffect ? { scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
    >
      {/* Shader Glow Background */}
      {isHovering && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
          style={{
            left: `${mousePosition.x - 100}px`,
            top: `${mousePosition.y - 100}px`,
          }}
        >
          <div
            className={`absolute w-48 h-48 bg-gradient-to-r ${glowColor} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
            style={{
              filter: 'blur(40px)',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        </motion.div>
      )}

      {/* Border Glow Effect */}
      {isHovering && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, 
              rgba(14, 165, 233, 0.1), 
              rgba(139, 92, 246, 0.05), 
              transparent 80%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Animated Border */}
      <motion.div
        className="absolute inset-0 rounded-xl border border-transparent pointer-events-none"
        animate={
          isHovering
            ? {
                boxShadow: [
                  '0 0 20px rgba(14, 165, 233, 0.2)',
                  '0 0 40px rgba(139, 92, 246, 0.3)',
                  '0 0 20px rgba(14, 165, 233, 0.2)',
                ],
              }
            : {}
        }
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* CSS Keyframe Animation for Pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { 
            opacity: 0.2;
            transform: scale(1);
          }
          50% { 
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
      `}</style>
    </motion.div>
  );
};

export default ShaderCard;
