# OSU-Style Rhythm Game Component - Setup & Integration Guide

## Overview

Complete OSU-style rhythm game with falling circles, key detection, scoring, TypeRacer text scrolling, and beat synchronization. Built with React + Tailwind CSS, fully playable locally.

## Files Created

```
frontend/src/components/Game/
├── OSUStyleRhythmGame.jsx         # Main game component
├── OSUStyleRhythmGame.css         # All animations and styling
└── OSUStyleRhythmGameDemo.jsx     # Demo with beatmap generation & testing
```

## Quick Start (Local Testing)

### Option 1: Use the Demo Component (Easiest)

1. In any React page (e.g., `frontend/src/pages/GamePage.jsx`):

```jsx
import OSUStyleRhythmGameDemo from '../components/Game/OSUStyleRhythmGameDemo';

export default function GamePage() {
  return <OSUStyleRhythmGameDemo />;
}
```

2. Start your dev server:
```bash
cd frontend
npm run dev
```

3. Navigate to the game page and click **START GAME**

### Option 2: Integrate with Backend Data

```jsx
import OSUStyleRhythmGame from '../components/Game/OSUStyleRhythmGame';

export default function GamePage({ songId }) {
  const [beatmap, setBeatmap] = useState([]);

  useEffect(() => {
    // Fetch beatmap from your backend
    fetch(`/api/beatmap/${songId}`)
      .then(res => res.json())
      .then(data => setBeatmap(data));
  }, [songId]);

  return (
    <OSUStyleRhythmGame
      songUrl={`/api/audio/${songId}`}
      beatMapData={beatmap}
      onGameEnd={(results) => {
        // Submit results to backend
        fetch('/api/scores', {
          method: 'POST',
          body: JSON.stringify({ songId, ...results })
        });
      }}
    />
  );
}
```

## Component Props

```typescript
interface OSUStyleRhythmGame {
  songUrl?: string;           // Audio file URL (default: '/default-song.mp3')
  beatMapData?: Array<{       // Array of beats with timestamps
    time: number;            // Milliseconds from start
    key: 'D' | 'F' | 'J' | 'K';  // Which key must be pressed
    text?: string;           // Optional text (for future use)
  }>;
  onGameEnd?: (results) => void;  // Callback when game ends
}
```

## Beatmap Data Format

```javascript
const beatmap = [
  { time: 2000, key: 'D', text: 'First beat' },
  { time: 2500, key: 'F', text: 'Second beat' },
  { time: 3000, key: 'J', text: 'Third beat' },
  { time: 3500, key: 'K', text: 'Fourth beat' },
  // ... more beats
];
```

### Generating Beatmaps Programmatically

```javascript
// Regular beats at BPM
function generateBeatmap(bpm = 120, durationSeconds = 30) {
  const beatmap = [];
  const beatDuration = (60 / bpm) * 1000; // ms per beat
  const keys = ['D', 'F', 'J', 'K'];
  
  for (let i = 0, time = 2000; time < durationSeconds * 1000; i++, time += beatDuration) {
    beatmap.push({
      time,
      key: keys[i % 4],
    });
  }
  return beatmap;
}
```

## Game Mechanics

### Circle Animation
- Circles spawn **2 seconds** before they appear
- Fall from top to target zone in **2 seconds**
- Target zone is at the bottom of each lane
- Each lane corresponds to a key: **D (left) → F (mid-left) → J (mid-right) → K (right)**

### Hit Detection
- **Perfect Hit**: Within ±50ms of beat time → 100 points
- **Good Hit**: Within ±150ms of beat time → 50 points
- **Miss**: Circle passes without being hit → combo resets, accuracy decreases

### Scoring
- Perfect hit: +100 points
- Good hit: +50 points
- Combo: Increases with each consecutive hit, resets on miss
- Accuracy: Calculated as `totalHits / (totalHits + totalMisses)`

### TypeRacer Text
- Text scrolls as you type (by pressing keys)
- Green = typed correctly
- Yellow = current character
- Gray = untyped
- Synced with rhythm gameplay

## Testing Your Setup

### Step 1: Verify Component Loads
```jsx
import OSUStyleRhythmGame from './OSUStyleRhythmGame';

export default function TestGame() {
  return <OSUStyleRhythmGame />;
}
```

