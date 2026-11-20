import {useEffect, useRef, useState} from 'react';
import {
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  Image,
  Money,
} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';
import {ProductForm} from '~/components/ProductForm';
import {useUI} from '~/components/UIProvider';
import {useLocale, useT} from '~/lib/i18n';
import {gloss} from '~/i18n/glossary';
import {RelatedRail, type Related} from './RelatedRail';

export type Composition = Array<{part?: string; fibres: Record<string, number>}>;
export type ProductData = {
  product: ProductFragment;
  composition: Composition;
  measurementFields: string[];
  related?: Related | null;
};

/**
 * Product layout shared by the full product page and the shopping overlay.
 * In the overlay the title is an h2 (the dialog provides the page context).
 */
export function ProductDetail({data, variant = 'page'}: {data: ProductData; variant?: 'page' | 'overlay'}) {
  const {product, composition, measurementFields} = data;
  const TitleTag = variant === 'overlay' ? 'h2' : 'h1';
  const t = useT();
  const {lang} = useLocale();
  const {openLegal, openContact} = useUI();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);
  const productOptions = getProductOptions({...product, selectedOrFirstAvailableVariant: selectedVariant});

  const bespoke = product.bespoke?.value === 'true';
  const care = (product.care?.value ?? '').split('\n').map((l) => l.trim()).filter(Boolean);

  return (
    <>
    <div className={`pdp pdp--${variant}`}>
      <Gallery product={product} />

      <section className="pdp__panel" aria-labelledby="product-title">
        <div className="pdp__sticky">
          {product.edition?.value && <p className="eyebrow">{product.edition.value}</p>}
          <TitleTag id="product-title" className="pdp__title">
            {product.title}
          </TitleTag>
          <p className="pdp__price">
            {selectedVariant?.price && <Money data={selectedVariant.price} as="span" withoutTrailingZeros />}
            {bespoke && <span className="tag tag--inline">{t('product.bespoke')}</span>}
          </p>

          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
            productTitle={product.title}
            bespoke={bespoke}
            measurementFields={measurementFields}
          />

          <div className="accordions">
            <details className="accordion" open>
              <summary>{t('product.description')}</summary>
              <div className="accordion__body rich" dangerouslySetInnerHTML={{__html: product.descriptionHtml}} />
              {(product.productionTime?.value || product.edition?.value) && (
                <dl className="facts">
                  {product.productionTime?.value && (
                    <div>
                      <dt>{t('product.production')}</dt>
                      <dd>{product.productionTime.value}</dd>
                    </div>
                  )}
                  {product.edition?.value && (
                    <div>
                      <dt>{t('product.edition')}</dt>
                      <dd>{product.edition.value}</dd>
                    </div>
                  )}
                </dl>
              )}
            </details>

            {composition.length > 0 && (
              <details className="accordion">
                <summary>{t('product.composition')}</summary>
                <div className="accordion__body">
                  <table className="composition">
                    <caption className="sr-only">{t('product.composition')}</caption>
                    <thead>
                      <tr>
                        <th scope="col">{t('product.part')}</th>
                        <th scope="col">{t('product.fibre')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {composition.map((row, i) => (
                        <tr key={i}>
                          <th scope="row">{row.part ? gloss(lang, row.part) : '—'}</th>
                          <td>
                            {Object.entries(row.fibres)
                              .map(([fibre, pct]) => `${pct}% ${gloss(lang, fibre)}`)
                              .join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            )}

            {care.length > 0 && (
              <details className="accordion">
                <summary>{t('product.care')}</summary>
                <ul className="accordion__body care">
                  {care.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </details>
            )}

            <details className="accordion" open={bespoke}>
              <summary>{t('product.returns')}</summary>
              <div className="accordion__body">
                <p className={bespoke ? 'notice' : undefined}>
                  {bespoke ? t('product.returnsBespoke') : t('product.returnsReady')}
                </p>
                <button type="button" className="text-link" aria-haspopup="dialog" onClick={() => openLegal('orders')}>
                  {t('product.orderPolicy')}
                </button>
              </div>
            </details>

            <details className="accordion">
              <summary>{t('product.shipping')}</summary>
              <div className="accordion__body">
                <p>{t('product.shippingBody')}</p>
              </div>
            </details>
          </div>

          <button
            type="button"
            className="text-link text-link--arrow pdp__enquire"
            aria-haspopup="dialog"
            onClick={() => openContact(`${t('product.enquire')}: ${product.title}`)}
          >
            {t('product.enquire')}
          </button>
        </div>
      </section>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
    <RelatedRail related={data.related ?? null} />
    </>
  );
}

function Gallery({product}: {product: ProductFragment}) {
  const t = useT();
  const images = product.images.nodes;
  const track = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);
  const total = images.length;

  // Keep the counter in sync with swipes / trackpad scrolling.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCurrent(Math.round(el.scrollLeft / el.clientWidth)));
    };
    el.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', onScroll);
    };
  }, []);

  function go(index: number) {
    const el = track.current;
    if (!el || !total) return;
    const i = (index + total) % total;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({left: i * el.clientWidth, behavior: reduce ? 'auto' : 'smooth'});
    setCurrent(i);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(current + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(current - 1);
    }
  }

  return (
    <div className="pdp__gallery">
      <section
        className="carousel"
        aria-roledescription="carousel"
        aria-label={t('product.images', {title: product.title})}
      >
        {/* Focusable so keyboard users can use the arrow keys (axe: scrollable-region-focusable). */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */}
        <ul className="carousel__track" ref={track} tabIndex={0} onKeyDown={onKeyDown} aria-label={t('product.images', {title: product.title})}>
          {images.map((img, i) => (
            <li
              key={img.id}
              className="carousel__slide grain"
              aria-roledescription="slide"
              aria-label={t('carousel.slide', {n: i + 1, total})}
              style={i === 0 ? {viewTransitionName: `media-${product.handle}`} : undefined}
            >
              <Image
                data={img}
                alt={img.altText ?? `${product.title} — ${t('product.imageN', {n: i + 1, total})}`}
                sizes="(min-width: 64em) 55vw, 100vw"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </li>
          ))}
        </ul>

        {total > 1 && (
          <div className="carousel__controls">
            <button type="button" className="carousel__btn" onClick={() => go(current - 1)} aria-label={t('carousel.prev')}>
              <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
            </button>
            <p className="carousel__count" aria-live="polite">
              <span className="sr-only">{t('carousel.slide', {n: current + 1, total})}</span>
              <span aria-hidden="true">
                {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
            </p>
            <button type="button" className="carousel__btn" onClick={() => go(current + 1)} aria-label={t('carousel.next')}>
              <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
            </button>
          </div>
        )}

        {total > 1 && (
          <ul className="carousel__thumbs">
            {images.map((img, i) => (
              <li key={img.id}>
                <button
                  type="button"
                  className="carousel__thumb"
                  aria-current={i === current ? 'true' : undefined}
                  aria-label={t('carousel.show', {n: i + 1})}
                  onClick={() => go(i)}
                >
                  <Image data={img} alt="" width={96} aspectRatio="4/5" loading="lazy" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
