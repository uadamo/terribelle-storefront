import {startTransition, useEffect, useState} from 'react';
import {ParallaxProvider} from 'react-scroll-parallax';
import type {CartApiQueryFragment, ShopQuery} from 'storefrontapi.generated';
import {Header} from './Header';
import {Footer} from './Footer';
import {UIProvider} from './UIProvider';
import {ProductOverlay} from './ProductOverlay';
import type {NavCollection} from './CollectionsMenu';

export function PageLayout({
  cart,
  children,
  shopInfo,
  localization,
  nav,
}: {
  cart: Promise<CartApiQueryFragment | null>;
  children?: React.ReactNode;
  shopInfo: ShopQuery['shop'];
  localization: ShopQuery['localization'];
  nav: ShopQuery['nav'];
  [key: string]: unknown;
}) {
  // Parallax off for visitors who ask their device for reduced motion.
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) startTransition(() => setReduced(true));
  }, []);

  return (
    <ParallaxProvider isDisabled={reduced}>
    <UIProvider>
      <Header cart={cart} collections={(nav?.collections?.references?.nodes ?? []).filter((n): n is NavCollection => 'handle' in n)} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer shop={shopInfo} localization={localization} />
      <ProductOverlay />
    </UIProvider>
    </ParallaxProvider>
  );
}
