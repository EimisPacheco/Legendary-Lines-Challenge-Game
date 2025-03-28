import React from "react";
import ImageCarousel from "./components/ImageCarousel";
import GamePresenter from "./components/GamePresenter";
import "./styles/App.css";

function App() {
  return (
    <div className="app-container">
      <h1 className="app-title">Legendary Lines Challenge Game</h1>
      <div className="app-content">
        <div className="carousel-section">
          <ImageCarousel />
        </div>
        <div className="game-section">
          <GamePresenter />
        </div>
      </div>
    </div>
  );
}

export default App;