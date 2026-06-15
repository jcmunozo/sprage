import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import { api } from './api';
import { pageTransition, screenIn } from './lib/motion';
import AuthForm from './components/AuthForm';
import LanguageSelection from './components/LanguageSelection';
import CategorySelection from './components/CategorySelection';
import StudySession from './components/StudySession';
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
        return filtered;
      });
    }
  }, [selectedCategory, selectedLanguage, allCards]);

  useEffect(() => {
    if (selectedDeck) {
      setCards(allCards.filter(c => String(c.deckId) === String(selectedDeck._id)));
    }
  }, [selectedDeck, allCards]);

  useEffect(() => {
    if (studyingDue) {
      setCards(dueCards);
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

  // Reviews recorded during a session change what's due — refresh on the way home
  const refreshDue = () => {
    api.progress.getDue()
      .then((due) => {
        setDueCards([
          ...due.due.map(p => p.cardId).filter(Boolean),
          ...due.new,
        ]);
      })
      .catch(() => {});
  };

  const goHome = () => {
    if (studyingDue || selectedDeck || selectedCategory) refreshDue();
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
      <motion.div className="auth-screen" {...screenIn}>
        <div className="auth-logo" aria-hidden="true">语</div>
        <h1>Sprage</h1>
        <p>Master languages through intelligent repetition</p>
        <div className="auth-features">
          <span>Spaced repetition</span>
          <span className="auth-features-dot" aria-hidden="true" />
          <span>Any language</span>
          <span className="auth-features-dot" aria-hidden="true" />
          <span>Your own decks</span>
        </div>
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

      <main className="app-main">
        {error && (
          <p className="error-msg app-error">{error}</p>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={viewKey} {...pageTransition}>
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
                existingCards={allCards}
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
              <StudySession
                cards={cards}
                onUpdate={handleUpdateCard}
                onHome={goHome}
                emptyMessage="No cards due for review right now."
                emptyActionLabel="Back to Home"
                onEmptyAction={goHome}
              />
            ) : selectedDeck ? (
              <StudySession
                cards={cards}
                onUpdate={handleUpdateCard}
                onHome={goHome}
                emptyMessage="No cards in this deck yet."
                emptyActionLabel="Add your first card"
                onEmptyAction={() => { setSelectedDeck(null); setShowAddCardForm(true); }}
              />
            ) : selectedCategory ? (
              <StudySession
                cards={cards}
                onUpdate={handleUpdateCard}
                onHome={goHome}
                emptyMessage="No cards in this category yet."
                emptyActionLabel="Add your first card"
                onEmptyAction={() => { setAddCardDefaultType(selectedCategory); setSelectedCategory(null); setShowAddCardForm(true); }}
              />
            ) : selectedLanguage ? (
              <CategorySelection
                onSelectCategory={handleSelectCategory}
                onShowAddCardForm={() => { setAddCardDefaultType(selectedCategory); setSelectedCategory(null); setShowAddCardForm(true); }}
                cardCounts={{
                  idiom: cardsCountByLanguageAndType(selectedLanguage._id, 'idiom'),
                  grammar: cardsCountByLanguageAndType(selectedLanguage._id, 'grammar'),
                  vocabulary: cardsCountByLanguageAndType(selectedLanguage._id, 'vocabulary'),
                }}
                cards={allCards.filter(
                  (c) => String(c.languageId) === String(selectedLanguage._id),
                )}
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
