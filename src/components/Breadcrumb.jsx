import { AnimatePresence, motion } from 'framer-motion';
import { ease } from '../lib/motion';

// Glass-pill breadcrumb (inspired by 21st.dev "Liquid Glass Breadcrumb").
// The green highlight behind the current level slides between levels via a
// shared layoutId. `items`: [{ key, label, icon, onClick }] — the last one is current.

const activeSpring = { type: 'spring', stiffness: 420, damping: 34 };

const Breadcrumb = ({ items }) => (
  <nav className="crumbs" aria-label="Breadcrumb">
    <motion.ol className="crumbs-pill" layout transition={{ duration: 0.28, ease }}>
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((item, i) => {
          const active = i === items.length - 1;
          const content = (
            <>
              {active && (
                <motion.span layoutId="crumb-active" className="crumbs-active-bg" transition={activeSpring} />
              )}
              {item.icon && <span className="crumbs-icon" aria-hidden="true">{item.icon}</span>}
              <span className="crumbs-label">{item.label}</span>
            </>
          );
          return (
            <motion.li
              key={item.key}
              className="crumbs-item"
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.22, ease }}
            >
              {i > 0 && (
                <svg className="crumbs-sep" width="8" height="10" viewBox="0 0 8 10" fill="none" aria-hidden="true">
                  <path d="M2 1.5 5.5 5 2 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {active ? (
                <span className="crumbs-link crumbs-link--active" aria-current="page" title={item.label}>
                  {content}
                </span>
              ) : (
                <button type="button" className="crumbs-link" onClick={item.onClick} title={item.label}>
                  {content}
                </button>
              )}
            </motion.li>
          );
        })}
      </AnimatePresence>
    </motion.ol>
  </nav>
);

export default Breadcrumb;
