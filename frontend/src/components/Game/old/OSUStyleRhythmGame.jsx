import React, { useState, useEffect, useRef } from 'react';
import './OSUStyleRhythmGame.css';

/**
 * OSU-STYLE RHYTHM GAME COMPONENT
 * 
 * Complete rhythm game with:
 * - Falling circles that sync with audio timestamps
 * - Key press detection (D, F, J, K keys)
 * - Real-time scoring and combo system
 * - TypeRacer-style text scrolling
 * - Smooth animations using CSS and React state
 * 
 * Backend Format: {time: number (ms), key: 'D'|'F'|'J'|'K', text: string}
 */

// ============================================================================
// RHYTHM CIRCLE COMPONENT
// ============================================================================

/**
 * Individual circle that falls from top to target zone
 * Props:
 *  - id: unique identifier for the circle
 *  - keyRequired: which key must be pressed (D, F, J, K)
 *  - position: which of 4 lanes (0-3) for D, F, J, K
 *  - isActive: whether this circle should be animated
 *  - audioTime: current audio playback time (ms)
 *  - startTime: when this circle appears (ms)
 *  - onHit: callback when user presses correct key
 *  - onMiss: callback when circle passes without being hit
 */
const RhythmCircle = ({ 
  id, 
  keyRequired, 
  position, 
  isActive, 
  audioTime, 
  startTime, 
  onHit, 
  onMiss 
}) => {
  const [state, setState] = useState('falling'); // 'falling', 'hit', 'missed'
  const circleRef = useRef(null);

  // TIMING CONSTANTS (should match parent timing)
  const DISAPPEAR_TIME = 300; // ms - how long after passing zone
  const FALL_DURATION = 2000; // ms - time for circle to fall from top to target

  // Calculate circle's vertical position based on audio time
  const timeSinceAppear = audioTime - startTime;
  const progress = Math.min(1, Math.max(0, timeSinceAppear / FALL_DURATION));
  
  // If circle should have already been hit/missed
  useEffect(() => {
    if (isActive && state === 'falling') {
      // Check if circle passed the hit window
      if (timeSinceAppear > FALL_DURATION + DISAPPEAR_TIME) {
        setState('missed');
        onMiss(id);
      }
    }
  }, [timeSinceAppear, state, isActive, id, onMiss]);

  // Calculate vertical position: starts at top (0), ends at target zone (~75%)
  const TOP_POS = -120; // Start above screen (px-% mix works visually)
  const TARGET_POS = 75; // Target zone position (%)
  const currentPos = TOP_POS + (progress * (TARGET_POS - TOP_POS));

  // Shrink slightly as it approaches the target zone for depth feedback
  const minScale = 0.7;
  const scale = Math.max(minScale, 1 - progress * (1 - minScale));

  // Visual feedback based on state
  const getCircleClasses = () => {
    let classes = `rhythm-circle rhythm-circle-${position}`;
    if (state === 'hit') classes += ' hit-animation';
    if (state === 'missed') classes += ' missed-animation';
    return classes;
  };

  return (
    <div
      ref={circleRef}
      className={getCircleClasses()}
      style={{
        top: `${currentPos}%`,
        transform: `translateY(0) scale(${scale})`,
        opacity: state === 'missed' ? 0 : 1,
        transition: state === 'missed' ? 'opacity 0.2s ease-in' : 'none',
      }}
    >
      {/* Outer ring that shrinks */}
      <div className="circle-outer-ring" />
      
      {/* Key label inside circle */}
      <div className="circle-key">{keyRequired}</div>
      
      {/* Inner glow effect */}
      <div className="circle-glow" />
    </div>
  );
};

// ============================================================================
// HIT FEEDBACK COMPONENT (Visual feedback when user hits correctly/incorrectly)
// ============================================================================

const HitFeedback = ({ type, position, score }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return visible ? (
    <div 
      className={`hit-feedback hit-feedback-${type} position-${position}`}
      style={{
        animation: `popAndFade 0.5s ease-out forwards`,
      }}
    >
      {type === 'perfect' && '◎ PERFECT!'}
      {type === 'good' && '◯ GOOD!'}
      {type === 'miss' && '✕ MISS'}
      {score !== undefined && <div className="feedback-score">+{score}</div>}
    </div>
  ) : null;
};

// ============================================================================
// TYPERACER TEXT COMPONENT
// ============================================================================

/**
 * TypeRacer-style text display that scrolls as user types
 * Shows current character to type, highlights typed/untyped portions
 */
