// frontend/src/pages/Auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import '../../styles/auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await forgotPassword(email);
      setStep(2);
      setMessage(`A reset code has been sent to ${email}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await resetPassword(email, otp, newPassword);
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>{step === 1 ? 'Enter your email to receive a reset code' : 'Enter the code and your new password'}</p>
        </div>

        {error && (
          <div className="error-banner" style={{ animation: 'shake 0.4s ease' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {message && !error && (
          <div className="success-banner" style={{ 
            background: 'rgba(34, 197, 94, 0.1)', 
            border: '1px solid rgba(34, 197, 94, 0.2)', 
            color: '#4ade80', 
            padding: 'var(--space-md)', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: 'var(--space-lg)', 
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)'
          }}>
            <span>✅</span> {message}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit} className="auth-form">
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
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: 'var(--space-md)' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="auth-form" style={{ animation: 'fadeIn 0.5s ease' }}>
             <div className="form-group">
              <label>Verification Code</label>
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
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••"
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: 'var(--space-md)' }} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button 
              type="button" 
              className="btn btn-outline" 
              style={{ width: '100%', marginTop: 'var(--space-sm)' }} 
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Back
            </button>
          </form>
        )}

        <div className="auth-footer">
          Remembered your password? <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
