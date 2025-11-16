import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const getClientId = () =>
    import.meta.env?.VITE_GOOGLE_CLIENT_ID ||
    window.__GOOGLE_CLIENT_ID__ ||
    document.querySelector('meta[name="google-client-id"]')?.content ||
    null;

  useEffect(() => {
    let pollTimer = null;
    const src = 'https://accounts.google.com/gsi/client';

    const loadSdkAndInit = (clientId) => {
      if (!clientId) return;
      if (!document.querySelector(`script[src="${src}"]`)) {
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.defer = true;
        s.onload = () => initGoogle(clientId);
        document.body.appendChild(s);
      } else {
        initGoogle(clientId);
      }
    };

    const initGoogle = (clientId) => {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
        });
        const el = document.getElementById('googleSignUpDiv');
        if (el) {
          window.google.accounts.id.renderButton(el, {
            theme: 'outline',
            size: 'large',
            type: 'standard'
          });
        }
      } catch (err) {
        console.warn('Google SDK init error:', err);
      }
    };

    const clientIdNow = getClientId();
    if (clientIdNow) {
      loadSdkAndInit(clientIdNow);
      return;
    }

    const start = Date.now();
    pollTimer = setInterval(() => {
      const cid = getClientId();
      if (cid) {
        loadSdkAndInit(cid);
        clearInterval(pollTimer);
      } else if (Date.now() - start > 3000) {
        clearInterval(pollTimer);
      }
    }, 250);

    return () => {
      if (pollTimer) clearInterval(pollTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, password);
      navigate('/dashboard');
    } catch {
      setError('Registration failed.');
    }
  };

  const handleGoogleResponse = async (response) => {
    setError('');
    if (!response || !response.credential) {
      setError('Google sign-up failed (no credential).');
      return;
    }

    try {
      const res = await fetch('/auth/google', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError('Google sign-up failed: ' + (data.error || res.status));
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Network error during Google sign-up');
    }
  };

  const handleGoogleClickFallback = () => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google SDK not loaded yet');
    }
  };

  return (
    <div className="auth-container vibrant">
      <form onSubmit={handleSubmit} className="auth-form card">
        <h2>Create account/Sign In</h2>
        {error && <p className="error">{error}</p>}
        <div className="form-row">
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Jane Doe" />
        </div>
        <div className="form-row">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
        </div>
        <div className="form-row">
          <div className="password-label-row">
            <label>Password</label>
            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? '🙈 Hide' : '👁️ Show'}
            </button>
          </div>
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min. 8 characters" />
        </div>
        <button type="submit" className="btn-submit">Register</button>

        <div className="or">OR</div>

        <div id="googleSignUpDiv" style={{ display: 'flex', justifyContent: 'center' }} />
{/*
        <button type="button" className="btn-google" onClick={handleGoogleClickFallback}>
          Sign up with Google
        </button>
        */}

        <p className="auth-link">Already have an account? <a href="/login">Login</a></p>
      </form>
    </div>
  );
};

export default Register;