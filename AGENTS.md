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
2. In `.env`: `PUBLIC_STORE_DOMAIN="http://localhost:8787"` and `PUBLIC_STOREFRONT_API_TOKEN="00000000000000000000000000000000"`.
3. `npm run dev`.

On a normal machine, skip the relay and use the real domain and token.

## Architecture

- **Routes** (`app/routes`, all under the optional `($locale)` prefix — `/fr/...`):
  `/` home (film-poster campaign hero + magazine spreads) · `/products` (`?collection=<handle>`, filters `type`, `fit`, `color`, `available`)
  · `/products/:handle` (full page) · `/cart` · `/legal/:handle` (privacy | orders | accessibility).
- **Product overlay**: any page with `?product=<handle>` shows the piece in an overlay (`ProductOverlay`, data from the
  product route loader via fetcher). Use `<ProductLink>` for product links — real href, overlay on plain click.
  `/localization` (POST) sets the country cookie and language.
- **Data model** (see `scripts/seed/README.md`): product metafields `custom.bespoke`, `size_type`, `composition` (JSON),
  `care_instructions`, `measurement_fields`, `production_time`, `edition`; metaobject `product_feed` (handle `main`).
  HS code / origin / weight live on variant inventory items (internal only).
- **Campaigns**: metaobject `campaign` (presenter, title, credits, collection, video, poster, cta_label);
  the home hero shows `product_feed.campaign`. Collection metafield `custom.promo_videos` = silent video strips between
  product rows; `custom.tagline` under the title. Menu collections = `product_feed.collections` (full-page menu, `CollectionsMenu`). Seed: `npm run seed:campaigns`.
- **Media treatment**: `.grain` on photo wrappers (film grain that fades on hover); `<AutoVideo>` for silent videos
  (pauses off-screen, still image for reduced motion, pause button for WCAG 2.2.2). Buttons are borderless, transparent frosted glass (`.button`, `.glass`); no vertical rules; type is Imbue + Questrial only.
- **Made to measure**: measurements are cart line attributes (`"Bust (cm)": "88"`), visible in checkout and the order.
- **i18n**: `app/lib/i18n.ts` + `app/i18n/{en,fr}.ts`. Use `useT()` for strings and `useLocalePath()` for links.
- **Site settings** (email, TikTok, carriers, measurement ranges): `app/lib/site.ts`. Legal drafts: `app/content/legal.tsx`.
- **Accessibility target**: WCAG 2.2 AA. Respect `prefers-reduced-motion`; dark sections need `data-theme="dark"`
  so the header text inverts.
