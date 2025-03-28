import React from 'react';
import '../styles/Controls.css';

const ThemeSelector = ({ currentTheme, onThemeChange, translations = {} }) => {
  const themes = [
    { id: 'orange', name: translations.orange || 'Orange 🔶', color: '#FF9F1C' },
    { id: 'blue', name: translations.blue || 'Azure Blue 🔷', color: '#1C9FFF' },
    { id: 'purple', name: translations.purple || 'Purple 🟣', color: '#9F1CFF' }
  ];

  return (
    <div className="theme-control">
      <select 
        value={currentTheme}
        onChange={(e) => onThemeChange(e.target.value)}
        className="theme-selector"
        style={{ borderColor: themes.find(t => t.id === currentTheme)?.color || '#FF9F1C' }}
      >
        {themes.map(theme => (
          <option 
            key={theme.id} 
            value={theme.id}
            style={{ color: theme.color }}
          >
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSelector;
