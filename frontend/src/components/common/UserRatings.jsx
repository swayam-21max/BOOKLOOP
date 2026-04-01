// frontend/src/components/common/UserRatings.jsx
import React, { useState, useEffect } from 'react';
import ratingService from '../../services/ratingService';
import StarRating from './StarRating';
import Loader from './Loader';

const UserRatings = ({ userId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, [userId]);

  const fetchRatings = async () => {
    try {
      const result = await ratingService.getUserRatings(userId);
      setData(result);
    } catch (err) {
      console.error('Error fetching ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!data) return <p style={{ color: 'var(--text-secondary)' }}>No ratings found.</p>;

  return (
    <div className="user-ratings">
      <div className="card flex align-center justify-between" style={{ marginBottom: 'var(--space-xl)', padding: 'var(--space-lg)' }}>
        <div>
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trust Score</h3>
          <div className="flex align-center gap-md" style={{ marginTop: 'var(--space-sm)' }}>
            <span style={{ fontSize: '36px', fontWeight: 800 }}>{data.stats.averageRating}</span>
            <div className="flex" style={{ flexDirection: 'column' }}>
              <StarRating value={Math.round(data.stats.averageRating)} readOnly={true} />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Based on {data.stats.totalCount} reviews</span>
            </div>
          </div>
        </div>
      </div>

      <div className="reviews-list flex" style={{ flexDirection: 'column', gap: 'var(--space-md)' }}>
        <h3 style={{ marginBottom: 'var(--space-sm)' }}>Recent Reviews</h3>
        {data.reviews.map((review) => (
          <div key={review.id} className="card review-card" style={{ padding: 'var(--space-md)', background: 'var(--glass-bg)' }}>
            <div className="flex justify-between align-center" style={{ marginBottom: 'var(--space-sm)' }}>
              <span style={{ fontWeight: 600 }}>{review.reviewer_name}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            <StarRating value={review.rating} readOnly={true} />
            {review.comment && (
              <p style={{ marginTop: 'var(--space-sm)', fontSize: '14px', lineHeight: '1.6' }}>
                {review.comment}
              </p>
            )}
          </div>
        ))}
        {data.reviews.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No written reviews yet.</p>}
      </div>
    </div>
  );
};

export default UserRatings;
