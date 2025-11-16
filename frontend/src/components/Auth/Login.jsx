import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Auth.css';

const Login = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch {
            setError('Failed to log in. Please check your credentials.');
        }
    };

    const handleGoogle = () => {
        window.open('/auth/google', '_blank');
    };

    return (
        <div className="auth-container vibrant">
            <form onSubmit={handleSubmit} className="auth-form card">
                <h2>Welcome back</h2>
                {error && <p className="error">{error}</p>}
                <div className="form-row">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                    />
                </div>
                <div className="form-row">
                    <div className="password-label-row">
                        <label>Password</label>
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? '🙈 Hide' : '👁️ Show'}
                        </button>
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                    />
                </div>
                <button type="submit" className="btn-submit">Login</button>

{/* */}
                <div className="or">OR</div>

                <button type="button" className="btn-google" onClick={handleGoogle}>
                    Continue with Google
                </button>

                <p className="auth-link">Don't have an account? <a href="/register">Register</a></p>
            </form>
        </div>
    );
};

export default Login;