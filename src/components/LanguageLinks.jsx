import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LinkRow = ({ item, onUpdate, onRemove }) => {
  const [editing, setEditing] = useState(false);
  const [url, setUrl] = useState(item.url);
  const [description, setDescription] = useState(item.description || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    await onUpdate(item._id, { url: url.trim(), description: description.trim() });
    setLoading(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setUrl(item.url);
    setDescription(item.description || '');
    setEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      <AnimatePresence mode="wait">
        {editing ? (
          <motion.form
            key="edit"
            className="language-link-edit-form"
            onSubmit={handleSave}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL"
              required
              autoFocus
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
            />
            <div className="language-link-edit-actions">
              <button type="button" className="language-link-edit-cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="language-link-edit-save" disabled={loading}>
                {loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="view"
            className="language-link-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
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
            <button
              className="language-link-action-btn"
              onClick={() => setEditing(true)}
              title="Edit"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8.5 1.5a1.414 1.414 0 0 1 2 2L3.5 10.5l-3 .5.5-3L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {onRemove && (
              <button
                className="language-link-action-btn language-link-remove"
                onClick={() => onRemove(item._id)}
                title="Remove"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LanguageLinks = ({ links = [], language, onAddLink, onUpdateLink, onRemoveLink }) => {
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

      <AnimatePresence>
        {showForm && (
          <motion.form
            className="language-link-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
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
          </motion.form>
        )}
      </AnimatePresence>

      {links.length > 0 && (
        <div className="language-links-list">
          <AnimatePresence>
            {links.map((item) => (
              <LinkRow
                key={item._id}
                item={item}
                onUpdate={onUpdateLink}
                onRemove={onRemoveLink}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {!links.length && !showForm && (
        <p className="language-links-empty">
          No resources yet. Press + to add one.
        </p>
      )}
    </div>
  );
};

export default LanguageLinks;
