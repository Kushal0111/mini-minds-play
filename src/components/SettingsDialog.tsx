
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Moon, Sun, Globe, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    // Load settings from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedLanguage = localStorage.getItem('language') || 'English';
    
    setDarkMode(savedDarkMode);
    setLanguage(savedLanguage);

    // Apply dark mode to document
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem('darkMode', checked.toString());
    
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    toast.success(`Language changed to ${newLanguage}`);
  };

  const handleFeedbackSubmit = () => {
    if (!feedback.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    // Simulate sending feedback
    console.log('Feedback submitted:', feedback);
    toast.success('Thank you for your feedback! 💌');
    setFeedback('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            ⚙️ Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dark Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <span className="font-medium">Dark Mode</span>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={handleDarkModeToggle}
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span className="font-medium">Language</span>
            </div>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">🇺🇸 English</SelectItem>
                <SelectItem value="Spanish">🇪🇸 Español</SelectItem>
                <SelectItem value="French">🇫🇷 Français</SelectItem>
                <SelectItem value="German">🇩🇪 Deutsch</SelectItem>
                <SelectItem value="Hindi">🇮🇳 हिंदी</SelectItem>
                <SelectItem value="Chinese">🇨🇳 中文</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* MiniMind Feedback */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">Send Feedback to MiniMind</span>
            </div>
            <Textarea
              placeholder="Tell us what you think about the games! Your feedback helps us improve... 😊"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[80px]"
            />
            <Button 
              onClick={handleFeedbackSubmit}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Send Feedback 📤
            </Button>
          </div>

          {/* Version */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              MiniMind Games v1.0.0
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Made with 💜 for brilliant kids
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
