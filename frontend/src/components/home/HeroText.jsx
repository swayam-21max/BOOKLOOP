import React from 'react';
import { Link } from 'react-router-dom';

const HeroText = () => {
  return (
    <div className="hero-text-container">
      <h1 className="hero-title animate-slide-up">
        Give Your Books a <br />
        <span className="text-highlight">Second Life</span>
      </h1>

      <p className="hero-subtitle animate-slide-up" style={{ animationDelay: '0.1s' }}>
        A professional marketplace for book enthusiasts to buy, sell, and swap knowledge sustainably.
      </p>

      <div className="hero-actions animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <Link to="/register" className="btn-home btn-home-primary">
          Start Sharing
        </Link>
        <Link to="/books" className="btn-home btn-home-outline">
          Explore Collection
        </Link>
      </div>
    </div>
  );
};

export default HeroText;
