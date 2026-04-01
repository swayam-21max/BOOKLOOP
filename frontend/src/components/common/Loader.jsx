import React from 'react';

const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
    <div className="spinner" style={{ 
      width: '40px', 
      height: '40px', 
      border: '4px solid #f3f3f3', 
      borderTop: '4px solid var(--primary)', 
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default Loader;
