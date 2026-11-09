import {Outlet} from 'react-router';
import type {Route} from './+types/($locale)';
import {DEFAULT_LANG, isLang} from '~/lib/i18n';

/**
 * Validates the optional language prefix. "/fr/…" is valid; an unknown first
 * segment that isn't a route (e.g. "/xx/products") is a 404. "/en/…" redirects
 * to the unprefixed URL so each page has one canonical address.
 */
export async function loader({params, request}: Route.LoaderArgs) {
  const {locale} = params;
  if (!locale) return null;
  if (locale.toLowerCase() === DEFAULT_LANG) {
    const url = new URL(request.url);
    url.pathname = url.pathname.slice(DEFAULT_LANG.length + 1) || '/';
    throw new Response(null, {status: 301, headers: {Location: url.toString()}});
  }
  if (!isLang(locale)) throw new Response(null, {status: 404});
  return null;
}

export default function LocaleLayout() {
  return <Outlet />;
}
