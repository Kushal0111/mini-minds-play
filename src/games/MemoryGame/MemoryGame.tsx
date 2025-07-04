
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import GameButton from '../../components/GameButton';
import ResultDialog from '../../components/ResultDialog';
import QuickFeedback from '../../components/QuickFeedback';
import QuitGameDialog from '../../components/QuitGameDialog';

interface MemoryQuestion {
  targetItems: string[];
  allItems: string[];
}

const MemoryGame: React.FC = () => {
  const { dispatch, getRank, playSound } = useGame();
  const [currentQuestion, setCurrentQuestion] = useState<MemoryQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showResult, setShowResult] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gamePhase, setGamePhase] = useState<'ready' | 'showing' | 'answer'>('ready');
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [gameActive, setGameActive] = useState(true);

  const TOTAL_QUESTIONS = 6;
  const allAvailableItems = [
    '🍎', '🍌', '🍊', '🍇', '🍓', '🥝', '🍑', '🍒', '🥭', '🫐',
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
    '⚽', '🏀', '🏈', '🎾', '🏐', '🏓', '🥎', '🏸', '🏑', '🏒',
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐'
  ];

  useEffect(() => {
    if (gameActive) {
      generateQuestion();
    }
  }, [gameActive]);

  const generateQuestion = () => {
    if (!gameActive) return;
    
    // Select 4 random target items
    const shuffled = [...allAvailableItems].sort(() => Math.random() - 0.5);
    const targetItems = shuffled.slice(0, 4);
    
    // Create a pool of 12 items (4 targets + 8 distractors)
    const distractors = shuffled.slice(4, 12);
    const allItems = [...targetItems, ...distractors].sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      targetItems,
      allItems
    });
    
    setSelectedItems([]);
    setGamePhase('ready');
  };

  const startShowing = () => {
    if (!currentQuestion || !gameActive) return;
    
    setGamePhase('showing');
    
    // Show for 4 seconds
    setTimeout(() => {
      if (gameActive) {
        setGamePhase('answer');
      }
    }, 4000);
  };

  const handleItemSelect = (item: string) => {
    if (gamePhase !== 'answer' || !currentQuestion || !gameActive) return;
    
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
      return;
    }
    
    if (selectedItems.length >= 4) return;
    
    const newSelected = [...selectedItems, item];
    setSelectedItems(newSelected);
    
    // Check if all 4 items are selected
    if (newSelected.length === 4) {
      setTimeout(() => {
        if (!gameActive) return;
        
        const correct = currentQuestion.targetItems.every(target => 
          newSelected.includes(target)
        ) && newSelected.every(selected => 
          currentQuestion.targetItems.includes(selected)
        );
        
        setIsCorrect(correct);
        setShowFeedback(true);
        
        const newScore = {
          correct: score.correct + (correct ? 1 : 0),
          total: score.total + 1
        };
        setScore(newScore);
        
        playSound(correct ? 'correct' : 'wrong');
        
        setTimeout(() => {
          if (!gameActive) return;
          setShowFeedback(false);
          if (questionNumber >= TOTAL_QUESTIONS) {
            const accuracy = (newScore.correct / newScore.total) * 100;
            const rank = getRank(accuracy);
            setShowResult(true);
            playSound('complete');
            
            dispatch({
              type: 'END_GAME',
              payload: {
                gameType: 'memory',
                score: { ...newScore, accuracy },
                completedAt: new Date()
              }
            });
          } else {
            setQuestionNumber(prev => prev + 1);
            generateQuestion();
          }
        }, 1500);
      }, 500);
    }
  };

  const playAgain = () => {
    setGameActive(true);
    setQuestionNumber(1);
    setScore({ correct: 0, total: 0 });
    setShowResult(false);
    setShowQuitDialog(false);
    generateQuestion();
  };

  const goHome = () => {
    setGameActive(false);
    window.history.back();
  };

  const handleQuitConfirm = () => {
    setGameActive(false);
    setShowQuitDialog(false);
    goHome();
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setShowQuitDialog(true)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </motion.button>
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-white"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              🧩 Memory Game
            </motion.h1>
          </div>
          <div className="text-white text-lg font-semibold">
            Question {questionNumber}/{TOTAL_QUESTIONS}
          </div>
        </div>

        {/* Instructions */}
        <motion.div 
          className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-white text-lg font-medium">
            {gamePhase === 'ready' && '👀 Remember these 4 items for 4 seconds!'}
            {gamePhase === 'showing' && '🧠 Memorize these items...'}
            {gamePhase === 'answer' && '🎯 Find the 4 items you saw!'}
          </p>
        </motion.div>

        {/* Game Area */}
        <motion.div 
          className="bg-white rounded-3xl p-8 mb-8 shadow-xl min-h-96"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          key={questionNumber}
        >
          {gamePhase === 'ready' && (
            <div className="text-center">
              <div className="text-6xl mb-6">🧠</div>
              <p className="text-lg text-gray-600 mb-8">
                You will see 4 different items for 4 seconds.
                <br />
                Then you need to find them among other items!
              </p>
              
              <GameButton onClick={startShowing} variant="primary" disabled={!gameActive}>
                Start Memory Test! 🚀
              </GameButton>
            </div>
          )}

          {gamePhase === 'showing' && (
            <div className="text-center">
              <p className="text-xl text-gray-800 mb-6 font-semibold">
                Remember these items:
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-md mx-auto">
                {currentQuestion.targetItems.map((item, index) => (
                  <motion.div
                    key={index}
                    className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-6 shadow-lg"
                    initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ delay: index * 0.3, duration: 0.6 }}
                  >
                    <div className="text-4xl">{item}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {gamePhase === 'answer' && (
            <div className="text-center">
              <p className="text-xl text-gray-800 mb-4 font-semibold">
                Find the 4 items you saw:
              </p>
              <p className="text-gray-600 mb-6">
                Selected: {selectedItems.length}/4
              </p>
              
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {currentQuestion.allItems.map((item, index) => (
                  <motion.button
                    key={index}
                    className={`p-4 rounded-xl transition-all duration-200 border-2 ${
                      selectedItems.includes(item)
                        ? 'bg-blue-200 border-blue-400 shadow-lg scale-105'
                        : 'bg-gray-100 border-gray-300 hover:bg-gray-200 hover:scale-105'
                    }`}
                    onClick={() => handleItemSelect(item)}
                    disabled={!gameActive}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: gameActive ? 1.1 : 1 }}
                    whileTap={{ scale: gameActive ? 0.9 : 1 }}
                  >
                    <div className="text-3xl">{item}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Score */}
        <div className="text-center text-white text-lg font-semibold">
          Score: {score.correct}/{score.total} | Accuracy: {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
        </div>

        {/* Quick Feedback */}
        <QuickFeedback 
          isVisible={showFeedback}
          isCorrect={isCorrect}
          duration={100}
        />

        {/* Result Dialog */}
        {showResult && (
          <ResultDialog
            isOpen={showResult}
            stats={{
              correct: score.correct,
              total: score.total,
              accuracy: (score.correct / score.total) * 100
            }}
            rank={getRank((score.correct / score.total) * 100)}
            onPlayAgain={playAgain}
            onHome={goHome}
          />
        )}

        {/* Quit Game Dialog */}
        <QuitGameDialog
          isOpen={showQuitDialog}
          onClose={() => setShowQuitDialog(false)}
          onConfirm={handleQuitConfirm}
        />
      </div>
    </div>
  );
};

export default MemoryGame;
