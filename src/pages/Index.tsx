
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import GameButton from '../components/GameButton';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useGame();

  const games = [
    {
      id: 'calendar',
      title: 'Calendar Game',
      emoji: '📅',
      description: 'Calculate dates and days with fun time challenges!',
      color: 'from-blue-500 to-purple-600',
      route: '/calendar'
    },
    {
      id: 'color',
      title: 'Color Game',
      emoji: '🎨',
      description: 'Match colors with your sharp eye and quick thinking!',
      color: 'from-green-500 to-blue-600',
      route: '/color'
    },
    {
      id: 'path',
      title: 'Path Game',
      emoji: '🛤️',
      description: 'Find the shortest path through exciting mazes!',
      color: 'from-orange-500 to-red-600',
      route: '/path'
    },
    {
      id: 'attention',
      title: 'Attention Game',
      emoji: '🧠',
      description: 'Train your memory and focus with shape challenges!',
      color: 'from-purple-500 to-pink-600',
      route: '/attention'
    }
  ];

  const startGame = (gameId: string, route: string) => {
    dispatch({ type: 'START_GAME', payload: gameId });
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold text-white mb-4"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🧸 MiniMinds
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-white/90 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Educational Games for Brilliant Kids!
          </motion.p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              className={`game-card bg-gradient-to-br ${game.color} p-6 cursor-pointer group`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => startGame(game.id, game.route)}
            >
              <div className="text-center text-white">
                <motion.div 
                  className="text-6xl md:text-7xl mb-4"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {game.emoji}
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  {game.title}
                </h2>
                <p className="text-lg opacity-90 mb-6">
                  {game.description}
                </p>
                <motion.div
                  className="inline-block"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 font-semibold">
                    Play Now! 🚀
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block">
            <p className="text-white text-lg font-medium mb-2">
              🌟 Ready to challenge your mind?
            </p>
            <p className="text-white/80">
              Pick a game and start your learning adventure!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
