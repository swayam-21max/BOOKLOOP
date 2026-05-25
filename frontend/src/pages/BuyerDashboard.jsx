// frontend/src/pages/BuyerDashboard.jsx
import React, { useState, useEffect } from 'react';
import requestService from '../services/requestService';
import bookService from '../services/bookService';
import favoritesService from '../services/favoritesService';
import wishlistService from '../services/wishlistService';
import Loader from '../components/common/Loader';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // V2 Dashboard sections
  const [favorites, setFavorites] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [recommendations, setRecommendations] = useState({
    recommendedForYou: [],
    studentsAlsoViewed: [],
    popularInDept: []
  });

  // Search Alerts Form
  const [alertForm, setAlertForm] = useState({
    keyword: '',
    subject: '',
    author: '',
    max_price: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Parallel fetches for extreme speed
      const [reqData, favData, recentData, alertData, recsData] = await Promise.all([
        requestService.getMyRequests(),
        favoritesService.getFavorites(),
        bookService.getRecentViews(),
        wishlistService.getWishlists(),
        bookService.getRecommendations()
      ]);

      setRequests(reqData);
      setFavorites(favData);
      setRecentViews(recentData);
      setWishlists(alertData);
      setRecommendations(recsData);
    } catch (err) {
      console.error('Error fetching buyer dashboard data:', err);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlert = async (e) => {
    e.preventDefault();
    const { keyword, subject, author, max_price } = alertForm;
    if (!keyword && !subject && !author && !max_price) {
      toast.error('Please fill at least one alert criterion');
      return;
    }

    try {
      const added = await wishlistService.addWishlist({
        keyword: keyword || null,
        subject: subject || null,
        author: author || null,
        max_price: max_price ? parseFloat(max_price) : null
      });

      setWishlists([added, ...wishlists]);
      setAlertForm({ keyword: '', subject: '', author: '', max_price: '' });
      toast.success('Search alert created successfully! 🔔');
    } catch (err) {
      toast.error('Failed to add alert');
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await wishlistService.deleteWishlist(id);
      setWishlists(wishlists.filter(w => w.id !== id));
      toast.success('Alert deleted');
    } catch (err) {
      toast.error('Failed to delete alert');
    }
  };

  const handleRemoveFavorite = async (bookId) => {
    try {
      await favoritesService.removeFromFavorites(bookId);
      setFavorites(favorites.filter(f => f.id !== bookId));
      toast.success('Removed from bookmarks');
    } catch (err) {
      toast.error('Failed to remove bookmark');
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--space-lg) 0' }}>
      <header style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 900, background: 'linear-gradient(to right, #6366f1, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Buyer Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track trade proposals, saved materials, views, and tailored recommendations.</p>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Loader /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          
          {/* Section 1: Trade Requests Log (Feature 8) */}
          <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ marginBottom: 'var(--space-md)', fontWeight: 800 }}>Trade Requests History</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '12px' }}>Book Title</th>
                    <th style={{ padding: '12px' }}>Seller</th>
                    <th style={{ padding: '12px' }}>Proposal Type</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{req.book_title}</td>
                      <td style={{ padding: '12px' }}>{req.seller_name}</td>
                      <td style={{ padding: '12px' }}>
                        {req.request_type === 'swap' ? (
                          <span style={{ color: '#F59E0B', fontWeight: 600 }}>🔄 Swap ({req.offered_book_title})</span>
                        ) : (
                          <span style={{ fontWeight: 600 }}>💰 Buy (${req.book_price})</span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`badge badge-${req.status}`}>{req.status}</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div className="flex gap-sm">
                          {req.status === 'accepted' && (
                            <Link to="/chat" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }}>Coordinate Chat</Link>
                          )}
                          {req.status === 'pending' && (
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Awaiting seller review...</span>
                          )}
                          {req.status === 'rejected' && (
                            <span style={{ fontSize: '12px', color: 'var(--danger)' }}>Declined</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        You haven't requested any materials yet. <Link to="/books" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Explore Marketplace</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Favorites Dashboard (Feature 3) */}
          <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ marginBottom: 'var(--space-md)', fontWeight: 800 }}>Favorite saved Books</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
              {favorites.map(fav => (
                <div key={fav.id} className="card" style={{ padding: 'var(--space-md)', position: 'relative', border: '1px solid var(--border)' }}>
                  <button 
                    onClick={() => handleRemoveFavorite(fav.id)}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '20px' }}
                    title="Remove Bookmark"
                  >
                    ❤️
                  </button>
                  <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase' }}>{fav.subject}</span>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '4px 0' }}>{fav.title}</h4>
                  <p style={{ fontSize: '14px', color: 'white', fontWeight: 800, marginBottom: '12px' }}>${fav.price}</p>
                  <button onClick={() => navigate(`/books`)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '11px', width: '100%' }}>View Listing</button>
                </div>
              ))}
              {favorites.length === 0 && (
                <p style={{ gridColumn: '1/-1', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px' }}>No saved books yet. Heart books in the shop to see them here!</p>
              )}
            </div>
          </div>

          {/* Section 3: Recently Viewed Books (Feature 4) */}
          <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ marginBottom: 'var(--space-md)', fontWeight: 800 }}>Recently Viewed Books</h2>
            <div style={{ display: 'flex', gap: 'var(--space-md)', overflowX: 'auto', paddingBottom: '8px' }}>
              {recentViews.map(recent => (
                <div key={recent.id} className="card" style={{ minWidth: '220px', width: '220px', padding: 'var(--space-md)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 'bold' }}>{recent.class}</span>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{recent.title}</h4>
                  <p style={{ fontSize: '13px', fontWeight: 800, margin: '4px 0' }}>${recent.price}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Seller: {recent.seller_name}</p>
                  <button onClick={() => navigate(`/books`)} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '10px', width: '100%' }}>Explore</button>
                </div>
              ))}
              {recentViews.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', width: '100%', textAlign: 'center', padding: '16px' }}>No viewed books recorded.</p>
              )}
            </div>
          </div>

          {/* Section 4: Wishlist Alert Center (Feature 10) */}
          <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ marginBottom: '4px', fontWeight: 800 }}>Wishlist Match Center</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>Create customized match triggers. We'll alert you instantly when matching academic resources are listed!</p>
            
            <form onSubmit={handleAddAlert} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Keyword Alert</label>
                <input type="text" className="form-control" placeholder="e.g. HC Verma" value={alertForm.keyword} onChange={(e) => setAlertForm({...alertForm, keyword: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Subject Alert</label>
                <select className="form-control" value={alertForm.subject} onChange={(e) => setAlertForm({...alertForm, subject: e.target.value})}>
                  <option value="">Any Subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Author Alert</label>
                <input type="text" className="form-control" placeholder="e.g. Resnick Halliday" value={alertForm.author} onChange={(e) => setAlertForm({...alertForm, author: e.target.value})} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Max Price Limit</label>
                <input type="number" className="form-control" placeholder="Max Price ($)" value={alertForm.max_price} onChange={(e) => setAlertForm({...alertForm, max_price: e.target.value})} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '40px' }}>Create Alert 🔔</button>
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>Active Match Triggers</h3>
              {wishlists.filter(w => !w.book_id).map(w => (
                <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex gap-md" style={{ fontSize: '13px', flexWrap: 'wrap' }}>
                    {w.keyword && <span>🔑 Keyword: <strong>{w.keyword}</strong></span>}
                    {w.subject && <span>📚 Subject: <strong>{w.subject}</strong></span>}
                    {w.author && <span>✍️ Author: <strong>{w.author}</strong></span>}
                    {w.max_price && <span>💰 Max Price: <strong>${w.max_price}</strong></span>}
                    {w.query && <span>🔍 Query: <strong>{w.query}</strong></span>}
                  </div>
                  <button className="btn" style={{ border: 'none', color: 'var(--danger)', fontSize: '12px', fontWeight: 600 }} onClick={() => handleDeleteAlert(w.id)}>✕ Clear</button>
                </div>
              ))}
              {wishlists.filter(w => !w.book_id).length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontStyle: 'italic' }}>No alerts configured. Configure triggers above to monitor listings in real-time!</p>
              )}
            </div>
          </div>

          {/* Section 5: Book Recommendation Engine (Feature 6) */}
          <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
            <h2 style={{ marginBottom: '20px', fontWeight: 900 }}>Recommended For You</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Category A: Personalized Interest Alignments */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>Based on your interests</h3>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '6px' }}>
                  {recommendations.recommendedForYou.map(b => (
                    <div key={b.id} className="card" style={{ minWidth: '200px', width: '200px', padding: '12px', border: '1px solid var(--border)' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '2px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{b.title}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>${b.price}</p>
                      <button onClick={() => navigate(`/books`)} className="btn btn-outline" style={{ width: '100%', fontSize: '10px', padding: '4px', marginTop: '6px', color: 'white', borderColor: 'var(--border)' }}>Shop</button>
                    </div>
                  ))}
                  {recommendations.recommendedForYou.length === 0 && <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No interest alignments. Save search alerts to unlock interest recommendations!</p>}
                </div>
              </div>

              {/* Category B: Collaborative Peer recommendations */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>Students Also Viewed</h3>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '6px' }}>
                  {recommendations.studentsAlsoViewed.map(b => (
                    <div key={b.id} className="card" style={{ minWidth: '200px', width: '200px', padding: '12px', border: '1px solid var(--border)' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '2px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{b.title}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>${b.price}</p>
                      <button onClick={() => navigate(`/books`)} className="btn btn-outline" style={{ width: '100%', fontSize: '10px', padding: '4px', marginTop: '6px', color: 'white', borderColor: 'var(--border)' }}>Shop</button>
                    </div>
                  ))}
                  {recommendations.studentsAlsoViewed.length === 0 && <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No collaborative views history found.</p>}
                </div>
              </div>

              {/* Category C: College branch/Department recommendations */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)', marginBottom: '8px' }}>Popular in Your Department</h3>
                <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '6px' }}>
                  {recommendations.popularInDept.map(b => (
                    <div key={b.id} className="card" style={{ minWidth: '200px', width: '200px', padding: '12px', border: '1px solid var(--border)' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '2px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{b.title}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>${b.price}</p>
                      <button onClick={() => navigate(`/books`)} className="btn btn-outline" style={{ width: '100%', fontSize: '10px', padding: '4px', marginTop: '6px', color: 'white', borderColor: 'var(--border)' }}>Shop</button>
                    </div>
                  ))}
                  {recommendations.popularInDept.length === 0 && <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Set your College & Branch in your Profile page to see local departmental popular books!</p>}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}


    </div>
  );
};

export default BuyerDashboard;
