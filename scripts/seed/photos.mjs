// Replaces each product's images with free-licensed editorial stand-in photos
// from Pexels (https://www.pexels.com/license/ — free for commercial use, no
// attribution required). These show other makers' garments: development
// placeholders only — replace with Terribelle photography before launch.
//
//   NODE_USE_ENV_PROXY=1 node scripts/seed/photos.mjs
import {gql} from './admin.mjs';

export const PHOTOS = {
  'odette-gown': [
    [13381636, 'Model in an ivory draped gown, lit against a dark studio backdrop'],
    [14000811, 'Bride in a full tulle gown seated by a sunlit window'],
  ],
  'clair-de-lune-veil': [
    [10673499, 'Back view of a bride wearing a long sheer veil by a window'],
    [12069105, 'Model in a satin slip dress lifting a flowing tulle veil'],
    [6176090, 'Moody portrait of a woman behind a sheer veil'],
  ],
  'josephine-corset': [
    [39198742, 'Black-and-white studio portrait of a model in a black corset'],
    [14077166, 'Model in an embroidered corset against a sage wall'],
    [19057522, 'Model in a white boned corset bodice with puff sleeves'],
  ],
  'belle-epoque-underskirt': [
    [14682635, 'Model seated in voluminous white tulle in a dark forest'],
    [13545374, 'Dancer in a full white tulle skirt, backstage'],
  ],
};

const src = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2000`;

async function upload(id) {
  const res = await fetch(src(id));
  if (!res.ok) throw new Error(`Download ${id} failed: ${res.status}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const {stagedUploadsCreate} = gql(`mutation($i: [StagedUploadInput!]!) { stagedUploadsCreate(input: $i) { stagedTargets { url resourceUrl parameters { name value } } userErrors { field message } } }`, {
    i: [{filename: `terribelle-${id}.jpg`, mimeType: 'image/jpeg', httpMethod: 'POST', resource: 'IMAGE', fileSize: String(bytes.length)}],
  });
  const t = stagedUploadsCreate.stagedTargets[0];
  const form = new FormData();
  for (const p of t.parameters) form.append(p.name, p.value);
  form.append('file', new Blob([bytes], {type: 'image/jpeg'}), `terribelle-${id}.jpg`);
  const up = await fetch(t.url, {method: 'POST', body: form});
  if (!up.ok) throw new Error(`Upload ${id} failed: ${up.status}`);
  return t.resourceUrl;
}

for (const [handle, photos] of Object.entries(PHOTOS)) {
  const {productByIdentifier: p} = gql(`query($h: String!) { productByIdentifier(identifier: {handle: $h}) { id media(first: 50) { nodes { id } } } }`, {h: handle});
  if (!p) { console.log('• missing', handle); continue; }
  const media = [];
  for (const [id, alt] of photos) media.push({originalSource: await upload(id), alt, mediaContentType: 'IMAGE'});
  const old = p.media.nodes.map((m) => m.id);
  if (old.length) gql(`mutation($id: ID!, $m: [ID!]!) { productDeleteMedia(productId: $id, mediaIds: $m) { mediaUserErrors { field message } } }`, {id: p.id, m: old});
  gql(`mutation($p: ProductUpdateInput!, $m: [CreateMediaInput!]) { productUpdate(product: $p, media: $m) { product { id } userErrors { field message } } }`, {p: {id: p.id}, m: media});
  console.log(`• ${handle}: replaced ${old.length} image(s) with ${media.length} photo(s)`);
}
console.log('Done.');
