import {Fragment, useEffect, useMemo, useRef, useState} from 'react';
import {Form, Link, useLoaderData, useNavigation, useSearchParams} from 'react-router';
import type {Route} from './+types/($locale).products._index';
import type {ProductCardFragment, VideoMediaFragment} from 'storefrontapi.generated';
import {PRODUCT_CARD_FRAGMENT, VIDEO_FRAGMENT} from '~/lib/fragments';
import {useLocalePath, useT} from '~/lib/i18n';
import {ProductCard} from '~/components/ProductCard';
import {Reveal} from '~/components/Reveal';
import {AutoVideo} from '~/components/AutoVideo';

/**
 * Products page.
 *   /products                       all pieces
 *   /products?collection=<handle>   one collection, with its promotional videos
 *                                   (collection metafield custom.promo_videos)
 * Filters (bottom drawer) are URL params: type, fit=bespoke|ready, color, available=1.
 * Collections are small and limited, so up to 250 pieces load at once and
 * render progressively while scrolling.
 */
export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.collection?.title ?? 'Products'} — Terribelle`},
  {name: 'description', content: data?.collection?.description ?? ''},
];

const COLOR_OPTION = /^(colou?r|couleur)$/i;
const BATCH = 12;

type Facets = {types: string[]; colors: string[]; hasBespoke: boolean; hasReady: boolean};

export async function loader({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const url = new URL(request.url);
  const handle = url.searchParams.get('collection');

  let collection: {handle: string; title: string; description: string; tagline: string | null} | null = null;
  let videos: VideoMediaFragment[] = [];
  let products: ProductCardFragment[];

  if (handle) {
    const {collection: c} = await storefront.query(COLLECTION_QUERY, {variables: {handle}, cache: storefront.CacheShort()});
    if (!c) throw new Response(null, {status: 404});
    collection = {handle: c.handle, title: c.title, description: c.description, tagline: c.tagline?.value ?? null};
    videos = (c.videos?.references?.nodes ?? []).filter((n): n is VideoMediaFragment => 'sources' in n);
    products = c.products.nodes;
  } else {
    const {products: p} = await storefront.query(ALL_QUERY, {cache: storefront.CacheShort()});
    products = p.nodes;
  }

  // Facets from what's actually in this listing.
  const facets: Facets = {
    types: [...new Set(products.map((p) => p.productType).filter(Boolean))].sort(),
    colors: [...new Set(products.flatMap((p) => p.options.filter((o) => COLOR_OPTION.test(o.name)).flatMap((o) => o.optionValues.map((v) => v.name))))].sort(),
    hasBespoke: products.some((p) => p.bespoke?.value === 'true'),
    hasReady: products.some((p) => p.bespoke?.value !== 'true'),
  };

  const types = url.searchParams.getAll('type');
  const colors = url.searchParams.getAll('color');
  const fit = url.searchParams.get('fit');
  const available = url.searchParams.get('available') === '1';
  const filtered = products.filter((p) => {
    if (types.length && !types.includes(p.productType)) return false;
    if (fit === 'bespoke' && p.bespoke?.value !== 'true') return false;
    if (fit === 'ready' && p.bespoke?.value === 'true') return false;
    if (available && !p.availableForSale) return false;
    if (colors.length) {
      const own = p.options.filter((o) => COLOR_OPTION.test(o.name)).flatMap((o) => o.optionValues.map((v) => v.name));
      if (!colors.some((c) => own.includes(c))) return false;
    }
    return true;
  });

  return {collection, videos, products: filtered, total: products.length, facets};
}

/** Columns used to split products into rows (videos sit between rows). */
function useColumns() {
  const [cols, setCols] = useState(4);
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 64em)'); // laptops and up: 4 per row
    const mid = window.matchMedia('(min-width: 40em)'); // tablets: 3 per row
    const update = () => setCols(wide.matches ? 4 : mid.matches ? 3 : 2); // phones: 2 per row
    update();
    wide.addEventListener('change', update);
    mid.addEventListener('change', update);
    return () => {
      wide.removeEventListener('change', update);
      mid.removeEventListener('change', update);
    };
  }, []);
  return cols;
}

export default function Products() {
  const {collection, videos, products, total, facets} = useLoaderData<typeof loader>();
  const t = useT();
  const cols = useColumns();
  const [shown, setShown] = useState(BATCH);
  const sentinel = useRef<HTMLDivElement>(null);
  const [params] = useSearchParams();

  // Reset progressive rendering when the listing changes.
  const key = params.toString();
  useEffect(() => setShown(BATCH), [key]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || shown >= products.length) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShown((s) => s + BATCH), {rootMargin: '0px 0px 80% 0px'});
    io.observe(el);
    return () => io.disconnect();
  }, [shown, products.length]);

  const rows = useMemo(() => {
    const visible = products.slice(0, shown);
    const out: ProductCardFragment[][] = [];
    for (let i = 0; i < visible.length; i += cols) out.push(visible.slice(i, i + cols));
    return out;
  }, [products, shown, cols]);

  return (
    <div className="shop">
      <header className="shop__head">
        <h1 className="shop__title">{collection?.title ?? t('nav.allPieces')}</h1>
        {collection?.tagline && <p className="shop__tagline">{collection.tagline}</p>}
      </header>

      {products.length === 0 ? (
        <p className="feed__empty">{total ? t('filter.none') : t('feed.empty')}</p>
      ) : (
        <div className="shop__rows">
          {rows.map((row, r) => (
            <Fragment key={row[0].id}>
              <ul className="shop__row" style={{'--cols': cols} as React.CSSProperties}>
                {row.map((product, i) => (
                  <Reveal as="li" key={product.id} className="shop__item" delay={i * 70}>
                    <ProductCard product={product} variant="grid" headingLevel={2} loading={r === 0 ? 'eager' : 'lazy'} />
                  </Reveal>
                ))}
              </ul>
              {/* One promotional video after each row, while videos last (the last row
                  gets one too once every piece has rendered). */}
              {videos[r] && (r < rows.length - 1 || shown >= products.length) && (
                <div className="shop__strip">
                  <AutoVideo video={videos[r]} className="shop__video grain grain--still" />
                </div>
              )}
            </Fragment>
          ))}
          <div ref={sentinel} aria-hidden="true" />
          {shown >= products.length && <p className="feed__end">{t('feed.end')}</p>}
        </div>
      )}

      <FilterBar facets={facets} count={products.length} />
    </div>
  );
}

function FilterBar({facets, count}: {facets: Facets; count: number}) {
  const t = useT();
  const to = useLocalePath();
  const [params] = useSearchParams();
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  const collection = params.get('collection');
  const active = params.getAll('type').length + params.getAll('color').length + (params.get('fit') ? 1 : 0) + (params.get('available') ? 1 : 0);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  // Close once the filtered results have loaded.
  useEffect(() => {
    if (navigation.state === 'idle') setOpen(false);
  }, [params.toString()]); // eslint-disable-line react-hooks/exhaustive-deps

  const groups = [
    facets.types.length > 1 && {name: 'type', label: t('filter.category'), multi: true, values: facets.types.map((v) => [v, v])},
    facets.hasBespoke && facets.hasReady && {name: 'fit', label: t('filter.fit'), multi: false, values: [['bespoke', t('filter.fitBespoke')], ['ready', t('filter.fitReady')]]},
    facets.colors.length > 1 && {name: 'color', label: t('filter.color'), multi: true, values: facets.colors.map((v) => [v, v])},
  ].filter(Boolean) as Array<{name: string; label: string; multi: boolean; values: string[][]}>;

  return (
    <>
      <div className="filterbar glass">
        <button type="button" className="filterbar__button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
          <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16">
            <path d="M3 5h14M6 10h8M9 15h2" stroke="currentColor" strokeWidth="1.4" fill="none" />
          </svg>
          {t('filter.button')}
          {active > 0 && <span className="filterbar__count">{active}</span>}
        </button>
        <span className="filterbar__results" aria-live="polite">
          {t('feed.count', {count})}
        </span>
      </div>

      {/* Backdrop click closes; Esc and the close button are the keyboard equivalents. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={ref}
        className="drawer"
        aria-labelledby="filter-title"
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === ref.current && setOpen(false)}
      >
        <Form method="get" className="drawer__panel" preventScrollReset onSubmit={() => setOpen(false)}>
          <div className="drawer__head">
            <h2 id="filter-title" className="drawer__title">
              {t('filter.title')}
            </h2>
            <button type="button" className="icon-button glass" onClick={() => setOpen(false)} aria-label={t('a11y.close')}>
              <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
                <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
          {collection && <input type="hidden" name="collection" value={collection} />}
          <div className="drawer__body">
            {groups.map((g) => (
              <fieldset key={g.name} className="drawer__group">
                <legend className="option__label">{g.label}</legend>
                <div className="option__values">
                  {g.values.map(([value, label]) => {
                    const checked = g.multi ? params.getAll(g.name).includes(value) : params.get(g.name) === value;
                    return (
                      <label key={value} className={`choice glass-chip${checked ? ' is-selected' : ''}`}>
                        <input type={g.multi ? 'checkbox' : 'radio'} name={g.name} value={value} defaultChecked={checked} />
                        <span className="choice__text">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            <fieldset className="drawer__group">
              <legend className="option__label">{t('filter.availability')}</legend>
              <label className="field field--check">
                <input type="checkbox" name="available" value="1" defaultChecked={params.get('available') === '1'} />
                <span>{t('filter.inStock')}</span>
              </label>
            </fieldset>
          </div>
          <div className="drawer__foot">
            <Link
              to={collection ? `${to('/products')}?collection=${collection}` : to('/products')}
              className="text-button"
              preventScrollReset
              onClick={() => setOpen(false)}
            >
              {t('filter.clear')}
            </Link>
            <button type="submit" className="button glass">
              {t('filter.apply')}
            </button>
          </div>
        </Form>
      </dialog>
    </>
  );
}

const COLLECTION_QUERY = `#graphql
  query ShopCollection($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      handle
      title
      description
      tagline: metafield(namespace: "custom", key: "tagline") { value }
      videos: metafield(namespace: "custom", key: "promo_videos") {
        references(first: 20) {
          nodes {
            ...VideoMedia
          }
        }
      }
      products(first: 250) {
        nodes { ...ProductCard }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
  ${VIDEO_FRAGMENT}
` as const;

const ALL_QUERY = `#graphql
  query ShopAll($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 250, sortKey: CREATED_AT, reverse: true) {
      nodes { ...ProductCard }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
