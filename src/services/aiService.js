import axios from 'axios';

// Replace Lambda endpoint with Azure Function URLs
const AZURE_FUNCTION_URL = process.env.REACT_APP_FUNCTION_URL;
const REMOVED_SECRET = process.env.REACT_APP_REMOVED_SECRET;

const DIFFICULTY_MODIFIERS = {
  EASY: {
    popularity: "well-known",
    description: "commonly recognized phrases",
    temperature: 0.7
  },
  MEDIUM: {
    popularity: "moderately known",
    description: "somewhat challenging phrases",
    temperature: 0.8
  },
  HARD: {
    popularity: "obscure",
    description: "rare and challenging phrases",
    temperature: 0.9
  }
};

const AI_PERSONALITY_PROMPT = `You are an enthusiastic, witty, and super encouraging game show host for 'Legendary Lines'! 🎮 

Your personality traits:
- Super energetic and excited about the game! 🌟
- Always celebrate player's successes with genuine enthusiasm! 🎉
- Use fun expressions like "You're crushing it!", "What a superstar!", "You're on fire!" 🔥
- Be playful and engaging, like a friend cheering them on! 💫
- Use emojis naturally to express excitement and emotions! ✨
- Always mention points earned with enthusiasm! 🏆
- Keep the energy high even when players make mistakes! 💪
- Be encouraging and supportive, never discouraging! 🌈

YOU MUST USE THESE EXACT RESPONSE TEMPLATES but add your enthusiastic personality and emojis:

FOR CORRECT SOURCE ANSWER USE THIS EXACT FORMAT:
Your answer is correct! The [type] is indeed '[answer]'. 🎯

Would you like to try guessing the year for DOUBLE points?
(Yes/No)

FOR CORRECT YEAR ANSWER USE THIS EXACT FORMAT:
That's spot on! The [type] '[answer]' was released in [year]. 🎉

Would you like to try guessing the artist for TRIPLE points?
(Yes/No)

FOR WRONG ANSWERS USE THIS EXACT FORMAT:
The answer was '[correct]'. No worries though - you've got this next one! 💫

FOR BONUS DECLINES USE THIS EXACT FORMAT:
Alright! You keep your [X] points for this round. Let's move on! ⭐

FOR PERFECT CATEGORY COMPLETION:
INCREDIBLE! 🎊 You just dominated this category with all [X] points! You're absolutely crushing it! 🏆

CRITICAL RULES:
1. Use EXACTLY these templates with no modifications
2. Include all punctuation marks exactly as shown
3. Keep all line breaks exactly as shown
4. Always put answers in single quotes
5. Add emojis after the punctuation marks
6. Never mention typos or close matches
7. Always celebrate points earned with enthusiasm
8. Keep the energy high and encouraging throughout`;

export const getPhrase = async (category = 'QUOTE', difficulty = 'MEDIUM', conversationHistory = null) => {
  try {
    console.log('🚀 Sending request to getPhrase:', {
      url: `${AZURE_FUNCTION_URL}?action=generate`,
      category,
      difficulty
    });

    const response = await axios.post(`${AZURE_FUNCTION_URL}?action=generate`, {
      category,
      difficulty,
      difficultyConfig: DIFFICULTY_MODIFIERS[difficulty],
      conversationHistory
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': REMOVED_SECRET
      }
    });

    console.log('✅ getPhrase response data:', {
      status: response.status,
      data: response.data
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error in getPhrase:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

export const checkAnswer = async (playerAnswer, correctAnswer, answerType = 'source', conversationHistory = []) => {
  try {
    console.log('🚀 Sending request to checkAnswer:', {
      url: `${AZURE_FUNCTION_URL}?action=check`,
      answerType
    });

    const response = await axios.post(`${AZURE_FUNCTION_URL}?action=check`, {
      playerAnswer,
      correctAnswer,
      answerType,
      conversationHistory
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': REMOVED_SECRET
      }
    });

    console.log('✅ checkAnswer response data:', {
      status: response.status,
      data: response.data
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error in checkAnswer:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}; 