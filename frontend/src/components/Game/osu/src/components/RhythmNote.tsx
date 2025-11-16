import { motion } from 'motion/react';

interface Note {
  id: number;
  timestamp: number;
  word: string;
  x: number;
  y: number;
  color: string;
  hit?: boolean;
}

interface RhythmNoteProps {
  note: Note;
  currentTime: number;
}

export function RhythmNote({ note, currentTime }: RhythmNoteProps) {
  // Calculate timing for animations
  const timeUntilHit = note.timestamp - currentTime;
  const appearTime = 3; // appear 3 seconds before
  const perfectTime = 0.2; // perfect hit window
  
  // Determine size and opacity based on timing
  const isPerfectTiming = Math.abs(timeUntilHit) < perfectTime;
  const isGoodTiming = Math.abs(timeUntilHit) < 0.4;
  
  // Scale effect - grows as it gets closer to perfect timing
  const scale = timeUntilHit > 0 
    ? Math.max(0.6, 1 - (timeUntilHit / appearTime) * 0.4)
    : 1;
  
  // Pulse effect when in hit window
  const shouldPulse = Math.abs(timeUntilHit) < 0.8;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: timeUntilHit < -1 ? 0 : 1,
        scale: timeUntilHit < -1 ? 0 : scale,
      }}
      exit={{ opacity: 0, scale: 0 }}
      className="absolute z-10"
      style={{
        left: `${note.x}%`,
        top: `${note.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="relative">
        {/* Main circle with word */}
        <motion.div
          animate={shouldPulse ? {
            scale: [1, 1.1, 1],
          } : {}}
          transition={{
            duration: 0.8,
            repeat: shouldPulse ? Infinity : 0,
            ease: "easeInOut"
          }}
          className={`
            px-6 py-4 rounded-full 
            bg-gradient-to-br ${note.color} 
            shadow-2xl shadow-white/20 
            flex items-center justify-center 
            text-white
            border-4
            ${isPerfectTiming ? 'border-yellow-300' : isGoodTiming ? 'border-green-300' : 'border-white/50'}
          `}
        >
          <div className="text-xl font-semibold whitespace-nowrap">
            {note.word}
          </div>
        </motion.div>
        
        {/* Outer ring that shrinks as timing approaches */}
        {timeUntilHit > 0 && timeUntilHit < appearTime && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-white/40"
            initial={{ scale: 3, opacity: 0.6 }}
            animate={{ 
              scale: 1 + (timeUntilHit / appearTime) * 2,
              opacity: timeUntilHit / appearTime * 0.6
            }}
            style={{
              transformOrigin: 'center',
            }}
          />
        )}
        
        {/* Perfect timing indicator */}
        {isPerfectTiming && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-yellow-300"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        
        {/* Glow effect */}
        <div 
          className={`
            absolute inset-0 rounded-full blur-xl -z-10
            bg-gradient-to-br ${note.color}
            ${shouldPulse ? 'opacity-60' : 'opacity-30'}
          `}
        />
      </div>
    </motion.div>
  );
}
