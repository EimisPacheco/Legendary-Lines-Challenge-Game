import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/AnswerModal.css';

const AnswerModal = ({ isOpen, onClose, onSubmit, questionType, currentPhrase }) => {
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAnswer('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(answer);
    setAnswer('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="answer-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="answer-modal"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <div className="answer-content">
              <h3>🤔 Your Answer Time!</h3>
              <p className="phrase-display">{currentPhrase}</p>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={`Enter the ${questionType}...`}
                  autoFocus
                />
                <button type="submit">Submit ✨</button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnswerModal; 