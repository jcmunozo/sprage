import React, { useState } from 'react';

const Card = ({ card, onNext }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    onNext();
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
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
};

export default Card;
