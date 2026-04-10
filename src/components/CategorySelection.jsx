const CATEGORIES = [
  { id: 'vocabulary', label: 'Vocabulary', icon: '词', description: 'Words & definitions' },
  { id: 'idiom',      label: 'Idioms',     icon: '語', description: 'Phrases & expressions' },
  { id: 'grammar',    label: 'Grammar',    icon: '文', description: 'Rules & structures' },
];

const CategorySelection = ({ onSelectCategory, onShowAddCardForm, cardCounts = {} }) => {
  return (
    <div className="category-selection">
      <p style={{ color: 'var(--text-muted)', fontSize: '.8rem', letterSpacing: '.12em', textTransform: 'uppercase' }}>
        Choose a category to study
      </p>

      <div className="category-buttons">
        {CATEGORIES.map(({ id, label, icon, description }) => (
          <button key={id} className="category-btn" onClick={() => onSelectCategory(id)}>
            <span className="category-icon">{icon}</span>
            <span style={{ display: 'block', marginBottom: '.2rem' }}>{label}</span>
            <span style={{ display: 'block', fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'none', letterSpacing: '.03em', fontWeight: 400 }}>
              {description}
            </span>
            {cardCounts[id] > 0 && (
              <span style={{
                display: 'inline-block',
                marginTop: '.6rem',
                fontSize: '.6rem',
                color: 'var(--gold)',
                border: '1px solid var(--border-gold)',
                borderRadius: '99px',
                padding: '.1rem .5rem',
                letterSpacing: '.08em',
              }}>
                {cardCounts[id]} cards
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="add-card-cta">
        <p>Expand your collection</p>
        <button onClick={onShowAddCardForm}>+ Add New Card</button>
      </div>
    </div>
  );
};

export default CategorySelection;
