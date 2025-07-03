
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickFeedbackProps {
  isVisible: boolean;
  isCorrect: boolean;
  duration?: number;
}

const QuickFeedback: React.FC<QuickFeedbackProps> = ({ 
  isVisible, 
  isCorrect, 
  duration = 100 
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`fixed inset-0 z-50 pointer-events-none ${
            isCorrect ? 'bg-green-400/20' : 'bg-red-400/20'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration / 1000 }}
        />
      )}
    </AnimatePresence>
  );
};

export default QuickFeedback;
