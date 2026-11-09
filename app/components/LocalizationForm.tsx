import {useId} from 'react';
import {Form, useLocation} from 'react-router';
import type {ShopQuery} from 'storefrontapi.generated';
import {LANGUAGES, type Lang, useLocale, useT} from '~/lib/i18n';

/**
 * Language + country/currency picker. Posts to /localization, which stores the
 * country in a cookie, updates the cart's buyer country and redirects to the
 * same page in the chosen language. Works without JavaScript.
 */
export function LocalizationForm({
  localization,
  showLanguage = true,
  compact = false,
}: {
  localization: ShopQuery['localization'];
  showLanguage?: boolean;
  compact?: boolean;
}) {
  const t = useT();
  const id = useId();
  const locale = useLocale();
  const location = useLocation();
  const countries = [...localization.availableCountries].sort((a, b) =>
    a.name.localeCompare(b.name, locale.lang),
  );
  // Show the visitor's chosen country even if the shop hasn't enabled it as a market yet.
  const current = countries.find((c) => c.isoCode === locale.country)?.isoCode ?? localization.country.isoCode;

  return (
    <Form method="post" action="/localization" className={`l10n${compact ? ' l10n--compact' : ''}`}>
      <input type="hidden" name="redirectTo" value={location.pathname + location.search} />
      {showLanguage ? (
        <div className="field field--inline">
          <label htmlFor={`${id}-lang`}>{t('footer.language')}</label>
          <select id={`${id}-lang`} name="language" defaultValue={locale.lang}>
            {(Object.keys(LANGUAGES) as Lang[]).map((code) => (
              <option key={code} value={code} lang={code}>
                {LANGUAGES[code].label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input type="hidden" name="language" value={locale.lang} />
      )}
      <div className="field field--inline">
        <label htmlFor={`${id}-country`}>{t('footer.country')}</label>
        <select id={`${id}-country`} name="country" defaultValue={current} key={current}>
          {countries.map((c) => (
            <option key={c.isoCode} value={c.isoCode}>
              {c.name} ({c.currency.isoCode})
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="text-button">
        {t('footer.update')}
      </button>
    </Form>
  );
}
