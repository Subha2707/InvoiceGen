import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/ui/Loader';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { oauthComplete } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    if (!token) {
      navigate('/login?error=google_auth_failed', { replace: true });
      return;
    }

    oauthComplete(token)
      .then(() => {
        window.history.replaceState({}, document.title, '/auth/google');
        navigate('/', { replace: true });
      })
      .catch(() => {
        navigate('/login?error=google_auth_failed', { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card glassmorphism">
        <h2 className="auth-title">Signing you in...</h2>
        <p className="auth-subtitle">Please wait while we complete your Google login.</p>
        <Loader />
      </div>
    </div>
  );
};

export default GoogleCallback;