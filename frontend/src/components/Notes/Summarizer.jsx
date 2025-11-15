import React, { useState } from 'react';
import './Summarizer.css';

const Summarizer = () => {
    const [text, setText] = useState('');
    const [summary, setSummary] = useState('');

    const handleSummarize = async () => {
        // Call the summarization API or utility function here
        const response = await fetch('/api/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        const data = await response.json();
        setSummary(data.summary);
    };

    return (
        <div className="summarizer">
            <h2>Note Summarizer</h2>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your notes here..."
                rows="8"
                cols="50"
            />
            <div className="summarizer-actions">
                <button className="btn-add" onClick={handleSummarize}>Summarize</button>
            </div>
            {summary && (
                <div className="summary">
                    <h3>Summary:</h3>
                    <p>{summary}</p>
                </div>
            )}
        </div>
    );
};

export default Summarizer;