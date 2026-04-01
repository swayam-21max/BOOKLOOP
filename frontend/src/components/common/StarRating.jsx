// frontend/src/components/common/StarRating.jsx
import React from 'react';

const StarRating = ({ value, onChange, readOnly = false }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="star-rating flex gap-sm" style={{ fontSize: '24px', cursor: readOnly ? 'default' : 'pointer' }}>
      {stars.map((star) => (
        <span
          key={star}
          onClick={() => !readOnly && onChange(star)}
          style={{
            color: star <= value ? '#F59E0B' : 'var(--text-secondary)',
            transition: 'color 0.2s ease',
            opacity: star <= value ? 1 : 0.5
          }}
        >
          {star <= value ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

export default StarRating;
