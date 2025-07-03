
export interface GameStats {
  correct: number;
  total: number;
  accuracy: number;
}

export interface GameSession {
  gameType: 'calendar' | 'color' | 'path' | 'attention';
  score: GameStats;
  completedAt: Date;
}

export interface CalendarQuestion {
  date: string;
  day: string;
  daysToAdd: number;
  options: Array<{
    date: string;
    day: string;
    isCorrect: boolean;
  }>;
}

export interface ColorQuestion {
  text: string;
  textColor: string;
  correctColorIndex: number;
}

export interface PathQuestion {
  paths: Array<{
    id: number;
    points: Array<{ x: number; y: number }>;
    length: number;
    isCorrect: boolean;
  }>;
}

export interface AttentionQuestion {
  originalSurface: number;
  flips: Array<{
    from: number;
    to: number;
  }>;
  options: number[];
}

export type GameRank = 'Noob' | 'Beginner' | 'Good' | 'Great' | 'Expert' | 'Mastermind';
