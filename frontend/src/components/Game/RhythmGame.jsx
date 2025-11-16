import React, { useState, useEffect, useRef } from 'react';
import './RhythmGame.css';

// ...existing code...
const RhythmGame = () => {
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timer, setTimer] = useState(60);
    const [combo, setCombo] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [typingText, setTypingText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedText, setSelectedText] = useState('');
    const audioRef = useRef(null);

    // at least 6 sample texts, each game will pick one at random
    const SAMPLE_TEXTS = [
        'The quick brown fox jumps over the lazy dog rhythm notes help you learn faster.',
        'In mitochondria the energy flows and enzymes catalyze reactions essential for life.',
        'Understanding data structures and algorithms improves problem solving and performance.',
        'Reactive components update the UI efficiently when state or props change asynchronously.',
        'Photosynthesis converts sunlight into chemical energy stored in sugars and oxygen released.',
        'Classes encapsulate behavior and state, enabling modular and reusable code design patterns.',
        'Proteins are chains of amino acids folded into shapes that determine biological function.'
    ];

    useEffect(() => {
        let interval = null;
        if (isPlaying && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0 && isPlaying) {
            endGame();
        }
        return () => clearInterval(interval);
    }, [isPlaying, timer]);

    const pickRandomText = () => {
        const idx = Math.floor(Math.random() * SAMPLE_TEXTS.length);
        return SAMPLE_TEXTS[idx];
    };

    const startGame = () => {
        const textToType = pickRandomText();
        setSelectedText(textToType);
        setScore(0);
        setCombo(0);
        setTimer(60);
        setGameStarted(true);
        setIsPlaying(true);
        setTypingText('');
        setCurrentIndex(0);
        setAccuracy(100);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
        }
    };

    const endGame = () => {
        setIsPlaying(false);
        setGameStarted(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const handleKeyPress = (e) => {
        if (!isPlaying) return;
        if (!selectedText) return;

        const text = selectedText;
        const char = e.key;

        if (char === text[currentIndex]) {
            setTypingText(prev => prev + char);
            setCurrentIndex(prev => prev + 1);
            setCombo(prev => prev + 1);
            setScore(prev => prev + 10);
        } else if (char === ' ' && text[currentIndex] === ' ') {
            setTypingText(prev => prev + char);
            setCurrentIndex(prev => prev + 1);
            setCombo(prev => prev + 1);
            setScore(prev => prev + 10);
        } else if (char.length === 1) {
            setCombo(0);
            setAccuracy(prev => Math.max(0, prev - 2));
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentIndex, isPlaying, selectedText]);

    const displayText = (selectedText || '').split('').map((char, idx) => (
        <span
            key={idx}
            className={`char ${idx < currentIndex ? 'typed' : idx === currentIndex ? 'current' : ''}`}
        >
            {char}
        </span>
    ));

    const gaugeFill = (selectedText ? (currentIndex / selectedText.length) * 100 : 0);

    const wordsTyped = typingText.trim() ? typingText.trim().split(/\s+/).length : 0;
    const elapsedSeconds = 60 - timer;
    const wpm = elapsedSeconds > 0 ? Math.round((wordsTyped) / (elapsedSeconds / 60)) : 0;

    return (
        <div className="rhythm-game-container">
            <div className="game-arena">
                <audio ref={audioRef} src="/default-song.mp3" />

                {!gameStarted ? (
                    <div className="game-start-screen">
                        <div className="start-content">
                            <h2>Ready to Type the Beat?</h2>
                            <p>Match the rhythm, follow the words, and rack up your score!</p>
                            <button className="btn-start" onClick={startGame}>
                                START GAME
                            </button>
                            <div className="game-tips">
                                <p>💡 Each play uses a random passage — practice different texts each round.</p>
                                <p>🎵 The audio will play automatically — sync with the beat!</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="game-top-bar">
                            <div className="info-box">
                                <span className="label">Score</span>
                                <span className="value">{score}</span>
                            </div>
                            <div className="info-box">
                                <span className="label">Combo</span>
                                <span className="value combo-value">{combo}</span>
                            </div>
                            <div className="info-box">
                                <span className="label">Accuracy</span>
                                <span className="value">{accuracy.toFixed(0)}%</span>
                            </div>
                            <div className="info-box timer">
                                <span className="label">Time</span>
                                <span className="value">{timer}s</span>
                            </div>
                        </div>

                        <div className="typing-area">
                            <div className="typing-display">
                                {displayText}
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${gaugeFill}%` }}
                                />
                            </div>
                        </div>

                        <div className="game-stats">
                            <div className="stat">
                                <span className="stat-label">Words Typed</span>
                                <span className="stat-value">{wordsTyped}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">WPM</span>
                                <span className="stat-value">{wpm}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Chars Typed</span>
                                <span className="stat-value">{currentIndex}</span>
                            </div>
                        </div>

                        <button className="btn-quit" onClick={endGame}>Quit Game</button>
                    </>
                )}

                {!gameStarted && timer === 0 && (
                    <div className="game-over-screen">
                        <h2>Game Over!</h2>
                        <div className="final-stats">
                            <div className="stat-display">
                                <span className="stat-label">Final Score</span>
                                <span className="stat-value">{score}</span>
                            </div>
                            <div className="stat-display">
                                <span className="stat-label">Best Combo</span>
                                <span className="stat-value">{combo}</span>
                            </div>
                            <div className="stat-display">
                                <span className="stat-label">Accuracy</span>
                                <span className="stat-value">{accuracy.toFixed(0)}%</span>
                            </div>
                        </div>
                        <button className="btn-start" onClick={startGame}>
                            PLAY AGAIN
                        </button>
                    </div>
                )}
            </div>

            <div className="leaderboard-section">
                <h3>🏆 Global Leaderboard</h3>
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Score</th>
                            <th>Accuracy</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>Speedhacker</td>
                            <td>8,920</td>
                            <td>98.2%</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>RhythmMaster</td>
                            <td>8,650</td>
                            <td>97.5%</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td>TypeRacer99</td>
                            <td>8,340</td>
                            <td>96.8%</td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td>BeatSync</td>
                            <td>7,920</td>
                            <td>95.3%</td>
                        </tr>
                        <tr>
                            <td>5</td>
                            <td>YoungTypist</td>
                            <td>7,650</td>
                            <td>94.1%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RhythmGame;