/**
 * OSU RHYTHM GAME - LOCAL TESTING & DEMO
 * 
 * This file demonstrates how to use the OSUStyleRhythmGame component.
 * It includes:
 * - Sample beatmap data generation
 * - Integration examples
 * - Testing with mock audio
 * 
 * Usage:
 * 1. Import this component in your page: import OSUStyleRhythmGameDemo from './OSUStyleRhythmGameDemo'
 * 2. Use the component: <OSUStyleRhythmGameDemo />
 * 3. The component handles everything: circles, timing, key detection, scoring
 */

import React, { useState } from 'react';
import OSUStyleRhythmGame from './OSUStyleRhythmGame';

/**
 * BEATMAP GENERATION UTILITIES
 * 
 * Create sample beatmap data for testing.
 * Real beatmaps would come from backend analysis of songs.
 */

// Generate a simple regular beatmap at consistent intervals
const generateRegularBeatmap = (bpm = 120, durationSeconds = 30) => {
  const beatmap = [];
  const beatDuration = (60 / bpm) * 1000; // ms per beat
  const keys = ['D', 'F', 'J', 'K'];
  
  // Start after 2 seconds
  let currentTime = 2000;
  let keyIndex = 0;

  while (currentTime < durationSeconds * 1000) {
    beatmap.push({
      time: currentTime,
      key: keys[keyIndex % 4],
      text: `Beat at ${(currentTime / 1000).toFixed(1)}s`,
    });

    currentTime += beatDuration;
    keyIndex++;
  }

  return beatmap;
};

// Generate a more complex pattern (useful for testing)
const generatePatternBeatmap = (durationSeconds = 30) => {
  const beatmap = [];

  // Pattern 1: Simple alternating D-K (0-6s)
  for (let i = 0; i < 4; i++) {
    beatmap.push({ time: 2000 + i * 500, key: i % 2 === 0 ? 'D' : 'K', text: 'Pattern 1' });
  }

  // Pattern 2: Quad tap D-F-J-K (6-8s)
  for (let i = 0; i < 2; i++) {
    beatmap.push({ time: 6000 + i * 2000, key: 'D', text: 'Quad tap' });
    beatmap.push({ time: 6000 + i * 2000 + 400, key: 'F', text: 'Quad tap' });
    beatmap.push({ time: 6000 + i * 2000 + 800, key: 'J', text: 'Quad tap' });
    beatmap.push({ time: 6000 + i * 2000 + 1200, key: 'K', text: 'Quad tap' });
  }

  // Pattern 3: Rapid fire (10-12s)
  for (let i = 0; i < 8; i++) {
    beatmap.push({ time: 10000 + i * 200, key: ['D', 'F', 'J', 'K'][i % 4], text: 'Rapid' });
  }

  // Pattern 4: Slow stretch (14-20s)
  for (let i = 0; i < 4; i++) {
    beatmap.push({ time: 14000 + i * 1500, key: ['D', 'J', 'K', 'F'][i], text: 'Slow' });
  }

  return beatmap;
};

// Generate a burst pattern (many circles in quick succession)
const generateBurstBeatmap = (durationSeconds = 30) => {
  const beatmap = [];
  const keys = ['D', 'F', 'J', 'K'];

  // Intro silence (2s)
  // Then bursts every 3s
  for (let burst = 0; burst < 8; burst++) {
    const burstStart = 2000 + burst * 3000;

    // Each burst has 8 notes in quick succession
    for (let i = 0; i < 8; i++) {
      beatmap.push({
        time: burstStart + i * 150,
        key: keys[i % 4],
        text: `Burst ${burst + 1}`,
      });
    }
  }

  return beatmap;
};

// ============================================================================

/**
 * MAIN DEMO COMPONENT
 */
