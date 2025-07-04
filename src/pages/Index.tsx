
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar, Palette, Route, Eye, Brain, Play, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import AppMenu from "../components/AppMenu";

const gameCards = [
  {
    title: "Calendar",
    icon: Calendar,
    color: "from-blue-400 to-purple-500",
    emoji: "📅",
    path: "/calendar",
    difficulty: "Easy"
  },
  {
    title: "Color", 
    icon: Palette,
    color: "from-green-400 to-blue-500",
    emoji: "🎨",
    path: "/color",
    difficulty: "Medium"
  },
  {
    title: "Path",
    icon: Route,
    color: "from-orange-400 to-red-500", 
    emoji: "🐭",
    path: "/path",
    difficulty: "Medium"
  },
  {
    title: "Attention",
    icon: Eye,
    color: "from-purple-400 to-pink-500",
    emoji: "✨",
    path: "/attention",
    difficulty: "Hard"
  },
  {
    title: "Memory",
    icon: Brain,
    color: "from-emerald-400 to-teal-500",
    emoji: "🧩",
    path: "/memory",
    difficulty: "Medium"
  },
  {
    title: "Head Count",
    icon: Calculator,
    color: "from-indigo-400 to-purple-500",
    emoji: "🧮",
    path: "/headcount",
    difficulty: "Medium"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <motion.h1 
          className="text-3xl md:text-4xl font-bold text-white"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          🧠 MiniMinds
        </motion.h1>
        <AppMenu />
      </div>
      
      <div className="container mx-auto px-4 py-2">
        {/* Subtitle */}
        <motion.p 
          className="text-lg text-white/90 text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Challenge your mind with fun games!
        </motion.p>

        {/* Game Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
          {gameCards.map((game, index) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={game.path}>
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer aspect-square flex flex-col items-center justify-center">
                  {/* Game Icon/Emoji */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mb-3`}>
                    <span className="text-3xl">{game.emoji}</span>
                  </div>
                  
                  {/* Game Name */}
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors text-center">
                    {game.title}
                  </h3>
                  
                  {/* Difficulty Badge */}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold mt-2 ${
                    game.difficulty === 'Easy' ? 'bg-green-100 text-green-600' :
                    game.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {game.difficulty}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Play Session Button */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Link to="/session">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto">
              <Play className="w-6 h-6" />
              Start Game Session
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
