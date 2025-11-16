import React, { useState, useEffect, useRef, useMemo } from 'react';
import './UnifiedRhythmGame.css';
import RhythmNote from './osu/RhythmNote';

const PLACEHOLDER_TEXTS = [
    'Proteins are polypeptides folded into 3D shapes that perform biological functions. The twenty amino acids combine through peptide bonds to create unique structures.',
    'Photosynthesis converts light energy into chemical energy through electron transport chains. Chlorophyll absorbs photons exciting electrons to higher energy states.',
    'Data structures organize information efficiently for algorithms to process. Arrays provide fast random access but fixed size constraints.',
    'React components manage state through hooks enabling functional programming paradigms. useState tracks component variables triggering re-renders on changes.',
    'Machine learning models learn patterns from training data to make predictions. Neural networks stack layers of interconnected neurons processing information.'
];

// Generate beatmap based on BPM
const generateBeatmapFromTempo = (bpm = 120, durationSeconds = 60) => {
    const beatmap = [];
    const beatDuration = (60 / bpm) * 1000;
    const positions = ['left', 'center-left', 'center-right', 'right'];
    let currentTime = 2000;
    let posIndex = 0;
    let beatIndex = 0;

    while (currentTime < durationSeconds * 1000) {
        beatmap.push({
            id: `beat-${beatIndex}`,
            time: currentTime,
            position: positions[posIndex % 4],
            keyHint: ['D', 'F', 'J', 'K'][posIndex % 4],
            posIndex: posIndex % 4,
        });
        currentTime += beatDuration;
        posIndex++;
        beatIndex++;
    }

    return beatmap;
};

// Hit Feedback Component
const HitFeedback = ({ type, position, wordsAdvanced }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const positionStyle = {
        'left': { left: '10%' },
        'center-left': { left: '35%' },
        'center-right': { left: '60%' },
        'right': { right: '10%' },
    }[position] || { left: '10%' };

    return visible ? (
        <div
            className={`hit-feedback hit-feedback-${type}`}
            style={{
                ...positionStyle,
                bottom: '20%',
            }}
        >
            <div className="feedback-text">
                {type === 'perfect' && '◎ PERFECT!'}
                {type === 'good' && '◯ GOOD!'}
                {type === 'miss' && '✕ MISS'}
            </div>
            {wordsAdvanced > 0 && (
                <div className="feedback-words">+{wordsAdvanced} word{wordsAdvanced > 1 ? 's' : ''}</div>
            )}
        </div>
    ) : null;
};

