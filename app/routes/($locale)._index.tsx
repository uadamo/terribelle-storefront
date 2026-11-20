import {Link, useLoaderData} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {Route} from './+types/($locale)._index';
import type {ProductCardFragment, VideoMediaFragment} from 'storefrontapi.generated';
import {PRODUCT_CARD_FRAGMENT, VIDEO_FRAGMENT} from '~/lib/fragments';
import {useLocalePath, useT} from '~/lib/i18n';
import {Reveal} from '~/components/Reveal';
import {AutoVideo} from '~/components/AutoVideo';
import {ProductLink} from '~/components/ProductLink';

export const meta: Route.MetaFunction = ({data}) => [
  {title: data?.campaign ? `${data.campaign.title} — Terribelle Couture` : 'Terribelle Couture — made to measure'},
  {
    name: 'description',
    content:
      'Terribelle Couture: bridal gowns, veils, corsetry and evening pieces made with vintage techniques — exclusive, limited and made to your measurements.',
  },
];

type Campaign = {
  presenter: string | null;
  title: string;
  credits: string[];
  ctaLabel: string | null;
  collection: {handle: string; title: string} | null;
  video: VideoMediaFragment | null;
  poster: {url: string; altText?: string | null; width?: number | null; height?: number | null} | null;
};

const isProduct = (n: unknown): n is ProductCardFragment => !!n && typeof n === 'object' && 'handle' in n && 'priceRange' in n;

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  const data = await storefront.query(HOME_QUERY, {cache: storefront.CacheShort()});
  const c = data.feed?.campaign?.reference;
  let campaign: Campaign | null = null;
  let collectionProducts: ProductCardFragment[] = [];
  if (c && 'title' in c) {
    let credits: string[] = [];
    try {
      credits = JSON.parse(c.credits?.value ?? '[]') as string[];
    } catch {
      credits = [];
    }
    const col = c.collection?.reference;
    const vid = c.video?.reference;
    const img = c.poster?.reference;
    campaign = {
      presenter: c.presenter?.value ?? null,
      title: c.title?.value ?? '',
      credits,
      ctaLabel: c.cta?.value ?? null,
      collection: col && 'handle' in col ? {handle: col.handle, title: col.title} : null,
      video: vid && 'sources' in vid ? vid : null,
      poster: img && 'image' in img && img.image ? img.image : null,
    };
    collectionProducts = col && 'products' in col ? col.products.nodes : [];
  }
  const featured = (data.feed?.featured?.references?.nodes ?? []).filter(isProduct);
  const all = data.products.nodes;
  const stories = (collectionProducts.length ? collectionProducts : featured.length ? featured : all).slice(0, 5);
  const bespoke = all.find((p) => p.bespoke?.value === 'true') ?? all[0] ?? null;
  return {campaign, stories, bespoke, fallbackImage: (stories[0] ?? all[0])?.images.nodes[0] ?? null};
}

export default function Home() {
  const {campaign, stories, bespoke, fallbackImage} = useLoaderData<typeof loader>();
  return (
    <div className="home">
      <Poster campaign={campaign} fallbackImage={fallbackImage} />
      <Magazine stories={stories} collectionTitle={campaign?.collection?.title ?? null} collectionHandle={campaign?.collection?.handle ?? null} />
      <MadeToMeasure product={bespoke} />
    </div>
  );
}

