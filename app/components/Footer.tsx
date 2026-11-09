import {Link} from 'react-router';
import type {ShopQuery} from 'storefrontapi.generated';
import {SITE} from '~/lib/site';
import {useLocalePath, useT} from '~/lib/i18n';
import {useUI} from './UIProvider';
import {Reveal} from './Reveal';
import {ShareMenu} from './ShareMenu';
import {LocalizationForm} from './LocalizationForm';

const PAYMENT_LABELS: Record<string, string> = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMERICAN_EXPRESS: 'American Express',
  DISCOVER: 'Discover',
  DINERS_CLUB: 'Diners Club',
  JCB: 'JCB',
  APPLE_PAY: 'Apple Pay',
  GOOGLE_PAY: 'Google Pay',
  ANDROID_PAY: 'Google Pay',
  SHOPIFY_PAY: 'Shop Pay',
};

export function Footer({
  shop,
  localization,
}: {
  shop: ShopQuery['shop'];
  localization: ShopQuery['localization'];
}) {
  const t = useT();
  const to = useLocalePath();
  const {openContact, openLegal} = useUI();

  const fromShop = [
    ...shop.paymentSettings.acceptedCardBrands,
    ...shop.paymentSettings.supportedDigitalWallets,
  ].map((code) => PAYMENT_LABELS[code] ?? code);
  const payments = [...new Set(fromShop.length ? fromShop : SITE.fallbackPaymentMethods)];

  return (
    <footer className="site-footer" data-theme="dark">
      <Reveal className="site-footer__grid">
        <section className="site-footer__col" aria-labelledby="ft-contact">
          <h2 id="ft-contact" className="footer-title">
            {t('nav.contact')}
          </h2>
          <ul>
            <li>
              <button
                type="button"
                className="footer-link"
                aria-haspopup="dialog"
                onClick={() => openContact()}
              >
                {t('footer.contact')}
              </button>
            </li>
            <li>
              <a className="footer-link" href={SITE.tiktok} target="_blank" rel="noopener noreferrer">
                {t('footer.follow')}
                <span className="sr-only"> {t('a11y.newTab')}</span>
              </a>
            </li>
            <li>
              <ShareMenu />
            </li>
          </ul>
        </section>

        <section className="site-footer__col" aria-labelledby="ft-pay">
          <h2 id="ft-pay" className="footer-title">
            {t('footer.payments')}
          </h2>
          <ul className="chips">
            {payments.map((p) => (
              <li key={p} className="chip">
                {p}
              </li>
            ))}
          </ul>
          <p className="footer-note">{t('footer.paymentsNote')}</p>
        </section>

        <section className="site-footer__col" aria-labelledby="ft-ship">
          <h2 id="ft-ship" className="footer-title">
            {t('footer.shippingPartners')}
          </h2>
          <ul className="chips">
            {SITE.shippingPartners.map((p) => (
              <li key={p} className="chip">
                {p}
              </li>
            ))}
          </ul>
          <p className="footer-note">{t('footer.shippingNote')}</p>
        </section>

        <nav className="site-footer__col" aria-label={t('a11y.footerNav')}>
          <h2 className="footer-title">Terribelle</h2>
          <ul>
            <li>
              <button type="button" className="footer-link" aria-haspopup="dialog" onClick={() => openLegal('privacy')}>
                {t('footer.privacy')}
              </button>
            </li>
            <li>
              <button type="button" className="footer-link" aria-haspopup="dialog" onClick={() => openLegal('orders')}>
                {t('footer.orders')}
              </button>
            </li>
            <li>
              <Link className="footer-link" to={to('/legal/accessibility')}>
                {t('footer.accessibility')}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="site-footer__col site-footer__col--l10n">
          <LocalizationForm localization={localization} />
        </div>
      </Reveal>

      <Reveal className="site-footer__bottom" delay={120}>
        <p className="site-footer__wordmark" aria-hidden="true">
          TERRIBELLE
        </p>
        <p className="footer-note">{t('footer.rights', {year: new Date().getFullYear()})}</p>
      </Reveal>
    </footer>
  );
}
