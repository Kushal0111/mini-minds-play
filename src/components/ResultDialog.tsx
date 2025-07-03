
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameStats, GameRank } from '../types/game.types';
import GameButton from './GameButton';

interface ResultDialogProps {
  isOpen: boolean;
  stats: GameStats;
  rank: GameRank;
  onPlayAgain: () => void;
  onHome: () => void;
}

const ResultDialog: React.FC<ResultDialogProps> = ({
  isOpen,
  stats,
  rank,
  onPlayAgain,
  onHome
}) => {
  const getRankEmoji = (rank: GameRank): string => {
    const emojis = {
      'Noob': '🌱',
      'Beginner': '🐣',
      'Good': '⭐',
      'Great': '🎯',
      'Expert': '🏆',
      'Mastermind': '👑'
    };
    return emojis[rank];
  };

  const getRankColor = (rank: GameRank): string => {
    const colors = {
      'Noob': 'from-gray-400 to-gray-500',
      'Beginner': 'from-yellow-400 to-yellow-500',
      'Good': 'from-blue-400 to-blue-500',
      'Great': 'from-green-400 to-green-500',
      'Expert': 'from-purple-400 to-purple-500',
      'Mastermind': 'from-yellow-400 to-orange-500'
    };
    return colors[rank];
  };

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
              {getRankEmoji(rank)}
            </motion.div>
            
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Game Complete!
            </h2>
            
            <div className={`inline-block px-6 py-2 rounded-full text-white font-semibold mb-4 bg-gradient-to-r ${getRankColor(rank)}`}>
              {rank}
            </div>
            
            <div className="mb-6 space-y-2">
              <div className="text-lg">
                <span className="font-semibold text-green-600">{stats.correct}</span>
                <span className="text-gray-600"> out of </span>
                <span className="font-semibold">{stats.total}</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(stats.accuracy)}% Accuracy
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <GameButton onClick={onPlayAgain} variant="primary">
                Play Again
              </GameButton>
              <GameButton onClick={onHome} variant="secondary">
                Home
              </GameButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResultDialog;
