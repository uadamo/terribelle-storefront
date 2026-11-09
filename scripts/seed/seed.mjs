// Seeds the Shopify store with the Terribelle data model and dummy catalogue.
// Idempotent-ish: definitions and items that already exist (by key/handle) are skipped.
//
//   npx shopify store auth --store <store> --scopes <see README>
//   node scripts/seed/generate-plates.mjs
//   node scripts/seed/seed.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gql} from './admin.mjs';
import {COLLECTIONS, PRODUCTS, PRODUCT_FEED} from './catalog.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLICATION_NAME = process.env.HYDROGEN_PUBLICATION || 'terribelle-storefront';
const log = (...a) => console.log('•', ...a);

// --- 1. Product metafield definitions ------------------------------------------
const METAFIELDS = [
  {key: 'bespoke', name: 'Bespoke (made to measure)', type: 'boolean',
    description: 'Made to the client\'s measurements; cannot be returned.'},
  {key: 'size_type', name: 'Size type', type: 'single_line_text_field',
    description: 'made_to_measure | preset | one_size',
    validations: [{name: 'choices', value: JSON.stringify(['made_to_measure', 'preset', 'one_size'])}]},
  {key: 'composition', name: 'Composition', type: 'json',
    description: 'List of parts: [{"part":"Shell","fibres":{"Silk":100}}]'},
  {key: 'care_instructions', name: 'Care instructions', type: 'multi_line_text_field',
    description: 'One instruction per line.'},
  {key: 'measurement_fields', name: 'Measurements required', type: 'list.single_line_text_field',
    description: 'Measurement keys asked in the made-to-measure questionnaire (e.g. bust, waist, hip).'},
  {key: 'production_time', name: 'Production / dispatch time', type: 'single_line_text_field'},
  {key: 'edition', name: 'Edition note', type: 'single_line_text_field',
    description: 'e.g. "Archive N° 01 — limited to 20 pieces"'},
];

function ensureMetafieldDefinitions() {
  const existing = gql(`{ metafieldDefinitions(first: 100, ownerType: PRODUCT, namespace: "custom") { nodes { key } } }`)
    .metafieldDefinitions.nodes.map((n) => n.key);
  for (const def of METAFIELDS) {
    if (existing.includes(def.key)) { log('metafield exists', def.key); continue; }
    gql(`mutation($d: MetafieldDefinitionInput!) { metafieldDefinitionCreate(definition: $d) { createdDefinition { id } userErrors { field message } } }`, {
      d: {namespace: 'custom', ownerType: 'PRODUCT', access: {storefront: 'PUBLIC_READ'}, ...def},
    });
    log('metafield created', def.key);
  }
}

// --- 2. product_feed metaobject definition ------------------------------------
function ensureFeedDefinition() {
  const found = gql(`{ metaobjectDefinitionByType(type: "product_feed") { id } }`).metaobjectDefinitionByType;
  if (found) { log('metaobject definition exists: product_feed'); return; }
  gql(`mutation($d: MetaobjectDefinitionCreateInput!) { metaobjectDefinitionCreate(definition: $d) { metaobjectDefinition { id } userErrors { field message } } }`, {
    d: {
      type: 'product_feed',
      name: 'Product feed',
      description: 'Header, intro, featured products and collections shown on the Products page.',
      access: {storefront: 'PUBLIC_READ'},
      displayNameKey: 'header',
      fieldDefinitions: [
        {key: 'header', name: 'Header', type: 'single_line_text_field', required: true},
        {key: 'description', name: 'Description', type: 'multi_line_text_field'},
        {key: 'featured_products', name: 'Featured products', type: 'list.product_reference'},
        {key: 'collections', name: 'Collections', type: 'list.collection_reference'},
      ],
    },
  });
  log('metaobject definition created: product_feed');
}

// --- 3. Images ----------------------------------------------------------------
async function uploadImage(name) {
  const file = path.join(here, 'out', `${name}.jpg`);
  if (!fs.existsSync(file)) throw new Error(`Missing ${file} — run generate-plates.mjs first`);
  const {stagedUploadsCreate} = gql(`mutation($i: [StagedUploadInput!]!) { stagedUploadsCreate(input: $i) { stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } } }`, {
    i: [{filename: `${name}.jpg`, mimeType: 'image/jpeg', httpMethod: 'POST', resource: 'IMAGE', fileSize: String(fs.statSync(file).size)}],
  });
  const target = stagedUploadsCreate.stagedTargets[0];
  const form = new FormData();
  for (const p of target.parameters) form.append(p.name, p.value);
  form.append('file', new Blob([fs.readFileSync(file)], {type: 'image/jpeg'}), `${name}.jpg`);
  const res = await fetch(target.url, {method: 'POST', body: form});
  if (!res.ok) throw new Error(`Upload of ${name} failed: ${res.status} ${await res.text()}`);
  return target.resourceUrl;
}

// --- 4. Products ----------------------------------------------------------------
function findByHandle(kind, handle) {
  const q = kind === 'product'
    ? `query($h: String!) { productByIdentifier(identifier: {handle: $h}) { id } }`
    : `query($h: String!) { collectionByIdentifier(identifier: {handle: $h}) { id } }`;
  const d = gql(q, {h: handle});
  return (d.productByIdentifier ?? d.collectionByIdentifier)?.id ?? null;
}

