import React, { useState } from 'react';
import './GachaRewards.css';

const GachaRewards = () => {
    const [points, setPoints] = useState(12500);
    const [inventory, setInventory] = useState([
        { id: 1, name: 'Neon Glow', type: 'skin', rarity: 'legendary', obtained: true, img: '✨' },
        { id: 2, name: 'Dark Mode', type: 'skin', rarity: 'rare', obtained: true, img: '🌙' },
        { id: 3, name: 'Crystal Blue', type: 'skin', rarity: 'common', obtained: true, img: '💎' },
        { id: 4, name: 'Fire Track', type: 'music', rarity: 'epic', obtained: true, img: '🔥' },
    ]);
    const [pullingGacha, setPullingGacha] = useState(false);
    const [lastPull, setLastPull] = useState(null);

    const rarityColors = {
        common: '#4ade80',
        rare: '#3b82f6',
        epic: '#8b5cf6',
        legendary: '#fbbf24'
    };

    const handleGachaPull = () => {
        if (points < 100) {
            alert('Not enough points!');
            return;
        }

        setPullingGacha(true);
        setPoints(prev => prev - 100);

        setTimeout(() => {
            const rarities = ['common', 'common', 'rare', 'epic', 'legendary'];
            const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];
            const skins = [
                { name: 'Cyber Purple', rarity: 'legendary', img: '💜' },
                { name: 'Solar Gold', rarity: 'epic', img: '⭐' },
                { name: 'Ocean Blue', rarity: 'rare', img: '🌊' },
                { name: 'Forest Green', rarity: 'common', img: '🌿' },
            ];

            const pulled = skins.find(s => s.rarity === randomRarity) || skins[0];
            setLastPull({ ...pulled, id: Date.now() });
            setPullingGacha(false);
        }, 1500);
    };

    return (
        <div className="gacha-rewards-container">
            <div className="gacha-section">
                <div className="gacha-card">
                    <div className="gacha-header">
                        <h2>✨ Gacha System</h2>
                        <p>Pull for skins and rewards to customize your game</p>
                    </div>

                    <div className="points-display">
                        <div className="points-box">
                            <span className="points-label">Your Points</span>
                            <span className="points-value">{points.toLocaleString()}</span>
                            <span className="points-hint">100 points per pull</span>
                        </div>
                    </div>

                    <button
                        className={`btn-pull ${pullingGacha ? 'pulling' : ''}`}
                        onClick={handleGachaPull}
                        disabled={pullingGacha || points < 100}
                    >
                        {pullingGacha ? '🎰 Pulling...' : '🎰 Pull (100 pts)'}
                    </button>

                    {lastPull && (
                        <div className="pull-result">
                            <div className="result-card" style={{ borderColor: rarityColors[lastPull.rarity] }}>
                                <div className="result-icon">{lastPull.img}</div>
                                <div className="result-info">
                                    <span className="result-name">{lastPull.name}</span>
                                    <span className="result-rarity" style={{ color: rarityColors[lastPull.rarity] }}>
                                        {lastPull.rarity.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="inventory-card">
                    <h3>🎨 Your Skins</h3>
                    <div className="skin-grid">
                        {inventory.filter(i => i.type === 'skin').map(skin => (
                            <div
                                key={skin.id}
                                className="skin-item"
                                style={{ borderColor: rarityColors[skin.rarity] }}
                            >
                                <div className="skin-icon">{skin.img}</div>
                                <div className="skin-name">{skin.name}</div>
                                <div className="skin-rarity" style={{ color: rarityColors[skin.rarity] }}>
                                    {skin.rarity}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="stats-section">
                <div className="stats-card">
                    <h3>📊 Your Statistics</h3>
                    <p className="section-desc">Track your gaming progress and achievements</p>

                    <div className="stats-grid">
                        <div className="stat-box">
                            <div className="stat-icon">🎯</div>
                            <div className="stat-info">
                                <div className="stat-label">Total Games</div>
                                <div className="stat-value">127</div>
                            </div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-icon">⚡</div>
                            <div className="stat-info">
                                <div className="stat-label">Best Score</div>
                                <div className="stat-value">9,850</div>
                            </div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-icon">🔥</div>
                            <div className="stat-info">
                                <div className="stat-label">Best Combo</div>
                                <div className="stat-value">342</div>
                            </div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-icon">⏱️</div>
                            <div className="stat-info">
                                <div className="stat-label">Avg WPM</div>
                                <div className="stat-value">92</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="leaderboard-card">
                    <h3>🏆 Global Top 10</h3>
                    <div className="leaderboard-list">
                        {[
                            { rank: 1, name: 'SpeedHacker', score: 12450, you: false },
                            { rank: 2, name: 'RhythmMaster', score: 11920, you: false },
                            { rank: 3, name: 'TypeRacer99', score: 10850, you: true },
                            { rank: 4, name: 'BeatSync', score: 10340, you: false },
                            { rank: 5, name: 'YoungTypist', score: 9920, you: false },
                        ].map(entry => (
                            <div key={entry.rank} className={`leaderboard-entry ${entry.you ? 'you' : ''}`}>
                                <div className="rank-badge">#{entry.rank}</div>
                                <div className="entry-name">{entry.name}</div>
                                <div className="entry-score">{entry.score.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="achievements-card">
                    <h3>🏅 Achievements</h3>
                    <div className="achievement-list">
                        <div className="achievement">
                            <span className="ach-icon">🎯</span>
                            <div className="ach-info">
                                <div className="ach-name">Perfect Score</div>
                                <div className="ach-desc">Score 100% accuracy in a game</div>
                            </div>
                        </div>
                        <div className="achievement">
                            <span className="ach-icon">🔥</span>
                            <div className="ach-info">
                                <div className="ach-name">Combo Master</div>
                                <div className="ach-desc">Get a 50+ combo</div>
                            </div>
                        </div>
                        <div className="achievement unlocked">
                            <span className="ach-icon">⭐</span>
                            <div className="ach-info">
                                <div className="ach-name">Speed Hacker</div>
                                <div className="ach-desc">Type 100+ WPM</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GachaRewards;