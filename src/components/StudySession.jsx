import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Card from './Card';
import { screenIn } from '../lib/motion';

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

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

  // Reset the session when the set of cards changes (new deck / category)
  if (idsKey !== lastKey) {
    setLastKey(idsKey);
    setOrder(shuffle(cards.map((c) => c._id)));
    setIndex(0);
    setDone(false);
  }

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

  const total = order.length;

  if (done) {
    return (
      <div className="card-container">
        <motion.div className="session-complete" {...screenIn}>
          <div className="session-complete-icon" aria-hidden="true">
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
            <button
              className="btn-primary"
              onClick={() => {
                setOrder(shuffle(cards.map((c) => c._id)));
                setIndex(0);
                setDone(false);
              }}
            >
              Study again
            </button>
            <button className="btn-ghost" onClick={onHome}>
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const current = cards.find((c) => c._id === order[index]) || cards[index % cards.length];

  const handleNext = () => {
    if (index + 1 >= total) setDone(true);
    else setIndex(index + 1);
  };

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
      <Card card={current} onNext={handleNext} onUpdate={onUpdate} />
    </div>
  );
};

export default StudySession;
