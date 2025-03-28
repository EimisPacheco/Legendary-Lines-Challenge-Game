import React, { useState, useEffect, useRef } from 'react';
import MagicalQuestionCard from './MagicalQuestionCard';
import InputModal from './InputModal';
import { getPhrase, checkAnswer } from '../services/aiService';
import { translateText, translateBatch } from '../services/TranslationService';
import '../styles/Game.css';

const CATEGORIES = {
  SONG: { name: 'Song', points: 1 },
  MOVIE: { name: 'Movie', points: 2 },
  FAMOUS_PERSON: { name: 'Famous Person', points: 3 },
  FICTIONAL_CHARACTER: { name: 'Fictional Character', points: 3 },
  BOOK: { name: 'Book', points: 4 },
  POET: { name: 'Poet', points: 5 },
  QUOTE: { name: 'Quote', points: 6 }
};

// Add more game-specific translations
const gameDefaultTranslations = {
  song: 'Song',
  movie: 'Movie',
  famousPerson: 'Famous Person',
  fictionalCharacter: 'Fictional Character',
  book: 'Book',
  poet: 'Poet',
  quote: 'Quote',
  score: 'Score',
  streak: 'Streak',
  round: 'Round',
  // Add welcome messages translations
  welcomeMessage: "👋 Hello, brilliant player! Welcome to 🎮 Legendary Lines Game !",
  readyToPlay: "Ready to test your memory and wit? Let's dive into a world of words and wonders!",
  chooseAlias: "🎭 Choose an epic alias for your adventure!",
  enterNickname: "Enter your nickname...",
  submit: "Submit ✨",
  hereIsPhrase: "🎭 Here's your {category} phrase:",
  guessSource: "🤔 Can you tell me the source?",
  oopsError: "😅 Oops! Had trouble fetching a phrase. Try another category!",
  availableCategories: "Available Categories",
  nicknameConfirmation: "{nickname}! Love that name! 🎯",
  pickCategory: "Alright hotshot, pick your poison - which category are you brave enough to tackle first? 💪",
  nextRoundPrompt: "Alright {nickname}, you're on a roll! 🎲\nTime to conquer round {round}! Which category's calling your name? 🌟",
  keepPoints: "Alright! You keep your {points} points for this round. 🎯",
  errorMessage: "Sorry, there was an error checking your answer. Please try again.",
  perfectScore: "🏆 ABSOLUTELY INCREDIBLE! {score} POINTS?! You're not just a player, you're a LEGEND! Take a bow, champion! 🎉",
  gameOver: "Game over, superstar! {score} points - not too shabby! 🌟 Come back and show me what else you've got! 💪",
  enterSource: "Enter the source...",
  enterYear: "Enter the year...",
  enterDirector: "Enter the director...",
  enterArtist: "Enter the artist/band...",
  enterAuthor: "Enter the author...",
  enterCreator: "Enter the creator...",
  enterResponse: "Enter your response...",
  points: 'pts'
};

