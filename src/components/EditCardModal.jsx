import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import RichTextarea from './RichTextarea';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

// Full-size card editor. Render inside an <AnimatePresence> (portaled to body).
const EditCardModal = ({ card, onSave, onClose }) => {
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [example, setExample] = useState(card.example || '');
  const [difficulty, setDifficulty] = useState(card.difficulty || 'intermediate');
  const [saving, setSaving] = useState(false);

  const canSave = front.trim() && back.trim() && !saving;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave({ front: front.trim(), back: back.trim(), example: example.trim(), difficulty });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // Esc closes, Ctrl/Cmd+Enter saves (re-bound each render so it sees current fields)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !saving) onClose();
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Lock page scroll while the modal is open
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  return (
    <motion.div
      className="modal-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) onClose(); }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <motion.form
        className="edit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        onSubmit={(e) => { e.preventDefault(); save(); }}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="edit-modal-head">
          <h3 id="edit-modal-title">Edit card</h3>
          <button type="button" className="edit-modal-close" onClick={onClose} aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="edit-modal-body">
          <div className="edit-modal-row">
            <div className="card-edit-field card-edit-field--wide">
              <label htmlFor="edit-front">Front</label>
              <input
                id="edit-front"
                type="text"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="Word or phrase"
                required
                autoFocus
              />
            </div>
            <div className="card-edit-field">
              <label htmlFor="edit-difficulty">Difficulty</label>
              <select id="edit-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card-edit-field">
            <label>Back</label>
            <RichTextarea
              value={back}
              onChange={setBack}
              rows={4}
              autoGrow
              placeholder="Meaning or translation"
              required
            />
          </div>

          <div className="card-edit-field">
            <label>Example <span className="field-hint">(optional)</span></label>
            <RichTextarea
              value={example}
              onChange={setExample}
              rows={3}
              autoGrow
              placeholder="Example sentence"
            />
          </div>
        </div>

        <footer className="edit-modal-actions">
          <span className="edit-modal-shortcut"><kbd>Ctrl</kbd> + <kbd>Enter</kbd> to save</span>
          <button type="button" className="card-edit-cancel" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="card-edit-save" disabled={!canSave}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </footer>
      </motion.form>
    </motion.div>
  );
};

export default EditCardModal;
