import {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {ContactDialog} from './ContactDialog';
import {LegalDialog} from './LegalDialog';
import type {LegalHandle} from '~/content/legal';

type UI = {
  openContact: (subject?: string) => void;
  openLegal: (handle: LegalHandle) => void;
  /** Screen-reader (and visual toast) announcement. */
  announce: (message: string) => void;
};

const UIContext = createContext<UI | null>(null);

export function UIProvider({children}: {children: React.ReactNode}) {
  const [contact, setContact] = useState<{open: boolean; subject?: string}>({open: false});
  const [legal, setLegal] = useState<LegalHandle | null>(null);
  const [message, setMessage] = useState('');

  const announce = useCallback((m: string) => {
    setMessage('');
    // Re-set on the next frame so repeated messages are re-announced.
    requestAnimationFrame(() => setMessage(m));
    window.setTimeout(() => setMessage((cur) => (cur === m ? '' : cur)), 5000);
  }, []);

  const value = useMemo<UI>(
    () => ({
      openContact: (subject) => setContact({open: true, subject}),
      openLegal: (handle) => setLegal(handle),
      announce,
    }),
    [announce],
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      <ContactDialog
        open={contact.open}
        subject={contact.subject}
        onClose={() => setContact({open: false})}
      />
      <LegalDialog handle={legal} onClose={() => setLegal(null)} />
      <div className={`toast${message ? ' is-visible' : ''}`} role="status" aria-live="polite">
        {message}
      </div>
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>');
  return ctx;
}
