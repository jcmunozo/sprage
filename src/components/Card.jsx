import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';

const QUALITY_BUTTONS = [
  { label: 'Again', sublabel: 'Forgot it',  quality: 1, cls: 'btn-again' },
  { label: 'Hard',  sublabel: 'Struggled',  quality: 3, cls: 'btn-hard'  },
  { label: 'Good',  sublabel: 'Got it',     quality: 4, cls: 'btn-good'  },
  { label: 'Easy',  sublabel: 'Too simple', quality: 5, cls: 'btn-easy'  },
];

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const DIFFICULTY_STYLES = {
  beginner:     { color: '#3DCC82', border: 'rgba(61,204,130,.3)',   bg: 'rgba(61,204,130,.12)'  },
  intermediate: { color: '#FFB38A', border: 'rgba(240,118,68,.3)',   bg: 'rgba(240,118,68,.12)'  },
  advanced:     { color: '#E05555', border: 'rgba(224,85,85,.3)',    bg: 'rgba(224,85,85,.12)'   },
};

const Card = ({ card, onNext, onUpdate }) => {
  const [isFlipped, setIsFlipped]     = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [saving, setSaving]           = useState(false);

  const [front,      setFront]      = useState(card.front);
  const [back,       setBack]       = useState(card.back);
  const [example,    setExample]    = useState(card.example || '');
  const [difficulty, setDifficulty] = useState(card.difficulty || 'intermediate');

  // Sync edit fields when card prop changes (next card)
  const [lastCardId, setLastCardId] = useState(card._id);
  if (card._id !== lastCardId) {
    setLastCardId(card._id);
    setFront(card.front);
    setBack(card.back);
    setExample(card.example || '');
    setDifficulty(card.difficulty || 'intermediate');
    setIsFlipped(false);
    setIsEditing(false);
  }

  const handleReview = async (quality) => {
    setSubmitting(true);
    try {
      if (card._id) await api.progress.recordReview(card._id, quality);
    } catch {
      // best-effort
    } finally {
      setSubmitting(false);
      setIsFlipped(false);
      onNext();
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    setSaving(true);
    try {
      await onUpdate(card._id, { front: front.trim(), back: back.trim(), example: example.trim(), difficulty });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (e) => {
    e.stopPropagation();
    setIsFlipped(false);
    setIsEditing(v => !v);
  };

  const diff = card.difficulty ? DIFFICULTY_STYLES[card.difficulty] || DIFFICULTY_STYLES.intermediate : null;

  const actionsKey = isEditing ? 'edit' : isFlipped ? 'quality' : 'hint';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── Card + edit button wrapper ── */}
      <div className="card-wrapper">
        <div
          className={`card ${isFlipped ? 'is-flipped' : ''}`}
          onClick={() => !isEditing && setIsFlipped(f => !f)}
          onKeyDown={(e) => !isEditing && (e.key === 'Enter' || e.key === ' ') && setIsFlipped(f => !f)}
          tabIndex={0}
          role="button"
          aria-label={isFlipped ? 'Card answer visible, press to flip back' : 'Press to reveal answer'}
          style={{ height: card.example ? '300px' : '280px' }}
        >
          <div className="card-inner">
            <div className="card-face card-face-front">
              <span className="card-text">{card.front}</span>
              <div className="card-meta">
                {diff && card.difficulty && (
                  <span className="badge" style={{ color: diff.color, borderColor: diff.border, background: diff.bg }}>
                    {card.difficulty}
                  </span>
                )}
                {card.category && <span className="badge badge-outline">{card.category}</span>}
              </div>
            </div>
            <div className="card-face card-face-back">
              <span className="card-text">{card.back}</span>
              {card.example && <p className="card-example">"{card.example}"</p>}
            </div>
          </div>
        </div>

        {onUpdate && (
          <button
            className={`card-edit-btn ${isEditing ? 'card-edit-btn--active' : ''}`}
            onClick={openEdit}
            title={isEditing ? 'Cancel edit' : 'Edit card'}
          >
            {isEditing ? (
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8.5 1.5a1.414 1.414 0 0 1 2 2L3.5 10.5l-3 .5.5-3L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        )}
      </div>

      {/* ── Actions / Edit form ── */}
      <div className="card-actions">
        <AnimatePresence mode="wait">
          {actionsKey === 'edit' ? (
            <motion.form
              key="edit"
              className="card-edit-form"
              onSubmit={handleSave}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="card-edit-row">
                <div className="card-edit-field">
                  <label>Front</label>
                  <input
                    type="text"
                    value={front}
                    onChange={e => setFront(e.target.value)}
                    placeholder="Word or phrase"
                    required
                    autoFocus
                  />
                </div>
                <div className="card-edit-field">
                  <label>Back</label>
                  <input
                    type="text"
                    value={back}
                    onChange={e => setBack(e.target.value)}
                    placeholder="Meaning or translation"
                    required
                  />
                </div>
              </div>
              <div className="card-edit-row">
                <div className="card-edit-field" style={{ flex: 2 }}>
                  <label>Example <span style={{ color: 'var(--fg-3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <input
                    type="text"
                    value={example}
                    onChange={e => setExample(e.target.value)}
                    placeholder="Example sentence"
                  />
                </div>
                <div className="card-edit-field" style={{ flex: 1 }}>
                  <label>Difficulty</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                    {DIFFICULTIES.map(d => (
                      <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="card-edit-actions">
                <button type="button" className="card-edit-cancel" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="card-edit-save" disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </motion.form>
          ) : actionsKey === 'quality' ? (
            <motion.div
              key="quality"
              className="quality-buttons"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {QUALITY_BUTTONS.map(({ label, sublabel, quality, cls }) => (
                <button
                  key={quality}
                  className={`btn-quality ${cls}`}
                  onClick={() => handleReview(quality)}
                  disabled={submitting}
                >
                  <span className="quality-label">{label}</span>
                  <span style={{ fontSize: '.62rem', opacity: .8, fontWeight: 400, letterSpacing: '.04em', textTransform: 'none' }}>
                    {sublabel}
                  </span>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.span
              key="hint"
              className="flip-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              Tap to reveal
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Card;
