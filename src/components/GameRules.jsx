import React from 'react';
import { motion } from 'framer-motion';
import '../styles/GameRules.css';

const GameRules = ({ onHide }) => {
  return (
    <div className="game-rules-container">
      <button className="hide-rules-button" onClick={onHide}>
        Hide Rules 📜
      </button>
      <motion.div 
        className="rules-content"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <h2>🎮 Game Rules: Legendary Lines Game! 🎭</h2>
        <p>Welcome, word wizard! ✨ Here's how to play this thrilling game of wit and wisdom!</p>
        
        <h3>📝 How to Play:</h3>
        <ol>
          <li>Start the Game: Click the "Start Game" to begin your adventure! 🚀</li>
          <li>Choose Your Nickname: Pick an epic nickname to be remembered by! 👑</li>
          <li>Set the Rounds: Decide how many rounds you'd like to play (up to 10). 🎯</li>
          <li>Pick a Category: Choose a category from the list below:</li>
        </ol>
        
        {/* Rest of your rules content */}
      </motion.div>
    </div>
  );
};

export default GameRules; 