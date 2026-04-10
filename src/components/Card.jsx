import { useState } from 'react';
import { api } from '../api';

const QUALITY_BUTTONS = [
  { label: 'Again', quality: 1 },
  { label: 'Hard', quality: 3 },
  { label: 'Good', quality: 4 },
  { label: 'Easy', quality: 5 },
];

const Card = ({ card, onNext }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleReview = async (quality) => {
    setSubmitting(true);
    try {
      if (card._id) {
        await api.progress.recordReview(card._id, quality);
      }
    } catch {
      // progress recording is best-effort
    } finally {
      setSubmitting(false);
      setIsFlipped(false);
      onNext();
    }
  };

  return (
    <div>
      <div className={`card ${isFlipped ? 'is-flipped' : ''}`} onClick={handleFlip}>
        <div className="card-inner">
          <div className="card-face card-face-front">
            {card.front}
          </div>
          <div className="card-face card-face-back">
            {card.back}
          </div>
        </div>
      </div>
      <div className="card-actions">
        {isFlipped ? (
          <div className="quality-buttons">
            {QUALITY_BUTTONS.map(({ label, quality }) => (
              <button
                key={quality}
                onClick={() => handleReview(quality)}
                disabled={submitting}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          <p style={{ color: '#888', fontSize: '0.9rem' }}>Click the card to reveal the answer</p>
        )}
      </div>
    </div>
  );
};

export default Card;
