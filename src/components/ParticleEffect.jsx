import React, { useEffect } from 'react';

const ParticleEffect = ({ targetElement }) => {
  useEffect(() => {
    if (targetElement) {
      createParticles(targetElement);
    }
  }, [targetElement]);

  const createParticles = (element) => {
    // Clear existing particles
    const existingWrapper = element.querySelector('.particles-wrapper');
    if (existingWrapper) {
      existingWrapper.remove();
    }

    // Create particles wrapper
    const particlesWrapper = document.createElement('div');
    particlesWrapper.className = 'particles-wrapper';
    
    // Create new particles
    for (let i = 0; i < 300; i++) {
      const particle = document.createElement('div');
      particle.className = 'thanos-particle';
      
      // Random position around the text
      const x = Math.random() * element.offsetWidth;
      const y = Math.random() * element.offsetHeight;
      
      // Varied particle sizes for more dynamic effect
      const size = Math.random() * 6 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Set initial position
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      // Increased movement range
      const tx = (Math.random() - 0.5) * 500;
      const ty = (Math.random() - 0.5) * 500;
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      
      // Staggered animation with longer duration
      const delay = Math.random() * 0.5;
      particle.style.animation = `
        float 2.5s ease-out ${delay}s infinite alternate,
        particleAnimation 1.2s ease-out ${delay}s forwards,
        particleAnimationReturn 1.2s ease-in ${1.8 + delay}s forwards
      `;
      
      particlesWrapper.appendChild(particle);
    }

    element.insertBefore(particlesWrapper, element.firstChild);
  };

  return null;
};

export default ParticleEffect; 