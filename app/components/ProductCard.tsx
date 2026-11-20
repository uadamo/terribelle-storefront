import {Image, Money} from '@shopify/hydrogen';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {useT} from '~/lib/i18n';
import {ProductLink} from './ProductLink';

export function ProductCard({
  product,
  index,
  headingLevel = 3,
  loading = 'lazy',
  sizes = '(min-width: 64em) 25vw, (min-width: 40em) 33vw, 50vw',
  transition = true,
  variant = 'default',
}: {
  product: ProductCardFragment;
  index?: number;
  headingLevel?: 2 | 3;
  loading?: 'eager' | 'lazy';
  sizes?: string;
  transition?: boolean;
  variant?: 'default' | 'grid';
}) {
  const t = useT();
  const [first, second] = product.images.nodes;
  const H = `h${headingLevel}` as 'h2' | 'h3';
  const bespoke = product.bespoke?.value === 'true';
  const {minVariantPrice: min, maxVariantPrice: max} = product.priceRange;
  const varies = min.amount !== max.amount;
  const caption = product.description.split(/(?<=[.!?])\s/)[0];

  return (
    <ProductLink handle={product.handle} className={`card card--${variant}`}>
      <div
        className="card__media grain"
        style={transition ? {viewTransitionName: `media-${product.handle}`} : undefined}
      >
        {first && (
          <Image data={first} alt="" aspectRatio="4/5" sizes={sizes} loading={loading} className="card__img" />
        )}
        {second && (
          <Image data={second} alt="" aspectRatio="4/5" sizes={sizes} loading="lazy" className="card__img card__img--alt" />
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
        {variant === 'grid' && caption && <p className="card__text">{caption}</p>}
        <p className="card__meta">
          {varies ? (
            <>
              {t('product.from', {price: ''}).trim()} <Money data={min} as="span" withoutTrailingZeros />
            </>
          ) : (
            <Money data={min} as="span" withoutTrailingZeros />
          )}
        </p>
      </div>
    </ProductLink>
  );
}
