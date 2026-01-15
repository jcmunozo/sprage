import React, { useState } from 'react';

const AddCardForm = ({ onAddCard, onCancel }) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [category, setCategory] = useState('idiom');
  const categories = ['idiom', 'grammar', 'vocabulary'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!front || !back) return;
    onAddCard({
      type: category,
      front,
      back,
      language: 'English', // default for now
      example: '',
      tags: []
    });
    setFront('');
    setBack('');
  };

  return (
    <div className="add-card-form">
      <h3>Add a New Card</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map(cat => (
                    <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                ))}
            </select>
        </div>
        <div className="form-group">
          <label>Front</label>
          <input
            type="text"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="The word or phrase"
          />
        </div>
        <div className="form-group">
          <label>Back</label>
          <input
            type="text"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="The meaning or translation"
          />
        </div>
        <div className="form-actions">
          <button type="submit">Add Card</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddCardForm;
