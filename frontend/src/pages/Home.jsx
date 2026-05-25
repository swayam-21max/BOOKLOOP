import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeroText from '../components/home/HeroText';
import Footer from '../components/common/Footer';
import bookService from '../services/bookService';
import '../styles/home.css';

const Home = () => {
  const [recentBooks, setRecentBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Setup scroll reveal animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    // Fetch recent books
    const fetchRecentBooks = async () => {
      try {
        const data = await bookService.getBooks({ limit: 10, status: 'AVAILABLE' });
        // Assume data might be an array or { books: [] } depending on API
        const booksArray = Array.isArray(data) ? data : (data.books || []);
        setRecentBooks(booksArray.slice(0, 8)); // Get top 8 recent books
      } catch (error) {
        console.error("Failed to fetch recent books:", error);
      }
    };
    
    fetchRecentBooks();

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-container">
      {/* ═══ HERO ═══ */}
      <section className="hero-section">
        <div className="hero-left">
          <HeroText />
        </div>
        <div className="hero-right">
          {/* Replaced Hero3D with Floating Books Graphic */}
          <div className="floating-books-container reveal delay-2">
            <div className="floating-book book-1" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop)' }}></div>
            <div className="floating-book book-2" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop)' }}></div>
            <div className="floating-book book-3" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600&auto=format&fit=crop)' }}></div>
          </div>
        </div>
      </section>

      {/* ═══ RECENT BOOKS CAROUSEL ═══ */}
      <section className="recent-books-section">
        <div className="section-header reveal">
          <h2 className="section-title">Fresh Additions</h2>
          <p className="section-subtitle">Discover the latest books shared by our community.</p>
        </div>
        <div className="books-scroll-container reveal delay-1">
          {(recentBooks.length > 0 ? recentBooks : [
            { _id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', price: 0, condition: 'Good', images: [{ url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=500&auto=format&fit=crop' }] },
            { _id: '2', title: '1984', author: 'George Orwell', price: 150, condition: 'Like New', images: [{ url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=500&auto=format&fit=crop' }] },
            { _id: '3', title: 'To Kill a Mockingbird', author: 'Harper Lee', price: 200, condition: 'Acceptable', images: [{ url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=500&auto=format&fit=crop' }] },
            { _id: '4', title: 'Pride and Prejudice', author: 'Jane Austen', price: 0, condition: 'Good', images: [{ url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=500&auto=format&fit=crop' }] }
          ]).map((book) => (
            <div 
              key={book.id || book._id} 
              className="glass-book-card"
              onClick={() => navigate(`/marketplace?search=${encodeURIComponent(book.title)}`)}
            >
              <div className="book-cover-wrapper">
                <img 
                  src={book.images && book.images.length > 0 ? book.images[0].url : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop'} 
                  alt={book.title} 
                  className="book-cover-img"
                />
                <span className="book-condition-badge">{book.condition || 'Good'}</span>
              </div>
              <div className="book-info">
                <h4>{book.title}</h4>
                <p>{book.author}</p>
              </div>
              <div className="book-footer">
                <span className="book-price">
                  {book.price === 0 ? 'Free Swap' : `₹${book.price}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="section steps-section">
        <div className="section-header reveal">
          <span className="section-badge">How It Works</span>
          <h2 className="section-title">The Circular Economy of Reading</h2>
          <p className="section-subtitle">
            Three simple steps to pass on knowledge and save money on your next great read.
          </p>
        </div>

        <div className="steps-container">
          <div className="step-card reveal delay-1">
            <div className="step-icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3>List Your Books</h3>
            <p>Snap a photo, add condition details, and list your finished books in seconds.</p>
          </div>

          <div className="step-card reveal delay-2">
            <div className="step-icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3>Discover Matches</h3>
            <p>Browse the marketplace or let our smart wishlisting notify you of perfect matches.</p>
          </div>

          <div className="step-card reveal delay-3">
            <div className="step-icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>Swap or Buy</h3>
            <p>Connect with the owner to arrange a local swap or a secure purchase.</p>
          </div>
        </div>
      </section>

      {/* ═══ STATS & FEATURES ═══ */}
      <section className="section features-section">
        <div className="stats-container reveal">
          <div className="stat-item">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Books Listed</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">5K+</div>
            <div className="stat-label">Active Readers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">2.5K</div>
            <div className="stat-label">Successful Swaps</div>
          </div>
        </div>

        <div className="section-header reveal">
          <span className="section-badge">Why Bookloop</span>
          <h2 className="section-title">Built for Book Lovers</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card reveal delay-1">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h3>Smart Wishlists</h3>
            <p>Never miss a book. Add titles to your wishlist and get notified the moment they are listed.</p>
          </div>

          <div className="feature-card reveal delay-2">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3>Affordable Reading</h3>
            <p>Save money compared to retail prices. Swap your old books to get new ones essentially for free.</p>
          </div>

          <div className="feature-card reveal delay-3">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h3>Sustainable Choice</h3>
            <p>Reduce paper waste and your carbon footprint by joining the circular economy of books.</p>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="section cta-section">
        <div className="cta-card reveal">
          <h2>Ready to expand your library?</h2>
          <p>Create your free account today and join thousands of readers exchanging knowledge.</p>
          <Link to="/register" className="btn-cta">
            Join the Community
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <Footer />
    </div>
  );
};

export default Home;
