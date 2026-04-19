import { useState, useEffect } from 'react';
import './App.css';
import { api } from './api';
import AuthForm from './components/AuthForm';
import LanguageSelection from './components/LanguageSelection';
import CategorySelection from './components/CategorySelection';
import Card from './components/Card';
import AddCardForm from './components/AddCardForm';

function App() {
  const [user, setUser] = useState(null);
  const [allCards, setAllCards] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [addCardDefaultType, setAddCardDefaultType] = useState(null);
  const [allLinks, setAllLinks] = useState([]);
  const [allLanguages, setAllLanguages] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoadingCards(true);
    Promise.all([api.cards.getAll(), api.links.getAll(), api.languages.getAll()])
      .then(([cards, links, languages]) => { setAllCards(cards); setAllLinks(links); setAllLanguages(languages); })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingCards(false));
  }, [user]);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = allCards.filter(
        (c) => c.type === selectedCategory && (!selectedLanguage || c.language === selectedLanguage?.name)
      );
      setCards([...filtered].sort(() => Math.random() - 0.5));
      setCurrentCardIndex(0);
    }
  }, [selectedCategory, selectedLanguage, allCards]);

  const handleAuth = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAllCards([]);
    setAllLinks([]);
    setAllLanguages([]);
    setSelectedLanguage(null);
    setSelectedCategory(null);
    setShowAddCardForm(false);
  };

  const handleAddLink = async (newLink) => {
    try {
      const created = await api.links.create(newLink);
      setAllLinks((prev) => [...prev, created]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveLink = async (id) => {
    try {
      await api.links.remove(id);
      setAllLinks((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelectLanguage = (language) => {
    setSelectedLanguage(language);
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

  const handleAddLanguage = async (name, code) => {
    try {
      const created = await api.languages.create({ name, ...(code ? { code } : {}) });
      setAllLanguages((prev) => [...prev, created]);
    } catch (err) {
      setError(err.message);
    }
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
        <h1>Sprage</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: '.5rem' }}>
          Master languages through intelligent repetition
        </p>
        <AuthForm onAuth={handleAuth} />
      </>
    );
  }

  return (
    <>
      <div className="top-bar">
        <h1>Sprage</h1>
        <div className="top-bar-user">
          <span>Welcome, <strong>{user.username}</strong></span>
          <button className="btn-ghost" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {error && <p className="error-msg" style={{ maxWidth: 480, margin: '0 auto 1.5rem' }}>{error}</p>}

      {loadingCards ? (
        <div className="loading">
          <div className="loading-dots">
            <span /><span /><span />
          </div>
          Loading your collection
        </div>
      ) : showAddCardForm ? (
        <AddCardForm
          onAddCard={handleAddCard}
          onCancel={() => setShowAddCardForm(false)}
          defaultLanguage={selectedLanguage?.name}
          defaultType={addCardDefaultType}
        />
      ) : selectedCategory ? (
        <div className="card-container">
          <div className="card-back-nav">
            <button onClick={() => { setSelectedLanguage(null); setSelectedCategory(null); }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Languages
            </button>
            <span style={{ color: 'var(--border-gold)' }}>›</span>
            <button onClick={() => setSelectedCategory(null)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer', textTransform: 'uppercase', fontSize: '.8rem', letterSpacing: '.08em' }}>
              {selectedLanguage?.name}
            </button>
            <span style={{ color: 'var(--border-gold)' }}>›</span>
            <span style={{ color: 'var(--gold)', textTransform: 'capitalize' }}>{selectedCategory}</span>
          </div>
          {cards.length > 0 ? (
            <>
              <p className="card-counter">
                Card <span>{currentCardIndex + 1}</span> of <span>{cards.length}</span>
              </p>
              <Card card={cards[currentCardIndex]} onNext={handleNextCard} />
            </>
          ) : (
            <div style={{ padding: '3rem 0' }}>
              <p>No cards in this category yet.</p>
              <button style={{ marginTop: '1rem' }} onClick={() => { setAddCardDefaultType(selectedCategory); setSelectedCategory(null); setShowAddCardForm(true); }}>
                Add your first card
              </button>
            </div>
          )}
        </div>
      ) : selectedLanguage ? (
        <CategorySelection
          onSelectCategory={handleSelectCategory}
          onShowAddCardForm={() => { setAddCardDefaultType(selectedCategory); setSelectedCategory(null); setShowAddCardForm(true); }}
          cardCounts={{
            idiom: allCards.filter(c => c.type === 'idiom' && c.language === selectedLanguage?.name).length,
            grammar: allCards.filter(c => c.type === 'grammar' && c.language === selectedLanguage?.name).length,
            vocabulary: allCards.filter(c => c.type === 'vocabulary' && c.language === selectedLanguage?.name).length,
          }}
          selectedLanguage={selectedLanguage}
          onBack={() => setSelectedLanguage(null)}
          languageLinks={allLinks.filter(l => l.languageId?._id === selectedLanguage?._id)}
          onAddLink={handleAddLink}
          onRemoveLink={handleRemoveLink}
        />
      ) : (
        <LanguageSelection
          languages={allLanguages}
          cardCounts={allLanguages.reduce((acc, lang) => {
            acc[lang._id] = allCards.filter(c => c.language === lang.name).length;
            return acc;
          }, {})}
          onSelectLanguage={handleSelectLanguage}
          onShowAddCardForm={() => setShowAddCardForm(true)}
          onAddLanguage={handleAddLanguage}
        />
      )}
    </>
  );
}

export default App;
