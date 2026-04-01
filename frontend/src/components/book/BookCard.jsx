// frontend/src/components/book/BookCard.jsx
import React from 'react';

const BookCard = ({ book, onAction, actionLabel, showRequests = false, onDelete }) => {
  const { title, subject, class: className, price, status, location, seller_name, request_count, images } = book;
  const imageUrl = images && images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=400';

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)' }}>
      <div style={{ position: 'relative', height: '220px' }}>
        <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
          <span className={`badge badge-${status}`}>{status}</span>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(book.id); }}
              style={{ background: 'rgba(239, 68, 68, 0.8)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', fontWeight: 700 }}
            >
              DELETE
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: 'var(--space-lg)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{className} • {subject}</span>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px', lineHeight: '1.4' }}>{title}</h3>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div className="flex justify-between align-center" style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>${price}</span>
            {showRequests && request_count > 0 && (
              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>🔥 {request_count} REQUESTS</span>
            )}
          </div>

          <div className="flex align-center gap-sm" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            <span>📍 {location}</span>
          </div>

          <button
            onClick={() => onAction(book)}
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px' }}
          >
            {actionLabel || 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
