import React, { useState, useEffect, useRef } from 'react';
import './UnifiedRhythmGame.css';

// Placeholder summarized text from notes
const PLACEHOLDER_TEXTS = [
    'Proteins are polypeptides folded into 3D shapes that perform biological functions. The twenty amino acids combine through peptide bonds to create unique structures. Enzymatic proteins accelerate chemical reactions while structural proteins provide support. Understanding protein function requires analyzing their conformation and molecular recognition abilities.',
    'Photosynthesis converts light energy into chemical energy through electron transport chains. Chlorophyll absorbs photons exciting electrons to higher energy states. The light dependent reactions produce ATP and NADPH in thylakoid membranes. Carbon fixation in the stroma uses these molecules to synthesize glucose molecules.',
    'Data structures organize information efficiently for algorithms to process. Arrays provide fast random access but fixed size constraints. Linked lists offer dynamic allocation with slower sequential access patterns. Hash tables balance insertion deletion and lookup operations with optimal performance.',
    'React components manage state through hooks enabling functional programming paradigms. useState tracks component variables triggering re-renders on changes. useEffect handles side effects after component mounts and updates. Context API provides global state management across component hierarchies.',
    'Machine learning models learn patterns from training data to make predictions. Neural networks stack layers of interconnected neurons processing information. Backpropagation adjusts weights minimizing loss through gradient descent optimization. Overfitting occurs when models memorize training data failing on new examples.'
];

// Generate OSU-style beatmap from audio timing
const generateBeatmapFromTempo = (bpm = 120, durationSeconds = 60) => {
    const beatmap = [];
    const beatDuration = (60 / bpm) * 1000;
    const keys = ['D', 'F', 'J', 'K'];
    let currentTime = 2000;
    let keyIndex = 0;

    while (currentTime < durationSeconds * 1000) {
        beatmap.push({
            time: currentTime,
            key: keys[keyIndex % 4],
            text: `Beat ${keyIndex + 1}`,
        });
        currentTime += beatDuration;
        keyIndex++;
    }

    return beatmap;
};

// Individual Rhythm Circle Component
const RhythmCircle = ({ id, keyRequired, position, audioTime, startTime, onHit, onMiss }) => {
    const [state, setState] = useState('falling');
    const FALL_DURATION = 2000;
    const DISAPPEAR_TIME = 300;

    const timeSinceAppear = audioTime - startTime;
    const progress = Math.min(1, Math.max(0, timeSinceAppear / FALL_DURATION));

    useEffect(() => {
        if (state === 'falling' && timeSinceAppear > FALL_DURATION + DISAPPEAR_TIME) {
            setState('missed');
            onMiss(id);
        }
    }, [timeSinceAppear, state, id, onMiss]);

    const currentPos = -120 + progress * (75 - (-120));
    const scale = Math.max(0.7, 1 - progress * 0.3);

    return (
        <div
            className={`rhythm-circle rhythm-circle-${position} ${state === 'missed' ? 'missed' : ''}`}
            style={{
                top: `${currentPos}%`,
                transform: `scale(${scale})`,
                opacity: state === 'missed' ? 0 : 1,
            }}
        >
            <div className="circle-outer-ring" />
            <div className="circle-key">{keyRequired}</div>
            <div className="circle-glow" />
        </div>
    );
};

// Hit Feedback Component
const HitFeedback = ({ type, position, score }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 600);
        return () => clearTimeout(timer);
    }, []);

    return visible ? (
        <div className={`hit-feedback hit-feedback-${type} position-${position}`}>
            {type === 'perfect' && '◎ PERFECT!'}
            {type === 'good' && '◯ GOOD!'}
            {type === 'miss' && '✕ MISS'}
            {score !== undefined && <div className="feedback-score">+{score}</div>}
        </div>
    ) : null;
};

