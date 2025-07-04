
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import GameButton from '../../components/GameButton';
import ResultDialog from '../../components/ResultDialog';
import QuickFeedback from '../../components/QuickFeedback';
import QuitGameDialog from '../../components/QuitGameDialog';

interface AttentionQuestion {
  shape: string;
  blinkSequence: number[];
  options: number[];
}

const AttentionGame: React.FC = () => {
  const { dispatch, getRank, playSound } = useGame();
  const [currentQuestion, setCurrentQuestion] = useState<AttentionQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gamePhase, setGamePhase] = useState<'ready' | 'playing' | 'answer'>('ready');
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [gameActive, setGameActive] = useState(true);
  const [currentBlink, setCurrentBlink] = useState(-1);
  const [blinkIndex, setBlinkIndex] = useState(0);

  const TOTAL_QUESTIONS = 5;
  const GRID_SIZE = 9; // 3x3 grid
  const shapes = ['⭐', '🔴', '🟦', '🟢', '🟡', '🟣', '🔺', '🔶', '💎'];

  useEffect(() => {
    if (gameActive) {
      generateQuestion();
    }
  }, [gameActive]);

  const generateQuestion = () => {
    if (!gameActive) return;
    
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const blinkCount = Math.floor(Math.random() * 2) + 4; // 4-5 blinks
    const blinkSequence: number[] = [];
    
    // Generate random blink sequence
    for (let i = 0; i < blinkCount; i++) {
      blinkSequence.push(Math.floor(Math.random() * GRID_SIZE));
    }
    
    // Generate options (all grid positions)
    const options = Array.from({ length: GRID_SIZE }, (_, i) => i);

    setCurrentQuestion({
      shape,
      blinkSequence,
      options
    });
    
    setSelectedAnswer([]);
    setGamePhase('ready');
    setCurrentBlink(-1);
    setBlinkIndex(0);
  };

  const startBlinking = () => {
    if (!currentQuestion || !gameActive) return;
    
    setGamePhase('playing');
    setBlinkIndex(0);
    
    const playBlinks = () => {
      if (!currentQuestion || !gameActive) return;
      
      const sequence = currentQuestion.blinkSequence;
      let index = 0;
      
      const blinkInterval = setInterval(() => {
        if (!gameActive || index >= sequence.length) {
          clearInterval(blinkInterval);
          setCurrentBlink(-1);
          setTimeout(() => {
            if (gameActive) {
              setGamePhase('answer');
            }
          }, 500);
          return;
        }
        
        setCurrentBlink(sequence[index]);
        setBlinkIndex(index + 1);
        
        setTimeout(() => {
          setCurrentBlink(-1);
        }, 400);
        
        index++;
      }, 800);
    };

    playBlinks();
  };

  const handlePositionSelect = (position: number) => {
    if (gamePhase !== 'answer' || !currentQuestion || !gameActive) return;
    
    const newAnswer = [...selectedAnswer, position];
    setSelectedAnswer(newAnswer);
    
    // Check if sequence is complete
    if (newAnswer.length === currentQuestion.blinkSequence.length) {
      const correct = JSON.stringify(newAnswer) === JSON.stringify(currentQuestion.blinkSequence);
      
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
              🧠 Blink Sequence Game
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
            {gamePhase === 'ready' && '👀 Watch the shape blink in sequence!'}
            {gamePhase === 'playing' && '✨ Remember the blinking order...'}
            {gamePhase === 'answer' && '🧠 Click the positions in the same order!'}
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
                <div className="text-6xl mb-4">{currentQuestion.shape}</div>
                <p className="text-lg text-gray-600 mb-6">
                  This shape will blink {currentQuestion.blinkSequence.length} times in different positions.
                  <br />
                  Remember the sequence!
                </p>
              </div>
              
              <GameButton onClick={startBlinking} variant="primary" disabled={!gameActive}>
                Start Blinking! ✨
              </GameButton>
            </div>
          )}

          {(gamePhase === 'playing' || gamePhase === 'answer') && (
            <div className="text-center">
              {gamePhase === 'playing' && (
                <div className="mb-4 text-lg text-gray-600">
                  Blink {blinkIndex}/{currentQuestion.blinkSequence.length}
                </div>
              )}
              
              {gamePhase === 'answer' && (
                <div className="mb-4 text-lg text-gray-600">
                  Selected: {selectedAnswer.length}/{currentQuestion.blinkSequence.length}
                </div>
              )}
              
              {/* Grid */}
              <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                {Array.from({ length: GRID_SIZE }, (_, index) => (
                  <motion.button
                    key={index}
                    className={`h-20 w-20 rounded-xl transition-all duration-200 border-2 ${
                      currentBlink === index
                        ? 'bg-yellow-400 border-yellow-500 shadow-lg scale-110'
                        : selectedAnswer.includes(index)
                        ? 'bg-blue-200 border-blue-400'
                        : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                    }`}
                    onClick={() => handlePositionSelect(index)}
                    disabled={gamePhase !== 'answer' || !gameActive}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: currentBlink === index ? 1.2 : 1,
                    }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ 
                      scale: gamePhase === 'answer' && gameActive ? 1.1 : 1 
                    }}
                    whileTap={{ 
                      scale: gamePhase === 'answer' && gameActive ? 0.9 : 1 
                    }}
                  >
                    <AnimatePresence>
                      {currentBlink === index && (
                        <motion.span 
                          className="text-3xl"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          {currentQuestion.shape}
                        </motion.span>
                      )}
                      {gamePhase === 'answer' && selectedAnswer.includes(index) && (
                        <span className="text-sm font-bold text-blue-600">
                          {selectedAnswer.indexOf(index) + 1}
                        </span>
                      )}
                    </AnimatePresence>
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

export default AttentionGame;
