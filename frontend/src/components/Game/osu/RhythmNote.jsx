import React, { useEffect, useState } from 'react';
import './RhythmNote.css';

const RhythmNote = ({ id, position, currentTime, hitTime, isHit, onHit, onMiss }) => {
    const [state, setState] = useState('falling');
    const FALL_DURATION = 2000;
    const HIT_WINDOW = 150;

    const timeSinceHit = currentTime - hitTime;
    const fallProgress = Math.max(0, Math.min(1, (timeSinceHit + FALL_DURATION) / FALL_DURATION));

    useEffect(() => {
        if (!isHit && state === 'falling' && fallProgress >= 1) {
            setState('missed');
            onMiss(id);
        }
    }, [fallProgress, state, id, onMiss, isHit]);

    if (isHit) {
        return null;
    }

    const positionOffset = position * 25;

    return (
        <div
            className={`rhythm-note rhythm-note-${position} ${state}`}
            style={{
                left: `${positionOffset}%`,
                bottom: `${Math.max(0, 15 + fallProgress * 70)}%`,
                opacity: Math.max(0, 1 - Math.max(0, fallProgress - 0.85) * 6),
            }}
        >
            <div className="note-circle">
                <div className="note-inner" />
                <svg className="note-ring" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" />
                </svg>
            </div>
        </div>
    );
};

export default RhythmNote;