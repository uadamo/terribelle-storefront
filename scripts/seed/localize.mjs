// Sets up international selling and French content:
//   1. Markets: European Union (EUR, VAT-inclusive prices) and Canada (CAD)
//   2. French as a published shop language
//   3. French translations for products, options, metafields, collections and the product feed
// Safe to re-run: existing markets are skipped and translations are overwritten.
//
//   npx shopify store auth ... (needs read/write_markets, _locales, _translations — see README)
//   npm run seed:localize
import {gql} from './admin.mjs';
import {FR} from './translations-fr.mjs';

const log = (...a) => console.log('•', ...a);
const EU = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'];

const MARKETS = [
  {
    name: 'European Union',
    handle: 'eu',
    countries: EU,
    currency: 'EUR',
    // EU consumer law: prices shown to consumers must include VAT.
    priceInclusions: {taxPricingStrategy: 'INCLUDES_TAXES_IN_PRICE'},
  },
  {name: 'Canada', handle: 'ca', countries: ['CA'], currency: 'CAD'},
];

// --- 1. Markets ---------------------------------------------------------------
function ensureMarkets() {
  const existing = gql(`{ markets(first: 50) { nodes { id name handle status } } }`).markets.nodes;
  log('existing markets:', existing.map((m) => `${m.name} (${m.handle}, ${m.status})`).join(', ') || 'none');
  for (const m of MARKETS) {
    if (existing.some((e) => e.handle === m.handle)) {
      log('market exists', m.handle);
      continue;
    }
    gql(`mutation($input: MarketCreateInput!) { marketCreate(input: $input) { market { id } userErrors { field message } } }`, {
      input: {
        name: m.name,
        handle: m.handle,
        status: 'ACTIVE',
        conditions: {regionsCondition: {regions: m.countries.map((countryCode) => ({countryCode}))}},
        currencySettings: {baseCurrency: m.currency, localCurrencies: false},
        ...(m.priceInclusions ? {priceInclusions: m.priceInclusions} : {}),
      },
    });
    log('market created', m.name, m.currency);
  }
}

// --- 2. French ---------------------------------------------------------------------
function ensureFrench() {
  const locales = gql(`{ shopLocales { locale published primary } }`).shopLocales;
  if (!locales.some((l) => l.locale === 'fr')) {
    gql(`mutation { shopLocaleEnable(locale: "fr") { shopLocale { locale } userErrors { field message } } }`);
    log('french enabled');
  }
  gql(`mutation { shopLocaleUpdate(locale: "fr", shopLocale: {published: true}) { shopLocale { locale published } userErrors { field message } } }`);
  log('french published');
}

// --- 3. Translations -------------------------------------------------------------------
function register(resourceId, values) {
  const {translatableResource} = gql(`query($id: ID!) { translatableResource(resourceId: $id) { translatableContent { key digest } } }`, {id: resourceId});
  const content = translatableResource?.translatableContent ?? [];
  const translations = Object.entries(values)
    .map(([key, value]) => {
      const c = content.find((x) => x.key === key);
      return c && value ? {locale: 'fr', key, value, translatableContentDigest: c.digest} : null;
    })
    .filter(Boolean);
  if (!translations.length) return 0;
  gql(`mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { userErrors { field message } } }`, {id: resourceId, t: translations});
  return translations.length;
}

function translateProducts() {
  for (const [handle, fr] of Object.entries(FR.products)) {
    const {productByIdentifier: p} = gql(`query($h: String!) { productByIdentifier(identifier: {handle: $h}) {
      id
      options { id name optionValues { id name } }
      metafields(first: 20, namespace: "custom") { nodes { id key } }
    } }`, {h: handle});
    if (!p) { log('missing product', handle); continue; }
    let n = register(p.id, {title: fr.title, body_html: fr.body_html, product_type: fr.product_type});
    for (const o of p.options) {
      n += register(o.id, {name: FR.options[o.name]});
      for (const v of o.optionValues) n += register(v.id, {name: FR.optionValues[v.name]});
    }
    for (const m of p.metafields.nodes) {
      if (fr[m.key]) n += register(m.id, {value: fr[m.key]});
    }
    log(`translated ${handle} (${n} strings)`);
  }
}

function translateCollections() {
  for (const [handle, fr] of Object.entries(FR.collections)) {
    const {collectionByIdentifier: c} = gql(`query($h: String!) { collectionByIdentifier(identifier: {handle: $h}) { id } }`, {h: handle});
    if (c) log(`translated collection ${handle} (${register(c.id, fr)})`);
  }
  const {metaobjectByHandle: feed} = gql(`{ metaobjectByHandle(handle: {type: "product_feed", handle: "main"}) { id } }`);
  if (feed) log(`translated product feed (${register(feed.id, FR.feed)})`);
}

ensureMarkets();
ensureFrench();
translateProducts();
translateCollections();
console.log('Done.');
