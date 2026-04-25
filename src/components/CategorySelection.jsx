import { motion } from 'framer-motion';
import LanguageLinks from './LanguageLinks';

const CATEGORIES = [
  { id: 'vocabulary', label: 'Vocabulary', icon: '词', description: 'Words & definitions' },
  { id: 'idiom',      label: 'Idioms',     icon: '語', description: 'Phrases & expressions' },
  { id: 'grammar',    label: 'Grammar',    icon: '文', description: 'Rules & structures' },
];

const container = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const CategorySelection = ({ onSelectCategory, onShowAddCardForm, cardCounts = {}, selectedLanguage, languageLinks = [], onAddLink, onRemoveLink }) => {
  return (
    <div className="category-selection">
      <p>Choose a category to study</p>

      <motion.div
        className="category-buttons"
        variants={container}
        initial="initial"
        animate="animate"
      >
        {CATEGORIES.map(({ id, label, icon, description }) => (
          <motion.button
            key={id}
            className="category-btn"
            variants={item}
            onClick={() => onSelectCategory(id)}
          >
            <span className="category-icon">{icon}</span>
            <span style={{ display: 'block', marginBottom: '.2rem' }}>{label}</span>
            <span style={{ display: 'block', fontSize: '.65rem', color: 'var(--fg-3)', textTransform: 'none', letterSpacing: '.03em', fontWeight: 400 }}>
              {description}
            </span>
            {cardCounts[id] > 0 && (
              <span style={{
                display: 'inline-block',
                marginTop: '.6rem',
                fontSize: '.6rem',
                color: 'var(--green-400)',
                border: '1px solid var(--border-green)',
                borderRadius: '999px',
                padding: '2px 8px',
                letterSpacing: '.08em',
              }}>
                {cardCounts[id]} cards
              </span>
            )}
          </motion.button>
        ))}
      </motion.div>

      <div className="add-card-cta">
        <p>Expand your collection</p>
        <button onClick={onShowAddCardForm}>+ Add New Card</button>
      </div>

      <LanguageLinks links={languageLinks} language={selectedLanguage} onAddLink={onAddLink} onRemoveLink={onRemoveLink} />
    </div>
  );
};

export default CategorySelection;
