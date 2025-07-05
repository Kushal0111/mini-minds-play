import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, X } from 'lucide-react';
import { formatDate, getDayOfWeek, addDays, generateRandomDate, generateWrongOptions } from '../../utils/dateUtils';
import { useGame } from '../../context/GameContext';
import { useLanguage } from '../../context/LanguageContext';
import Timer from '../../components/Timer';
import QuickFeedback from '../../components/QuickFeedback';
import QuitGameDialog from '../../components/QuitGameDialog';
import ResultDialog from '../../components/ResultDialog';

interface CalendarGameProps {
  onGameComplete?: () => void;
  difficulty?: string;
}

const CalendarGame: React.FC<CalendarGameProps> = ({ onGameComplete, difficulty = 'medium' }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [gameEnded, setGameEnded] = useState(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);

  const { playSound, dispatch } = useGame();
  const { t } = useLanguage();

  useEffect(() => {
    generateQuestions();
    dispatch({ type: 'START_GAME', payload: 'calendar' });
  }, [dispatch]);

  const generateQuestions = () => {
    const newQuestions = [];
    for (let i = 0; i < 10; i++) {
      const startDate = generateRandomDate();
      const daysToAdd = Math.floor(Math.random() * 7) + 1;
      const targetDate = addDays(startDate, daysToAdd);
      const correctAnswer = {
        date: formatDate(targetDate),
        day: getDayOfWeek(targetDate),
        isCorrect: true
      };
      
      const wrongOptions = generateWrongOptions(targetDate, getDayOfWeek(targetDate));
      const allOptions = [correctAnswer, ...wrongOptions].sort(() => Math.random() - 0.5);
      
      newQuestions.push({
        startDate: formatDate(startDate),
        startDay: getDayOfWeek(startDate),
        daysToAdd,
        options: allOptions
      });
    }
    setQuestions(newQuestions);
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const correct = questions[currentQuestion].options[answerIndex].isCorrect;
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
            gameType: 'calendar',
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
        setTimeLeft(5);
      }
    }, 1500);
  };

  const handleTimeUp = () => {
    if (selectedAnswer === null) {
      handleAnswer(-1); // Wrong answer
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
    <div className="h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 text-white">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          <span className="font-bold text-lg">{t('calendar.title')}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {currentQuestion + 1}/{questions.length}
          </span>
          <Timer timeLeft={timeLeft} onTimeUp={handleTimeUp} maxTime={5} />
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
              📅 {t('calendar.instruction')}
            </h2>
            <div className="bg-blue-50 rounded-2xl p-4 mb-4">
              <p className="text-lg font-semibold text-blue-800">
                {question.startDate}
              </p>
              <p className="text-sm text-blue-600">
                ({question.startDay})
              </p>
              <p className="text-lg font-bold text-blue-900 mt-2">
                {t('calendar.days', { count: question.daysToAdd })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {question.options.map((option: any, index: number) => (
              <Button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={selectedAnswer !== null}
                className={`p-4 h-auto flex flex-col text-center transition-all duration-200 ${
                  selectedAnswer === index
                    ? isCorrect
                      ? 'bg-green-500 hover:bg-green-500'
                      : 'bg-red-500 hover:bg-red-500'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                <span className="font-semibold text-sm">{option.date}</span>
                <span className="text-xs opacity-80">{option.day}</span>
              </Button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <div className="flex justify-center gap-4 text-sm text-gray-600">
              <span>{t('game.score')}: {score.correct}/{score.total}</span>
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
        gameType={t('calendar.title')}
        score={score}
        onClose={() => onGameComplete && onGameComplete()}
      />
    </div>
  );
};

export default CalendarGame;
