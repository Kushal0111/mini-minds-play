
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameSession, GameStats, GameRank } from '../types/game.types';

interface GameState {
  sessions: GameSession[];
  currentGame: string | null;
  isPlaying: boolean;
}

type GameAction = 
  | { type: 'START_GAME'; payload: string }
  | { type: 'END_GAME'; payload: GameSession }
  | { type: 'RESET_STATS' };

const initialState: GameState = {
  sessions: [],
  currentGame: null,
  isPlaying: false,
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        currentGame: action.payload,
        isPlaying: true,
      };
    case 'END_GAME':
      return {
        ...state,
        sessions: [...state.sessions, action.payload],
        currentGame: null,
        isPlaying: false,
      };
    case 'RESET_STATS':
      return initialState;
    default:
      return state;
  }
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  getRank: (accuracy: number) => GameRank;
  playSound: (type: 'correct' | 'wrong' | 'complete') => void;
} | null>(null);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const getRank = (accuracy: number): GameRank => {
    if (accuracy >= 90) return 'Mastermind';
    if (accuracy >= 80) return 'Expert';
    if (accuracy >= 70) return 'Great';
    if (accuracy >= 60) return 'Good';
    if (accuracy >= 40) return 'Beginner';
    return 'Noob';
  };

  const playSound = (type: 'correct' | 'wrong' | 'complete') => {
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const createBeep = (frequency: number, duration: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    switch (type) {
      case 'correct':
        createBeep(800, 0.2);
        setTimeout(() => createBeep(1000, 0.2), 100);
        break;
      case 'wrong':
        createBeep(300, 0.5);
        break;
      case 'complete':
        createBeep(600, 0.2);
        setTimeout(() => createBeep(800, 0.2), 150);
        setTimeout(() => createBeep(1000, 0.3), 300);
        break;
    }
  };

  return (
    <GameContext.Provider value={{ state, dispatch, getRank, playSound }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
