import {redirect} from 'react-router';
import type {Route} from './+types/($locale).collections.$handle';
import {stripLocale} from '~/lib/i18n';

/** Collections live in the product feed: /collections/bridal → /products?collection=bridal */
export function loader({params, request}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const prefix = url.pathname.slice(0, url.pathname.length - stripLocale(url.pathname).length);
  const target = params.handle === 'all' ? '' : `?collection=${params.handle}`;
  return redirect(`${prefix}/products${target}`, 301);
}