async function ensureProduct(p, locationId) {
  const existing = findByHandle('product', p.handle);
  if (existing) { log('product exists', p.handle); return existing; }

  const media = [];
  for (const [file, alt] of p.images) {
    media.push({originalSource: await uploadImage(file), alt, mediaContentType: 'IMAGE'});
  }

  const metafields = [
    {key: 'bespoke', type: 'boolean', value: String(p.bespoke)},
    {key: 'size_type', type: 'single_line_text_field', value: p.sizeType},
    {key: 'composition', type: 'json', value: JSON.stringify(p.composition)},
    {key: 'care_instructions', type: 'multi_line_text_field', value: p.care},
    {key: 'production_time', type: 'single_line_text_field', value: p.productionTime},
    {key: 'edition', type: 'single_line_text_field', value: p.edition},
    ...(p.measurementFields.length
      ? [{key: 'measurement_fields', type: 'list.single_line_text_field', value: JSON.stringify(p.measurementFields)}]
      : []),
  ].map((m) => ({namespace: 'custom', ...m}));

  const {productCreate} = gql(`mutation($p: ProductCreateInput!, $m: [CreateMediaInput!]) { productCreate(product: $p, media: $m) { product { id } userErrors { field message } } }`, {
    p: {
      title: p.title, handle: p.handle, descriptionHtml: p.descriptionHtml, vendor: p.vendor,
      productType: p.productType, tags: p.tags, status: 'ACTIVE', metafields,
      productOptions: p.options.map((o) => ({name: o.name, values: o.values.map((name) => ({name}))})),
    },
    m: media,
  });
  const productId = productCreate.product.id;

  gql(`mutation($id: ID!, $v: [ProductVariantsBulkInput!]!) { productVariantsBulkCreate(productId: $id, variants: $v, strategy: REMOVE_STANDALONE_VARIANT) { productVariants { id } userErrors { field message } } }`, {
    id: productId,
    v: p.variants.map((v) => ({
      optionValues: v.options.map((name, i) => ({optionName: p.options[i].name, name})),
      price: v.price,
      inventoryPolicy: 'DENY',
      inventoryItem: {
        sku: v.sku,
        tracked: p.inventory.tracked,
        harmonizedSystemCode: p.hsCode,
        ...(process.env.COUNTRY_OF_ORIGIN ? {countryCodeOfOrigin: process.env.COUNTRY_OF_ORIGIN} : {}),
        measurement: {weight: {value: p.weightKg, unit: 'KILOGRAMS'}},
        requiresShipping: true,
      },
      ...(p.inventory.tracked ? {inventoryQuantities: [{locationId, availableQuantity: v.qty ?? 0}]} : {}),
    })),
  });
  log('product created', p.handle);
  return productId;
}

// --- 5. Collections, feed, publishing ---------------------------------------------
function ensureCollection(c, productIds) {
  const existing = findByHandle('collection', c.handle);
  if (existing) { log('collection exists', c.handle); return existing; }
  const {collectionCreate} = gql(`mutation($i: CollectionInput!) { collectionCreate(input: $i) { collection { id } userErrors { field message } } }`, {
    i: {title: c.title, handle: c.handle, descriptionHtml: c.descriptionHtml, products: c.products.map((h) => productIds[h])},
  });
  log('collection created', c.handle);
  return collectionCreate.collection.id;
}

function publish(ids, publicationId) {
  for (const id of ids) {
    gql(`mutation($id: ID!, $p: ID!) { publishablePublish(id: $id, input: [{publicationId: $p}]) { userErrors { field message } } }`, {id, p: publicationId});
  }
  log(`published ${ids.length} items to ${PUBLICATION_NAME}`);
}

// --- Run ------------------------------------------------------------------------
const meta = gql(`{ publications(first: 20) { nodes { id name } } locations(first: 1) { nodes { id } } }`);
const publication = meta.publications.nodes.find((p) => p.name === PUBLICATION_NAME);
if (!publication) throw new Error(`No publication named "${PUBLICATION_NAME}". Set HYDROGEN_PUBLICATION.`);
const locationId = meta.locations.nodes[0].id;

ensureMetafieldDefinitions();
ensureFeedDefinition();

const productIds = {};
for (const p of PRODUCTS) productIds[p.handle] = await ensureProduct(p, locationId);
const collectionIds = {};
for (const c of COLLECTIONS) collectionIds[c.handle] = ensureCollection(c, productIds);

publish([...Object.values(productIds), ...Object.values(collectionIds)], publication.id);

gql(`mutation($h: MetaobjectHandleInput!, $m: MetaobjectUpsertInput!) { metaobjectUpsert(handle: $h, metaobject: $m) { metaobject { id } userErrors { field message } } }`, {
  h: {type: 'product_feed', handle: PRODUCT_FEED.handle},
  m: {fields: [
    {key: 'header', value: PRODUCT_FEED.header},
    {key: 'description', value: PRODUCT_FEED.description},
    {key: 'featured_products', value: JSON.stringify(PRODUCT_FEED.featured.map((h) => productIds[h]))},
    {key: 'collections', value: JSON.stringify(PRODUCT_FEED.collections.map((h) => collectionIds[h]))},
  ]},
});
log('product_feed metaobject upserted');
console.log('Done.');
