import { useState } from 'react';
import { api } from '../api';

const QUALITY_BUTTONS = [
  { label: 'Again', sublabel: 'Forgot it',  quality: 1, cls: 'btn-again' },
  { label: 'Hard',  sublabel: 'Struggled',  quality: 3, cls: 'btn-hard'  },
  { label: 'Good',  sublabel: 'Got it',     quality: 4, cls: 'btn-good'  },
  { label: 'Easy',  sublabel: 'Too simple', quality: 5, cls: 'btn-easy'  },
];

const DIFFICULTY_STYLES = {
  beginner:     { color: '#3DCC82', border: 'rgba(61,204,130,.3)',   bg: 'rgba(61,204,130,.12)'  },
  intermediate: { color: '#FFB38A', border: 'rgba(240,118,68,.3)',   bg: 'rgba(240,118,68,.12)'  },
  advanced:     { color: '#E05555', border: 'rgba(224,85,85,.3)',    bg: 'rgba(224,85,85,.12)'   },
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

  const diff = card.difficulty ? DIFFICULTY_STYLES[card.difficulty] || DIFFICULTY_STYLES.intermediate : null;

  return (
    <div>
      {/* ── Flip card ── */}
      <div
        className={`card ${isFlipped ? 'is-flipped' : ''}`}
        onClick={() => setIsFlipped(f => !f)}
        style={{ height: card.example ? '300px' : '280px' }}
      >
        <div className="card-inner">

          {/* Front face */}
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
                <span style={{ fontSize: '.62rem', opacity: .8, fontWeight: 400, letterSpacing: '.04em', textTransform: 'none' }}>
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
