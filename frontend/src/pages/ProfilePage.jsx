import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const displayName = user?.name || user?.email?.split?.('@')?.[0] || 'Student';
    const email = user?.email || 'you@example.com';

    // Placeholder statistics / achievements (replace with real backend data)
    const stats = { streak: 3, level: 1, points: 4280 };
    const achievements = [
        { id: 1, title: 'Top 1% Global', pts: 1200, date: '2025-09-21' },
        { id: 2, title: 'Weekly Champ', pts: 800, date: '2025-10-02' },
        { id: 3, title: 'Completionist', pts: 500, date: '2025-11-03' },
        { id: 4, title: 'Puzzle Master', pts: 400, date: '2025-11-10' },
        { id: 5, title: 'Speed Typist', pts: 238, date: '2025-11-12' },
    ];

    const handleLogout = () => {
        logout?.();
        navigate('/login');
    };

    const handleDelete = () => {
        if (window.confirm('Delete your account and all data? This cannot be undone.')) {
            // placeholder: call backend delete endpoint here
            logout?.();
            navigate('/');
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <section className="profile-top">
                    <div className="profile-card">
                        <div className="profile-avatar">{(displayName[0] || 'S').toUpperCase()}</div>
                        <div className="profile-details">
                            <h1 className="profile-name">{displayName}</h1>
                            <p className="profile-email">{email}</p>
                        </div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">Current Streak</div>
                            <div className="stat-value">{stats.streak} days</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Level</div>
                            <div className="stat-value">Level {stats.level}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Points</div>
                            <div className="stat-value">{stats.points.toLocaleString()}</div>
                        </div>
                    </div>
                </section>

                <section className="achievements-card">
                    <div className="ach-header">
                        <h2>Achievements</h2>
                        <p className="ach-sub">Competitive points and badges you've earned</p>
                    </div>

                    <div className="ach-list">
                        {achievements.map(a => (
                            <div className="ach-item" key={a.id}>
                                <div className="ach-left">
                                    <div className="ach-badge" style={{ background: `linear-gradient(90deg,#7c3aed,#06b6d4)` }}>
                                        ⭐
                                    </div>
                                    <div>
                                        <div className="ach-title">{a.title}</div>
                                        <div className="ach-date muted">{a.date}</div>
                                    </div>
                                </div>
                                <div className="ach-pts">+{a.pts} pts</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="account-actions">
                    <div className="actions-left">
                        <h3>Account</h3>
                        <p className="muted">Manage session and privacy</p>
                    </div>
                    <div className="actions-right">
                        <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
                        <button className="btn btn-danger" onClick={handleDelete}>Delete Account</button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProfilePage;