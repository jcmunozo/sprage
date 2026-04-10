import { useState } from 'react';

const TYPES       = ['idiom', 'grammar', 'vocabulary'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const AddCardForm = ({ onAddCard, onCancel }) => {
  const [type,       setType]       = useState('vocabulary');
  const [front,      setFront]      = useState('');
  const [back,       setBack]       = useState('');
  const [example,    setExample]    = useState('');
  const [category,   setCategory]   = useState('');
  const [language,   setLanguage]   = useState('English');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [tagsInput,  setTagsInput]  = useState('');
  const [loading,    setLoading]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!front || !back) return;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    setLoading(true);
    await onAddCard({ type, front, back, example, category, language, difficulty, tags });
    setLoading(false);
    setFront(''); setBack(''); setExample('');
    setCategory(''); setTagsInput('');
  };

  return (
    <div className="add-card-form">
      <h3>New Card</h3>
      <div className="gold-divider" />

      <form onSubmit={handleSubmit}>
        {/* Row: type + difficulty */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row: language + category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Language</label>
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="e.g. English"
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. expressions"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Front — word or phrase</label>
          <input
            type="text"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="e.g. Serendipity"
            required
          />
        </div>

        <div className="form-group">
          <label>Back — meaning or translation</label>
          <input
            type="text"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="e.g. A fortunate accident"
            required
          />
        </div>

        <div className="form-group">
          <label>Example sentence <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <input
            type="text"
            value={example}
            onChange={(e) => setExample(e.target.value)}
            placeholder="e.g. It was pure serendipity that we met."
          />
        </div>

        <div className="form-group">
          <label>Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(comma-separated, optional)</span></label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. formality, precision"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Add Card'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCardForm;