Should show: Dark blue start screen with "OSU RHYTHM" title and START GAME button

### Step 2: Test Circle Spawning
1. Click START GAME
2. Wait 2-3 seconds
3. See circles appearing from top of lanes and falling down

### Step 3: Test Hit Detection
1. When D circle reaches the bottom target zone, **press D**
2. Should see: "PERFECT!" or "GOOD!" feedback
3. Score should increase

### Step 4: Test Miss Detection
1. Let a circle pass the target zone without pressing key
2. Should see: "MISS" feedback in red
3. Combo resets to 0

### Step 5: Test Pause
1. Press the PAUSE button during gameplay
2. Audio should stop, overlay appears
3. Press RESUME to continue

## Customization

### Change Colors
Edit `OSUStyleRhythmGame.css`:

```css
.rhythm-circle-0 {  /* D lane - red by default */
  background: radial-gradient(circle at 30% 30%, #ff6699, #ff0066);
}

.rhythm-circle-1 {  /* F lane - green by default */
  background: radial-gradient(circle at 30% 30%, #33ffcc, #00ff99);
}
```

### Adjust Timing
Edit `OSUStyleRhythmGame.jsx` constants:

```javascript
const HIT_WINDOW = 150;      // ms - wider window = easier
const FALL_DURATION = 2000;  // ms - how long circle falls
```

### Change Music
```jsx
<OSUStyleRhythmGame
  songUrl="/path/to/your/music.mp3"
  beatMapData={beatmap}
/>
```

## Common Issues & Solutions

### Issue: Audio won't play
- **Cause**: Browser autoplay policy
- **Solution**: User must interact with page first (click START GAME)

### Issue: Circles don't appear
- **Cause**: Empty beatMapData
- **Solution**: Pass beatmap with data or use OSUStyleRhythmGameDemo which generates data

### Issue: Timing feels off
- **Cause**: Beatmap timestamps incorrect
- **Solution**: Verify timestamps are in milliseconds from audio start

### Issue: Hit window too strict/loose
- **Cause**: HIT_WINDOW constant too small/large
- **Solution**: Adjust HIT_WINDOW in JSX (default: 150ms)

## Performance Tips

- Beatmaps with >100 simultaneous circles may lag
- Pre-generate beatmaps server-side instead of client-side
- Use requestAnimationFrame for timing (already implemented)
- CSS animations are GPU-accelerated (smooth even with many circles)

## Backend Integration Checklist

- [ ] Create `/api/beatmap/:songId` endpoint that returns array of beats
- [ ] Audio file served at `/api/audio/:songId` or public CDN
- [ ] Create `/api/scores` POST endpoint to save game results
- [ ] Beatmap generation/analysis (can use existing `CS Girlies/` tools)
- [ ] Audio BPM detection (optional, for auto-generating beatmaps)

## Files Ready to Use

1. **OSUStyleRhythmGame.jsx** - Main game logic
   - Fully commented
   - All animations & timing
   - Key detection & scoring
   - Text scrolling

2. **OSUStyleRhythmGame.css** - Complete styling
   - Falling circle animations
   - Hit/miss feedback effects
   - TypeRacer text display
   - Responsive design
   - Accessibility (reduced motion support)

3. **OSUStyleRhythmGameDemo.jsx** - Demo & testing
   - Beatmap generation functions
   - Integration examples
   - Testing checklist
   - Usage documentation

## Next Steps

1. **Test locally** using OSUStyleRhythmGameDemo
2. **Verify timing** feels good with your audio file
3. **Integrate backend** data when ready
4. **Customize colors/style** to match your brand
5. **Add more beatmaps** or procedural generation

## Support & Debugging

All components are heavily commented. Read the comments for:
- How circle timing works
- Key detection logic
- Animation calculations
- Integration patterns

Questions? Check the embedded comments in:
- `OSUStyleRhythmGame.jsx` - Game logic explanations
- `OSUStyleRhythmGame.css` - Animation descriptions
- `OSUStyleRhythmGameDemo.jsx` - Integration examples

---

**Ready to test?** Go to your game page and import `OSUStyleRhythmGameDemo`!
