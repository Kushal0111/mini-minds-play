
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import GameButton from '../../components/GameButton';
import ResultDialog from '../../components/ResultDialog';
import QuickFeedback from '../../components/QuickFeedback';
import QuitGameDialog from '../../components/QuitGameDialog';

interface AttentionQuestion {
  originalPosition: number;
  finalPosition: number;
  shape: string;
}

const AttentionGame: React.FC = () => {
  const { dispatch, getRank, playSound } = useGame();
  const [currentQuestion, setCurrentQuestion] = useState<AttentionQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gamePhase, setGamePhase] = useState<'ready' | 'flipping' | 'answer'>('ready');
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [gameActive, setGameActive] = useState(true);
  const [currentShapePosition, setCurrentShapePosition] = useState(0);

  const TOTAL_QUESTIONS = 5;
  const GRID_SIZE = 9; // 3x3 grid
  const shapes = ['🔺', '🟦', '⭐', '🔴', '💚', '🟣', '🟡', '🟤', '⚫'];

  useEffect(() => {
    if (gameActive) {
      generateQuestion();
    }
  }, [gameActive]);

  const generateQuestion = () => {
    if (!gameActive) return;
    
    const originalPosition = Math.floor(Math.random() * GRID_SIZE);
    let finalPosition = Math.floor(Math.random() * GRID_SIZE);
    
    // Ensure final position is different from original
    while (finalPosition === originalPosition) {
      finalPosition = Math.floor(Math.random() * GRID_SIZE);
    }
    
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    setCurrentQuestion({
      originalPosition,
      finalPosition,
      shape
    });
    
    setSelectedAnswer(null);
    setGamePhase('ready');
    setCurrentShapePosition(originalPosition);
  };

  const startFlipping = () => {
    if (!currentQuestion || !gameActive) return;
    
    setGamePhase('flipping');
    
    // Animate the shape flipping to new position
    setTimeout(() => {
      if (gameActive) {
        setCurrentShapePosition(currentQuestion.finalPosition);
      }
    }, 500);
    
    setTimeout(() => {
      if (gameActive) {
        setGamePhase('answer');
      }
    }, 2000);
  };

  const handleAnswer = (position: number) => {
    if (selectedAnswer !== null || !currentQuestion || !gameActive) return;
    
    setSelectedAnswer(position);
    const correct = position === currentQuestion.originalPosition;
    
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
    setGameActive(true);
    setQuestionNumber(1);
    setScore({ correct: 0, total: 0 });
    setShowResult(false);
    setShowQuitDialog(false);
    generateQuestion();
  };

  const goHome = () => {
    window.history.back();
  };

  const handleQuitConfirm = () => {
    setGameActive(false);
    setShowQuitDialog(false);
    goHome();
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-4">
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
              🧠 Shape Flip Game
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
            {gamePhase === 'ready' && '👀 Remember the shape\'s starting position!'}
            {gamePhase === 'flipping' && '👁️ Watch it flip to a new position...'}
            {gamePhase === 'answer' && '🤔 Where did the shape START from?'}
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
                <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-6">
                  {Array.from({ length: GRID_SIZE }, (_, index) => (
                    <div
                      key={index}
                      className={`h-20 w-20 rounded-xl flex items-center justify-center text-4xl ${
                        index === currentQuestion.originalPosition
                          ? 'bg-blue-100 border-2 border-blue-400'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {index === currentQuestion.originalPosition && (
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0] 
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {currentQuestion.shape}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-lg text-gray-600 mb-6">
                  Remember where this shape is positioned!
                </p>
              </div>
              
              <GameButton onClick={startFlipping} variant="primary" disabled={!gameActive}>
                Start Flipping! 🔄
              </GameButton>
            </div>
          )}

          {gamePhase === 'flipping' && (
            <div className="text-center">
              <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-6">
                {Array.from({ length: GRID_SIZE }, (_, index) => (
                  <div
                    key={index}
                    className={`h-20 w-20 rounded-xl flex items-center justify-center text-4xl ${
                      index === currentShapePosition
                        ? 'bg-blue-100 border-2 border-blue-400'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {index === currentShapePosition && (
                        <motion.div
                          key={`${index}-${currentShapePosition}`}
                          initial={{ rotateY: 0, scale: 1 }}
                          animate={{ 
                            rotateY: [0, 180, 360],
                            scale: [1, 1.3, 1]
                          }}
                          transition={{ duration: 1.5 }}
                        >
                          {currentQuestion.shape}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
              <div className="text-lg text-gray-600">
                Watch the shape flip to its new position...
              </div>
            </div>
          )}

          {gamePhase === 'answer' && (
            <div className="text-center">
              <div className="mb-8">
                <p className="text-xl text-gray-800 mb-6 font-semibold">
                  Click where the shape STARTED from:
                </p>
                
                {/* Grid */}
                <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                  {Array.from({ length: GRID_SIZE }, (_, index) => (
                    <motion.button
                      key={index}
                      className={`h-20 w-20 rounded-xl transition-all duration-200 border-2 ${
                        selectedAnswer === index
                          ? index === currentQuestion.originalPosition
                            ? 'bg-green-500 border-green-600 text-white'
                            : 'bg-red-500 border-red-600 text-white'
                          : selectedAnswer !== null && index === currentQuestion.originalPosition
                          ? 'bg-green-500 border-green-600 text-white'
                          : index === currentQuestion.finalPosition
                          ? 'bg-blue-100 border-blue-400'
                          : 'bg-gray-100 border-gray-300 hover:bg-gray-200 transform hover:scale-105'
                      }`}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null || !gameActive}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: selectedAnswer === null && gameActive ? 1.1 : 1 }}
                      whileTap={{ scale: selectedAnswer === null && gameActive ? 0.9 : 1 }}
                    >
                      {index === currentQuestion.finalPosition && (
                        <span className="text-2xl">{currentQuestion.shape}</span>
                      )}
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

export default AttentionGame;
