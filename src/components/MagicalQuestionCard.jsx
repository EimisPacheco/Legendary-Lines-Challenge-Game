import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import '../styles/MagicalQuestionCard.css';

const MagicalQuestionCard = ({ message, triggerEffect, isRoundComplete }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    // Add a small delay to ensure the animation has completed
    const timer = setTimeout(() => {
      if (cardRef.current) {
        createParticles(cardRef.current);
      }
    }, 500); // Wait for the animation to complete

    return () => clearTimeout(timer);
  }, [message, triggerEffect]);

  useEffect(() => {
    console.log('MagicalQuestionCard Effect:', {
      isRoundComplete,
      triggerEffect
    });
    
    if (isRoundComplete) {
      console.log('🎊 Firing Confetti!');
      fireCelebrationConfetti();
    }
  }, [isRoundComplete, triggerEffect]);

  const createParticles = (element) => {
    console.log('Creating particles for:', element);

    // Clear existing particles
    const existingWrapper = element.querySelector('.particles-wrapper');
    if (existingWrapper) {
      existingWrapper.remove();
    }

    // Create particles wrapper
    const particlesWrapper = document.createElement('div');
    particlesWrapper.className = 'particles-wrapper';
    
    // Create new particles with better distribution
    for (let i = 0; i < 2500; i++) {
      const particle = document.createElement('div');
      particle.className = 'thanos-particle';
      
      // Distribute particles across the entire card
      const x = Math.random() * element.offsetWidth;
      const y = Math.random() * element.offsetHeight;
      
      // Slightly larger particles
      const size = Math.random() * 5 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Position relative to the card
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      // Wider spread for initial positions
      const angle = Math.random() * Math.PI * 2;
      const distance = 300 + Math.random() * 200;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      
      // Animation timing
      const inDelay = Math.random() * 0.5;
      const holdDelay = 1.8;
      const outDelay = holdDelay + Math.random() * 0.2;
      
      particle.style.animation = `
        particleAnimationIn 1.2s cubic-bezier(0.4, 0, 0.2, 1) ${inDelay}s forwards,
        particleAnimationOut 1.2s cubic-bezier(0.4, 0, 0.2, 1) ${outDelay}s forwards
      `;
      
      particlesWrapper.appendChild(particle);
    }

    element.insertBefore(particlesWrapper, element.firstChild);
  };

  const fireCelebrationConfetti = () => {
    // First burst
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    // Start the sequence
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      decay: 0.95,
      scalar: 0.8
    });

    fire(0.2, {
      spread: 60,
      decay: 0.91,
      scalar: 1.2
    });

    fire(0.35, {
      spread: 100,
      decay: 0.92,
      scalar: 1.2,
      startVelocity: 45
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.3
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      decay: 0.91,
      scalar: 1.1
    });

    // Add a delayed second burst for extra celebration
    setTimeout(() => {
      fire(0.25, {
        spread: 100,
        startVelocity: 45,
        decay: 0.92,
        scalar: 1.2
      });
    }, 500);
  };

  function handleSubmit(event) {
    event.preventDefault();
    const inputValue = event.target.elements.inputName.value; // Ensure this is correct
    // Check if inputValue is being sent correctly
    if (inputValue) {
        // Send inputValue to the AI
        sendToAI(inputValue);
    } else {
        console.error("Input value is empty");
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        ref={cardRef}
        className="magical-card"
        key={triggerEffect}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5 }}
        onAnimationComplete={() => {
          // Create particles after animation completes
          if (cardRef.current) {
            createParticles(cardRef.current);
          }
        }}
      >
        <div className="particles-wrapper"></div>
        <div className="card-content">
          {message || "Waiting for the game to begin..."}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MagicalQuestionCard;