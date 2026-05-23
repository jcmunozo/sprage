import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import { api } from './api';
import AuthForm from './components/AuthForm';
import LanguageSelection from './components/LanguageSelection';
import CategorySelection from './components/CategorySelection';
import Card from './components/Card';
import AddCardForm from './components/AddCardForm';
import AddLanguageForm from './components/AddLanguageForm';
import AddDeckForm from './components/AddDeckForm';

function App() {
  const [user, setUser] = useState(null);
  const [allCards, setAllCards] = useState([]);
  const [allDecks, setAllDecks] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [studyingDue, setStudyingDue] = useState(false);
  const [dueCards, setDueCards] = useState([]);
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [addCardDefaultType, setAddCardDefaultType] = useState(null);
  const [showAddLanguageForm, setShowAddLanguageForm] = useState(false);
  const [showAddDeckForm, setShowAddDeckForm] = useState(false);
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
    Promise.all([
      api.cards.getAll(),
      api.links.getAll(),
      api.languages.getAll(),
      api.decks.getAll(),
      api.progress.getDue(),
    ])
      .then(([cards, links, languages, decks, due]) => {
        setAllCards(cards);
        setAllLinks(links);
        setAllLanguages(languages);
        setAllDecks(decks);
        const dueList = [
          ...due.due.map(p => p.cardId).filter(Boolean),
          ...due.new,
        ];
        setDueCards(dueList);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingCards(false));
  }, [user]);

  useEffect(() => {
    if (selectedCategory) {
      const filtered = allCards.filter(
        (c) => c.type === selectedCategory
          && (!selectedLanguage || String(c.languageId) === String(selectedLanguage._id))
      );
      setCards(prev => {
        const sameSet = prev.length === filtered.length && filtered.every(c => prev.some(p => p._id === c._id));
        if (sameSet) return prev.map(c => filtered.find(f => f._id === c._id) || c);
        setCurrentCardIndex(0);
        return [...filtered].sort(() => Math.random() - 0.5);
      });
    }
  }, [selectedCategory, selectedLanguage, allCards]);

  useEffect(() => {
    if (selectedDeck) {
      const filtered = allCards.filter(c => String(c.deckId) === String(selectedDeck._id));
      setCards([...filtered].sort(() => Math.random() - 0.5));
      setCurrentCardIndex(0);
    }
  }, [selectedDeck, allCards]);

  useEffect(() => {
    if (studyingDue) {
      setCards([...dueCards].sort(() => Math.random() - 0.5));
      setCurrentCardIndex(0);
    }
  }, [studyingDue, dueCards]);

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
    setAllDecks([]);
    setDueCards([]);
    setSelectedLanguage(null);
    setSelectedCategory(null);
    setSelectedDeck(null);
    setStudyingDue(false);
    setShowAddCardForm(false);
    setShowAddLanguageForm(false);
    setShowAddDeckForm(false);
  };

  const handleAddLink = async (newLink) => {
    try {
      const created = await api.links.create(newLink);
      setAllLinks((prev) => [...prev, created]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateLink = async (id, data) => {
    try {
      const updated = await api.links.update(id, data);
      setAllLinks((prev) => prev.map((l) => l._id === id ? updated : l));
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
    setSelectedDeck(null);
    setStudyingDue(false);
    setShowAddCardForm(false);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setShowAddCardForm(false);
  };

  const handleAddLanguage = async (name, code) => {
    try {
      const created = await api.languages.create({ name, ...(code ? { code } : {}) });
      setAllLanguages((prev) => [...prev, created]);
      setShowAddLanguageForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelectDeck = (deck) => {
    setSelectedDeck(deck);
    setSelectedLanguage(null);
    setSelectedCategory(null);
    setStudyingDue(false);
    setShowAddCardForm(false);
  };

  const handleAddDeck = async (name, description) => {
    try {
      const created = await api.decks.create({ name, ...(description ? { description } : {}) });
      setAllDecks((prev) => [...prev, created]);
      setShowAddDeckForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveDeck = async (id) => {
    try {
      await api.decks.remove(id);
      setAllDecks((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStudyDue = () => {
    setStudyingDue(true);
    setSelectedDeck(null);
    setSelectedLanguage(null);
    setSelectedCategory(null);
    setShowAddCardForm(false);
  };

  const handleUpdateCard = async (id, data) => {
    try {
      const updated = await api.cards.update(id, data);
      setAllCards(prev => prev.map(c => c._id === id ? updated : c));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
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

  const cardsCountByLanguage = (langId) =>
    allCards.filter((c) => String(c.languageId) === String(langId)).length;

  const cardsCountByLanguageAndType = (langId, type) =>
    allCards.filter((c) => c.type === type && String(c.languageId) === String(langId)).length;

  const goHome = () => {
    setSelectedLanguage(null);
    setSelectedCategory(null);
    setSelectedDeck(null);
    setStudyingDue(false);
    setShowAddCardForm(false);
    setShowAddLanguageForm(false);
    setShowAddDeckForm(false);
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

  const viewKey = showAddCardForm ? 'add-card-form'
    : showAddLanguageForm ? 'add-language-form'
    : showAddDeckForm ? 'add-deck-form'
    : studyingDue ? 'study-due'
    : selectedDeck ? `deck-${selectedDeck._id}`
    : selectedCategory ? `cards-${selectedCategory}`
    : selectedLanguage ? `cats-${selectedLanguage._id}`
    : 'languages';

  const showBreadcrumb = selectedLanguage || selectedCategory || selectedDeck || studyingDue
    || showAddCardForm || showAddLanguageForm || showAddDeckForm;

  return (
    <>
      <header className="top-bar">
        <h1>Sprage</h1>
        <div className="top-bar-user">
          <span>Welcome, <strong>{user.username}</strong></span>
          <button className="btn-ghost" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {showBreadcrumb && (
        <nav className="card-back-nav">
          <button onClick={goHome}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Home
          </button>
          {showAddLanguageForm && (
            <>
              <span className="crumb-sep">›</span>
              <span className="crumb-active">New Language</span>
            </>
          )}
          {showAddDeckForm && (
            <>
              <span className="crumb-sep">›</span>
              <span className="crumb-active">New Deck</span>
            </>
          )}
          {selectedDeck && (
            <>
              <span className="crumb-sep">›</span>
              <span className="crumb-active">{selectedDeck.name}</span>
            </>
          )}
          {studyingDue && (
            <>
              <span className="crumb-sep">›</span>
              <span className="crumb-active">Study Due</span>
            </>
          )}
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
                defaultLanguage={selectedLanguage}
                defaultType={addCardDefaultType}
                decks={allDecks}
                languages={allLanguages}
              />
            ) : showAddLanguageForm ? (
              <AddLanguageForm
                onAdd={handleAddLanguage}
                onCancel={() => setShowAddLanguageForm(false)}
              />
            ) : showAddDeckForm ? (
              <AddDeckForm
                onAdd={handleAddDeck}
                onCancel={() => setShowAddDeckForm(false)}
              />
            ) : studyingDue ? (
              <div className="card-container">
                {cards.length > 0 ? (
                  <>
                    <p className="card-counter">
                      Card <span>{currentCardIndex + 1}</span> of <span>{cards.length}</span>
                    </p>
                    <Card card={cards[currentCardIndex]} onNext={handleNextCard} onUpdate={handleUpdateCard} />
                  </>
                ) : (
                  <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                    <p>No cards due for review right now.</p>
                    <button style={{ marginTop: '1rem' }} onClick={goHome}>Back to Home</button>
                  </div>
                )}
              </div>
            ) : selectedDeck ? (
              <div className="card-container">
                {cards.length > 0 ? (
                  <>
                    <p className="card-counter">
                      Card <span>{currentCardIndex + 1}</span> of <span>{cards.length}</span>
                    </p>
                    <Card card={cards[currentCardIndex]} onNext={handleNextCard} onUpdate={handleUpdateCard} />
                  </>
                ) : (
                  <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                    <p>No cards in this deck yet.</p>
                    <button
                      style={{ marginTop: '1rem' }}
                      onClick={() => { setSelectedDeck(null); setShowAddCardForm(true); }}
                    >
                      Add your first card
                    </button>
                  </div>
                )}
              </div>
            ) : selectedCategory ? (
              <div className="card-container">
                {cards.length > 0 ? (
                  <>
                    <p className="card-counter">
                      Card <span>{currentCardIndex + 1}</span> of <span>{cards.length}</span>
                    </p>
                    <Card card={cards[currentCardIndex]} onNext={handleNextCard} onUpdate={handleUpdateCard} />
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
                  idiom: cardsCountByLanguageAndType(selectedLanguage._id, 'idiom'),
                  grammar: cardsCountByLanguageAndType(selectedLanguage._id, 'grammar'),
                  vocabulary: cardsCountByLanguageAndType(selectedLanguage._id, 'vocabulary'),
                }}
                selectedLanguage={selectedLanguage}
                languageLinks={allLinks.filter(l => l.languageId?._id === selectedLanguage?._id)}
                onAddLink={handleAddLink}
                onUpdateLink={handleUpdateLink}
                onRemoveLink={handleRemoveLink}
              />
            ) : (
              <LanguageSelection
                languages={allLanguages}
                cardCounts={allLanguages.reduce((acc, lang) => {
                  acc[lang._id] = cardsCountByLanguage(lang._id);
                  return acc;
                }, {})}
                onSelectLanguage={handleSelectLanguage}
                onShowAddCardForm={() => setShowAddCardForm(true)}
                onShowAddLanguageForm={() => setShowAddLanguageForm(true)}
                onShowAddDeckForm={() => setShowAddDeckForm(true)}
                decks={allDecks}
                deckCardCounts={allDecks.reduce((acc, deck) => {
                  acc[deck._id] = allCards.filter(c => String(c.deckId) === String(deck._id)).length;
                  return acc;
                }, {})}
                onSelectDeck={handleSelectDeck}
                onRemoveDeck={handleRemoveDeck}
                dueTotal={dueCards.length}
                onStudyDue={handleStudyDue}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}

export default App;
