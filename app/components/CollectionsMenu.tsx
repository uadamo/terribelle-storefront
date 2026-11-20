import {useEffect, useState} from 'react';
import {createPortal} from 'react-dom';
import {Link, useLocation} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {useLocalePath, useT} from '~/lib/i18n';
import {usePageOverlay} from '~/lib/usePageOverlay';

type Img = {url: string; altText?: string | null; width?: number | null; height?: number | null};
export type NavCollection = {
  id: string;
  handle: string;
  title: string;
  image?: Img | null;
  tagline?: {value: string} | null;
  products: {nodes: Array<{featuredImage?: Img | null}>};
};

/**
 * "Products" opens a full-page menu (in the spirit of maison-alaia.com):
 * collection names set large on the left, the hovered collection's image on
 * the right. Collections and their order come from Shopify
 * (Content → Metaobjects → Product feed → Collections).
 */
export function CollectionsMenu({collections}: {collections: NavCollection[]}) {
  const t = useT();
  const to = useLocalePath();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = usePageOverlay(open, () => setOpen(false));
  const current = new URLSearchParams(location.search).get('collection');
  const onProducts = location.pathname.replace(/^\/[a-z]{2}(?=\/)/, '').startsWith('/products');

  useEffect(() => setOpen(false), [location.pathname, location.search]);

  // The panel is portalled to <body> so it stacks *below* the header (it's rendered from inside it).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const imageOf = (c: NavCollection) => c.image ?? c.products.nodes[0]?.featuredImage ?? null;

  return (
    <>
      <button
        type="button"
        className={`nav-link${onProducts ? ' active' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {t('nav.products')}
      </button>

{mounted &&
        createPortal(
      <dialog ref={ref} className="navlay" tabIndex={-1} aria-label={t('nav.collections')}>
        <div className="navlay__inner">
          <div className="navlay__top">
            <p className="navlay__label">{t('nav.collections')}</p>
            <button type="button" className="button navlay__close" onClick={() => setOpen(false)} data-autofocus>
              {t('a11y.close')}
            </button>
          </div>

          <nav className="navlay__list" aria-label={t('nav.collections')}>
            <ol>
              {collections.map((c, i) => (
                <li key={c.id} style={{'--i': i} as React.CSSProperties}>
                  <Link
                    to={`${to('/products')}?collection=${c.handle}`}
                    className="navlay__link"
                    aria-current={current === c.handle ? 'page' : undefined}
                    onPointerEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    viewTransition
                  >
                    <span className="navlay__no" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="navlay__name">{c.title}</span>
                    {c.tagline?.value && <span className="navlay__tagline">{c.tagline.value}</span>}
                  </Link>
                </li>
              ))}
            </ol>
            <Link
              to={to('/products')}
              className="navlay__all text-link text-link--arrow"
              aria-current={onProducts && !current ? 'page' : undefined}
              viewTransition
            >
              {t('nav.allPieces')}
            </Link>
          </nav>

          <div className="navlay__visual" aria-hidden="true">
            {collections.map((c, i) => {
              const img = imageOf(c);
              return img ? (
                <div key={c.id} className={`navlay__img grain${i === active ? ' is-active' : ''}`}>
                  <Image data={img} alt="" sizes="45vw" loading="lazy" />
                </div>
              ) : null;
            })}
          </div>
        </div>
      </dialog>,
          document.body,
        )}
    </>
  );
}
