import {useEffect, useRef} from 'react';

/**
 * Opens a <dialog> as a *non-modal* panel so the site header stays visible and
 * usable above it, while the rest of the page (main + footer) is made inert —
 * keyboard focus moves only between the header and the panel. Esc closes and
 * focus returns to whatever opened the panel.
 */
export function usePageOverlay(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  const restore = useRef<HTMLElement | null>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const background = [document.querySelector('main'), document.querySelector('.site-footer')].filter(Boolean) as HTMLElement[];

    if (open) {
      if (!d.open) {
        restore.current = document.activeElement as HTMLElement | null;
        d.show();
      }
      background.forEach((el) => el.setAttribute('inert', ''));
      document.documentElement.classList.add('has-overlay');
      requestAnimationFrame(() => {
        const target = d.querySelector<HTMLElement>('[data-autofocus]') ?? d;
        target.focus({preventScroll: true});
      });
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          close.current();
        }
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }

    if (d.open) d.close();
    background.forEach((el) => el.removeAttribute('inert'));
    if (!document.querySelector('dialog.navlay[open], dialog.overlay[open]')) {
      document.documentElement.classList.remove('has-overlay');
    }
    restore.current?.focus?.({preventScroll: true});
    restore.current = null;
  }, [open]);

  return ref;
}
