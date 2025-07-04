import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Brain, X } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import Timer from '../../components/Timer';
import QuickFeedback from '../../components/QuickFeedback';
import QuitGameDialog from '../../components/QuitGameDialog';
import ResultDialog from '../../components/ResultDialog';

interface MemoryGameProps {
  onGameComplete?: () => void;
  difficulty?: string;
}

const MemoryGame: React.FC<MemoryGameProps> = ({ onGameComplete, difficulty = 'medium' }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [gamePhase, setGamePhase] = useState<'showing' | 'selecting' | 'result'>('showing');
  const [targetItems, setTargetItems] = useState<string[]>([]);
  const [allItems, setAllItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showTimer, setShowTimer] = useState(4);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);

  const { playSound, dispatch } = useGame();

  const itemPool = [
    '🍎', '🍌', '🍊', '🍇', '🥝', '🍓', '🥭', '🍑', '🍒', '🥥',
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
    '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸', '🥊', '⛳',
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐'
  ];

  useEffect(() => {
    dispatch({ type: 'START_GAME', payload: 'memory' });
    startNewRound();
  }, [dispatch]);

  const startNewRound = () => {
    const shuffled = [...itemPool].sort(() => Math.random() - 0.5);
    const targets = shuffled.slice(0, 4);
    const distractors = shuffled.slice(4, 14);
    const all = [...targets, ...distractors].sort(() => Math.random() - 0.5);
    
    setTargetItems(targets);
    setAllItems(all);
    setSelectedItems([]);
    setGamePhase('showing');
    setShowTimer(4);
    setTimeLeft(30);
    
    const countdown = setInterval(() => {
      setShowTimer(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          setGamePhase('selecting');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleItemClick = (item: string) => {
    if (gamePhase !== 'selecting') return;
    
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else if (selectedItems.length < 4) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const submitAnswer = () => {
    if (selectedItems.length !== 4) return;
    
    const correct = targetItems.every(item => selectedItems.includes(item)) && 
                   selectedItems.every(item => targetItems.includes(item));
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    const newScore = {
      correct: score.correct + (correct ? 1 : 0),
      total: score.total + 1
    };
    setScore(newScore);
    
    playSound(correct ? 'correct' : 'wrong');
    
    setTimeout(() => {
      setShowFeedback(false);
      if (currentQuestion + 1 >= 10) {
        setGameEnded(true);
        const accuracy = Math.round((newScore.correct / newScore.total) * 100);
        dispatch({
          type: 'END_GAME',
          payload: {
            gameType: 'memory',
            score: { ...newScore, accuracy },
            completedAt: new Date()
          }
        });
        if (onGameComplete) {
          setTimeout(() => onGameComplete(), 2000);
        }
      } else {
        setCurrentQuestion(currentQuestion + 1);
        startNewRound();
      }
    }, 2000);
  };

  const handleTimeUp = () => {
    if (gamePhase === 'selecting') {
      const newScore = {
        correct: score.correct,
        total: score.total + 1
      };
      setScore(newScore);
      
      if (currentQuestion + 1 >= 10) {
        setGameEnded(true);
        const accuracy = Math.round((newScore.correct / newScore.total) * 100);
        dispatch({
          type: 'END_GAME',
          payload: {
            gameType: 'memory',
            score: { ...newScore, accuracy },
            completedAt: new Date()
          }
        });
        if (onGameComplete) {
          setTimeout(() => onGameComplete(), 2000);
        }
      } else {
        setCurrentQuestion(currentQuestion + 1);
        startNewRound();
      }
    }
  };

  const handleQuit = () => {
    setShowQuitDialog(false);
    if (onGameComplete) {
      onGameComplete();
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-emerald-400 to-teal-500 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-white">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6" />
          <span className="font-bold text-lg">Memory Game</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {currentQuestion + 1}/10
          </span>
          {gamePhase === 'selecting' && <Timer timeLeft={timeLeft} onTimeUp={handleTimeUp} />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowQuitDialog(true)}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Game Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-xl"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🧩 Remember These Items!
            </h2>
            <p className="text-gray-600">
              {gamePhase === 'showing' ? 
                `Memorize these 4 items! Time: ${showTimer}s` : 
                'Select the 4 items you saw earlier'
              }
            </p>
          </div>

          {gamePhase === 'showing' ? (
            /* Showing Phase */
            <div className="grid grid-cols-2 gap-6 mb-6">
              {targetItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-6xl shadow-lg"
                >
                  {item}
                </motion.div>
              ))}
            </div>
          ) : (
            /* Selecting Phase */
            <>
              <div className="grid grid-cols-5 gap-3 mb-6">
                {allItems.map((item, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleItemClick(item)}
                    className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all duration-200 ${
                      selectedItems.includes(item)
                        ? 'bg-blue-500 text-white scale-105 shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item}
                  </motion.button>
                ))}
              </div>

              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Selected: {selectedItems.length}/4
                </p>
                <div className="flex justify-center gap-2 mb-4">
                  {selectedItems.map((item, index) => (
                    <span key={index} className="text-2xl">
                      {item}
                    </span>
                  ))}
                  {Array(4 - selectedItems.length).fill(0).map((_, index) => (
                    <span key={`empty-${index}`} className="text-2xl text-gray-300">
                      ❓
                    </span>
                  ))}
                </div>
                <Button
                  onClick={submitAnswer}
                  disabled={selectedItems.length !== 4}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl"
                >
                  Submit Answer
                </Button>
              </div>
            </>
          )}

          <div className="text-center">
            <div className="flex justify-center gap-4 text-sm text-gray-600">
              <span>Score: {score.correct}/{score.total}</span>
              <span>Accuracy: {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%</span>
            </div>
          </div>
        </motion.div>
      </div>

      <QuickFeedback show={showFeedback} isCorrect={isCorrect} />
      <QuitGameDialog 
        isOpen={showQuitDialog} 
        onClose={() => setShowQuitDialog(false)}
        onQuit={handleQuit}
      />
      <ResultDialog
        isOpen={gameEnded}
        gameType="Memory"
        score={score}
        onClose={() => onGameComplete && onGameComplete()}
      />
    </div>
  );
};

export default MemoryGame;
