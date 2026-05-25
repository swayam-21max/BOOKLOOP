import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const HeroText = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="hero-text-container">
      <h1 className="hero-title animate-slide-up">
        Read, Swap, Repeat. <br />
        Join the <span className="text-highlight">Infinite Library</span>
      </h1>

      <p className="hero-subtitle animate-slide-up" style={{ animationDelay: '0.1s' }}>
        Connect with local readers, swap your finished books, and discover your next favorite story—all for free or a fraction of the cost.
      </p>

      <form onSubmit={handleSearch} className="hero-search-form animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <input 
          type="text" 
          placeholder="Search for a book, author, or genre..." 
          className="hero-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="hero-search-btn">Find Book</button>
      </form>

      <div className="hero-actions animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <Link to="/register" className="btn-home btn-home-primary">
          Join Now — It's Free
        </Link>
        <Link to="/marketplace" className="btn-home btn-home-outline">
          Browse All Books
        </Link>
      </div>
    </div>
  );
};

export default HeroText;
