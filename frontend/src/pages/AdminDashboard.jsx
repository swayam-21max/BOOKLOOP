import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import bookService from '../services/bookService';
import ratingService from '../services/ratingService';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
import StatsCard from '../components/admin/StatsCard';
import ApprovalCard from '../components/admin/ApprovalCard';
import UserCard from '../components/admin/UserCard';
import Loader from '../components/common/Loader';
import '../styles/admin.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [pendingBooks, setPendingBooks] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsData, booksData, usersData] = await Promise.all([
        adminService.getStats(),
        bookService.getPendingBooks(),
        adminService.getUsers()
      ]);
      setStats(statsData);
      setPendingBooks(booksData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      // Fallback: at least try to set empty state if one fails
      if (!pendingBooks.length) setPendingBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await bookService.updateBookStatus(id, 'approved');
      setPendingBooks(prev => prev.filter(b => b.id !== id));
      // Refresh stats
      const newStats = await adminService.getStats();
      setStats(newStats);
    } catch (err) {
      alert('Failed to approve book');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await bookService.updateBookStatus(id, 'rejected');
      setPendingBooks(prev => prev.filter(b => b.id !== id));
      // Refresh stats
      const newStats = await adminService.getStats();
      setStats(newStats);
    } catch (err) {
      alert('Failed to reject book');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await ratingService.deleteRating(id);
      setAllReviews(prev => prev.filter(r => r.id !== id));
      alert('Review deleted');
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const renderDashboard = () => (
    <div className="animate-fade-in">
      <div className="admin-section-header">
        <h2 style={{ fontSize: '24px' }}>Overview</h2>
        <button className="admin-btn admin-btn-outline" onClick={fetchAllData} style={{ width: 'auto' }}>
          🔄 Refresh Data
        </button>
      </div>
      
      <div className="stats-grid">
        <StatsCard label="Total Users" value={stats?.totalUsers || 0} icon="👥" color="var(--admin-primary)" />
        <StatsCard label="Total Books" value={stats?.totalBooks || 0} icon="📚" color="var(--admin-success)" />
        <StatsCard label="Pending Approvals" value={stats?.pendingApprovals || 0} icon="⏳" color="var(--admin-warning)" />
        <StatsCard label="Completed Trades" value={stats?.completedTrades || 0} icon="🤝" color="var(--admin-primary)" />
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <h3>Recent Book Approvals</h3>
          <button className="admin-btn admin-btn-outline" onClick={() => setActiveSection('approvals')} style={{ width: 'auto' }}>
            View All
          </button>
        </div>
        <div className="data-grid">
          {pendingBooks.slice(0, 3).map(book => (
            <ApprovalCard 
              key={book.id} 
              book={book} 
              onApprove={handleApprove} 
              onReject={handleReject}
              processingId={processingId}
            />
          ))}
          {pendingBooks.length === 0 && <p className="admin-text-secondary">No pending books to approve.</p>}
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="animate-fade-in">
      <div className="admin-section-header">
        <h2 style={{ fontSize: '24px' }}>Book Approval Queue</h2>
        <span>{pendingBooks.length} items pending</span>
      </div>
      <div className="data-grid">
        {pendingBooks.map(book => (
          <ApprovalCard 
            key={book.id} 
            book={book} 
            onApprove={handleApprove} 
            onReject={handleReject}
            processingId={processingId}
          />
        ))}
        {pendingBooks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', gridColumn: '1/-1' }}>
            <p style={{ fontSize: '48px' }}>🎉</p>
            <h3>All caught up!</h3>
            <p className="admin-text-secondary">No books waiting for approval.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="animate-fade-in">
      <div className="admin-section-header">
        <h2 style={{ fontSize: '24px' }}>User Management</h2>
        <span>{users.length} total users</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {users.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );



  const renderAnalytics = () => (
    <div className="animate-fade-in">
      <div className="admin-section-header">
        <h2 style={{ fontSize: '24px' }}>Category Analytics</h2>
      </div>
      <div className="analytics-chart">
        <h3 style={{ marginBottom: '24px' }}>Books per Subject</h3>
        {stats?.analytics?.booksPerSubject.map(item => {
          const percentage = stats.totalBooks > 0 ? (item.count / stats.totalBooks) * 100 : 0;
          return (
            <div key={item.name} className="chart-row">
              <div className="chart-label">{item.name}</div>
              <div className="chart-bar-container">
                <div className="chart-bar" style={{ width: `${percentage}%` }}></div>
              </div>
              <div className="chart-value">{item.count}</div>
            </div>
          );
        })}
        {stats?.analytics?.booksPerSubject.length === 0 && <p>No data available.</p>}
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--admin-border)' }}>
          <p><strong>Total Platform Requests:</strong> {stats?.analytics?.totalRequests || 0}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-layout">
      <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="admin-main">
        <AdminNavbar />
        
        <div className="admin-content">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
              <Loader />
            </div>
          ) : (
            <>
              {activeSection === 'dashboard' && renderDashboard()}
              {activeSection === 'approvals' && renderApprovals()}
              {activeSection === 'users' && renderUsers()}
              {activeSection === 'analytics' && renderAnalytics()}

            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
