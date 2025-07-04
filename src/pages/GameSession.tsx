import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import CalendarGame from '../games/CalendarGame/CalendarGame';
import ColorGame from '../games/ColorGame/ColorGame';
import PathGame from '../games/PathGame/PathGame';
import AttentionGame from '../games/AttentionGame/AttentionGame';
import MemoryGame from '../games/MemoryGame/MemoryGame';
import HeadCountGame from '../games/HeadCountGame/HeadCountGame';

const games = [
  { id: 'calendar', name: 'Calendar', component: CalendarGame },
  { id: 'color', name: 'Color', component: ColorGame },
  { id: 'path', name: 'Path', component: PathGame },
  { id: 'attention', name: 'Attention', component: AttentionGame },
  { id: 'memory', name: 'Memory', component: MemoryGame },
  { id: 'headcount', name: 'Head Count', component: HeadCountGame },
];

const GameSession = () => {
  const [totalGames, setTotalGames] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [completedGames, setCompletedGames] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [gameSequence, setGameSequence] = useState<string[]>([]);

  const generateGameSequence = () => {
    const sequence = [];
    for (let i = 0; i < totalGames; i++) {
      const randomIndex = Math.floor(Math.random() * games.length);
      sequence.push(games[randomIndex].id);
    }
    setGameSequence(sequence);
  };

  const startSession = () => {
    generateGameSequence();
    setSessionStarted(true);
    setCurrentGameIndex(0);
    setCompletedGames(0);
  };

  const handleGameComplete = () => {
    const nextIndex = currentGameIndex + 1;
    setCompletedGames(nextIndex);
    
    if (nextIndex >= totalGames) {
      // Session complete
      setSessionStarted(false);
      alert(`🎉 Session Complete! You played ${totalGames} games!`);
      return;
    }
    
    setCurrentGameIndex(nextIndex);
  };

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 overflow-hidden">
        <div className="p-4">
          <Link to="/" className="inline-flex items-center text-white hover:text-white/80 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="container mx-auto px-4 py-8">
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-md mx-auto shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
              🎮 Game Session
            </h1>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Games
                </label>
                <Select value={totalGames.toString()} onValueChange={(value) => setTotalGames(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 Games</SelectItem>
                    <SelectItem value="15">15 Games</SelectItem>
                    <SelectItem value="20">20 Games</SelectItem>
                    <SelectItem value="25">25 Games</SelectItem>
                    <SelectItem value="30">30 Games</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={startSession}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-2xl text-lg"
              >
                Start Session 🚀
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentGame = games.find(game => game.id === gameSequence[currentGameIndex]);
  const CurrentGameComponent = currentGame?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-white/20 p-4">
        <div className="flex justify-between items-center text-white mb-2">
          <span className="font-semibold">Game {completedGames + 1} of {totalGames}</span>
          <span className="text-sm">{Math.round(((completedGames) / totalGames) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedGames / totalGames) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Game */}
      <div className="h-[calc(100vh-100px)] overflow-hidden">
        {CurrentGameComponent && (
          <CurrentGameComponent 
            onGameComplete={handleGameComplete}
            difficulty={difficulty}
          />
        )}
      </div>
    </div>
  );
};

export default GameSession;
