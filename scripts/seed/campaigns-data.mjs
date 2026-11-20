// Collections, campaigns and promotional videos (development content).
// Everything here lands in Shopify, where it can be edited without code:
//   • Collections                → Products → Collections (+ "Promotional videos" metafield)
//   • Campaigns (hero screen)    → Content → Metaobjects → Campaign
//   • Which campaign is featured → Content → Metaobjects → Product feed → "Featured campaign"
//
// Videos are free-licensed Mixkit clips (https://mixkit.co/license/#videoFree),
// photos are Pexels (https://www.pexels.com/license/). Development stand-ins only.

export const mixkit = (id) => `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`;
export const pexels = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2000`;

export const VIDEOS = {
  'ball-hero': {id: 6559, alt: 'Silhouette of a woman with a billowing scarf at sunset'},
  'ball-ceremony': {id: 5217, alt: 'Bride in lace holding a white bouquet'},
  'ball-dancer': {id: 1038, alt: 'Dancer moving slowly in the dark'},
  'ball-fabric': {id: 32750, alt: 'Flowing fabric moved by the wind'},
  'ring-disco': {id: 1356, alt: 'Mirror ball spinning with scattered light'},
  'ring-dancer': {id: 33896, alt: 'Dancer in purple light and haze'},
  'ring-mirror': {id: 1355, alt: 'Close-up of a mirror ball turning slowly'},
};

export const NEW_PRODUCTS = [
  {
    handle: 'carillon-skirt',
    title: 'The Carillon Skirt',
    productType: 'Skirt',
    vendor: 'Terribelle Couture',
    tags: ['skirt', 'evening'],
    descriptionHtml:
      '<p>A bias-cut skirt covered in hand-sewn sequins that catch the light like a mirror ball. Cut to skim the hips and swing from the knee, with a silk lining and a concealed side zip.</p><p>Made in small numbers for nights that run late.</p>',
    bespoke: false,
    sizeType: 'preset',
    productionTime: 'Ships in 1–2 weeks',
    edition: 'Limited to 25 pieces',
    composition: [
      {part: 'Shell', fibres: {Polyester: 100}},
      {part: 'Lining', fibres: {Silk: 100}},
    ],
    care: 'Professional dry clean only.\nDo not iron the sequins; steam from the reverse at a distance.\nStore hanging, inside out.',
    images: [
      [5713294, 'Close view of a silver sequin skirt with red heels in hand'],
      [6224735, 'Model in a gold sequin look against a tinsel curtain'],
    ],
    options: [
      {name: 'Size', values: ['XS', 'S', 'M', 'L']},
      {name: 'Color', values: ['Silver', 'Champagne']},
    ],
    variants: ['XS', 'S', 'M', 'L'].flatMap((s) =>
      ['Silver', 'Champagne'].map((c) => ({
        options: [s, c],
        price: '690.00',
        sku: `TB-CAR-${s}-${c.slice(0, 3).toUpperCase()}`,
        qty: s === 'L' && c === 'Champagne' ? 0 : 3,
      })),
    ),
    hsCode: '620453',
    weightKg: 0.5,
  },
];

export const COLLECTIONS = [
  {
    handle: 'terribelle-of-the-ball',
    title: 'Terribelle of the Ball',
    descriptionHtml: '<p>Gowns, veils and corsetry for the ceremony — drawn from mid-century couture and made in limited numbers or to measure.</p>',
    tagline: 'The bridal collection',
    products: ['odette-gown', 'clair-de-lune-veil', 'josephine-corset', 'belle-epoque-underskirt'],
    promoVideos: ['ball-ceremony', 'ball-dancer', 'ball-fabric'],
  },
  {
    handle: 'you-can-ring-my-terribell',
    title: 'You Can Ring My Terribell',
    descriptionHtml: '<p>Evening pieces that catch the light — sequins, silk and a little disco.</p>',
    tagline: 'The evening collection',
    products: ['carillon-skirt'],
    promoVideos: ['ring-disco', 'ring-dancer', 'ring-mirror'],
  },
];

export const CAMPAIGNS = [
  {
    handle: 'terribelle-of-the-ball',
    presenter: 'Terribelle Couture presents',
    title: 'Terribelle of the Ball',
    credits: ['Made to measure', 'Limited edition', 'Hand finished'],
    collection: 'terribelle-of-the-ball',
    video: 'ball-hero',
    ctaLabel: 'Explore collection',
  },
  {
    handle: 'you-can-ring-my-terribell',
    presenter: 'Terribelle Couture presents',
    title: 'You Can Ring My Terribell',
    credits: ['Sequins', 'Silk', 'After dark'],
    collection: 'you-can-ring-my-terribell',
    video: 'ring-disco',
    ctaLabel: 'Explore collection',
  },
];

/** Which campaign the home page opens with, and the order of collections in the menu. */
export const FEED = {
  campaign: 'terribelle-of-the-ball',
  collections: ['terribelle-of-the-ball', 'you-can-ring-my-terribell'],
  featured: ['odette-gown', 'josephine-corset', 'clair-de-lune-veil', 'belle-epoque-underskirt', 'carillon-skirt'],
  header: 'Collections',
  description: 'Pieces drawn from vintage silhouettes — made in limited numbers or to measure.',
};

/** "Archive" is retired: new edition notes for existing pieces. */
export const EDITIONS = {
  'odette-gown': {en: 'Made to order', fr: 'Réalisée sur commande'},
  'clair-de-lune-veil': {en: 'Limited to 20 pieces', fr: 'Limitée à 20 pièces'},
  'josephine-corset': {en: 'Limited to 30 pieces', fr: 'Limitée à 30 pièces'},
  'belle-epoque-underskirt': {en: 'Limited edition', fr: 'Édition limitée'},
  'carillon-skirt': {en: 'Limited to 25 pieces', fr: 'Limitée à 25 pièces'},
};

export const FR = {
  products: {
    'carillon-skirt': {
      title: 'La jupe Carillon',
      body_html:
        '<p>Une jupe coupée en biais, couverte de sequins cousus main qui accrochent la lumière comme une boule à facettes. Elle épouse les hanches et ondule à partir du genou, doublée de soie, avec une fermeture invisible sur le côté.</p><p>Réalisée en petite série pour les nuits qui finissent tard.</p>',
      product_type: 'Jupe',
      care_instructions: 'Nettoyage à sec professionnel uniquement.\nNe pas repasser les sequins ; défroisser à la vapeur, sur l’envers et à distance.\nConserver suspendue, à l’envers.',
      production_time: 'Expédiée sous 1 à 2 semaines',
    },
  },
  optionValues: {XS: 'XS', S: 'S', M: 'M', L: 'L', Silver: 'Argent', Champagne: 'Champagne'},
  collections: {
    'terribelle-of-the-ball': {body_html: '<p>Robes, voiles et corsets pour la cérémonie — inspirés de la haute couture du milieu du siècle, réalisés en séries limitées ou sur mesure.</p>', tagline: 'La collection mariée'},
    'you-can-ring-my-terribell': {body_html: '<p>Des pièces du soir qui accrochent la lumière — sequins, soie et un soupçon de disco.</p>', tagline: 'La collection du soir'},
  },
  campaigns: {
    'terribelle-of-the-ball': {presenter: 'Terribelle Couture présente', credits: ['Sur mesure', 'Édition limitée', 'Finitions main'], cta_label: 'Découvrir la collection'},
    'you-can-ring-my-terribell': {presenter: 'Terribelle Couture présente', credits: ['Sequins', 'Soie', 'À la nuit tombée'], cta_label: 'Découvrir la collection'},
  },
  feed: {header: 'Collections', description: 'Des pièces inspirées de silhouettes d’antan — réalisées en séries limitées ou sur mesure.'},
};
