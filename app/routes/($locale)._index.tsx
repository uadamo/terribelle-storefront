import {Link, useLoaderData} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {Route} from './+types/($locale)._index';
import type {ProductCardFragment, VideoMediaFragment} from 'storefrontapi.generated';
import {PRODUCT_CARD_FRAGMENT, VIDEO_FRAGMENT} from '~/lib/fragments';
import {useLocalePath, useT} from '~/lib/i18n';
import {Reveal} from '~/components/Reveal';
import {AutoVideo} from '~/components/AutoVideo';
import {ProductLink} from '~/components/ProductLink';
import {Logo} from '~/components/Logo';
import {NewsletterBanner} from '~/components/NewsletterBanner';
import {ParallaxImage} from '~/components/ParallaxImage';
import {FloatingPins} from '~/components/three/FloatingPins';
import {FloatingButtons} from '~/components/three/FloatingButtons';
import {FloatingBelladonna} from '~/components/three/FloatingBelladonna';

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
  // The campaign switched to "Featured" in Shopify wins (newest first); otherwise
  // Product feed → Featured campaign.
  const flagged = data.campaigns.nodes.find((m) => m.featured?.value === 'true');
  const c = flagged ?? data.feed?.campaign?.reference;
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
  const stories = (collectionProducts.length ? collectionProducts : featured.length ? featured : all).slice(0, 4);
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
      <NewsletterBanner />
    </div>
  );
}

const BRAND = /^\s*terribelle\s+couture\b/i;

/** Opening screen composed like a film poster: campaign video, logo "presents", title. */
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
  // "Terribelle Couture presents" → the brand is drawn with the real logo lockup.
  const brand = BRAND.test(presenter);
  const rest = presenter.replace(BRAND, '').trim();

  return (
    <section className="poster" aria-labelledby="poster-title" data-theme="dark">
      <div className="poster__media grain grain--still">
        {campaign?.video ? (
          <AutoVideo video={campaign.video} className="poster__video" maxHeight={1080} eager />
        ) : (
          still && <Image data={still} alt="" sizes="100vw" loading="eager" className="poster__img" />
        )}
      </div>

      <div className="poster__bottom">
        <p className="poster__presents">
          {brand ? (
            <>
              <Logo variant="lockup" className="poster__logo" title="Terribelle Couture" />
              {rest && <span className="poster__presents-word">{rest}</span>}
            </>
          ) : (
            presenter
          )}
        </p>
        <h1 id="poster-title" className="poster__title">
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
  const [first, second, third, fourth] = stories;

  return (
    <section className="mag" aria-labelledby="mag-title" data-belladonna>
      {/* The brand emblem drifting over the photographs (decorative). */}
      <FloatingBelladonna />
      <h2 id="mag-title" className="sr-only">
        {collectionTitle ? `${t('home.eyebrow')} — ${collectionTitle}` : t('home.eyebrow')}
      </h2>
      {(first || second) && (
        <div className="mag__pair">
          {first && <Spread product={first} n={1} layout="tall" />}
          {second && <Spread product={second} n={2} layout="offset" />}
        </div>
      )}
      {third && <Spread product={third} n={3} layout="feature" />}
      {fourth && <Spread product={fourth} n={4} layout="feature-reverse" />}
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

/** How far each image drifts inside its frame (percent; negative = against the scroll). */
const PARALLAX = {tall: 7, offset: -9, feature: 8, 'feature-reverse': -7} as const;

function Spread({product, n, layout}: {product: ProductCardFragment; n: number; layout: 'tall' | 'offset' | 'feature' | 'feature-reverse'}) {
  const t = useT();
  const img = layout.startsWith('feature') ? product.images.nodes[1] ?? product.images.nodes[0] : product.images.nodes[0];
  const bespoke = product.bespoke?.value === 'true';
  const kicker = [product.productType, bespoke ? t('product.bespoke') : null].filter(Boolean).join(' · ');

  return (
    <Reveal as="article" className={`spread spread--${layout}`}>
      <ProductLink handle={product.handle} className="spread__media grain" tabIndex={-1} aria-hidden="true">
        {img && (
          <ParallaxImage
            image={img}
            strength={PARALLAX[layout]}
            sizes={layout === 'offset' ? '(min-width: 48em) 34vw, 90vw' : '(min-width: 48em) 58vw, 100vw'}
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
    <section className="atelier-feature" aria-labelledby="bespoke-title">
      {/* Decorative: a few dressmaker's pins and buttons drift slowly over the section. */}
      <FloatingPins className="atelier-feature__pins" />
      <FloatingButtons className="atelier-feature__buttons" />

      <Reveal className="atelier-feature__head">
        <p className="spread__kicker">{t('mtmSection.eyebrow')}</p>
        <h2 id="bespoke-title" className="atelier-feature__title">
          <span className="atelier-feature__title-sm">{t('mtmSection.titleSmall')}</span>
          <span className="atelier-feature__title-lg">{t('mtmSection.titleLarge')}</span>
        </h2>
      </Reveal>

      {img && (
        <div className="atelier-feature__media grain">
          <ParallaxImage image={img} strength={9} sizes="(min-width: 48em) 46vw, 100vw" />
        </div>
      )}

      <Reveal className="atelier-feature__text">
        <p className="atelier-feature__lede">{t('mtmSection.body')}</p>
        <ol className="atelier-feature__steps">
          {steps.map((key, i) => (
            <li key={key}>
              <span className="atelier-feature__n" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ol>
        <Link to={`${to('/products')}?collection=made-to-measure`} className="button" viewTransition>
          {t('mtmSection.cta')}
        </Link>
      </Reveal>
    </section>
  );
}

const CAMPAIGN_FRAGMENT = `#graphql
  fragment CampaignFields on Metaobject {
    presenter: field(key: "presenter") { value }
    title: field(key: "title") { value }
    credits: field(key: "credits") { value }
    cta: field(key: "cta_label") { value }
    featured: field(key: "featured") { value }
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
          products(first: 4) {
            nodes {
              ...ProductCard
            }
          }
        }
      }
    }
  }
` as const;

const HOME_QUERY = `#graphql
  query Home($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    campaigns: metaobjects(type: "campaign", first: 20, sortKey: "updated_at", reverse: true) {
      nodes {
        ...CampaignFields
      }
    }
    feed: metaobject(handle: {type: "product_feed", handle: "main"}) {
      campaign: field(key: "campaign") {
        reference {
          ... on Metaobject {
            ...CampaignFields
          }
        }
      }
      featured: field(key: "featured_products") {
        references(first: 4) {
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
  ${CAMPAIGN_FRAGMENT}
  ${PRODUCT_CARD_FRAGMENT}
  ${VIDEO_FRAGMENT}
` as const;
