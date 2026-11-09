import type {CartApiQueryFragment, ShopQuery} from 'storefrontapi.generated';
import {Header} from './Header';
import {Footer} from './Footer';
import {UIProvider} from './UIProvider';

export function PageLayout({
  cart,
  children,
  shopInfo,
  localization,
}: {
  cart: Promise<CartApiQueryFragment | null>;
  children?: React.ReactNode;
  shopInfo: ShopQuery['shop'];
  localization: ShopQuery['localization'];
  [key: string]: unknown;
}) {
  return (
    <UIProvider>
      <Header cart={cart} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer shop={shopInfo} localization={localization} />
    </UIProvider>
  );
}
