# Shopify Hydrogen development

This storefront is scaffolded from Shopify's Hydrogen skeleton template. See the README for framework-specific details.

Use the [Shopify AI Toolkit](https://shopify.dev/docs/apps/build/ai-toolkit) for all Shopify API and platform work. If missing, install it in the agent host per that page (or `npx skills add Shopify/shopify-ai-toolkit --list` for skill-compatible hosts).

## Project notes

- Store: `terribelle-ev5cs4ik.myshopify.com` (Shopify development store). Checkout, tax, payments and shipping are handled by Shopify's hosted checkout via the cart's `checkoutUrl` — don't reimplement them.
- Local env: copy `.env.example` to `.env` (gitignored). Never commit tokens.
- Deploys: Shopify Oxygen via the Hydrogen sales channel (GitHub-connected). Non-production deployments are private.

### Developing in a Claude Code cloud session

MiniOxygen (workerd) ignores `HTTPS_PROXY`, so it can't reach the store directly from the cloud sandbox. Instead:

1. `npm run dev:relay` (background) — relays `http://localhost:8787` to the store through the proxy, which also injects the Storefront API token.
2. In `.env`: `PUBLIC_STORE_DOMAIN="http://localhost:8787"` and `PUBLIC_STOREFRONT_API_TOKEN="proxy-injected"`.
3. `npm run dev`.

On a normal machine, skip the relay and use the real domain and token.
