import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listContainer, listItem } from '../lib/motion';
import ConfirmDialog from './ConfirmDialog';

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
  const [deckToDelete, setDeckToDelete] = useState(null);
  const totalCards = Object.values(cardCounts).reduce((sum, n) => sum + n, 0);
  const hasIntroAbove = decks.length > 0 || dueTotal > 0;
  const deckToDeleteCount = deckToDelete ? deckCardCounts[deckToDelete._id] || 0 : 0;

  return (
    <div className="category-selection">
      {dueTotal > 0 ? (
        <motion.div
          className="home-hero"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="home-hero-text">
            <p className="home-hero-eyebrow">Ready for review</p>
            <h2 className="home-hero-title">
              {dueTotal} {dueTotal === 1 ? 'card is' : 'cards are'} due today
            </h2>
            <p className="home-hero-sub">
              A few minutes now keeps them in long-term memory.
            </p>
          </div>
          <button className="home-hero-btn" onClick={onStudyDue}>
            Start review
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </motion.div>
      ) : totalCards > 0 ? (
        <motion.p
          className="home-caught-up"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <span aria-hidden="true">✓</span> All caught up — nothing due for review
        </motion.p>
      ) : null}

      {(totalCards > 0 || languages.length > 0) && (
        <div className="home-stats">
          <div className="home-stat">
            <span className="home-stat-num">{totalCards}</span>
            <span className="home-stat-label">{totalCards === 1 ? 'Card' : 'Cards'}</span>
          </div>
          <div className="home-stat">
            <span className="home-stat-num">{languages.length}</span>
            <span className="home-stat-label">{languages.length === 1 ? 'Language' : 'Languages'}</span>
          </div>
          <div className="home-stat">
            <span className="home-stat-num">{dueTotal}</span>
            <span className="home-stat-label">Due today</span>
          </div>
        </div>
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
                    onClick={(e) => { e.stopPropagation(); setDeckToDelete(deck); }}
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

      <AnimatePresence>
        {deckToDelete && (
          <ConfirmDialog
            title="Delete deck?"
            message={
              deckToDeleteCount > 0
                ? `“${deckToDelete.name}” and its ${deckToDeleteCount} ${deckToDeleteCount === 1 ? 'card' : 'cards'} will be permanently deleted, along with their review progress.`
                : `“${deckToDelete.name}” will be permanently deleted.`
            }
            confirmLabel="Delete deck"
            onCancel={() => setDeckToDelete(null)}
            onConfirm={async () => {
              await onRemoveDeck(deckToDelete._id);
              setDeckToDelete(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelection;
