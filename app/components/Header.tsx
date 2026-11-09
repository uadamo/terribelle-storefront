import {Suspense, useEffect, useState} from 'react';
import {Await, Link, NavLink, useAsyncValue, useLocation} from 'react-router';
import {useOptimisticCart} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useLocalePath, useT} from '~/lib/i18n';
import {useUI} from './UIProvider';

/**
 * Fixed, background-less navigation. Text is ink by default and fades to cream
 * while the header overlaps a section marked data-theme="dark" (real colours,
 * so contrast is measurable by audit tools — unlike mix-blend-mode).
 */
function useOverDarkSection() {
  const [dark, setDark] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const targets = document.querySelectorAll('[data-theme="dark"]');
    if (!targets.length || typeof IntersectionObserver === 'undefined') {
      setDark(false);
      return;
    }
    const visible = new Set<Element>();
    let io: IntersectionObserver;
    const observe = () => {
      io?.disconnect();
      const headerH = 72;
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) visible.add(e.target);
            else visible.delete(e.target);
          }
          setDark(visible.size > 0);
        },
        // Only the band behind the header counts.
        {rootMargin: `0px 0px -${Math.max(0, window.innerHeight - headerH / 2)}px 0px`},
      );
      targets.forEach((t) => io.observe(t));
    };
    observe();
    window.addEventListener('resize', observe);
    return () => {
      io?.disconnect();
      window.removeEventListener('resize', observe);
    };
  }, [location.pathname, location.search]);
  return dark;
}

export function Header({cart}: {cart: Promise<CartApiQueryFragment | null>}) {
  const t = useT();
  const to = useLocalePath();
  const {openContact} = useUI();
  const overDark = useOverDarkSection();

  return (
    <header className={`site-header${overDark ? ' is-inverted' : ''}`}>
      <Link to={to('/')} className="site-header__logo" aria-label={t('nav.home')} viewTransition>
        TERRIBELLE
      </Link>
      <nav aria-label={t('a11y.mainNav')}>
        <ul className="site-header__nav">
          <li>
            <NavLink to={to('/products')} className="nav-link" prefetch="intent" viewTransition>
              {t('nav.products')}
            </NavLink>
          </li>
          <li>
            <button
              type="button"
              className="nav-link"
              aria-haspopup="dialog"
              onClick={() => openContact()}
            >
              {t('nav.contact')}
            </button>
          </li>
          <li>
            <Suspense fallback={<CartLink count={null} />}>
              <Await resolve={cart}>
                <CartCount />
              </Await>
            </Suspense>
          </li>
        </ul>
      </nav>
    </header>
  );
}

function CartCount() {
  const original = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(original);
  return <CartLink count={cart?.totalQuantity ?? 0} />;
}

function CartLink({count}: {count: number | null}) {
  const t = useT();
  const to = useLocalePath();
  const label = !count
    ? t('nav.cartEmpty')
    : count === 1
      ? t('nav.cartCountOne')
      : t('nav.cartCount', {count});
  return (
    <NavLink to={to('/cart')} className="nav-link cart-link" viewTransition>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" className="cart-link__icon">
        <path
          d="M5 8h14l-1.2 12H6.2L5 8zm4 0V6a3 3 0 016 0v2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
      <span className="cart-link__label">{t('nav.cart')}</span>
      {!!count && (
        <span className="cart-link__count" aria-hidden="true" key={count}>
          <span>{count}</span>
        </span>
      )}
      {/* Visible text ("Cart") starts the accessible name — WCAG 2.5.3. */}
      <span className="sr-only">, {label.replace(/^[^,]*,\s*/, '')}</span>
    </NavLink>
  );
}
