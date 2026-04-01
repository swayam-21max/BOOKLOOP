// frontend/src/components/common/RatingModal.jsx
import React, { useState } from 'react';
import StarRating from './StarRating';
import ratingService from '../../services/ratingService';

const RatingModal = ({ requestId, onClose, onSuccess, otherPartyName }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await ratingService.submitRating({
        request_id: requestId,
        rating,
        comment
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="card modal-content" style={{ maxWidth: '450px', width: '90%' }}>
        <h2 style={{ marginBottom: 'var(--space-md)' }}>Rate your trade with {otherPartyName}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
          Help others in the community by sharing your experience.
        </p>

        <form onSubmit={handleSubmit} className="flex" style={{ flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="flex" style={{ flexDirection: 'column', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <label style={{ fontWeight: 600 }}>Your Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className="form-group">
            <label>Review (Optional)</label>
            <textarea
              className="form-control"
              style={{ minHeight: '100px', resize: 'vertical' }}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was the book condition? Was the exchange smooth?"
            ></textarea>
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '14px', textAlign: 'center' }}>{error}</p>}

          <div className="flex gap-md" style={{ marginTop: 'var(--space-md)' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              style={{ flex: 1, border: '1px solid var(--border)' }}
            >
              Skip
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ flex: 1 }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
