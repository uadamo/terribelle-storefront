// Adds a "Featured" switch to the campaign metaobject and marks one campaign featured.
// The home page opens with the featured campaign (fallback: Product feed → Featured campaign).
//   NODE_USE_ENV_PROXY=1 node scripts/seed/featured-field.mjs [campaign-handle]
import {gql} from './admin.mjs';

const featuredHandle = process.argv[2] || 'terribelle-of-the-ball';
const def = gql(`{ metaobjectDefinitionByType(type: "campaign") { id fieldDefinitions { key } } }`).metaobjectDefinitionByType;
if (!def.fieldDefinitions.some((f) => f.key === 'featured')) {
  gql(`mutation($id: ID!, $d: MetaobjectDefinitionUpdateInput!) { metaobjectDefinitionUpdate(id: $id, definition: $d) { metaobjectDefinition { id } userErrors { field message } } }`, {
    id: def.id,
    d: {fieldDefinitions: [{create: {key: 'featured', name: 'Featured on home page', type: 'boolean', description: 'Switch on to open the site with this campaign. If several are on, the most recently updated wins.'}}]},
  });
  console.log('• campaign.featured field created');
}
const {metaobjects} = gql(`{ metaobjects(type: "campaign", first: 50) { nodes { id handle } } }`);
for (const m of metaobjects.nodes) {
  gql(`mutation($id: ID!, $m: MetaobjectUpdateInput!) { metaobjectUpdate(id: $id, metaobject: $m) { metaobject { id } userErrors { field message } } }`, {
    id: m.id,
    m: {fields: [{key: 'featured', value: String(m.handle === featuredHandle)}]},
  });
  console.log(`• ${m.handle}: featured=${m.handle === featuredHandle}`);
}
