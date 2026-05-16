import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function GameStage({ dbUser }) {
  const stageRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (stageRef.current && !isInitialized) {
      const rect = stageRef.current.getBoundingClientRect();
      setPosition({ x: rect.width / 2, y: rect.height / 2 });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const handlePointerDown = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;
    setPosition({ x: targetX, y: targetY });
  };

  const avatarIcon = dbUser?.equipped?.clothes?.icon || '🧍';
  const hairIcon = dbUser?.equipped?.hair?.icon || '';

  return (
    <div 
      ref={stageRef}
      onPointerDown={handlePointerDown}
      className="w-full h-full bg-green-100 relative overflow-hidden cursor-crosshair"
      style={{
        backgroundImage: 'radial-gradient(#86efac 3px, transparent 3px)',
        backgroundSize: '50px 50px'
      }}
    >
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-300 font-bold text-4xl pointer-events-none opacity-40 select-none">
        우리 학교 광장
      </div>

      {isInitialized && (
        <motion.div
          className="absolute z-10 w-16 h-16 -ml-8 -mt-8 flex flex-col items-center justify-center pointer-events-none"
          animate={{ x: position.x, y: position.y }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
        >
          <div className="relative flex flex-col items-center">
            <div className="absolute -top-8 bg-white/90 text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap border border-gray-100">
              {dbUser.name}
            </div>
            <div className="relative flex items-center justify-center">
              {hairIcon && <div className="absolute top-[-10px] text-5xl z-20">{hairIcon}</div>}
              <div className="text-6xl z-10">{avatarIcon}</div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="absolute bottom-4 left-4 bg-white/90 px-4 py-2 rounded-xl text-xs font-bold text-gray-500 pointer-events-none shadow-sm border border-gray-100">
        📍 목표 위치: X {Math.round(position.x)} / Y {Math.round(position.y)}
      </div>
    </div>
  );
}
