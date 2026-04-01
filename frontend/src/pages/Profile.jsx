// frontend/src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import UserRatings from '../components/common/UserRatings';
import api from '../services/api';
import Loader from '../components/common/Loader';
import '../styles/profile.css'; // I'll assume this might exist or we can use inline styles

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/auth/user/${id}`);
        setUser(response.data);
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleProfilePicClick = () => {
    if (currentUser?.id === user?.id) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_pic', file);

    setUploading(true);
    try {
      const response = await authService.updateProfilePic(formData);
      setUser(prev => ({ ...prev, profile_pic: response.user.profile_pic }));
      alert('Profile picture updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile picture');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loader />;
  if (!user) return <div className="container" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>User not found</div>;

  const isOwner = currentUser?.id === user?.id;

  return (
    <div className="container profile-container">
      <div className="profile-card">
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*" 
          onChange={handleFileChange} 
        />
        
        <div 
          className="avatar-container"
          onClick={handleProfilePicClick}
          style={{ 
            background: user.profile_pic ? `url(${user.profile_pic}) center/cover no-repeat` : 'var(--primary)'
          }}
        >
          {!user.profile_pic && user.name.charAt(0)}
          
          {isOwner && (
            <div className="avatar-overlay">
              {uploading ? '...' : '📷'}
            </div>
          )}
        </div>
 
        <div className="profile-info">
          <h1>{user.name}</h1>
          <p className="role-badge">
            {user.role} • <span style={{ color: 'var(--text-secondary)', textTransform: 'none', fontWeight: 400 }}>Member since {new Date(user.created_at).getFullYear()}</span>
          </p>
          <p className="meta">📍 {user.location || 'No location set'}</p>
        </div>
      </div>
 
      <div className="ratings-section">
        <div className="section-header">
          <h2>Ratings & Reviews</h2>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Based on recent transactions</div>
        </div>
        <UserRatings userId={id} />
      </div>
    </div>
  );
};

export default Profile;