/** Opening screen composed like a film poster: credits, campaign video, title. */
function Poster({
  campaign,
  fallbackImage,
}: {
  campaign: Campaign | null;
  fallbackImage: {url: string; altText?: string | null; width?: number | null; height?: number | null} | null;
}) {
  const t = useT();
  const to = useLocalePath();
  const presenter = campaign?.presenter || t('hero.presents');
  const title = campaign?.title || campaign?.collection?.title || 'Terribelle';
  const href = campaign?.collection ? `${to('/products')}?collection=${campaign.collection.handle}` : to('/products');
  const still = campaign?.poster ?? fallbackImage;

  return (
    <section className="poster" aria-labelledby="poster-title" data-theme="dark">
      <div className="poster__media grain grain--still">
        {campaign?.video ? (
          <AutoVideo video={campaign.video} className="poster__video" maxHeight={1080} eager />
        ) : (
          still && <Image data={still} alt="" sizes="100vw" loading="eager" className="poster__img" />
        )}
      </div>

      <p className="poster__presents">{presenter}</p>

      <div className="poster__bottom">
        {campaign && campaign.credits.length > 0 && (
          <ul className="poster__credits">
            {campaign.credits.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        )}
        <h1 id="poster-title" className="poster__title">
          <span className="sr-only">{presenter} — </span>
          {title}
        </h1>
        <Link to={href} className="button poster__cta" viewTransition>
          {campaign?.ctaLabel || t('hero.explore')}
        </Link>
      </div>
    </section>
  );
}

const firstSentence = (text: string) => text.split(/(?<=[.!?])\s+/)[0] ?? '';

/** The collection presented like fashion-magazine spreads. */
function Magazine({
  stories,
  collectionTitle,
  collectionHandle,
}: {
  stories: ProductCardFragment[];
  collectionTitle: string | null;
  collectionHandle: string | null;
}) {
  const t = useT();
  const to = useLocalePath();
  if (!stories.length) return null;
  const [cover, left, right, feature, closing] = stories;

  return (
    <section className="mag" aria-labelledby="mag-title">
      <h2 id="mag-title" className="sr-only">
        {collectionTitle ?? t('home.eyebrow')}
      </h2>
      <Spread product={cover} n={1} layout="cover" />
      {(left || right) && (
        <div className="mag__pair">
          {left && <Spread product={left} n={2} layout="tall" />}
          {right && <Spread product={right} n={3} layout="offset" />}
        </div>
      )}
      {feature && <Spread product={feature} n={4} layout="feature" />}
      {closing && <Spread product={closing} n={5} layout="cover" />}
      <p className="mag__more">
        <Link
          to={collectionHandle ? `${to('/products')}?collection=${collectionHandle}` : to('/products')}
          className="button"
          viewTransition
        >
          {t('gazette.more')}
        </Link>
      </p>
    </section>
  );
}

function Spread({product, n, layout}: {product: ProductCardFragment; n: number; layout: 'cover' | 'tall' | 'offset' | 'feature'}) {
  const t = useT();
  const img = layout === 'feature' ? product.images.nodes[1] ?? product.images.nodes[0] : product.images.nodes[0];
  const bespoke = product.bespoke?.value === 'true';
  const kicker = [product.productType, bespoke ? t('product.bespoke') : null].filter(Boolean).join(' · ');

  return (
    <Reveal as="article" className={`spread spread--${layout}`} data-theme={layout === 'cover' ? 'dark' : undefined}>
      <ProductLink handle={product.handle} className="spread__media grain" tabIndex={-1} aria-hidden="true">
        {img && (
          <Image
            data={img}
            alt=""
            sizes={layout === 'cover' ? '100vw' : layout === 'offset' ? '(min-width: 48em) 34vw, 90vw' : '(min-width: 48em) 58vw, 100vw'}
            loading="lazy"
          />
        )}
      </ProductLink>
      <div className="spread__text">
        <p className="spread__no" aria-hidden="true">
          {String(n).padStart(2, '0')}
        </p>
        {kicker && <p className="spread__kicker">{kicker}</p>}
        <h3 className="spread__title">
          <ProductLink handle={product.handle}>{product.title}</ProductLink>
        </h3>
        <p className="spread__caption">{firstSentence(product.description)}</p>
        <p className="spread__meta">
          {bespoke ? t('product.bespoke') : <Money data={product.priceRange.minVariantPrice} as="span" withoutTrailingZeros />}
          {product.edition?.value ? <span> — {product.edition.value}</span> : null}
        </p>
      </div>
    </Reveal>
  );
}

function MadeToMeasure({product}: {product: ProductCardFragment | null}) {
  const t = useT();
  const to = useLocalePath();
  const img = product?.images.nodes[1] ?? product?.images.nodes[0];
  const steps = ['mtmSection.step1', 'mtmSection.step2', 'mtmSection.step3', 'mtmSection.step4'] as const;

  return (
    <section className="bespoke" aria-labelledby="bespoke-title">
      <p className="bespoke__side bespoke__side--left" aria-hidden="true">
        {t('mtmSection.side')}
      </p>
      <p className="bespoke__side bespoke__side--right" aria-hidden="true">
        {t('mtmSection.ghost')}
      </p>

      <Reveal className="bespoke__inner">
        <p className="label">{t('mtmSection.eyebrow')}</p>
        <h2 id="bespoke-title" className="bespoke__title">
          <span className="bespoke__title-sm">{t('mtmSection.titleSmall')}</span>
          <span className="bespoke__title-lg">{t('mtmSection.titleLarge')}</span>
        </h2>
        {img && (
          <div className="bespoke__img zoom grain">
            <Image data={img} alt="" sizes="(min-width: 48em) 18rem, 60vw" loading="lazy" aspectRatio="4/5" />
          </div>
        )}
        <p className="bespoke__body">{t('mtmSection.body')}</p>
        <ol className="bespoke__steps">
          {steps.map((key, i) => (
            <li key={key}>
              <span className="bespoke__n" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ol>
        <Link
          to={`${to('/products')}?collection=made-to-measure`}
          className="button"
          viewTransition
        >
          {t('mtmSection.cta')}
        </Link>
      </Reveal>
    </section>
  );
}

const HOME_QUERY = `#graphql
  query Home($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    feed: metaobject(handle: {type: "product_feed", handle: "main"}) {
      campaign: field(key: "campaign") {
        reference {
          ... on Metaobject {
            presenter: field(key: "presenter") { value }
            title: field(key: "title") { value }
            credits: field(key: "credits") { value }
            cta: field(key: "cta_label") { value }
            video: field(key: "video") {
              reference {
                ...VideoMedia
              }
            }
            poster: field(key: "poster") {
              reference {
                ... on MediaImage {
                  image { url altText width height }
                }
              }
            }
            collection: field(key: "collection") {
              reference {
                ... on Collection {
                  handle
                  title
                  products(first: 6) {
                    nodes {
                      ...ProductCard
                    }
                  }
                }
              }
            }
          }
        }
      }
      featured: field(key: "featured_products") {
        references(first: 6) {
          nodes {
            ...ProductCard
          }
        }
      }
    }
    products(first: 12, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...ProductCard
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
  ${VIDEO_FRAGMENT}
` as const;
