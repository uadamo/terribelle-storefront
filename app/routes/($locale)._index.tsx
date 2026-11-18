import {Link, useLoaderData} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {Route} from './+types/($locale)._index';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {useLocalePath, useT} from '~/lib/i18n';
import {Logo} from '~/components/Logo';
import {Reveal} from '~/components/Reveal';

export const meta: Route.MetaFunction = () => [
  {title: 'Terribelle Couture — made to measure'},
  {
    name: 'description',
    content:
      'Terribelle Couture: bridal gowns, veils and corsetry made with vintage techniques — exclusive, limited and made to your measurements.',
  },
];

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  const data = await storefront.query(HOME_QUERY, {cache: storefront.CacheShort()});
  const featured = (data.feed?.featured?.references?.nodes ?? []).filter(
    (n): n is ProductCardFragment => 'handle' in n,
  );
  const all = data.products.nodes;
  const bespoke = all.find((p) => p.bespoke?.value === 'true') ?? all[0] ?? null;
  return {featured: featured.length ? featured : all.slice(0, 3), bespoke};
}

export default function Home() {
  const {featured, bespoke} = useLoaderData<typeof loader>();
  return (
    <div className="home">
      <Hero featured={featured} />
      <Featured products={featured} />
      <MadeToMeasure product={bespoke} />
    </div>
  );
}

function Hero({featured}: {featured: ProductCardFragment[]}) {
  const t = useT();
  const to = useLocalePath();
  const images = featured.map((p) => p.images.nodes[0]).filter(Boolean).slice(0, 2);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__media" aria-hidden="true">
        {images.map((img, i) => (
          <div key={img.id} className={`hero__img hero__img--${i}`}>
            <Image data={img} alt="" sizes="50vw" loading="eager" />
          </div>
        ))}
      </div>
      <p className="hero__note hero__note--left">
        {t('home.heroNote1')}
        <br />
        {t('home.heroNote2')}
      </p>
      <p className="hero__note hero__note--right">{t('home.eyebrow')}</p>
      <h1 id="hero-title" className="hero__logo">
        <Logo variant="lockup" title="Terribelle Couture" />
      </h1>
      <Link to={to('/products')} className="hero__cta text-link text-link--arrow" viewTransition>
        {t('home.discover')}
      </Link>
    </section>
  );
}

/** Editorial, numbered layout with a vertical type column (featured pieces). */
function Featured({products}: {products: ProductCardFragment[]}) {
  const t = useT();
  const to = useLocalePath();
  return (
    <section className="editorial" aria-labelledby="featured-title">
      <Reveal className="editorial__lead">
        <h2 id="featured-title" className="label">
          {t('home.featuredTitle')}
        </h2>
        <p className="editorial__lede">{t('home.featuredLede')}</p>
        <Link to={to('/products')} className="text-link text-link--arrow" viewTransition>
          {t('home.viewAll')}
        </Link>
      </Reveal>

      <p className="editorial__vertical" aria-hidden="true">
        {Array.from({length: 4}, (_, i) => (
          <span key={i}>{t('home.eyebrow')}</span>
        ))}
      </p>

      <ol className="editorial__items">
        {products.slice(0, 3).map((p, i) => {
          const img = p.images.nodes[0];
          return (
            <Reveal as="li" key={p.id} className={`editorial__item editorial__item--${i}`} delay={i * 90}>
              <Link to={to(`/products/${p.handle}`)} className="plate" prefetch="intent" viewTransition>
                <div className="plate__media zoom">
                  {img && <Image data={img} alt="" sizes="(min-width: 48em) 34vw, 80vw" loading="lazy" aspectRatio="4/5" />}
                  <span className="plate__no" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <span className="plate__caption">
                  <span className="plate__title">{p.title}</span>
                  <span className="plate__meta">
                    {p.bespoke?.value === 'true' ? (
                      t('product.bespoke')
                    ) : (
                      <Money data={p.priceRange.minVariantPrice} as="span" withoutTrailingZeros />
                    )}
                  </span>
                </span>
              </Link>
            </Reveal>
          );
        })}
      </ol>
    </section>
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
          <div className="bespoke__img zoom">
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
` as const;
