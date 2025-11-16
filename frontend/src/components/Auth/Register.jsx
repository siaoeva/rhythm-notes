import React, { useState, useContext } from 'react';
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

    const handleGoogle = () => {
        window.open('/auth/google', '_blank');
    };

    return (
        <div className="auth-container vibrant">
            <form onSubmit={handleSubmit} className="auth-form card">
                <h2>Create account/Sign In</h2>
                {error && <p className="error">{error}</p>}
                <div className="form-row">
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Jane Doe"
                    />
                </div>
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
                        placeholder="Min. 8 characters"
                    />
                </div>
                <button type="submit" className="btn-submit">Register</button>


               {/*<div className="or">OR</div>

                <button type="button" className="btn-google" onClick={handleGoogle}>
                    Sign up with Google
                </button>
                */}

                <p className="auth-link">Already have an account? <a href="/login">Login</a></p>
            </form>
        </div>
    );
};

export default Register;