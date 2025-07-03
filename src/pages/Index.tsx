
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Palette, Route, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import AppMenu from "../components/AppMenu";

const gameCards = [
  {
    title: "Calendar Game",
    description: "Test your date calculation skills! Figure out what day it will be after a certain number of days.",
    icon: Calendar,
    color: "from-blue-400 to-purple-500",
    emoji: "📅",
    path: "/calendar"
  },
  {
    title: "Color Game", 
    description: "Challenge your attention! Identify the text color, not what the word says.",
    icon: Palette,
    color: "from-green-400 to-blue-500",
    emoji: "🎨",
    path: "/color"
  },
  {
    title: "Path Game",
    description: "Follow the right path! Navigate through the maze and reach the destination.",
    icon: Route,
    color: "from-orange-400 to-red-500", 
    emoji: "🛤️",
    path: "/path"
  },
  {
    title: "Attention Game",
    description: "Stay focused! Track moving objects and test your concentration skills.",
    icon: Eye,
    color: "from-purple-400 to-pink-500",
    emoji: "👁️",
    path: "/attention"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold text-white text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          🧠 Brain Games
        </motion.h1>
        <AppMenu />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Subtitle */}
        <motion.p 
          className="text-xl md:text-2xl text-white/90 text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Challenge your mind with fun and engaging games!
        </motion.p>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {gameCards.map((game, index) => (
            <motion.div
              key={game.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={game.path}>
                <Card className="h-full cursor-pointer overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className={`h-2 bg-gradient-to-r ${game.color}`} />
                  <CardHeader className="text-center pb-4">
                    <div className="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">
                      {game.emoji}
                    </div>
                    <CardTitle className="text-2xl text-gray-800 group-hover:text-purple-600 transition-colors">
                      {game.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-gray-600 mb-6 leading-relaxed">
                      {game.description}
                    </CardDescription>
                    <Button 
                      className={`w-full bg-gradient-to-r ${game.color} hover:shadow-lg transform transition-all duration-200 text-white font-semibold py-3`}
                    >
                      Play Now! 🎮
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-16 text-white/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <p className="text-lg">
            Ready to boost your brainpower? 🚀
          </p>
          <p className="text-sm mt-2">
            Choose a game above and start your mental workout!
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
