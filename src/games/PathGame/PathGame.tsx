import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Route, X, Home } from 'lucide-react';
import { generatePathQuestion, generateSVGPath, Path } from '../../utils/pathUtils';
import { useGame } from '../../context/GameContext';
import Timer from '../../components/Timer';
import QuickFeedback from '../../components/QuickFeedback';
import QuitGameDialog from '../../components/QuitGameDialog';
import ResultDialog from '../../components/ResultDialog';

interface PathGameProps {
  onGameComplete?: () => void;
  difficulty?: string;
}

const PathGame: React.FC<PathGameProps> = ({ onGameComplete, difficulty = 'medium' }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [chances, setChances] = useState(10);
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameEnded, setGameEnded] = useState(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [questions, setQuestions] = useState<Path[][]>([]);

  const { playSound, dispatch } = useGame();

  useEffect(() => {
    generateQuestions();
    dispatch({ type: 'START_GAME', payload: 'path' });
  }, [dispatch]);

  const generateQuestions = () => {
    const newQuestions = [];
    for (let i = 0; i < 10; i++) {
      newQuestions.push(generatePathQuestion());
    }
    setQuestions(newQuestions);
  };

  const handlePathSelect = (pathId: number) => {
    if (selectedPath !== null) return;
    
    setSelectedPath(pathId);
    const paths = questions[currentQuestion];
    const selectedPathData = paths.find(p => p.id === pathId);
    const correct = selectedPathData?.isCorrect || false;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      const newScore = {
        correct: score.correct + 1,
        total: score.total + 1
      };
      setScore(newScore);
      playSound('correct');
      
      setTimeout(() => {
        if (currentQuestion + 1 >= questions.length) {
          setGameEnded(true);
          const accuracy = Math.round((newScore.correct / newScore.total) * 100);
          dispatch({
            type: 'END_GAME',
            payload: {
              gameType: 'path',
              score: { ...newScore, accuracy },
              completedAt: new Date()
            }
          });
          if (onGameComplete) {
            setTimeout(() => onGameComplete(), 2000);
          }
        } else {
          setCurrentQuestion(currentQuestion + 1);
          setSelectedPath(null);
          setShowFeedback(false);
          setTimeLeft(30);
        }
      }, 1500);
    } else {
      const newChances = chances - 1;
      setChances(newChances);
      playSound('wrong');
      
      if (newChances <= 0) {
        const newScore = {
          correct: score.correct,
          total: score.total + 1
        };
        setScore(newScore);
        
        setTimeout(() => {
          if (currentQuestion + 1 >= questions.length) {
            setGameEnded(true);
            const accuracy = Math.round((newScore.correct / newScore.total) * 100);
            dispatch({
              type: 'END_GAME',
              payload: {
                gameType: 'path',
                score: { ...newScore, accuracy },
                completedAt: new Date()
              }
            });
            if (onGameComplete) {
              setTimeout(() => onGameComplete(), 2000);
            }
          } else {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedPath(null);
            setShowFeedback(false);
            setTimeLeft(30);
            setChances(10);
          }
        }, 1500);
      } else {
        setTimeout(() => {
          setSelectedPath(null);
          setShowFeedback(false);
        }, 1000);
      }
    }
  };

  const handleTimeUp = () => {
    if (selectedPath === null) {
      const newScore = {
        correct: score.correct,
        total: score.total + 1
      };
      setScore(newScore);
      
      if (currentQuestion + 1 >= questions.length) {
        setGameEnded(true);
        const accuracy = Math.round((newScore.correct / newScore.total) * 100);
        dispatch({
          type: 'END_GAME',
          payload: {
            gameType: 'path',
            score: { ...newScore, accuracy },
            completedAt: new Date()
          }
        });
        if (onGameComplete) {
          setTimeout(() => onGameComplete(), 2000);
        }
      } else {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedPath(null);
        setShowFeedback(false);
        setTimeLeft(30);
        setChances(10);
      }
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

  const paths = questions[currentQuestion];

  return (
    <div className="h-screen bg-gradient-to-br from-orange-400 to-red-500 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-white">
        <div className="flex items-center gap-2">
          <Route className="w-6 h-6" />
          <span className="font-bold text-lg">Path Game</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {currentQuestion + 1}/{questions.length}
          </span>
          <span className="text-sm font-medium">
            Chances: {chances}
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
          className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-xl"
        >
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🐭 Find the Shortest Path Home!
            </h2>
            <p className="text-gray-600">Click on the shortest colored path</p>
          </div>

          {/* SVG Game Board */}
          <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-4 mb-4">
            <svg width="100%" height="300" viewBox="0 0 400 300" className="border-2 border-dashed border-gray-300 rounded-lg">
              {/* Grid pattern background */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Mouse at start */}
              <circle cx="50" cy="150" r="15" fill="#8B5CF6" />
              <text x="50" y="155" textAnchor="middle" className="text-xs font-bold fill-white">🐭</text>
              
              {/* Home at end */}
              <rect x="335" y="135" width="30" height="30" fill="#EF4444" rx="5" />
              <text x="350" y="155" textAnchor="middle" className="text-lg">🏠</text>
              
              {/* Paths */}
              {paths.map((path) => (
                <g key={path.id}>
                  <path
                    d={generateSVGPath(path.points)}
                    fill="none"
                    stroke={selectedPath === path.id ? (isCorrect ? '#10B981' : '#EF4444') : path.color}
                    strokeWidth={selectedPath === path.id ? "6" : "4"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="cursor-pointer transition-all duration-200 hover:stroke-6"
                    onClick={() => handlePathSelect(path.id)}
                  />
                  {/* Path dots for better visibility */}
                  {path.points.map((point, idx) => (
                    <circle
                      key={idx}
                      cx={point.x}
                      cy={point.y}
                      r="3"
                      fill={path.color}
                      className="cursor-pointer"
                      onClick={() => handlePathSelect(path.id)}
                    />
                  ))}
                </g>
              ))}
            </svg>
          </div>

          {/* Color Legend */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {paths.map((path) => (
              <Button
                key={path.id}
                onClick={() => handlePathSelect(path.id)}
                disabled={selectedPath !== null}
                className={`p-2 h-auto flex flex-col items-center text-center transition-all duration-200 ${
                  selectedPath === path.id
                    ? isCorrect
                      ? 'bg-green-500 hover:bg-green-500'
                      : 'bg-red-500 hover:bg-red-500'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                <div 
                  className="w-4 h-4 rounded-full mb-1"
                  style={{ backgroundColor: path.color }}
                />
                <span className="text-xs font-medium">{path.name}</span>
                <span className="text-xs opacity-70">{Math.round(path.length)}px</span>
              </Button>
            ))}
          </div>

          <div className="text-center">
            <div className="flex justify-center gap-4 text-sm text-gray-600">
              <span>Score: {score.correct}/{score.total}</span>
              <span>Chances: {chances}</span>
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
        gameType="Path"
        score={score}
        onClose={() => onGameComplete && onGameComplete()}
      />
    </div>
  );
};

export default PathGame;
