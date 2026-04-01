import React from 'react';

const AdminSidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'approvals', label: 'Book Approvals', icon: '📚' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-logo">
        <span style={{ fontSize: '24px' }}>📚</span>
        <span>BOOKLOOP </span>
      </div>
      <ul className="admin-sidebar-nav">
        {menuItems.map((item) => (
          <li key={item.id}>
            <button
              className={`admin-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
              style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
            >
              <span style={{ marginRight: '12px' }}>{item.icon}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <div style={{ padding: '0 24px', marginTop: 'auto' }}>
        <p style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
          Admin Panel v1.0
        </p>
      </div>
    </aside>
  );
};

export default AdminSidebar;
