import { useLayoutEffect, useRef } from 'react';

const BULLET = '- ';
const BULLET_RE = /^\s*[-•]\s+/;

/**
 * Textarea with a small toolbar for bullet lines.
 * Enter on a bullet line continues the list.
 * `autoGrow` makes the box follow its content (CSS max-height caps it).
 */
const RichTextarea = ({ value, onChange, rows = 2, autoGrow = false, className = '', ...props }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!autoGrow || !el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value, autoGrow]);

  // Apply a change and put the caret / selection back where it belongs
  const commit = (next, selStart, selEnd = selStart) => {
    onChange(next);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    });
  };

  const toggleBullets = () => {
    const el = ref.current;
    const { selectionStart: s, selectionEnd: e } = el;
    const lineStart = value.lastIndexOf('\n', s - 1) + 1;
    const nl = value.indexOf('\n', e);
    const lineEnd = nl === -1 ? value.length : nl;
    const lines = value.slice(lineStart, lineEnd).split('\n');
    const allBulleted = lines.every((l) => !l.trim() || BULLET_RE.test(l));

    const nextLines = lines.map((l) => {
      if (allBulleted) return l.replace(BULLET_RE, '');
      if (!l.trim() && lines.length > 1) return l;
      return BULLET_RE.test(l) ? l : BULLET + l;
    });
    const block = nextLines.join('\n');
    const next = value.slice(0, lineStart) + block + value.slice(lineEnd);
    commit(next, lineStart + block.length);
  };

  const onKeyDown = (ev) => {
    if (ev.key !== 'Enter' || ev.shiftKey) return;
    const el = ref.current;
    const s = el.selectionStart;
    if (s !== el.selectionEnd) return;
    const lineStart = value.lastIndexOf('\n', s - 1) + 1;
    const line = value.slice(lineStart, s);
    if (!BULLET_RE.test(line)) return;

    ev.preventDefault();
    if (!line.replace(BULLET_RE, '').trim()) {
      // Enter on an empty bullet ends the list
      commit(value.slice(0, lineStart) + value.slice(s), lineStart);
    } else {
      commit(`${value.slice(0, s)}\n${BULLET}${value.slice(s)}`, s + 1 + BULLET.length);
    }
  };

  // Keep the textarea's selection when clicking toolbar buttons
  const keepFocus = (ev) => ev.preventDefault();

  return (
    <div className={`rich-textarea ${autoGrow ? 'rich-textarea--grow' : ''} ${className}`}>
      <div className="rich-toolbar" role="toolbar" aria-label="Formatting">
        <button
          type="button"
          className="rich-tool"
          onMouseDown={keepFocus}
          onClick={toggleBullets}
          title="Bullet list"
          aria-label="Bullet list"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="2.5" cy="3.5" r="1.1" fill="currentColor" />
            <circle cx="2.5" cy="7" r="1.1" fill="currentColor" />
            <circle cx="2.5" cy="10.5" r="1.1" fill="currentColor" />
            <path d="M5.5 3.5h7M5.5 7h7M5.5 10.5h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>
        <span className="rich-hint">- item</span>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        rows={rows}
        {...props}
      />
    </div>
  );
};

export default RichTextarea;
