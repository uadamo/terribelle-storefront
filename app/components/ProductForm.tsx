import {useEffect, useId, useRef, useState} from 'react';
import {Link, useFetcher, useNavigate} from 'react-router';
import {CartForm, type MappedProductOptions} from '@shopify/hydrogen';
import type {ProductFragment} from 'storefrontapi.generated';
import {translate, useLocalePath, useT} from '~/lib/i18n';
import type {Dictionary} from '~/i18n/en';
import {ATTR, CM_PER_INCH, MEASUREMENTS} from '~/lib/site';
import {useUI} from './UIProvider';

type Variant = NonNullable<ProductFragment['selectedOrFirstAvailableVariant']>;

/** Fallback swatch colours when the option value has no Shopify swatch. */
const SWATCHES: Record<string, string> = {
  ivory: '#FBF7EC',
  'off-white': '#F2EEE6',
  champagne: '#EAD7B7',
  black: '#0b0b0b',
  white: '#ffffff',
  cream: '#F7F5F2',
};

export function ProductForm({
  productOptions,
  selectedVariant,
  productTitle,
  bespoke,
  measurementFields,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: Variant | null | undefined;
  productTitle: string;
  bespoke: boolean;
  measurementFields: string[];
}) {
  const t = useT();
  const to = useLocalePath();
  const navigate = useNavigate();
  const {announce, openLegal} = useUI();
  const id = useId();
  const fetcher = useFetcher({key: `add-to-cart-${productTitle}`});
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const [units, setUnits] = useState<'cm' | 'in'>('cm');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  const available = !!selectedVariant?.availableForSale;
  const busy = fetcher.state !== 'idle';

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setAdded(true);
      announce(t('product.added'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state, fetcher.data]);

  function range(key: string) {
    const r = MEASUREMENTS[key] ?? {min: 1, max: 300};
    return units === 'cm'
      ? r
      : {min: Math.floor(r.min / CM_PER_INCH), max: Math.ceil(r.max / CM_PER_INCH)};
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedVariant || !available) return;
    const data = new FormData(event.currentTarget);
    const attributes: Array<{key: string; value: string}> = [];
    const next: Record<string, string> = {};

    if (bespoke) {
      for (const key of measurementFields) {
        const label = t(`measure.${key}` as keyof Dictionary);
        const raw = String(data.get(`m-${key}`) ?? '').replace(',', '.').trim();
        const value = Number(raw);
        const {min, max} = range(key);
        if (!raw) next[key] = t('mtm.errorRequired', {field: label.toLowerCase()});
        else if (Number.isNaN(value) || value < min || value > max)
          next[key] = t('mtm.errorRange', {field: label, min, max, unit: units});
        else
          attributes.push({
            // Keys stay in English so the atelier reads them the same way in every order.
            key: `${translate('en', `measure.${key}` as keyof Dictionary)} (${units})`,
            value: String(value),
          });
      }
      if (!data.get('consent')) next.consent = t('mtm.errorConsent');
      setErrors(next);
      if (Object.keys(next).length) {
        requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }
      const notes = String(data.get('notes') ?? '').trim();
      attributes.unshift({key: ATTR.madeToMeasure, value: 'Yes'});
      if (notes) attributes.push({key: ATTR.notes, value: notes.slice(0, 500)});
      attributes.push({key: ATTR.consent, value: 'Accepted'});
    }

    setAdded(false);
    const lines = [{merchandiseId: selectedVariant.id, quantity: 1, attributes, selectedVariant}];
    void fetcher.submit(
      {[CartForm.INPUT_NAME]: JSON.stringify({action: CartForm.ACTIONS.LinesAdd, inputs: {lines}})},
      {method: 'POST', action: to('/cart')},
    );
  }

  const errorCount = Object.keys(errors).length;

  return (
    <form ref={formRef} className="pform" onSubmit={onSubmit} noValidate>
      {productOptions.map((option) => {
        const current = option.optionValues.find((v) => v.selected)?.name;
        if (option.optionValues.length === 1) {
          return (
            <p key={option.name} className="option option--static">
              <span className="option__label">{option.name}</span>
              <span>{option.optionValues[0].name}</span>
            </p>
          );
        }
        const isColor = /colou?r/i.test(option.name);
        return (
          <fieldset key={option.name} className="option">
            <legend className="option__label">
              {option.name}
              <span className="option__current">{current}</span>
            </legend>
            <div className="option__values">
              {option.optionValues.map((value) => {
                const swatch =
                  value.swatch?.color ?? SWATCHES[value.name.toLowerCase()] ?? undefined;
                return (
                  <label
                    key={value.name}
                    className={`choice${value.selected ? ' is-selected' : ''}${
                      !value.available ? ' is-unavailable' : ''
                    }${isColor ? ' choice--color' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`option-${option.name}`}
                      value={value.name}
                      checked={value.selected}
                      disabled={!value.exists}
                      onChange={() =>
                        void navigate(`?${value.variantUriQuery}`, {
                          replace: true,
                          preventScrollReset: true,
                        })
                      }
                    />
                    {isColor && swatch && (
                      <span className="choice__swatch" style={{background: swatch}} aria-hidden="true" />
                    )}
                    <span className="choice__text">{value.name}</span>
                    {!value.available && (
                      <span className="sr-only"> — {t('product.soldOut')}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {bespoke && available && (
        <section className="mtm" aria-labelledby={`${id}-mtm`}>
          <h2 id={`${id}-mtm`} className="mtm__title">
            {t('mtm.title')}
          </h2>
          <p className="mtm__intro">{t('mtm.intro')}</p>

          {errorCount > 0 && (
            <div className="error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
              <p>{t('mtm.errorSummary', {count: errorCount})}</p>
              <ul>
                {Object.entries(errors).map(([key, msg]) => (
                  <li key={key}>
                    <a href={`#${id}-${key}`}>{msg}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <fieldset className="units">
            <legend className="option__label">{t('mtm.units')}</legend>
            {(['cm', 'in'] as const).map((u) => (
              <label key={u} className={`choice${units === u ? ' is-selected' : ''}`}>
                <input type="radio" name="units" value={u} checked={units === u} onChange={() => setUnits(u)} />
                <span className="choice__text">{t(u === 'cm' ? 'mtm.cm' : 'mtm.in')}</span>
              </label>
            ))}
          </fieldset>

          <div className="mtm__grid">
            {measurementFields.map((key) => {
              const label = t(`measure.${key}` as keyof Dictionary);
              const help = t(`measure.${key}.help` as keyof Dictionary);
              const {min, max} = range(key);
              const err = errors[key];
              return (
                <div className="field" key={key}>
                  <label htmlFor={`${id}-${key}`}>
                    {label} <span className="field__unit">({units})</span>
                  </label>
                  <input
                    id={`${id}-${key}`}
                    name={`m-${key}`}
                    inputMode="decimal"
                    autoComplete="off"
                    required
                    aria-invalid={err ? true : undefined}
                    aria-describedby={`${id}-${key}-help${err ? ` ${id}-${key}-err` : ''}`}
                    placeholder={`${min}–${max}`}
                  />
                  <p id={`${id}-${key}-help`} className="field__help">
                    {help}
                  </p>
                  {err && (
                    <p id={`${id}-${key}-err`} className="field__error">
                      {err}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="field">
            <label htmlFor={`${id}-notes`}>{t('mtm.notes')}</label>
            <textarea id={`${id}-notes`} name="notes" rows={3} maxLength={500} aria-describedby={`${id}-notes-help`} />
            <p id={`${id}-notes-help`} className="field__help">
              {t('mtm.notesHelp')}
            </p>
          </div>

          <p className="mtm__privacy">{t('mtm.privacy')}</p>

          <div className="field field--check">
            <input
              type="checkbox"
              id={`${id}-consent`}
              name="consent"
              value="yes"
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? `${id}-consent-err` : undefined}
            />
            <label htmlFor={`${id}-consent`}>{t('mtm.consent')}</label>
            <button type="button" className="text-button field__aside" aria-haspopup="dialog" onClick={() => openLegal('orders')}>
              {t('product.orderPolicy')}
            </button>
            {errors.consent && (
              <p id={`${id}-consent-err`} className="field__error">
                {errors.consent}
              </p>
            )}
          </div>
        </section>
      )}

      <button type="submit" className="button button--block" disabled={!available || busy} aria-disabled={!available || busy}>
        {!selectedVariant ? t('product.unavailable') : !available ? t('product.soldOut') : busy ? t('product.adding') : t('product.addToCart')}
      </button>

      {added && (
        <p className="pform__added">
          <span className="dot" aria-hidden="true" /> {t('product.added')}{' '}
          <Link to={to('/cart')} className="text-link" viewTransition>
            {t('product.viewCart')}
          </Link>
        </p>
      )}
    </form>
  );
}
