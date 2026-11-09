import {useEffect, useId, useRef} from 'react';
import {useT} from '~/lib/i18n';

/**
 * Accessible modal built on the native <dialog> element: focus is trapped
 * while open, Esc closes it, and focus returns to the trigger on close.
 */
export function Dialog({
  open,
  onClose,
  title,
  eyebrow,
  children,
  size = 'md',
  actions,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  size?: 'md' | 'lg';
  actions?: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const t = useT();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.classList.add('has-dialog');
    } else if (!open && dialog.open) {
      dialog.close();
    }
    if (!open) document.documentElement.classList.remove('has-dialog');
  }, [open]);

  return (
    // Backdrop click is a mouse convenience; Esc and the close button are the keyboard equivalents.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      className={`dialog dialog--${size}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={onClose}
      onClick={(event) => {
        // Click on the backdrop (outside the panel) closes the dialog.
        if (event.target === ref.current) onClose();
      }}
    >
      <div className="dialog__panel">
        <div className="dialog__head">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2 id={titleId} className="dialog__title">
              {title}
            </h2>
          </div>
          <div className="dialog__actions">
            {actions}
            <button
              type="button"
              className="icon-button"
              onClick={onClose}
              aria-label={t('a11y.close')}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
                <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
        </div>
        <div className="dialog__body">{open ? children : null}</div>
      </div>
    </dialog>
  );
}
