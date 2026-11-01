import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SwipeCard from './SwipeCard';
import RichTextarea from './RichTextarea';
import EditCardModal from './EditCardModal';
import RichText from './RichText';
import { hasRichStructure } from '../lib/richText';
import { cardEntrance, actionSwap, softFade, STACK_PEEK, STACK_SHRINK } from '../lib/motion';

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

const DEFAULT_STACK_MOTION = { dir: 1, undo: false };

const Card = ({ card, nextCards = [], stackMotion = DEFAULT_STACK_MOTION, onRate, onUpdate }) => {
  // Without onRate the card is just viewed (search → open card): flip + edit, no rating
  const studyMode = Boolean(onRate);
  const [isFlipped, setIsFlipped]     = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
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

  // Saving to the API is handled by the session (so the last rating can be undone)
  const handleReview = (quality, swipeDir) => {
    if (studyMode) onRate(quality, swipeDir);
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

  // The card grows to fit whichever face has more content (both faces share one height)
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);
  useLayoutEffect(() => {
    const els = [frontRef.current, backRef.current].filter(Boolean);
    if (!els.length) return;
    const measure = () => setContentHeight(Math.max(...els.map((el) => el.scrollHeight)));
    measure();
    const ro = new ResizeObserver(measure);
    els.forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [card._id, card.front, card.back, card.example]);
  const FACE_PADDING = 96; // top + bottom padding of .card-face
  const cardHeight = `${Math.min(
    620,
    Math.max(card.example ? 340 : 320, contentHeight + FACE_PADDING),
  )}px`;

  // Study sessions edit inline under the card; an opened card (search) edits in a modal
  const actionsKey = isEditing && studyMode ? 'edit' : studyMode && isFlipped ? 'quality' : studyMode ? 'hint' : 'view';

  // Keyboard shortcuts: Space/Enter flips, 1–4 rates the card once flipped
  useEffect(() => {
    const onKey = (e) => {
      if (isEditing) return;
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (studyMode && isFlipped) {
        const btn = QUALITY_BUTTONS.find((b) => b.key === e.key);
        if (btn) handleReview(btn.quality);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, isFlipped, card._id]);

  return (
    <motion.div {...cardEntrance}>
      {/* ── Stack: next cards peek out behind the top one ── */}
      <div className="card-stack">
        {nextCards.map((next, i) => {
          const depth = i + 1;
          return (
            <motion.div
              key={next._id}
              className="card-stack-ghost"
              aria-hidden="true"
              initial={false}
              animate={{ y: depth * STACK_PEEK, scale: 1 - depth * STACK_SHRINK, opacity: 1 - depth * 0.3 }}
              style={{ height: cardHeight, zIndex: 0 }}
            />
          );
        })}

        <AnimatePresence initial={false} custom={stackMotion}>
          <SwipeCard
            key={card._id}
            custom={stackMotion}
            canSwipe={studyMode && isFlipped && !isEditing}
            onSwipe={(dir) => handleReview(dir > 0 ? 4 : 1, dir)}
          >
            {/* ── Card + edit button wrapper ── */}
            <div className="card-wrapper">
              <div
                className={`card ${isFlipped ? 'is-flipped' : ''}`}
                onClick={() => !isEditing && setIsFlipped(f => !f)}
                tabIndex={0}
                role="button"
                aria-label={isFlipped ? 'Card answer visible, press to flip back' : 'Press to reveal answer'}
                style={{ height: cardHeight }}
              >
                <div className="card-inner">
                  <div className="card-face card-face-front">
                    <div className="card-face-content" ref={frontRef}>
                      <span className={`card-text ${card.front?.length > 40 ? 'card-text--long' : ''}`}>{card.front}</span>
                      <div className="card-meta">
                        {diff && card.difficulty && (
                          <span className="badge" style={{ color: diff.color, borderColor: diff.border, background: diff.bg }}>
                            {card.difficulty}
                          </span>
                        )}
                        {card.category && <span className="badge badge-outline">{card.category}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="card-face card-face-back">
                    <div className="card-face-content" ref={backRef}>
                      <RichText
                        text={card.back}
                        className={`card-text ${card.back?.length > 40 || hasRichStructure(card.back) ? 'card-text--long' : ''}`}
                      />
                      {card.example && <RichText text={card.example} className="card-example" />}
                    </div>
                  </div>
                </div>
              </div>

              {onUpdate && (
                <button
                  className={`card-edit-btn ${isEditing ? 'card-edit-btn--active' : ''} ${studyMode ? '' : 'card-edit-btn--visible'}`}
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
          </SwipeCard>
        </AnimatePresence>
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
                  <RichTextarea
                    value={back}
                    onChange={setBack}
                    placeholder="Meaning or translation"
                    required
                  />
                </div>
              </div>
              <div className="card-edit-row">
                <div className="card-edit-field card-edit-field--wide">
                  <label>Example <span className="field-hint">(optional)</span></label>
                  <RichTextarea
                    value={example}
                    onChange={setExample}
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
                >
                  <kbd className="quality-key" aria-hidden="true">{key}</kbd>
                  <span className="quality-label">{label}</span>
                  <span className="quality-sublabel">{sublabel}</span>
                </button>
              ))}
            </motion.div>
          ) : actionsKey === 'view' ? (
            <motion.div key="view" className="card-view-actions" {...actionSwap}>
              <span className="flip-prompt">
                {isFlipped ? 'Tap to see the front' : 'Tap to see the answer'}
              </span>
              {onUpdate && (
                <button type="button" className="btn-ghost card-view-edit" onClick={openEdit}>
                  Edit card
                </button>
              )}
            </motion.div>
          ) : (
            <motion.span key="hint" className="flip-prompt" {...softFade}>
              Tap<span className="hint-desktop"> or press <kbd className="hint-key">Space</kbd></span> to reveal
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      {!studyMode && onUpdate && createPortal(
        <AnimatePresence>
          {isEditing && (
            <EditCardModal
              key="edit-modal"
              card={card}
              onSave={(data) => onUpdate(card._id, data)}
              onClose={() => setIsEditing(false)}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </motion.div>
  );
};

export default Card;
