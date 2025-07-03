
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import GameButton from '../../components/GameButton';
import ResultDialog from '../../components/ResultDialog';
import QuickFeedback from '../../components/QuickFeedback';

interface AttentionQuestion {
  originalSurface: number;
  flips: Array<{ from: number; to: number }>;
  currentSurface: number;
}

const AttentionGame: React.FC = () => {
  const { dispatch, getRank, playSound } = useGame();
  const [currentQuestion, setCurrentQuestion] = useState<AttentionQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showResult, setShowResult] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentFlipIndex, setCurrentFlipIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gamePhase, setGamePhase] = useState<'ready' | 'flipping' | 'answer'>('ready');

  const TOTAL_QUESTIONS = 5;
  const SURFACES = 6; // Number of surfaces to choose from
  const shapes = ['🔺', '🟦', '⭐', '🔴', '💚', '🟣'];

  useEffect(() => {
    generateQuestion();
  }, []);

  const generateQuestion = () => {
    const originalSurface = Math.floor(Math.random() * SURFACES);
    const numFlips = Math.floor(Math.random() * 3) + 4; // 4-6 flips
    const flips: Array<{ from: number; to: number }> = [];
    
    let currentSurface = originalSurface;
    
    for (let i = 0; i < numFlips; i++) {
      const nextSurface = Math.floor(Math.random() * SURFACES);
      flips.push({ from: currentSurface, to: nextSurface });
      currentSurface = nextSurface;
    }

    setCurrentQuestion({
      originalSurface,
      flips,
      currentSurface
    });
    
    setSelectedAnswer(null);
    setCurrentFlipIndex(0);
    setGamePhase('ready');
  };

  const startFlipping = () => {
    if (!currentQuestion) return;
    
    setGamePhase('flipping');
    setIsFlipping(true);
    setCurrentFlipIndex(0);
    
    // Execute flips with delays
    const executeFlips = async () => {
      for (let i = 0; i < currentQuestion.flips.length; i++) {
        setCurrentFlipIndex(i);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      setIsFlipping(false);
      setGamePhase('answer');
    };
    
    executeFlips();
  };

  const handleAnswer = (surface: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;
    
    setSelectedAnswer(surface);
    const correct = surface === currentQuestion.originalSurface;
    
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
      if (questionNumber >= TOTAL_QUESTIONS) {
        const accuracy = (newScore.correct / newScore.total) * 100;
        const rank = getRank(accuracy);
        setShowResult(true);
        playSound('complete');
        
        dispatch({
          type: 'END_GAME',
          payload: {
            gameType: 'attention',
            score: { ...newScore, accuracy },
            completedAt: new Date()
          }
        });
      } else {
        setQuestionNumber(prev => prev + 1);
        generateQuestion();
      }
    }, 1500);
  };

  const playAgain = () => {
    setQuestionNumber(1);
    setScore({ correct: 0, total: 0 });
    setShowResult(false);
    generateQuestion();
  };

  const goHome = () => {
    window.history.back();
  };

  const getCurrentShape = () => {
    if (!currentQuestion) return shapes[0];
    
    if (gamePhase === 'ready') {
      return shapes[currentQuestion.originalSurface];
    } else if (gamePhase === 'flipping' && currentFlipIndex < currentQuestion.flips.length) {
      return shapes[currentQuestion.flips[currentFlipIndex].to];
    } else {
      return shapes[currentQuestion.currentSurface];
    }
  };

  const getCurrentSurface = () => {
    if (!currentQuestion) return 0;
    
    if (gamePhase === 'ready') {
      return currentQuestion.originalSurface;
    } else if (gamePhase === 'flipping' && currentFlipIndex < currentQuestion.flips.length) {
      return currentQuestion.flips[currentFlipIndex].to;
    } else {
      return currentQuestion.currentSurface;
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🧠 Attention Game
          </motion.h1>
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
            {gamePhase === 'ready' && '👀 Watch the shape move, then find its original position!'}
            {gamePhase === 'flipping' && '👁️ Keep watching...'}
            {gamePhase === 'answer' && '🤔 Where did the shape start?'}
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
              <div className="mb-8">
                <motion.div 
                  className="text-8xl mb-4"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0] 
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {getCurrentShape()}
                </motion.div>
                <p className="text-lg text-gray-600 mb-6">
                  Remember this shape and its position!
                </p>
              </div>
              
              <GameButton onClick={startFlipping} variant="primary">
                Start Flipping! 🚀
              </GameButton>
            </div>
          )}

          {gamePhase === 'flipping' && (
            <div className="text-center">
              <div className="mb-4 text-lg text-gray-600">
                Flip {currentFlipIndex + 1} of {currentQuestion.flips.length}
              </div>
              <motion.div 
                className="text-8xl mb-4"
                key={currentFlipIndex}
                initial={{ rotateY: 0, scale: 1 }}
                animate={{ 
                  rotateY: [0, 180, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 0.8 }}
              >
                {getCurrentShape()}
              </motion.div>
              <div className="text-sm text-gray-500">
                Watch carefully...
              </div>
            </div>
          )}

          {gamePhase === 'answer' && (
            <div className="text-center">
              <div className="mb-8">
                <p className="text-xl text-gray-800 mb-6 font-semibold">
                  Which surface did the shape START from?
                </p>
                
                {/* Surface Grid */}
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  {Array.from({ length: SURFACES }, (_, index) => (
                    <motion.button
                      key={index}
                      className={`h-20 w-20 mx-auto rounded-xl text-4xl transition-all duration-200 ${
                        selectedAnswer === index
                          ? index === currentQuestion.originalSurface
                            ? 'bg-green-500 text-white ring-4 ring-green-300'
                            : 'bg-red-500 text-white ring-4 ring-red-300'
                          : selectedAnswer !== null && index === currentQuestion.originalSurface
                          ? 'bg-green-500 text-white ring-4 ring-green-300'
                          : 'bg-gray-100 hover:bg-gray-200 transform hover:scale-105'
                      }`}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: selectedAnswer === null ? 1.1 : 1 }}
                      whileTap={{ scale: selectedAnswer === null ? 0.9 : 1 }}
                    >
                      {shapes[index]}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Score */}
        <div className="text-center text-white text-lg font-semibold">
          Accuracy: {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
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
      </div>
    </div>
  );
};

export default AttentionGame;
