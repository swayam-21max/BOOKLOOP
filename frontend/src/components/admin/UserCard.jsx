// frontend/src/components/admin/UserCard.jsx
import React, { useState } from 'react';

const UserCard = ({ user, onBan, onSuspend, onActivate, onResetPassword }) => {
  const [newPassword, setNewPassword] = useState('');
  const [showReset, setShowReset] = useState(false);

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    onResetPassword(user.id, newPassword);
    setNewPassword('');
    setShowReset(false);
  };

  // Color mappings
  const getStatusColor = (status) => {
    if (status === 'banned') return '#EF4444'; // Red
    if (status === 'suspended') return '#F59E0B'; // Orange
    return '#10B981'; // Green
  };

  return (
    <div className="user-card card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div className="user-avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800 }}>
          {getInitials(user.name)}
        </div>
        
        <div className="user-info" style={{ flex: 1 }}>
          <div className="user-name" style={{ fontSize: '16px', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user.name}
            <span style={{ fontSize: '11px', background: getStatusColor(user.status || 'active'), color: 'white', padding: '1px 8px', borderRadius: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
              {user.status || 'active'}
            </span>
          </div>
          <div className="user-email" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user.email}</div>
          <div style={{ marginTop: '4px', fontSize: '12px', display: 'flex', gap: '12px' }}>
            <span>🔑 Role: <strong>{user.role}</strong></span>
            <span>📍 Campus: <strong>{user.location || 'Not set'}</strong></span>
            {user.college && <span>🏫 College: <strong>{user.college}</strong></span>}
          </div>
        </div>

        {/* Administration Trigger Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(user.status === 'suspended' || user.status === 'banned') ? (
            <button 
              className="btn btn-outline" 
              style={{ padding: '6px 12px', fontSize: '11px', color: '#10B981', borderColor: '#10B981' }}
              onClick={() => onActivate(user.id)}
            >
              ✓ Activate
            </button>
          ) : (
            <>
              <button 
                className="btn btn-outline" 
                style={{ padding: '6px 12px', fontSize: '11px', color: '#F59E0B', borderColor: '#F59E0B' }}
                onClick={() => onSuspend(user.id)}
              >
                ⏸ Suspend
              </button>
              <button 
                className="btn" 
                style={{ padding: '6px 12px', fontSize: '11px', background: '#EF4444', color: 'white' }}
                onClick={() => onBan(user.id)}
              >
                🚫 Ban
              </button>
            </>
          )}

          <button 
            className="btn btn-outline" 
            style={{ padding: '6px 12px', fontSize: '11px', color: 'white', borderColor: 'var(--border)' }}
            onClick={() => setShowReset(!showReset)}
          >
            🔒 Reset PW
          </button>
        </div>
      </div>

      {/* Expandable Reset Password Panel */}
      {showReset && (
        <form onSubmit={handleResetSubmit} style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <input 
            type="password" 
            className="form-control" 
            placeholder="Enter new secure password (min 6 chars)..." 
            style={{ flex: 1, padding: '6px 10px', fontSize: '13px' }}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }}>Apply</button>
          <button type="button" className="btn" style={{ padding: '6px 12px', fontSize: '11px', border: '1px solid var(--border)', color: 'white' }} onClick={() => setShowReset(false)}>Cancel</button>
        </form>
      )}

    </div>
  );
};

export default UserCard;
