import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Dashboard.css';

const QUICK_FEATURES = [
    { to: '/upload', title: 'Upload Notes', desc: 'Add new study material', color: '#06b6d4', icon: '⬆️' },
    { to: '/notes', title: 'Flashcards', desc: 'Review & create cards', color: '#10b981', icon: '🃏' },
    { to: '/game', title: 'Rhythm Game', desc: 'Play & learn', color: '#7c3aed', icon: '🎵' },
    { to: '/game', title: 'Leaderboard', desc: 'View rankings', color: '#f59e0b', icon: '🏆' },
    { to: '/profile', title: 'Profile', desc: 'Your stats & rewards', color: '#ef6ab4', icon: '👤' },
    { to: '/game', title: 'Gacha Rewards', desc: 'Unlock new skins', color: '#00d4ff', icon: '🎁' },
    { to: '/collaborate', title: 'Collaborate', desc: 'Study with friends', color: '#008080', icon: '🫂' },
    { to: '/notes', title: 'Previous Notes', desc: 'Browse past materials', color: '#ff8000', icon: '⏰' },
    { to: '/music', title: 'Music Settings', desc: 'Manage your tracks', color: '#FF0000', icon: '🎶' },
];

const PRO_TIPS = [
    "Use the Rhythm Game with familiar songs — BPM sync improves your typing flow.",
    "Upload scanned notes and enable 'scan & solve' to auto-detect handwritten answers.",
    "Generate flashcards from summaries to turn passive reading into active recall.",
    "Invite classmates to collaborate on shared note decks for group study sessions.",
    "Use short 10s video clips for key concept snapshots — the AI extracts highlights."
];

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const displayName = user?.name || user?.email?.split?.('@')?.[0] || 'Student';

    const [tipIndex, setTipIndex] = useState(0);
    const nextTip = () => setTipIndex((i) => (i + 1) % PRO_TIPS.length);
    const prevTip = () => setTipIndex((i) => (i - 1 + PRO_TIPS.length) % PRO_TIPS.length);

    return (
        <div className="dashboard">
            <div className="dash-inner">
                <header className="dash-header">
                    <div className="avatar">{(displayName[0] || 'S').toUpperCase()}</div>
                    <div className="welcome">
                        <h1>Welcome back, {displayName}!</h1>
                        <p className="muted">Ready to level up your studies?</p>
                    </div>
                </header>

                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-label">Current Streak</div>
                        <div className="stat-value">0 days</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Level</div>
                        <div className="stat-value">Level 1</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Longest Streak</div>
                        <div className="stat-value">0 days</div>
                    </div>
                </div>

                <section className="quick-access">
                    <h2>Quick Access</h2>
                    <div className="quick-grid">
                        {QUICK_FEATURES.map((f) => (
                            <Link key={f.title} to={f.to} className="quick-card">
                                <div className="quick-icon" style={{ background: `${f.color}22`, color: f.color }}>
                                    <span className="emoji">{f.icon}</span>
                                </div>
                                <div className="quick-body">
                                    <div className="quick-title">{f.title}</div>
                                    <div className="quick-desc muted">{f.desc}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="protips">
                    <div className="protips-inner">
                        <div className="protips-header">
                            <h3>Pro Tip</h3>
                            <div className="protip-controls">
                                <button onClick={prevTip} aria-label="Previous tip" className="tiny-btn">◀</button>
                                <button onClick={nextTip} aria-label="Next tip" className="tiny-btn">▶</button>
                            </div>
                        </div>
                        <p className="protip-text">{PRO_TIPS[tipIndex]}</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;