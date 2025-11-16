import React, { useMemo, useState, useEffect } from 'react';
import './Flashcards.css';

export const DEFAULT_CARDS = [
  { q: 'What is a protein?', a: 'One or more polypeptides twisted and folded into a particular 3D shape that performs a specific function.' },
  { q: 'What is a polypeptide?', a: 'A polymer of amino acids joined by peptide bonds to form a long chain with a unique linear sequence.' },
  { q: 'What are the components of an amino acid?', a: 'An amino group, a carboxyl group, a hydrogen (H), and an R group.' },
  { q: 'How are the 20 types of amino acids categorized?', a: 'Based on their R groups: Non-polar (hydrophobic), Polar (hydrophilic), Charged (hydrophilic).' },
  { q: 'How are amino acids joined together?', a: 'By a peptide linkage (bond), which is made by dehydration synthesis between a carboxyl group and an amino group.' },
  { q: "What determines a protein's function?", a: "Its 3D shape (conformation), which gives it the ability to recognize and bind to other molecules." },
  { q: 'Types of Proteins: Enzymatic Proteins', a: 'Function: Selectively accelerate chemical reactions. Example: Digestive enzymes.' },
  { q: 'Types of Proteins: Storage Proteins', a: 'Function: Storage of amino acids. Examples: Ovalbumin (egg white), casein (milk).' },
  { q: 'Types of Proteins: Structural Proteins', a: 'Function: Support. Examples: Silk fibers, collagen, elastin.' },
  { q: 'Types of Proteins: Transport Proteins', a: 'Function: Transport of other substances. Example: Hemoglobin.' },
  { q: 'Types of Proteins: Hormonal Proteins', a: "Function: Coordination of an organism's activities. Example: Insulin." },
  { q: 'Types of Proteins: Receptor Proteins', a: 'Function: Response of a cell to chemical stimuli. Example: Nerve cell receptors.' },
  { q: 'Types of Proteins: Contractile / Motor Proteins', a: 'Function: Movement. Examples: Actin and myosin in muscles.' },
  { q: 'Types of Proteins: Defensive Proteins', a: 'Function: Protection against disease. Example: Antibodies.' }
];

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// pick n random unique items from array
function sampleArray(arr, n) {
  if (n >= arr.length) return shuffleArray(arr).slice();
  const shuffled = shuffleArray(arr);
  return shuffled.slice(0, n);
}

const Flashcards = ({ cards = null, noteTitle = 'Note', onClose = null, onSave = null, count = 3 }) => {
  // If cards provided, sample `count` random cards from them.
  // Otherwise sample from DEFAULT_CARDS.
  const initialDeck = useMemo(() => {
    const source = cards && cards.length ? cards.slice() : DEFAULT_CARDS.slice();
    return sampleArray(source, count);
  }, [cards, count]);

  const [deck, setDeck] = useState(initialDeck);
  const [flipped, setFlipped] = useState(() => new Set());
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');

  useEffect(() => {
    setDeck(initialDeck);
    setFlipped(new Set());
    setEditingIndex(-1);
  }, [initialDeck]);

  const toggleFlip = (i) => {
    const s = new Set(flipped);
    if (s.has(i)) s.delete(i);
    else s.add(i);
    setFlipped(s);
  };

  const startEdit = (i) => {
    setEditingIndex(i);
    setEditFront(deck[i].q);
    setEditBack(deck[i].a);
  };

  const saveEdit = () => {
    if (editingIndex < 0) return;
    setDeck(prev => prev.map((c, idx) => idx === editingIndex ? { q: editFront, a: editBack } : c));
    setEditingIndex(-1);
    setEditFront('');
    setEditBack('');
  };

  const cancelEdit = () => {
    setEditingIndex(-1);
    setEditFront('');
    setEditBack('');
  };

  const removeCard = (i) => {
    setDeck(prev => prev.filter((_, idx) => idx !== i));
    // shift flipped indexes
    const s = new Set(Array.from(flipped).filter(idx => idx !== i).map(idx => (idx > i ? idx - 1 : idx)));
    setFlipped(s);
  };

  const shuffleDeck = () => setDeck(d => shuffleArray(d));

  const handleSaveAll = () => {
    if (typeof onSave === 'function') onSave(deck);
    alert('Flashcards saved (placeholder)');
  };

  return (
    <div className="flashcards-root">
      <header className="flash-header">
        <div>
          <h2>🃏 Flashcards — {noteTitle}</h2>
          <p className="muted">Placeholder cards (editable). Showing {deck.length} random card{deck.length !== 1 ? 's' : ''}.</p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={shuffleDeck}>🔀 Shuffle</button>
        </div>
      </header>

      <div className="cards-grid">
        {deck.map((c, i) => (
          <div key={i} className={`card ${flipped.has(i) ? 'is-flipped' : ''}`}>
            <div className="face front" onClick={() => toggleFlip(i)}>
              {editingIndex === i ? (
                <textarea value={editFront} onChange={e => setEditFront(e.target.value)} />
              ) : (
                <div className="face-content">{c.q}</div>
              )}
            </div>

            <div className="face back" onClick={() => toggleFlip(i)}>
              {editingIndex === i ? (
                <textarea value={editBack} onChange={e => setEditBack(e.target.value)} />
              ) : (
                <div className="face-content">{c.a}</div>
              )}
            </div>

           

          </div>
        ))}
      </div>

      <footer className="flash-footer">
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" onClick={handleSaveAll}>Save to Library</button>
          <button
            className="btn-ghost"
            onClick={() => {
              if (typeof onClose === 'function') onClose();
            }}
          >
            Exit
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Flashcards;