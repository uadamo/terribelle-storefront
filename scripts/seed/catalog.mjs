// Dummy catalogue for development. Edit freely, then re-run `npm run seed`.
// Prices are in the store's currency. Images reference files produced by
// generate-plates.mjs (scripts/seed/out/<name>.jpg).
//
// Internal-only data (HS code, country of origin, weight, SKU) lives on each
// variant's inventory item in Shopify — it powers duty/tax estimates and
// customs paperwork, and is never exposed to the storefront.

export const MEASUREMENT_SETS = {
  gown: ['bust', 'underbust', 'waist', 'high_hip', 'hip', 'shoulder_width', 'nape_to_waist', 'hollow_to_hem', 'height'],
  corset: ['bust', 'underbust', 'waist', 'high_hip', 'hip', 'nape_to_waist'],
};

export const PRODUCTS = [
  {
    handle: 'odette-gown',
    title: 'The Odette Gown',
    productType: 'Wedding dress',
    vendor: 'Terribelle Couture',
    tags: ['bridal', 'made-to-measure', 'archive-01'],
    descriptionHtml:
      '<p>A sweetheart-neckline bridal gown cut from silk duchess satin, built on a fully boned inner corset in the manner of 1950s couture. The skirt falls from a natural waist into a sweeping chapel train.</p><p>Each gown is drafted to the client\'s measurements and hand-finished in our atelier.</p>',
    bespoke: true,
    sizeType: 'made_to_measure',
    measurementFields: MEASUREMENT_SETS.gown,
    productionTime: '10–12 weeks',
    edition: 'Archive N° 01 — made to order',
    composition: [
      {part: 'Shell', fibres: {Silk: 100}},
      {part: 'Lining', fibres: {Cotton: 100}},
      {part: 'Inner corset', fibres: {Cotton: 100}},
    ],
    care:
      'Professional dry clean only.\nDo not wash, tumble dry or bleach.\nCool iron on the reverse with a pressing cloth.\nStore flat or on a padded hanger in the cotton garment bag provided.',
    images: [
      ['dress-1', 'The Odette Gown — illustrated front view on a dress form'],
      ['dress-2', 'The Odette Gown — illustration on black'],
      ['dress-3', 'The Odette Gown — detail of the boned sweetheart bodice'],
    ],
    options: [
      {name: 'Size', values: ['Made to measure']},
      {name: 'Color', values: ['Ivory', 'Champagne']},
    ],
    variants: [
      {options: ['Made to measure', 'Ivory'], price: '4800.00', sku: 'TB-ODT-MTM-IVO'},
      {options: ['Made to measure', 'Champagne'], price: '4800.00', sku: 'TB-ODT-MTM-CHA'},
    ],
    inventory: {tracked: false},
    hsCode: '620449',
    weightKg: 3.2,
  },
  {
    handle: 'clair-de-lune-veil',
    title: 'The Clair de Lune Veil',
    productType: 'Wedding veil',
    vendor: 'Terribelle Couture',
    tags: ['bridal', 'accessories', 'archive-01'],
    descriptionHtml:
      '<p>A single-tier veil of the finest silk tulle, edged by hand with scalloped cotton lace. Gathered onto a discreet comb so it sits softly at the crown.</p>',
    bespoke: false,
    sizeType: 'preset',
    measurementFields: [],
    productionTime: 'Ships in 1–2 weeks',
    edition: 'Archive N° 01 — limited to 20 pieces',
    composition: [
      {part: 'Veil', fibres: {Silk: 100}},
      {part: 'Lace edging', fibres: {Cotton: 80, Polyamide: 20}},
    ],
    care:
      'Professional dry clean only.\nSteam gently from a distance to release creases; never iron directly.\nStore loosely rolled in acid-free tissue.',
    images: [
      ['veil-1', 'The Clair de Lune Veil — illustrated full-length view'],
      ['veil-2', 'The Clair de Lune Veil — illustration on black'],
      ['veil-3', 'The Clair de Lune Veil — detail of the scalloped lace edge'],
    ],
    options: [
      {name: 'Length', values: ['Chapel — 230 cm', 'Cathedral — 300 cm', 'Royal cathedral — 350 cm']},
      {name: 'Color', values: ['Ivory', 'Off-white']},
    ],
    variants: [
      {options: ['Chapel — 230 cm', 'Ivory'], price: '780.00', sku: 'TB-CDL-230-IVO', qty: 4},
      {options: ['Chapel — 230 cm', 'Off-white'], price: '780.00', sku: 'TB-CDL-230-OFW', qty: 3},
      {options: ['Cathedral — 300 cm', 'Ivory'], price: '980.00', sku: 'TB-CDL-300-IVO', qty: 3},
      {options: ['Cathedral — 300 cm', 'Off-white'], price: '980.00', sku: 'TB-CDL-300-OFW', qty: 2},
      {options: ['Royal cathedral — 350 cm', 'Ivory'], price: '1180.00', sku: 'TB-CDL-350-IVO', qty: 1},
      {options: ['Royal cathedral — 350 cm', 'Off-white'], price: '1180.00', sku: 'TB-CDL-350-OFW', qty: 0},
    ],
    inventory: {tracked: true},
    hsCode: '621410',
    weightKg: 0.6,
  },
  {
    handle: 'josephine-corset',
    title: 'The Joséphine Corset',
    productType: 'Corset',
    vendor: 'Terribelle Couture',
    tags: ['corsetry', 'archive-01'],
    descriptionHtml:
      '<p>An overbust corset in silk dupioni over cotton coutil, structured with spiral steel boning and closed at the front with a hand-set busk. Laced at the back for a precise fit.</p><p>Worn as outerwear or beneath a gown.</p>',
    bespoke: false,
    sizeType: 'preset',
    measurementFields: [],
    productionTime: 'Ships in 1–2 weeks',
    edition: 'Archive N° 01 — limited to 30 pieces',
    composition: [
      {part: 'Shell', fibres: {Silk: 100}},
      {part: 'Interlining', fibres: {Cotton: 100}},
      {part: 'Lining', fibres: {Cotton: 100}},
    ],
    care:
      'Spot clean or professional dry clean only.\nAir after wearing; do not wash.\nStore flat or hanging by the waist tape. Release the lacing between wears.',
    images: [
      ['corset-1', 'The Joséphine Corset — illustrated front view on a dress form'],
      ['corset-2', 'The Joséphine Corset — illustration on black'],
      ['corset-3', 'The Joséphine Corset — detail of boning channels and front busk'],
    ],
    options: [
      {name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL']},
      {name: 'Color', values: ['Black', 'Ivory']},
    ],
    variants: ['XS', 'S', 'M', 'L', 'XL'].flatMap((s, i) =>
      ['Black', 'Ivory'].map((c) => ({
        options: [s, c],
        price: '1250.00',
        sku: `TB-JOS-${s}-${c.slice(0, 3).toUpperCase()}`,
        qty: s === 'XL' && c === 'Ivory' ? 0 : 2 + (i % 2),
      })),
    ),
    inventory: {tracked: true},
    hsCode: '621290',
    weightKg: 0.9,
  },
  {
    handle: 'belle-epoque-underskirt',
    title: 'The Belle Époque Underskirt',
    productType: 'Underskirt',
    vendor: 'Terribelle Couture',
    tags: ['bridal', 'corsetry', 'foundations', 'archive-01'],
    descriptionHtml:
      '<p>A cage crinoline underskirt with graduated steel hoops, wrapped in soft tulle and finished with a ruffled hem. Gives a gown its full, period silhouette while staying light to wear.</p><p>The drawstring waistband adjusts to fit.</p>',
    bespoke: false,
    sizeType: 'one_size',
    measurementFields: [],
    productionTime: 'Ships in 1–2 weeks',
    edition: 'Archive N° 01',
    composition: [
      {part: 'Tulle', fibres: {Polyamide: 100}},
      {part: 'Waistband and tapes', fibres: {Cotton: 100}},
    ],
    care:
      'Hand wash cold or spot clean.\nDo not tumble dry, iron the hoops or bleach.\nHang to dry and store hanging by the waistband.',
    images: [
      ['underskirt-1', 'The Belle Époque Underskirt — illustrated view on a dress form'],
      ['underskirt-2', 'The Belle Époque Underskirt — illustration on black'],
      ['underskirt-3', 'The Belle Époque Underskirt — detail of the graduated hoops'],
    ],
    options: [
      {name: 'Size', values: ['One size']},
      {name: 'Color', values: ['Ivory']},
    ],
    variants: [{options: ['One size', 'Ivory'], price: '640.00', sku: 'TB-BEU-OS-IVO', qty: 6}],
    inventory: {tracked: true},
    hsCode: '620811',
    weightKg: 1.4,
  },
];

export const COLLECTIONS = [
  {
    handle: 'bridal',
    title: 'Bridal',
    descriptionHtml:
      '<p>Gowns, veils and foundations for the ceremony — cut with the techniques of mid-century couture.</p>',
    products: ['odette-gown', 'clair-de-lune-veil', 'belle-epoque-underskirt'],
  },
  {
    handle: 'corsetry',
    title: 'Corsetry',
    descriptionHtml: '<p>Structured pieces, boned and laced by hand.</p>',
    products: ['josephine-corset', 'belle-epoque-underskirt'],
  },
  {
    handle: 'made-to-measure',
    title: 'Made to measure',
    descriptionHtml:
      '<p>Drafted to your measurements and made only for you. Bespoke pieces cannot be returned.</p>',
    products: ['odette-gown'],
  },
];

export const PRODUCT_FEED = {
  handle: 'main',
  header: 'Archive N° 01',
  description:
    'A first chapter of pieces drawn from vintage silhouettes — bridal gowns, veils and corsetry, made in limited numbers or to measure.',
  featured: ['odette-gown', 'josephine-corset', 'clair-de-lune-veil'],
  collections: ['bridal', 'corsetry', 'made-to-measure'],
};
