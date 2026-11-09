import {useEffect, useRef, useState} from 'react';
import {Link, useLoaderData} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {Route} from './+types/($locale)._index';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {useLocalePath, useT} from '~/lib/i18n';
import {ProductCard} from '~/components/ProductCard';
import {Reveal} from '~/components/Reveal';
import {Marquee} from '~/components/Marquee';

export const meta: Route.MetaFunction = () => [
  {title: 'Terribelle — Couture from the archive'},
  {
    name: 'description',
    content:
      'Terribelle Couture: bridal gowns, veils and corsetry made with vintage techniques, in limited editions or to measure.',
  },
];

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  const data = await storefront.query(HOME_QUERY, {cache: storefront.CacheShort()});
  const featured = (data.feed?.featured?.references?.nodes ?? []).filter(
    (n): n is ProductCardFragment => 'handle' in n,
  );
  const all = data.products.nodes;
  return {featured: featured.length ? featured : all.slice(0, 3), all};
}

export default function Home() {
  const {featured, all} = useLoaderData<typeof loader>();
  const t = useT();
  const to = useLocalePath();

  return (
    <div className="home">
      <Hero featured={featured} />

      <Marquee text={t('home.marquee')} />

      <ProductIndex products={all} />

      <section className="section featured" aria-labelledby="featured-title">
        <Reveal className="section__head">
          <p className="eyebrow">
            <span className="dot" aria-hidden="true" />
            {t('home.eyebrow')}
          </p>
          <h2 id="featured-title" className="display-lg">
            {t('home.featuredTitle')}
          </h2>
        </Reveal>
        <ul className="featured__grid">
          {featured.map((product, i) => (
            <Reveal as="li" key={product.id} className={`featured__item featured__item--${i % 3}`} delay={i * 90}>
              <ProductCard product={product} index={i} transition={false} sizes="(min-width: 64em) 40vw, 90vw" />
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="section atelier" aria-labelledby="atelier-title">
        <Reveal className="atelier__text">
          <p className="eyebrow">{t('brand.tagline')}</p>
          <h2 id="atelier-title" className="display-lg">
            {t('home.atelierTitle')}
          </h2>
          <p className="lede">{t('home.atelierBody')}</p>
          <Link to={to('/products')} className="text-link text-link--arrow" viewTransition>
            {t('home.viewAll')}
          </Link>
        </Reveal>
        {featured[0]?.images.nodes[1] && (
          <Reveal className="atelier__media zoom" delay={150}>
            <Image data={featured[0].images.nodes[1]} alt="" sizes="(min-width: 64em) 40vw, 100vw" aspectRatio="4/5" loading="lazy" />
          </Reveal>
        )}
      </section>
    </div>
  );
}

function Hero({featured}: {featured: ProductCardFragment[]}) {
  const t = useT();
  const to = useLocalePath();
  const layer = useRef<HTMLDivElement>(null);

  // Gentle parallax on the floating images (skipped for reduced motion).
  useEffect(() => {
    const el = layer.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => el.style.setProperty('--scroll', String(window.scrollY)));
    };
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__text">
        <p className="eyebrow hero__eyebrow">
          <span className="dot" aria-hidden="true" />
          {t('home.eyebrow')}
        </p>
        <h1 id="hero-title" className="hero__title">
          {[t('home.heroLine1'), t('home.heroLine2'), t('home.heroLine3')].map((line, i) => (
            <span key={line} className="hero__line" style={{'--i': i} as React.CSSProperties}>
              <span>{line}</span>
            </span>
          ))}
        </h1>
        <div className="hero__intro">
          <p>{t('home.heroIntro')}</p>
          <Link to={to('/products')} className="text-link text-link--arrow" viewTransition>
            {t('home.discover')}
          </Link>
        </div>
      </div>
      <div className="hero__float" ref={layer} aria-hidden="true">
        {featured.slice(0, 3).map((p, i) =>
          p.images.nodes[0] ? (
            <div key={p.id} className={`hero__img hero__img--${i}`}>
              <Image data={p.images.nodes[0]} alt="" sizes="(min-width: 64em) 26vw, 45vw" aspectRatio="4/5" loading={i === 0 ? 'eager' : 'lazy'} />
            </div>
          ) : null,
        )}
      </div>
    </section>
  );
}

/** Editorial index: large titles; hovering a row reveals its image beside the cursor. */
function ProductIndex({products}: {products: ProductCardFragment[]}) {
  const t = useT();
  const to = useLocalePath();
  const [active, setActive] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse' || !preview.current) return;
    preview.current.style.setProperty('--x', `${e.clientX}px`);
    preview.current.style.setProperty('--y', `${e.clientY}px`);
  }

  return (
    <section className="section index" aria-labelledby="index-title" onPointerMove={onMove}>
      <Reveal className="section__head">
        <h2 id="index-title" className="display-lg">
          {t('home.indexTitle')}
        </h2>
        <p className="lede">{t('home.indexIntro')}</p>
      </Reveal>
      <ol className="index__list" onPointerLeave={() => setActive(null)}>
        {products.map((p, i) => (
          <li key={p.id}>
            <Link
              to={to(`/products/${p.handle}`)}
              className={`index__row${active === i ? ' is-active' : ''}`}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              prefetch="intent"
              viewTransition
            >
              <span className="index__no" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="index__title">{p.title}</span>
              <span className="index__type">{p.productType}</span>
              <span className="index__price">
                {p.bespoke?.value === 'true' ? t('product.bespoke') : <Money data={p.priceRange.minVariantPrice} as="span" withoutTrailingZeros />}
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <div className={`index__preview${active !== null ? ' is-visible' : ''}`} ref={preview} aria-hidden="true">
        {products.map((p, i) =>
          p.images.nodes[0] ? (
            <Image
              key={p.id}
              data={p.images.nodes[0]}
              alt=""
              sizes="22vw"
              aspectRatio="4/5"
              loading="lazy"
              className={active === i ? 'is-current' : ''}
            />
          ) : null,
        )}
      </div>
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
