import {useMatches} from 'react-router';
import type {
  CountryCode,
  LanguageCode,
} from '@shopify/hydrogen/storefront-api-types';
import {en, type Dictionary} from '~/i18n/en';
import {fr} from '~/i18n/fr';

/**
 * Languages the interface is translated into. The first one is the default and
 * has no URL prefix; others live under /<code>/… (e.g. /fr/products).
 *
 * Product content (titles, descriptions…) is translated in Shopify admin with the
 * Translate & Adapt app — the Storefront API returns it automatically once that
 * language is published in Settings → Languages; until then it falls back to English.
 *
 * To add a language: create app/i18n/<code>.ts and register it here.
 */
export const LANGUAGES = {
  en: {label: 'English', storefront: 'EN' as LanguageCode, dict: en},
  fr: {label: 'Français', storefront: 'FR' as LanguageCode, dict: fr},
} satisfies Record<string, {label: string; storefront: LanguageCode; dict: Dictionary}>;

export type Lang = keyof typeof LANGUAGES;
export const DEFAULT_LANG: Lang = 'en';
export const COUNTRY_COOKIE = 'tb_country';
/** Country used when nothing is known about the visitor. */
export const DEFAULT_COUNTRY = 'US' as CountryCode;

export type I18nLocale = {
  language: LanguageCode;
  country: CountryCode;
  lang: Lang;
  /** '' for the default language, '/fr' otherwise. */
  pathPrefix: string;
};

export function isLang(value: string | undefined): value is Lang {
  return !!value && Object.hasOwn(LANGUAGES, value.toLowerCase());
}

function readCookie(header: string | null, name: string) {
  const match = header?.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function getLocaleFromRequest(request: Request): I18nLocale {
  const url = new URL(request.url);
  const first = url.pathname.split('/')[1]?.toLowerCase();
  const lang: Lang = isLang(first) ? first : DEFAULT_LANG;

  // Country: explicit choice (cookie) → Oxygen geo header → default.
  const cookieCountry = readCookie(request.headers.get('cookie'), COUNTRY_COOKIE);
  const geoCountry = request.headers.get('oxygen-buyer-country') ?? undefined;
  const country = (
    [cookieCountry, geoCountry].find((c) => c && /^[A-Z]{2}$/.test(c)) ??
    DEFAULT_COUNTRY
  ) as CountryCode;

  return {
    lang,
    language: LANGUAGES[lang].storefront,
    country,
    pathPrefix: lang === DEFAULT_LANG ? '' : `/${lang}`,
  };
}

/** Removes any language prefix from a pathname. */
export function stripLocale(pathname: string) {
  const first = pathname.split('/')[1];
  if (isLang(first) && first !== DEFAULT_LANG) {
    return pathname.slice(first.length + 1) || '/';
  }
  return pathname;
}

export function localizePath(path: string, lang: Lang) {
  const clean = stripLocale(path);
  return lang === DEFAULT_LANG ? clean : `/${lang}${clean === '/' ? '' : clean}`;
}

// --- React helpers --------------------------------------------------------------

export function useLocale(): I18nLocale {
  const [root] = useMatches();
  return (
    (root?.data as {locale?: I18nLocale} | undefined)?.locale ?? {
      lang: DEFAULT_LANG,
      language: 'EN' as LanguageCode,
      country: DEFAULT_COUNTRY,
      pathPrefix: '',
    }
  );
}

type Vars = Record<string, string | number>;

export function translate(lang: Lang, key: keyof Dictionary, vars?: Vars) {
  let str: string = LANGUAGES[lang].dict[key] ?? en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) str = str.replaceAll(`{${k}}`, String(v));
  }
  return str;
}

/** const t = useT(); t('nav.products') */
export function useT() {
  const {lang} = useLocale();
  return (key: keyof Dictionary, vars?: Vars) => translate(lang, key, vars);
}

/** const to = useLocalePath(); <Link to={to('/products')}> */
export function useLocalePath() {
  const {lang} = useLocale();
  return (path: string) => localizePath(path, lang);
}
