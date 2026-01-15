import { useState, useEffect } from 'react';
import './App.css';
import CategorySelection from './components/CategorySelection';
import Card from './components/Card';
import AddCardForm from './components/AddCardForm';
import data from '../unified_data.json';

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [allData, setAllData] = useState(data);

  useEffect(() => {
    if (selectedCategory) {
      const filteredCards = allData.filter(card => card.type === selectedCategory);
      // shuffle the cards
      const shuffledCards = filteredCards.sort(() => Math.random() - 0.5);
      setCards(shuffledCards);
      setCurrentCardIndex(0);
    }
  }, [selectedCategory, allData]);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setShowAddCardForm(false);
  };

  const handleNextCard = () => {
    setCurrentCardIndex(prevIndex => (prevIndex + 1) % cards.length);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const handleAddCard = (newCard) => {
    const newId = allData.length > 0 ? Math.max(...allData.map(c => c.id)) + 1 : 0;
    const cardWithId = { ...newCard, id: newId };
    setAllData(prevData => [...prevData, cardWithId]);
    setShowAddCardForm(false);
    setSelectedCategory(newCard.type);
  };

  const handleCancelAddCard = () => {
    setShowAddCardForm(false);
  };

  const handleShowAddCard = () => {
    setSelectedCategory(null);
    setShowAddCardForm(true);
  }

  return (
    <>
      <h1>Language Learning Cards</h1>
      {showAddCardForm ? (
        <AddCardForm
          onAddCard={handleAddCard}
          onCancel={handleCancelAddCard}
        />
      ) : selectedCategory ? (
        <div>
          <button onClick={handleBackToCategories}>Back to Categories</button>
          {cards.length > 0 ? (
            <Card card={cards[currentCardIndex]} onNext={handleNextCard} />
          ) : (
            <p>No cards in this category.</p>
          )}
        </div>
      ) : (
        <CategorySelection
          onSelectCategory={handleSelectCategory}
          onShowAddCardForm={handleShowAddCard}
        />
      )}
    </>
  );
}

export default App;
