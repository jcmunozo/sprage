import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';
import { cardEntrance, actionSwap, softFade } from '../lib/motion';

const QUALITY_BUTTONS = [
  { label: 'Again', sublabel: 'Forgot it',  quality: 1, cls: 'btn-again', key: '1' },
  { label: 'Hard',  sublabel: 'Struggled',  quality: 3, cls: 'btn-hard',  key: '2' },
  { label: 'Good',  sublabel: 'Got it',     quality: 4, cls: 'btn-good',  key: '3' },
  { label: 'Easy',  sublabel: 'Too simple', quality: 5, cls: 'btn-easy',  key: '4' },
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
    if (submitting) return;
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

  // Keyboard shortcuts: Space/Enter flips, 1–4 rates the card once flipped
  useEffect(() => {
    const onKey = (e) => {
      if (isEditing) return;
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (isFlipped) {
        const btn = QUALITY_BUTTONS.find((b) => b.key === e.key);
        if (btn) handleReview(btn.quality);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, isFlipped, submitting, card._id]);

  return (
    <motion.div {...cardEntrance}>
      {/* ── Card + edit button wrapper ── */}
      <div className="card-wrapper">
        <div
          className={`card ${isFlipped ? 'is-flipped' : ''}`}
          onClick={() => !isEditing && setIsFlipped(f => !f)}
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
              {...actionSwap}
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
                <div className="card-edit-field card-edit-field--wide">
                  <label>Example <span className="field-hint">(optional)</span></label>
                  <input
                    type="text"
                    value={example}
                    onChange={e => setExample(e.target.value)}
                    placeholder="Example sentence"
                  />
                </div>
                <div className="card-edit-field">
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
            <motion.div key="quality" className="quality-buttons" {...actionSwap}>
              {QUALITY_BUTTONS.map(({ label, sublabel, quality, cls, key }) => (
                <button
                  key={quality}
                  className={`btn-quality ${cls}`}
                  onClick={() => handleReview(quality)}
                  disabled={submitting}
                >
                  <kbd className="quality-key" aria-hidden="true">{key}</kbd>
                  <span className="quality-label">{label}</span>
                  <span className="quality-sublabel">{sublabel}</span>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.span key="hint" className="flip-prompt" {...softFade}>
              Tap<span className="hint-desktop"> or press <kbd className="hint-key">Space</kbd></span> to reveal
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Card;
