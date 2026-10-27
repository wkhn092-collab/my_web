import { Fragment, type CSSProperties, type ElementType } from 'react';
import { Reveal } from './Reveal';

const PUNCTUATION = /[.,:;!?״"׳']/g;

function words(text: string, accent: string[], indexOffset = 0) {
  const list = text.split(/\s+/).filter(Boolean);
  return list.map((word, i) => (
    <Fragment key={`${word}-${indexOffset + i}`}>
      <span className="split-word">
        <span
          className={accent.includes(word.replace(PUNCTUATION, '')) ? 'text-gilded' : undefined}
          style={{ '--i': indexOffset + i } as CSSProperties}
        >
          {word}
        </span>
      </span>
      {i < list.length - 1 ? ' ' : null}
    </Fragment>
  ));
}

/** Soft line breaks (`\n` in copy) become block rows so a desktop headline can sit on two lines. */
function lines(text: string, accent: string[]) {
  const parts = text.split('\n').map((part) => part.trim()).filter(Boolean);
  if (parts.length <= 1) return words(text.replace(/\n/g, ' ').trim(), accent);
  let offset = 0;
  return parts.map((part, line) => {
    const node = (
      <span key={`line-${line}`} className="block">
        {words(part, accent, offset)}
      </span>
    );
    offset += part.split(/\s+/).filter(Boolean).length;
    return node;
  });
}

/**
 * Words rise out of a mask. The text stays a single readable string for assistive tech and tests.
 * `now`: plays on load (above the fold), in CSS. `scroll`: plays when it enters the viewport.
 * `accent`: words (without punctuation) painted in gold.
 */
export function SplitText({
  text,
  as: Tag = 'span',
  mode = 'scroll',
  delayMs = 0,
  accent = [],
  className = '',
  id,
}: {
  text: string;
  as?: ElementType;
  mode?: 'now' | 'scroll';
  delayMs?: number;
  accent?: string[];
  className?: string;
  id?: string;
}) {
  if (mode === 'now') {
    return (
      <Tag id={id} className={`split-now ${className}`} style={{ '--split-delay': `${delayMs}ms` } as CSSProperties}>
        {lines(text, accent)}
      </Tag>
    );
  }
  return (
    <Reveal as={Tag} id={id} bare className={`split-scroll ${className}`}>
      {lines(text, accent)}
    </Reveal>
  );
}
