import { useState, useEffect } from 'react';
import './App.css';
import { api } from './api';
import AuthForm from './components/AuthForm';
import CategorySelection from './components/CategorySelection';
import Card from './components/Card';
import AddCardForm from './components/AddCardForm';

function App() {
  const [user, setUser] = useState(null);
  const [allCards, setAllCards] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);
  const [error, setError] = useState('');

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Load cards from API when user logs in
  useEffect(() => {
    if (!user) return;
    setLoadingCards(true);
    api.cards.getAll()
      .then(setAllCards)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingCards(false));
  }, [user]);

  // Filter and shuffle cards when category changes
  useEffect(() => {
    if (selectedCategory) {
      const filtered = allCards.filter((c) => c.type === selectedCategory);
      setCards([...filtered].sort(() => Math.random() - 0.5));
      setCurrentCardIndex(0);
    }
  }, [selectedCategory, allCards]);

  const handleAuth = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAllCards([]);
    setSelectedCategory(null);
    setShowAddCardForm(false);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setShowAddCardForm(false);
  };

  const handleNextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const handleAddCard = async (newCard) => {
    try {
      const created = await api.cards.create(newCard);
      setAllCards((prev) => [...prev, created]);
      setShowAddCardForm(false);
      setSelectedCategory(newCard.type);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) {
    return (
      <>
        <h1>Language Learning Cards</h1>
        <AuthForm onAuth={handleAuth} />
      </>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Language Learning Cards</h1>
        <div>
          <span style={{ marginRight: '1rem' }}>Hi, {user.username}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {loadingCards ? (
        <p>Loading cards...</p>
      ) : showAddCardForm ? (
        <AddCardForm
          onAddCard={handleAddCard}
          onCancel={() => setShowAddCardForm(false)}
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
          onShowAddCardForm={() => { setSelectedCategory(null); setShowAddCardForm(true); }}
        />
      )}
    </>
  );
}

export default App;
