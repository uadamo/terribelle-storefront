import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).products.$handle';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {ProductDetail, type Composition} from '~/components/ProductDetail';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.product.seo.title ?? data?.product.title ?? ''} — Terribelle`},
  {name: 'description', content: data?.product.seo.description ?? data?.product.description?.slice(0, 160) ?? ''},
  {rel: 'canonical', href: `/products/${data?.product.handle}`},
];

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  if (!handle) throw new Error('Expected product handle to be defined');

  const [{product}, more] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    storefront.query(RELATED_QUERY, {variables: {handle}, cache: storefront.CacheShort()}).catch(() => null),
  ]);
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

  // "More from the collection": prefer the fashion collections shown in the menu.
  const menu = new Set(
    (more?.feed?.collections?.references?.nodes ?? []).flatMap((n) => ('handle' in n ? [n.handle] : [])),
  );
  const candidates = more?.product?.collections.nodes ?? [];
  const source = candidates.find((c) => menu.has(c.handle)) ?? candidates[0] ?? null;
  const relatedProducts = (source?.products.nodes ?? []).filter((p) => p.handle !== handle).slice(0, 12);
  const related = source && relatedProducts.length ? {handle: source.handle, title: source.title, products: relatedProducts} : null;

  return {product, composition, measurementFields, related};
}

export default function Product() {
  const data = useLoaderData<typeof loader>();
  return <ProductDetail data={data} />;
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

const RELATED_QUERY = `#graphql
  query ProductRelated($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      collections(first: 10) {
        nodes {
          handle
          title
          products(first: 13) {
            nodes {
              ...ProductCard
            }
          }
        }
      }
    }
    feed: metaobject(handle: {type: "product_feed", handle: "main"}) {
      collections: field(key: "collections") {
        references(first: 20) {
          nodes {
            ... on Collection {
              handle
            }
          }
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
