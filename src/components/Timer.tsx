
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  timeLeft: number;
  onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ timeLeft, onTimeUp }) => {
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
    }
  }, [timeLeft, onTimeUp]);

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / 30) * circumference;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="4"
        />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={timeLeft <= 5 ? "#ef4444" : "#10b981"}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </svg>
      <motion.span 
        className={`absolute text-lg font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-green-600'}`}
        animate={{ scale: timeLeft <= 5 ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 0.5, repeat: timeLeft <= 5 ? Infinity : 0 }}
      >
        {timeLeft}
      </motion.span>
    </div>
  );
};

export default Timer;
