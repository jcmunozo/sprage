import React from 'react';

const CategorySelection = ({ onSelectCategory, onShowAddCardForm }) => {
  const categories = ['idiom', 'grammar', 'vocabulary'];

  return (
    <div className="category-selection">
      <h2>Select a Category</h2>
      <div className="category-buttons">
        {categories.map(category => (
          <button key={category} onClick={() => onSelectCategory(category)}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
      <div className="add-card-button" style={{marginTop: "1rem"}}>
        <button onClick={onShowAddCardForm}>Add New Card</button>
      </div>
    </div>
  );
};

export default CategorySelection;
