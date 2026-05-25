// frontend/src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import profileService from '../services/profileService';
import authService from '../services/authService';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import '../styles/profile.css';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    location: '',
    college: '',
    branch: '',
    semester: '',
    bio: ''
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await profileService.getProfile(id);
      setProfile(data);
      setEditForm({
        name: data.user.name || '',
        location: data.user.location || '',
        college: data.user.college || '',
        branch: data.user.branch || '',
        semester: data.user.semester || '',
        bio: data.user.bio || ''
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicClick = () => {
    if (currentUser?.id === profile?.user?.id) {
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
      setProfile(prev => ({
        ...prev,
        user: { ...prev.user, profile_pic: response.user.profile_pic }
      }));
      toast.success('Avatar updated successfully!');
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await profileService.updateProfile(editForm);
      setProfile(prev => ({
        ...prev,
        user: { ...prev.user, ...response.user }
      }));
      setIsEditing(false);
      toast.success('Profile details saved! ✨');
    } catch (err) {
      toast.error('Failed to update details');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Loader /></div>;
  if (!profile) return <div className="container" style={{ textAlign: 'center', padding: '60px' }}>User not found</div>;

  const { user, reputation, stats, reviews } = profile;
  const isOwner = currentUser?.id === user.id;

  // Badge Color Style helper
  const getBadgeColor = (badge) => {
    if (badge === 'Elite Seller') return '#3b82f6'; // Indigo/blue
    if (badge === 'Trusted Seller') return '#10B981'; // Green
    if (badge === 'Verified Seller') return '#8B5CF6'; // Purple
    return '#94a3b8'; // Grey
  };

  return (
    <div className="container profile-container" style={{ paddingTop: 'var(--space-lg)', paddingBottom: 'var(--space-xl)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 'var(--space-lg)' }}>
        
        {/* Sidebar Info Card (Aesthetics + Badges) */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', textAlign: 'center', position: 'relative' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            
            {/* Clickable Profile Image */}
            <div 
              className="avatar-container"
              onClick={handleProfilePicClick}
              style={{ 
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                margin: '0 auto 16px',
                cursor: isOwner ? 'pointer' : 'default',
                background: user.profile_pic ? `url(${user.profile_pic}) center/cover no-repeat` : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                fontWeight: 900,
                color: 'white',
                position: 'relative',
                border: '4px solid var(--border)',
                overflow: 'hidden'
              }}
            >
              {!user.profile_pic && user.name.charAt(0)}
              {isOwner && (
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  background: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  fontSize: '11px',
                  padding: '2px 0',
                  textAlign: 'center'
                }}>
                  {uploading ? '...' : 'UPLOAD'}
                </div>
              )}
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0' }}>{user.name}</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              {user.role}
            </p>

            {/* Seller Reputation Badge (Feature 2) */}
            <div style={{
              display: 'inline-block',
              background: `rgba(255,255,255,0.03)`,
              border: `1px solid ${getBadgeColor(reputation.badge)}`,
              color: getBadgeColor(reputation.badge),
              fontSize: '12px',
              fontWeight: 'bold',
              borderRadius: '20px',
              padding: '4px 14px',
              marginBottom: '16px'
            }}>
              ✓ {reputation.badge}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '13px', textAlign: 'left' }}>
              <div>📍 <strong>Location:</strong> {user.location || 'Not set'}</div>
              <div>🏫 <strong>College:</strong> {user.college || 'Not set'}</div>
              <div>📖 <strong>Branch:</strong> {user.branch || 'Not set'}</div>
              <div>🎓 <strong>Semester:</strong> {user.semester || 'Not set'}</div>
              {user.bio && (
                <div style={{ fontStyle: 'italic', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px', marginTop: '4px' }}>
                  "{user.bio}"
                </div>
              )}
            </div>

            {isOwner && !isEditing && (
              <button 
                className="btn btn-outline" 
                style={{ width: '100%', marginTop: '16px', color: 'white', borderColor: 'var(--border)' }} 
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile Info
              </button>
            )}
          </div>

          {/* Trust Score reputation card */}
          <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0' }}>Reputation Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              <div className="flex justify-between">
                <span>Successful Transactions</span>
                <span style={{ color: 'white', fontWeight: 600 }}>{reputation.successfulTransactions}</span>
              </div>
              <div className="flex justify-between">
                <span>Chat Response Rate</span>
                <span style={{ color: 'white', fontWeight: 600 }}>{reputation.responseRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Account Age (Days)</span>
                <span style={{ color: 'white', fontWeight: 600 }}>{reputation.accountAgeDays} days</span>
              </div>
              <div style={{ marginTop: '8px' }}>
                <div className="flex justify-between" style={{ marginBottom: '2px' }}>
                  <span>Trust Score Index</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{reputation.score} / 100</span>
                </div>
                <div style={{ background: 'var(--border)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--primary)', width: `${reputation.score}%`, height: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Edit profile form and listed statistics */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {isEditing ? (
            <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <h2 style={{ marginBottom: '16px', fontWeight: 800 }}>Edit Campus Profile</h2>
              
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" className="form-control" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Hostel / Location</label>
                    <input type="text" className="form-control" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label>College Campus</label>
                    <input type="text" className="form-control" placeholder="e.g. Stanford University" value={editForm.college} onChange={(e) => setEditForm({...editForm, college: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Department / Branch</label>
                    <input type="text" className="form-control" placeholder="e.g. Computer Science" value={editForm.branch} onChange={(e) => setEditForm({...editForm, branch: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Current Semester</label>
                    <input type="text" className="form-control" placeholder="e.g. 5th" value={editForm.semester} onChange={(e) => setEditForm({...editForm, semester: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Short Biography</label>
                  <textarea className="form-control" style={{ minHeight: '80px', fontFamily: 'inherit' }} placeholder="Tell other students about yourself..." value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" className="btn btn-outline" style={{ color: 'white', borderColor: 'var(--border)' }} onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Details</button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Profile statistics counts card */}
              <div className="card" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', padding: '24px 0' }}>
                <div style={{ borderRight: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: 'white' }}>{stats.listedBooks}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Books Listed</div>
                </div>
                <div style={{ borderRight: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--success)' }}>{stats.soldBooks}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Books Sold</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#F59E0B' }}>{stats.swappedBooks}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Books Swapped</div>
                </div>
              </div>


            </>
          )}
        </main>

      </div>
    </div>
  );
};

export default Profile;
