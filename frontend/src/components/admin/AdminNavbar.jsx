import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-title">Admin Panel - BOOKLOOP</div>
      <div className="admin-user-info">
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 600, fontSize: '14px' }}>{user?.name || 'Admin User'}</p>
          <p style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>System Administrator</p>
        </div>
        <button 
          onClick={handleLogout}
          className="admin-btn admin-btn-outline" 
          style={{ width: 'auto', padding: '8px 16px' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
