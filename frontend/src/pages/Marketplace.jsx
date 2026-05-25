// frontend/src/pages/Marketplace.jsx
import React, { useState, useEffect } from 'react';
import bookService from '../services/bookService';
import requestService from '../services/requestService';
import favoritesService from '../services/favoritesService';
import { useAuth } from '../hooks/useAuth';
import BookCard from '../components/book/BookCard';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import '../styles/marketplace.css';

const Marketplace = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Advanced Filters (Feature 5)
  const [filters, setFilters] = useState({
    subject: '',
    className: '',
    semester: '',
    department: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    location: '',
    sortBy: 'newest'
  });

  const [favorites, setFavorites] = useState([]);
  const [requestingId, setRequestingId] = useState(null);
  
  // Swap Modal States
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedTargetBook, setSelectedTargetBook] = useState(null);
  const [myBooks, setMyBooks] = useState([]);
  const [selectedMyBook, setSelectedMyBook] = useState('');
  const [requestType, setRequestType] = useState('buy');

  useEffect(() => {
    fetchBooks();
  }, [filters]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await bookService.getBooks(filters);
      setBooks(data);
    } catch (err) {
      toast.error('Failed to load books');
      console.error('Error fetching marketplace books:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const favs = await favoritesService.getFavorites();
      setFavorites(favs.map(f => f.id)); // Collect book IDs
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      subject: '',
      className: '',
      semester: '',
      department: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      location: '',
      sortBy: 'newest'
    });
    toast.success('Filters cleared');
  };

  const handleFavoriteToggle = async (bookId) => {
    if (!user) {
      toast.error('Please log in to bookmark books!');
      return;
    }
    const isFav = favorites.includes(bookId);
    try {
      if (isFav) {
        await favoritesService.removeFromFavorites(bookId);
        setFavorites(prev => prev.filter(id => id !== bookId));
        toast.success('Removed from bookmarks');
      } else {
        await favoritesService.addToFavorites(bookId);
        setFavorites(prev => [...prev, bookId]);
        toast.success('Bookmarked! ❤️');
      }
    } catch (err) {
      toast.error('Failed to toggle bookmark');
    }
  };

  const handleRequestAction = async (book) => {
    if (!user) {
      toast.error('Please log in to request resources.');
      return;
    }
    
    if (book.seller_id === user.id) {
       toast.error('You cannot request your own book.');
       return;
    }

    setSelectedTargetBook(book);
    setRequestType('buy');
    setSwapModalOpen(true);
    
    try {
      const data = await bookService.getMyBooks();
      setMyBooks(data.filter(b => b.status === 'approved'));
    } catch (err) {
      console.error(err);
    }
  };

  const submitRequest = async () => {
    if (requestType === 'swap' && !selectedMyBook) {
        toast.error('Please select a book to offer.');
        return;
    }
    setRequestingId(selectedTargetBook.id);
    try {
      await requestService.createRequest(selectedTargetBook.id, requestType, requestType === 'swap' ? selectedMyBook : null);
      toast.success('Trade request sent successfully! 🚀');
      setSwapModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request.');
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="container marketplace-container" style={{ paddingTop: 'var(--space-lg)' }}>
      <div className="marketplace-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-lg)', minHeight: '80vh' }}>
        
        {/* Advanced Filters Sidebar (Feature 5) */}
        <aside className="filters-sidebar card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <h3 style={{ margin: '0', fontWeight: 800 }}>Filters</h3>
            <button onClick={handleClearFilters} style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>Reset</button>
          </div>
          
          <div className="filter-group">
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Subject</label>
            <select name="subject" className="form-control" value={filters.subject} onChange={handleFilterChange}>
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
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Class / Degree</label>
            <select name="className" className="form-control" value={filters.className} onChange={handleFilterChange}>
              <option value="">All Classes</option>
              <option value="11th">11th Standard</option>
              <option value="12th">12th Standard</option>
              <option value="B.Tech">B.Tech Engineering</option>
              <option value="B.Sc">B.Sc Science</option>
              <option value="M.Tech">M.Tech Postgrad</option>
            </select>
          </div>

          <div className="filter-group">
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Semester</label>
            <select name="semester" className="form-control" value={filters.semester} onChange={handleFilterChange}>
              <option value="">Any Semester</option>
              <option value="1st">1st Semester</option>
              <option value="2nd">2nd Semester</option>
              <option value="3rd">3rd Semester</option>
              <option value="4th">4th Semester</option>
              <option value="5th">5th Semester</option>
              <option value="6th">6th Semester</option>
              <option value="7th">7th Semester</option>
              <option value="8th">8th Semester</option>
            </select>
          </div>

          <div className="filter-group">
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Department / Branch</label>
            <select name="department" className="form-control" value={filters.department} onChange={handleFilterChange}>
              <option value="">Any Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Electrical">Electrical</option>
            </select>
          </div>

          <div className="filter-group">
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Condition</label>
            <select name="condition" className="form-control" value={filters.condition} onChange={handleFilterChange}>
              <option value="">Any Condition</option>
              <option value="New">Brand New</option>
              <option value="Good">Good/Used</option>
              <option value="Worn">Worn Out</option>
            </select>
          </div>

          <div className="filter-group">
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Price Range</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="number" name="minPrice" placeholder="Min" className="form-control" value={filters.minPrice} onChange={handleFilterChange} />
              <input type="number" name="maxPrice" placeholder="Max" className="form-control" value={filters.maxPrice} onChange={handleFilterChange} />
            </div>
          </div>



          <div className="filter-group">
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Campus Location</label>
            <input type="text" name="location" placeholder="📍 Hostel / Block..." className="form-control" value={filters.location} onChange={handleFilterChange} />
          </div>

          <div className="filter-group">
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Sorting</label>
            <select name="sortBy" className="form-control" value={filters.sortBy} onChange={handleFilterChange}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Viewed</option>
            </select>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="marketplace-main" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <header className="results-header" style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 900, background: 'linear-gradient(to right, #6366f1, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Explore Marketplace</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Showing {books.length} verified listings</p>
            </div>
          </header>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
              <Loader />
            </div>
          ) : (
            <div className="listings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
              {books.map(book => (
                <BookCard 
                  key={book.id} 
                  book={book}
                  isFavorite={favorites.includes(book.id)}
                  onFavoriteToggle={handleFavoriteToggle}
                  onAction={() => handleRequestAction(book)} 
                  actionLabel={requestingId === book.id ? 'Sending...' : 'Request to Buy'} 
                />
              ))}
              
              {books.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px 0', background: 'var(--glass-bg)', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
                   <p style={{ fontSize: '48px', margin: '0' }}>🔍</p>
                   <h3 style={{ marginTop: '16px' }}>No books matching your criteria</h3>
                   <p style={{ color: 'var(--text-secondary)' }}>Try broadening your search filters or resetting values.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Buy/Swap Modal drawer */}
      {swapModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '500px', width: '100%', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ marginBottom: '16px', fontWeight: 800 }}>Request "{selectedTargetBook?.title}"</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
              Select your request type below to coordinate a secure pick-up from the seller.
            </p>
            
            <div style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" name="reqType" value="buy" checked={requestType === 'buy'} onChange={() => setRequestType('buy')} style={{ accentColor: 'var(--primary)' }} />
                <span style={{ fontWeight: 600 }}>Buy Resource (${selectedTargetBook?.price})</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="radio" name="reqType" value="swap" checked={requestType === 'swap'} onChange={() => setRequestType('swap')} style={{ accentColor: 'var(--primary)' }} />
                <span style={{ fontWeight: 600 }}>Exchange/Swap</span>
              </label>
            </div>
            
            {requestType === 'swap' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Select a book to offer in exchange:</label>
                <select className="form-control" value={selectedMyBook} onChange={(e) => setSelectedMyBook(e.target.value)} style={{ width: '100%' }}>
                  <option value="">-- Choose Your Book --</option>
                  {myBooks.map(b => (
                    <option key={b.id} value={b.id}>{b.title} ({b.subject})</option>
                  ))}
                </select>
                {myBooks.length === 0 && (
                  <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '6px', fontWeight: 500 }}>
                    ⚠️ You don't have any approved listings listed. Please list a book in approved status to swap.
                  </p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <button className="btn" style={{ border: '1px solid var(--border)', color: 'white' }} onClick={() => setSwapModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitRequest} disabled={requestingId || (requestType === 'swap' && myBooks.length === 0)}>
                {requestingId ? 'Sending...' : 'Confirm Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