const Game = ({ difficulty, numberOfRounds, currentLanguage, translations = {} }) => {
  // State declarations
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [triggerEffect, setTriggerEffect] = useState(0);
  const [showResult, setShowResult] = useState(null);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [currentQuestionType, setCurrentQuestionType] = useState('source');
  const [phraseData, setPhraseData] = useState(null);
  const [previousScore, setPreviousScore] = useState(0);

  // Add new states for the conversation flow
  const [playerNickname, setPlayerNickname] = useState('');
  const [gamePhase, setGamePhase] = useState('greeting');
  const [aiMessage, setAiMessage] = useState('');

  // Add new states for bonus question flow
  const [isAwaitingBonusConfirmation, setIsAwaitingBonusConfirmation] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Add new state to track round points
  const [roundPoints, setRoundPoints] = useState(0);

  // Add this inside the Game component, with other state declarations
  const fireworksAudio = useRef(new Audio('https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/games/fireworks-sound.mp3'));

  // Combine incoming translations with game-specific ones
  const [gameTranslations, setGameTranslations] = useState({...gameDefaultTranslations, ...translations});
  
  // Use useEffect to translate game-specific text when language changes
  useEffect(() => {
    if (currentLanguage === 'en') {
      setGameTranslations({...gameDefaultTranslations, ...translations});
      return;
    }
    
    const translateGameTexts = async () => {
      try {
        const keys = Object.keys(gameDefaultTranslations);
        const values = Object.values(gameDefaultTranslations);
        
        const translatedValues = await translateText(values, currentLanguage);
        
        const newTranslations = {};
        keys.forEach((key, index) => {
          newTranslations[key] = translatedValues[index];
        });
        
        setGameTranslations({...newTranslations, ...translations});
      } catch (error) {
        console.error('Game translation error:', error);
      }
    };
    
    translateGameTexts();
  }, [currentLanguage, translations]);
  
  // Add functionality to translate dynamic content (phrases, answers, etc.)
  const translatePhraseData = async (data) => {
    if (currentLanguage === 'en') return data;
    
    try {
      const translatedPhrase = await translateText(data.phrase, currentLanguage);
      return {
        ...data,
        phrase: translatedPhrase
      };
    } catch (error) {
      console.error('Phrase translation error:', error);
      return data;
    }
  };

  useEffect(() => {
    const setInitialGreeting = async () => {
      if (currentLanguage === 'en') {
        setAiMessage(`${gameTranslations.welcomeMessage}\n${gameTranslations.readyToPlay}\n${gameTranslations.chooseAlias}`);
      } else {
        try {
          const welcomeMessage = await translateText(gameTranslations.welcomeMessage, currentLanguage);
          const readyMessage = await translateText(gameTranslations.readyToPlay, currentLanguage);
          const aliasMessage = await translateText(gameTranslations.chooseAlias, currentLanguage);
          
          setAiMessage(`${welcomeMessage}\n${readyMessage}\n${aliasMessage}`);
        } catch (error) {
          console.error('Translation error:', error);
          // Fallback to English if translation fails
          setAiMessage(`${gameTranslations.welcomeMessage}\n${gameTranslations.readyToPlay}\n${gameTranslations.chooseAlias}`);
        }
      }
      setShowAnswerModal(true);
    };

    setInitialGreeting();
  }, [currentLanguage, gameTranslations]);

  const handlePlayerInput = async (input) => {
    switch(gamePhase) {
      case 'greeting':
        setPlayerNickname(input);
        setGamePhase('playing');
        
        // Translate nickname confirmation message
        let confirmMessage = gameTranslations.nicknameConfirmation.replace('{nickname}', input);
        let categoryPrompt = gameTranslations.pickCategory;
        
        if (currentLanguage !== 'en') {
          try {
            confirmMessage = await translateText(confirmMessage, currentLanguage);
            categoryPrompt = await translateText(categoryPrompt, currentLanguage);
          } catch (error) {
            console.error('Translation error:', error);
          }
        }
        
        setAiMessage(`${confirmMessage}\n${categoryPrompt}`);
        setShowAnswerModal(false);
        break;

      case 'playing':
        if (!phraseData) {
          await handleCategorySelect(input.toUpperCase());
        } else {
          try {
            if (isAwaitingBonusConfirmation) {
              const bonusQuestion = {
                type: 'bonus_question',
                questionType: currentQuestionType,
                playerAnswer: input
              };
              
              const result = await checkAnswer(
                input, 
                'yes',
                'bonus_confirmation',
                [...conversationHistory, bonusQuestion]
              );

              if (result.isBonusResponse) {
                if (result.isCorrect) {
                  setIsAwaitingBonusConfirmation(false);
                  const promptMessage = currentQuestionType === 'year' 
                    ? "Enter the year..." 
                    : `Enter the ${selectedCategory === 'MOVIE' ? 'director' : 'artist'}...`;
                  setAiMessage(promptMessage);
                } else {
                  setAiMessage(`Alright! You keep your ${roundPoints} points for this round. 🎯`);
                  setTimeout(() => handleNextRound(), 2000);
                }
              }
              return;
            }
            
            const correctAnswer = currentQuestionType === 'creator' 
              ? phraseData.additionalInfo.creator 
              : phraseData[currentQuestionType];

            const result = await checkAnswer(
              input, 
              correctAnswer, 
              currentQuestionType,
              conversationHistory
            );
            
            handleAnswerResult(result);
          } catch (error) {
            console.error('Error checking answer:', error);
            setAiMessage('Sorry, there was an error checking your answer. Please try again.');
          }
        }
        break;
    }
  };

  const handleAnswerResult = (result) => {
    if (result.isCorrect) {
      const currentPoints = calculatePoints(selectedCategory, currentQuestionType);
      const newRoundPoints = roundPoints + currentPoints;
      setRoundPoints(newRoundPoints);
      setScore(previousScore + newRoundPoints);

      if (currentQuestionType === 'source') {
        setIsAwaitingBonusConfirmation(true);
        setCurrentQuestionType('year');
      } else if (currentQuestionType === 'year' && 
                ['MOVIE', 'SONG', 'BOOK'].includes(selectedCategory)) {
        setIsAwaitingBonusConfirmation(true);
        setCurrentQuestionType('creator');
      } else {
        const maxPoints = getMaxPointsForCategory(selectedCategory);
        
        if (newRoundPoints === maxPoints) {
          setTriggerEffect(prev => prev + 1);
          fireworksAudio.current.currentTime = 0;
          fireworksAudio.current.play();
          
          setTimeout(() => {
            fireworksAudio.current.pause();
            fireworksAudio.current.currentTime = 0;
          }, 5000);
        }
        
        setTimeout(() => handleNextRound(), 6000);
      }

      setStreak(prev => prev + 1);
      
      console.log('Score update:', {
        currentPoints,
        newRoundPoints,
        previousScore,
        newTotalScore: previousScore + newRoundPoints,
        category: selectedCategory,
        questionType: currentQuestionType
      });
    } else {
      handleIncorrectAnswer(result.feedback);
    }
    
    setAiMessage(result.feedback);
    updateConversationHistory(result.feedback, result.isCorrect);
  };

  // Update the conversation history function to include more context
  const updateConversationHistory = (feedback, wasCorrect) => {
    const newEntry = {
      round,
      category: selectedCategory,
      questionType: currentQuestionType,
      wasCorrect,
      feedback,
      isAwaitingBonus: isAwaitingBonusConfirmation,
      timestamp: new Date().toISOString()
    };
    setConversationHistory(prev => [...prev, newEntry]);
  };

  // Update handleCategorySelect to use translations
  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    try {
      let data = await getPhrase(category, difficulty);
      
      // Translate phrase if not in English
      if (currentLanguage !== 'en') {
        data = await translatePhraseData(data);
      }
      
      setPhraseData(data);
      
      // Use translated category name if available
      const categoryName = gameTranslations[category.toLowerCase()] || category.toLowerCase();
      
      // Construct message using translations
      const phraseMessage = gameTranslations.hereIsPhrase.replace('{category}', categoryName);
      const message = `${phraseMessage}\n\n"${data.phrase}"\n\n${gameTranslations.guessSource}`;
      
      if (currentLanguage !== 'en') {
        const translatedMessage = await translateText(message, currentLanguage);
        setAiMessage(translatedMessage);
      } else {
        setAiMessage(message);
      }
      
      setTriggerEffect(prev => prev + 1);
      setCurrentQuestionType('source');
      setTimeout(() => {
        setShowAnswerModal(true);
      }, 1000);
    } catch (error) {
      console.error('Error fetching phrase:', error);
      setAiMessage(gameTranslations.oopsError);
    }
  };

  const getPromptForPhase = (phase, questionType) => {
    switch (phase) {
      case 'greeting':
        return gameTranslations.enterNickname;
      case 'playing':
        switch (questionType) {
          case 'source':
            return gameTranslations.enterSource;
          case 'year':
            return gameTranslations.enterYear;
          case 'creator':
            switch (selectedCategory) {
              case 'MOVIE':
                return gameTranslations.enterDirector;
              case 'SONG':
                return gameTranslations.enterArtist;
              case 'BOOK':
                return gameTranslations.enterAuthor;
              default:
                return gameTranslations.enterCreator;
            }
          default:
            return gameTranslations.enterResponse;
        }
      default:
        return gameTranslations.enterResponse;
    }
  };

  const handleNextRound = () => {
    if (round < numberOfRounds) {
      setPreviousScore(score);
      setRoundPoints(0);
      setRound(prev => prev + 1);
      setSelectedCategory(null);
      setCurrentQuestionType('source');
      setPhraseData(null);
      setCurrentPhrase(null);

      const nextRoundMessage = gameTranslations.nextRoundPrompt
        .replace('{nickname}', playerNickname)
        .replace('{round}', round + 1);

      if (currentLanguage !== 'en') {
        translateText(nextRoundMessage, currentLanguage)
          .then(translated => setAiMessage(translated))
          .catch(() => setAiMessage(nextRoundMessage));
      } else {
        setAiMessage(nextRoundMessage);
      }
    } else {
      // Game Over with translations
      const finalScore = score === (numberOfRounds * 6) 
        ? gameTranslations.perfectScore.replace('{score}', score)
        : gameTranslations.gameOver.replace('{score}', score);

      if (currentLanguage !== 'en') {
        translateText(finalScore, currentLanguage)
          .then(translated => setAiMessage(translated))
          .catch(() => setAiMessage(finalScore));
      } else {
        setAiMessage(finalScore);
      }
      setGamePhase('completed');
    }
    setShowAnswerModal(false);
  };

  const handleIncorrectAnswer = (feedback) => {
    setTriggerEffect(prev => prev + 1);
    setScore(previousScore);
    setStreak(0);
    
    setTimeout(() => {
      handleNextRound();
    }, 5000);
  };

  const calculatePoints = (category, questionType) => {
    const basePoints = CATEGORIES[category].points;
    switch (questionType) {
        case 'source': return basePoints;
        case 'year': return basePoints * 2;
        case 'creator': return basePoints * 3;
        default: return basePoints;
    }
  };

  // Update getMaxPointsForCategory to be more precise
  const getMaxPointsForCategory = (category) => {
    const basePoints = CATEGORIES[category].points;
    
    if (['SONG', 'MOVIE', 'BOOK'].includes(category)) {
      // For Song (1 point base):
      // Base (1) + Year (2) + Artist (3) = 6 points total
      return basePoints + (basePoints * 2) + (basePoints * 3);
    }
    
    // For other categories:
    // Base + Year (double) = Base * 3 total
    return basePoints * 3;
  };

  // Helper function to calculate points lost on incorrect answer
  const calculatePointsLost = () => {
    const pointsEarned = score - previousScore;
    return pointsEarned > 0 ? pointsEarned : 0;
  };

  function handleInputSubmission(inputValue) {
    // Ensure inputValue is being processed correctly
    if (inputValue) {
        // Logic to send inputValue to the AI
        console.log("My input value is:", inputValue);
        handlePlayerInput(inputValue);
    } else {
        console.error("Input value is empty");
    }
  }

  // Update isRoundComplete to check against maxPoints
  const isRoundComplete = (category, currentScore, prevScore) => {
    if (!category || !CATEGORIES[category]) {
      return false;
    }
    
    const maxPoints = getMaxPointsForCategory(category);
    console.log('Round completion check:', {
      category,
      roundPoints,
      maxPoints,
      currentScore,
      prevScore
    });
    
    return roundPoints === maxPoints;
  };

  // Add cleanup for audio when component unmounts
  useEffect(() => {
    return () => {
      fireworksAudio.current.pause();
      fireworksAudio.current.currentTime = 0;
    };
  }, []);

  // Add this after initializing gameTranslations state
  const [translatedCategories, setTranslatedCategories] = useState({});

  // Add this useEffect to translate category names
  useEffect(() => {
    const translateCategories = async () => {
      if (currentLanguage === 'en') {
        // Use English names for categories
        const englishCategories = {};
        Object.entries(CATEGORIES).forEach(([key, value]) => {
          englishCategories[key] = {
            name: value.name,
            points: value.points
          };
        });
        setTranslatedCategories(englishCategories);
        return;
      }
      
      try {
        // Prepare category names for translation
        const categoryNames = Object.values(CATEGORIES).map(cat => cat.name);
        const pointsText = gameTranslations.points || 'points';
        
        // Translate all category names at once
        const translatedNames = await translateBatch(categoryNames, currentLanguage);
        
        // Create a translated categories object
        const newTranslatedCategories = {};
        Object.keys(CATEGORIES).forEach((key, index) => {
          newTranslatedCategories[key] = {
            name: translatedNames[index],
            points: CATEGORIES[key].points
          };
        });
        
        setTranslatedCategories(newTranslatedCategories);
      } catch (error) {
        console.error('Category translation error:', error);
        setTranslatedCategories(CATEGORIES);
      }
    };
    
    translateCategories();
  }, [CATEGORIES, currentLanguage, gameTranslations.points]);

  // JSX Return
  return (
    <div className="game-container">
      <div className="game-header">
        <div>{gameTranslations.round}: {round}/{numberOfRounds}</div>
        <div>{gameTranslations.score}: {score}</div>
        <div>{gameTranslations.streak}: {streak}</div>
      </div>

      <MagicalQuestionCard 
        message={aiMessage}
        triggerEffect={triggerEffect}
        isRoundComplete={selectedCategory ? isRoundComplete(selectedCategory, score, previousScore) : false}
      />

      <InputModal 
        isOpen={showAnswerModal}
        onSubmit={handleInputSubmission}
        prompt={getPromptForPhase(gamePhase, currentQuestionType)}
      />

      {gamePhase === 'playing' && (
        <div className="category-selector">
          <h3>{gameTranslations.availableCategories}:</h3>
          <div className="category-buttons">
            {Object.entries(CATEGORIES).map(([key, value]) => (
              <button
                key={key}
                className={`category-btn ${selectedCategory === key ? 'selected' : ''}`}
                onClick={() => handleCategorySelect(key)}
              >
                {translatedCategories[key]?.name || value.name}
                <span className="points">({value.points} {gameTranslations.points || 'pts'})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;