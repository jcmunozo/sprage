import { useState } from 'react';

const LanguageLinks = ({ links = [], language, onAddLink, onRemoveLink }) => {
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    await onAddLink({ url, description, languageId: language?._id });
    setUrl('');
    setDescription('');
    setShowForm(false);
    setLoading(false);
  };

  return (
    <div className="language-links">
      <div className="language-links-header">
        <span className="language-links-title">Resources</span>
        {language && <span className="language-links-lang">{language.name}</span>}
        <button
          className="language-links-add-btn"
          onClick={() => setShowForm((v) => !v)}
          title={showForm ? 'Cancel' : 'Add resource'}
        >
          {showForm ? '✕' : '+'}
        </button>
      </div>

      {showForm && (
        <form className="language-link-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="URL  (e.g. youtube.com/...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Add'}
          </button>
        </form>
      )}

      {links.length > 0 && (
        <div className="language-links-list">
          {links.map((item) => (
            <div key={item._id} className="language-link-row">
              <a
                href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="language-link-card"
              >
                <span className="language-link-url">{item.url}</span>
                {item.description && (
                  <span className="language-link-desc">{item.description}</span>
                )}
                <svg className="language-link-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              {onRemoveLink && (
                <button
                  className="language-link-remove"
                  onClick={() => onRemoveLink(item._id)}
                  title="Remove"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!links.length && !showForm && (
        <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.5rem' }}>
          No resources yet. Press + to add one.
        </p>
      )}
    </div>
  );
};

export default LanguageLinks;
