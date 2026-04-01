import React, { useEffect } from 'react';
import Footer from '../components/common/Footer';
import '../styles/about.css';

const About = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-container">
      {/* ═══ HERO ═══ */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <span className="about-badge animate-slide-up">About Us</span>
          <h1 className="about-hero-title animate-slide-up">
            We're building the future of <br />
            <span className="text-highlight">book sharing</span>
          </h1>
          <p className="about-hero-subtitle animate-slide-up" style={{ animationDelay: '0.1s' }}>
            BOOKLOOP is a circular marketplace where knowledge never goes to waste.
            We connect readers, students, and book lovers to buy, sell, and share books sustainably.
          </p>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="about-stats-section">
        <div className="about-stats-grid reveal">
          <div className="about-stat">
            <span className="about-stat-number">500+</span>
            <span className="about-stat-label">Books Listed</span>
          </div>
          <div className="about-stat-divider"></div>
          <div className="about-stat">
            <span className="about-stat-number">200+</span>
            <span className="about-stat-label">Happy Users</span>
          </div>
          <div className="about-stat-divider"></div>
          <div className="about-stat">
            <span className="about-stat-number">95%</span>
            <span className="about-stat-label">Satisfaction Rate</span>
          </div>
          <div className="about-stat-divider"></div>
          <div className="about-stat">
            <span className="about-stat-number">₹50K+</span>
            <span className="about-stat-label">Money Saved</span>
          </div>
        </div>
      </section>

      {/* ═══ MISSION ═══ */}
      <section className="about-section">
        <div className="about-section-inner">
          <div className="about-mission-grid">
            <div className="about-mission-text reveal">
              <span className="about-badge-small">Our Mission</span>
              <h2 className="about-section-title">Making knowledge accessible to everyone</h2>
              <p className="about-text">
                We believe that every book deserves to be read more than once. BOOKLOOP was born
                from a simple idea — instead of letting textbooks collect dust on your shelf,
                pass them on to someone who needs them.
              </p>
              <p className="about-text">
                Our platform creates a sustainable loop of knowledge sharing, helping students
                save money while reducing the environmental impact of printing new books.
              </p>
            </div>
            <div className="about-mission-visual reveal delay-2">
              <div className="about-visual-card">
                <div className="about-visual-icon">📚</div>
                <span>Circular Economy</span>
              </div>
              <div className="about-visual-card">
                <div className="about-visual-icon">🌍</div>
                <span>Sustainable</span>
              </div>
              <div className="about-visual-card">
                <div className="about-visual-icon">🤝</div>
                <span>Community</span>
              </div>
              <div className="about-visual-card">
                <div className="about-visual-icon">💡</div>
                <span>Innovation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VALUES ═══ */}
      <section className="about-section about-values-bg">
        <div className="about-section-inner">
          <div className="section-header reveal">
            <span className="about-badge-small">Our Values</span>
            <h2 className="about-section-title" style={{ textAlign: 'center' }}>What drives us</h2>
          </div>

          <div className="about-values-grid">
            <div className="about-value-card reveal delay-1">
              <div className="about-value-icon about-value-icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>Trust & Safety</h3>
              <p>Every listing is verified. Every transaction is secure. Your trust is our foundation.</p>
            </div>

            <div className="about-value-card reveal delay-2">
              <div className="about-value-icon about-value-icon-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </div>
              <h3>Community First</h3>
              <p>We build for people, not profit. Every feature is designed to help readers connect.</p>
            </div>

            <div className="about-value-card reveal delay-3">
              <div className="about-value-icon about-value-icon-orange">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
              </div>
              <h3>Sustainability</h3>
              <p>Every reused book saves trees, water, and energy. Small actions, big impact.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TIMELINE ═══ */}
      <section className="about-section">
        <div className="about-section-inner">
          <div className="section-header reveal">
            <span className="about-badge-small">Our Journey</span>
            <h2 className="about-section-title" style={{ textAlign: 'center' }}>The BOOKLOOP story</h2>
          </div>

          <div className="about-timeline">
            <div className="timeline-item reveal delay-1">
              <div className="timeline-dot timeline-dot-blue"></div>
              <div className="timeline-content">
                <span className="timeline-date">2024</span>
                <h3>The Idea</h3>
                <p>Born from a college hostel room where unused textbooks piled up every semester.</p>
              </div>
            </div>
            <div className="timeline-item reveal delay-2">
              <div className="timeline-dot timeline-dot-green"></div>
              <div className="timeline-content">
                <span className="timeline-date">2025</span>
                <h3>First Prototype</h3>
                <p>Built the first version with React and Node.js. Tested with 50 students on campus.</p>
              </div>
            </div>
            <div className="timeline-item reveal delay-3">
              <div className="timeline-dot timeline-dot-orange"></div>
              <div className="timeline-content">
                <span className="timeline-date">2026</span>
                <h3>Launch</h3>
                <p>Full platform launch with 3D homepage, admin panel, chat system, and smart matching.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
