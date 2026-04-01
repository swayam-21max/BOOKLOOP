import React from 'react';

const UserCard = ({ user }) => {
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <div className="user-card animate-fade-in">
      <div className="user-avatar">
        {getInitials(user.name)}
      </div>
      <div className="user-info">
        <div className="user-name">{user.name}</div>
        <div className="user-email">{user.email}</div>
        <div style={{ marginTop: '4px' }}>
          <span className={`role-badge role-${user.role}`}>
            {user.role}
          </span>
          <span style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
            {user.location}
          </span>
        </div>
      </div>
      <button className="admin-btn admin-btn-outline" style={{ flex: '0 0 auto', padding: '6px 12px' }}>
        Details
      </button>
    </div>
  );
};

export default UserCard;
