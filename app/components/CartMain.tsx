import {Link, useRouteLoaderData} from 'react-router';
import {CartForm, Image, Money, useOptimisticCart, type OptimisticCartLine} from '@shopify/hydrogen';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import type {RootLoader} from '~/root';
import {useLocale, useLocalePath, useT} from '~/lib/i18n';
import {LocalizationForm} from './LocalizationForm';

type CartLine = OptimisticCartLine<CartApiQueryFragment>;

export function CartMain({cart: original}: {cart: CartApiQueryFragment | null}) {
  const cart = useOptimisticCart(original);
  const t = useT();
  const to = useLocalePath();
  const lines = cart?.lines?.nodes ?? [];
  const hasItems = (cart?.totalQuantity ?? 0) > 0;

  return (
    <div className="cart">
      <header className="cart__head">
        <h1 className="display-xl">{t('cart.title')}</h1>
        <nav aria-label={t('cart.steps')}>
          <ol className="steps">
            {(['cart.step1', 'cart.step2', 'cart.step3', 'cart.step4'] as const).map((k, i) => (
              <li key={k} aria-current={i === 0 ? 'step' : undefined}>
                <span className="steps__n" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {t(k)}
              </li>
            ))}
          </ol>
        </nav>
      </header>

      {!hasItems ? (
        <div className="cart__empty">
          <p className="lede">{t('cart.empty')}</p>
          <Link to={to('/products')} className="text-link text-link--arrow" viewTransition>
            {t('cart.continue')}
          </Link>
        </div>
      ) : (
        <div className="cart__layout">
          <ul className="cart__lines">
            {lines.map((line) => (
              <CartLineItem key={line.id} line={line} />
            ))}
          </ul>
          {original && <CartSummary cart={original} />}
        </div>
      )}
    </div>
  );
}

function CartLineItem({line}: {line: CartLine}) {
  const t = useT();
  const to = useLocalePath();
  const {merchandise, quantity, attributes, isOptimistic} = line;
  const {product, image, selectedOptions} = merchandise;
  const options = selectedOptions.filter((o) => o.value !== 'Default Title');
  const shown = attributes.filter((a) => !a.key.startsWith('_') && a.value);
  const measurements = shown.filter((a) => /\((cm|in)\)$/.test(a.key));
  const other = shown.filter((a) => !measurements.includes(a));
  const title = product.title;

  return (
    <li className={`line${isOptimistic ? ' is-pending' : ''}`}>
      <Link to={to(`/products/${product.handle}`)} className="line__media zoom" tabIndex={-1} aria-hidden="true">
        {image && <Image data={image} alt="" aspectRatio="4/5" width={180} loading="lazy" />}
      </Link>
      <div className="line__body">
        <h2 className="line__title">
          <Link to={to(`/products/${product.handle}`)} viewTransition>
            {title}
          </Link>
        </h2>
        {options.length > 0 && (
          <dl className="line__options">
            {options.map((o) => (
              <div key={o.name}>
                <dt>{o.name}</dt>
                <dd>{o.value}</dd>
              </div>
            ))}
            {other.map((a) => (
              <div key={a.key}>
                <dt>{a.key}</dt>
                <dd>{a.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {measurements.length > 0 && (
          <details className="line__measurements">
            <summary>{t('cart.measurements')}</summary>
            <dl>
              {measurements.map((a) => (
                <div key={a.key}>
                  <dt>{a.key}</dt>
                  <dd>{a.value}</dd>
                </div>
              ))}
            </dl>
          </details>
        )}
        <div className="line__actions">
          <div className="qty" role="group" aria-label={`${t('cart.quantity')}: ${title}`}>
            <UpdateButton lineId={line.id} quantity={Math.max(0, quantity - 1)} disabled={quantity <= 1 || !!isOptimistic} label={t('cart.decrease', {title})}>
              −
            </UpdateButton>
            <span className="qty__value" aria-live="polite">
              <span className="sr-only">{t('cart.quantity')}: </span>
              {quantity}
            </span>
            <UpdateButton lineId={line.id} quantity={quantity + 1} disabled={!!isOptimistic} label={t('cart.increase', {title})}>
              +
            </UpdateButton>
          </div>
          <CartForm route={to('/cart')} action={CartForm.ACTIONS.LinesRemove} inputs={{lineIds: [line.id]}}>
            <button type="submit" className="text-button" disabled={!!isOptimistic} aria-label={t('cart.removeItem', {title})}>
              {t('cart.remove')}
            </button>
          </CartForm>
        </div>
      </div>
      <p className="line__price">
        <Money data={line.cost.totalAmount} as="span" withoutTrailingZeros />
      </p>
    </li>
  );
}

function UpdateButton({
  lineId,
  quantity,
  disabled,
  label,
  children,
}: {
  lineId: string;
  quantity: number;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const to = useLocalePath();
  return (
    <CartForm route={to('/cart')} action={CartForm.ACTIONS.LinesUpdate} inputs={{lines: [{id: lineId, quantity}]}}>
      <button type="submit" className="qty__btn" disabled={disabled} aria-label={label}>
        <span aria-hidden="true">{children}</span>
      </button>
    </CartForm>
  );
}

function CartSummary({
  cart,
}: {
  cart: CartApiQueryFragment;
}) {
  const t = useT();
  const to = useLocalePath();
  const root = useRouteLoaderData<RootLoader>('root');
  const {country} = useLocale();
  const codes = cart.discountCodes?.filter((d) => d.applicable).map((d) => d.code) ?? [];

  return (
    <aside className="summary" aria-labelledby="summary-title">
      <h2 id="summary-title" className="summary__title">
        {t('cart.summary')}
      </h2>
      <dl className="summary__rows">
        <div>
          <dt>{t('cart.subtotal')}</dt>
          <dd>{cart.cost?.subtotalAmount && <Money data={cart.cost.subtotalAmount} as="span" withoutTrailingZeros />}</dd>
        </div>
        <div>
          <dt>{t('cart.shippingTaxes')}</dt>
          <dd>{t('cart.calculatedAtCheckout')}</dd>
        </div>
      </dl>

      {root?.localization && (
        <div className="summary__country">
          <LocalizationForm localization={root.localization} showLanguage={false} compact key={country} />
        </div>
      )}

      <CartForm route={to('/cart')} action={CartForm.ACTIONS.DiscountCodesUpdate} inputs={{discountCodes: codes}}>
        <div className="field field--inline summary__discount">
          <label htmlFor="discount-code">{t('cart.discount')}</label>
          <input id="discount-code" type="text" name="discountCode" autoComplete="off" />
          <button type="submit" className="text-button">
            {t('cart.apply')}
          </button>
        </div>
      </CartForm>
      {codes.length > 0 && (
        <ul className="chips">
          {codes.map((code) => (
            <li key={code} className="chip">
              {code}
              <CartForm route={to('/cart')} action={CartForm.ACTIONS.DiscountCodesUpdate} inputs={{discountCodes: codes.filter((c) => c !== code)}}>
                <button type="submit" className="chip__remove" aria-label={t('cart.removeDiscount', {code})}>
                  ×
                </button>
              </CartForm>
            </li>
          ))}
        </ul>
      )}

      {cart.checkoutUrl && (
        <a href={cart.checkoutUrl} className="button button--block">
          {t('cart.checkout')}
        </a>
      )}
      <p className="summary__note">{t('cart.checkoutNote')}</p>
    </aside>
  );
}
