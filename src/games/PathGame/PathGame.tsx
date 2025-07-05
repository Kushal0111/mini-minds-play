import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Route, X } from 'lucide-react';
import { generatePathQuestion, generateSVGPath, Path } from '../../utils/pathUtils';
import { useGame } from '../../context/GameContext';
import { useLanguage } from '../../context/LanguageContext';
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
  const { t } = useLanguage();

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
    <div className="h-screen bg-gradient-to-br from-green-400 via-lime-500 to-green-600 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-white">
        <div className="flex items-center gap-2">
          <Route className="w-6 h-6" />
          <span className="font-bold text-lg">{t('path.title')}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {currentQuestion + 1}/{questions.length}
          </span>
          <span className="text-sm font-medium">
            {t('game.chances')}: {chances}
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
              🦕 {t('path.instruction')}
            </h2>
            <p className="text-gray-600">{t('path.description')}</p>
          </div>

          {/* Maze-style Game Board */}
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4 mb-4 relative">
            <svg width="100%" height="300" viewBox="0 0 400 300" className="border-2 border-dashed border-green-300 rounded-lg">
              {/* Background with grass pattern */}
              <defs>
                <pattern id="grass" width="40" height="40" patternUnits="userSpaceOnUse">
                  <rect width="40" height="40" fill="#90EE90"/>
                  <circle cx="10" cy="10" r="2" fill="#228B22" opacity="0.3"/>
                  <circle cx="30" cy="20" r="2" fill="#228B22" opacity="0.3"/>
                  <circle cx="20" cy="35" r="2" fill="#228B22" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grass)" />
              
              {/* Dinosaur at start */}
              <g transform="translate(40, 140)">
                <circle cx="0" cy="0" r="20" fill="#8B4513" />
                <text x="0" y="5" textAnchor="middle" className="text-lg">🦕</text>
              </g>
              
              {/* Cave at end */}
              <g transform="translate(350, 140)">
                <ellipse cx="0" cy="0" rx="25" ry="20" fill="#696969" />
                <ellipse cx="0" cy="-5" rx="15" ry="12" fill="#2F2F2F" />
                <text x="0" y="35" textAnchor="middle" className="text-xs font-bold">🏠</text>
              </g>
              
              {/* Maze-style paths */}
              {paths.map((path) => (
                <g key={path.id}>
                  <path
                    d={generateSVGPath(path.points)}
                    fill="none"
                    stroke={selectedPath === path.id ? (isCorrect ? '#10B981' : '#EF4444') : path.color}
                    strokeWidth={selectedPath === path.id ? "8" : "6"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={path.id % 2 === 0 ? "0" : "5,5"}
                    className="cursor-pointer transition-all duration-200 hover:stroke-8"
                    onClick={() => handlePathSelect(path.id)}
                  />
                  {/* Path markers */}
                  {path.points.slice(1, -1).map((point, idx) => (
                    <circle
                      key={idx}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill={path.color}
                      className="cursor-pointer"
                      onClick={() => handlePathSelect(path.id)}
                    />
                  ))}
                </g>
              ))}
              
              {/* Decorative elements */}
              <g opacity="0.6">
                <text x="100" y="50" className="text-xs">🌿</text>
                <text x="250" y="80" className="text-xs">🌸</text>
                <text x="150" y="250" className="text-xs">🦋</text>
                <text x="300" y="220" className="text-xs">🌺</text>
              </g>
            </svg>
          </div>

          {/* Path Options */}
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
              <span>{t('game.score')}: {score.correct}/{score.total}</span>
              <span>{t('game.chances')}: {chances}</span>
              <span>{t('game.accuracy')}: {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%</span>
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
        gameType={t('path.title')}
        score={score}
        onClose={() => onGameComplete && onGameComplete()}
      />
    </div>
  );
};

export default PathGame;
