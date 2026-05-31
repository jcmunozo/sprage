import { useState } from 'react';

const TYPES       = ['idiom', 'grammar', 'vocabulary'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const AddCardForm = ({
  onAddCard,
  onCancel,
  defaultLanguage,
  defaultType,
  decks = [],
  languages = [],
  existingCards = [],
}) => {
  const [type,       setType]       = useState(defaultType || 'vocabulary');
  const [front,      setFront]      = useState('');
  const [back,       setBack]       = useState('');
  const [example,    setExample]    = useState('');
  const [category,   setCategory]   = useState('');
  const [languageId, setLanguageId] = useState(defaultLanguage?._id || '');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [deckId,     setDeckId]     = useState('');
  const [tagsInput,  setTagsInput]  = useState('');
  const [loading,    setLoading]    = useState(false);

  const lockedLanguage = !!defaultLanguage;

  // Live duplicate check: while typing the front, surface existing cards in the
  // same language whose front/back matches, so the user avoids creating a dupe.
  const frontQuery = front.trim().toLowerCase();
  const duplicateMatches =
    frontQuery.length >= 2
      ? existingCards
          .filter((c) => {
            const sameLanguage = !languageId || String(c.languageId) === String(languageId);
            if (!sameLanguage) return false;
            return (
              c.front?.toLowerCase().includes(frontQuery) ||
              c.back?.toLowerCase().includes(frontQuery)
            );
          })
          .slice(0, 6)
      : [];
  const hasExactDuplicate = duplicateMatches.some(
    (c) => c.front?.trim().toLowerCase() === frontQuery,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!front || !back) return;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    setLoading(true);
    await onAddCard({
      type,
      front,
      back,
      example,
      category,
      difficulty,
      tags,
      ...(languageId ? { languageId } : {}),
      ...(deckId ? { deckId } : {}),
    });
    setLoading(false);
    setFront(''); setBack(''); setExample('');
    setCategory(''); setTagsInput('');
  };

  return (
    <div className="add-card-form">
      <h3>New Card</h3>
      <div className="gold-divider" />

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Type</label>
            {defaultType ? (
              <input
                type="text"
                value={type.charAt(0).toUpperCase() + type.slice(1)}
                readOnly
              />
            ) : (
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            )}
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

        <div className="form-row">
          <div className="form-group">
            <label>Language</label>
            {lockedLanguage ? (
              <input type="text" value={defaultLanguage.name} readOnly />
            ) : (
              <select value={languageId} onChange={(e) => setLanguageId(e.target.value)}>
                <option value="">— None —</option>
                {languages.map((l) => (
                  <option key={l._id} value={l._id}>{l.name}</option>
                ))}
              </select>
            )}
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

        {decks.length > 0 && (
          <div className="form-group">
            <label>Deck <span className="field-hint">(optional)</span></label>
            <select value={deckId} onChange={(e) => setDeckId(e.target.value)}>
              <option value="">— No deck —</option>
              {decks.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Front — word or phrase</label>
          <input
            type="text"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="e.g. Serendipity"
            required
          />
          {duplicateMatches.length > 0 && (
            <div className={`dup-warning${hasExactDuplicate ? ' dup-warning--exact' : ''}`}>
              <p className="dup-warning-title">
                {hasExactDuplicate
                  ? 'A card with this front already exists in this language:'
                  : 'Similar cards already exist in this language:'}
              </p>
              <ul>
                {duplicateMatches.map((c) => (
                  <li key={c._id}>
                    <strong>{c.front}</strong> — {c.back}
                  </li>
                ))}
              </ul>
            </div>
          )}
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
          <label>Example sentence <span className="field-hint">(optional)</span></label>
          <input
            type="text"
            value={example}
            onChange={(e) => setExample(e.target.value)}
            placeholder="e.g. It was pure serendipity that we met."
          />
        </div>

        <div className="form-group">
          <label>Tags <span className="field-hint">(comma-separated, optional)</span></label>
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
