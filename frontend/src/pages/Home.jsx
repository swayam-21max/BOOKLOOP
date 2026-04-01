import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero3D from '../components/home/Hero3D';
import HeroText from '../components/home/HeroText';
import Footer from '../components/common/Footer';
import '../styles/home.css';

const Home = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

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
          <Hero3D />
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="section steps-section">
        <div className="section-inner">
          <div className="section-header reveal">
            <span className="section-badge">Simple Process</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              Three simple steps to give your books a new home and save money on your next read.
            </p>
          </div>

          <div className="steps-container">
            <div className="step-card reveal delay-1">
              <div className="step-circle step-circle-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <h3>Upload Book</h3>
              <p>List your gently used books in seconds. Specify condition, subject, and your price.</p>
            </div>

            <div className="step-arrow reveal delay-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>

            <div className="step-card reveal delay-2">
              <div className="step-circle step-circle-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <h3>Find a Match</h3>
              <p>Our smart matching connects you with buyers looking for exactly what you have.</p>
            </div>

            <div className="step-arrow reveal delay-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>

            <div className="step-card reveal delay-3">
              <div className="step-circle step-circle-orange">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Share Knowledge</h3>
              <p>Meet up or ship locally to pass on knowledge and keep the loop going.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHY BOOKLOOP ═══ */}
      <section className="section features-section">
        <div className="section-inner">
          <div className="section-header reveal">
            <span className="section-badge">Why Choose Us</span>
            <h2 className="section-title">Why BOOKLOOP?</h2>
            <p className="section-subtitle">
              Built for students and book lovers who believe knowledge should be accessible to everyone.
            </p>
          </div>

          <div className="features-grid">
            {/* Card 1 — Blue Accent */}
            <div className="feature-card reveal delay-1">
              <div className="feature-accent feature-accent-blue"></div>
              <div className="feature-body">
                <div className="feature-icon-wrapper feature-icon-blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div className="feature-content">
                  <h3>Smart Matching</h3>
                  <p>AI-powered recommendations based on your subjects, location, and reading preferences.</p>
                </div>
              </div>
            </div>

            {/* Card 2 — Green Accent */}
            <div className="feature-card reveal delay-2">
              <div className="feature-accent feature-accent-green"></div>
              <div className="feature-body">
                <div className="feature-icon-wrapper feature-icon-green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className="feature-content">
                  <h3>Affordable Books</h3>
                  <p>Save up to 70% compared to new books while helping the environment.</p>
                </div>
              </div>
            </div>

            {/* Card 3 — Orange Accent */}
            <div className="feature-card reveal delay-3">
              <div className="feature-accent feature-accent-orange"></div>
              <div className="feature-body">
                <div className="feature-icon-wrapper feature-icon-orange">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div className="feature-content">
                  <h3>Sustainable Reuse</h3>
                  <p>Reduce paper waste and carbon footprint by joining the circular book economy.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="section cta-section">
        <div className="cta-card reveal">
          <h2>Ready to join the loop?</h2>
          <p>Create an account today and start exchanging knowledge with your community.</p>
          <Link to="/register" className="btn-cta">
            Join Now — It's Free
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <Footer />
    </div>
  );
};

export default Home;
