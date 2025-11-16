import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const getClientId = () =>
    import.meta.env?.VITE_GOOGLE_CLIENT_ID ||
    window.__GOOGLE_CLIENT_ID__ ||
    document.querySelector('meta[name="google-client-id"]')?.content ||
    null;

  // -------------------
  // Google login handler
  // -------------------
  const handleGoogleResponse = async (response) => {
    if (loggingIn) return;
    setLoggingIn(true);
    setError('');

    if (!response?.credential) {
      setError('Google sign-in failed (no credential).');
      setLoggingIn(false);
      return;
    }

    try {
      const res = await fetch('/auth/google', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError('Google login failed: ' + (data.error || res.status));
        setLoggingIn(false);
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Network error during Google login');
      setLoggingIn(false);
    }
  };

  // -------------------
  // Load Google SDK and initialize
  // -------------------
  useEffect(() => {
    const src = 'https://accounts.google.com/gsi/client';
    const clientId = getClientId();
    if (!clientId) {
      setError('Missing Google Client ID');
      return;
    }

    // Load SDK if not already loaded
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    // Poll until window.google.accounts.id is ready
    const initGoogle = () => {
      if (!window.google?.accounts?.id) return false;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });

      const el = document.getElementById('googleSignInDiv');
      if (el) {
        window.google.accounts.id.renderButton(el, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
        });
      }

      return true;
    };

    const pollTimer = setInterval(() => {
      if (initGoogle()) {
        clearInterval(pollTimer);
      }
    }, 50);

    return () => clearInterval(pollTimer);
  }, []);

  // -------------------
  // JSX
  // -------------------
  return (
    <div className="auth-container vibrant">
      <div className="auth-form card">
        <h2>Login with Google</h2>
        {error && <p className="error">{error}</p>}

        <div
          id="googleSignInDiv"
          style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}
        />
      </div>
    </div>
  );
};

export default Login;
