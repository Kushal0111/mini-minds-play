
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { generateColorQuestion } from '../../utils/colorUtils';
import GameButton from '../../components/GameButton';
import ResultDialog from '../../components/ResultDialog';
import QuitGameDialog from '../../components/QuitGameDialog';
import AppMenu from '../../components/AppMenu';

interface ColorQuestion {
  text: string;
  textColor: string;
  displayColors: Array<{ name: string; hex: string; rgb: string }>;
  correctColorIndex: number;
}

const ColorGame: React.FC = () => {
  const { dispatch, getRank, playSound } = useGame();
  const [currentQuestion, setCurrentQuestion] = useState<ColorQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [gameActive, setGameActive] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const TOTAL_QUESTIONS = 8;

  useEffect(() => {
    if (gameActive) {
      generateQuestion();
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [gameActive]);

  // Cleanup timeouts when game becomes inactive
  useEffect(() => {
    if (!gameActive && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [gameActive]);

  const generateQuestion = () => {
    if (!gameActive) return;
    
    const question = generateColorQuestion();
    setCurrentQuestion(question);
    setSelectedAnswer(null);
  };

  const handleAnswer = (colorIndex: number) => {
    if (selectedAnswer !== null || !currentQuestion || !gameActive) return;
    
    setSelectedAnswer(colorIndex);
    const isCorrect = colorIndex === currentQuestion.correctColorIndex;
    
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1
    };
    setScore(newScore);
    
    playSound(isCorrect ? 'correct' : 'wrong');
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (!gameActive) return;
      if (questionNumber >= TOTAL_QUESTIONS) {
        const accuracy = (newScore.correct / newScore.total) * 100;
        const rank = getRank(accuracy);
        setShowResult(true);
        playSound('complete');
        
        dispatch({
          type: 'END_GAME',
          payload: {
            gameType: 'color',
            score: { ...newScore, accuracy },
            completedAt: new Date()
          }
        });
      } else {
        setQuestionNumber(prev => prev + 1);
        generateQuestion();
      }
    }, 1000);
  };

  const playAgain = () => {
    setGameActive(true);
    setQuestionNumber(1);
    setScore({ correct: 0, total: 0 });
    setShowResult(false);
    generateQuestion();
  };

  const goHome = () => {
    setGameActive(false);
    window.history.back();
  };

  const handleQuitConfirm = () => {
    setGameActive(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowQuitDialog(false);
    goHome();
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-4">
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
              🎨 Color Game
            </motion.h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-white text-lg font-semibold">
              Question {questionNumber}/{TOTAL_QUESTIONS}
            </div>
            <AppMenu />
          </div>
        </div>

        {/* Instructions */}
        <motion.div 
          className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-white text-lg font-medium">
            👆 Tap the color that matches the TEXT COLOR, not the word!
          </p>
        </motion.div>

        {/* Question */}
        <motion.div 
          className="bg-white rounded-3xl p-8 mb-8 text-center shadow-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          key={questionNumber}
        >
          <div className="mb-6">
            <div className="text-lg text-gray-600 mb-4">
              What color is this text?
            </div>
            <motion.div 
              className="text-6xl md:text-8xl font-bold mb-4"
              style={{ color: currentQuestion.textColor }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {currentQuestion.text}
            </motion.div>
          </div>
        </motion.div>

        {/* Color Options */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {currentQuestion.displayColors.map((color, index) => (
            <motion.button
              key={index}
              className={`h-24 rounded-2xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                selectedAnswer === index
                  ? index === currentQuestion.correctColorIndex
                    ? 'ring-4 ring-green-400 ring-offset-2'
                    : 'ring-4 ring-red-400 ring-offset-2'
                  : selectedAnswer !== null && index === currentQuestion.correctColorIndex
                  ? 'ring-4 ring-green-400 ring-offset-2'
                  : ''
              }`}
              style={{ backgroundColor: color.hex }}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null || !gameActive}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white font-bold text-lg drop-shadow-lg">
                  {color.name}
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Score */}
        <div className="text-center text-white text-lg font-semibold">
          Score: {score.correct}/{score.total}
        </div>

        {/* Quit Game Dialog */}
        <QuitGameDialog
          isOpen={showQuitDialog}
          onClose={() => setShowQuitDialog(false)}
          onConfirm={handleQuitConfirm}
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

export default ColorGame;
