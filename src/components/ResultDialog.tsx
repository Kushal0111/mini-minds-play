
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ResultDialogProps {
  isOpen: boolean;
  gameType: string;
  score: { correct: number; total: number; accuracy?: number };
  onClose: () => void;
}

const ResultDialog: React.FC<ResultDialogProps> = ({
  isOpen,
  gameType,
  score,
  onClose
}) => {
  const getRankEmoji = (accuracy: number): string => {
    if (accuracy >= 90) return '👑';
    if (accuracy >= 80) return '🏆';
    if (accuracy >= 70) return '🎯';
    if (accuracy >= 60) return '⭐';
    if (accuracy >= 50) return '🐣';
    return '🌱';
  };

  const getRankColor = (accuracy: number): string => {
    if (accuracy >= 90) return 'from-yellow-400 to-orange-500';
    if (accuracy >= 80) return 'from-purple-400 to-purple-500';
    if (accuracy >= 70) return 'from-green-400 to-green-500';
    if (accuracy >= 60) return 'from-blue-400 to-blue-500';
    if (accuracy >= 50) return 'from-yellow-400 to-yellow-500';
    return 'from-gray-400 to-gray-500';
  };

  const accuracy = score.accuracy || Math.round((score.correct / score.total) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <motion.div
              className="text-6xl mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6, repeat: 3 }}
            >
              {getRankEmoji(accuracy)}
            </motion.div>
            
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {gameType} Complete!
            </h2>
            
            <div className={`inline-block px-6 py-2 rounded-full text-white font-semibold mb-4 bg-gradient-to-r ${getRankColor(accuracy)}`}>
              {accuracy >= 90 ? 'Mastermind' : accuracy >= 80 ? 'Expert' : accuracy >= 70 ? 'Great' : accuracy >= 60 ? 'Good' : accuracy >= 50 ? 'Beginner' : 'Noob'}
            </div>
            
            <div className="mb-6 space-y-2">
              <div className="text-lg">
                <span className="font-semibold text-green-600">{score.correct}</span>
                <span className="text-gray-600"> out of </span>
                <span className="font-semibold">{score.total}</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {accuracy}% Accuracy
              </div>
            </div>
            
            <Button onClick={onClose} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-2xl">
              Continue
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResultDialog;
