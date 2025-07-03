
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

  const getPathColor = (path: Path) => {
    if (selectedPath === null) return '#6B7280'; // Default gray
    if (selectedPath === path.id) {
      return path.isCorrect ? '#10B981' : '#EF4444'; // Green for correct, red for wrong
    }
    if (path.isCorrect && selectedPath !== null) {
      return '#10B981'; // Show correct path in green
    }
    return '#9CA3AF'; // Muted gray for unselected
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
              🛤️ Path Game
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
            🎯 Find the SHORTEST path from start to finish!
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
              className="w-full h-64 md:h-80 border-2 border-gray-200 rounded-xl bg-gray-50"
            >
              {/* Start and End markers */}
              <circle cx="50" cy="150" r="15" fill="#10B981" />
              <text x="50" y="130" textAnchor="middle" className="text-xs font-bold fill-green-600">
                START
              </text>
              
              <circle cx="350" cy="150" r="15" fill="#EF4444" />
              <text x="350" y="130" textAnchor="middle" className="text-xs font-bold fill-red-600">
                FINISH
              </text>

              {/* Paths */}
              {currentPaths.map((path, index) => (
                <motion.g key={path.id}>
                  <motion.path
                    d={generateSVGPath(path.points)}
                    fill="none"
                    stroke={getPathColor(path)}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="cursor-pointer hover:stroke-blue-500 transition-colors"
                    onClick={() => handlePathSelect(path.id)}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                  
                  {/* Path number label */}
                  <circle
                    cx={path.points[Math.floor(path.points.length / 2)]?.x || 0}
                    cy={path.points[Math.floor(path.points.length / 2)]?.y || 0}
                    r="12"
                    fill="white"
                    stroke={getPathColor(path)}
                    strokeWidth="2"
                    className="cursor-pointer"
                    onClick={() => handlePathSelect(path.id)}
                  />
                  <text
                    x={path.points[Math.floor(path.points.length / 2)]?.x || 0}
                    y={path.points[Math.floor(path.points.length / 2)]?.y || 0}
                    textAnchor="middle"
                    dy="4"
                    className="text-sm font-bold cursor-pointer"
                    fill={getPathColor(path)}
                    onClick={() => handlePathSelect(path.id)}
                  >
                    {path.id + 1}
                  </text>
                </motion.g>
              ))}
            </svg>
          </div>
          
          {/* Path selection buttons for mobile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
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
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handlePathSelect(path.id)}
                disabled={selectedPath !== null || !gameActive}
                whileHover={{ scale: selectedPath === null && gameActive ? 1.05 : 1 }}
                whileTap={{ scale: selectedPath === null && gameActive ? 0.95 : 1 }}
              >
                Path {path.id + 1}
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
