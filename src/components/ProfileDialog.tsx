
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileData {
  name: string;
  age: string;
  emoji: string;
}

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileDialog: React.FC<ProfileDialogProps> = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    age: '',
    emoji: '😊'
  });

  const kidFriendlyEmojis = ['😊', '🌟', '🦄', '🐱', '🐶', '🦋', '🌈', '🎨', '🚀', '⭐', '🎈', '🧸'];

  useEffect(() => {
    // Load profile from localStorage on mount
    const savedProfile = localStorage.getItem('kidProfile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('kidProfile', JSON.stringify(profile));
      console.log('Profile saved successfully:', profile);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">👤 My Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-4">
          {/* Profile Picture Section */}
          <div className="text-center">
            <div className="text-6xl mb-4">{profile.emoji}</div>
            <Label className="text-sm font-medium">Choose your avatar:</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {kidFriendlyEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleInputChange('emoji', emoji)}
                  className={`text-2xl p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    profile.emoji === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">What's your name?</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your name"
              className="text-lg"
            />
          </div>

          {/* Age Input */}
          <div className="space-y-2">
            <Label htmlFor="age">How old are you?</Label>
            <Input
              id="age"
              type="number"
              min="3"
              max="18"
              value={profile.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="Enter your age"
              className="text-lg"
            />
          </div>

          {/* Save Button */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
