import { useState } from 'react';

const AddLanguageForm = ({ onAdd, onCancel }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onAdd(name.trim(), code.trim() || undefined);
    setLoading(false);
  };

  return (
    <div className="add-card-form">
      <h3>New Language</h3>
      <div className="gold-divider" />
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Spanish"
            required
          />
        </div>
        <div className="form-group">
          <label>Code <span className="field-hint">(optional)</span></label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. ES"
          />
        </div>
        <div className="form-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Add Language'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLanguageForm;
