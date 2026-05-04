import { motion } from 'framer-motion';

const LANG_COLORS = [
  '#3DCC82', '#4DA8E8', '#D4883A', '#E05555', '#C97CE8', '#FFB38A',
  '#52A97B', '#86D4A8', '#F07644', '#B8BDB4',
];

const DECK_COLORS = [
  '#C97CE8', '#4DA8E8', '#FFB38A', '#3DCC82', '#E05555', '#D4883A',
  '#86D4A8', '#52A97B', '#B8BDB4', '#F07644',
];

const container = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const item = {
  initial: { opacity: 0, y: 18, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
};

const LanguageSelection = ({
  languages,
  cardCounts = {},
  onSelectLanguage,
  onShowAddCardForm,
  onShowAddLanguageForm,
  onShowAddDeckForm,
  decks = [],
  deckCardCounts = {},
  onSelectDeck,
  onRemoveDeck,
  dueTotal = 0,
  onStudyDue,
}) => {
  return (
    <div className="category-selection">

      {/* ── Study Due button ── */}
      {dueTotal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ marginBottom: '1.75rem' }}
        >
          <button
            onClick={onStudyDue}
            style={{
              background: 'linear-gradient(135deg, rgba(61,204,130,.14), rgba(77,168,232,.1))',
              border: '1px solid rgba(61,204,130,.35)',
              color: '#3DCC82',
              padding: '.55rem 1.4rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '.82rem',
              letterSpacing: '.04em',
              cursor: 'pointer',
            }}
          >
            Study Due — {dueTotal} {dueTotal === 1 ? 'card' : 'cards'}
          </button>
        </motion.div>
      )}

      {/* ── Languages section ── */}
      <p style={{ marginBottom: '.75rem' }}>
        {decks.length > 0 || dueTotal > 0 ? 'Languages' : 'Choose a language to study'}
      </p>

      {languages.length === 0 ? (
        <motion.div
          style={{ padding: '1.5rem 0' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <p>No languages yet. Add one to get started.</p>
          <button style={{ marginTop: '1rem' }} onClick={onShowAddLanguageForm}>
            + Add Language
          </button>
        </motion.div>
      ) : (
        <motion.div
          className="category-buttons"
          variants={container}
          initial="initial"
          animate="animate"
        >
          {languages.map((lang, i) => {
            const color = LANG_COLORS[i % LANG_COLORS.length];
            const code = lang.code ? lang.code.toUpperCase() : lang.name.slice(0, 2).toUpperCase();
            return (
              <motion.button
                key={lang._id}
                className="category-btn"
                variants={item}
                onClick={() => onSelectLanguage(lang)}
                style={{ '--lang-color': color }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${color}55`;
                  e.currentTarget.style.boxShadow = `0 8px 32px ${color}22`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <span className="lang-code" style={{ color }}>{code}</span>
                <span style={{ display: 'block', marginBottom: '.3rem', color: 'var(--fg-2)' }}>{lang.name}</span>
                {cardCounts[lang._id] > 0 && (
                  <span style={{
                    display: 'inline-block',
                    marginTop: '.3rem',
                    fontSize: '.6rem',
                    color,
                    border: `1px solid ${color}44`,
                    borderRadius: '999px',
                    padding: '2px 8px',
                    letterSpacing: '.08em',
                    background: `${color}14`,
                  }}>
                    {cardCounts[lang._id]} cards
                  </span>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {languages.length > 0 && (
        <div className="add-card-cta">
          <button onClick={onShowAddLanguageForm}>+ Add Language</button>
        </div>
      )}

      {/* ── My Decks section ── */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '.75rem' }}>
          <p style={{ margin: 0 }}>My Decks</p>
          <button
            onClick={onShowAddDeckForm}
            style={{ fontSize: '.7rem', padding: '.2rem .7rem', borderRadius: '6px' }}
          >
            + New Deck
          </button>
        </div>

        {decks.length > 0 ? (
          <motion.div
            className="category-buttons"
            variants={container}
            initial="initial"
            animate="animate"
          >
            {decks.map((deck, i) => {
              const color = DECK_COLORS[i % DECK_COLORS.length];
              const initials = deck.name.slice(0, 2).toUpperCase();
              return (
                <motion.div
                  key={deck._id}
                  variants={item}
                  style={{ position: 'relative' }}
                >
                  <button
                    className="category-btn"
                    onClick={() => onSelectDeck(deck)}
                    style={{ '--lang-color': color, width: '100%' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = `${color}55`;
                      e.currentTarget.style.boxShadow = `0 8px 32px ${color}22`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <span className="lang-code" style={{ color }}>{initials}</span>
                    <span style={{ display: 'block', marginBottom: '.3rem', color: 'var(--fg-2)' }}>{deck.name}</span>
                    {deck.description && (
                      <span style={{ display: 'block', fontSize: '.6rem', color: 'var(--fg-3)', marginBottom: '.3rem' }}>
                        {deck.description}
                      </span>
                    )}
                    {deckCardCounts[deck._id] > 0 && (
                      <span style={{
                        display: 'inline-block',
                        marginTop: '.3rem',
                        fontSize: '.6rem',
                        color,
                        border: `1px solid ${color}44`,
                        borderRadius: '999px',
                        padding: '2px 8px',
                        letterSpacing: '.08em',
                        background: `${color}14`,
                      }}>
                        {deckCardCounts[deck._id]} cards
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => onRemoveDeck(deck._id)}
                    title="Delete deck"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      padding: '3px 6px',
                      cursor: 'pointer',
                      color: 'var(--fg-3)',
                      fontSize: '10px',
                      borderRadius: '4px',
                      lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <p style={{ fontSize: '.75rem', color: 'var(--fg-3)', marginTop: '.25rem' }}>
            No decks yet. Create one to organize your cards.
          </p>
        )}
      </div>
    </div>
  );
};

export default LanguageSelection;
