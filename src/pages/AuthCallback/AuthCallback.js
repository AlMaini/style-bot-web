import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import './AuthCallback.css';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      // Check for errors from OAuth provider
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam) {
        setError(errorDescription || 'Authentication failed');
        setLoading(false);
        return;
      }

      // Get the authorization code
      const code = searchParams.get('code');

      if (!code) {
        setError('No authorization code received');
        setLoading(false);
        return;
      }

      try {
        // Send the code to backend to complete OAuth flow
        const response = await fetch(
          `${API_URL}/api/auth/callback?code=${code}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Authentication failed');
        }

        // Store tokens and user info
        login(data.access_token, data.refresh_token, {
          user_id: data.user_id,
          email: data.email,
        });

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="callback-container">
      <div className="callback-box">
        {loading ? (
          <>
            <div className="spinner"></div>
            <h2>Completing sign in...</h2>
          </>
        ) : (
          <>
            <h2>Authentication Error</h2>
            <div className="error">{error}</div>
            <button onClick={() => navigate('/login')}>
              Return to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;