// Main Unified Game Component
const UnifiedRhythmGame = () => {
    const [gameState, setGameState] = useState('ready');
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
    const [hitCircles, setHitCircles] = useState(new Set());

    // TypeRacer state
    const [selectedText, setSelectedText] = useState(PLACEHOLDER_TEXTS[0]);
    const [wordIndex, setWordIndex] = useState(0);

    const beatMapData = useMemo(() => generateBeatmapFromTempo(120, 60), []);
    const words = selectedText.split(/\s+/).filter(w => w.length > 0);

    const KEY_MAP = { 'd': 0, 'f': 1, 'j': 2, 'k': 3 };

    // Audio sync
    useEffect(() => {
        const updateAudioTime = () => {
            if (audioRef.current && gameState === 'playing') {
                const currentTime = audioRef.current.currentTime * 1000;
                setAudioTime(currentTime);

                const LOOK_AHEAD = 2500;
                beatMapData.forEach((beat) => {
                    if (
                        beat.time <= currentTime + LOOK_AHEAD &&
                        beat.time >= currentTime - 500 &&
                        !circleHistory.has(beat.id)
                    ) {
                        setCircleHistory((prev) => {
                            const newHistory = new Set(prev);
                            if (!newHistory.has(beat.id)) {
                                newHistory.add(beat.id);
                                const newCircle = {
                                    id: beat.id,
                                    position: beat.posIndex,
                                    keyHint: beat.keyHint,
                                    appearTime: beat.time,
                                    hitTime: beat.time + 2000,
                                };
                                setActiveCircles((prevCircles) => [...prevCircles, newCircle]);
                            }
                            return newHistory;
                        });
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
        const posIndex = KEY_MAP[key];
        if (posIndex === undefined) return;

        const HIT_WINDOW = 150;

        setActiveCircles((prevCircles) => {
            return prevCircles.filter((circle) => {
                if (circle.position !== posIndex) return true;
                if (hitCircles.has(circle.id)) return true;

                const timeDiff = Math.abs(audioTime - circle.hitTime);

                if (timeDiff < HIT_WINDOW) {
                    setHitCircles((prev) => new Set(prev).add(circle.id));

                    let hitType = 'good';
                    let scoreGain = 50;
                    let wordsAdvanced = 1;

                    if (timeDiff < 50) {
                        hitType = 'perfect';
                        scoreGain = 100;
                        wordsAdvanced = 2;
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

                    setWordIndex((prev) => Math.min(prev + wordsAdvanced, words.length));

                    const feedbackId = `feedback-${circle.id}-${Date.now()}`;
                    setFeedbackItems((prev) => [
                        ...prev,
                        { id: feedbackId, type: hitType, position: circle.position, wordsAdvanced },
                    ]);
                    setTimeout(() => {
                        setFeedbackItems((p) => p.filter((f) => f.id !== feedbackId));
                    }, 800);

                    return false;
                }

                return true;
            });
        });
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [audioTime, gameState, wordIndex, words.length, totalHits, totalMisses, hitCircles]);

    // Clean up old circles
    useEffect(() => {
        setActiveCircles((prev) =>
            prev.filter((circle) => {
                const timeSinceHit = audioTime - circle.hitTime;
                return timeSinceHit < 1500;
            })
        );
    }, [audioTime]);

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
        setWordIndex(0);
        setActiveCircles([]);
        setCircleHistory(new Set());
        setHitCircles(new Set());
        setFeedbackItems([]);
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

    const handleAudioEnded = () => {
        endGame();
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
    };

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
                        <p>Click the circles to the beat and advance through the text!</p>
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
                    <div className="game-hud">
                        <div className="hud-stat">
                            <span className="hud-label">Score</span>
                            <span className="hud-value">{score}</span>
                        </div>
                        <div className="hud-stat">
                            <span className="hud-label">Combo</span>
                            <span className={`hud-value ${combo > 0 ? 'active-combo' : ''}`}>
                                {combo}x
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

                    <div className="osu-section">
                        <div className="circles-play-area">
                            <div className="feedback-container">
                                {feedbackItems.map((feedback) => (
                                    <HitFeedback
                                        key={feedback.id}
                                        type={feedback.type}
                                        position={feedback.position}
                                        wordsAdvanced={feedback.wordsAdvanced}
                                    />
                                ))}
                            </div>

                            {/* RhythmNote circles from osu folder */}
                            {activeCircles.map((circle) => (
                                <RhythmNote
                                    key={circle.id}
                                    id={circle.id}
                                    position={circle.position}
                                    currentTime={audioTime}
                                    hitTime={circle.hitTime}
                                    isHit={hitCircles.has(circle.id)}
                                    onHit={() => {}}
                                    onMiss={() => {
                                        setTotalMisses((prevMisses) => {
                                            const newMisses = prevMisses + 1;
                                            setAccuracy((_) => {
                                                const denom = totalHits + newMisses;
                                                return denom > 0 ? (totalHits / denom) * 100 : 0;
                                            });
                                            return newMisses;
                                        });
                                        setCombo(0);

                                        const feedbackId = `feedback-miss-${circle.id}`;
                                        setFeedbackItems((prev) => [
                                            ...prev,
                                            {
                                                id: feedbackId,
                                                type: 'miss',
                                                position: circle.position,
                                                wordsAdvanced: 0,
                                            },
                                        ]);
                                        setTimeout(() => {
                                            setFeedbackItems((p) => p.filter((f) => f.id !== feedbackId));
                                        }, 800);
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="typeracer-section">
                        <div className="words-display">
                            {words.map((word, idx) => (
                                <span key={idx} className={`word ${idx < wordIndex ? 'filled' : idx === wordIndex ? 'current' : ''}`}>
                                    {word}
                                </span>
                            ))}
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${words.length > 0 ? (wordIndex / words.length) * 100 : 0}%` }} />
                        </div>
                        <div className="typing-progress">
                            {wordIndex} / {words.length} words
                        </div>
                    </div>

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
                                <span className="end-label">Words Completed</span>
                                <span className="end-value">
                                    {wordIndex} / {words.length}
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