const OSUStyleRhythmGameDemo = () => {
  const [beatmapType, setBeatmapType] = useState('regular');
  const [selectedBeatmap, setSelectedBeatmap] = useState([]);
  const [gameResults, setGameResults] = useState(null);

  // Generate appropriate beatmap when type changes
  React.useEffect(() => {
    let beatmap = [];

    switch (beatmapType) {
      case 'regular':
        beatmap = generateRegularBeatmap(120, 30);
        break;
      case 'pattern':
        beatmap = generatePatternBeatmap(30);
        break;
      case 'burst':
        beatmap = generateBurstBeatmap(30);
        break;
      default:
        beatmap = generateRegularBeatmap(120, 30);
    }

    setSelectedBeatmap(beatmap);
    setGameResults(null);
  }, [beatmapType]);

  const handleGameEnd = (results) => {
    console.log('Game ended with results:', results);
    setGameResults(results);
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {/* BEATMAP SELECTOR (shown only on start screen) */}
      {!gameResults && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 50,
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '1rem',
            borderRadius: '8px',
            border: '2px solid rgba(0, 200, 255, 0.3)',
            color: '#aabbdd',
          }}
        >
          <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
            SELECT BEATMAP:
          </div>
          <select
            value={beatmapType}
            onChange={(e) => setBeatmapType(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: 'none',
              background: 'rgba(0, 200, 255, 0.2)',
              color: '#00d4ff',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <option value="regular">Regular (120 BPM)</option>
            <option value="pattern">Pattern Mix</option>
            <option value="burst">Burst Mode</option>
          </select>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#6699bb' }}>
            Circles: {selectedBeatmap.length}
          </div>
        </div>
      )}

      {/* GAME RESULTS PANEL (shown when game ends) */}
      {gameResults && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 50,
            background: 'rgba(0, 0, 0, 0.9)',
            padding: '1.5rem',
            borderRadius: '8px',
            border: '2px solid rgba(0, 200, 255, 0.5)',
            color: '#aabbdd',
            maxWidth: '300px',
            fontSize: '0.9rem',
          }}
        >
          <div style={{ color: '#00d4ff', fontWeight: 'bold', marginBottom: '1rem' }}>
            LAST GAME RESULTS:
          </div>
          <div style={{ marginBottom: '0.5rem' }}>Score: {gameResults.finalScore}</div>
          <div style={{ marginBottom: '0.5rem' }}>Max Combo: {gameResults.maxCombo}</div>
          <div style={{ marginBottom: '0.5rem' }}>Accuracy: {gameResults.accuracy.toFixed(1)}%</div>
          <div style={{ marginBottom: '0.5rem' }}>
            Hits: {gameResults.totalHits} / Misses: {gameResults.totalMisses}
          </div>
          <button
            onClick={() => setGameResults(null)}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: 'rgba(0, 200, 255, 0.3)',
              border: 'none',
              borderRadius: '4px',
              color: '#00d4ff',
              cursor: 'pointer',
              fontWeight: 'bold',
              width: '100%',
            }}
          >
            CLOSE
          </button>
        </div>
      )}

      {/* GAME COMPONENT */}
      <OSUStyleRhythmGame
        songUrl="/default-song.mp3" // Use any audio file or URL
        beatMapData={selectedBeatmap}
        onGameEnd={handleGameEnd}
      />
    </div>
  );
};

export default OSUStyleRhythmGameDemo;

// ============================================================================
// INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example 1: Use in a Page Component
 * 
 * import OSUStyleRhythmGameDemo from './components/Game/OSUStyleRhythmGameDemo';
 * 
 * export default function GamePage() {
 *   return <OSUStyleRhythmGameDemo />;
 * }
 */

/**
 * Example 2: Integrate with Real Backend Data
 * 
 * const [beatmap, setBeatmap] = useState([]);
 * 
 * useEffect(() => {
 *   // Fetch beatmap from your backend
 *   fetch('/api/beatmap/song-id')
 *     .then(res => res.json())
 *     .then(data => setBeatmap(data))
 * }, []);
 * 
 * return (
 *   <OSUStyleRhythmGame
 *     songUrl="/api/audio/song-id"
 *     beatMapData={beatmap}
 *     onGameEnd={(results) => {
 *       // Submit results to backend
 *       fetch('/api/scores', {
 *         method: 'POST',
 *         body: JSON.stringify(results)
 *       })
 *     }}
 *   />
 * );
 */

/**
 * Example 3: Custom Beatmap Generation
 * 
 * function generateCustomBeatmap(notePattern) {
 *   // notePattern: 'DFJKDFJK...'
 *   const beatmap = [];
 *   let time = 2000;
 *   const interval = 500; // 500ms between notes
 *   
 *   for (let char of notePattern) {
 *     beatmap.push({ time, key: char, text: '' });
 *     time += interval;
 *   }
 *   
 *   return beatmap;
 * }
 */

// ============================================================================
// HOW THE GAME WORKS - STEP BY STEP
// ============================================================================

