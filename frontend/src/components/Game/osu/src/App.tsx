import { useState } from 'react';
import { RhythmGame } from './components/RhythmGame';
import { Button } from './components/ui/button';
import { Upload, Music } from 'lucide-react';

export default function App() {
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [bpm, setBpm] = useState<number>(120);
  const [studyText, setStudyText] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioFile(url);
    }
  };

  const handleStart = () => {
    if (audioFile && studyText && bpm) {
      setIsPlaying(true);
    }
  };

  const handleGameEnd = () => {
    setIsPlaying(false);
  };

  if (isPlaying && audioFile) {
    return (
      <RhythmGame
        audioUrl={audioFile}
        bpm={bpm}
        studyText={studyText}
        onGameEnd={handleGameEnd}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music className="w-12 h-12 text-purple-300" />
            <h1 className="text-white">Rhythm Study Game</h1>
          </div>
          <p className="text-purple-200">Learn while you play! Upload a song and add text to memorize.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-purple-200 mb-2">
              Upload MP3 File
            </label>
            <div className="relative">
              <input
                type="file"
                accept="audio/mp3,audio/mpeg"
                onChange={handleFileUpload}
                className="hidden"
                id="audio-upload"
              />
              <label
                htmlFor="audio-upload"
                className="flex items-center justify-center gap-2 w-full p-4 bg-white/5 border-2 border-dashed border-purple-300/50 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
              >
                <Upload className="w-5 h-5 text-purple-300" />
                <span className="text-purple-200">
                  {audioFile ? 'Audio file uploaded ✓' : 'Click to upload audio'}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="bpm" className="block text-purple-200 mb-2">
              BPM (Beats Per Minute)
            </label>
            <input
              id="bpm"
              type="number"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              min="60"
              max="200"
              className="w-full p-3 bg-white/5 border border-purple-300/50 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="e.g., 120"
            />
          </div>

          <div>
            <label htmlFor="text" className="block text-purple-200 mb-2">
              Study Text (words will appear in rhythm)
            </label>
            <textarea
              id="text"
              value={studyText}
              onChange={(e) => setStudyText(e.target.value)}
              rows={6}
              className="w-full p-3 bg-white/5 border border-purple-300/50 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              placeholder="Enter text you want to memorize... Words will appear one by one as you hit the rhythm notes!"
            />
          </div>

          <Button
            onClick={handleStart}
            disabled={!audioFile || !studyText || !bpm}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Rhythm Study Session
          </Button>
        </div>
      </div>
    </div>
  );
}
