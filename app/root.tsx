import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  Link,
} from 'react-router';
import type {Route} from './+types/root';
import favicon from '~/assets/favicon.svg';
import {SHOP_QUERY} from '~/lib/fragments';
import {stripLocale, translate, useLocale, localizePath} from '~/lib/i18n';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from './components/PageLayout';

export type RootLoader = typeof loader;

/**
 * Avoid re-fetching root data on every navigation, but do re-fetch after
 * mutations (add to cart…) and when the language prefix changes.
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  if (formMethod && formMethod !== 'GET') return true;
  if (currentUrl.toString() === nextUrl.toString()) return true;
  const prefix = (u: URL) => u.pathname.length - stripLocale(u.pathname).length;
  const lang = (u: URL) => u.pathname.slice(0, prefix(u));
  return lang(currentUrl) !== lang(nextUrl);
};

export function links() {
  return [
    {rel: 'preconnect', href: 'https://cdn.shopify.com'},
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

export async function loader({context}: Route.LoaderArgs) {
  const {storefront, env, cart} = context;
  const locale = storefront.i18n as ReturnType<typeof useLocale>;

  const {shop, localization} = await storefront.query(SHOP_QUERY, {
    cache: storefront.CacheLong(),
  });

  return {
    locale,
    cart: cart.get(),
    shopInfo: shop,
    localization,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      // Shopify's cookie banner. Enable it in Settings → Customer privacy once
      // you go live (required for EU visitors if you use analytics/marketing cookies).
      withPrivacyBanner: true,
      country: locale.country,
      language: locale.language,
    },
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root');
  const lang = data?.locale.lang ?? 'en';

  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#F7F5F2" />
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body>
        <a className="skip-link" href="#main">
          {translate(lang, 'a11y.skip')}
        </a>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider cart={data.cart} shop={data.shop} consent={data.consent}>
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const data = useRouteLoaderData<RootLoader>('root');
  const lang = data?.locale.lang ?? 'en';
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const status = isRouteErrorResponse(error) ? error.status : 500;
  if (!notFound) console.error(error);

  return (
    <main id="main" className="error-page">
      <p className="eyebrow">{status}</p>
      <h1 className="display-md">
        {notFound ? translate(lang, 'error.notFound') : translate(lang, 'error.title')}
      </h1>
      <Link className="text-link" to={localizePath('/', lang)}>
        {translate(lang, 'error.back')}
      </Link>
    </main>
  );
}
