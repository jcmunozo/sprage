import { useState } from 'react';

const LANG_COLORS = [
  '#3DCC82', '#4DA8E8', '#D4883A', '#E05555', '#C97CE8', '#FFB38A',
  '#52A97B', '#86D4A8', '#F07644', '#B8BDB4',
];

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
        <div style={{ padding: '3rem 0' }}>
          <p>No languages yet. Add one to get started.</p>
          <button style={{ marginTop: '1rem' }} onClick={() => setShowNewLangForm(true)}>
            + Add Language
          </button>
        </div>
      ) : (
        <div className="category-buttons">
          {languages.map((lang, i) => {
            const color = LANG_COLORS[i % LANG_COLORS.length];
            const code = lang.code ? lang.code.toUpperCase() : lang.name.slice(0, 2).toUpperCase();
            return (
              <button
                key={lang._id}
                className="category-btn"
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
              </button>
            );
          })}
        </div>
      )}

      {showNewLangForm && (
        <div className="add-card-form">
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
        </div>
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
