import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RhythmNote } from './RhythmNote';
import { Button } from './ui/button';
import { Pause, Play, X } from 'lucide-react';

interface RhythmGameProps {
  audioUrl: string;
  bpm: number;
  studyText: string;
  onGameEnd: () => void;
}

interface Note {
  id: number;
  timestamp: number;
  word: string;
  x: number;
  y: number;
  color: string;
  hit?: boolean;
}

const COLORS = [
  'from-red-500 to-red-600',
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600',
  'from-yellow-500 to-yellow-600',
  'from-purple-500 to-purple-600',
  'from-pink-500 to-pink-600',
  'from-orange-500 to-orange-600',
  'from-cyan-500 to-cyan-600',
];

export function RhythmGame({ audioUrl, bpm, studyText, onGameEnd }: RhythmGameProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [hitEffects, setHitEffects] = useState<{ id: number; x: number; y: number; accuracy: string }[]>([]);
  const words = useMemo(() => studyText.split(/\s+/).filter(w => w.length > 0), [studyText]);
  const [currentInput, setCurrentInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Generate notes based on BPM with random positions
  useEffect(() => {
    if (words.length === 0) return;
    
    const beatInterval = 60 / bpm; // seconds per beat
    const generatedNotes: Note[] = [];
    const duration = audioRef.current?.duration || 60;
    
    let wordIndex = 0;
    for (let time = 2; time < duration - 2; time += beatInterval) {
      if (wordIndex >= words.length) break;
      
      // Random position (avoid edges)
      const x = 15 + Math.random() * 70; // 15-85%
      const y = 30 + Math.random() * 40; // 30-70%
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      
      generatedNotes.push({
        id: wordIndex,
        timestamp: time,
        word: words[wordIndex],
        x,
        y,
        color,
      });
      
      wordIndex++;
    }
    
    setNotes(generatedNotes);
  }, [bpm, words]);

  // Handle audio time updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Auto-play audio on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
    // Focus input
    inputRef.current?.focus();
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const checkHit = (typedWord: string) => {
    const hitWindow = 0.8; // 800ms hit window (more lenient for typing)
    const activeNotes = notes.filter(
      (note) =>
        !note.hit &&
        note.word.toLowerCase() === typedWord.toLowerCase() &&
        Math.abs(note.timestamp - currentTime) < hitWindow
    );

    if (activeNotes.length > 0) {
      const closestNote = activeNotes.reduce((prev, curr) =>
        Math.abs(curr.timestamp - currentTime) < Math.abs(prev.timestamp - currentTime)
          ? curr
          : prev
      );

      const timeDiff = Math.abs(closestNote.timestamp - currentTime);
      let points = 0;
      let accuracy = '';

      if (timeDiff < 0.2) {
        points = 300;
        accuracy = 'PERFECT!';
      } else if (timeDiff < 0.4) {
        points = 200;
        accuracy = 'GREAT!';
      } else {
        points = 100;
        accuracy = 'GOOD';
      }

      setScore((prev) => prev + points * (1 + combo * 0.1));
      setCombo((prev) => prev + 1);
      
      // Move to next word
      setCurrentWordIndex((prev) => prev + 1);

      // Visual feedback
      setHitEffects((prev) => [
        ...prev,
        { id: Date.now(), x: closestNote.x, y: closestNote.y, accuracy },
      ]);
      setTimeout(() => {
        setHitEffects((prev) => prev.slice(1));
      }, 800);

      // Mark note as hit
      closestNote.hit = true;
      setNotes([...notes]);
      setCurrentInput('');
    } else {
      // Miss - wrong word or timing
      setCombo(0);
      setCurrentInput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentInput(value);
    
    // Check if word is complete (user pressed space or entered full word)
    if (value.endsWith(' ') || value.includes(' ')) {
      const word = value.trim();
      if (word) {
        checkHit(word);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const word = currentInput.trim();
      if (word) {
        checkHit(word);
      }
    }
  };

  const activeNotes = notes.filter(
    (note) => !note.hit && note.timestamp > currentTime - 1 && note.timestamp < currentTime + 3
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      <audio ref={audioRef} src={audioUrl} />

      {/* Top UI */}
      <div className="absolute top-0 left-0 right-0 p-6 z-20">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex gap-6 text-white">
            <div>
              <div className="text-purple-300">Score</div>
              <div className="text-3xl">{Math.floor(score)}</div>
            </div>
            <div>
              <div className="text-purple-300">Combo</div>
              <div className="text-3xl text-yellow-400">{combo}x</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={togglePlayPause}
              variant="outline"
              size="icon"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              onClick={onGameEnd}
              variant="outline"
              size="icon"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Text Display - Typeracer Style */}
      <div className="absolute top-24 left-0 right-0 z-10 px-6">
        <div className="max-w-4xl mx-auto bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
          <div className="text-2xl text-white leading-relaxed min-h-[100px] flex flex-wrap justify-center items-center">
            {words.map((word, idx) => {
              const isCompleted = idx < currentWordIndex;
              const isCurrent = idx === currentWordIndex;
              const isUpcoming = idx > currentWordIndex;
              
              return (
                <span
                  key={idx}
                  className={`
                    inline-block mr-2 mb-1 transition-all duration-200
                    ${isCompleted ? 'text-green-400' : ''}
                    ${isCurrent ? 'text-yellow-300 bg-yellow-500/20 px-2 py-1 rounded scale-110' : ''}
                    ${isUpcoming ? 'text-white/40' : ''}
                  `}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative h-screen">
        {/* Notes - appearing randomly */}
        <AnimatePresence>
          {activeNotes.map((note) => (
            <RhythmNote
              key={note.id}
              note={note}
              currentTime={currentTime}
            />
          ))}
        </AnimatePresence>

        {/* Hit effects */}
        <AnimatePresence>
          {hitEffects.map((effect) => (
            <motion.div
              key={effect.id}
              initial={{ opacity: 1, scale: 1, y: 0 }}
              animate={{ opacity: 0, scale: 1.5, y: -30 }}
              exit={{ opacity: 0 }}
              className="absolute pointer-events-none z-30 text-yellow-300 text-xl font-bold"
              style={{
                left: `${effect.x}%`,
                top: `${effect.y}%`,
              }}
            >
              {effect.accuracy}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input field at bottom */}
      <div className="absolute bottom-8 left-0 right-0 z-20 px-6">
        <div className="max-w-xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type the words here..."
            className="w-full p-4 bg-black/40 backdrop-blur-sm border-2 border-purple-500/50 rounded-lg text-white text-xl text-center placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
            autoComplete="off"
            autoFocus
          />
          <div className="text-center text-purple-300/70 mt-2 text-sm">
            Press Space or Enter after typing each word
          </div>
        </div>
      </div>
    </div>
  );
}