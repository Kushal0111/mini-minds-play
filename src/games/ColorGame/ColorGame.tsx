import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Palette, X } from 'lucide-react';
import { generateColorQuestion } from '../../utils/colorUtils';
import { useGame } from '../../context/GameContext';
import Timer from '../../components/Timer';
import QuickFeedback from '../../components/QuickFeedback';
import QuitGameDialog from '../../components/QuitGameDialog';
import ResultDialog from '../../components/ResultDialog';

interface ColorGameProps {
  onGameComplete?: () => void;
  difficulty?: string;
}

const ColorGame: React.FC<ColorGameProps> = ({ onGameComplete, difficulty = 'medium' }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25);
  const [gameEnded, setGameEnded] = useState(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);

  const { playSound, dispatch } = useGame();

  useEffect(() => {
    generateQuestions();
    dispatch({ type: 'START_GAME', payload: 'color' });
  }, [dispatch]);

  const generateQuestions = () => {
    const newQuestions = [];
    for (let i = 0; i < 10; i++) {
      newQuestions.push(generateColorQuestion());
    }
    setQuestions(newQuestions);
  };

  const handleAnswer = (colorIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(colorIndex);
    const correct = colorIndex === questions[currentQuestion].correctColorIndex;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    const newScore = {
      correct: score.correct + (correct ? 1 : 0),
      total: score.total + 1
    };
    setScore(newScore);
    
    playSound(correct ? 'correct' : 'wrong');
    
    setTimeout(() => {
      if (currentQuestion + 1 >= questions.length) {
        setGameEnded(true);
        const accuracy = Math.round((newScore.correct / newScore.total) * 100);
        dispatch({
          type: 'END_GAME',
          payload: {
            gameType: 'color',
            score: { ...newScore, accuracy },
            completedAt: new Date()
          }
        });
        if (onGameComplete) {
          setTimeout(() => onGameComplete(), 2000);
        }
      } else {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setTimeLeft(25);
      }
    }, 1500);
  };

  const handleTimeUp = () => {
    if (selectedAnswer === null) {
      handleAnswer(-1);
    }
  };

  const handleQuit = () => {
    setShowQuitDialog(false);
    if (onGameComplete) {
      onGameComplete();
    }
  };

  if (questions.length === 0) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const question = questions[currentQuestion];

  return (
    <div className="h-screen bg-gradient-to-br from-green-400 to-blue-500 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-white">
        <div className="flex items-center gap-2">
          <Palette className="w-6 h-6" />
          <span className="font-bold text-lg">Color Game</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {currentQuestion + 1}/{questions.length}
          </span>
          <Timer timeLeft={timeLeft} onTimeUp={handleTimeUp} />
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
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🎨 What color is this text?
            </h2>
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <p 
                className="text-4xl font-bold"
                style={{ color: question.textColor }}
              >
                {question.text}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {question.displayColors.map((color: any, index: number) => (
              <Button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`p-4 h-16 rounded-xl border-4 transition-all duration-200 ${
                  selectedAnswer === index
                    ? isCorrect
                      ? 'border-green-500 scale-110'
                      : 'border-red-500 scale-110'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                <span className="text-white font-semibold text-xs drop-shadow-lg">
                  {color.name}
                </span>
              </Button>
            ))}
          </div>

          <div className="mt-6 text-center">
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
        gameType="Color"
        score={score}
        onClose={() => onGameComplete && onGameComplete()}
      />
    </div>
  );
};

export default ColorGame;
