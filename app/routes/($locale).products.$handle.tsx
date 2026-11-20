import {useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).products.$handle';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {ProductDetail, type Composition} from '~/components/ProductDetail';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.product.seo.title ?? data?.product.title ?? ''} — Terribelle`},
  {name: 'description', content: data?.product.seo.description ?? data?.product.description?.slice(0, 160) ?? ''},
  {rel: 'canonical', href: `/products/${data?.product.handle}`},
];

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
