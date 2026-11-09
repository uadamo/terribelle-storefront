import {Link} from 'react-router';
import {Dialog} from './Dialog';
import {LegalDocument} from './LegalDocument';
import {LEGAL, type LegalHandle} from '~/content/legal';
import {useLocalePath, useT} from '~/lib/i18n';

export function LegalDialog({handle, onClose}: {handle: LegalHandle | null; onClose: () => void}) {
  const t = useT();
  const to = useLocalePath();
  return (
    <Dialog
      open={!!handle}
      onClose={onClose}
      size="lg"
      eyebrow="Terribelle"
      title={handle ? LEGAL[handle].title : ''}
      actions={
        handle && (
          <>
            <button type="button" className="text-button" onClick={() => window.print()}>
              {t('legal.print')}
            </button>
            <Link className="text-button" to={to(`/legal/${handle}`)} onClick={onClose}>
              {t('legal.openPage')}
            </Link>
          </>
        )
      }
    >
      {handle && <LegalDocument handle={handle} headingLevel={3} />}
    </Dialog>
  );
}
