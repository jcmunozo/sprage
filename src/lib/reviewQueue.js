import { api } from '../api';

// Holds the most recent review back from the API so it can still be undone.
// It is sent when the next card is rated, when the session ends, or before
// anything reads progress (e.g. refreshing the due queue).

let pending = null;

export const reviewQueue = {
  /** Queue a review; the previously queued one (if any) is sent now. */
  push(cardId, quality) {
    const previous = pending;
    pending = cardId ? { cardId, quality } : null;
    if (previous) send(previous);
  },

  /** Drop the queued review without sending it. Returns true if there was one. */
  cancel() {
    const had = pending !== null;
    pending = null;
    return had;
  },

  /** Send the queued review now. `keepalive` lets it survive a page unload. */
  flush({ keepalive = false } = {}) {
    const previous = pending;
    pending = null;
    return previous ? send(previous, keepalive) : Promise.resolve();
  },
};

function send({ cardId, quality }, keepalive = false) {
  return api.progress
    .recordReview(cardId, quality, keepalive ? { keepalive: true } : undefined)
    .catch(() => {}); // best-effort, same as before
}
