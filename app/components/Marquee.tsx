import {useState} from 'react';
import {useT} from '~/lib/i18n';

/**
 * Scrolling text band. WCAG 2.2.2: moving content that lasts more than five
 * seconds needs a pause control; motion is also off for prefers-reduced-motion.
 */
export function Marquee({text}: {text: string}) {
  const t = useT();
  const [paused, setPaused] = useState(false);
  const items = Array.from({length: 4}, (_, i) => (
    <span key={i} className="marquee__item" aria-hidden={i > 0 ? true : undefined}>
      {text}
      <span className="marquee__dot" aria-hidden="true" />
    </span>
  ));
  return (
    <div className={`marquee${paused ? ' is-paused' : ''}`} data-theme="dark">
      <div className="marquee__track">
        {items}
        {items}
      </div>
      <button
        type="button"
        className="marquee__toggle"
        aria-pressed={paused}
        onClick={() => setPaused((p) => !p)}
      >
        <span className="sr-only">{paused ? t('a11y.playMotion') : t('a11y.pauseMotion')}</span>
        <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
          {paused ? (
            <path d="M4 2l10 6-10 6z" fill="currentColor" />
          ) : (
            <path d="M4 2h3v12H4zM9 2h3v12H9z" fill="currentColor" />
          )}
        </svg>
      </button>
    </div>
  );
}
