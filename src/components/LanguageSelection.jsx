import { useState } from 'react';
import { motion } from 'framer-motion';

const LANG_COLORS = [
  '#3DCC82', '#4DA8E8', '#D4883A', '#E05555', '#C97CE8', '#FFB38A',
  '#52A97B', '#86D4A8', '#F07644', '#B8BDB4',
];

const container = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const item = {
  initial: { opacity: 0, y: 18, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
};

const LanguageSelection = ({ languages, cardCounts = {}, onSelectLanguage, onShowAddCardForm, onAddLanguage }) => {
  const [showNewLangForm, setShowNewLangForm] = useState(false);
  const [newLangName, setNewLangName] = useState('');
  const [newLangCode, setNewLangCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateLanguage = async (e) => {
    e.preventDefault();
    if (!newLangName.trim()) return;
    setLoading(true);
    try {
      await onAddLanguage(newLangName.trim(), newLangCode.trim() || undefined);
      setNewLangName('');
      setNewLangCode('');
      setShowNewLangForm(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-selection">
      <p>Choose a language to study</p>

      {languages.length === 0 && !showNewLangForm ? (
        <motion.div
          style={{ padding: '3rem 0' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <p>No languages yet. Add one to get started.</p>
          <button style={{ marginTop: '1rem' }} onClick={() => setShowNewLangForm(true)}>
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

      {showNewLangForm && (
        <motion.div
          className="add-card-form"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <h3>New Language</h3>
          <div className="gold-divider" />
          <form onSubmit={handleCreateLanguage}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={newLangName}
                onChange={(e) => setNewLangName(e.target.value)}
                placeholder="e.g. Spanish"
                required
              />
            </div>
            <div className="form-group">
              <label>Code <span style={{ color: 'var(--fg-3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input
                type="text"
                value={newLangCode}
                onChange={(e) => setNewLangCode(e.target.value)}
                placeholder="e.g. ES"
              />
            </div>
            <div className="form-actions">
              <button type="button" onClick={() => setShowNewLangForm(false)}>Cancel</button>
              <button type="submit" disabled={loading}>
                {loading ? 'Saving…' : 'Add Language'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {languages.length > 0 && !showNewLangForm && (
        <div className="add-card-cta">
          <button onClick={() => setShowNewLangForm(true)}>+ Add Language</button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelection;
