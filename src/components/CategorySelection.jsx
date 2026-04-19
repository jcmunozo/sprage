import LanguageLinks from './LanguageLinks';

const CATEGORIES = [
  { id: 'vocabulary', label: 'Vocabulary', icon: '词', description: 'Words & definitions' },
  { id: 'idiom',      label: 'Idioms',     icon: '語', description: 'Phrases & expressions' },
  { id: 'grammar',    label: 'Grammar',    icon: '文', description: 'Rules & structures' },
];

const CategorySelection = ({ onSelectCategory, onShowAddCardForm, cardCounts = {}, selectedLanguage, onBack, languageLinks = [], onAddLink, onRemoveLink }) => {
  return (
    <div className="category-selection">
      {selectedLanguage && onBack && (
        <div className="card-back-nav" style={{ justifyContent: 'flex-start', marginBottom: '1.5rem' }}>
          <button onClick={onBack}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Languages
          </button>
          <span style={{ color: 'var(--border-gold)' }}>›</span>
          <span style={{ color: 'var(--gold)' }}>{selectedLanguage?.name}</span>
        </div>
      )}
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

      <LanguageLinks links={languageLinks} language={selectedLanguage} onAddLink={onAddLink} onRemoveLink={onRemoveLink} />
    </div>
  );
};

export default CategorySelection;
