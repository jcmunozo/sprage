import { useState } from 'react';

const AddDeckForm = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onAdd(name.trim(), description.trim() || undefined);
    setLoading(false);
  };

  return (
    <div className="add-card-form">
      <h3>New Deck</h3>
      <div className="gold-divider" />
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Business English"
            required
          />
        </div>
        <div className="form-group">
          <label>Description <span style={{ color: 'var(--fg-3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Vocabulary for work meetings"
          />
        </div>
        <div className="form-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Create Deck'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDeckForm;
