import React, { useState } from 'react';

const NoteEditor = ({ note, onSave, onCancel }) => {
    const [title, setTitle] = useState(note ? note.title : '');
    const [content, setContent] = useState(note ? note.content : '');

    const handleSave = () => {
        const updatedNote = { title, content };
        onSave(updatedNote);
    };

    return (
        <div className="note-editor">
            <h2>{note ? 'Edit Note' : 'New Note'}</h2>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <div className="editor-actions">
                <button onClick={handleSave}>Save</button>
                <button onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
};

export default NoteEditor;