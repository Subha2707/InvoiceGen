import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/constants';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setStatus({ type: 'success', text: data.message || 'Password reset email sent. Check your inbox.' });
    } catch (err) {
      setStatus({ type: 'error', text: getErrorMessage(err, 'Failed to send reset email') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glassmorphism">
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">Enter your email to receive a reset token</p>
        {status && <div className={`alert alert-${status.type}`}>{status.text}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary full-width" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <p className="auth-links">
          Remembered your password? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;