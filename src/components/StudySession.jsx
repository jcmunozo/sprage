import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Card from './Card';
import Confetti from './Confetti';
import { screenIn, softFade } from '../lib/motion';
import { reviewQueue } from '../lib/reviewQueue';

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// Cards leave alternately left / right, whatever the rating
const directionFor = (index) => (index % 2 === 0 ? -1 : 1);

const UndoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 6h7a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 3 3 6l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StudySession = ({
  cards,
  onUpdate,
  onHome,
  emptyMessage = 'No cards here yet.',
  emptyActionLabel,
  onEmptyAction,
}) => {
  const idsKey = useMemo(() => cards.map((c) => c._id).sort().join(','), [cards]);
  const [order, setOrder] = useState(() => shuffle(cards.map((c) => c._id)));
  const [lastKey, setLastKey] = useState(idsKey);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  // How the top card leaves / comes back — read by the stack animation
  const [stackMotion, setStackMotion] = useState({ dir: 1, undo: false });
  // Direction the last rated card left in; null when there's nothing to undo
  const [lastRated, setLastRated] = useState(null);

  // Reset the session when the set of cards changes (new deck / category)
  if (idsKey !== lastKey) {
    setLastKey(idsKey);
    setOrder(shuffle(cards.map((c) => c._id)));
    setIndex(0);
    setDone(false);
    setLastRated(null);
  }

  // The last rating is held back so it can be undone — send it when leaving
  useEffect(() => {
    const onUnload = () => reviewQueue.flush({ keepalive: true });
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
      reviewQueue.flush();
    };
  }, []);

  const total = order.length;
  const canUndo = lastRated !== null;

  // `swipeDir` is set when the card was dragged — it keeps flying the way it was thrown
  const handleRate = (cardId, quality, swipeDir) => {
    const dir = swipeDir ?? directionFor(index);
    reviewQueue.push(cardId, quality);
    setStackMotion({ dir, undo: false });
    setLastRated(dir);
    if (index + 1 >= total) setDone(true);
    else setIndex(index + 1);
  };

  const handleUndo = () => {
    if (!canUndo) return;
    reviewQueue.cancel();
    setStackMotion({ dir: lastRated, undo: true });
    setLastRated(null);
    // The last card doesn't advance the index, it just ends the session
    if (done) setDone(false);
    else setIndex(Math.max(0, index - 1));
  };

  const restart = () => {
    reviewQueue.flush();
    setOrder(shuffle(cards.map((c) => c._id)));
    setIndex(0);
    setDone(false);
    setLastRated(null);
    setStackMotion({ dir: 1, undo: false });
  };

  // Backspace or Ctrl/Cmd+Z brings the last card back
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const isUndo =
        e.key === 'Backspace' ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z');
      if (isUndo && canUndo) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (cards.length === 0) {
    return (
      <div className="card-container">
        <div className="empty-state">
          <p>{emptyMessage}</p>
          {emptyActionLabel && (
            <button onClick={onEmptyAction}>{emptyActionLabel}</button>
          )}
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="card-container">
        <motion.div className="session-complete" {...screenIn}>
          <div className="session-complete-icon" aria-hidden="true">
            <Confetti />
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M5 15l6 6L23 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2>Session complete</h2>
          <p>
            You went through {total} {total === 1 ? 'card' : 'cards'}. Nice work —
            repetition is what makes it stick.
          </p>
          <div className="session-complete-actions">
            <button className="btn-primary" onClick={restart}>
              Study again
            </button>
            <button className="btn-ghost" onClick={onHome}>
              Back to Home
            </button>
          </div>
          {canUndo && (
            <button className="session-undo" onClick={handleUndo}>
              <UndoIcon /> Undo last card
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  const cardById = (id) => cards.find((c) => c._id === id);
  const current = cardById(order[index]) || cards[index % cards.length];
  const nextCards = order
    .slice(index + 1, index + 3)
    .map(cardById)
    .filter(Boolean);

  return (
    <div className="card-container">
      <div className="session-progress">
        <div className="session-progress-text">
          <span>
            Card <strong>{index + 1}</strong> of <strong>{total}</strong>
          </span>
          <span>{Math.round((index / total) * 100)}%</span>
        </div>
        <div className="session-progress-track">
          <div
            className="session-progress-fill"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
      </div>
      <Card
        card={current}
        nextCards={nextCards}
        stackMotion={stackMotion}
        onRate={(quality, swipeDir) => handleRate(current._id, quality, swipeDir)}
        onUpdate={onUpdate}
      />
      <div className="session-undo-slot">
        <AnimatePresence>
          {canUndo && (
            <motion.button
              key="undo"
              className="session-undo"
              onClick={handleUndo}
              title="Undo (Backspace)"
              {...softFade}
            >
              <UndoIcon /> Undo
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudySession;
