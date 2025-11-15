import React from 'react';

const NoteList = ({ notes, onDelete }) => {
    return (
        <div className="note-list">
            <h2>Your Notes</h2>
            {notes.length === 0 ? (
                <p>No notes available. Please add some notes.</p>
            ) : (
                <ul>
                    {notes.map(note => (
                        <li key={note.id}>
                            <h3>{note.title}</h3>
                            <p>{note.content}</p>
                            <button onClick={() => onDelete(note.id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NoteList;