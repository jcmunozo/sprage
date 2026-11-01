import { renderInline, toBlocks } from '../lib/richText';

// Renders card text with line breaks and bullet lists (see lib/richText).
const RichText = ({ text = '', as: Tag = 'div', className }) => {
  const blocks = toBlocks(text);
  return (
    <Tag className={className}>
      {blocks.map((block, bi) =>
        block.type === 'list' ? (
          <ul key={bi} className="rich-list">
            {block.lines.map((line, li) => (
              <li key={li}>{renderInline(line)}</li>
            ))}
          </ul>
        ) : (
          <p key={bi} className="rich-para">
            {block.lines.map((line, li) => (
              <span key={li}>
                {li > 0 && <br />}
                {renderInline(line)}
              </span>
            ))}
          </p>
        ),
      )}
    </Tag>
  );
};

export default RichText;
