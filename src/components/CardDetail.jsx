import Card from './Card';

// A single card opened from the language search: flip it and edit it in place.
const CardDetail = ({ card, onUpdate, onBack }) => (
  <div className="card-container">
    <div className="card-detail-head">
      <button type="button" className="btn-ghost" onClick={onBack}>
        ← Back
      </button>
      {card.type && <span className="search-result-type">{card.type}</span>}
    </div>
    <Card card={card} onUpdate={onUpdate} />
  </div>
);

export default CardDetail;
