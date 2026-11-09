import {redirect} from 'react-router';
import type {Route} from './+types/($locale).collections._index';
import {stripLocale} from '~/lib/i18n';

export function loader({request}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const prefix = url.pathname.slice(0, url.pathname.length - stripLocale(url.pathname).length);
  return redirect(`${prefix}/products`, 301);
}
