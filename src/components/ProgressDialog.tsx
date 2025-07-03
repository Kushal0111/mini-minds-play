
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useGame } from '../context/GameContext';

interface ProgressDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProgressDialog: React.FC<ProgressDialogProps> = ({ isOpen, onClose }) => {
  const { state } = useGame();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('kidProfile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  }, [isOpen]);

  const getGameStats = (gameType: string) => {
    const sessions = state.sessions.filter(session => session.gameType === gameType);
    if (sessions.length === 0) return { played: 0, avgAccuracy: 0, bestScore: 0 };
    
    const avgAccuracy = sessions.reduce((sum, session) => sum + session.score.accuracy, 0) / sessions.length;
    const bestScore = Math.max(...sessions.map(session => session.score.accuracy));
    
    return {
      played: sessions.length,
      avgAccuracy: Math.round(avgAccuracy),
      bestScore: Math.round(bestScore)
    };
  };

  const games = [
    { name: 'Calendar Game', type: 'calendar', emoji: '📅' },
    { name: 'Color Game', type: 'color', emoji: '🎨' },
    { name: 'Path Game', type: 'path', emoji: '🛤️' },
    { name: 'Attention Game', type: 'attention', emoji: '👁️' }
  ];

  const totalGamesPlayed = state.sessions.length;
  const overallAvgAccuracy = totalGamesPlayed > 0 
    ? Math.round(state.sessions.reduce((sum, session) => sum + session.score.accuracy, 0) / totalGamesPlayed)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">📊 My Progress</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          {/* Profile Section */}
          {profile && (
            <div className="text-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4">
              <div className="text-4xl mb-2">{profile.emoji}</div>
              <div className="text-lg font-bold">{profile.name}</div>
              <div className="text-sm text-gray-600">Age: {profile.age}</div>
            </div>
          )}

          {/* Overall Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-3">🏆 Overall Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Games Played:</span>
                <span className="font-bold">{totalGamesPlayed}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Score:</span>
                <span className="font-bold">{overallAvgAccuracy}%</span>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{overallAvgAccuracy}%</span>
                </div>
                <Progress value={overallAvgAccuracy} className="h-2" />
              </div>
            </div>
          </div>

          {/* Individual Game Stats */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold">🎮 Game Statistics</h3>
            {games.map((game) => {
              const stats = getGameStats(game.type);
              return (
                <div key={game.type} className="bg-white border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{game.emoji}</span>
                      <span className="font-medium">{game.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{stats.played} played</span>
                  </div>
                  {stats.played > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Best: {stats.bestScore}%</span>
                        <span>Avg: {stats.avgAccuracy}%</span>
                      </div>
                      <Progress value={stats.avgAccuracy} className="h-1.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressDialog;
