import React, { useState } from 'react';
import './GamePage.css';
import UnifiedRhythmGame from '../components/Game/UnifiedRhythmGame';
import GachaRewards from '../components/Game/GachaRewards';

const GamePage = () => {
    const [activeTab, setActiveTab] = useState('game');

    return (
        <div className="game-page">
            <div className="game-header">
                <h1>🎵 Rhythm Notes Game</h1>
                <p className="game-subtitle">Type to the beat and master your notes</p>
            </div>

            <div className="game-tabs">
                <button
                    className={`game-tab ${activeTab === 'game' ? 'active' : ''}`}
                    onClick={() => setActiveTab('game')}
                >
                    ⚡ Play Game
                </button>
                <button
                    className={`game-tab ${activeTab === 'gacha' ? 'active' : ''}`}
                    onClick={() => setActiveTab('gacha')}
                >
                    🎁 Gacha & Rewards
                </button>
            </div>

            <div className="game-content-wrapper">
                {activeTab === 'game' && <UnifiedRhythmGame />}
                {activeTab === 'gacha' && <GachaRewards />}
            </div>
        </div>
    );
};

export default GamePage;