import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { translateText } from '../services/TranslationService';
import CosmosDBService from '../services/CosmosDBService';
import '../styles/Leaderboard.css';

const Leaderboard = ({ currentLanguage, currentTheme, translations }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const gameType = 'legendary-lines'; // Default game type
  
  const [leaderboardTranslations, setLeaderboardTranslations] = useState({
    title: 'Legendary Leaders',
    rank: 'Rank',
    player: 'Player',
    score: 'Score',
    showLeaderboard: 'Show Leaderboard',
    hideLeaderboard: 'Hide Leaderboard'
  });

  // Translate leaderboard content when language changes
  useEffect(() => {
    const translateLeaderboard = async () => {
      if (currentLanguage === 'en') {
        setLeaderboardTranslations({
          title: 'Legendary Leaders',
          rank: 'Rank',
          player: 'Player',
          score: 'Score',
          showLeaderboard: 'Show Leaderboard',
          hideLeaderboard: 'Hide Leaderboard'
        });
        return;
      }

      try {
        const textsToTranslate = [
          'Legendary Leaders',
          'Rank',
          'Player',
          'Score',
          'Show Leaderboard',
          'Hide Leaderboard'
        ];
        
        const translatedTexts = await translateText(textsToTranslate, currentLanguage);
        
        setLeaderboardTranslations({
          title: translatedTexts[0],
          rank: translatedTexts[1],
          player: translatedTexts[2],
          score: translatedTexts[3],
          showLeaderboard: translatedTexts[4],
          hideLeaderboard: translatedTexts[5]
        });
      } catch (error) {
        console.error('Error translating leaderboard:', error);
      }
    };

    translateLeaderboard();
  }, [currentLanguage]);

  // Fetch leaderboard data when component mounts or when visibility changes
  useEffect(() => {
    if (isVisible) {
      fetchLeaderboard();
    }
  }, [isVisible]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };
  
  // Function to fetch leaderboard data
  const fetchLeaderboard = async () => {
    console.log('🏆 Fetching leaderboard for:', gameType);
    setLoading(true);
    
    try {
      const data = await CosmosDBService.getLeaderboard(gameType);
      console.log('✅ Leaderboard fetched:', data);
      setLeaderboardData(data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching leaderboard:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leaderboard-container">
      <button 
        className="leaderboard-toggle-button"
        onClick={toggleVisibility}
      >
        {isVisible ? translations.hideLeaderboard : translations.showLeaderboard}
      </button>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            className="leaderboard-panel"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="leaderboard-content">
              <h2>{translations.leaderboardTitle}</h2>
              
              {loading ? (
                <div className="loading-indicator">Loading...</div>
              ) : leaderboardData.length > 0 ? (
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>{translations.rank}</th>
                      <th>{translations.player}</th>
                      <th>{translations.score}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((entry, index) => (
                      <tr key={index} className={index === 0 ? 'top-score' : ''}>
                        <td>{index + 1}</td>
                        <td>{entry.nickname}</td>
                        <td>{entry.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-scores-message">No scores yet. Be the first to play!</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leaderboard;
