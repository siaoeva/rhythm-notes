import React, { useEffect, useState } from 'react';
import './Notes.css';
import NoteList from '../components/Notes/NoteList';
import NoteEditor from '../components/Notes/NoteEditor';
import Summarizer from '../components/Notes/Summarizer';
import Flashcards, {DEFAULT_CARDS} from '../components/Notes/Flashcards';

const Notes = () => {
  // sample / placeholder notes (replace with real backend data)
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'C/C++ Quick Reference',
      content: 'Pointers, memory layout, STL basics, compilation flags...',
      summary: 'Placeholder AI summary: core topics include pointers, memory management, and STL usage.',
      date: '11/15/2025',
      type: 'pdf'
    },
    {
      id: 2,
      title: 'React Hooks Guide',
      content: 'useState, useEffect, custom hooks, optimization patterns...',
      summary: 'Placeholder AI summary: hooks for state & effects, patterns for reusability.',
      date: '11/10/2025',
      type: 'text'
    }
  ]);

  const [selectedId, setSelectedId] = useState(notes[0]?.id || null);
  const [editingNote, setEditingNote] = useState(null);
  const [showSummarizer, setShowSummarizer] = useState(false);
  const [flashcards, setFlashcards] = useState(null);
  const [showFlashModal, setShowFlashModal] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!selectedId && notes.length) setSelectedId(notes[0].id);
  }, [notes, selectedId]);

  const selectedNote = notes.find(n => n.id === selectedId) || null;

  const handleSelect = (id) => setSelectedId(id);

  const handleDelete = (id) => {
    if (!window.confirm('Delete this note?')) return;
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleSave = (updated) => {
    if (editingNote?.id) {
      setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...n, ...updated } : n));
    } else {
      const newNote = {
        id: Date.now(),
        title: updated.title || 'Untitled',
        content: updated.content || '',
        summary: 'AI summary placeholder',
        date: new Date().toLocaleDateString(),
        type: 'text'
      };
      setNotes(prev => [newNote, ...prev]);
      setSelectedId(newNote.id);
    }
    setEditingNote(null);
  };

  const handleCreateFlashcards = (note) => {
    setFlashcards({ noteId: note.id, cards: DEFAULT_CARDS.slice() });
    setShowFlashModal(true);
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(query.toLowerCase()) ||
    n.content.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="notes-page">
      <div className="notes-header">
        <div>
          <h1>📚 Notes & Summaries</h1>
          <p className="subtitle">All uploaded notes, AI summaries, and study tools in one place.</p>
        </div>
        <div className="notes-actions">
          <a className="btn-primary" href="/upload">+ New Note</a>
          <button className="btn-ghost" onClick={() => setShowSummarizer(v => !v)}>{showSummarizer ? 'Close Summarizer' : 'Open Summarizer'}</button>
        </div>
      </div>

      <div className="notes-grid">
        <aside className="notes-sidebar">
          <div className="search-box">
            <input placeholder="Search notes..." value={query} onChange={e => setQuery(e.target.value)} />
            <span className="count-badge">{filtered.length}</span>
          </div>

          <div className="sidebar-list">
            {filtered.map(n => (
              <div
                key={n.id}
                className={`sidebar-item ${n.id === selectedId ? 'active' : ''}`}
                onClick={() => handleSelect(n.id)}
              >
                <div className="item-left">
                  <div className="item-icon">{n.type === 'pdf' ? '📄' : '📝'}</div>
                  <div>
                    <div className="item-title">{n.title}</div>
                    <div className="item-meta">{n.date} • {n.content.slice(0, 60)}...</div>
                  </div>
                </div>
                <div className="item-actions">
                  <button onClick={(e) => { e.stopPropagation(); handleCreateFlashcards(n); }}>⚡ Flashcards</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}>🗑️</button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="empty-note">No notes found.</div>}
          </div>
        </aside>

        <main className="notes-main">
          {!selectedNote && !editingNote ? (
            <div className="empty-main">
              <h2>No note selected</h2>
              <p>Select a note from the left or create a new one.</p>
            </div>
          ) : editingNote ? (
            <NoteEditor note={editingNote} onSave={handleSave} onCancel={() => setEditingNote(null)} />
          ) : (
            <div className="note-card">
              <div className="note-card-header">
                <div>
                  <h2>{selectedNote.title}</h2>
                  <p className="muted">{selectedNote.date} • {selectedNote.type}</p>
                </div>

                <div className="note-actions">
                  <button className="btn-outline" onClick={() => setEditingNote(selectedNote)}>Edit</button>
                  <button className="btn-primary" onClick={() => handleCreateFlashcards(selectedNote)}>Generate Flashcards</button>
                  <button className="btn-ghost" onClick={() => alert('Download placeholder')}>Download</button>
                </div>
              </div>

              <div className="note-summary">
                <h3>🤖 AI Summary</h3>
                <p className="summary-text">{selectedNote.summary || 'Summary placeholder — will be generated by backend AI.'}</p>

                <div className="summary-points">
                  <div className="point">• Key idea 1 — concise takeaway</div>
                  <div className="point">• Key idea 2 — concise takeaway</div>
                  <div className="point">• Suggested topics to review</div>
                </div>
              </div>

              <div className="note-content">
                <h4>Original Content</h4>
                <p>{selectedNote.content}</p>
              </div>
            </div>
          )}
        </main>

        
      </div>

       {showFlashModal && flashcards && (
        <div className="flash-modal">
          <div className="flash-dialog">
            <button className="close-x" onClick={() => setShowFlashModal(false)}>✕</button>
            <Flashcards
              cards={flashcards.cards}
              noteTitle={notes.find(n => n.id === flashcards.noteId)?.title}
              onClose={() => setShowFlashModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;