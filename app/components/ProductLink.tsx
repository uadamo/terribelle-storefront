import {Link, useLocation, useNavigate} from 'react-router';
import {useLocalePath} from '~/lib/i18n';

/**
 * Link to a product. The href is the real product page (shareable, works
 * without JavaScript, opens in a new tab with cmd/ctrl-click); a plain click
 * opens the piece in the shopping overlay instead (?product=<handle>), so the
 * browser's Back button returns to exactly where the visitor was.
 */
export function ProductLink({
  handle,
  className,
  children,
  ...rest
}: {
  handle: string;
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const to = useLocalePath();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Link
      to={to(`/products/${handle}`)}
      className={className}
      prefetch="intent"
      onClick={(e) => {
        rest.onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        const params = new URLSearchParams(location.search);
        params.set('product', handle);
        void navigate({pathname: location.pathname, search: `?${params}`}, {preventScrollReset: true, state: {overlay: true}});
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
