import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/RulesModal.css';

const RulesModal = ({ translations, currentLanguage, currentTheme }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleModal = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="rules-modal-container">
      <button 
        className="rules-button"
        onClick={toggleModal}
      >
        {isVisible ? translations.hideRules : translations.rules}
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div 
            className="rules-modal"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div className="rules-content">
              <h1>{translations.gameRulesTitle}</h1>
              <p>{translations.welcomeMessage}</p>

              <section>
                <h2>{translations.howToPlayTitle}</h2>
                <ol>
                  <li>{translations.startGameRule}</li>
                  <li>{translations.chooseNicknameRule}</li>
                  <li>{translations.setRoundsRule}</li>
                  <li>{translations.pickCategoryRule}</li>
                  <ul>
                    <li>{translations.categorySong}</li>
                    <li>{translations.categoryMovie}</li>
                    <li>{translations.categoryPerson}</li>
                    <li>{translations.categoryCharacter}</li>
                    <li>{translations.categoryBook}</li>
                    <li>{translations.categoryPoet}</li>
                    <li>{translations.categoryQuote}</li>
                  </ul>
                </ol>
              </section>

              <section>
                <h2>{translations.gameplayTitle}</h2>
                <p>{translations.gameplayDescription}</p>
              </section>

              <section>
                <h2>{translations.bonusPointsTitle}</h2>
                <h3>{translations.doublePointsTitle}</h3>
                <p>{translations.doublePointsDesc}</p>
                <ul>
                  <li>{translations.correctDouble}</li>
                  <li>{translations.incorrectDouble}</li>
                </ul>

                <h3>{translations.triplePointsTitle}</h3>
                <ul>
                  <li>{translations.tripleMovies}</li>
                  <li>{translations.tripleSongs}</li>
                  <li>{translations.tripleBooks}</li>
                  <li>{translations.correctTriple}</li>
                  <li>{translations.incorrectTriple}</li>
                </ul>
              </section>

              <section>
                <h2>{translations.keepingPointsTitle}</h2>
                <p>{translations.keepingPointsDesc}</p>
              </section>

              <section>
                <h2>{translations.endGameTitle}</h2>
                <p>{translations.endGameDesc}</p>
              </section>

              <p className="rules-footer">{translations.rulesFooter}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RulesModal; 