import { useState } from 'react';
import { api } from '../api';

const QUALITY_BUTTONS = [
  { label: 'Again', sublabel: 'Forgot it',  quality: 1, cls: 'btn-again' },
  { label: 'Hard',  sublabel: 'Struggled',  quality: 3, cls: 'btn-hard'  },
  { label: 'Good',  sublabel: 'Got it',     quality: 4, cls: 'btn-good'  },
  { label: 'Easy',  sublabel: 'Too simple', quality: 5, cls: 'btn-easy'  },
];

const DIFFICULTY_COLORS = {
  beginner:     { color: '#70D890', border: 'rgba(60,180,100,.35)' },
  intermediate: { color: '#E0B060', border: 'rgba(200,140,30,.35)' },
  advanced:     { color: '#E08080', border: 'rgba(200,60,60,.35)'  },
};

const Card = ({ card, onNext }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const diff = card.difficulty ? DIFFICULTY_COLORS[card.difficulty] || DIFFICULTY_COLORS.intermediate : null;

  return (
    <div>
      {/* ── Flip card ── */}
      <div
        className={`card ${isFlipped ? 'is-flipped' : ''}`}
        onClick={() => setIsFlipped(f => !f)}
        style={{ height: card.example ? '300px' : '260px' }}
      >
        <div className="card-inner">

          {/* Front face */}
          <div className="card-face card-face-front">
            <span className="card-text">{card.front}</span>
            <div className="card-meta">
              {card.category && <span className="badge badge-outline">{card.category}</span>}
              {diff && card.difficulty && (
                <span className="badge" style={{ color: diff.color, borderColor: diff.border, background: diff.border }}>
                  {card.difficulty}
                </span>
              )}
            </div>
          </div>

          {/* Back face */}
          <div className="card-face card-face-back">
            <span className="card-text">{card.back}</span>
            {card.example && (
              <p className="card-example">"{card.example}"</p>
            )}
          </div>

        </div>
      </div>

      {/* ── Actions ── */}
      <div className="card-actions">
        {isFlipped ? (
          <div className="quality-buttons">
            {QUALITY_BUTTONS.map(({ label, sublabel, quality, cls }) => (
              <button
                key={quality}
                className={`btn-quality ${cls}`}
                onClick={() => handleReview(quality)}
                disabled={submitting}
              >
                <span className="quality-label">{label}</span>
                <span style={{ fontSize: '.62rem', opacity: .7, fontWeight: 400, letterSpacing: '.04em', textTransform: 'none' }}>
                  {sublabel}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <span className="flip-prompt">Tap to reveal</span>
        )}
      </div>
    </div>
  );
};

export default Card;
