import {useEffect, useId, useRef, useState} from 'react';
import {useT} from '~/lib/i18n';

/** "Share this page": native share sheet where supported, plus classic links. */
export function ShareMenu() {
  const t = useT();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('Terribelle');
  const [canNative, setCanNative] = useState(false);
  const [status, setStatus] = useState('');
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanNative(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  useEffect(() => {
    if (!open) return;
    setUrl(window.location.href);
    setTitle(document.title);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [open]);

  const u = encodeURIComponent(url);
  const tt = encodeURIComponent(title);
  const links = [
    {name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`},
    {name: 'X', href: `https://x.com/intent/post?url=${u}&text=${tt}`},
    {name: 'Pinterest', href: `https://pinterest.com/pin/create/button/?url=${u}&description=${tt}`},
    {name: 'WhatsApp', href: `https://wa.me/?text=${tt}%20${u}`},
    {name: 'Email', href: `mailto:?subject=${tt}&body=${u}`},
  ];

  return (
    <div className="share" ref={wrap}>
      <button
        type="button"
        className="footer-link"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        onClick={() => setOpen((o) => !o)}
      >
        {t('footer.share')}
      </button>
      <div id={`${id}-menu`} className="share__menu" hidden={!open}>
        <ul>
          {canNative && (
            <li>
              <button
                type="button"
                className="footer-link"
                onClick={() => void navigator.share({title, url}).catch(() => {})}
              >
                {t('footer.shareTitle')}…
              </button>
            </li>
          )}
          {links.map((l) => (
            <li key={l.name}>
              <a className="footer-link" href={l.href} target="_blank" rel="noopener noreferrer">
                {l.name}
                <span className="sr-only"> {t('a11y.newTab')}</span>
              </a>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="footer-link"
              onClick={() => {
                void navigator.clipboard
                  ?.writeText(url)
                  .then(() => setStatus(t('footer.linkCopied')))
                  .catch(() => setStatus(url));
              }}
            >
              {t('footer.copyLink')}
            </button>
          </li>
        </ul>
        <p role="status" className="share__status">
          {status}
        </p>
      </div>
    </div>
  );
}
