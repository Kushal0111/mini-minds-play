
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, Palette, Route, Eye, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import AppMenu from "../components/AppMenu";

const gameCards = [
  {
    title: "Calendar Game",
    description: "Test your date calculation skills! Figure out what day it will be after a certain number of days.",
    icon: Calendar,
    color: "from-blue-400 to-purple-500",
    emoji: "📅",
    path: "/calendar",
    difficulty: "Easy"
  },
  {
    title: "Color Game", 
    description: "Challenge your attention! Identify the text color, not what the word says.",
    icon: Palette,
    color: "from-green-400 to-blue-500",
    emoji: "🎨",
    path: "/color",
    difficulty: "Medium"
  },
  {
    title: "Path Game",
    description: "Help the mouse find the shortest path home through colorful maze routes.",
    icon: Route,
    color: "from-orange-400 to-red-500", 
    emoji: "🐭",
    path: "/path",
    difficulty: "Medium"
  },
  {
    title: "Attention Game",
    description: "Watch shapes blink in sequence and remember the exact blinking order.",
    icon: Eye,
    color: "from-purple-400 to-pink-500",
    emoji: "✨",
    path: "/attention",
    difficulty: "Hard"
  },
  {
    title: "Memory Game",
    description: "Memorize 4 items and find them among many similar objects.",
    icon: Brain,
    color: "from-emerald-400 to-teal-500",
    emoji: "🧩",
    path: "/memory",
    difficulty: "Medium"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold text-white"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          🧠 Brain Games
        </motion.h1>
        <AppMenu />
      </div>
      
      <div className="container mx-auto px-4 py-4">
        {/* Subtitle */}
        <motion.p 
          className="text-xl md:text-2xl text-white/90 text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Challenge your mind with fun and engaging games!
        </motion.p>

        {/* Game Cards List */}
        <div className="max-w-4xl mx-auto space-y-4">
          {gameCards.map((game, index) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={game.path}>
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center gap-6">
                    {/* Game Icon/Emoji */}
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-4xl">{game.emoji}</span>
                    </div>
                    
                    {/* Game Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                          {game.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          game.difficulty === 'Easy' ? 'bg-green-100 text-green-600' :
                          game.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {game.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed mb-4">
                        {game.description}
                      </p>
                      <Button 
                        className={`bg-gradient-to-r ${game.color} hover:shadow-lg transform transition-all duration-200 text-white font-semibold px-6 py-2`}
                      >
                        Play Now! 🎮
                      </Button>
                    </div>
                    
                    {/* Arrow Icon */}
                    <div className="text-gray-400 group-hover:text-purple-500 group-hover:translate-x-2 transition-all duration-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Stats Preview */}
        <motion.div 
          className="text-center mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <h3 className="text-2xl font-bold text-white mb-2">🚀 Ready to boost your brainpower?</h3>
          <p className="text-white/80 text-lg">
            Track your progress, improve your skills, and challenge yourself with increasing difficulty levels!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
