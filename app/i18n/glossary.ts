import type {Lang} from '~/lib/i18n';

/**
 * Translations for terms stored as data (composition parts and fibres).
 * Unknown terms are shown as entered in Shopify.
 */
const GLOSSARY: Partial<Record<Lang, Record<string, string>>> = {
  fr: {
    Silk: 'Soie',
    Cotton: 'Coton',
    Polyamide: 'Polyamide',
    Polyester: 'Polyester',
    Viscose: 'Viscose',
    Linen: 'Lin',
    Wool: 'Laine',
    Elastane: 'Élasthanne',
    Shell: 'Tissu principal',
    Lining: 'Doublure',
    Interlining: 'Entoilage',
    'Inner corset': 'Corset intérieur',
    Veil: 'Voile',
    'Lace edging': 'Bordure en dentelle',
    Tulle: 'Tulle',
    'Waistband and tapes': 'Ceinture et rubans',
  },
};

export function gloss(lang: Lang, term: string) {
  return GLOSSARY[lang]?.[term] ?? term;
}
