import {data} from 'react-router';
import type {Route} from './+types/($locale).newsletter';

/**
 * Newsletter sign-up (POST). Creates a Shopify customer with email-marketing
 * consent; they appear in Shopify admin → Customers (subscribed). The password is
 * random and never used — the visitor is not asked to create an account.
 * Turn on double opt-in in Shopify (Settings → Customer privacy / Notifications)
 * so subscribers confirm by email, as recommended for EU visitors.
 *
 * The response is the same whether or not the address was already subscribed,
 * so the form can't be used to discover who is a customer.
 */
export async function action({request, context}: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim().slice(0, 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return data({ok: false, error: 'invalid'}, {status: 400});
  }
  // Simple honeypot against bots (field hidden from people).
  if (form.get('company')) return data({ok: true});

  const password = `Tb-${crypto.randomUUID()}`;
  try {
    const {customerCreate} = await context.storefront.mutate(NEWSLETTER_MUTATION, {
      variables: {input: {email, password, acceptsMarketing: true}},
    });
    const errors = customerCreate?.customerUserErrors ?? [];
    const onlyTaken = errors.every((e) => e.code === 'TAKEN' || e.code === 'CUSTOMER_DISABLED');
    if (errors.length && !onlyTaken) {
      return data({ok: false, error: 'failed'}, {status: 400});
    }
    return data({ok: true});
  } catch {
    return data({ok: false, error: 'failed'}, {status: 500});
  }
}

export function loader() {
  throw new Response(null, {status: 404});
}

const NEWSLETTER_MUTATION = `#graphql
  mutation NewsletterSignup($input: CustomerCreateInput!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        message
      }
    }
  }
` as const;
