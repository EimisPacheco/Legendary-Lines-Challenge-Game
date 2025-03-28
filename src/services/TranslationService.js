// Add a translation cache and rate limiting
const translationCache = new Map();
let lastRequestTime = 0;
const minRequestInterval = 300; // milliseconds between requests

export const translateText = async (text, targetLanguage) => {
  try {
    // Make sure we have text to translate
    if (!text) return '';
    
    // Check cache first
    const cacheKey = `${text}:${targetLanguage}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }
    
    // Use the correct Azure Translator endpoint
    const endpoint = process.env.REACT_APP_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com';
    const apiKey = process.env.REACT_APP_TRANSLATOR_KEY;
    
    // If no API key is configured, return the original text
    if (!apiKey) {
      console.warn('Translation API key not configured');
      return text;
    }

    // Implement rate limiting
    const now = Date.now();
    const timeElapsed = now - lastRequestTime;
    if (timeElapsed < minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, minRequestInterval - timeElapsed));
    }
    
    lastRequestTime = Date.now();
    
    const url = `${endpoint}/translate?api-version=3.0&to=${targetLanguage}`;
    
    // Try up to 3 times with increasing backoff
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': apiKey,
            'Ocp-Apim-Subscription-Region': process.env.REACT_APP_TRANSLATOR_LOCATION || 'global'
          },
          body: JSON.stringify([{ text }])
        });

        if (response.status === 429) {
          // If rate limited, wait and retry
          const retryAfter = response.headers.get('Retry-After') || (2 ** retries);
          console.warn(`Rate limited, retrying after ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          retries++;
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const result = data[0]?.translations[0]?.text || text;
        
        // Cache the result
        translationCache.set(cacheKey, result);
        
        return result;
      } catch (error) {
        if (retries < maxRetries - 1) {
          // Exponential backoff
          const backoffTime = 1000 * (2 ** retries);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          retries++;
        } else {
          throw error;
        }
      }
    }
    
    // If all retries fail, return original text
    return text;
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if translation fails
    return text;
  }
};

// Add a batch translation function for multiple texts
export const translateBatch = async (texts, targetLanguage) => {
  if (!texts || texts.length === 0) return [];
  
  // For English, skip translation
  if (targetLanguage === 'en') {
    return texts;
  }
  
  // Check cache first and collect only texts that need translation
  const results = [];
  const textsToTranslate = [];
  const indices = [];
  
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    const cacheKey = `${text}:${targetLanguage}`;
    
    if (translationCache.has(cacheKey)) {
      results[i] = translationCache.get(cacheKey);
    } else {
      textsToTranslate.push(text);
      indices.push(i);
      // Initialize with original text in case translation fails
      results[i] = text;
    }
  }
  
  // If all translations are cached, return immediately
  if (textsToTranslate.length === 0) {
    return results;
  }
  
  try {
    // Implement rate limiting
    const now = Date.now();
    const timeElapsed = now - lastRequestTime;
    if (timeElapsed < minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, minRequestInterval - timeElapsed));
    }
    
    lastRequestTime = Date.now();
    
    const endpoint = process.env.REACT_APP_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com';
    const apiKey = process.env.REACT_APP_TRANSLATOR_KEY;
    
    if (!apiKey) {
      console.warn('Translation API key not configured');
      return texts;
    }
    
    const url = `${endpoint}/translate?api-version=3.0&to=${targetLanguage}`;
    
    // Try up to 3 times with increasing backoff
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': apiKey,
            'Ocp-Apim-Subscription-Region': process.env.REACT_APP_TRANSLATOR_LOCATION || 'global'
          },
          body: JSON.stringify(textsToTranslate.map(text => ({ text })))
        });
        
        if (response.status === 429) {
          // If rate limited, wait and retry
          const retryAfter = response.headers.get('Retry-After') || (2 ** retries);
          console.warn(`Rate limited, retrying after ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          retries++;
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update results and cache
        for (let i = 0; i < data.length; i++) {
          const translatedText = data[i]?.translations[0]?.text || textsToTranslate[i];
          const originalIndex = indices[i];
          results[originalIndex] = translatedText;
          
          // Cache the result
          const cacheKey = `${textsToTranslate[i]}:${targetLanguage}`;
          translationCache.set(cacheKey, translatedText);
        }
        
        return results;
      } catch (error) {
        if (retries < maxRetries - 1) {
          // Exponential backoff
          const backoffTime = 1000 * (2 ** retries);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          retries++;
        } else {
          throw error;
        }
      }
    }
    
    // If all retries fail, return original texts
    return texts;
  } catch (error) {
    console.error('Batch translation error:', error);
    return texts;
  }
}; 