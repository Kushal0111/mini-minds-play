
import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Common
    'game.score': 'Score',
    'game.accuracy': 'Accuracy',
    'game.chances': 'Chances',
    'game.timeLeft': 'Time Left',
    'game.quit': 'Quit',
    'game.continue': 'Continue',
    'game.home': 'Home',
    
    // Path Game
    'path.title': 'Path Game',
    'path.instruction': 'Find the Shortest Path!',
    'path.description': 'Click on the shortest colored path to help reach the destination',
    
    // Calendar Game
    'calendar.title': 'Calendar Game',
    'calendar.instruction': 'What day comes after?',
    'calendar.days': '+ {count} days',
    
    // Head Count Game
    'headcount.title': 'Head Count Challenge',
    'headcount.instruction': 'How many are in the room now?',
    'headcount.entered': '{count} entered',
    'headcount.left': '{count} left',
    
    // Settings
    'settings.language': 'Language',
    'settings.darkMode': 'Dark Mode',
    'settings.feedback': 'Send Feedback'
  },
  es: {
    // Common
    'game.score': 'Puntuación',
    'game.accuracy': 'Precisión',
    'game.chances': 'Oportunidades',
    'game.timeLeft': 'Tiempo Restante',
    'game.quit': 'Salir',
    'game.continue': 'Continuar',
    'game.home': 'Inicio',
    
    // Path Game
    'path.title': 'Juego de Caminos',
    'path.instruction': '¡Encuentra el Camino Más Corto!',
    'path.description': 'Haz clic en el camino de color más corto para llegar al destino',
    
    // Calendar Game
    'calendar.title': 'Juego de Calendario',
    'calendar.instruction': '¿Qué día viene después?',
    'calendar.days': '+ {count} días',
    
    // Head Count Game
    'headcount.title': 'Desafío de Conteo',
    'headcount.instruction': '¿Cuántos hay en la habitación ahora?',
    'headcount.entered': '{count} entraron',
    'headcount.left': '{count} salieron',
    
    // Settings
    'settings.language': 'Idioma',
    'settings.darkMode': 'Modo Oscuro',
    'settings.feedback': 'Enviar Comentarios'
  },
  fr: {
    // Common
    'game.score': 'Score',
    'game.accuracy': 'Précision',
    'game.chances': 'Chances',
    'game.timeLeft': 'Temps Restant',
    'game.quit': 'Quitter',
    'game.continue': 'Continuer',
    'game.home': 'Accueil',
    
    // Path Game
    'path.title': 'Jeu de Chemins',
    'path.instruction': 'Trouvez le Chemin le Plus Court!',
    'path.description': 'Cliquez sur le chemin coloré le plus court pour atteindre la destination',
    
    // Calendar Game
    'calendar.title': 'Jeu de Calendrier',
    'calendar.instruction': 'Quel jour vient après?',
    'calendar.days': '+ {count} jours',
    
    // Head Count Game
    'headcount.title': 'Défi de Comptage',
    'headcount.instruction': 'Combien sont dans la salle maintenant?',
    'headcount.entered': '{count} sont entrés',
    'headcount.left': '{count} sont partis',
    
    // Settings
    'settings.language': 'Langue',
    'settings.darkMode': 'Mode Sombre',
    'settings.feedback': 'Envoyer des Commentaires'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
  }, []);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, params?: Record<string, any>): string => {
    const langTranslations = translations[language as keyof typeof translations] || translations.en;
    let translation = langTranslations[key as keyof typeof langTranslations] || key;
    
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param]);
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
