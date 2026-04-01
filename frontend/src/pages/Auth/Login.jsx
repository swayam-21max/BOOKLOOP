// frontend/src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Credentials, 2: OTP
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, verifyLoginOTP } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await login({ email, password });
      if (data.requiresOTP) {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await verifyLoginOTP(email, otp);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>{step === 1 ? 'Login to your BOOKLOOP account' : 'Enter the verification code sent to your email'}</p>
        </div>

        {error && (
          <div className="error-banner" style={{ animation: 'shake 0.4s ease' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="e.g. alex@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: 'var(--space-md)' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Next Step'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOTPSubmit} className="auth-form" style={{ animation: 'fadeIn 0.5s ease' }}>
             <div className="form-group">
              <label>Verification Code (OTP)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="6-digit code" 
                maxLength="6"
                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }}
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                required 
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: 'var(--space-md)' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Login to Dashboard'}
            </button>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ width: '100%', marginTop: 'var(--space-sm)' }} 
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back to Login
            </button>
          </form>
        )}

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one for free</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
