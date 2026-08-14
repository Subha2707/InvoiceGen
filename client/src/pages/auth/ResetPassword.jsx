import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/constants';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (password !== confirm) {
      setStatus({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (password.length < 6) {
      setStatus({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      setStatus({ type: 'success', text: data.message || 'Password reset successful. Redirecting to login...' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setStatus({ type: 'error', text: getErrorMessage(err, 'Failed to reset password') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glassmorphism">
        <h2 className="auth-title">Set New Password</h2>
        {status && <div className={`alert alert-${status.type}`}>{status.text}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Reset Token</label>
            <input type="text" value={token} onChange={e => setToken(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary full-width" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <p className="auth-links">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;