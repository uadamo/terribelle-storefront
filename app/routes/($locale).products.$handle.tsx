import {useEffect, useRef, useState} from 'react';
import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).products.$handle';
import {
  getSelectedProductOptions,
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
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {useT} from '~/lib/i18n';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.product.seo.title ?? data?.product.title ?? ''} — Terribelle`},
  {name: 'description', content: data?.product.seo.description ?? data?.product.description?.slice(0, 160) ?? ''},
  {rel: 'canonical', href: `/products/${data?.product.handle}`},
];

type Composition = Array<{part?: string; fibres: Record<string, number>}>;

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  if (!handle) throw new Error('Expected product handle to be defined');

  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions: getSelectedProductOptions(request)},
  });
  if (!product?.id) throw new Response(null, {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: product});

  let composition: Composition = [];
  try {
    const parsed: unknown = JSON.parse(product.composition?.value ?? '[]');
    // Accept both [{part, fibres}] and the simpler [{Silk: 100}] shape.
    composition = (Array.isArray(parsed) ? (parsed as Array<Record<string, unknown>>) : []).map((p) =>
      'fibres' in p ? (p as Composition[number]) : {fibres: p as Record<string, number>},
    );
  } catch {
    composition = [];
  }
  let measurementFields: string[] = [];
  try {
    measurementFields = JSON.parse(product.measurementFields?.value ?? '[]') as string[];
  } catch {
    measurementFields = [];
  }

  return {product, composition, measurementFields};
}

export default function Product() {
  const {product, composition, measurementFields} = useLoaderData<typeof loader>();
  const t = useT();
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
    <div className="pdp">
      <Gallery product={product} />

      <section className="pdp__panel" aria-labelledby="product-title">
        <div className="pdp__sticky">
          {product.edition?.value && <p className="eyebrow">{product.edition.value}</p>}
          <h1 id="product-title" className="pdp__title">
            {product.title}
          </h1>
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
                          <th scope="row">{row.part ?? '—'}</th>
                          <td>
                            {Object.entries(row.fibres)
                              .map(([fibre, pct]) => `${pct}% ${fibre}`)
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
  );
}

function Gallery({product}: {product: ProductFragment}) {
  const t = useT();
  const images = product.images.nodes;
  const track = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);

  // Track which image is visible in the mobile carousel.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.index));
        }
      },
      {root: el, threshold: 0.6},
    );
    el.querySelectorAll('li').forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [images.length]);

  return (
    <div className="pdp__gallery">
      {/* Scrollable region: focusable so keyboard users can scroll it on mobile (axe: scrollable-region-focusable). */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <ul className="gallery" ref={track} tabIndex={0} aria-label={t('product.images', {title: product.title})}>
        {images.map((img, i) => (
          <li
            key={img.id}
            data-index={i}
            className="gallery__item zoom"
            style={i === 0 ? {viewTransitionName: `media-${product.handle}`} : undefined}
          >
            <Image
              data={img}
              alt={img.altText ?? `${product.title} — ${t('product.imageN', {n: i + 1, total: images.length})}`}
              sizes="(min-width: 64em) 55vw, 100vw"
              aspectRatio="4/5"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </li>
        ))}
      </ul>
      {images.length > 1 && (
        <p className="gallery__count" aria-hidden="true">
          {String(current + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </p>
      )}
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice { amount currencyCode }
    id
    image { __typename id url altText width height }
    price { amount currencyCode }
    product { title handle }
    selectedOptions { name value }
    sku
    title
    unitPrice { amount currencyCode }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    productType
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 12) {
      nodes { id url altText width height }
    }
    bespoke: metafield(namespace: "custom", key: "bespoke") { value }
    sizeType: metafield(namespace: "custom", key: "size_type") { value }
    composition: metafield(namespace: "custom", key: "composition") { value }
    care: metafield(namespace: "custom", key: "care_instructions") { value }
    measurementFields: metafield(namespace: "custom", key: "measurement_fields") { value }
    productionTime: metafield(namespace: "custom", key: "production_time") { value }
    edition: metafield(namespace: "custom", key: "edition") { value }
    options {
      name
      optionValues {
        name
        firstSelectableVariant { ...ProductVariant }
        swatch {
          color
          image { previewImage { url } }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo { description title }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
