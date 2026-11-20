import {useEffect, useId, useRef, useState} from 'react';
import {Link, useLocation} from 'react-router';
import {useLocalePath, useT} from '~/lib/i18n';

export type NavCollection = {id: string; handle: string; title: string};

/**
 * "Products" disclosure menu listing the collections chosen in Shopify
 * (Content → Metaobjects → Product feed → Collections). Opens on click/tap,
 * closes on Esc, outside click or navigation.
 */
export function CollectionsMenu({collections}: {collections: NavCollection[]}) {
  const t = useT();
  const to = useLocalePath();
  const id = useId();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const active = new URLSearchParams(location.search).get('collection');
  const onProducts = location.pathname.replace(/^\/[a-z]{2}(?=\/)/, '').startsWith('/products');

  useEffect(() => setOpen(false), [location.pathname, location.search]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
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

  return (
    <div className="menu" ref={wrap}>
      <button
        ref={button}
        type="button"
        className={`nav-link${onProducts ? ' active' : ''}`}
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        onClick={() => setOpen((o) => !o)}
      >
        {t('nav.products')}
        <svg aria-hidden="true" viewBox="0 0 12 12" width="9" height="9" className="menu__chevron">
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </button>
      <div id={`${id}-menu`} className="menu__panel glass" hidden={!open}>
        <p className="menu__label">{t('nav.collections')}</p>
        <ul>
          {collections.map((c) => (
            <li key={c.id}>
              <Link
                to={`${to('/products')}?collection=${c.handle}`}
                className="menu__link"
                aria-current={active === c.handle ? 'page' : undefined}
                viewTransition
              >
                {c.title}
              </Link>
            </li>
          ))}
          <li>
            <Link to={to('/products')} className="menu__link menu__link--all" aria-current={onProducts && !active ? 'page' : undefined} viewTransition>
              {t('nav.allPieces')}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
