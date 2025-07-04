import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Eye, X } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import Timer from '../../components/Timer';
import QuickFeedback from '../../components/QuickFeedback';
import QuitGameDialog from '../../components/QuitGameDialog';
import ResultDialog from '../../components/ResultDialog';

interface AttentionGameProps {
  onGameComplete?: () => void;
  difficulty?: string;
}

const AttentionGame: React.FC<AttentionGameProps> = ({ onGameComplete, difficulty = 'medium' }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [gamePhase, setGamePhase] = useState<'watching' | 'answering' | 'result'>('watching');
  const [blinkingShape, setBlinkingShape] = useState<number | null>(null);
  const [blinkSequence, setBlinkSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [currentBlink, setCurrentBlink] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameEnded, setGameEnded] = useState(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);

  const { playSound, dispatch } = useGame();

  const shapes = [
    { id: 0, shape: '🔴', name: 'Circle' },
    { id: 1, shape: '🔵', name: 'Blue Circle' },
    { id: 2, shape: '🟢', name: 'Green Circle' },
    { id: 3, shape: '🟡', name: 'Yellow Circle' },
    { id: 4, shape: '🟣', name: 'Purple Circle' },
    { id: 5, shape: '🟠', name: 'Orange Circle' },
  ];

  useEffect(() => {
    dispatch({ type: 'START_GAME', payload: 'attention' });
    startNewRound();
  }, [dispatch]);

  const generateBlinkSequence = () => {
    const sequenceLength = Math.min(4 + Math.floor(currentQuestion / 2), 6);
    const sequence = [];
    for (let i = 0; i < sequenceLength; i++) {
      sequence.push(Math.floor(Math.random() * 6));
    }
    return sequence;
  };

  const startNewRound = () => {
    const sequence = generateBlinkSequence();
    setBlinkSequence(sequence);
    setPlayerSequence([]);
    setCurrentBlink(0);
    setGamePhase('watching');
    setBlinkingShape(null);
    setTimeLeft(30);
    
    setTimeout(() => {
      showBlinkSequence(sequence);
    }, 1000);
  };

  const showBlinkSequence = (sequence: number[]) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < sequence.length) {
        setBlinkingShape(sequence[index]);
        setTimeout(() => setBlinkingShape(null), 400);
        index++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setGamePhase('answering');
        }, 500);
      }
    }, 800);
  };

  const handleShapeClick = (shapeId: number) => {
    if (gamePhase !== 'answering') return;
    
    const newPlayerSequence = [...playerSequence, shapeId];
    setPlayerSequence(newPlayerSequence);
    
    if (newPlayerSequence.length === blinkSequence.length) {
      const correct = JSON.stringify(newPlayerSequence) === JSON.stringify(blinkSequence);
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
              gameType: 'attention',
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
    }
  };

  const handleTimeUp = () => {
    if (gamePhase === 'answering' && playerSequence.length < blinkSequence.length) {
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
            gameType: 'attention',
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
    <div className="h-screen bg-gradient-to-br from-purple-400 to-pink-500 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-white">
        <div className="flex items-center gap-2">
          <Eye className="w-6 h-6" />
          <span className="font-bold text-lg">Attention Game</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {currentQuestion + 1}/10
          </span>
          {gamePhase === 'answering' && <Timer timeLeft={timeLeft} onTimeUp={handleTimeUp} />}
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
          className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-xl"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ✨ Remember the Blinking Sequence!
            </h2>
            <p className="text-gray-600">
              {gamePhase === 'watching' ? 'Watch carefully...' : 
               gamePhase === 'answering' ? 'Click the shapes in the same order!' : 'Great job!'}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              Sequence length: {blinkSequence.length}
            </div>
          </div>

          {/* Shapes Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {shapes.map((shape) => (
              <motion.button
                key={shape.id}
                onClick={() => handleShapeClick(shape.id)}
                disabled={gamePhase !== 'answering'}
                className={`aspect-square rounded-2xl flex items-center justify-center text-4xl transition-all duration-200 ${
                  gamePhase === 'answering' ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
                } ${
                  blinkingShape === shape.id ? 'bg-yellow-300 scale-110 shadow-lg' : 'bg-gray-100'
                }`}
                animate={{
                  scale: blinkingShape === shape.id ? 1.1 : 1,
                  backgroundColor: blinkingShape === shape.id ? '#fde047' : '#f3f4f6'
                }}
                transition={{ duration: 0.2 }}
              >
                {shape.shape}
              </motion.button>
            ))}
          </div>

          {/* Player Progress */}
          {gamePhase === 'answering' && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 text-center mb-2">
                Your sequence ({playerSequence.length}/{blinkSequence.length}):
              </p>
              <div className="flex justify-center gap-2">
                {playerSequence.map((shapeId, index) => (
                  <span key={index} className="text-2xl">
                    {shapes[shapeId].shape}
                  </span>
                ))}
                {Array(blinkSequence.length - playerSequence.length).fill(0).map((_, index) => (
                  <span key={`empty-${index}`} className="text-2xl text-gray-300">
                    ⭕
                  </span>
                ))}
              </div>
            </div>
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
        gameType="Attention"
        score={score}
        onClose={() => onGameComplete && onGameComplete()}
      />
    </div>
  );
};

export default AttentionGame;
