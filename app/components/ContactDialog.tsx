import {useId, useRef, useState} from 'react';
import {Dialog} from './Dialog';
import {SITE} from '~/lib/site';
import {useT} from '~/lib/i18n';

/**
 * "Contact" pop-up: collects a message and opens the visitor's email app with
 * it pre-addressed to the atelier (mailto:). No data is sent to a server.
 */
export function ContactDialog({
  open,
  onClose,
  subject,
}: {
  open: boolean;
  onClose: () => void;
  subject?: string;
}) {
  const t = useT();
  return (
    <Dialog open={open} onClose={onClose} title={t('contact.title')} eyebrow="Terribelle">
      <ContactForm defaultSubject={subject ?? t('contact.defaultSubject')} />
    </Dialog>
  );
}

function ContactForm({defaultSubject}: {defaultSubject: string}) {
  const t = useT();
  const id = useId();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const fields = [
    {name: 'name', label: t('contact.name'), type: 'text', autoComplete: 'name'},
    {name: 'email', label: t('contact.email'), type: 'email', autoComplete: 'email'},
    {name: 'subject', label: t('contact.subject'), type: 'text', autoComplete: 'off', defaultValue: defaultSubject},
  ];

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: Record<string, string> = {};
    for (const f of [...fields, {name: 'message', label: t('contact.message')}]) {
      if (!String(data.get(f.name) ?? '').trim()) {
        next[f.name] = t('contact.errorRequired', {field: f.label.toLowerCase()});
      }
    }
    setErrors(next);
    const firstInvalid = Object.keys(next)[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }
    const body = `${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`;
    const href = `mailto:${SITE.email}?subject=${encodeURIComponent(String(data.get('subject')))}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setStatus(t('contact.copied'));
    } catch {
      setStatus(SITE.email);
    }
  }

  return (
    <form ref={formRef} className="form" noValidate onSubmit={onSubmit}>
      <p className="form__intro">{t('contact.intro')}</p>
      <p className="form__to">
        <a className="text-link" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
        <button type="button" className="text-button" onClick={() => void copy()}>
          {t('contact.copy')}
        </button>
        <span role="status" className="form__status">
          {status}
        </span>
      </p>
      {fields.map((f) => (
        <div key={f.name} className="field">
          <label htmlFor={`${id}-${f.name}`}>{f.label}</label>
          <input
            id={`${id}-${f.name}`}
            name={f.name}
            type={f.type}
            autoComplete={f.autoComplete}
            defaultValue={f.defaultValue}
            aria-invalid={errors[f.name] ? true : undefined}
            aria-describedby={errors[f.name] ? `${id}-${f.name}-err` : undefined}
            required
          />
          {errors[f.name] && (
            <p id={`${id}-${f.name}-err`} className="field__error">
              {errors[f.name]}
            </p>
          )}
        </div>
      ))}
      <div className="field">
        <label htmlFor={`${id}-message`}>{t('contact.message')}</label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={5}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? `${id}-message-err` : undefined}
          required
        />
        {errors.message && (
          <p id={`${id}-message-err`} className="field__error">
            {errors.message}
          </p>
        )}
      </div>
      <button type="submit" className="button" aria-describedby={`${id}-send-help`}>
        {t('contact.send')}
      </button>
      <p id={`${id}-send-help`} className="field__help">
        {t('contact.sendHelp', {email: SITE.email})}
      </p>
    </form>
  );
}
