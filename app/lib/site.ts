/**
 * Site-wide settings. Placeholders are marked TODO — replace before launch.
 */
export const SITE = {
  name: 'Terribelle',
  legalName: 'Terribelle Couture',
  email: 'terribelle@gmail.com',
  // TODO: confirm the TikTok handle.
  tiktok: 'https://www.tiktok.com/@terribelle',
  url: 'https://terribelle.com',
  // TODO: replace with the carriers enabled in Shopify → Settings → Shipping.
  shippingPartners: ['DHL Express', 'UPS', 'FedEx'],
  // Shown if the Storefront API doesn't report payment methods.
  fallbackPaymentMethods: ['Visa', 'Mastercard', 'American Express', 'Apple Pay', 'Google Pay', 'PayPal', 'Shop Pay'],
};

/**
 * Measurement catalogue for the made-to-measure questionnaire. Products choose
 * which ones to ask for via the `custom.measurement_fields` metafield.
 * Ranges are in centimetres and only catch typos — tweak freely.
 */
export const MEASUREMENTS: Record<string, {min: number; max: number}> = {
  bust: {min: 60, max: 170},
  underbust: {min: 55, max: 160},
  waist: {min: 45, max: 160},
  high_hip: {min: 55, max: 170},
  hip: {min: 60, max: 180},
  shoulder_width: {min: 25, max: 60},
  nape_to_waist: {min: 30, max: 60},
  hollow_to_hem: {min: 100, max: 190},
  height: {min: 130, max: 210},
};

export const CM_PER_INCH = 2.54;

/** Cart line attribute keys (shown in checkout, the order and confirmation email). */
export const ATTR = {
  madeToMeasure: 'Made to measure',
  units: 'Units',
  notes: 'Atelier notes',
  /** Hidden from the storefront cart display (prefix "_"), kept on the order. */
  consent: '_No-return consent',
};
