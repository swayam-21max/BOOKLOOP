// frontend/src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import bookService from '../services/bookService';
import Loader from '../components/common/Loader';
import UserCard from '../components/admin/UserCard';
import ApprovalCard from '../components/admin/ApprovalCard';
import toast from 'react-hot-toast';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import '../styles/admin.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [pendingBooks, setPendingBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsData, booksData, usersData, reportsData] = await Promise.all([
        adminService.getStats(),
        bookService.getPendingBooks(),
        adminService.getUsers(),
        adminService.getReports()
      ]);
      setStats(statsData);
      setPendingBooks(booksData);
      setUsers(usersData);
      setReports(reportsData);
    } catch (err) {
      console.error('Error fetching admin dashboard details:', err);
      toast.error('Failed to load dashboard parameters');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await bookService.updateBookStatus(id, 'approved');
      setPendingBooks(prev => prev.filter(b => b.id !== id));
      toast.success('Listing approved successfully! 📚');
      
      const newStats = await adminService.getStats();
      setStats(newStats);
    } catch (err) {
      toast.error('Failed to approve listing');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await bookService.updateBookStatus(id, 'rejected');
      setPendingBooks(prev => prev.filter(b => b.id !== id));
      toast.success('Listing rejected/declined.');
      
      const newStats = await adminService.getStats();
      setStats(newStats);
    } catch (err) {
      toast.error('Failed to reject listing');
    } finally {
      setProcessingId(null);
    }
  };

  // User Actions (Feature 13)
  const handleBanUser = async (id) => {
    try {
      await adminService.banUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'banned' } : u));
      toast.success('User has been banned');
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleSuspendUser = async (id) => {
    try {
      await adminService.suspendUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'suspended' } : u));
      toast.success('User has been suspended');
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleActivateUser = async (id) => {
    try {
      await adminService.activateUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'active' } : u));
      toast.success('User account activated successfully! ✓');
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleResetPassword = async (id, newPassword) => {
    try {
      await adminService.resetPassword(id, newPassword);
      toast.success('Password updated successfully!');
    } catch (err) {
      toast.error('Password reset failed');
    }
  };

  // Flag Report Moderation Actions (Feature 14)
  const handleResolveReport = async (id, status) => {
    try {
      await adminService.updateReportStatus(id, status);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      toast.success(`Report resolved as ${status}`);
    } catch (err) {
      toast.error('Failed to resolve report');
    }
  };

  // Colors for Recharts (Feature 9)
  const COLORS = ['#6366f1', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  const renderDashboard = () => (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <div className="admin-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '0' }}>Platform Overview</h2>
        <button className="btn btn-outline" onClick={fetchAllData} style={{ color: 'white', borderColor: 'var(--border)' }}>
          🔄 Refresh
        </button>
      </div>
      
      {/* Overview Cards (Feature 9) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-md)' }}>
        <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Registered Users</div>
          <div style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px' }}>{stats?.overview?.totalUsers || 0}</div>
          <span style={{ fontSize: '11px', color: 'var(--success)' }}>👥 {stats?.overview?.activeUsers} Active now</span>
        </div>
        <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Listings Volume</div>
          <div style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px' }}>{stats?.overview?.totalBooks || 0}</div>
          <span style={{ fontSize: '11px', color: '#F59E0B' }}>⏳ {stats?.overview?.pendingBooks} Pending approval</span>
        </div>
        <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Swaps / Exchanges</div>
          <div style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px' }}>{stats?.overview?.booksSwapped || 0}</div>
          <span style={{ fontSize: '11px', color: 'var(--primary)' }}>🔄 Completed swaps</span>
        </div>
        <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Commision Revenue Est (5%)</div>
          <div style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px' }}>${stats?.overview?.revenueEstimate?.toFixed(2) || '0.00'}</div>
          <span style={{ fontSize: '11px', color: 'var(--success)' }}>💰 Total Transacted: ${stats?.overview?.totalVolume}</span>
        </div>
      </div>

      {/* Main Approval card */}
      <div className="admin-section card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
        <div className="flex justify-between align-center" style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: '0', fontWeight: 800 }}>Pending Listing Approvals</h3>
          <button className="btn" style={{ background: 'var(--primary)', color: 'white', padding: '6px 12px', fontSize: '11px' }} onClick={() => setActiveSection('approvals')}>
            View queue ({pendingBooks.length})
          </button>
        </div>
        <div className="data-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {pendingBooks.slice(0, 3).map(book => (
            <ApprovalCard 
              key={book.id} 
              book={book} 
              onApprove={handleApprove} 
              onReject={handleReject}
              processingId={processingId}
            />
          ))}
          {pendingBooks.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontStyle: 'italic' }}>No listings pending approval! All caught up! 🎉</p>}
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Listing Approval Queue</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
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
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'var(--glass-bg)' }}>
            <p style={{ fontSize: '48px', margin: '0' }}>🎉</p>
            <h3 style={{ marginTop: '12px' }}>Queue is empty!</h3>
            <p style={{ color: 'var(--text-secondary)' }}>All listed materials have been moderated successfully.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 800 }}>User Administration</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {users.map(u => (
          <UserCard 
            key={u.id} 
            user={u} 
            onBan={handleBanUser}
            onSuspend={handleSuspendUser}
            onActivate={handleActivateUser}
            onResetPassword={handleResetPassword}
          />
        ))}
      </div>
    </div>
  );

  // Flags & Moderator Reports Panel (Feature 14)
  const renderReports = () => (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Flagged Reports Queue</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {reports.map(rep => (
          <div key={rep.id} className="card animate-fade-in" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                  🚨 {rep.reason}
                </span>
                <span style={{ fontSize: '11px', marginLeft: '12px', background: rep.status === 'pending' ? '#F59E0B' : '#10B981', color: 'white', padding: '1px 8px', borderRadius: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  {rep.status}
                </span>
                
                <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '8px 0 4px' }}>
                  Reported Book: <strong style={{ color: 'white' }}>{rep.book_title || 'N/A'}</strong>
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0' }}>
                  Reporter: <strong>{rep.reporter_name}</strong> ({rep.reporter_email})
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 8px' }}>
                  Reported Seller: <strong>{rep.reported_user_name || 'N/A'}</strong>
                </p>
                <p style={{ fontSize: '13px', background: 'rgba(0,0,0,0.2)', border: '1px dashed var(--border)', borderRadius: '6px', padding: '10px', color: 'white', fontStyle: 'italic', margin: '8px 0 0' }}>
                  "{rep.description || 'No description provided'}"
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {rep.status === 'pending' && (
                  <>
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '11px', background: '#10B981' }}
                      onClick={() => handleResolveReport(rep.id, 'resolved')}
                    >
                      ✓ Resolve
                    </button>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '6px 12px', fontSize: '11px', color: 'white', borderColor: 'var(--border)' }}
                      onClick={() => handleResolveReport(rep.id, 'ignored')}
                    >
                      ✕ Ignore
                    </button>
                    
                    {rep.book_id && (
                      <button 
                        className="btn" 
                        style={{ padding: '6px 12px', fontSize: '11px', background: '#EF4444', color: 'white' }}
                        onClick={() => handleReject(rep.book_id)}
                      >
                        Decline Book Listing
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {reports.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '60px', background: 'var(--glass-bg)' }}>
            <p style={{ fontSize: '48px', margin: '0' }}>🌟</p>
            <h3 style={{ marginTop: '12px' }}>No content flags submitted</h3>
            <p style={{ color: 'var(--text-secondary)' }}>All platform materials are fully compliant.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Analytics charts rendering (Feature 9)
  const renderAnalytics = () => {
    if (!stats || !stats.charts) return <Loader />;

    const { topCategories, mostActiveSellers, popularSubjects, userTrend, transactionTrend } = stats.charts;

    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Marketplace Analytics</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-lg)' }}>
          
          {/* Chart 1: Monthly Signups Trend (Area Chart) */}
          <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>New User Signups (6M)</h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <AreaChart data={userTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid var(--border)', color: '#fff' }} />
                  <Area type="monotone" dataKey="Users" stroke="#6366f1" fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Transaction Trends - Buys vs Swaps (Line Chart / Bar Chart) */}
          <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>Completed Transactions</h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={transactionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid var(--border)', color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Buys" fill="#10B981" />
                  <Bar dataKey="Swaps" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Top Categories Listed (Pie Chart) */}
          <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>Listing Category Share</h3>
            <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {topCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid var(--border)', color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Most Active Sellers (Double Bar Chart) */}
          <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>Top Performing Sellers</h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={mostActiveSellers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid var(--border)', color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="listings" fill="#8B5CF6" name="Books Listed" />
                  <Bar dataKey="sold" fill="#3b82f6" name="Books Sold" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="container animate-fade-in" style={{ padding: 'var(--space-lg) 0' }}>
      <header style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: 900, 
          background: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>
          Administrator Control Center
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Manage campus listings, moderate users, resolve flags, and track real-time marketplace economics.
        </p>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Loader /></div>
      ) : (
        <div className="card" style={{ 
          background: 'var(--glass-bg)', 
          border: '1px solid var(--glass-border)', 
          display: 'grid', 
          gridTemplateColumns: '280px 1fr', 
          padding: '0', 
          overflow: 'hidden', 
          minHeight: '75vh', 
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)'
        }}>
          
          {/* Admin Sidebar Navigation */}
          <aside style={{ 
            borderRight: '1px solid var(--glass-border)', 
            padding: '24px', 
            background: 'rgba(15, 23, 42, 0.4)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px' 
          }}>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🛡️</span> Moderator Controls
            </div>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => setActiveSection('dashboard')}
                style={{ 
                  textAlign: 'left', 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  color: activeSection === 'dashboard' ? 'white' : 'var(--text-secondary)', 
                  background: activeSection === 'dashboard' ? 'rgba(99, 102, 241, 0.15)' : 'transparent', 
                  border: activeSection === 'dashboard' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  fontWeight: 600, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease'
                }}
              >
                📊 Overview Stats
              </button>
              <button 
                onClick={() => setActiveSection('approvals')}
                style={{ 
                  textAlign: 'left', 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  color: activeSection === 'approvals' ? 'white' : 'var(--text-secondary)', 
                  background: activeSection === 'approvals' ? 'rgba(99, 102, 241, 0.15)' : 'transparent', 
                  border: activeSection === 'approvals' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  fontWeight: 600, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease'
                }}
              >
                📚 Listings Queue ({pendingBooks.length})
              </button>
              <button 
                onClick={() => setActiveSection('users')}
                style={{ 
                  textAlign: 'left', 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  color: activeSection === 'users' ? 'white' : 'var(--text-secondary)', 
                  background: activeSection === 'users' ? 'rgba(99, 102, 241, 0.15)' : 'transparent', 
                  border: activeSection === 'users' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  fontWeight: 600, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease'
                }}
              >
                👥 User Manager
              </button>
              <button 
                onClick={() => setActiveSection('reports')}
                style={{ 
                  textAlign: 'left', 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  color: activeSection === 'reports' ? 'white' : 'var(--text-secondary)', 
                  background: activeSection === 'reports' ? 'rgba(99, 102, 241, 0.15)' : 'transparent', 
                  border: activeSection === 'reports' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  fontWeight: 600, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease'
                }}
              >
                🚨 Flag Reports ({reports.filter(r => r.status === 'pending').length})
              </button>
              <button 
                onClick={() => setActiveSection('analytics')}
                style={{ 
                  textAlign: 'left', 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  color: activeSection === 'analytics' ? 'white' : 'var(--text-secondary)', 
                  background: activeSection === 'analytics' ? 'rgba(99, 102, 241, 0.15)' : 'transparent', 
                  border: activeSection === 'analytics' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  fontWeight: 600, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease'
                }}
              >
                📈 Recharts Analytics
              </button>
            </nav>
          </aside>

          {/* Admin Main Content Panel */}
          <main style={{ 
            padding: '32px', 
            overflowY: 'auto', 
            maxHeight: '75vh',
            background: 'rgba(2, 6, 23, 0.2)'
          }}>
            {activeSection === 'dashboard' && renderDashboard()}
            {activeSection === 'approvals' && renderApprovals()}
            {activeSection === 'users' && renderUsers()}
            {activeSection === 'reports' && renderReports()}
            {activeSection === 'analytics' && renderAnalytics()}
          </main>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
