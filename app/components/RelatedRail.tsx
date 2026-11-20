import {useRef} from 'react';
import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {useLocalePath, useT} from '~/lib/i18n';
import {ProductLink} from './ProductLink';

export type Related = {handle: string; title: string; products: ProductCardFragment[]};

/**
 * "More from the collection": a vertical rail of large images, one at a time,
 * scrolled or swiped vertically (scroll-snap). Keyboard: focus the rail and use
 * the arrow keys, or the previous/next buttons.
 */
export function RelatedRail({related}: {related: Related | null}) {
  const t = useT();
  const to = useLocalePath();
  const rail = useRef<HTMLUListElement>(null);
  if (!related) return null;

  const step = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({top: dir * el.clientHeight, behavior: reduce ? 'auto' : 'smooth'});
  };

  return (
    <section className="related" aria-labelledby="related-title">
      <div className="related__head">
        <p className="spread__kicker">{t('related.kicker')}</p>
        <h2 id="related-title" className="related__title">
          {related.title}
        </h2>
        <Link to={`${to('/products')}?collection=${related.handle}`} className="text-link text-link--arrow" viewTransition>
          {t('related.view')}
        </Link>
        {related.products.length > 1 && (
          <div className="related__controls">
            <button type="button" className="carousel__btn" onClick={() => step(-1)} aria-label={t('related.prev')}>
              <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M5 15l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
            </button>
            <button type="button" className="carousel__btn" onClick={() => step(1)} aria-label={t('related.next')}>
              <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
            </button>
            <span className="related__hint" aria-hidden="true">
              {t('related.hint')}
            </span>
          </div>
        )}
      </div>

      {/* Scrollable region: focusable so keyboard users can scroll it (axe: scrollable-region-focusable). */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <ul className="related__rail" ref={rail} tabIndex={0} aria-label={related.title}>
        {related.products.map((p) => {
          const img = p.images.nodes[0];
          return (
            <li key={p.id} className="related__item">
              <ProductLink handle={p.handle} className="related__link">
                <span className="related__media grain">{img && <Image data={img} alt="" sizes="(min-width: 64em) 34rem, 92vw" loading="lazy" />}</span>
                <span className="related__caption">
                  <span className="related__name">{p.title}</span>
                  <span className="related__price">
                    {p.bespoke?.value === 'true' ? t('product.bespoke') : <Money data={p.priceRange.minVariantPrice} as="span" withoutTrailingZeros />}
                  </span>
                </span>
              </ProductLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
