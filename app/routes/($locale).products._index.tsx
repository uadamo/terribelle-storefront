import {useEffect, useRef} from 'react';
import {Link, useLoaderData, useNavigate, useSearchParams} from 'react-router';
import {getPaginationVariables, Pagination} from '@shopify/hydrogen';
import type {Route} from './+types/($locale).products._index';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {useLocalePath, useT} from '~/lib/i18n';
import {ProductCard} from '~/components/ProductCard';
import {Reveal} from '~/components/Reveal';
import {useUI} from '~/components/UIProvider';

/**
 * Product feed. Content comes from the `product_feed` metaobject (handle "main"):
 *   header, description, featured_products[], collections[]
 * Collections are regular Shopify collections; only those published to the
 * Hydrogen channel ("status" = active) are returned by the Storefront API.
 * Filter with ?collection=<handle>.
 */
export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.collection?.title ?? data?.header ?? 'Products'} — Terribelle`},
  {name: 'description', content: data?.collection?.description ?? data?.description ?? ''},
];

const PAGE_SIZE = 12;
/** Pages loaded automatically while scrolling; after that a button is used, so the footer stays reachable. */
const AUTO_PAGES = 3;

export async function loader({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const url = new URL(request.url);
  const handle = url.searchParams.get('collection');
  const pagination = getPaginationVariables(request, {pageBy: PAGE_SIZE});

  const [{feed}, listing] = await Promise.all([
    storefront.query(FEED_QUERY, {cache: storefront.CacheShort()}),
    handle
      ? storefront
          .query(COLLECTION_PRODUCTS_QUERY, {variables: {handle, ...pagination}})
          .then((r) => {
            if (!r.collection) throw new Response(null, {status: 404});
            const {products, ...collection} = r.collection;
            return {collection, products};
          })
      : storefront
          .query(ALL_PRODUCTS_QUERY, {variables: pagination})
          .then((r) => ({collection: null, products: r.products})),
  ]);

  const collections = (feed?.collections?.references?.nodes ?? []).filter(
    (n): n is {__typename: 'Collection'; id: string; handle: string; title: string; description: string} =>
      'handle' in n,
  );
  const {collection, products} = listing;

  return {
    header: feed?.header?.value ?? 'Products',
    description: feed?.description?.value ?? '',
    collections,
    collection,
    products,
  };
}

export default function ProductFeed() {
  const {header, description, collections, collection, products} = useLoaderData<typeof loader>();
  const t = useT();
  const to = useLocalePath();
  const [params] = useSearchParams();
  const active = params.get('collection');

  return (
    <div className="feed">
      <header className="feed__head">
        <p className="eyebrow">
          <span className="dot" aria-hidden="true" />
          {t('feed.title')}
        </p>
        <h1 className="display-xl feed__title">{collection?.title ?? header}</h1>
        <p className="lede feed__intro">{collection?.description || description}</p>

        {collections.length > 0 && (
          <nav aria-label={t('feed.filterLabel')}>
            <ul className="filters">
              <li>
                <Link
                  to={to('/products')}
                  className="filter"
                  aria-current={!active ? 'page' : undefined}
                  preventScrollReset
                  viewTransition
                >
                  {t('feed.all')}
                </Link>
              </li>
              {collections.map((c) => (
                <li key={c.id}>
                  <Link
                    to={`${to('/products')}?collection=${c.handle}`}
                    className="filter"
                    aria-current={active === c.handle ? 'page' : undefined}
                    preventScrollReset
                    viewTransition
                  >
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <Pagination connection={products}>
        {({nodes, isLoading, PreviousLink, NextLink, hasNextPage, nextPageUrl, state}) => (
          <>
            <PreviousLink className="button button--ghost feed__more">{t('feed.loadPrevious')}</PreviousLink>
            {nodes.length === 0 ? (
              <p className="feed__empty">{t('feed.empty')}</p>
            ) : (
              <ul className="feed__grid">
                {(nodes as ProductCardFragment[]).map((product, i) => (
                  <Reveal as="li" key={product.id} className="feed__item" delay={(i % 3) * 80}>
                    <ProductCard product={product} index={i} loading={i < 3 ? 'eager' : 'lazy'} headingLevel={2} />
                  </Reveal>
                ))}
              </ul>
            )}
            <InfiniteLoader
              hasNextPage={hasNextPage}
              isLoading={isLoading}
              nextPageUrl={nextPageUrl}
              state={state}
              count={nodes.length}
            />
            {hasNextPage ? (
              <NextLink className="button button--ghost feed__more">
                {isLoading ? t('a11y.loading') + '…' : t('feed.loadMore')}
              </NextLink>
            ) : (
              nodes.length > 0 && <p className="feed__end">{t('feed.end')}</p>
            )}
          </>
        )}
      </Pagination>
    </div>
  );
}

function InfiniteLoader({
  hasNextPage,
  isLoading,
  nextPageUrl,
  state,
  count,
}: {
  hasNextPage: boolean;
  isLoading: boolean;
  nextPageUrl: string;
  state: unknown;
  count: number;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const {announce} = useUI();
  const t = useT();
  const previous = useRef(count);

  // Announce newly loaded items to screen-reader users.
  useEffect(() => {
    if (count > previous.current) announce(t('feed.count', {count}));
    previous.current = count;
  }, [count, announce, t]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage || isLoading || count >= PAGE_SIZE * AUTO_PAGES) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void navigate(nextPageUrl, {replace: true, preventScrollReset: true, state});
        }
      },
      {rootMargin: '0px 0px 60% 0px'},
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isLoading, nextPageUrl, state, navigate, count]);

  return <div ref={sentinel} className="feed__sentinel" aria-hidden="true" />;
}

const FEED_QUERY = `#graphql
  query ProductFeed($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    feed: metaobject(handle: {type: "product_feed", handle: "main"}) {
      header: field(key: "header") { value }
      description: field(key: "description") { value }
      collections: field(key: "collections") {
        references(first: 20) {
          nodes {
            ... on Collection { __typename id handle title description }
          }
        }
      }
    }
  }
` as const;

const ALL_PRODUCTS_QUERY = `#graphql
  query FeedAllProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor, sortKey: CREATED_AT, reverse: true) {
      nodes { ...ProductCard }
      pageInfo { hasPreviousPage hasNextPage startCursor endCursor }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;

const COLLECTION_PRODUCTS_QUERY = `#graphql
  query FeedCollectionProducts(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      handle
      title
      description
      products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
        nodes { ...ProductCard }
        pageInfo { hasPreviousPage hasNextPage startCursor endCursor }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
