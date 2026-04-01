import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar" style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '15px 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      color: 'var(--text-primary)'
    }}>
      <div className="container flex align-center justify-between">
        <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '-0.02em' }}>BOOKLOOP</Link>

        <div className="flex align-center gap-md">
          <Link to="/">Marketplace</Link>
          <Link to="/about">About</Link>
          {user ? (
            <>
              {user.role === 'seller' && <Link to="/seller-dashboard">Seller Dashboard</Link>}
              {user.role === 'buyer' && <Link to="/buyer-dashboard">Buyer Dashboard</Link>}
              {user.role === 'admin' && <Link to="/admin-dashboard">Admin Dashboard</Link>}
              <Link to="/chat">Messages</Link>
              <span style={{ fontWeight: 600 }}>{user.name}</span>
              <button onClick={handleLogout} className="btn btn-primary" style={{ padding: '8px 16px' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
