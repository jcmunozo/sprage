import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
      <motion.div
        className="auth-screen"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h1>Sprage</h1>
        <p>Master languages through intelligent repetition</p>
        <AuthForm onAuth={handleAuth} />
      </motion.div>
    );
  }

  const viewKey = showAddCardForm ? 'add-form'
    : selectedCategory   ? `cards-${selectedCategory}`
    : selectedLanguage   ? `cats-${selectedLanguage._id}`
    : 'languages';

  const showBreadcrumb = (selectedLanguage || selectedCategory) && !showAddCardForm;

  return (
    <>
      {/* ── Sticky header ── */}
      <header className="top-bar">
        <h1>Sprage</h1>
        <div className="top-bar-user">
          <span>Welcome, <strong>{user.username}</strong></span>
          <button className="btn-ghost" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* ── Breadcrumb ── */}
      {showBreadcrumb && (
        <nav className="card-back-nav">
          <button onClick={() => { setSelectedLanguage(null); setSelectedCategory(null); }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Languages
          </button>
          {selectedLanguage && (
            <>
              <span className="crumb-sep">›</span>
              {selectedCategory
                ? <span className="crumb-link" onClick={() => setSelectedCategory(null)}>{selectedLanguage.name}</span>
                : <span className="crumb-active">{selectedLanguage.name}</span>
              }
            </>
          )}
          {selectedCategory && (
            <>
              <span className="crumb-sep">›</span>
              <span className="crumb-active" style={{ textTransform: 'capitalize' }}>{selectedCategory}</span>
            </>
          )}
        </nav>
      )}

      {/* ── Main content ── */}
      <main style={{ flex: 1 }}>
        {error && (
          <p className="error-msg" style={{ maxWidth: 540, margin: '1rem auto', padding: '0 32px' }}>{error}</p>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={viewKey}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {loadingCards ? (
              <div className="loading">
                <div className="loading-dots"><span /><span /><span /></div>
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
                {cards.length > 0 ? (
                  <>
                    <p className="card-counter">
                      Card <span>{currentCardIndex + 1}</span> of <span>{cards.length}</span>
                    </p>
                    <Card card={cards[currentCardIndex]} onNext={handleNextCard} />
                  </>
                ) : (
                  <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                    <p>No cards in this category yet.</p>
                    <button
                      style={{ marginTop: '1rem' }}
                      onClick={() => { setAddCardDefaultType(selectedCategory); setSelectedCategory(null); setShowAddCardForm(true); }}
                    >
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
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}

export default App;
