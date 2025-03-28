import React from 'react';
import '../styles/Controls.css';

const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  return (
    <select 
      value={currentLanguage}
      onChange={(e) => onLanguageChange(e.target.value)}
      className="language-selector"
    >
      <option value="en">English 🇬🇧</option>
      <option value="es">Español 🇪🇸</option>
      <option value="fr">Français 🇫🇷</option>
      <option value="de">Deutsch 🇩🇪</option>
      <option value="it">Italiano 🇮🇹</option>
      <option value="pt">Português 🇵🇹</option>
      <option value="ru">Русский 🇷🇺</option>
      <option value="zh">中文 🇨🇳</option>
      <option value="ja">日本語 🇯🇵</option>
      <option value="ko">한국어 🇰🇷</option>
    </select>
  );
};

export default LanguageSelector; 