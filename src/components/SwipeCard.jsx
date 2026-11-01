import { useRef } from 'react';
import {
  animate,
  motion,
  useIsPresent,
  useMotionValue,
  usePresenceData,
  useTransform,
} from 'framer-motion';
import { stackCard, SWIPE_DISTANCE, SWIPE_VELOCITY } from '../lib/motion';

const snapBack = { type: 'spring', stiffness: 500, damping: 32 };

/**
 * Top card of the study stack. The outer layer runs the enter / throw-off /
 * undo animations; the inner layer follows the pointer while dragging.
 * Dragging is only enabled once the answer is visible (`canSwipe`):
 * right = Good, left = Again.
 */
const SwipeCard = ({ custom, canSwipe, onSwipe, children }) => {
  const isPresent = useIsPresent();
  const presence = usePresenceData() ?? custom;
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-10, 10]);
  const goodOpacity = useTransform(x, [20, SWIPE_DISTANCE], [0, 1]);
  const againOpacity = useTransform(x, [-SWIPE_DISTANCE, -20], [1, 0]);
  const dragged = useRef(false);

  // A thrown card stays above the one rising behind it; a card sinking back on undo goes under
  const zIndex = isPresent ? 2 : presence?.undo ? 1 : 3;

  const handleDragEnd = (_e, info) => {
    const dist = info.offset.x;
    const vel = info.velocity.x;
    const dir = Math.sign(dist);
    const thrown =
      dir !== 0 &&
      (Math.abs(dist) > SWIPE_DISTANCE ||
        (Math.abs(vel) > SWIPE_VELOCITY && Math.sign(vel) === dir));
    if (thrown) onSwipe(dir);
    else animate(x, 0, snapBack);
  };

  return (
    <motion.div
      className="card-stack-top"
      custom={custom}
      variants={stackCard}
      initial="enter"
      animate="center"
      exit="exit"
      style={{ zIndex, pointerEvents: isPresent ? 'auto' : 'none' }}
    >
      <motion.div
        className={`card-swipe ${canSwipe ? 'card-swipe--active' : ''}`}
        style={{ x, rotate }}
        drag={canSwipe && isPresent ? 'x' : false}
        dragMomentum={false}
        dragElastic={0.9}
        onDragStart={() => { dragged.current = true; }}
        onDragEnd={handleDragEnd}
        // A drag that ends over the card must not also flip it
        onClickCapture={(e) => {
          if (dragged.current) {
            e.stopPropagation();
            dragged.current = false;
          }
        }}
        onPointerDown={() => { dragged.current = false; }}
      >
        {children}
        <motion.span className="swipe-stamp swipe-stamp--good" style={{ opacity: goodOpacity }} aria-hidden="true">
          Good
        </motion.span>
        <motion.span className="swipe-stamp swipe-stamp--again" style={{ opacity: againOpacity }} aria-hidden="true">
          Again
        </motion.span>
      </motion.div>
    </motion.div>
  );
};

export default SwipeCard;