/**
 * 1. INITIALIZATION
 *    - Component receives beatMapData with timestamps and keys
 *    - Audio file is loaded (src from songUrl prop)
 *    - Game state set to 'ready' (start screen shown)
 * 
 * 2. START GAME
 *    - Audio plays from 0ms
 *    - requestAnimationFrame loop starts
 *    - Every frame: check if new circles should spawn
 * 
 * 3. CIRCLE SPAWNING
 *    - For each beat in beatMapData:
 *      - Calculate: should this beat spawn NOW?
 *      - If (beat.time <= currentAudioTime + 1000ms) and not yet spawned:
 *        - Create circle with beat.key and beat.time
 *        - Circle will animate downward
 * 
 * 4. CIRCLE ANIMATION
 *    - Circle position = TOP + (elapsed / FALL_DURATION) * (TARGET - TOP)
 *    - Circle falls from 0% to 75% in 2 seconds
 *    - Every frame: recalculate position based on elapsed time
 * 
 * 5. KEY PRESS DETECTION
 *    - Listen to 'keydown' events (D, F, J, K)
 *    - For each active circle in that lane:
 *      - Calculate: timeDiff = abs(currentAudioTime - circle.startTime)
 *      - If timeDiff < 150ms: HIT! (150ms window around perfect time)
 *        - If timeDiff < 50ms: PERFECT (100 points)
 *        - Else: GOOD (50 points)
 *        - Remove circle, increase combo
 *      - If timeDiff >= 150ms: circle will eventually miss
 * 
 * 6. MISS DETECTION
 *    - If circle.startTime + FALL_DURATION + 300ms has passed:
 *      - Circle not hit, mark as MISS
 *      - Reset combo, decrease accuracy
 *      - Remove circle
 * 
 * 7. TEXT TYPING
 *    - User typing matches keys being pressed
 *    - Each key press also matches text[typedIndex]
 *    - Visual feedback: green for correct, red for miss
 *    - Text scrolls to show current position
 * 
 * 8. SCORING
 *    - Perfect hit: 100 points
 *    - Good hit: 50 points
 *    - Combo multiplier: higher combos = more points (future enhancement)
 *    - Accuracy: totalHits / (totalHits + totalMisses)
 * 
 * 9. END GAME
 *    - Audio ends or user quits
 *    - Final stats calculated and displayed
 *    - onGameEnd callback fired with results
 */

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

/**
 * Test Cases to Verify Locally:
 * 
 * [ ] START SCREEN
 *     - Key guide displays all 4 keys (D, F, J, K)
 *     - START GAME button is clickable
 * 
 * [ ] CIRCLE SPAWNING & ANIMATION
 *     - Circles appear from top of lane
 *     - Circles fall smoothly to target zone at bottom
 *     - Circles in correct lanes (D left, K right)
 *     - Circles labeled with correct keys
 * 
 * [ ] HIT DETECTION (most important!)
 *     - Press D when D circle reaches target: "PERFECT" or "GOOD" appears
 *     - Score increases (+100 for perfect, +50 for good)
 *     - Combo counter increases
 *     - Circle pops and disappears
 * 
 * [ ] MISS DETECTION
 *     - If circle passes target zone without being hit:
 *       - "MISS" feedback appears
 *       - Combo resets to 0
 *       - Accuracy decreases slightly
 * 
 * [ ] KEY PRESS TIMING
 *     - Pressing too early (> 150ms): no hit
 *     - Pressing exact time: PERFECT
 *     - Pressing slightly late (< 150ms): GOOD
 *     - Window should feel forgiving but challenging
 * 
 * [ ] TEXT SCROLLING
 *     - Text updates as you "type" (press keys)
 *     - Current character highlighted in yellow
 *     - Typed characters turn green
 *     - Untyped characters are gray
 * 
 * [ ] PAUSE/RESUME
 *     - Game pauses when clicking PAUSE
 *     - Audio stops playing
 *     - Overlay appears with RESUME and QUIT buttons
 *     - Resume works and continues game
 * 
 * [ ] END GAME & RESULTS
 *     - Final score displays
 *     - Max combo displays
 *     - Accuracy percentage correct
 *     - Hits and misses totaled correctly
 *     - PLAY AGAIN button starts new game
 *     - BACK TO MENU button returns to start screen
 * 
 * [ ] RESPONSIVE
 *     - Game playable at different window sizes
 *     - Circles remain in correct lanes
 *     - Text doesn't overflow
 */
