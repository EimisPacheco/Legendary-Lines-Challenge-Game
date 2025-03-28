import React, { useState } from 'react';
import '../styles/AnimatedPanel.css';

const images = [
    require('../assets/image1.png'),
    require('../assets/image2.png'),
    require('../assets/image3.png'),
    require('../assets/image4.png'),
    require('../assets/image5.png'),
];

const AnimatedPanel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="carousel">
      <div className="carousel-inner">
        {images.map((image, index) => (
          <div
            key={index}
            className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          ></div>
        ))}
      </div>
      <button className="carousel-control prev" onClick={prevImage}>
        &#10094;
      </button>
      <button className="carousel-control next" onClick={nextImage}>
        &#10095;
      </button>
    </div>
  );
};

export default AnimatedPanel;