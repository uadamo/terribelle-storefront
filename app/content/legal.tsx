/**
 * DRAFT legal texts. They are a starting point modelled on common practice for
 * EU-based made-to-order fashion houses — have them reviewed by a lawyer in your
 * country before launch, and fill in every [bracketed] placeholder.
 *
 * Also paste the final versions into Shopify admin → Settings → Policies so
 * they appear in checkout and order emails.
 */
import {SITE} from '~/lib/site';

export type LegalHandle = 'privacy' | 'orders' | 'accessibility';

type LegalDoc = {
  title: string;
  updated: string;
  intro: React.ReactNode;
  sections: Array<{heading: string; body: React.ReactNode}>;
};

const Email = () => <a href={`mailto:${SITE.email}`}>{SITE.email}</a>;

export const LEGAL: Record<LegalHandle, LegalDoc> = {
  privacy: {
    title: 'Privacy policy',
    updated: '2026-11-09',
    intro: (
      <p>
        This policy explains what personal data {SITE.legalName} (“we”) collects when you visit{' '}
        terribelle.com or order from us, why, and the rights you have. We collect as little as we
        need to make and deliver your pieces.
      </p>
    ),
    sections: [
      {
        heading: '1. Who is responsible',
        body: (
          <p>
            The data controller is {SITE.legalName}, [legal form], [registered address], [country],
            registration no. [number], VAT no. [number]. Contact: <Email />.
          </p>
        ),
      },
      {
        heading: '2. What we collect',
        body: (
          <ul>
            <li>
              <strong>Order details</strong> — name, email, phone number, billing and delivery
              address, items ordered and order history.
            </li>
            <li>
              <strong>Measurements</strong> — for made-to-measure pieces only. They are used
              solely to draft and make your garment, are stored with your order, and are never used
              for marketing, profiling or any other purpose, or shared beyond the people making your
              piece. You may ask us to erase them once your order is delivered and any alteration
              period has ended.
            </li>
            <li>
              <strong>Messages</strong> — what you send us by email.
            </li>
            <li>
              <strong>Technical data</strong> — device, browser and approximate location (country),
              used to keep the site secure, show prices in your currency and, only with your
              consent, to understand how the site is used.
            </li>
          </ul>
        ),
      },
      {
        heading: '3. Payments — we never store your card details',
        body: (
          <p>
            Payments are processed by Shopify Payments and the payment providers shown at checkout
            (for example PayPal, Apple Pay, Google Pay or Klarna), which are certified to PCI DSS.
            Your full card number is entered directly into their secure systems; we never see,
            receive or keep it. We only receive confirmation that a payment succeeded and limited
            details such as the card type and last four digits.
          </p>
        ),
      },
      {
        heading: '4. Why we use your data (legal bases)',
        body: (
          <ul>
            <li>To take, make, ship and support your order — performance of a contract (GDPR Art. 6(1)(b)).</li>
            <li>To keep invoices and accounting records required by tax law — legal obligation (Art. 6(1)(c)).</li>
            <li>To prevent fraud and keep the site secure — legitimate interests (Art. 6(1)(f)).</li>
            <li>For newsletters and non-essential cookies — your consent (Art. 6(1)(a)), which you can withdraw at any time.</li>
          </ul>
        ),
      },
      {
        heading: '5. Who we share it with',
        body: (
          <p>
            Only service providers who help us run the shop, under contracts that protect your data:
            Shopify (e-commerce platform and checkout; Shopify International Ltd., Ireland), payment
            providers, and the carrier delivering your order ({SITE.shippingPartners.join(', ')}).
            For deliveries outside the EU, carriers pass the information required by law to customs
            authorities. We never sell your personal data.
          </p>
        ),
      },
      {
        heading: '6. International transfers',
        body: (
          <p>
            Some providers process data outside the European Economic Area, for example in Canada
            (covered by an EU adequacy decision) or the United States (under the EU-U.S. Data
            Privacy Framework or Standard Contractual Clauses).
          </p>
        ),
      },
      {
        heading: '7. How long we keep it',
        body: (
          <p>
            Order and invoice records are kept for as long as tax law requires ([number] years in
            [country]). Measurements are kept only for making your piece and any agreed
            alterations, and are erased on request after that. Marketing data is kept until you
            unsubscribe.
          </p>
        ),
      },
      {
        heading: '8. Cookies',
        body: (
          <p>
            Essential cookies keep your cart, language and country choice working and need no
            consent. Analytics or marketing cookies are only set if you accept them in the cookie
            banner; you can change your choice at any time.
          </p>
        ),
      },
      {
        heading: '9. Your rights',
        body: (
          <>
            <p>
              You can ask to access, correct, delete, restrict or port your data, object to its
              use, and withdraw consent — write to <Email />. We answer within one month. You also
              have the right to complain to your data protection authority ([name of authority in
              your country]).
            </p>
            <p>
              <strong>United States:</strong> residents of states with privacy laws (such as
              California) have similar rights to know, delete and correct their information, and
              to opt out of its sale or sharing — we do not sell or share personal information for
              cross-context advertising. <strong>Canada:</strong> we handle personal information in
              line with PIPEDA and you may request access or correction at the address above.
            </p>
          </>
        ),
      },
      {
        heading: '10. Changes',
        body: <p>We will post any changes on this page and update the date above.</p>,
      },
    ],
  },

  orders: {
    title: 'Order & returns policy',
    updated: '2026-11-09',
    intro: (
      <p>
        Every Terribelle piece is made in small numbers or to measure. Please read this policy
        before ordering — in particular, <strong>made-to-measure (bespoke) pieces cannot be
        returned</strong>.
      </p>
    ),
    sections: [
      {
        heading: '1. Your order',
        body: (
          <p>
            After checkout you receive an email confirming that we have received your order. The
            contract is concluded when we confirm acceptance by email or dispatch your piece.
            Prices are shown in your local currency; the amount charged is the one shown at
            checkout.
          </p>
        ),
      },
      {
        heading: '2. Made-to-measure pieces',
        body: (
          <>
            <p>
              Made-to-measure pieces are cut and sewn to the measurements you provide, only for
              you. Under EU consumer law (Directive 2011/83/EU, Article 16(c)), goods made to the
              consumer’s specifications or clearly personalised are{' '}
              <strong>excluded from the 14-day right of withdrawal</strong>. Bespoke pieces
              therefore cannot be cancelled once production has started, returned or exchanged.
            </p>
            <ul>
              <li>
                You may cancel free of charge within 48 hours of ordering, before your fabric is
                cut. After that, cancellation is no longer possible.
              </li>
              <li>
                Please take your measurements carefully using our guide; we may contact you to
                confirm them before cutting.
              </li>
              <li>
                If the finished piece does not correspond to the measurements you gave us (beyond a
                tolerance of 2 cm), we will alter or remake it at no cost.
              </li>
              <li>Production times are shown on each product page and confirmed by email.</li>
            </ul>
          </>
        ),
      },
      {
        heading: '3. Ready-made pieces — 14-day right of withdrawal',
        body: (
          <>
            <p>
              For pieces in pre-set sizes or one size, you may withdraw from the contract within 14
              days of receiving them, without giving a reason. Email <Email /> with your order
              number and a clear statement that you wish to withdraw (you may use the EU model
              withdrawal form, but it is not required).
            </p>
            <ul>
              <li>Send the piece back within 14 days of telling us, unworn, unaltered, with all tags and in its original packaging.</li>
              <li>Return shipping costs are [paid by you / covered by us].</li>
              <li>
                We refund the full amount, including standard delivery costs, within 14 days of
                receiving your withdrawal notice, using your original payment method. We may wait
                until we have received the piece back.
              </li>
              <li>You are responsible for any loss in value caused by handling beyond what is needed to examine the piece.</li>
            </ul>
          </>
        ),
      },
      {
        heading: '4. Shipping, taxes and import duties',
        body: (
          <p>
            We ship from [country] with tracked, insured express carriers ({SITE.shippingPartners.join(', ')})
            to the United States, Canada and Europe. Shipping costs, taxes and — for orders outside
            the EU — import duties are calculated at checkout from your delivery address. Where
            duties can be prepaid at checkout, nothing more is due on delivery; otherwise the
            carrier may collect them from you. Risk passes to you on delivery.
          </p>
        ),
      },
      {
        heading: '5. Faulty pieces',
        body: (
          <p>
            All pieces — including made-to-measure — are covered by the legal guarantee of
            conformity (two years in the EU). If something is wrong with your piece, contact us
            and we will repair, replace or refund it. Your statutory rights are not affected by
            this policy.
          </p>
        ),
      },
      {
        heading: '6. Contact',
        body: (
          <p>
            {SITE.legalName}, [registered address], [country] — <Email />.
          </p>
        ),
      },
    ],
  },

  accessibility: {
    title: 'Accessibility statement',
    updated: '2026-11-09',
    intro: (
      <p>
        We want everyone to be able to browse and buy from Terribelle. This site is designed to
        meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA — the level required
        by the European Accessibility Act (via EN 301 549), referenced in the United States under
        the ADA, and required in Canada by the AODA and the Accessible Canada Act.
      </p>
    ),
    sections: [
      {
        heading: 'What we do',
        body: (
          <ul>
            <li>Every page works with a keyboard and screen readers, with visible focus and a “skip to content” link.</li>
            <li>Text meets WCAG contrast ratios; the layout reflows to 320 px and supports 200% zoom.</li>
            <li>Animations are subtle, can be paused, and switch off when your device asks for reduced motion.</li>
            <li>Forms have visible labels, clear error messages and do not time out.</li>
            <li>Images have text alternatives and the site is available in English and French.</li>
          </ul>
        ),
      },
      {
        heading: 'Checkout',
        body: (
          <p>
            Payment and delivery details are entered in Shopify’s checkout, which Shopify develops
            to WCAG 2.2 AA.
          </p>
        ),
      },
      {
        heading: 'Known limitations',
        body: (
          <p>
            Product photography is currently placeholder illustration. If you find anything that
            is hard to use, please tell us.
          </p>
        ),
      },
      {
        heading: 'Feedback and enforcement',
        body: (
          <p>
            Write to <Email /> — we reply within five working days and can take orders by email if
            you prefer. If you are not satisfied with our response, you can contact [the market
            surveillance authority for the European Accessibility Act in your country].
          </p>
        ),
      },
    ],
  },
};
