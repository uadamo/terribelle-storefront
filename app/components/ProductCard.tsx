import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {useLocalePath, useT} from '~/lib/i18n';

export function ProductCard({
  product,
  index,
  headingLevel = 3,
  loading = 'lazy',
  sizes = '(min-width: 64em) 33vw, 50vw',
  transition = true,
}: {
  product: ProductCardFragment;
  index?: number;
  headingLevel?: 2 | 3;
  loading?: 'eager' | 'lazy';
  sizes?: string;
  transition?: boolean;
}) {
  const t = useT();
  const to = useLocalePath();
  const [first, second] = product.images.nodes;
  const H = `h${headingLevel}` as 'h2' | 'h3';
  const bespoke = product.bespoke?.value === 'true';
  const {minVariantPrice: min, maxVariantPrice: max} = product.priceRange;
  const varies = min.amount !== max.amount;

  return (
    <Link
      to={to(`/products/${product.handle}`)}
      className="card"
      prefetch="intent"
      viewTransition
    >
      <div
        className="card__media"
        style={transition ? {viewTransitionName: `media-${product.handle}`} : undefined}
      >
        {first && (
          <Image
            data={first}
            alt=""
            aspectRatio="4/5"
            sizes={sizes}
            loading={loading}
            className="card__img"
          />
        )}
        {second && (
          <Image
            data={second}
            alt=""
            aspectRatio="4/5"
            sizes={sizes}
            loading="lazy"
            className="card__img card__img--alt"
          />
        )}
        {!product.availableForSale && <span className="tag tag--ink">{t('product.soldOut')}</span>}
        {bespoke && product.availableForSale && <span className="tag">{t('product.bespoke')}</span>}
      </div>
      <div className="card__caption">
        {index !== undefined && (
          <span className="card__no" aria-hidden="true">
            N° {String(index + 1).padStart(2, '0')}
          </span>
        )}
        <H className="card__title">{product.title}</H>
        <p className="card__meta">
          {varies ? (
            t('product.from', {price: '§'})
              .split('§')
              .map((part, i) => (i === 0 ? <span key={i}>{part}</span> : <span key={i}><Money data={min} as="span" withoutTrailingZeros />{part}</span>))
          ) : (
            <Money data={min} as="span" withoutTrailingZeros />
          )}
        </p>
      </div>
    </Link>
  );
}
