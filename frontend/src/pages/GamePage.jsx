import React, { useState } from 'react';
import './GamePage.css';
import OSUStyleRhythmGameDemo from '../components/Game/OSUStyleRhythmGameDemo';
import RhythmGame from '../components/Game/RhythmGame';
import GachaRewards from '../components/Game/GachaRewards';

const GamePage = () => {
    const [activeTab, setActiveTab] = useState('game');

    return (
        <div className="game-page">
            <div className="game-header">
                <h1>🎵 Rhythm Notes Game</h1>
                <p className="game-subtitle">Type to the beat and earn rewards</p>
            </div>

            <div className="game-tabs">
                <button
                    className={`game-tab ${activeTab === 'osu' ? 'active' : ''}`}
                    onClick={() => setActiveTab('osu')}
                >
                    ◎ OSU Rhythm (NEW)
                </button>
                <button
                    className={`game-tab ${activeTab === 'game' ? 'active' : ''}`}
                    onClick={() => setActiveTab('game')}
                >
                    ⚡ Play Rhythm Game
                </button>
                <button
                    className={`game-tab ${activeTab === 'gacha' ? 'active' : ''}`}
                    onClick={() => setActiveTab('gacha')}
                >
                    🎁 Gacha & Rewards
                </button>
            </div>

            <div className="game-content-wrapper">
                {activeTab === 'osu' && <OSUStyleRhythmGameDemo />}
                {activeTab === 'game' && <RhythmGame />}
                {activeTab === 'gacha' && <GachaRewards />}
            </div>
        </div>
    );
};

export default GamePage;