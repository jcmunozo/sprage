import { motion } from 'framer-motion';
import { listContainer, listItem } from '../lib/motion';
import LanguageLinks from './LanguageLinks';
import { stripRich } from '../lib/richText';
import { CATEGORIES } from '../lib/categories';


const CategorySelection = ({
  onSelectCategory,
  onShowAddCardForm,
  cardCounts = {},
  cards = [],
  selectedLanguage,
  languageLinks = [],
  onAddLink,
  onUpdateLink,
  onRemoveLink,
  onOpenCard,
  query = '',
  onQueryChange,
}) => {
  const q = query.trim().toLowerCase();
  const results = q
    ? cards.filter(
        (c) => c.front?.toLowerCase().includes(q) || c.back?.toLowerCase().includes(q),
      )
    : [];

  return (
    <div className="category-selection">
      <p className="section-eyebrow">Choose a category to study</p>

      <div className="card-search">
        <input
          type="search"
          className="card-search-input"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={`Search cards in ${selectedLanguage?.name || 'this language'}…`}
        />
        {q && (
          <div className="card-search-results">
            {results.length > 0 ? (
              results.map((c) => (
                <button
                  key={c._id}
                  type="button"
                  className="search-result"
                  onClick={() => onOpenCard(c._id)}
                  aria-label={`Open card ${c.front}`}
                >
                  <span className="search-result-text">
                    <strong>{c.front}</strong>
                    <span className="search-result-back">{stripRich(c.back)}</span>
                  </span>
                  {c.type && <span className="search-result-type">{c.type}</span>}
                </button>
              ))
            ) : (
              <p className="search-empty">No cards match “{query.trim()}”.</p>
            )}
          </div>
        )}
      </div>

      <motion.div
        className="tile-grid"
        variants={listContainer}
        initial="initial"
        animate="animate"
      >
        {CATEGORIES.map(({ id, label, icon, description, color }) => (
          <motion.div key={id} className="tile-wrapper" variants={listItem}>
            <button
              type="button"
              className="tile"
              style={{ '--tile-color': color }}
              onClick={() => onSelectCategory(id)}
              aria-label={label}
            >
              <span className="category-icon">{icon}</span>
              <span className="tile-label">{label}</span>
              <span className="tile-sublabel">{description}</span>
              {cardCounts[id] > 0 && (
                <span className="tile-count">
                  {cardCounts[id]} {cardCounts[id] === 1 ? 'card' : 'cards'}
                </span>
              )}
            </button>
          </motion.div>
        ))}
      </motion.div>

      <div className="add-card-cta">
        <p>Expand your collection</p>
        <button onClick={onShowAddCardForm}>+ Add New Card</button>
      </div>

      <LanguageLinks
        links={languageLinks}
        language={selectedLanguage}
        onAddLink={onAddLink}
        onUpdateLink={onUpdateLink}
        onRemoveLink={onRemoveLink}
      />
    </div>
  );
};

export default CategorySelection;
