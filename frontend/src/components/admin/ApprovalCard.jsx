import React from 'react';

const ApprovalCard = ({ book, onApprove, onReject, processingId }) => {
  const isProcessing = processingId === book.id;

  return (
    <div className="admin-card animate-fade-in">
      <img 
        src={book.images?.[0] || 'https://via.placeholder.com/300x180?text=No+Image'} 
        alt={book.title} 
        className="admin-card-img" 
      />
      <div className="admin-card-content">
        <div className="flex justify-between" style={{ alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 className="admin-card-title">{book.title}</h3>
          <span style={{ fontWeight: 700, color: 'var(--admin-primary)', fontSize: '18px' }}>
            ${book.price}
          </span>
        </div>
        
        <div className="admin-card-details">
          <p><strong>Subject:</strong> {book.subject}</p>
          <p><strong>Class:</strong> {book.class}</p>
          <p><strong>Condition:</strong> {book.condition}</p>
          <p><strong>Seller:</strong> {book.seller_name}</p>
          <p><strong>Location:</strong> {book.location}</p>
        </div>
      </div>

      <div className="admin-card-footer">
        <button 
          className="admin-btn admin-btn-success"
          onClick={() => onApprove(book.id)}
          disabled={isProcessing}
        >
          {isProcessing ? '...' : '✅ Approve'}
        </button>
        <button 
          className="admin-btn admin-btn-danger"
          onClick={() => onReject(book.id)}
          disabled={isProcessing}
        >
          {isProcessing ? '...' : '❌ Reject'}
        </button>
      </div>
    </div>
  );
};

export default ApprovalCard;
