import React, { useState, useEffect } from 'react';
import Game from './Game';
import RulesModal from './RulesModal';
import LanguageSelector from './LanguageSelector';
import ThemeSelector from './ThemeSelector';
import { translateText, translateBatch } from '../services/TranslationService';
import '../styles/Game.css';
import Leaderboard from './Leaderboard';
import '../styles/Controls.css';

// Default translations for all UI text
const defaultTranslations = {
  gameTitle: 'Legendary Lines Challenge Game',
  selectDifficulty: 'Select Difficulty:',
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD',
  points: 'points',
  numberOfRounds: 'Number of Rounds:',
  startGame: 'Start Game',
  level: 'Level:',
  loading: 'Loading...',
  rules: 'Show Rules 📖',
  hideRules: 'Hide Rules 📖',
  // Theme translations
  orange: 'Orange 🔶',
  blue: 'Azure Blue 🔷',
  purple: 'Purple 🟣',
  selectTheme: 'Select Theme:',
  // Add leaderboard translations
  showLeaderboard: 'Show Leaderboard 🏆',
  hideLeaderboard: 'Hide Leaderboard 🏆',
  leaderboardTitle: 'Legendary Leaders',
  rank: 'Rank',
  player: 'Player',
  score: 'Score',
  // Rules translations
  gameRulesTitle: '🎮 Game Rules: Legendary Lines Game! 🎭',
  welcomeMessage: 'Welcome, word wizard! 🌟 Here\'s how to play this thrilling game of wit and wisdom!',
  howToPlayTitle: '📝 How to Play:',
  startGameRule: 'Start the Game: Click the "Start Game" to begin your adventure! 🚀',
  chooseNicknameRule: 'Choose Your Nickname: Pick an epic nickname to be remembered by! 🦸‍♂️🦸‍♀️',
  setRoundsRule: 'Set the Rounds: Decide how many rounds you\'d like to play (up to 10). 🎯',
  pickCategoryRule: 'Pick a Category: Choose a category from the list below:',
  categorySong: '🎵 Song (1 point)',
  categoryMovie: '🎬 Movie (2 points)',
  categoryPerson: '🧑‍🎤 Famous Person (3 points)',
  categoryCharacter: '🦸 Fictional Character (3 points)',
  categoryBook: '📚 Book (4 points)',
  categoryPoet: '✒️ Poet (5 points)',
  categoryQuote: '💬 Quote (6 points)',
  // Additional Rules translations
  gameplayTitle: '🚀 Gameplay:',
  gameplayDescription: "You'll be given a phrase. Your job? Guess its source!\n(Is it from a song, movie, book, etc.?)\nCorrect Guess: You score the points for that category! 🎉",
  
  bonusPointsTitle: '💥 Bonus Points:',
  doublePointsTitle: 'Double Your Points!',
  doublePointsDesc: 'After a correct guess, you can double your score by guessing the year it originated.',
  correctDouble: 'If correct: 🎉 Double points!',
  incorrectDouble: 'If incorrect: 😢 You lose all points for that round.',
  
  triplePointsTitle: 'Triple Your Points! (Only for Movies & Songs):',
  tripleMovies: 'Movies: Guess the director to triple your points. 🎬',
  tripleSongs: 'Songs: Name the band/singer to triple your points. 🎤',
  tripleBooks: 'Books: Name the author to triple your points. 📚',
  correctTriple: 'If correct: 🌟 Epic triple points!',
  incorrectTriple: 'If incorrect: 😞 All points lost for that round!',
  
  keepingPointsTitle: '😇 Keeping Your Points:',
  keepingPointsDesc: 'Not feeling lucky? You can skip the bonus challenge and keep your points!',
  
  endGameTitle: '📊 End of the Game:',
  endGameDesc: 'Perfect Score: You\'re a legend! 🏆💯\nNot Perfect? You still rocked it—try again to beat your score! 🔄',
  
  rulesFooter: '🎭 Ready to show off your knowledge? Hit "Start Game" to begin! ✨'
};

const GamePresenter = () => {
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [numberOfRounds, setNumberOfRounds] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [currentTheme, setCurrentTheme] = useState('orange');
  const [translations, setTranslations] = useState(defaultTranslations);
  const [isTranslating, setIsTranslating] = useState(false);

  // Apply theme when it changes
  useEffect(() => {
    document.body.className = `theme-${currentTheme}`;
  }, [currentTheme]);

  // Handle theme change
  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
  };

  // Handle language change and translate all UI text
  const handleLanguageChange = async (newLanguage) => {
    setCurrentLanguage(newLanguage);
    
    // If English is selected, use default text
    if (newLanguage === 'en') {
      setTranslations(defaultTranslations);
      return;
    }
    
    setIsTranslating(true);
    
    try {
      // Translate all UI text in a batch
      const keys = Object.keys(defaultTranslations);
      const values = Object.values(defaultTranslations);
      
      const translatedValues = await translateBatch(values, newLanguage);
      
      // Create a new translations object with translated text
      const newTranslations = {};
      keys.forEach((key, index) => {
        newTranslations[key] = translatedValues[index];
      });
      
      setTranslations(newTranslations);
    } catch (error) {
      console.error('Translation error:', error);
      // Fall back to default translations if there's an error
      setTranslations(defaultTranslations);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleStartGame = () => {
    if (numberOfRounds >= 1 && numberOfRounds <= 10) {
      setGameStarted(true);
    }
  };

  if (gameStarted) {
    return <Game 
      difficulty={difficulty} 
      numberOfRounds={numberOfRounds} 
      currentLanguage={currentLanguage}
      currentTheme={currentTheme}
      translations={translations}
    />;
  }

  return (
    <div className="game-container">
      <div className="controls-container">
        <RulesModal 
          translations={translations} 
          currentLanguage={currentLanguage}
          currentTheme={currentTheme}
        />
        <div className="language-control">
          <LanguageSelector 
            currentLanguage={currentLanguage}
            onLanguageChange={handleLanguageChange}
          />
          {isTranslating && <span className="translating-indicator">⟳</span>}
        </div>
        <ThemeSelector
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
          translations={translations}
        />
        <Leaderboard 
          currentLanguage={currentLanguage}
          currentTheme={currentTheme}
          translations={translations} 
        />
      </div>
      
      <div className="game-setup">
        <div className="difficulty-selector">
          <h3>{translations.selectDifficulty}</h3>
          <div className="difficulty-buttons">
            {['EASY', 'MEDIUM', 'HARD'].map((level) => (
              <button
                key={level}
                className={`difficulty-btn ${difficulty === level ? 'selected' : ''}`}
                onClick={() => setDifficulty(level)}
              >
                {translations[level.toLowerCase()] || level}
                <span className="multiplier">
                  {level === 'EASY' ? '1x' : level === 'MEDIUM' ? '1.5x' : '2x'} {translations.points}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounds-selector">
          <h3>{translations.numberOfRounds}</h3>
          <input
            type="number"
            value={numberOfRounds}
            onChange={(e) => setNumberOfRounds(Number(e.target.value))}
            min="1"
            max="10"
            className="rounds-input"
          />
        </div>

        <button 
          className="start-btn"
          onClick={handleStartGame}
        >
          {translations.startGame}
        </button>

        <div className="game-stats">
          <div className="current-difficulty">{translations.level} {translations[difficulty.toLowerCase()] || difficulty}</div>
        </div>
      </div>
    </div>
  );
};

export default GamePresenter;
