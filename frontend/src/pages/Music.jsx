import React, { useState, useRef } from 'react';
import './Music.css';

const Music = () => {
    const [music, setMusic] = useState([
        { id: 1, name: 'Lo-fi Study', bpm: 120, img: '🎹', source: 'preset' },
        { id: 2, name: 'Synthwave Beat', bpm: 140, img: '🎸', source: 'preset' },
        { id: 3, name: 'Chill Vibes', bpm: 100, img: '🎺', source: 'preset' },
    ]);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [songName, setSongName] = useState('');
    const [bpm, setBpm] = useState(120);
    const [currentPlaying, setCurrentPlaying] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const [addingYoutube, setAddingYoutube] = useState(false);
    const fileInputRef = useRef(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleAddYoutubeTrack = () => {
        if (!youtubeUrl.trim() || !songName.trim()) {
            alert('Please enter both URL and song name');
            return;
        }

        setAddingYoutube(true);
        // Simulate YouTube fetch and conversion
        setTimeout(() => {
            const newTrack = {
                id: Date.now(),
                name: songName,
                bpm: parseInt(bpm),
                img: '🎵',
                source: 'youtube',
                url: youtubeUrl
            };
            setMusic([...music, newTrack]);
            setYoutubeUrl('');
            setSongName('');
            setBpm(120);
            setAddingYoutube(false);
        }, 1500);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file || !songName.trim()) {
            alert('Please enter a song name first');
            return;
        }

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
                clearInterval(interval);
                progress = 100;
                setUploadProgress(0);

                const newTrack = {
                    id: Date.now(),
                    name: songName,
                    bpm: parseInt(bpm),
                    img: '📁',
                    source: 'uploaded',
                    fileName: file.name
                };
                setMusic([...music, newTrack]);
                setSongName('');
                setBpm(120);
                fileInputRef.current.value = '';
            }
            setUploadProgress(Math.min(progress, 100));
        }, 300);
    };

    const handlePlay = (track) => {
        setCurrentPlaying(track.id);
        setIsPlaying(true);
    };

    const handlePause = () => {
        setIsPlaying(false);
    };

    const handleStop = () => {
        setCurrentPlaying(null);
        setIsPlaying(false);
    };

    const handleDelete = (id) => {
        setMusic(music.filter(m => m.id !== id));
        if (currentPlaying === id) {
            handleStop();
        }
    };

    const currentTrack = music.find(m => m.id === currentPlaying);

    return (
        <div className="music-page">
            <div className="music-header">
                <h1>🎵 Music Library</h1>
                <p className="subtitle">Upload your own tracks or add from YouTube to sync with the rhythm game</p>
            </div>

            <div className="music-container">
                {/* Now Playing */}
                <div className="now-playing-section">
                    <div className="now-playing-card">
                        <div className="player-display">
                            {currentTrack ? (
                                <>
                                    <div className="player-icon">{currentTrack.img}</div>
                                    <div className="player-info">
                                        <h3>{currentTrack.name}</h3>
                                        <p>BPM: {currentTrack.bpm}</p>
                                    </div>
                                    <div className="player-controls">
                                        <button
                                            className="control-btn"
                                            onClick={isPlaying ? handlePause : () => handlePlay(currentTrack)}
                                        >
                                            {isPlaying ? '⏸️' : '▶️'}
                                        </button>
                                        <button className="control-btn stop" onClick={handleStop}>
                                            ⏹️
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="no-playing">
                                    <div className="no-playing-icon">🎧</div>
                                    <p>Select a track to play</p>
                                </div>
                            )}
                        </div>

                        {currentTrack && (
                            <div className="progress-bar-wrapper">
                                <input type="range" className="progress-input" defaultValue="0" max="100" />
                                <div className="time-display">
                                    <span>0:00</span>
                                    <span>3:45</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upload Sections */}
                <div className="upload-sections">
                    {/* YouTube Upload */}
                    <div className="upload-card youtube-upload">
                        <h2>🔗 Add from YouTube</h2>
                        <p className="card-desc">Paste a YouTube music URL and customize the BPM</p>

                        <div className="form-group">
                            <label>YouTube URL</label>
                            <input
                                type="text"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Song Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter song name..."
                                    value={songName}
                                    onChange={(e) => setSongName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>BPM</label>
                                <input
                                    type="number"
                                    min="60"
                                    max="200"
                                    value={bpm}
                                    onChange={(e) => setBpm(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            className="btn-add"
                            onClick={handleAddYoutubeTrack}
                            disabled={addingYoutube}
                        >
                            {addingYoutube ? '⏳ Processing...' : '➕ Add from YouTube'}
                        </button>
                    </div>

                    {/* File Upload */}
                    <div className="upload-card file-upload">
                        <h2>📁 Upload Local File</h2>
                        <p className="card-desc">Upload MP3 or WAV files from your device</p>

                        <div className="form-group">
                            <label>Song Name</label>
                            <input
                                type="text"
                                placeholder="Enter song name..."
                                value={songName}
                                onChange={(e) => setSongName(e.target.value)}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>BPM</label>
                                <input
                                    type="number"
                                    min="60"
                                    max="200"
                                    value={bpm}
                                    onChange={(e) => setBpm(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>&nbsp;</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                <button
                                    type="button"
                                    className="btn-file-select"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Choose File
                                </button>
                            </div>
                        </div>

                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="upload-progress">
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                                </div>
                                <span>{uploadProgress}%</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Music Library */}
                <div className="music-library">
                    <div className="library-header">
                        <h2>📚 Your Library</h2>
                        <span className="library-count">{music.length} tracks</span>
                    </div>

                    <div className="music-grid">
                        {music.map(track => (
                            <div
                                key={track.id}
                                className={`music-card ${currentPlaying === track.id ? 'playing' : ''}`}
                            >
                                <div className="card-header">
                                    <div className="track-icon">{track.img}</div>
                                    <span className="source-badge">{track.source}</span>
                                </div>

                                <div className="card-body">
                                    <h3>{track.name}</h3>
                                    <p className="bpm-display">BPM: {track.bpm}</p>
                                </div>

                                <div className="card-footer">
                                    <button
                                        className="btn-card-play"
                                        onClick={() => handlePlay(track)}
                                    >
                                        ▶️ Play
                                    </button>
                                    <button
                                        className="btn-card-delete"
                                        onClick={() => handleDelete(track.id)}
                                    >
                                        🗑️
                                    </button>
                                </div>

                                {currentPlaying === track.id && (
                                    <div className="now-playing-indicator">
                                        <div className="indicator"></div>
                                        <div className="indicator"></div>
                                        <div className="indicator"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Music;