
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, X, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Timer from '../../components/Timer';
import QuickFeedback from '../../components/QuickFeedback';
import QuitGameDialog from '../../components/QuitGameDialog';
import ResultDialog from '../../components/ResultDialog';
import { useGame } from '../../context/GameContext';

interface HeadCountGameProps {
  onGameComplete?: () => void;
  difficulty?: string;
}

interface GameRound {
  initialCount: number;
  events: Array<{ type: 'enter' | 'exit'; count: number }>;
  finalCount: number;
  options: number[];
}

const CHARACTERS = ['👦', '👧', '🐶', '🐱', '🐰', '🐸', '🐼', '🦊'];
const GAME_DURATION = 30;
const ROUNDS_PER_GAME = 10;

const HeadCountGame: React.FC<HeadCountGameProps> = ({ onGameComplete, difficulty = 'medium' }) => {
  const navigate = useNavigate();
  const { playSound } = useGame();

  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Round state
  const [currentRoundData, setCurrentRoundData] = useState<GameRound | null>(null);
  const [showingEvents, setShowingEvents] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [roomCount, setRoomCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Visual state
  const [characters, setCharacters] = useState<string[]>([]);
  const [animatingCharacters, setAnimatingCharacters] = useState<{ char: string; entering: boolean }[]>([]);

  const generateRoundData = (): GameRound => {
    const initialCount = Math.floor(Math.random() * 5) + 1; // 1-5 initial characters
    const numEvents = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 6 : 4;
    
    const events: Array<{ type: 'enter' | 'exit'; count: number }> = [];
    let currentCount = initialCount;
    
    for (let i = 0; i < numEvents; i++) {
      const isEnter = Math.random() > 0.5;
      let count;
      
      if (isEnter) {
        count = Math.floor(Math.random() * 3) + 1; // 1-3 enter
      } else {
        count = Math.min(Math.floor(Math.random() * Math.min(currentCount, 3)) + 1, currentCount); // Don't go below 0
      }
      
      events.push({ type: isEnter ? 'enter' : 'exit', count });
      currentCount += isEnter ? count : -count;
      currentCount = Math.max(0, currentCount);
    }
    
    const finalCount = currentCount;
    const correctAnswer = finalCount;
    
    // Generate wrong options
    const options: number[] = [correctAnswer];
    while (options.length < 4) {
      const wrongAnswer = Math.max(0, correctAnswer + (Math.floor(Math.random() * 6) - 3));
      if (!options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    return { initialCount, events, finalCount, options };
  };

  const startNewRound = () => {
    const roundData = generateRoundData();
    setCurrentRoundData(roundData);
    setRoomCount(roundData.initialCount);
    setShowingEvents(false);
    setCurrentEventIndex(0);
    setShowOptions(false);
    setSelectedAnswer(null);
    
    // Set initial characters
    const initialChars = CHARACTERS.slice(0, roundData.initialCount);
    setCharacters(initialChars);
    setAnimatingCharacters([]);
    
    // Start showing events after a brief delay
    setTimeout(() => {
      setShowingEvents(true);
    }, 1000);
  };

  const showNextEvent = () => {
    if (!currentRoundData || currentEventIndex >= currentRoundData.events.length) {
      setShowOptions(true);
      return;
    }
    
    const event = currentRoundData.events[currentEventIndex];
    
    if (event.type === 'enter') {
      // Add characters
      const newChars = CHARACTERS.slice(characters.length, characters.length + event.count);
      setAnimatingCharacters(newChars.map(char => ({ char, entering: true })));
      
      setTimeout(() => {
        setCharacters(prev => [...prev, ...newChars]);
        setAnimatingCharacters([]);
        setCurrentEventIndex(prev => prev + 1);
      }, 800);
    } else {
      // Remove characters
      const charsToRemove = characters.slice(-event.count);
      setAnimatingCharacters(charsToRemove.map(char => ({ char, entering: false })));
      
      setTimeout(() => {
        setCharacters(prev => prev.slice(0, -event.count));
        setAnimatingCharacters([]);
        setCurrentEventIndex(prev => prev + 1);
      }, 800);
    }
  };

  const handleAnswer = (answer: number) => {
    if (!currentRoundData) return;
    
    setSelectedAnswer(answer);
    const correct = answer === currentRoundData.finalCount;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      playSound('correct');
      setScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      playSound('wrong');
      setScore(prev => ({ ...prev, total: prev.total + 1 }));
    }
    
    setTimeout(() => {
      setShowFeedback(false);
      if (currentRound + 1 >= ROUNDS_PER_GAME) {
        endGame();
      } else {
        setCurrentRound(prev => prev + 1);
        startNewRound();
      }
    }, 1500);
  };

  const startGame = () => {
    setGameStarted(true);
    setCurrentRound(0);
    setScore({ correct: 0, total: 0 });
    setTimeLeft(GAME_DURATION);
    startNewRound();
  };

  const endGame = () => {
    setGameOver(true);
    setShowResultDialog(true);
    playSound('complete');
    if (onGameComplete) {
      onGameComplete();
    }
  };

  const handleTimeUp = () => {
    endGame();
  };

  const handleQuit = () => {
    navigate('/');
  };

  const handleRestart = () => {
    setGameStarted(false);
    setGameOver(false);
    setShowResultDialog(false);
    setCurrentRound(0);
    setScore({ correct: 0, total: 0 });
  };

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameOver && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameStarted, gameOver, timeLeft]);

  // Auto-advance events
  useEffect(() => {
    if (showingEvents && !showOptions) {
      const timer = setTimeout(() => {
        showNextEvent();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showingEvents, currentEventIndex, showOptions]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
        <div className="p-4">
          <Link to="/" className="inline-flex items-center text-white hover:text-white/80 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="container mx-auto px-4 py-8">
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-md mx-auto shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🧮</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Head Count Challenge
              </h1>
              <p className="text-gray-600">
                Watch characters enter and exit the room. Count how many remain!
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-2xl">
                <h3 className="font-semibold text-blue-800 mb-2">How to Play:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Watch characters enter and exit the room</li>
                  <li>• Keep track mentally of how many are inside</li>
                  <li>• Answer how many characters remain</li>
                  <li>• You have {GAME_DURATION} seconds for {ROUNDS_PER_GAME} rounds</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 rounded-2xl text-lg"
            >
              Start Challenge 🚀
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white/10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowQuitDialog(true)}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="text-white">
            <div className="text-sm opacity-80">Round {currentRound + 1}/{ROUNDS_PER_GAME}</div>
            <div className="text-lg font-bold">{score.correct}/{score.total} Correct</div>
          </div>
        </div>
        <Timer timeLeft={timeLeft} onTimeUp={handleTimeUp} />
      </div>

      {/* Game Content */}
      <div className="container mx-auto px-4 py-4">
        {currentRoundData && (
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 max-w-md mx-auto shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Room */}
            <div className="mb-6">
              <h3 className="text-center text-lg font-semibold text-gray-700 mb-4">
                The Room
              </h3>
              <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-6 min-h-[200px] border-4 border-dashed border-blue-300">
                {/* Characters in room */}
                <div className="flex flex-wrap gap-2 justify-center items-center h-full">
                  <AnimatePresence>
                    {characters.map((char, index) => (
                      <motion.div
                        key={`${char}-${index}`}
                        className="text-4xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {char}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Animating characters */}
                  <AnimatePresence>
                    {animatingCharacters.map((item, index) => (
                      <motion.div
                        key={`animating-${item.char}-${index}`}
                        className="text-4xl absolute"
                        initial={{ 
                          x: item.entering ? -100 : 0,
                          opacity: item.entering ? 0 : 1,
                          scale: 1
                        }}
                        animate={{ 
                          x: item.entering ? 0 : 100,
                          opacity: item.entering ? 1 : 0,
                          scale: item.entering ? 1 : 0
                        }}
                        transition={{ duration: 0.8 }}
                      >
                        {item.char}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Event Display */}
            {showingEvents && currentEventIndex < currentRoundData.events.length && (
              <motion.div
                className="text-center mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={currentEventIndex}
              >
                <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4">
                  <div className="text-2xl font-bold text-yellow-800">
                    {currentRoundData.events[currentEventIndex].type === 'enter' ? '➡️' : '⬅️'}
                    {' '}
                    {currentRoundData.events[currentEventIndex].count}
                    {' '}
                    {currentRoundData.events[currentEventIndex].type === 'enter' ? 'entered' : 'left'}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Question & Options */}
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
                  How many are in the room now?
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {currentRoundData.options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                      className={`py-4 text-xl font-bold rounded-2xl ${
                        selectedAnswer === option
                          ? option === currentRoundData.finalCount
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-red-500 hover:bg-red-600'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                      } text-white`}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                
                {selectedAnswer !== null && !isCorrect && (
                  <div className="text-center text-red-600 font-semibold">
                    Correct answer: {currentRoundData.finalCount}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Dialogs */}
      <QuickFeedback show={showFeedback} isCorrect={isCorrect} />
      
      <QuitGameDialog
        isOpen={showQuitDialog}
        onClose={() => setShowQuitDialog(false)}
        onQuit={handleQuit}
      />
      
      <ResultDialog
        isOpen={showResultDialog}
        gameType="Head Count Challenge"
        score={score}
        onClose={handleRestart}
      />
    </div>
  );
};

export default HeadCountGame;
