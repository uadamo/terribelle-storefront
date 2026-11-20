import {useEffect, useRef} from 'react';
import {Link, useFetcher, useLocation, useNavigate, useSearchParams} from 'react-router';
import type {loader as productLoader} from '~/routes/($locale).products.$handle';
import {ProductDetail} from './ProductDetail';
import {useLocalePath, useT} from '~/lib/i18n';

/**
 * Product shown over the current page when the URL has ?product=<handle>.
 * Data comes from the product page's own loader (fetcher), so the overlay and
 * the full page always match. Closing uses history (Back) when the overlay was
 * opened by a click, so shoppers never lose their place.
 */
export function ProductOverlay() {
  const [params] = useSearchParams();
  const handle = params.get('product');
  const location = useLocation();
  const navigate = useNavigate();
  const to = useLocalePath();
  const t = useT();
  const fetcher = useFetcher<typeof productLoader>();
  const ref = useRef<HTMLDialogElement>(null);

  // Everything except ?product= is passed through (variant options like Size=M).
  const rest = new URLSearchParams(params);
  rest.delete('product');
  const query = rest.toString();

  useEffect(() => {
    if (handle) void fetcher.load(`${to(`/products/${handle}`)}${query ? `?${query}` : ''}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle, query]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (handle && !d.open) {
      d.showModal();
      document.documentElement.classList.add('has-dialog');
    } else if (!handle && d.open) {
      d.close();
    }
    if (!handle) document.documentElement.classList.remove('has-dialog');
  }, [handle]);

  function close() {
    if ((location.state as {overlay?: boolean} | null)?.overlay) {
      void navigate(-1);
      return;
    }
    const next = new URLSearchParams(params);
    next.delete('product');
    for (const o of fetcher.data?.product.options ?? []) next.delete(o.name);
    void navigate({search: next.toString() ? `?${next}` : ''}, {replace: true, preventScrollReset: true});
  }

  const data = fetcher.data?.product.handle === handle ? fetcher.data : null;

  return (
    // Backdrop click closes; Esc and the close button are the keyboard equivalents.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      className="overlay"
      aria-labelledby={data ? 'product-title' : undefined}
      aria-label={data ? undefined : t('overlay.loading')}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <div className="overlay__panel">
        <div className="overlay__bar">
          {handle && (
            <Link to={to(`/products/${handle}`)} className="text-button overlay__full" reloadDocument={false}>
              {t('overlay.fullPage')}
            </Link>
          )}
          <button type="button" className="icon-button glass" onClick={close} aria-label={t('a11y.close')}>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
              <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
        {handle && data ? (
          <ProductDetail data={data} variant="overlay" />
        ) : (
          handle && (
            <p className="overlay__loading" role="status">
              {t('overlay.loading')}
            </p>
          )
        )}
      </div>
    </dialog>
  );
}
