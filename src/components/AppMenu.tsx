
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, User, BarChart3, X } from 'lucide-react';
import ProfileDialog from './ProfileDialog';
import ProgressDialog from './ProgressDialog';

const AppMenu: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    setShowProfile(true);
  };

  const handleProgressClick = () => {
    setIsMenuOpen(false);
    setShowProgress(true);
  };

  return (
    <>
      <div className="relative">
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MoreVertical className="h-5 w-5 text-white" />
        </motion.button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-12 bg-white rounded-lg shadow-lg py-2 w-48 z-50"
            >
              <button
                onClick={handleProfileClick}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Profile
              </button>
              <button
                onClick={handleProgressClick}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Progress
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ProfileDialog
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />

      <ProgressDialog
        isOpen={showProgress}
        onClose={() => setShowProgress(false)}
      />
    </>
  );
};

export default AppMenu;
