import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { CalendarQuestion } from '../../types/game.types';
import { generateRandomDate, formatDate, getDayOfWeek, addDays, generateWrongOptions } from '../../utils/dateUtils';
import Timer from '../../components/Timer';
import GameButton from '../../components/GameButton';
import ResultDialog from '../../components/ResultDialog';
import QuitGameDialog from '../../components/QuitGameDialog';

const CalendarGame: React.FC = () => {
  const { dispatch, getRank, playSound } = useGame();
  const [currentQuestion, setCurrentQuestion] = useState<CalendarQuestion | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [showQuitDialog, setShowQuitDialog] = useState(false);

  const TOTAL_QUESTIONS = 5;
  const TIMER_SECONDS = 7;

  useEffect(() => {
    generateQuestion();
  }, []);

  const generateQuestion = () => {
    const baseDate = generateRandomDate();
    const daysToAdd = Math.floor(Math.random() * 15) + 1;
    const targetDate = addDays(baseDate, daysToAdd);
    
    const wrongOptions = generateWrongOptions(targetDate, getDayOfWeek(targetDate));
    const correctOption = {
      date: formatDate(targetDate),
      day: getDayOfWeek(targetDate),
      isCorrect: true
    };
    
    const allOptions = [...wrongOptions, correctOption]
      .map(opt => ({ ...opt, isCorrect: opt === correctOption }))
      .sort(() => Math.random() - 0.5);

    setCurrentQuestion({
      date: formatDate(baseDate),
      day: getDayOfWeek(baseDate),
      daysToAdd,
      options: allOptions
    });
    
    setSelectedAnswer(null);
    setIsTimerActive(true);
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setIsTimerActive(false);
    
    const isCorrect = currentQuestion?.options[answerIndex]?.isCorrect || false;
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      total: score.total + 1
    };
    setScore(newScore);
    
    playSound(isCorrect ? 'correct' : 'wrong');
    setShowFeedback(true);
    
    setTimeout(() => {
      setShowFeedback(false);
      if (questionNumber >= TOTAL_QUESTIONS) {
        const accuracy = (newScore.correct / newScore.total) * 100;
        const rank = getRank(accuracy);
        setShowResult(true);
        playSound('complete');
        
        dispatch({
          type: 'END_GAME',
          payload: {
            gameType: 'calendar',
            score: { ...newScore, accuracy },
            completedAt: new Date()
          }
        });
      } else {
        setQuestionNumber(prev => prev + 1);
        generateQuestion();
      }
    }, 2000);
  };

  const handleTimeout = () => {
    if (selectedAnswer !== null) return;
    handleAnswer(-1); // Wrong answer for timeout
  };

  const playAgain = () => {
    setQuestionNumber(1);
    setScore({ correct: 0, total: 0 });
    setShowResult(false);
    generateQuestion();
  };

  const goHome = () => {
    window.history.back();
  };

  const handleQuitConfirm = () => {
    setShowQuitDialog(false);
    goHome();
  };

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4 flex flex-col">
      <div className="max-w-4xl mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
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
              className="text-2xl md:text-3xl font-bold text-white"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              📅 Calendar Game
            </motion.h1>
          </div>
          <div className="text-white text-lg font-semibold">
            {questionNumber}/{TOTAL_QUESTIONS}
          </div>
        </div>

        {/* Timer */}
        <div className="flex justify-center mb-6">
          <Timer 
            seconds={TIMER_SECONDS} 
            onComplete={handleTimeout}
            isActive={isTimerActive}
          />
        </div>

        {/* Question */}
        <motion.div 
          className="bg-white rounded-3xl p-6 mb-6 text-center shadow-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          key={questionNumber}
        >
          <div className="mb-4">
            <div className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
              {currentQuestion.date} ({currentQuestion.day})
            </div>
            <div className="text-lg text-purple-600 font-semibold">
              After {currentQuestion.daysToAdd} days?
            </div>
          </div>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
          {currentQuestion.options.map((option, index) => (
            <motion.button
              key={index}
              className={`p-4 rounded-2xl text-center transition-all duration-200 ${
                selectedAnswer === null
                  ? 'bg-white hover:bg-gray-50 hover:shadow-lg transform hover:scale-105'
                  : selectedAnswer === index
                  ? option.isCorrect
                    ? 'bg-green-100 border-2 border-green-500'
                    : 'bg-red-100 border-2 border-red-500'
                  : option.isCorrect && selectedAnswer !== null
                  ? 'bg-green-100 border-2 border-green-500'
                  : 'bg-gray-100'
              }`}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-lg font-bold text-gray-800">
                {option.date}
              </div>
              <div className="text-md text-gray-600">
                {option.day}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Score */}
        <div className="text-center text-white text-lg font-semibold">
          Score: {score.correct}/{score.total}
        </div>

        {/* Feedback Flash */}
        {showFeedback && selectedAnswer !== null && (
          <motion.div
            className={`fixed inset-0 pointer-events-none z-40 ${
              currentQuestion.options[selectedAnswer]?.isCorrect 
                ? 'bg-green-400/30' 
                : 'bg-red-400/30'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}

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

export default CalendarGame;