const TypeRacerText = ({ fullText, typedIndex, currentChar }) => {
  // Calculate which word range is visible (scroll effect)
  const CHARS_VISIBLE = 50;
  const scrollOffset = Math.max(0, typedIndex - 10);
  const visibleText = fullText.slice(scrollOffset, scrollOffset + CHARS_VISIBLE);

  return (
    <div className="typeracer-display">
      <div className="typeracer-text">
        {visibleText.split('').map((char, idx) => {
          const absoluteIdx = scrollOffset + idx;
          let className = 'typeracer-char';
          
          if (absoluteIdx < typedIndex) {
            className += ' typed';
          } else if (absoluteIdx === typedIndex) {
            className += ' current';
          } else {
            className += ' untyped';
          }

          return (
            <span key={idx} className={className}>
              {char === ' ' ? '·' : char}
            </span>
          );
        })}
      </div>
      <div className="typeracer-cursor" />
    </div>
  );
};

// ============================================================================
// MAIN OSU RHYTHM GAME COMPONENT
// ============================================================================

const OSUStyleRhythmGame = ({ 
  songUrl = '/default-song.mp3',
  beatMapData = [], // Backend format: [{time, key, text}, ...]
  onGameEnd = null 
}) => {
  // ---- GAME STATE ----
  const [gameState, setGameState] = useState('ready'); // 'ready', 'playing', 'paused', 'ended'
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalHits, setTotalHits] = useState(0);
  const [totalMisses, setTotalMisses] = useState(0);

  // ---- TIMING & SYNC ----
  const audioRef = useRef(null);
  const [audioTime, setAudioTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const animationFrameRef = useRef(null);

  // ---- CIRCLE MANAGEMENT ----
  const [activeCircles, setActiveCircles] = useState([]); // Currently falling circles
  const [circleHistory, setCircleHistory] = useState(new Set()); // Track which circles we've processed
  const circleIdCounterRef = useRef(0);

  // ---- HIT FEEDBACK ----
  const [feedbackItems, setFeedbackItems] = useState([]);

  // ---- TEXT TYPING ----
  const [fullText, setFullText] = useState('Welcome to the rhythm game! Press D, F, J, K to hit circles!');
  const [typedIndex, setTypedIndex] = useState(0);
  const [textCorrect, setTextCorrect] = useState(0);
  const [textMissed, setTextMissed] = useState(0);

  // ============================================================================
  // AUDIO SYNC: Update audio time and spawn circles based on timestamps
  // ============================================================================

  useEffect(() => {
    const updateAudioTime = () => {
      if (audioRef.current && gameState === 'playing') {
        const currentTime = audioRef.current.currentTime * 1000; // Convert to ms
        setAudioTime(currentTime);

        // Spawn circles that are now within active range
        // Look ahead 1 second to prepare animations
        const LOOK_AHEAD = 1000; // ms

        beatMapData.forEach((beat) => {
          const beatId = `beat-${beat.time}`;
          
          // Check if this beat should be active and hasn't been processed yet
          if (
            beat.time <= currentTime + LOOK_AHEAD &&
            beat.time >= currentTime - 500 && // Give some buffer for past circles
            !circleHistory.has(beatId)
          ) {
            const newCircle = {
              id: beatId,
              key: beat.key || 'D',
              position: getPositionFromKey(beat.key),
              startTime: beat.time,
              text: beat.text || '',
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
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, beatMapData, circleHistory]);

  // ============================================================================
  // KEY PRESS DETECTION
  // ============================================================================

  const KEY_MAP = { 'd': 0, 'f': 1, 'j': 2, 'k': 3 };
  const POSITION_TO_KEY = { 0: 'D', 1: 'F', 2: 'J', 3: 'K' };

  const getPositionFromKey = (key) => {
    return KEY_MAP[key.toLowerCase()] ?? 0;
  };

  const handleKeyDown = (e) => {
    if (gameState !== 'playing') return;

    const key = e.key.toLowerCase();
    if (!KEY_MAP.hasOwnProperty(key)) return;

    const position = KEY_MAP[key];

    // ---- CIRCLE HIT DETECTION ----
    let hitACircle = false;
    const HIT_WINDOW = 150; // ms

    setActiveCircles((prevCircles) => {
      // iterate through circles and remove the one that was hit
      return prevCircles.filter((circle) => {
        if (circle.position !== position) return true; // Not in this lane

        const timeDiff = Math.abs(audioTime - circle.startTime);

        if (timeDiff < HIT_WINDOW) {
          hitACircle = true;

          // Determine hit quality
          let hitType = 'good';
          let scoreGain = 50;
          if (timeDiff < 50) {
            hitType = 'perfect';
            scoreGain = 100;
          }

          // Update stats using functional updates to avoid stale closures
          setScore((prev) => prev + scoreGain);
          setCombo((prevCombo) => {
            const newCombo = prevCombo + 1;
            setMaxCombo((prevMax) => Math.max(prevMax, newCombo));
            return newCombo;
          });

          setTotalHits((prevHits) => {
            const newHits = prevHits + 1;
            // compute accuracy with latest misses value
            setAccuracy((_) => {
              const denom = newHits + totalMisses;
              return denom > 0 ? (newHits / denom) * 100 : 100;
            });
            return newHits;
          });

          // Add visual feedback
          const feedbackId = `feedback-${Date.now()}-${Math.random()}`;
          setFeedbackItems((prev) => [
            ...prev,
            { id: feedbackId, type: hitType, position, score: scoreGain },
          ]);
          setTimeout(() => {
            setFeedbackItems((p) => p.filter((f) => f.id !== feedbackId));
          }, 600);

          return false; // remove circle (it was hit)
        }

        return true; // keep circle
      });
    });

    // ---- TEXT TYPING FEEDBACK ----
    if (typedIndex < fullText.length) {
      const expectedChar = fullText[typedIndex];
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
  }, [audioTime, gameState, typedIndex, fullText, totalHits, totalMisses]);

  // ============================================================================
  // GAME CONTROLS
  // ============================================================================

  const startGame = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        console.log('Audio autoplay prevented - user interaction required');
      });
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
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setGameState('paused');
  };

  const resumeGame = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
    setGameState('playing');
  };

  const endGame = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setGameState('ended');
    setMaxCombo((prev) => Math.max(prev, combo));

    if (onGameEnd) {
      onGameEnd({
        finalScore: score,
        maxCombo: Math.max(maxCombo, combo),
        accuracy,
        totalHits,
        totalMisses,
      });
    }
  };

  // Remove circles that are far past their target
  useEffect(() => {
    setActiveCircles((prev) =>
      prev.filter((circle) => {
        const timePassed = audioTime - circle.startTime;
        return timePassed < 2500; // Keep for 2.5s after start time
      })
    );
  }, [audioTime]);

  // Handle song end
  const handleAudioEnded = () => {
    endGame();
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="osu-rhythm-game-container">
      {/* AUDIO ELEMENT */}
      <audio
        ref={audioRef}
        src={songUrl}
        onEnded={handleAudioEnded}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* MAIN GAME AREA */}
      <div className="osu-game-arena">
        {/* ---- START SCREEN ---- */}
        {gameState === 'ready' && (
          <div className="osu-screen osu-start-screen">
            <div className="osu-screen-content">
              <h1 className="osu-title">◎ OSU RHYTHM</h1>
              <p className="osu-subtitle">Match the beat. Press D, F, J, K to hit circles!</p>
              
              <div className="osu-keys-guide">
                <div className="key-guide-row">
                  <div className="key-guide-item">
                    <span className="key-label">D</span>
                    <span className="key-desc">Left Lane</span>
                  </div>
                  <div className="key-guide-item">
                    <span className="key-label">F</span>
                    <span className="key-desc">Mid-Left</span>
                  </div>
                  <div className="key-guide-item">
                    <span className="key-label">J</span>
                    <span className="key-desc">Mid-Right</span>
                  </div>
                  <div className="key-guide-item">
                    <span className="key-label">K</span>
                    <span className="key-desc">Right Lane</span>
                  </div>
                </div>
              </div>

              <button className="osu-btn osu-btn-primary" onClick={startGame}>
                START GAME
              </button>
            </div>
          </div>
        )}

        {/* ---- PLAYING STATE ---- */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <>
            {/* TOP HUD */}
            <div className="osu-hud-top">
              <div className="osu-hud-stat">
                <span className="osu-stat-label">Score</span>
                <span className="osu-stat-value">{score}</span>
              </div>
              <div className="osu-hud-stat">
                <span className="osu-stat-label">Combo</span>
                <span className={`osu-stat-value ${combo > 0 ? 'combo-active' : ''}`}>
                  {combo}
                </span>
              </div>
              <div className="osu-hud-stat">
                <span className="osu-stat-label">Accuracy</span>
                <span className="osu-stat-value">{accuracy.toFixed(1)}%</span>
              </div>
              <div className="osu-hud-stat">
                <span className="osu-stat-label">Time</span>
                <span className="osu-stat-value">
                  {(audioTime / 1000).toFixed(1)}s / {(duration).toFixed(1)}s
                </span>
              </div>
            </div>

            {/* CIRCLE GAME AREA */}
            <div className="osu-circles-container">
              {/* Four lanes for D, F, J, K */}
              {[0, 1, 2, 3].map((position) => (
                <div key={position} className={`osu-lane lane-${position}`}>
                  {/* Target zone indicator at bottom */}
                  <div className="osu-target-zone">
                    <div className="target-ring" />
                    <span className="target-key">{POSITION_TO_KEY[position]}</span>
                  </div>

                  {/* Falling circles in this lane */}
                  {activeCircles
                    .filter((c) => c.position === position)
                    .map((circle) => (
                      <RhythmCircle
                        key={circle.id}
                        id={circle.id}
                        keyRequired={circle.key}
                        position={circle.position}
                        isActive={true}
                        audioTime={audioTime}
                        startTime={circle.startTime}
                        onHit={() => {
                          // Hit handling in parent
                        }}
                        onMiss={(id) => {
                          // Increment misses and reset combo
                          setTotalMisses((prevMisses) => {
                            const newMisses = prevMisses + 1;
                            // update accuracy using current hits
                            setAccuracy((_) => {
                              const denom = totalHits + newMisses;
                              return denom > 0 ? (totalHits / denom) * 100 : 0;
                            });
                            return newMisses;
                          });

                          setCombo(0);

                          // show miss feedback
                          const feedbackId = `feedback-miss-${Date.now()}-${Math.random()}`;
                          setFeedbackItems((prev) => [
                            ...prev,
                            { id: feedbackId, type: 'miss', position: circle.position, score: 0 },
                          ]);
                          setTimeout(() => {
                            setFeedbackItems((p) => p.filter((f) => f.id !== feedbackId));
                          }, 700);
                        }}
                      />
                    ))}
                </div>
              ))}

              {/* HIT FEEDBACK MESSAGES */}
              <div className="osu-feedback-container">
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

            {/* TYPERACER TEXT DISPLAY */}
            <div className="osu-typeracer-section">
              <TypeRacerText
                fullText={fullText}
                typedIndex={typedIndex}
              />
              <div className="osu-typing-stats">
                <span>Typed: {textCorrect} | Missed: {textMissed}</span>
              </div>
            </div>

            {/* CONTROLS */}
            <div className="osu-controls">
              {gameState === 'playing' ? (
                <button className="osu-btn osu-btn-pause" onClick={pauseGame}>
                  ⏸ PAUSE
                </button>
              ) : (
                <button className="osu-btn osu-btn-resume" onClick={resumeGame}>
                  ▶ RESUME
                </button>
              )}
              <button className="osu-btn osu-btn-quit" onClick={endGame}>
                ✕ QUIT
              </button>
            </div>

            {/* PAUSE OVERLAY */}
            {gameState === 'paused' && (
              <div className="osu-pause-overlay">
                <div className="osu-pause-content">
                  <h2>PAUSED</h2>
                  <button className="osu-btn osu-btn-primary" onClick={resumeGame}>
                    RESUME
                  </button>
                  <button className="osu-btn osu-btn-quit" onClick={endGame}>
                    QUIT
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ---- END SCREEN ---- */}
        {gameState === 'ended' && (
          <div className="osu-screen osu-end-screen">
            <div className="osu-screen-content">
              <h1 className="osu-title">GAME OVER!</h1>

              <div className="osu-results-grid">
                <div className="osu-result-item">
                  <span className="osu-result-label">Final Score</span>
                  <span className="osu-result-value">{score}</span>
                </div>
                <div className="osu-result-item">
                  <span className="osu-result-label">Max Combo</span>
                  <span className="osu-result-value">{Math.max(maxCombo, combo)}</span>
                </div>
                <div className="osu-result-item">
                  <span className="osu-result-label">Accuracy</span>
                  <span className="osu-result-value">{accuracy.toFixed(1)}%</span>
                </div>
                <div className="osu-result-item">
                  <span className="osu-result-label">Hits / Misses</span>
                  <span className="osu-result-value">
                    {totalHits} / {totalMisses}
                  </span>
                </div>
              </div>

              <div className="osu-result-action">
                <button className="osu-btn osu-btn-primary" onClick={startGame}>
                  PLAY AGAIN
                </button>
                <button className="osu-btn osu-btn-secondary" onClick={() => setGameState('ready')}>
                  BACK TO MENU
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OSUStyleRhythmGame;