// Main Unified Game Component
const UnifiedRhythmGame = () => {
    const [gameState, setGameState] = useState('ready'); // 'ready', 'playing', 'paused', 'ended'
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [totalHits, setTotalHits] = useState(0);
    const [totalMisses, setTotalMisses] = useState(0);

    const audioRef = useRef(null);
    const [audioTime, setAudioTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const animationFrameRef = useRef(null);

    const [activeCircles, setActiveCircles] = useState([]);
    const [circleHistory, setCircleHistory] = useState(new Set());
    const [feedbackItems, setFeedbackItems] = useState([]);

    // TypeRacer state
    const [selectedText, setSelectedText] = useState(PLACEHOLDER_TEXTS[0]);
    const [typedIndex, setTypedIndex] = useState(0);
    const [textCorrect, setTextCorrect] = useState(0);
    const [textMissed, setTextMissed] = useState(0);

    // Beatmap
    const beatMapData = generateBeatmapFromTempo(120, 60);

    const KEY_MAP = { 'd': 0, 'f': 1, 'j': 2, 'k': 3 };
    const POSITION_TO_KEY = { 0: 'D', 1: 'F', 2: 'J', 3: 'K' };

    const getPositionFromKey = (key) => KEY_MAP[key.toLowerCase()] ?? 0;

    // Audio sync
    useEffect(() => {
        const updateAudioTime = () => {
            if (audioRef.current && gameState === 'playing') {
                const currentTime = audioRef.current.currentTime * 1000;
                setAudioTime(currentTime);

                const LOOK_AHEAD = 1000;
                beatMapData.forEach((beat) => {
                    const beatId = `beat-${beat.time}`;
                    if (
                        beat.time <= currentTime + LOOK_AHEAD &&
                        beat.time >= currentTime - 500 &&
                        !circleHistory.has(beatId)
                    ) {
                        const newCircle = {
                            id: beatId,
                            key: beat.key,
                            position: getPositionFromKey(beat.key),
                            startTime: beat.time,
                        };
                        setActiveCircles((prev) => [...prev, newCircle]);
                        setCircleHistory((prev) => new Set(prev).add(beatId));
                    }
                });
            }
            animationFrameRef.current = requestAnimationFrame(updateAudioTime);
        };

        if (gameState === 'playing') {
            animationFrameRef.current = requestAnimationFrame(updateAudioTime);
        }

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [gameState, beatMapData, circleHistory]);

    // Key press detection
    const handleKeyDown = (e) => {
        if (gameState !== 'playing') return;

        const key = e.key.toLowerCase();
        if (!KEY_MAP.hasOwnProperty(key)) return;

        const position = KEY_MAP[key];
        const HIT_WINDOW = 150;
        let hitACircle = false;

        setActiveCircles((prevCircles) => {
            return prevCircles.filter((circle) => {
                if (circle.position !== position) return true;

                const timeDiff = Math.abs(audioTime - circle.startTime);

                if (timeDiff < HIT_WINDOW) {
                    hitACircle = true;

                    let hitType = 'good';
                    let scoreGain = 50;
                    if (timeDiff < 50) {
                        hitType = 'perfect';
                        scoreGain = 100;
                    }

                    setScore((prev) => prev + scoreGain);
                    setCombo((prevCombo) => {
                        const newCombo = prevCombo + 1;
                        setMaxCombo((prevMax) => Math.max(prevMax, newCombo));
                        return newCombo;
                    });

                    setTotalHits((prevHits) => {
                        const newHits = prevHits + 1;
                        setAccuracy((_) => {
                            const denom = newHits + totalMisses;
                            return denom > 0 ? (newHits / denom) * 100 : 100;
                        });
                        return newHits;
                    });

                    const feedbackId = `feedback-${Date.now()}-${Math.random()}`;
                    setFeedbackItems((prev) => [
                        ...prev,
                        { id: feedbackId, type: hitType, position, score: scoreGain },
                    ]);
                    setTimeout(() => {
                        setFeedbackItems((p) => p.filter((f) => f.id !== feedbackId));
                    }, 600);

                    return false;
                }

                return true;
            });
        });

        // TypeRacer typing
        if (typedIndex < selectedText.length) {
            const expectedChar = selectedText[typedIndex];
            if (key === expectedChar.toLowerCase() || (expectedChar === ' ' && key === ' ')) {
                setTypedIndex((prev) => prev + 1);
                setTextCorrect((prev) => prev + 1);
            } else if (!hitACircle) {
                setTextMissed((prev) => prev + 1);
            }
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [audioTime, gameState, typedIndex, selectedText, totalHits, totalMisses]);

    // Game controls
    const startGame = () => {
        const randomText = PLACEHOLDER_TEXTS[Math.floor(Math.random() * PLACEHOLDER_TEXTS.length)];
        setSelectedText(randomText);

        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
        }

        setGameState('playing');
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setTotalHits(0);
        setTotalMisses(0);
        setAccuracy(100);
        setTypedIndex(0);
        setTextCorrect(0);
        setTextMissed(0);
        setActiveCircles([]);
        setCircleHistory(new Set());
    };

    const pauseGame = () => {
        if (audioRef.current) audioRef.current.pause();
        setGameState('paused');
    };

    const resumeGame = () => {
        if (audioRef.current) audioRef.current.play();
        setGameState('playing');
    };

    const endGame = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setGameState('ended');
        setMaxCombo((prev) => Math.max(prev, combo));
    };

    useEffect(() => {
        setActiveCircles((prev) =>
            prev.filter((circle) => {
                const timePassed = audioTime - circle.startTime;
                return timePassed < 2500;
            })
        );
    }, [audioTime]);

    const handleAudioEnded = () => {
        endGame();
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

    // TypeRacer display
    const displayText = selectedText.split('').map((char, idx) => (
        <span
            key={idx}
            className={`typeracer-char ${
                idx < typedIndex ? 'typed' : idx === typedIndex ? 'current' : ''
            }`}
        >
            {char === ' ' ? '·' : char}
        </span>
    ));

    return (
        <div className="unified-rhythm-game">
            <audio
                ref={audioRef}
                src="/default-song.mp3"
                onEnded={handleAudioEnded}
                onLoadedMetadata={handleLoadedMetadata}
            />

            {gameState === 'ready' && (
                <div className="game-start-overlay">
                    <div className="start-content">
                        <h2>Ready to Play?</h2>
                        <p>Hit the circles and type the text to earn points!</p>
                        <button className="btn-start" onClick={startGame}>
                            START GAME
                        </button>
                        <div className="key-hint">
                            <span>Press D, F, J, K to hit circles</span>
                        </div>
                    </div>
                </div>
            )}

            {(gameState === 'playing' || gameState === 'paused') && (
                <>
                    {/* HUD */}
                    <div className="game-hud">
                        <div className="hud-stat">
                            <span className="hud-label">Score</span>
                            <span className="hud-value">{score}</span>
                        </div>
                        <div className="hud-stat">
                            <span className="hud-label">Combo</span>
                            <span className={`hud-value ${combo > 0 ? 'active-combo' : ''}`}>
                                {combo}
                            </span>
                        </div>
                        <div className="hud-stat">
                            <span className="hud-label">Accuracy</span>
                            <span className="hud-value">{accuracy.toFixed(1)}%</span>
                        </div>
                        <div className="hud-stat">
                            <span className="hud-label">Time</span>
                            <span className="hud-value">
                                {(audioTime / 1000).toFixed(1)}s / {duration.toFixed(1)}s
                            </span>
                        </div>
                    </div>

                    {/* OSU Game Section (Top Half) */}
                    <div className="osu-section">
                        <div className="circles-container">
                            {[0, 1, 2, 3].map((position) => (
                                <div key={position} className={`lane lane-${position}`}>
                                    <div className="target-zone">
                                        <div className="target-ring" />
                                        <span className="target-key">{POSITION_TO_KEY[position]}</span>
                                    </div>

                                    {activeCircles
                                        .filter((c) => c.position === position)
                                        .map((circle) => (
                                            <RhythmCircle
                                                key={circle.id}
                                                id={circle.id}
                                                keyRequired={circle.key}
                                                position={circle.position}
                                                audioTime={audioTime}
                                                startTime={circle.startTime}
                                                onHit={() => {}}
                                                onMiss={(id) => {
                                                    setTotalMisses((prevMisses) => {
                                                        const newMisses = prevMisses + 1;
                                                        setAccuracy((_) => {
                                                            const denom = totalHits + newMisses;
                                                            return denom > 0
                                                                ? (totalHits / denom) * 100
                                                                : 0;
                                                        });
                                                        return newMisses;
                                                    });

                                                    setCombo(0);

                                                    const feedbackId = `feedback-miss-${Date.now()}-${Math.random()}`;
                                                    setFeedbackItems((prev) => [
                                                        ...prev,
                                                        {
                                                            id: feedbackId,
                                                            type: 'miss',
                                                            position: circle.position,
                                                            score: 0,
                                                        },
                                                    ]);
                                                    setTimeout(() => {
                                                        setFeedbackItems((p) =>
                                                            p.filter((f) => f.id !== feedbackId)
                                                        );
                                                    }, 700);
                                                }}
                                            />
                                        ))}
                                </div>
                            ))}

                            {/* Feedback */}
                            <div className="feedback-container">
                                {feedbackItems.map((feedback) => (
                                    <HitFeedback
                                        key={feedback.id}
                                        type={feedback.type}
                                        position={feedback.position}
                                        score={feedback.score}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* TypeRacer Section (Bottom Half) */}
                    <div className="typeracer-section">
                        <div className="typeracer-display">
                            <div className="typeracer-text">{displayText}</div>
                        </div>
                        <div className="typing-stats">
                            <span>Typed: {textCorrect}</span>
                            <span>Missed: {textMissed}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="game-controls">
                        {gameState === 'playing' ? (
                            <button className="btn-control btn-pause" onClick={pauseGame}>
                                ⏸ PAUSE
                            </button>
                        ) : (
                            <button className="btn-control btn-resume" onClick={resumeGame}>
                                ▶ RESUME
                            </button>
                        )}
                        <button className="btn-control btn-quit" onClick={endGame}>
                            ✕ QUIT
                        </button>
                    </div>

                    {/* Pause Overlay */}
                    {gameState === 'paused' && (
                        <div className="pause-overlay">
                            <div className="pause-content">
                                <h2>PAUSED</h2>
                                <button className="btn-start" onClick={resumeGame}>
                                    RESUME
                                </button>
                                <button className="btn-control btn-quit" onClick={endGame}>
                                    QUIT
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {gameState === 'ended' && (
                <div className="game-end-overlay">
                    <div className="end-content">
                        <h2>Game Over!</h2>
                        <div className="end-stats">
                            <div className="end-stat">
                                <span className="end-label">Final Score</span>
                                <span className="end-value">{score}</span>
                            </div>
                            <div className="end-stat">
                                <span className="end-label">Max Combo</span>
                                <span className="end-value">{Math.max(maxCombo, combo)}</span>
                            </div>
                            <div className="end-stat">
                                <span className="end-label">Accuracy</span>
                                <span className="end-value">{accuracy.toFixed(1)}%</span>
                            </div>
                            <div className="end-stat">
                                <span className="end-label">Hits / Misses</span>
                                <span className="end-value">
                                    {totalHits} / {totalMisses}
                                </span>
                            </div>
                        </div>
                        <div className="end-actions">
                            <button className="btn-start" onClick={startGame}>
                                PLAY AGAIN
                            </button>
                            <button className="btn-control" onClick={() => setGameState('ready')}>
                                BACK TO MENU
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnifiedRhythmGame;