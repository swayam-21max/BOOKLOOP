// frontend/src/pages/Auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
    location: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      const msg = err.code === 'ECONNABORTED' 
        ? 'Request timed out. Registration is taking longer than expected.' 
        : (err.response?.data?.message || 'Registration failed');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <h2>Join BOOKLOOP</h2>
          <p>The premium circular marketplace for students</p>
        </div>

        {error && (
          <div className="error-banner" style={{ animation: 'shake 0.4s ease' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="name" 
              className="form-control" 
              placeholder="Alex Smith" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              className="form-control" 
              placeholder="yours@university.edu" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label>Role</label>
              <select name="role" className="form-control" onChange={handleChange} value={formData.role}>
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>
            <div className="form-group">
              <label>Location</label>
              <input 
                type="text" 
                name="location" 
                className="form-control" 
                value={formData.location} 
                onChange={handleChange} 
                placeholder="Hostel 4, Campus" 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', marginTop: 'var(--space-md)' }} 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
