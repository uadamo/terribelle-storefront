import {redirect} from 'react-router';
import type {Route} from './+types/localization';
import {COUNTRY_COOKIE, DEFAULT_LANG, isLang, localizePath} from '~/lib/i18n';

/** POST target of <LocalizationForm>. */
export async function action({request, context}: Route.ActionArgs) {
  const form = await request.formData();
  const language = String(form.get('language') ?? DEFAULT_LANG).toLowerCase();
  const country = String(form.get('country') ?? '').toUpperCase();
  const rawRedirect = String(form.get('redirectTo') ?? '/');
  // Only allow same-site relative redirects.
  const redirectTo = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/';

  const headers = new Headers();
  if (/^[A-Z]{2}$/.test(country)) {
    headers.append(
      'Set-Cookie',
      `${COUNTRY_COOKIE}=${country}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`,
    );
    // Keep the cart's currency/market in sync with the chosen country.
    const cartId = context.cart.getCartId();
    if (cartId) {
      await context.cart
        .updateBuyerIdentity({countryCode: country as never})
        .catch(() => null);
    }
  }

  const [path, query = ''] = redirectTo.split('?');
  const target = localizePath(path, isLang(language) ? language : DEFAULT_LANG);
  return redirect(query ? `${target}?${query}` : target, {headers});
}

export function loader() {
  return redirect('/');
}
