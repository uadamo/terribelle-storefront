import {LEGAL, type LegalHandle} from '~/content/legal';
import {useLocale, useT} from '~/lib/i18n';

/** Renders a legal draft. The texts are English-only for now (lang="en"). */
export function LegalDocument({handle, headingLevel = 2}: {handle: LegalHandle; headingLevel?: 2 | 3}) {
  const doc = LEGAL[handle];
  const t = useT();
  const {lang} = useLocale();
  const H = `h${headingLevel}` as 'h2' | 'h3';
  const date = new Intl.DateTimeFormat(lang, {dateStyle: 'long'}).format(new Date(doc.updated));
  return (
    <article className="legal" lang="en">
      <p className="legal__meta" lang={lang}>
        {t('legal.updated', {date})} · <span className="legal__draft">{t('legal.draft')}</span>
      </p>
      <div className="legal__intro">{doc.intro}</div>
      {doc.sections.map((s) => (
        <section key={s.heading} className="legal__section">
          <H>{s.heading}</H>
          {s.body}
        </section>
      ))}
    </article>
  );
}
