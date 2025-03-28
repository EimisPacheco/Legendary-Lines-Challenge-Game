import React, { useState, useEffect } from 'react';
import MagicalQuestionCard from './MagicalQuestionCard';
import InputModal from './InputModal';
import { getPhrase, checkAnswer } from '../services/aiService';
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

const Game = ({ difficulty, numberOfRounds }) => {
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

  // Add new states for the conversation flow
  const [playerNickname, setPlayerNickname] = useState('');
  const [gamePhase, setGamePhase] = useState('greeting');
  const [aiMessage, setAiMessage] = useState('');

  useEffect(() => {
    // Initial greeting
    setAiMessage("👋 Hello, brilliant player! Welcome to 🎭 Legendary Lines Game ❗\n" +
                 "Ready to test your memory and wit? Let's dive into a world of words and wonders!\n" +
                 "🦹‍♀️ Choose an epic alias for your adventure!");
    setShowAnswerModal(true);
  }, []);

  const handlePlayerInput = async (input) => {
    switch(gamePhase) {
      case 'greeting':
        setPlayerNickname(input);
        setGamePhase('playing');
        setAiMessage(`Welcome, ${input}! 🌟\nWhat category would you like to play for Round 1?`);
        setShowAnswerModal(false);
        break;

      case 'playing':
        if (!phraseData) {
          // Handle category selection
          await handleCategorySelect(input.toUpperCase());
        } else {
          try {
            // Get the correct answer based on the current question type
            const correctAnswer = currentQuestionType === 'creator' 
              ? phraseData.additionalInfo.creator 
              : phraseData[currentQuestionType];

            // Call checkAnswer with the correct parameters
            const result = await checkAnswer(input, correctAnswer, currentQuestionType);
            
            if (result.isCorrect) {
              // Update score based on the current category and question type
              const pointsEarned = calculatePoints(selectedCategory, currentQuestionType);
              setScore(prev => prev + pointsEarned);
              setStreak(prev => prev + 1);
            }
            
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
      const feedbackMessage = result.feedback || '🎉 Correct!';
      
      if (currentQuestionType === 'source') {
        setAiMessage(`${feedbackMessage}\n\nWould you like to try guessing the year for double points?`);
        setTriggerEffect(prev => prev + 1);
        setCurrentQuestionType('year');
      } else if (currentQuestionType === 'year' && 
                 (selectedCategory === 'MOVIE' || selectedCategory === 'SONG')) {
        setAiMessage(`${feedbackMessage}\n\nWant to triple your points by guessing the ${selectedCategory === 'MOVIE' ? 'director' : 'artist'}?`);
        setTriggerEffect(prev => prev + 1);
        setCurrentQuestionType('creator');
      } else {
        setAiMessage(`${feedbackMessage}`);
        setTimeout(() => handleNextRound(), 2000);
      }
    } else {
      handleIncorrectAnswer(result.feedback);
    }
  };

  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    try {
      const data = await getPhrase(category, difficulty);
      setPhraseData(data);
      setAiMessage(`🎭 Here's your ${category.toLowerCase()} phrase:\n\n"${data.phrase}"\n\n🤔 Can you tell me the source?`);
      setTriggerEffect(prev => prev + 1);
      setCurrentQuestionType('source');
      setTimeout(() => {
        setShowAnswerModal(true);
      }, 1000);
    } catch (error) {
      console.error('Error fetching phrase:', error);
      setAiMessage('😅 Oops! Had trouble fetching a phrase. Try another category!');
    }
  };

  const getPromptForPhase = (phase, questionType) => {
    switch (phase) {
      case 'greeting':
        return 'Enter your nickname...';
      case 'playing':
        switch (questionType) {
          case 'source':
            return 'Enter the source...';
          case 'year':
            return 'Enter the year...';
          case 'creator':
            return selectedCategory === 'MOVIE' ? 'Enter the director...' : 'Enter the artist/band...';
          default:
            return 'Enter your answer...';
        }
      default:
        return 'Enter your response...';
    }
  };

  const handleNextRound = () => {
    if (round < numberOfRounds) {
      setRound(prev => prev + 1);
      setSelectedCategory(null);
      setCurrentQuestionType('source');
      setPhraseData(null);
      setCurrentPhrase(null);
      setAiMessage(`Alright ${playerNickname}, let's move to round ${round + 1}! Choose your category.`);
    } else {
      // Game Over
      const finalMessage = score === (numberOfRounds * 6) ? // Maximum possible score
        `💯🎆🏆 Congratulations!! You are a champion!! Mission Accomplished. Your final score: ${score}!` :
        `😥 Good luck next time! You've shown great effort with a final score of ${score}.`;
      setAiMessage(finalMessage);
      setGamePhase('completed');
    }
    setShowAnswerModal(false);
  };

  const handleIncorrectAnswer = (feedback) => {
    const correctAnswer = currentQuestionType === 'creator' 
      ? phraseData.additionalInfo.creator 
      : phraseData[currentQuestionType];
      
    setAiMessage(`🙁 ${feedback || 'Sorry, that\'s not correct.'}\nThe correct answer was: ${correctAnswer}`);
    setTriggerEffect(prev => prev + 1);
    setScore(prev => Math.max(0, prev - CATEGORIES[selectedCategory].points));
    setStreak(0);
    setTimeout(() => {
      handleNextRound();
    }, 3000);
  };

  const calculatePoints = (category, questionType) => {
    let points = CATEGORIES[category].points;
    if (questionType === 'year') points *= 2;
    if (questionType === 'creator') points *= 3;
    return points;
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

  // JSX Return
  return (
    <div className="game-container">
      <div className="game-header">
        <div>Round: {round}/{numberOfRounds}</div>
        <div>Score: {score}</div>
        <div>Streak: {streak}</div>
      </div>

      <MagicalQuestionCard 
        message={aiMessage}
        triggerEffect={triggerEffect}
      />

      <InputModal 
        isOpen={showAnswerModal}
        onSubmit={handleInputSubmission}
        prompt={getPromptForPhase(gamePhase, currentQuestionType)}
      />

      {gamePhase === 'playing' && (
        <div className="category-selector">
          <h3>Available Categories:</h3>
          <div className="category-buttons">
            {Object.entries(CATEGORIES).map(([key, value]) => (
              <button
                key={key}
                className={`category-btn ${selectedCategory === key ? 'selected' : ''}`}
                onClick={() => handleCategorySelect(key)}
              >
                {value.name}
                <span className="points">({value.points} pts)</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;