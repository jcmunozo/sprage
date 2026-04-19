import { useState } from 'react';

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
      <p style={{ color: 'var(--text-muted)', fontSize: '.8rem', letterSpacing: '.12em', textTransform: 'uppercase' }}>
        Choose a language to study
      </p>

      {languages.length === 0 && !showNewLangForm ? (
        <div style={{ padding: '3rem 0' }}>
          <p>No languages yet. Add one to get started.</p>
          <button style={{ marginTop: '1rem' }} onClick={() => setShowNewLangForm(true)}>
            + Add Language
          </button>
        </div>
      ) : (
        <div className="category-buttons">
          {languages.map((lang) => (
            <button key={lang._id} className="category-btn" onClick={() => onSelectLanguage(lang)}>
              <span className="category-icon" style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '.05em' }}>
                {lang.code ? lang.code.toUpperCase() : lang.name.slice(0, 2).toUpperCase()}
              </span>
              <span style={{ display: 'block', marginBottom: '.2rem' }}>{lang.name}</span>
              {cardCounts[lang._id] > 0 && (
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
                  {cardCounts[lang._id]} cards
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {showNewLangForm && (
        <div className="add-card-form" style={{ marginTop: '2rem' }}>
          <h3>New Language</h3>
          <div className="gold-divider" />
          <form onSubmit={handleCreateLanguage}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={newLangName}
                onChange={(e) => setNewLangName(e.target.value)}
                placeholder="e.g. English"
                required
              />
            </div>
            <div className="form-group">
              <label>Code <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input
                type="text"
                value={newLangCode}
                onChange={(e) => setNewLangCode(e.target.value)}
                placeholder="e.g. en"
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
        <div className="add-card-cta" style={{ marginTop: '1.5rem' }}>
          <button onClick={() => setShowNewLangForm(true)}>+ Add Language</button>
        </div>
      )}

    </div>
  );
};

export default LanguageSelection;
