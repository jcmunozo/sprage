// Shared motion tokens and variants so every view animates with the
// same rhythm and curve.

export const ease = [0.22, 1, 0.36, 1];
export const easeSpring = [0.16, 1, 0.3, 1];

export const duration = {
  fast: 0.18,
  base: 0.28,
  slow: 0.42,
};

// Page-level transitions used by the top-level AnimatePresence in App.jsx
export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: duration.base, ease },
};

// Auth screen + form entrance
export const screenIn = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: easeSpring },
};

// Staggered list container — apply to grid wrappers
export const listContainer = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

// Individual list item — lifts in from below
export const listItem = {
  initial: { opacity: 0, y: 18, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: duration.slow, ease } },
};

// Card flip + entrance
export const cardEntrance = {
  initial: { opacity: 0, scale: 0.96, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  transition: { duration: 0.38, ease },
};

// Switching between hint / quality / edit-form under the card
export const actionSwap = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
  transition: { duration: duration.base, ease },
};

// Tiny fade — for hints, prompts
export const softFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
  transition: { duration: duration.fast, delay: 0.08 },
};

// ── Card stack (study session) ──────────────────────────────────
// The top card is thrown off to the side when rated and flies back from
// there on undo. `custom` is { dir: -1 | 1, undo: boolean }.

export const STACK_PEEK = 10;      // px each card behind peeks out below
export const STACK_SHRINK = 0.05;  // scale step per card behind
const THROW_X = 560;
const THROW_ROTATE = 16;

const stackSpring = { type: 'spring', stiffness: 260, damping: 30 };

export const stackCard = {
  // New top card rises from the slot behind; an undone card returns from where it left
  enter: ({ undo, dir }) =>
    undo
      ? { x: dir * THROW_X, y: -30, rotate: dir * THROW_ROTATE, opacity: 0, scale: 1 }
      : { x: 0, y: STACK_PEEK, rotate: 0, opacity: 1, scale: 1 - STACK_SHRINK },
  center: {
    x: 0, y: 0, rotate: 0, opacity: 1, scale: 1,
    transition: { ...stackSpring, opacity: { duration: duration.fast } },
  },
  // Rated cards fly off; on undo the current card sinks back into the stack
  exit: ({ undo, dir }) =>
    undo
      ? { x: 0, y: STACK_PEEK, scale: 1 - STACK_SHRINK, opacity: 0,
          transition: { duration: duration.base, ease } }
      : { x: dir * THROW_X, y: -30, rotate: dir * THROW_ROTATE, opacity: 0,
          transition: { ...stackSpring, opacity: { duration: 0.22, delay: 0.1 } } },
};

// Swipe thresholds for dragging the top card
export const SWIPE_DISTANCE = 120; // px
export const SWIPE_VELOCITY = 500; // px/s
