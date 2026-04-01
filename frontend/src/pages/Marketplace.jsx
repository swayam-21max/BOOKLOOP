// frontend/src/pages/Marketplace.jsx
import React, { useState, useEffect } from 'react';
import bookService from '../services/bookService';
import requestService from '../services/requestService';
import { useAuth } from '../hooks/useAuth';
import BookCard from '../components/book/BookCard';
import Loader from '../components/common/Loader';
import '../styles/marketplace.css';

const Marketplace = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: '',
    className: '',
    location: '',
    sortBy: 'newest'
  });
  const { user } = useAuth();
  const [requestingId, setRequestingId] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, [filters]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await bookService.getBooks(filters);
      setBooks(data);
    } catch (err) {
      console.error('Error fetching marketplace books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRequestAction = async (book) => {
    if (!user) {
      alert('Please log in to request a book.');
      return;
    }
    
    if (user.role !== 'buyer') {
      alert('Only buyer accounts can request to buy books.');
      return;
    }

    if (window.confirm(`Send a purchase request for "${book.title}"?`)) {
      setRequestingId(book.id);
      try {
        await requestService.createRequest(book.id);
        alert('Request sent successfully!');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to send request.');
      } finally {
        setRequestingId(null);
      }
    }
  };

  return (
    <div className="container marketplace-container">
      <div className="marketplace-layout">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <h3 style={{ marginBottom: 'var(--space-md)', fontWeight: 800 }}>Filters</h3>
          
          <div className="filter-group">
            <label>Subject</label>
            <select name="subject" className="filter-select" value={filters.subject} onChange={handleFilterChange}>
              <option value="">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Humanities">Humanities</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Standard / Class</label>
            <select name="className" className="filter-select" value={filters.className} onChange={handleFilterChange}>
              <option value="">All Classes</option>
              <option value="12th">12th Standard</option>
              <option value="11th">11th Standard</option>
              <option value="B.Tech">Bachelor of Tech</option>
              <option value="B.Sc">Bachelor of Science</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Location</label>
            <input 
              type="text" 
              name="location" 
              placeholder="Search hostel/campus..." 
              className="filter-input" 
              value={filters.location} 
              onChange={handleFilterChange} 
            />
          </div>

          <div className="filter-group">
            <label>Sorted By</label>
            <select name="sortBy" className="filter-select" value={filters.sortBy} onChange={handleFilterChange}>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Main Content */}
        <div className="marketplace-main">
          <header className="results-header">
            <div>
              <h1>Explore Marketplace</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Showing {books.length} academic resources</p>
            </div>
          </header>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <Loader />
            </div>
          ) : (
            <div className="listings-grid">
              {books.map(book => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onAction={() => handleRequestAction(book)} 
                  actionLabel={requestingId === book.id ? 'Sending...' : 'Request to Buy'} 
                />
              ))}
              {books.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0' }}>
                   <p style={{ fontSize: '48px' }}>🔍</p>
                   <h3>No books found</h3>
                   <p className="admin-text-secondary">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
