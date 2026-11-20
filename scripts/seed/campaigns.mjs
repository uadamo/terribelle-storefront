// Creates/updates collections, campaigns, promotional videos and the new pieces
// from campaigns-data.mjs. Safe to re-run (existing items are updated, not duplicated).
//
//   npm run seed:campaigns
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {gql} from './admin.mjs';
import {CAMPAIGNS, COLLECTIONS, EDITIONS, FEED, FR, NEW_PRODUCTS, VIDEOS, mixkit, pexels} from './campaigns-data.mjs';

const log = (...a) => console.log('•', ...a);
const PUBLICATION_NAME = process.env.HYDROGEN_PUBLICATION || 'terribelle-storefront';
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tb-media-'));

// --- Uploads --------------------------------------------------------------------------
async function stagedUpload(bytes, filename, mimeType, resource) {
  const {stagedUploadsCreate} = gql(`mutation($i: [StagedUploadInput!]!) { stagedUploadsCreate(input: $i) { stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } } }`, {
    i: [{filename, mimeType, httpMethod: 'POST', resource, fileSize: String(bytes.length)}],
  });
  const t = stagedUploadsCreate.stagedTargets[0];
  const form = new FormData();
  for (const p of t.parameters) form.append(p.name, p.value);
  form.append('file', new Blob([bytes], {type: mimeType}), filename);
  const res = await fetch(t.url, {method: 'POST', body: form});
  if (!res.ok) throw new Error(`Upload ${filename} failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  return t.resourceUrl;
}

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download ${url} failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Silent, web-friendly copy (videos play muted anyway). Falls back to the original. */
function stripAudio(bytes, name) {
  const src = path.join(tmp, `${name}-src.mp4`);
  const out = path.join(tmp, `${name}.mp4`);
  fs.writeFileSync(src, bytes);
  try {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', src, '-an', '-c:v', 'libx264', '-crf', '24', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-vf', 'scale=1280:-2', out]);
    return fs.readFileSync(out);
  } catch {
    return bytes;
  }
}

async function ensureVideo(key) {
  const {id, alt} = VIDEOS[key];
  const filename = `terribelle-${key}.mp4`;
  const found = gql(`query($q: String!) { files(first: 1, query: $q) { nodes { id fileStatus } } }`, {q: `filename:${filename}`}).files.nodes[0];
  if (found) return found.id;
  const bytes = stripAudio(await download(mixkit(id)), key);
  const resourceUrl = await stagedUpload(bytes, filename, 'video/mp4', 'VIDEO');
  const {fileCreate} = gql(`mutation($f: [FileCreateInput!]!) { fileCreate(files: $f) { files { id } userErrors { field message } } }`, {
    f: [{originalSource: resourceUrl, contentType: 'VIDEO', alt, filename}],
  });
  log(`video uploaded: ${key}`);
  return fileCreate.files[0].id;
}

async function waitForVideos(ids) {
  for (let i = 0; i < 60; i++) {
    const {nodes} = gql(`query($ids: [ID!]!) { nodes(ids: $ids) { ... on Video { id fileStatus } } }`, {ids});
    const pending = nodes.filter((n) => n && n.fileStatus !== 'READY' && n.fileStatus !== 'FAILED');
    if (!pending.length) {
      const failed = nodes.filter((n) => n?.fileStatus === 'FAILED');
      if (failed.length) log('WARNING: video processing failed for', failed.map((f) => f.id).join(', '));
      return;
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  log('WARNING: some videos are still processing — they will appear once Shopify finishes.');
}

// --- Definitions -------------------------------------------------------------------------
function ensureCollectionMetafields() {
  const have = gql(`{ metafieldDefinitions(first: 50, ownerType: COLLECTION, namespace: "custom") { nodes { key } } }`).metafieldDefinitions.nodes.map((n) => n.key);
  const defs = [
    {key: 'promo_videos', name: 'Promotional videos', type: 'list.file_reference', description: 'Silent video strips shown between rows of this collection (in order).', validations: [{name: 'file_type_options', value: JSON.stringify(['Video'])}]},
    {key: 'tagline', name: 'Tagline', type: 'single_line_text_field', description: 'Short line shown under the collection title.'},
  ];
  for (const d of defs) {
    if (have.includes(d.key)) continue;
    gql(`mutation($d: MetafieldDefinitionInput!) { metafieldDefinitionCreate(definition: $d) { createdDefinition { id } userErrors { field message } } }`, {
      d: {namespace: 'custom', ownerType: 'COLLECTION', access: {storefront: 'PUBLIC_READ'}, ...d},
    });
    log('collection metafield created', d.key);
  }
}

function ensureCampaignDefinition() {
  const existing = gql(`{ metaobjectDefinitionByType(type: "campaign") { id } }`).metaobjectDefinitionByType;
  if (existing) return existing.id;
  const {metaobjectDefinitionCreate} = gql(`mutation($d: MetaobjectDefinitionCreateInput!) { metaobjectDefinitionCreate(definition: $d) { metaobjectDefinition { id } userErrors { field message } } }`, {
    d: {
      type: 'campaign',
      name: 'Campaign',
      description: 'The movie-poster opening screen: video, title and the collection it leads to.',
      displayNameKey: 'title',
      access: {storefront: 'PUBLIC_READ'},
      capabilities: {translatable: {enabled: true}},
      fieldDefinitions: [
        {key: 'presenter', name: 'Presenter line', type: 'single_line_text_field', description: 'e.g. "Terribelle Couture presents"'},
        {key: 'title', name: 'Title', type: 'single_line_text_field', required: true},
        {key: 'credits', name: 'Credits', type: 'list.single_line_text_field', description: 'Short words shown like a cast list.'},
        {key: 'collection', name: 'Collection', type: 'collection_reference', required: true},
        {key: 'video', name: 'Video', type: 'file_reference', validations: [{name: 'file_type_options', value: JSON.stringify(['Video'])}]},
        {key: 'poster', name: 'Poster image (optional)', type: 'file_reference', validations: [{name: 'file_type_options', value: JSON.stringify(['Image'])}]},
        {key: 'cta_label', name: 'Button label', type: 'single_line_text_field'},
      ],
    },
  });
  log('metaobject definition created: campaign');
  return metaobjectDefinitionCreate.metaobjectDefinition.id;
}

function ensureFeedCampaignField(campaignDefId) {
  const def = gql(`{ metaobjectDefinitionByType(type: "product_feed") { id fieldDefinitions { key } capabilities { translatable { enabled } } } }`).metaobjectDefinitionByType;
  const ops = def.fieldDefinitions.some((f) => f.key === 'campaign')
    ? []
    : [{create: {key: 'campaign', name: 'Featured campaign', type: 'metaobject_reference', validations: [{name: 'metaobject_definition_id', value: campaignDefId}]}}];
  if (!ops.length && def.capabilities.translatable.enabled) return;
  gql(`mutation($id: ID!, $d: MetaobjectDefinitionUpdateInput!) { metaobjectDefinitionUpdate(id: $id, definition: $d) { metaobjectDefinition { id } userErrors { field message } } }`, {
    id: def.id,
    d: {fieldDefinitions: ops, capabilities: {translatable: {enabled: true}}},
  });
  log('product_feed: featured campaign field / translations enabled');
}

// --- Products & collections ---------------------------------------------------------------
const byHandle = (kind, h) =>
  gql(`query($h: String!) { ${kind}ByIdentifier(identifier: {handle: $h}) { id } }`, {h})[`${kind}ByIdentifier`]?.id ?? null;

async function ensureNewProduct(p, locationId) {
  const existing = byHandle('product', p.handle);
  if (existing) return existing;
  const media = [];
  for (const [id, alt] of p.images) {
    media.push({originalSource: await stagedUpload(await download(pexels(id)), `terribelle-${id}.jpg`, 'image/jpeg', 'IMAGE'), alt, mediaContentType: 'IMAGE'});
  }
  const metafields = [
    {key: 'bespoke', type: 'boolean', value: String(p.bespoke)},
    {key: 'size_type', type: 'single_line_text_field', value: p.sizeType},
    {key: 'composition', type: 'json', value: JSON.stringify(p.composition)},
    {key: 'care_instructions', type: 'multi_line_text_field', value: p.care},
    {key: 'production_time', type: 'single_line_text_field', value: p.productionTime},
    {key: 'edition', type: 'single_line_text_field', value: p.edition},
  ].map((m) => ({namespace: 'custom', ...m}));
  const {productCreate} = gql(`mutation($p: ProductCreateInput!, $m: [CreateMediaInput!]) { productCreate(product: $p, media: $m) { product { id } userErrors { field message } } }`, {
    p: {
      title: p.title, handle: p.handle, descriptionHtml: p.descriptionHtml, vendor: p.vendor, productType: p.productType,
      tags: p.tags, status: 'ACTIVE', metafields,
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
      inventoryItem: {sku: v.sku, tracked: true, harmonizedSystemCode: p.hsCode, measurement: {weight: {value: p.weightKg, unit: 'KILOGRAMS'}}, requiresShipping: true},
      inventoryQuantities: [{locationId, availableQuantity: v.qty}],
    })),
  });
  log('product created', p.handle);
  return productId;
}

function ensureCollection(c, productIds, videoIds) {
  const metafields = [
    {namespace: 'custom', key: 'tagline', type: 'single_line_text_field', value: c.tagline},
    {namespace: 'custom', key: 'promo_videos', type: 'list.file_reference', value: JSON.stringify(c.promoVideos.map((k) => videoIds[k]))},
  ];
  let id = byHandle('collection', c.handle);
  if (!id) {
    id = gql(`mutation($i: CollectionInput!) { collectionCreate(input: $i) { collection { id } userErrors { field message } } }`, {
      i: {title: c.title, handle: c.handle, descriptionHtml: c.descriptionHtml, products: c.products.map((h) => productIds[h]), metafields},
    }).collectionCreate.collection.id;
    log('collection created', c.handle);
  } else {
    gql(`mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { userErrors { field message } } }`, {m: metafields.map((m) => ({...m, ownerId: id}))});
    try {
      gql(`mutation($id: ID!, $p: [ID!]!) { collectionAddProducts(id: $id, productIds: $p) { userErrors { field message } } }`, {id, p: c.products.map((h) => productIds[h])});
    } catch {
      /* products already in the collection */
    }
    log('collection updated', c.handle);
  }
  return id;
}

// --- Translations (same approach as localize.mjs) ----------------------------------------------
function register(resourceId, values) {
  const content = gql(`query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key digest } } }`, {id: resourceId}).translatableResource?.translatableContent ?? [];
  const t = Object.entries(values)
    .map(([key, value]) => {
      const c = content.find((x) => x.key === key);
      return c && value ? {locale: 'fr', key, value: typeof value === 'string' ? value : JSON.stringify(value), translatableContentDigest: c.digest} : null;
    })
    .filter(Boolean);
  if (t.length) gql(`mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { userErrors { field message } } }`, {id: resourceId, t});
  return t.length;
}

// --- Run ----------------------------------------------------------------------------------------
const meta = gql(`{ publications(first: 20) { nodes { id name } } locations(first: 1) { nodes { id } } }`);
const publicationId = meta.publications.nodes.find((p) => p.name === PUBLICATION_NAME)?.id;
const locationId = meta.locations.nodes[0].id;

ensureCollectionMetafields();
const campaignDefId = ensureCampaignDefinition();
ensureFeedCampaignField(campaignDefId);

const videoIds = {};
for (const key of Object.keys(VIDEOS)) videoIds[key] = await ensureVideo(key);
await waitForVideos(Object.values(videoIds));

const productIds = {};
for (const p of NEW_PRODUCTS) productIds[p.handle] = await ensureNewProduct(p, locationId);
for (const h of new Set(COLLECTIONS.flatMap((c) => c.products).concat(FEED.featured))) productIds[h] ??= byHandle('product', h);

const collectionIds = {};
for (const c of COLLECTIONS) collectionIds[c.handle] = ensureCollection(c, productIds, videoIds);

for (const id of [...Object.values(collectionIds), ...NEW_PRODUCTS.map((p) => productIds[p.handle])]) {
  gql(`mutation($id: ID!, $p: ID!) { publishablePublish(id: $id, input: [{publicationId: $p}]) { userErrors { field message } } }`, {id, p: publicationId});
}
log('published collections and new pieces');

const campaignIds = {};
for (const c of CAMPAIGNS) {
  campaignIds[c.handle] = gql(`mutation($h: MetaobjectHandleInput!, $m: MetaobjectUpsertInput!) { metaobjectUpsert(handle: $h, metaobject: $m) { metaobject { id } userErrors { field message } } }`, {
    h: {type: 'campaign', handle: c.handle},
    m: {fields: [
      {key: 'presenter', value: c.presenter},
      {key: 'title', value: c.title},
      {key: 'credits', value: JSON.stringify(c.credits)},
      {key: 'collection', value: collectionIds[c.collection]},
      {key: 'video', value: videoIds[c.video]},
      {key: 'cta_label', value: c.ctaLabel},
    ]},
  }).metaobjectUpsert.metaobject.id;
  log('campaign upserted', c.handle);
}

const feedId = gql(`mutation($h: MetaobjectHandleInput!, $m: MetaobjectUpsertInput!) { metaobjectUpsert(handle: $h, metaobject: $m) { metaobject { id } userErrors { field message } } }`, {
  h: {type: 'product_feed', handle: 'main'},
  m: {fields: [
    {key: 'header', value: FEED.header},
    {key: 'description', value: FEED.description},
    {key: 'campaign', value: campaignIds[FEED.campaign]},
    {key: 'collections', value: JSON.stringify(FEED.collections.map((h) => collectionIds[h]))},
    {key: 'featured_products', value: JSON.stringify(FEED.featured.map((h) => productIds[h]))},
  ]},
}).metaobjectUpsert.metaobject.id;
log('product feed updated');

// Editions without the word "archive".
for (const [handle, ed] of Object.entries(EDITIONS)) {
  const pid = productIds[handle] ?? byHandle('product', handle);
  gql(`mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { metafields { id } userErrors { field message } } }`, {
    m: [{ownerId: pid, namespace: 'custom', key: 'edition', type: 'single_line_text_field', value: ed.en}],
  });
}
log('edition notes updated');

// French.
for (const [handle, fr] of Object.entries(FR.products)) {
  const p = gql(`query($h: String!) { productByIdentifier(identifier: {handle: $h}) { id options { id name optionValues { id name } } } }`, {h: handle}).productByIdentifier;
  let n = register(p.id, {title: fr.title, body_html: fr.body_html, product_type: fr.product_type});
  n += register(p.options.find((o) => o.name === 'Size')?.id, {name: 'Taille'}) + register(p.options.find((o) => o.name === 'Color')?.id, {name: 'Couleur'});
  for (const o of p.options) for (const v of o.optionValues) n += register(v.id, {name: FR.optionValues[v.name]});
  log(`fr: ${handle} (${n})`);
}
for (const [handle, ed] of Object.entries(EDITIONS)) {
  const p = gql(`query($h: String!) { productByIdentifier(identifier: {handle: $h}) { metafields(first: 20, namespace: "custom") { nodes { id key } } } }`, {h: handle}).productByIdentifier;
  for (const m of p.metafields.nodes) {
    const fr = FR.products[handle]?.[m.key] ?? (m.key === 'edition' ? ed.fr : null);
    if (fr) register(m.id, {value: fr});
  }
}
for (const [handle, fr] of Object.entries(FR.collections)) {
  const c = gql(`query($h: String!) { collectionByIdentifier(identifier: {handle: $h}) { id metafields(first: 10, namespace: "custom") { nodes { id key } } } }`, {h: handle}).collectionByIdentifier;
  register(c.id, {body_html: fr.body_html});
  const tag = c.metafields.nodes.find((m) => m.key === 'tagline');
  if (tag) register(tag.id, {value: fr.tagline});
}
for (const [handle, fr] of Object.entries(FR.campaigns)) register(campaignIds[handle], fr);
register(feedId, FR.feed);
log('french translations registered');
console.log('Done.');
