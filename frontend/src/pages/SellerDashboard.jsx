// frontend/src/pages/SellerDashboard.jsx
import React, { useState, useEffect } from 'react';
import bookService from '../services/bookService';
import requestService from '../services/requestService';
import BookCard from '../components/book/BookCard';
import BookForm from '../components/book/BookForm';
import Loader from '../components/common/Loader';
import RatingModal from '../components/common/RatingModal';
import '../styles/dashboard.css';

const SellerDashboard = () => {
  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [ratingTarget, setRatingTarget] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const booksData = await bookService.getMyBooks();
      const requestsData = await requestService.getIncomingRequests();
      setBooks(booksData);
      setRequests(requestsData);
    } catch (err) {
      console.error('Error fetching seller data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async (bookData) => {
    try {
      await bookService.createBook(bookData);
      alert('Book listed for approval!');
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to list book');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    if (!window.confirm('Accepting this request will mark the book as sold. Continue?')) return;
    try {
      await requestService.acceptRequest(requestId);
      const req = requests.find(r => r.id === requestId);
      setRatingTarget({ requestId, name: req?.buyer_name });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing? All images will be permanently removed.')) return;
    try {
      await bookService.deleteBook(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete book');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Seller Dashboard</h1>
          <p className="dashboard-subtitle">Manage your listings and student requests.</p>
        </div>
        <button 
          className={`btn ${showForm ? 'btn-outline' : 'btn-primary'}`} 
          onClick={() => setShowForm(!showForm)}
          style={{ transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          {showForm ? 'Cancel' : 'List New Book'}
        </button>
      </header>

      {showForm && (
        <div style={{ marginBottom: 'var(--space-xl)', animation: 'modalIn 0.4s ease-out' }}>
          <BookForm onSubmit={handleCreateBook} />
        </div>
      )}

      <div className="dashboard-grid">
        {/* My Books */}
        <section>
          <h2 className="section-title">My Listings</h2>
          <div className="listings-grid">
            {books.map(book => (
              <div key={book.id}>
                <BookCard book={book} onAction={() => {}} actionLabel="View" showRequests={true} onDelete={handleDeleteBook} />
              </div>
            ))}
            {books.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <p>No listings yet. Start by adding a book!</p>
              </div>
            )}
          </div>
        </section>

        {/* Incoming Requests */}
        <aside>
          <h2 className="section-title">Student Requests</h2>
          <div className="requests-container">
            {requests.map(req => (
              <div key={req.id} className="request-card">
                <div className="request-header">
                  <h4 className="request-book-title">{req.book_title}</h4>
                  <div className="request-meta">From: <span style={{ color: 'white', fontWeight: 600 }}>{req.buyer_name}</span></div>
                </div>
                <div className="request-footer">
                  <span className={`badge badge-${req.status}`}>{req.status}</span>
                  {req.status === 'pending' && (
                    <button 
                      onClick={() => handleAcceptRequest(req.id)} 
                      className="btn btn-primary" 
                      style={{ padding: '6px 16px', fontSize: '13px' }}
                    >
                      Accept
                    </button>
                  )}
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="empty-state">
                <p>No requests received yet.</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {ratingTarget && (
        <RatingModal 
          requestId={ratingTarget.requestId} 
          otherPartyName={ratingTarget.name}
          onClose={() => setRatingTarget(null)}
          onSuccess={() => alert('Thank you for your feedback!')}
        />
      )}
    </div>
  );
};

export default SellerDashboard;
