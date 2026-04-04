import React from 'react';
import { motion } from 'framer-motion';

const ShinyText = ({ text, className = '' }) => {
  return (
    <div className={`relative inline-block overflow-hidden ${className}`}>
      {/* Background Gradient Base */}
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-accent-500">
        {text}
      </span>
      {/* Shimmer Overlay */}
      <motion.div
        initial={{ x: '-150%' }}
        animate={{ x: '150%' }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
        className="absolute inset-0 z-10 w-1/3 bg-gradient-to-r from-transparent via-white/50 dark:via-white/30 to-transparent skew-x-12"
      />
    </div>
  );
};

export default ShinyText;
