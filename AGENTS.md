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
  The product drawer is a modal over everything; the full-page menu is a non-modal panel *below* the header
  (`usePageOverlay`: main/footer inert, Esc closes). Product pages end with "More from the collection"
  (`RelatedRail`, 3 per row, scrolls vertically).
  `/localization` (POST) sets the country cookie and language.
- **Data model** (see `scripts/seed/README.md`): product metafields `custom.bespoke`, `size_type`, `composition` (JSON),
  `care_instructions`, `measurement_fields`, `production_time`, `edition`; metaobject `product_feed` (handle `main`).
  HS code / origin / weight live on variant inventory items (internal only).
- **Campaigns**: metaobject `campaign` (presenter, title, credits, collection, video, poster, cta_label);
  the home page opens with the campaign whose `featured` switch is on (newest wins; fallback `product_feed.campaign`)
  and shows up to 4 pieces of its collection. Collection metafield `custom.promo_videos` = silent video strips between
  product rows; `custom.tagline` under the title. Menu collections = `product_feed.collections` (full-page menu, `CollectionsMenu`). Seed: `npm run seed:campaigns`.
- **Motion**: `ParallaxImage` (react-scroll-parallax, off for reduced motion); decorative Three.js scenes in
  `app/components/three` (lazy-loaded, paused off-screen, single frame for reduced motion): pins/buttons in the
  made-to-measure section, and the brand emblem — procedural belladonna berries + flowers (`belladonnaModels.ts`,
  relief-modelled leaves with vein bump maps) floating as one layer over the first magazine pair (`FloatingBelladonna`).
- **Products grid**: 4 per row on laptops (≥64em), 3 on tablets, 2 on phones (`useColumns`).
- **No skip link** by design; landmarks (header/nav/main) provide bypass (WCAG 2.4.1).
- **Media treatment**: `.grain` on photo wrappers (film grain that fades on hover); `<AutoVideo>` for silent videos
  (pauses off-screen, still image for reduced motion, pause button for WCAG 2.2.2). Buttons are borderless, transparent frosted glass (`.button`, `.glass`); no vertical rules; type is Imbue + Questrial only.
- **Newsletter**: `NewsletterBanner` (home, after 50% scroll, hidden over the footer, dismissal in localStorage)
  posts to `/newsletter`, which creates a Shopify customer with email-marketing consent (same response for
  existing emails). Enable double opt-in in Shopify for EU subscribers.
- **Made to measure**: measurements are cart line attributes (`"Bust (cm)": "88"`), visible in checkout and the order.
- **i18n**: `app/lib/i18n.ts` + `app/i18n/{en,fr}.ts`. Use `useT()` for strings and `useLocalePath()` for links.
- **Site settings** (email, TikTok, carriers, measurement ranges): `app/lib/site.ts`. Legal drafts: `app/content/legal.tsx`.
- **Accessibility target**: WCAG 2.2 AA. Respect `prefers-reduced-motion`; dark sections need `data-theme="dark"`
  so the header text inverts.
