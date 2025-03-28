import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('orange');
  
  useEffect(() => {
    // Remove all theme classes
    document.body.classList.remove('theme-orange', 'theme-blue', 'theme-purple');
    
    // Add current theme class
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 