import React, { useState, useEffect, useRef } from 'react';
import MagicalQuestionCard from './MagicalQuestionCard';
import InputModal from './InputModal';
import { getPhrase, checkAnswer } from '../services/aiService';
import { translateText, translateBatch } from '../services/TranslationService';
import '../styles/Game.css';
import CosmosDBService from '../services/CosmosDBService';

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
  enterResponse: "Enter your response..."
};

const Game = ({ difficulty, numberOfRounds, currentLanguage, currentTheme, translations = {} }) => {
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
  const [nickname, setNickname] = useState('');
  const [gamePhase, setGamePhase] = useState('greeting');
  const [aiMessage, setAiMessage] = useState('');

  // Add new states for bonus question flow
  const [isAwaitingBonusConfirmation, setIsAwaitingBonusConfirmation] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Add new state to track round points
  const [roundPoints, setRoundPoints] = useState(0);
  
  // Add state for translations
  const [gameTranslations, setGameTranslations] = useState(gameDefaultTranslations);
  const [translatedCategories, setTranslatedCategories] = useState(CATEGORIES);

  // Add this inside the Game component, with other state declarations
  const fireworksAudio = useRef(new Audio('https://hackthon-backend-files-ep-2024.s3.us-east-1.amazonaws.com/games/fireworks-sound.mp3'));

  // Translate game-specific text
  useEffect(() => {
    const translateGameText = async () => {
      if (currentLanguage === 'en') {
        setGameTranslations(gameDefaultTranslations);
        return;
      }
      
      try {
        const textsToTranslate = Object.values(gameDefaultTranslations);
        const translatedTexts = await translateBatch(textsToTranslate, currentLanguage);
        
        const newTranslations = {};
        Object.keys(gameDefaultTranslations).forEach((key, index) => {
          newTranslations[key] = translatedTexts[index];
        });
        
        setGameTranslations(newTranslations);
      } catch (error) {
        console.error('Game text translation error:', error);
        setGameTranslations(gameDefaultTranslations);
      }
    };
    
    translateGameText();
  }, [currentLanguage]);

  // Initial greeting with translations
  useEffect(() => {
    const welcomeMessage = `${gameTranslations.welcomeMessage}\n${gameTranslations.readyToPlay}\n${gameTranslations.chooseAlias}`;
    setAiMessage(welcomeMessage);
    setShowAnswerModal(true);
  }, [gameTranslations]);

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

  const handlePlayerInput = async (input) => {
    switch(gamePhase) {
      case 'greeting':
        setNickname(input);
        setGamePhase('playing');
        const confirmationMessage = gameTranslations.nicknameConfirmation.replace('{nickname}', input);
        const pickCategoryMessage = gameTranslations.pickCategory;
        setAiMessage(`${confirmationMessage}\n${pickCategoryMessage}`);
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
                    ? gameTranslations.enterYear 
                    : (selectedCategory === 'MOVIE' 
                        ? gameTranslations.enterDirector 
                        : selectedCategory === 'SONG' 
                          ? gameTranslations.enterArtist 
                          : gameTranslations.enterAuthor);
                  setAiMessage(promptMessage);
                } else {
                  const keepPointsMessage = gameTranslations.keepPoints.replace('{points}', roundPoints);
                  setAiMessage(keepPointsMessage);
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
            setAiMessage(gameTranslations.errorMessage);
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

  const handleCategorySelect = async (category) => {
    // Check if category was already played in conversation history
    const categoryPlayed = conversationHistory.some(
      entry => entry.category === category
    );

    setSelectedCategory(category);
    try {
      const data = await getPhrase(category, difficulty, categoryPlayed ? conversationHistory : undefined);
      setPhraseData(data);
      
      const categoryName = category.toLowerCase();
      const hereIsPhraseMessage = gameTranslations.hereIsPhrase.replace('{category}', categoryName);
      const guessSourceMessage = gameTranslations.guessSource;
      
      setAiMessage(`${hereIsPhraseMessage}\n\n"${data.phrase}"\n\n${guessSourceMessage}`);
      setTriggerEffect(prev => prev + 1);
      setCurrentQuestionType('source');
      setIsAwaitingBonusConfirmation(false);
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

  // Save score to CosmosDB
  const saveScore = async () => {
    const gameType = 'legendary-lines';
    console.log(`💾 Saving score for ${nickname}: ${score} points`);
    
    try {
      const result = await CosmosDBService.saveGameScore(nickname, gameType, score);
      console.log('✅ Score saved successfully:', result);
    } catch (error) {
      console.error('❌ Error saving score:', error);
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
        .replace('{nickname}', nickname)
        .replace('{round}', round + 1);
      
      setAiMessage(nextRoundMessage);
    } else {
      // Game Over with more personality
      const finalMessage = score === (numberOfRounds * 6) 
        ? gameTranslations.perfectScore.replace('{score}', score)
        : gameTranslations.gameOver.replace('{score}', score);
      
      setAiMessage(finalMessage);
      setGamePhase('completed');
      
      // Save the final score
      saveScore();
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