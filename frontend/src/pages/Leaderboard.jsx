// frontend/src/pages/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sellers');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await api.get('/transactions/leaderboard');
      setLeaderboard(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load leaderboards');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}><Loader /></div>;
  if (!leaderboard) return <div style={{ textAlign: 'center', padding: '60px' }}>Leaderboard data unavailable</div>;

  const getRankMedal = (rank, badge) => {
    if (badge === 'Platinum') return '🏆 Platinum';
    if (badge === 'Gold') return '🥇 Gold';
    if (badge === 'Silver') return '🥈 Silver';
    return '🥉 Bronze';
  };

  const getBadgeColor = (badge) => {
    if (badge === 'Platinum') return '#38BDF8'; // Sky blue
    if (badge === 'Gold') return '#F59E0B'; // Amber
    if (badge === 'Silver') return '#94A3B8'; // Slate
    return '#B45309'; // Bronze/amber-700
  };

  const currentList = 
    activeTab === 'sellers' ? leaderboard.topSellers :
    activeTab === 'swappers' ? leaderboard.topSwappers :
    leaderboard.mostActive;

  return (
    <div className="container" style={{ paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-xl)' }}>
      <header style={{ marginBottom: 'var(--space-xl)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '38px', fontWeight: 900, background: 'linear-gradient(to right, #6366f1, #3b82f6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
          Campus Leaderboard 🏆
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          See the top performing academic resource exchangers, sellers, and active listers!
        </p>
      </header>

      {/* Leaderboard Category Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('sellers')}
          className={`btn ${activeTab === 'sellers' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px 20px', borderRadius: '30px', color: activeTab === 'sellers' ? 'white' : 'var(--text-secondary)', borderColor: activeTab === 'sellers' ? 'var(--primary)' : 'var(--border)' }}
        >
          💰 Top Sellers
        </button>
        <button 
          onClick={() => setActiveTab('swappers')}
          className={`btn ${activeTab === 'swappers' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px 20px', borderRadius: '30px', color: activeTab === 'swappers' ? 'white' : 'var(--text-secondary)', borderColor: activeTab === 'swappers' ? 'var(--primary)' : 'var(--border)' }}
        >
          🔄 Top Swappers
        </button>

        <button 
          onClick={() => setActiveTab('active')}
          className={`btn ${activeTab === 'active' ? 'btn-primary' : 'btn-outline'}`}
          style={{ padding: '10px 20px', borderRadius: '30px', color: activeTab === 'active' ? 'white' : 'var(--text-secondary)', borderColor: activeTab === 'active' ? 'var(--primary)' : 'var(--border)' }}
        >
          🔥 Most Active Listers
        </button>
      </div>

      {/* Gamified Rankings board */}
      <div className="card animate-fade-in" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', maxWidth: '720px', margin: '0 auto', padding: 'var(--space-md)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {currentList.map((userRow, index) => (
            <div 
              key={userRow.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '12px',
                background: index === 0 ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                border: index === 0 ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid var(--border)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              className="leaderboard-row"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Ranking Position indicator */}
                <span style={{ fontSize: '16px', fontWeight: 900, color: index === 0 ? '#6366f1' : 'var(--text-secondary)', width: '24px' }}>
                  #{index + 1}
                </span>

                {/* Avatar */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: userRow.profile_pic ? `url(${userRow.profile_pic}) center/cover` : 'var(--primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '15px'
                }}>
                  {!userRow.profile_pic && userRow.name.charAt(0)}
                </div>

                <div>
                  <h4 style={{ margin: '0', fontSize: '15px', fontWeight: 800 }}>{userRow.name}</h4>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: getBadgeColor(userRow.rankBadge),
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {getRankMedal(index + 1, userRow.rankBadge)}
                  </span>
                </div>
              </div>

              {/* Ranks count results */}
              <div style={{ textAlign: 'right' }}>
                {activeTab === 'sellers' && (
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#10B981' }}>{userRow.completed_buys}</span>
                    <p style={{ margin: '0', fontSize: '10px', color: 'var(--text-secondary)' }}>Sales</p>
                  </div>
                )}
                {activeTab === 'swappers' && (
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#F59E0B' }}>{userRow.completed_swaps}</span>
                    <p style={{ margin: '0', fontSize: '10px', color: 'var(--text-secondary)' }}>Swaps</p>
                  </div>
                )}
                {activeTab === 'rated' && (
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#F59E0B' }}>⭐ {userRow.avg_rating}</span>
                    <p style={{ margin: '0', fontSize: '10px', color: 'var(--text-secondary)' }}>{userRow.reviews_count} reviews</p>
                  </div>
                )}
                {activeTab === 'active' && (
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#8B5CF6' }}>{userRow.listings_count}</span>
                    <p style={{ margin: '0', fontSize: '10px', color: 'var(--text-secondary)' }}>Listings</p>
                  </div>
                )}
              </div>

            </div>
          ))}

          {currentList.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
              No campus records found. Be the first to rank here! 🌟
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
