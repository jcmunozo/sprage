// Tiny formatting for card text, stored as plain strings:
//   - item / • item → bullet list (one per line)
// Rendered as React elements (no innerHTML), so card text can't inject markup.

const BULLET_RE = /^\s*[-•]\s+/;
const MARK_RE = /(\*\*[^*\n]+?\*\*)/g;

// Highlighting was removed; cards saved with **word** just show the word
export const renderInline = (text) => text.replace(MARK_RE, (m) => m.slice(2, -2));

/** Group lines into paragraphs and bullet lists. */
export const toBlocks = (text) => {
  const blocks = [];
  for (const line of text.split('\n')) {
    const isBullet = BULLET_RE.test(line);
    const last = blocks[blocks.length - 1];
    const type = isBullet ? 'list' : 'para';
    const content = isBullet ? line.replace(BULLET_RE, '') : line;
    if (last && last.type === type) last.lines.push(content);
    else blocks.push({ type, lines: [content] });
  }
  // Drop blank paragraph lines at the edges
  return blocks
    .map((b) => (b.type === 'para' ? { ...b, lines: trimBlank(b.lines) } : b))
    .filter((b) => b.lines.length > 0);
};

const trimBlank = (lines) => {
  let start = 0;
  let end = lines.length;
  while (start < end && !lines[start].trim()) start++;
  while (end > start && !lines[end - 1].trim()) end--;
  return lines.slice(start, end);
};

export const hasRichStructure = (text = '') =>
  text.includes('\n') || BULLET_RE.test(text);

/** Plain one-line version for previews (search results, duplicate hints). */
export const stripRich = (text = '') =>
  text
    .split('\n')
    .map((l) => l.replace(BULLET_RE, '').trim())
    .filter(Boolean)
    .join(' · ')
    .replace(/\*\*([^*\n]+?)\*\*/g, '$1');
