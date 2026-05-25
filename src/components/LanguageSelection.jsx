import { motion } from 'framer-motion';
import { listContainer, listItem } from '../lib/motion';

const LANG_COLORS = [
  '#4FD18E', '#6EB6E8', '#E89968', '#E06A6A', '#C58FE0', '#F2B98C',
  '#5CB683', '#8DD9AC', '#D77C46', '#BFC2B6',
];

const DECK_COLORS = [
  '#C58FE0', '#6EB6E8', '#F2B98C', '#4FD18E', '#E06A6A', '#D89344',
  '#8DD9AC', '#5CB683', '#BFC2B6', '#D77C46',
];

const Tile = ({ color, code, name, description, count, onClick, ariaLabel }) => (
  <button
    type="button"
    className="tile"
    onClick={onClick}
    style={{ '--tile-color': color }}
    aria-label={ariaLabel || name}
  >
    <span className="lang-code">{code}</span>
    <span className="tile-label">{name}</span>
    {description && <span className="tile-sublabel">{description}</span>}
    {count > 0 && (
      <span className="tile-count">
        {count} {count === 1 ? 'card' : 'cards'}
      </span>
    )}
  </button>
);

const LanguageSelection = ({
  languages,
  cardCounts = {},
  onSelectLanguage,
  onShowAddLanguageForm,
  onShowAddDeckForm,
  decks = [],
  deckCardCounts = {},
  onSelectDeck,
  onRemoveDeck,
  dueTotal = 0,
  onStudyDue,
}) => {
  const hasIntroAbove = decks.length > 0 || dueTotal > 0;

  return (
    <div className="category-selection">
      {dueTotal > 0 && (
        <motion.div
          className="study-due-cta"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <button className="study-due-pill" onClick={onStudyDue}>
            Study Due — {dueTotal} {dueTotal === 1 ? 'card' : 'cards'}
          </button>
        </motion.div>
      )}

      <p className="section-eyebrow">
        {hasIntroAbove ? 'Languages' : 'Choose a language to study'}
      </p>

      {languages.length === 0 ? (
        <motion.div
          className="empty-state empty-state--inline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <p>No languages yet. Add one to get started.</p>
          <button onClick={onShowAddLanguageForm}>+ Add Language</button>
        </motion.div>
      ) : (
        <motion.div
          className="tile-grid"
          variants={listContainer}
          initial="initial"
          animate="animate"
        >
          {languages.map((lang, i) => {
            const color = LANG_COLORS[i % LANG_COLORS.length];
            const code = lang.code ? lang.code.toUpperCase() : lang.name.slice(0, 2).toUpperCase();
            return (
              <motion.div key={lang._id} className="tile-wrapper" variants={listItem}>
                <Tile
                  color={color}
                  code={code}
                  name={lang.name}
                  count={cardCounts[lang._id] || 0}
                  onClick={() => onSelectLanguage(lang)}
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {languages.length > 0 && (
        <div className="add-card-cta">
          <button onClick={onShowAddLanguageForm}>+ Add Language</button>
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <p>My Decks</p>
          <button className="section-header-action" onClick={onShowAddDeckForm}>
            + New Deck
          </button>
        </div>

        {decks.length > 0 ? (
          <motion.div
            className="tile-grid"
            variants={listContainer}
            initial="initial"
            animate="animate"
          >
            {decks.map((deck, i) => {
              const color = DECK_COLORS[i % DECK_COLORS.length];
              const initials = deck.name.slice(0, 2).toUpperCase();
              return (
                <motion.div key={deck._id} className="tile-wrapper" variants={listItem}>
                  <Tile
                    color={color}
                    code={initials}
                    name={deck.name}
                    description={deck.description}
                    count={deckCardCounts[deck._id] || 0}
                    onClick={() => onSelectDeck(deck)}
                  />
                  <button
                    type="button"
                    className="tile-delete"
                    onClick={(e) => { e.stopPropagation(); onRemoveDeck(deck._id); }}
                    title="Delete deck"
                    aria-label={`Delete deck ${deck.name}`}
                  >
                    ✕
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <p className="language-links-empty" style={{ textAlign: 'center' }}>
            No decks yet. Create one to organize your cards.
          </p>
        )}
      </div>
    </div>
  );
};

export default LanguageSelection;
