import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const frames = [
  `${process.env.PUBLIC_URL || ''}/story_frames/frame1.png`,
  `${process.env.PUBLIC_URL || ''}/story_frames/frame2.png`,
  `${process.env.PUBLIC_URL || ''}/story_frames/frame3.png`,
  `${process.env.PUBLIC_URL || ''}/story_frames/frame4.png`
];

const StoryAnimation = () => {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    // Advanced interval logic that cycles cleanly
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % frames.length);
    }, 2800); // Hold each frame for 2.8 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-80 bg-gray-50 dark:bg-dark-800/50 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-gray-200 dark:border-dark-700 p-6">
      
      {/* Image Renderer */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentFrame}
          src={frames[currentFrame]}
          initial={{ opacity: 0, scale: 0.95, x: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 1.05, x: -30 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full h-full object-contain drop-shadow-xl"
          alt={`Story Sequence Phase ${currentFrame + 1}`}
        />
      </AnimatePresence>
      
      {/* Narrative Caption */}
      <div className="absolute top-4 left-0 right-0 text-center">
        <motion.div
           key={`text-${currentFrame}`}
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4 }}
           className="inline-block px-5 py-2 rounded-full bg-white/90 dark:bg-dark-900/90 backdrop-blur-md shadow-md text-sm font-semibold border border-gray-200 dark:border-dark-600 text-gray-800 dark:text-gray-100"
        >
          {currentFrame === 0 && "1. Arriving at the station 🚆"}
          {currentFrame === 1 && "2. Taxi prices are insane! 😡"}
          {currentFrame === 2 && "3. Booking RailPool instead 😃"}
          {currentFrame === 3 && "4. Going home comfortably! 🚗💨"}
        </motion.div>
      </div>

      {/* Progress Track */}
      <div className="absolute bottom-4 flex gap-3">
        {frames.map((_, idx) => (
          <div 
            key={idx} 
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === currentFrame ? 'bg-primary-500 scale-125' : 'bg-gray-300 dark:bg-dark-600'
            }`} 
          />
        ))}
      </div>
    </div>
  );
};

export default StoryAnimation;
