import {useEffect, useId, useRef, useState} from 'react';
import {useFetcher} from 'react-router';
import {useLocalePath, useT} from '~/lib/i18n';
import {useUI} from './UIProvider';

const DISMISS_KEY = 'tb_newsletter_dismissed';

/**
 * Frosted "Subscribe to our newsletter" card, bottom right. Appears once the
 * visitor has scrolled past half of the page, hides while the footer is on
 * screen (so it never covers footer links — WCAG 2.4.11), and stays dismissed.
 * It never takes focus by itself.
 */
export function NewsletterBanner() {
  const t = useT();
  const to = useLocalePath();
  const id = useId();
  const {openLegal} = useUI();
  const fetcher = useFetcher<{ok: boolean; error?: string}>();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const footerInView = useRef(false);
  const pastHalf = useRef(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const update = () => setVisible(pastHalf.current && !footerInView.current);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      pastHalf.current = max > 0 && window.scrollY / max >= 0.5;
      update();
    };
    const footer = document.querySelector('.site-footer');
    const io = footer
      ? new IntersectionObserver(([e]) => {
          footerInView.current = e.isIntersecting;
          update();
        })
      : null;
    if (footer) io?.observe(footer);
    window.addEventListener('scroll', onScroll, {passive: true});
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      io?.disconnect();
    };
  }, [dismissed]);

  function dismiss() {
    setDismissed(true);
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* private mode */
    }
  }

  if (dismissed) return null;
  const done = fetcher.data?.ok;
  const error = fetcher.data && !fetcher.data.ok ? fetcher.data.error : null;

  return (
    <aside className={`newsletter glass${visible ? ' is-visible' : ''}`} aria-labelledby={`${id}-title`} hidden={!visible}>
      <button type="button" className="newsletter__close" onClick={dismiss} aria-label={t('newsletter.dismiss')}>
        <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <h2 id={`${id}-title`} className="newsletter__title">
        {t('newsletter.title')}
      </h2>
      {done ? (
        <p className="newsletter__done" role="status">
          {t('newsletter.thanks')}
        </p>
      ) : (
        <fetcher.Form method="post" action={to('/newsletter')} className="newsletter__form" noValidate>
          <p className="newsletter__text" id={`${id}-desc`}>
            {t('newsletter.text')}
          </p>
          <div className="newsletter__row">
            <label htmlFor={`${id}-email`} className="sr-only">
              {t('contact.email')}
            </label>
            <input
              id={`${id}-email`}
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder={t('newsletter.placeholder')}
              aria-describedby={`${id}-desc${error ? ` ${id}-err` : ''}`}
              aria-invalid={error ? true : undefined}
            />
            {/* Honeypot: hidden from people and assistive tech. */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" className="newsletter__hp" aria-hidden="true" />
            <button type="submit" className="button" disabled={fetcher.state !== 'idle'}>
              {t('newsletter.submit')}
            </button>
          </div>
          {error && (
            <p id={`${id}-err`} className="field__error" role="alert">
              {error === 'invalid' ? t('newsletter.invalid') : t('newsletter.failed')}
            </p>
          )}
          <p className="newsletter__fine">
            {t('newsletter.consent')}{' '}
            <button type="button" className="text-button" aria-haspopup="dialog" onClick={() => openLegal('privacy')}>
              {t('footer.privacy')}
            </button>
          </p>
        </fetcher.Form>
      )}
    </aside>
  );
}
