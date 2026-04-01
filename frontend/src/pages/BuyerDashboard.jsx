import React, { useState, useEffect } from 'react';
import requestService from '../services/requestService';
import Loader from '../components/common/Loader';
import { Link } from 'react-router-dom';
import RatingModal from '../components/common/RatingModal';

const BuyerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingTarget, setRatingTarget] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await requestService.getMyRequests();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--space-xl) 0' }}>
      <header style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: '32px' }}>Buyer Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track your book requests and purchase history.</p>
      </header>

      {loading ? (
        <Loader />
      ) : (
        <div className="card">
          <h2 style={{ marginBottom: 'var(--space-md)' }}>My Requests</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px' }}>Book Title</th>
                  <th style={{ padding: '12px' }}>Seller</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px' }}>{req.book_title}</td>
                    <td style={{ padding: '12px' }}>{req.seller_name}</td>
                    <td style={{ padding: '12px' }}>${req.book_price}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge badge-${req.status}`}>{req.status}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {req.status === 'accepted' && (
                        <div className="flex gap-sm">
                          <Link to="/chat" className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '10px' }}>Chat</Link>
                          <button 
                            className="btn btn-outline" 
                            style={{ padding: '4px 8px', fontSize: '10px', border: '1px solid var(--border)' }}
                            onClick={() => setRatingTarget({ requestId: req.id, name: req.seller_name })}
                          >
                            Rate Seller
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      You haven't made any requests yet. <Link to="/" style={{ color: 'var(--primary)' }}>Go to Marketplace</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
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

export default BuyerDashboard;
