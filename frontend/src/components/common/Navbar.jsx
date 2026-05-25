// frontend/src/components/common/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { connectSocket, getSocket } from '../../socket/socketClient';
import notificationService from '../../services/notificationService';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch initial notifications and hook up real-time socket events
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();

    // Hook up socket
    const socket = connectSocket();
    if (socket) {
      socket.on('new_notification', (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        toast(notification.message, {
          icon: '🔔',
          duration: 4000,
          style: {
            background: 'rgba(99, 102, 241, 0.9)',
            color: '#fff',
            fontWeight: '600'
          }
        });
      });
    }

    return () => {
      const activeSocket = getSocket();
      if (activeSocket) {
        activeSocket.off('new_notification');
      }
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      toast.error('Failed to mark read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleDeleteNotif = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Deleted notification');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleNotificationClick = (notif) => {
    setShowNotifDropdown(false);
    notificationService.markAsRead(notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
    );

    // Contextual Routing
    if (notif.type === 'New Message') {
      navigate('/chat');
    } else if (notif.type.includes('Request')) {
      if (user.role === 'seller') {
        navigate('/seller-dashboard');
      } else {
        navigate('/buyer-dashboard');
      }
    } else {
      navigate('/books');
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container flex align-center justify-between">
        <Link to="/" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>BOOKLOOP</Link>

        <div className="navbar-nav-links">
          <Link to="/books">Marketplace</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/about">About</Link>
          {user ? (
            <>
              {user.role === 'seller' && <Link to="/seller-dashboard">Seller Dashboard</Link>}
              {user.role === 'buyer' && <Link to="/buyer-dashboard">Buyer Dashboard</Link>}
              {user.role === 'admin' && <Link to="/admin-dashboard">Admin Dashboard</Link>}
              <Link to="/chat">Messages</Link>

              {/* Real-time Notification Bell Icon dropdown */}
              <div className="notification-bell-container" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  className="notification-bell-btn"
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  style={{ position: 'relative', fontSize: '20px', color: 'var(--text-primary)', padding: '5px' }}
                >
                  🔔
                  {unreadCount > 0 && (
                    <span className="notification-count-badge" style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-4px',
                      background: 'var(--danger)',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                      padding: '2px 6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Glassmorphism Dropdown */}
                {showNotifDropdown && (
                  <div className="notification-dropdown card" style={{
                    position: 'absolute',
                    top: '40px',
                    right: '0',
                    width: '320px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: '1500',
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid var(--glass-border)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
                    borderRadius: '12px',
                    padding: '12px'
                  }}>
                    <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '8px' }}>
                      <h4 style={{ margin: '0', color: 'var(--text-primary)' }}>Notifications</h4>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600' }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                        No new notifications 🌟
                      </div>
                    ) : (
                      <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              background: notif.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.1)',
                              borderLeft: notif.is_read ? '3px solid transparent' : '3px solid var(--primary)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              transition: 'background 0.2s',
                              position: 'relative'
                            }}
                            className="notification-item"
                          >
                            <div className="flex justify-between" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                              <span style={{ color: 'var(--text-primary)' }}>{notif.title}</span>
                              <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>
                                {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0', paddingRight: '20px', lineHeight: '1.4' }}>
                              {notif.message}
                            </p>
                            
                            {/* Controls */}
                            <div className="flex gap-sm justify-end" style={{ marginTop: '4px' }}>
                              {!notif.is_read && (
                                <button
                                  onClick={(e) => handleMarkAsRead(notif.id, e)}
                                  style={{ fontSize: '10px', color: 'var(--success)' }}
                                >
                                  ✓ Read
                                </button>
                              )}
                              <button
                                onClick={(e) => handleDeleteNotif(notif.id, e)}
                                style={{ fontSize: '10px', color: 'var(--danger)' }}
                              >
                                ✕ Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
              <button onClick={handleLogout} className="btn btn-primary" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
