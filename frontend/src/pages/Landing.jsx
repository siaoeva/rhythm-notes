import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const features = [
    { title: 'Smart Summaries', desc: 'AI extracts key points, diagrams & highlights', color: '#ff7a7a', icon: '🧠' },
    { title: 'Flashcards', desc: 'Instant flashcards from your notes', color: '#7c3aed', icon: '📇' },
    { title: 'Rhythm Game', desc: 'Type to the beat & compete with friends', color: '#06b6d4', icon: '🎵' },
    { title: 'Scan & Solve', desc: 'Detect handwriting, mark answers for STEM', color: '#f59e0b', icon: '✍️' },
    { title: 'Collaboration', desc: 'Share, edit and learn together', color: '#10b981', icon: '🤝' },
    { title: 'Music Sync', desc: 'Upload songs, auto-detect BPM & play', color: '#ef6ab4', icon: '🎧' },
];

export default function Landing() {
    return (
        <main className="landing">
            <header className="hero">
                <div className="hero-inner">
                    <h1>Rhythm Notes</h1>
                    <p className="subtitle">Summarize. Learn. Play. — Notes + Rhythm fused for better study flow.</p>
                    <div className="cta-row">
                        <Link to="/login" className="cta-button primary">Get Started</Link>
                        <Link to="/register" className="cta-button ghost">Create Account</Link>
                    </div>
                </div>
            </header>

            <section className="features">
                {features.map((f) => (
                    <article className="feature-card" key={f.title} style={{ borderTop: `6px solid ${f.color}` }}>
                        <div className="feature-icon" style={{ background: `${f.color}33` }}>
                            <span className="emoji">{f.icon}</span>
                        </div>
                        <h3>{f.title}</h3>
                        <p>{f.desc}</p>
                    </article>
                ))}
            </section>

                <section className="game-section">
                <div className="game-left">
                    <span className="badge">⚡ Game Mode</span>
                    <h2>Learn Through Play</h2>
                    <p className="game-lead">Our rhythm-based typing game transforms studying into an engaging experience. Hit the beats, type the words, and watch your knowledge soar as you compete with friends.</p>
                    <ul className="game-features">
                        <li><span className="dot" style={{ background: '#7c3aed' }} />OSU-style circle mechanics with BPM sync</li>
                        <li><span className="dot" style={{ background: '#06b6d4' }} />Upload your own songs and set custom BPM</li>
                        <li><span className="dot" style={{ background: '#ef6ab4' }} />Unlock skins and rewards through gacha system</li>
                    </ul>

                    <div className="game-cta-row">
                        <Link to="/game" className="cta-button primary">Try the Game Demo</Link>
                        <Link to="/login" className="cta-button ghost">Sign in to play & save progress</Link>
                    </div>
                </div>

                <div className="game-right">
                    <div className="preview-card">
                        <div className="preview-inner">
                            <div className="preview-icon">🎵</div>
                            <h3>Rhythm Game Preview</h3>
                            <p className="muted">Coming to life soon...</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="promo">
                <div className="promo-card">
                    <h2>Play, Learn, Repeat</h2>
                    <p>Practice with music-driven typing games, collect cosmetics, climb leaderboards and retain more.</p>
                    <Link to="/login" className="cta-button secondary">Try the demo game</Link>
                </div>
            </section>
        </main>
    );
}