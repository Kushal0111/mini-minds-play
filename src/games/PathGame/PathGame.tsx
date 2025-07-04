
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { generatePathQuestion, generateSVGPath, Path } from '../../utils/pathUtils';
import GameButton from '../../components/GameButton';
import ResultDialog from '../../components/ResultDialog';
import QuickFeedback from '../../components/QuickFeedback';
import QuitGameDialog from '../../components/QuitGameDialog';

const PathGame: React.FC = () => {
  const { dispatch, getRank, playSound } = useGame();
  const [currentPaths, setCurrentPaths] = useState<Path[]>([]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showResult, setShowResult] = useState(false);
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [gameActive, setGameActive] = useState(true);

  const TOTAL_QUESTIONS = 6;

  useEffect(() => {
    if (gameActive) {
      generateQuestion();
    }
  }, [gameActive]);

  const generateQuestion = () => {
    if (!gameActive) return;
    
    const paths = generatePathQuestion();
    setCurrentPaths(paths);
    setSelectedPath(null);
  };

  const handlePathSelect = (pathId: number) => {
    if (selectedPath !== null || !gameActive) return;
    
    setSelectedPath(pathId);
    const selectedPathData = currentPaths.find(p => p.id === pathId);
    const correct = selectedPathData?.isCorrect || false;
    
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
            gameType: 'path',
            score: { ...newScore, accuracy },
            completedAt: new Date()
          }
        });
      } else {
        setQuestionNumber(prev => prev + 1);
        generateQuestion();
      }
    }, 800);
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

  const getPathStroke = (path: Path) => {
    if (selectedPath === null) return path.color;
    if (selectedPath === path.id) {
      return path.isCorrect ? '#10B981' : '#EF4444'; // Green for correct, red for wrong
    }
    if (path.isCorrect && selectedPath !== null) {
      return '#10B981'; // Show correct path in green
    }
    return '#9CA3AF'; // Muted gray for unselected
  };

  const getPathOpacity = (path: Path) => {
    if (selectedPath === null) return 1;
    if (selectedPath === path.id || path.isCorrect) return 1;
    return 0.4;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 p-4">
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
              🐭 Mouse Path Game
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
            🎯 Help the mouse find the SHORTEST path to get home!
          </p>
        </motion.div>

        {/* Game Area */}
        <motion.div 
          className="bg-white rounded-3xl p-6 mb-8 shadow-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          key={questionNumber}
        >
          <div className="relative">
            <svg 
              viewBox="0 0 400 300" 
              className="w-full h-64 md:h-80 border-2 border-gray-200 rounded-xl bg-green-50"
            >
              {/* Mouse at start */}
              <text x="50" y="140" textAnchor="middle" className="text-4xl">
                🐭
              </text>
              <text x="50" y="175" textAnchor="middle" className="text-xs font-bold fill-green-600">
                MOUSE
              </text>
              
              {/* Home at end */}
              <text x="350" y="140" textAnchor="middle" className="text-4xl">
                🏠
              </text>
              <text x="350" y="175" textAnchor="middle" className="text-xs font-bold fill-red-600">
                HOME
              </text>

              {/* Paths */}
              {currentPaths.map((path, index) => (
                <motion.g key={path.id}>
                  <motion.path
                    d={generateSVGPath(path.points)}
                    fill="none"
                    stroke={getPathStroke(path)}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity={getPathOpacity(path)}
                    className="cursor-pointer hover:stroke-opacity-80 transition-all"
                    onClick={() => handlePathSelect(path.id)}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </motion.g>
              ))}
            </svg>
          </div>
          
          {/* Path selection buttons */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            {currentPaths.map((path) => (
              <motion.button
                key={path.id}
                className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                  selectedPath === path.id
                    ? path.isCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : selectedPath !== null && path.isCorrect
                    ? 'bg-green-500 text-white'
                    : 'text-white hover:bg-white/20'
                }`}
                style={{
                  backgroundColor: selectedPath === null ? path.color : undefined
                }}
                onClick={() => handlePathSelect(path.id)}
                disabled={selectedPath !== null || !gameActive}
                whileHover={{ scale: selectedPath === null && gameActive ? 1.05 : 1 }}
                whileTap={{ scale: selectedPath === null && gameActive ? 0.95 : 1 }}
              >
                {path.color === '#EF4444' ? 'Red Path' :
                 path.color === '#3B82F6' ? 'Blue Path' :
                 path.color === '#10B981' ? 'Green Path' :
                 path.color === '#F59E0B' ? 'Yellow Path' : 'Purple Path'}
              </motion.button>
            ))}
          </div>
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

export default PathGame;
