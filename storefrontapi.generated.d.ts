/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as StorefrontAPI from '@shopify/hydrogen/storefront-api-types';

export type MoneyFragment = Pick<
  StorefrontAPI.MoneyV2,
  'currencyCode' | 'amount'
>;

export type CartLineFragment = Pick<
  StorefrontAPI.CartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<StorefrontAPI.Product, 'handle' | 'title' | 'id' | 'vendor'>;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
  parentRelationship?: StorefrontAPI.Maybe<{
    parent: Pick<StorefrontAPI.CartLine, 'id'>;
  }>;
};

export type CartLineComponentFragment = Pick<
  StorefrontAPI.ComponentizableCartLine,
  'id' | 'quantity'
> & {
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  cost: {
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    amountPerQuantity: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  merchandise: Pick<
    StorefrontAPI.ProductVariant,
    'id' | 'availableForSale' | 'requiresShipping' | 'title'
  > & {
    compareAtPrice?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    image?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
    product: Pick<StorefrontAPI.Product, 'handle' | 'title' | 'id' | 'vendor'>;
    selectedOptions: Array<
      Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
    >;
  };
  lineComponents: Array<
    Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
      attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
      cost: {
        totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
        amountPerQuantity: Pick<
          StorefrontAPI.MoneyV2,
          'currencyCode' | 'amount'
        >;
        compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
        >;
      };
      merchandise: Pick<
        StorefrontAPI.ProductVariant,
        'id' | 'availableForSale' | 'requiresShipping' | 'title'
      > & {
        compareAtPrice?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
        >;
        price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
        image?: StorefrontAPI.Maybe<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
        product: Pick<
          StorefrontAPI.Product,
          'handle' | 'title' | 'id' | 'vendor'
        >;
        selectedOptions: Array<
          Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
        >;
      };
      parentRelationship?: StorefrontAPI.Maybe<{
        parent: Pick<StorefrontAPI.CartLine, 'id'>;
      }>;
    }
  >;
};

export type CartApiQueryFragment = Pick<
  StorefrontAPI.Cart,
  'updatedAt' | 'id' | 'checkoutUrl' | 'totalQuantity' | 'note'
> & {
  appliedGiftCards: Array<
    Pick<StorefrontAPI.AppliedGiftCard, 'id' | 'lastCharacters'> & {
      amountUsed: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    }
  >;
  buyerIdentity: Pick<
    StorefrontAPI.CartBuyerIdentity,
    'countryCode' | 'email' | 'phone'
  > & {
    customer?: StorefrontAPI.Maybe<
      Pick<
        StorefrontAPI.Customer,
        'id' | 'email' | 'firstName' | 'lastName' | 'displayName'
      >
    >;
  };
  lines: {
    nodes: Array<
      | (Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'requiresShipping' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          };
          parentRelationship?: StorefrontAPI.Maybe<{
            parent: Pick<StorefrontAPI.CartLine, 'id'>;
          }>;
        })
      | (Pick<StorefrontAPI.ComponentizableCartLine, 'id' | 'quantity'> & {
          attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
          cost: {
            totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            amountPerQuantity: Pick<
              StorefrontAPI.MoneyV2,
              'currencyCode' | 'amount'
            >;
            compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
          };
          merchandise: Pick<
            StorefrontAPI.ProductVariant,
            'id' | 'availableForSale' | 'requiresShipping' | 'title'
          > & {
            compareAtPrice?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
            >;
            price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
            image?: StorefrontAPI.Maybe<
              Pick<
                StorefrontAPI.Image,
                'id' | 'url' | 'altText' | 'width' | 'height'
              >
            >;
            product: Pick<
              StorefrontAPI.Product,
              'handle' | 'title' | 'id' | 'vendor'
            >;
            selectedOptions: Array<
              Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
            >;
          };
          lineComponents: Array<
            Pick<StorefrontAPI.CartLine, 'id' | 'quantity'> & {
              attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
              cost: {
                totalAmount: Pick<
                  StorefrontAPI.MoneyV2,
                  'currencyCode' | 'amount'
                >;
                amountPerQuantity: Pick<
                  StorefrontAPI.MoneyV2,
                  'currencyCode' | 'amount'
                >;
                compareAtAmountPerQuantity?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                >;
              };
              merchandise: Pick<
                StorefrontAPI.ProductVariant,
                'id' | 'availableForSale' | 'requiresShipping' | 'title'
              > & {
                compareAtPrice?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
                >;
                price: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
                image?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'id' | 'url' | 'altText' | 'width' | 'height'
                  >
                >;
                product: Pick<
                  StorefrontAPI.Product,
                  'handle' | 'title' | 'id' | 'vendor'
                >;
                selectedOptions: Array<
                  Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                >;
              };
              parentRelationship?: StorefrontAPI.Maybe<{
                parent: Pick<StorefrontAPI.CartLine, 'id'>;
              }>;
            }
          >;
        })
    >;
  };
  cost: {
    subtotalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalAmount: Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>;
    totalDutyAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
    totalTaxAmount?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.MoneyV2, 'currencyCode' | 'amount'>
    >;
  };
  attributes: Array<Pick<StorefrontAPI.Attribute, 'key' | 'value'>>;
  discountCodes: Array<
    Pick<StorefrontAPI.CartDiscountCode, 'code' | 'applicable'>
  >;
};

export type ShopQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ShopQuery = {
  shop: Pick<StorefrontAPI.Shop, 'id' | 'name' | 'description'> & {
    paymentSettings: Pick<
      StorefrontAPI.PaymentSettings,
      'acceptedCardBrands' | 'supportedDigitalWallets'
    >;
  };
  nav?: StorefrontAPI.Maybe<{
    collections?: StorefrontAPI.Maybe<{
      references?: StorefrontAPI.Maybe<{
        nodes: Array<
          Pick<StorefrontAPI.Collection, 'id' | 'handle' | 'title'> & {
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
            tagline?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            products: {
              nodes: Array<{
                featuredImage?: StorefrontAPI.Maybe<
                  Pick<
                    StorefrontAPI.Image,
                    'url' | 'altText' | 'width' | 'height'
                  >
                >;
              }>;
            };
          }
        >;
      }>;
    }>;
  }>;
  localization: {
    country: Pick<StorefrontAPI.Country, 'isoCode' | 'name'> & {
      currency: Pick<StorefrontAPI.Currency, 'isoCode'>;
    };
    availableCountries: Array<
      Pick<StorefrontAPI.Country, 'isoCode' | 'name'> & {
        currency: Pick<StorefrontAPI.Currency, 'isoCode' | 'symbol'>;
      }
    >;
  };
};

export type ProductCardFragment = Pick<
  StorefrontAPI.Product,
  'id' | 'handle' | 'title' | 'productType' | 'description' | 'availableForSale'
> & {
  options: Array<
    Pick<StorefrontAPI.ProductOption, 'name'> & {
      optionValues: Array<Pick<StorefrontAPI.ProductOptionValue, 'name'>>;
    }
  >;
  bespoke?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  edition?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  priceRange: {
    minVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
    maxVariantPrice: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  };
  images: {
    nodes: Array<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
  };
};

export type VideoMediaFragment = Pick<StorefrontAPI.Video, 'id' | 'alt'> & {
  sources: Array<
    Pick<StorefrontAPI.VideoSource, 'url' | 'mimeType' | 'width' | 'height'>
  >;
  previewImage?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Image, 'url' | 'width' | 'height' | 'altText'>
  >;
};

export type HomeQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type HomeQuery = {
  feed?: StorefrontAPI.Maybe<{
    campaign?: StorefrontAPI.Maybe<{
      reference?: StorefrontAPI.Maybe<{
        presenter?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        title?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        credits?: StorefrontAPI.Maybe<
          Pick<StorefrontAPI.MetaobjectField, 'value'>
        >;
        cta?: StorefrontAPI.Maybe<Pick<StorefrontAPI.MetaobjectField, 'value'>>;
        video?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Video, 'id' | 'alt'> & {
              sources: Array<
                Pick<
                  StorefrontAPI.VideoSource,
                  'url' | 'mimeType' | 'width' | 'height'
                >
              >;
              previewImage?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'width' | 'height' | 'altText'
                >
              >;
            }
          >;
        }>;
        poster?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<{
            image?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Image, 'url' | 'altText' | 'width' | 'height'>
            >;
          }>;
        }>;
        collection?: StorefrontAPI.Maybe<{
          reference?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.Collection, 'handle' | 'title'> & {
              products: {
                nodes: Array<
                  Pick<
                    StorefrontAPI.Product,
                    | 'id'
                    | 'handle'
                    | 'title'
                    | 'productType'
                    | 'description'
                    | 'availableForSale'
                  > & {
                    options: Array<
                      Pick<StorefrontAPI.ProductOption, 'name'> & {
                        optionValues: Array<
                          Pick<StorefrontAPI.ProductOptionValue, 'name'>
                        >;
                      }
                    >;
                    bespoke?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.Metafield, 'value'>
                    >;
                    edition?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.Metafield, 'value'>
                    >;
                    priceRange: {
                      minVariantPrice: Pick<
                        StorefrontAPI.MoneyV2,
                        'amount' | 'currencyCode'
                      >;
                      maxVariantPrice: Pick<
                        StorefrontAPI.MoneyV2,
                        'amount' | 'currencyCode'
                      >;
                    };
                    images: {
                      nodes: Array<
                        Pick<
                          StorefrontAPI.Image,
                          'id' | 'url' | 'altText' | 'width' | 'height'
                        >
                      >;
                    };
                  }
                >;
              };
            }
          >;
        }>;
      }>;
    }>;
    featured?: StorefrontAPI.Maybe<{
      references?: StorefrontAPI.Maybe<{
        nodes: Array<
          Pick<
            StorefrontAPI.Product,
            | 'id'
            | 'handle'
            | 'title'
            | 'productType'
            | 'description'
            | 'availableForSale'
          > & {
            options: Array<
              Pick<StorefrontAPI.ProductOption, 'name'> & {
                optionValues: Array<
                  Pick<StorefrontAPI.ProductOptionValue, 'name'>
                >;
              }
            >;
            bespoke?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            edition?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            priceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
              maxVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            images: {
              nodes: Array<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
            };
          }
        >;
      }>;
    }>;
  }>;
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'handle'
        | 'title'
        | 'productType'
        | 'description'
        | 'availableForSale'
      > & {
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name'> & {
            optionValues: Array<Pick<StorefrontAPI.ProductOptionValue, 'name'>>;
          }
        >;
        bespoke?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        edition?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
      }
    >;
  };
};

export type PageQueryVariables = StorefrontAPI.Exact<{
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
}>;

export type PageQuery = {
  page?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Page, 'handle' | 'id' | 'title' | 'body'> & {
      seo?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Seo, 'description' | 'title'>
      >;
    }
  >;
};

export type PolicyFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'body' | 'handle' | 'id' | 'title' | 'url'
>;

export type PolicyQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  privacyPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  refundPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  shippingPolicy: StorefrontAPI.Scalars['Boolean']['input'];
  termsOfService: StorefrontAPI.Scalars['Boolean']['input'];
}>;

export type PolicyQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'body' | 'handle' | 'id' | 'title' | 'url'>
    >;
  };
};

export type PolicyItemFragment = Pick<
  StorefrontAPI.ShopPolicy,
  'id' | 'title' | 'handle'
>;

export type PoliciesQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type PoliciesQuery = {
  shop: {
    privacyPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    shippingPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    termsOfService?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    refundPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicy, 'id' | 'title' | 'handle'>
    >;
    subscriptionPolicy?: StorefrontAPI.Maybe<
      Pick<StorefrontAPI.ShopPolicyWithDefault, 'id' | 'title' | 'handle'>
    >;
  };
};

export type ProductVariantFragment = Pick<
  StorefrontAPI.ProductVariant,
  'availableForSale' | 'id' | 'sku' | 'title'
> & {
  compareAtPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
  image?: StorefrontAPI.Maybe<
    {__typename: 'Image'} & Pick<
      StorefrontAPI.Image,
      'id' | 'url' | 'altText' | 'width' | 'height'
    >
  >;
  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
  product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
  selectedOptions: Array<Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>>;
  unitPrice?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
  >;
};

export type ProductFragment = Pick<
  StorefrontAPI.Product,
  | 'id'
  | 'title'
  | 'vendor'
  | 'handle'
  | 'productType'
  | 'descriptionHtml'
  | 'description'
  | 'encodedVariantExistence'
  | 'encodedVariantAvailability'
> & {
  images: {
    nodes: Array<
      Pick<StorefrontAPI.Image, 'id' | 'url' | 'altText' | 'width' | 'height'>
    >;
  };
  bespoke?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  sizeType?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  composition?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  care?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  measurementFields?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Metafield, 'value'>
  >;
  productionTime?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  edition?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
  options: Array<
    Pick<StorefrontAPI.ProductOption, 'name'> & {
      optionValues: Array<
        Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
          firstSelectableVariant?: StorefrontAPI.Maybe<
            Pick<
              StorefrontAPI.ProductVariant,
              'availableForSale' | 'id' | 'sku' | 'title'
            > & {
              compareAtPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
              image?: StorefrontAPI.Maybe<
                {__typename: 'Image'} & Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
              price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
              product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
              selectedOptions: Array<
                Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
              >;
              unitPrice?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
              >;
            }
          >;
          swatch?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
              image?: StorefrontAPI.Maybe<{
                previewImage?: StorefrontAPI.Maybe<
                  Pick<StorefrontAPI.Image, 'url'>
                >;
              }>;
            }
          >;
        }
      >;
    }
  >;
  selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.ProductVariant,
      'availableForSale' | 'id' | 'sku' | 'title'
    > & {
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      image?: StorefrontAPI.Maybe<
        {__typename: 'Image'} & Pick<
          StorefrontAPI.Image,
          'id' | 'url' | 'altText' | 'width' | 'height'
        >
      >;
      price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
      selectedOptions: Array<
        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
      >;
      unitPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
    }
  >;
  adjacentVariants: Array<
    Pick<
      StorefrontAPI.ProductVariant,
      'availableForSale' | 'id' | 'sku' | 'title'
    > & {
      compareAtPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
      image?: StorefrontAPI.Maybe<
        {__typename: 'Image'} & Pick<
          StorefrontAPI.Image,
          'id' | 'url' | 'altText' | 'width' | 'height'
        >
      >;
      price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
      product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
      selectedOptions: Array<
        Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
      >;
      unitPrice?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
      >;
    }
  >;
  seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
};

export type ProductQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  handle: StorefrontAPI.Scalars['String']['input'];
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
  selectedOptions:
    | Array<StorefrontAPI.SelectedOptionInput>
    | StorefrontAPI.SelectedOptionInput;
}>;

export type ProductQuery = {
  product?: StorefrontAPI.Maybe<
    Pick<
      StorefrontAPI.Product,
      | 'id'
      | 'title'
      | 'vendor'
      | 'handle'
      | 'productType'
      | 'descriptionHtml'
      | 'description'
      | 'encodedVariantExistence'
      | 'encodedVariantAvailability'
    > & {
      images: {
        nodes: Array<
          Pick<
            StorefrontAPI.Image,
            'id' | 'url' | 'altText' | 'width' | 'height'
          >
        >;
      };
      bespoke?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      sizeType?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      composition?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      care?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      measurementFields?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      productionTime?: StorefrontAPI.Maybe<
        Pick<StorefrontAPI.Metafield, 'value'>
      >;
      edition?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      options: Array<
        Pick<StorefrontAPI.ProductOption, 'name'> & {
          optionValues: Array<
            Pick<StorefrontAPI.ProductOptionValue, 'name'> & {
              firstSelectableVariant?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.ProductVariant,
                  'availableForSale' | 'id' | 'sku' | 'title'
                > & {
                  compareAtPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                  image?: StorefrontAPI.Maybe<
                    {__typename: 'Image'} & Pick<
                      StorefrontAPI.Image,
                      'id' | 'url' | 'altText' | 'width' | 'height'
                    >
                  >;
                  price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
                  product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
                  selectedOptions: Array<
                    Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
                  >;
                  unitPrice?: StorefrontAPI.Maybe<
                    Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
                  >;
                }
              >;
              swatch?: StorefrontAPI.Maybe<
                Pick<StorefrontAPI.ProductOptionValueSwatch, 'color'> & {
                  image?: StorefrontAPI.Maybe<{
                    previewImage?: StorefrontAPI.Maybe<
                      Pick<StorefrontAPI.Image, 'url'>
                    >;
                  }>;
                }
              >;
            }
          >;
        }
      >;
      selectedOrFirstAvailableVariant?: StorefrontAPI.Maybe<
        Pick<
          StorefrontAPI.ProductVariant,
          'availableForSale' | 'id' | 'sku' | 'title'
        > & {
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          image?: StorefrontAPI.Maybe<
            {__typename: 'Image'} & Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
          unitPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }
      >;
      adjacentVariants: Array<
        Pick<
          StorefrontAPI.ProductVariant,
          'availableForSale' | 'id' | 'sku' | 'title'
        > & {
          compareAtPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
          image?: StorefrontAPI.Maybe<
            {__typename: 'Image'} & Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
          price: Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>;
          product: Pick<StorefrontAPI.Product, 'title' | 'handle'>;
          selectedOptions: Array<
            Pick<StorefrontAPI.SelectedOption, 'name' | 'value'>
          >;
          unitPrice?: StorefrontAPI.Maybe<
            Pick<StorefrontAPI.MoneyV2, 'amount' | 'currencyCode'>
          >;
        }
      >;
      seo: Pick<StorefrontAPI.Seo, 'description' | 'title'>;
    }
  >;
};

export type ShopCollectionQueryVariables = StorefrontAPI.Exact<{
  handle: StorefrontAPI.Scalars['String']['input'];
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ShopCollectionQuery = {
  collection?: StorefrontAPI.Maybe<
    Pick<StorefrontAPI.Collection, 'handle' | 'title' | 'description'> & {
      tagline?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
      videos?: StorefrontAPI.Maybe<{
        references?: StorefrontAPI.Maybe<{
          nodes: Array<
            Pick<StorefrontAPI.Video, 'id' | 'alt'> & {
              sources: Array<
                Pick<
                  StorefrontAPI.VideoSource,
                  'url' | 'mimeType' | 'width' | 'height'
                >
              >;
              previewImage?: StorefrontAPI.Maybe<
                Pick<
                  StorefrontAPI.Image,
                  'url' | 'width' | 'height' | 'altText'
                >
              >;
            }
          >;
        }>;
      }>;
      products: {
        nodes: Array<
          Pick<
            StorefrontAPI.Product,
            | 'id'
            | 'handle'
            | 'title'
            | 'productType'
            | 'description'
            | 'availableForSale'
          > & {
            options: Array<
              Pick<StorefrontAPI.ProductOption, 'name'> & {
                optionValues: Array<
                  Pick<StorefrontAPI.ProductOptionValue, 'name'>
                >;
              }
            >;
            bespoke?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            edition?: StorefrontAPI.Maybe<
              Pick<StorefrontAPI.Metafield, 'value'>
            >;
            priceRange: {
              minVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
              maxVariantPrice: Pick<
                StorefrontAPI.MoneyV2,
                'amount' | 'currencyCode'
              >;
            };
            images: {
              nodes: Array<
                Pick<
                  StorefrontAPI.Image,
                  'id' | 'url' | 'altText' | 'width' | 'height'
                >
              >;
            };
          }
        >;
      };
    }
  >;
};

export type ShopAllQueryVariables = StorefrontAPI.Exact<{
  country?: StorefrontAPI.InputMaybe<StorefrontAPI.CountryCode>;
  language?: StorefrontAPI.InputMaybe<StorefrontAPI.LanguageCode>;
}>;

export type ShopAllQuery = {
  products: {
    nodes: Array<
      Pick<
        StorefrontAPI.Product,
        | 'id'
        | 'handle'
        | 'title'
        | 'productType'
        | 'description'
        | 'availableForSale'
      > & {
        options: Array<
          Pick<StorefrontAPI.ProductOption, 'name'> & {
            optionValues: Array<Pick<StorefrontAPI.ProductOptionValue, 'name'>>;
          }
        >;
        bespoke?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        edition?: StorefrontAPI.Maybe<Pick<StorefrontAPI.Metafield, 'value'>>;
        priceRange: {
          minVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
          maxVariantPrice: Pick<
            StorefrontAPI.MoneyV2,
            'amount' | 'currencyCode'
          >;
        };
        images: {
          nodes: Array<
            Pick<
              StorefrontAPI.Image,
              'id' | 'url' | 'altText' | 'width' | 'height'
            >
          >;
        };
      }
    >;
  };
};

interface GeneratedQueryTypes {
  '#graphql\n  query Shop($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    shop {\n      id\n      name\n      description\n      paymentSettings {\n        acceptedCardBrands\n        supportedDigitalWallets\n      }\n    }\n    nav: metaobject(handle: {type: "product_feed", handle: "main"}) {\n      collections: field(key: "collections") {\n        references(first: 20) {\n          nodes {\n            ... on Collection {\n              id\n              handle\n              title\n              image {\n                url\n                altText\n                width\n                height\n              }\n              tagline: metafield(namespace: "custom", key: "tagline") {\n                value\n              }\n              products(first: 1) {\n                nodes {\n                  featuredImage {\n                    url\n                    altText\n                    width\n                    height\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n    localization {\n      country {\n        isoCode\n        name\n        currency {\n          isoCode\n        }\n      }\n      availableCountries {\n        isoCode\n        name\n        currency {\n          isoCode\n          symbol\n        }\n      }\n    }\n  }\n': {
    return: ShopQuery;
    variables: ShopQueryVariables;
  };
  '#graphql\n  query Home($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    feed: metaobject(handle: {type: "product_feed", handle: "main"}) {\n      campaign: field(key: "campaign") {\n        reference {\n          ... on Metaobject {\n            presenter: field(key: "presenter") { value }\n            title: field(key: "title") { value }\n            credits: field(key: "credits") { value }\n            cta: field(key: "cta_label") { value }\n            video: field(key: "video") {\n              reference {\n                ...VideoMedia\n              }\n            }\n            poster: field(key: "poster") {\n              reference {\n                ... on MediaImage {\n                  image { url altText width height }\n                }\n              }\n            }\n            collection: field(key: "collection") {\n              reference {\n                ... on Collection {\n                  handle\n                  title\n                  products(first: 6) {\n                    nodes {\n                      ...ProductCard\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n      featured: field(key: "featured_products") {\n        references(first: 6) {\n          nodes {\n            ...ProductCard\n          }\n        }\n      }\n    }\n    products(first: 12, sortKey: CREATED_AT, reverse: true) {\n      nodes {\n        ...ProductCard\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    handle\n    title\n    productType\n    description\n    availableForSale\n    options {\n      name\n      optionValues {\n        name\n      }\n    }\n    bespoke: metafield(namespace: "custom", key: "bespoke") {\n      value\n    }\n    edition: metafield(namespace: "custom", key: "edition") {\n      value\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    images(first: 2) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n  }\n\n  #graphql\n  fragment VideoMedia on Video {\n    id\n    alt\n    sources {\n      url\n      mimeType\n      width\n      height\n    }\n    previewImage {\n      url\n      width\n      height\n      altText\n    }\n  }\n\n': {
    return: HomeQuery;
    variables: HomeQueryVariables;
  };
  '#graphql\n  query Page(\n    $language: LanguageCode,\n    $country: CountryCode,\n    $handle: String!\n  )\n  @inContext(language: $language, country: $country) {\n    page(handle: $handle) {\n      handle\n      id\n      title\n      body\n      seo {\n        description\n        title\n      }\n    }\n  }\n': {
    return: PageQuery;
    variables: PageQueryVariables;
  };
  '#graphql\n  fragment Policy on ShopPolicy {\n    body\n    handle\n    id\n    title\n    url\n  }\n  query Policy(\n    $country: CountryCode\n    $language: LanguageCode\n    $privacyPolicy: Boolean!\n    $refundPolicy: Boolean!\n    $shippingPolicy: Boolean!\n    $termsOfService: Boolean!\n  ) @inContext(language: $language, country: $country) {\n    shop {\n      privacyPolicy @include(if: $privacyPolicy) {\n        ...Policy\n      }\n      shippingPolicy @include(if: $shippingPolicy) {\n        ...Policy\n      }\n      termsOfService @include(if: $termsOfService) {\n        ...Policy\n      }\n      refundPolicy @include(if: $refundPolicy) {\n        ...Policy\n      }\n    }\n  }\n': {
    return: PolicyQuery;
    variables: PolicyQueryVariables;
  };
  '#graphql\n  fragment PolicyItem on ShopPolicy {\n    id\n    title\n    handle\n  }\n  query Policies ($country: CountryCode, $language: LanguageCode)\n    @inContext(country: $country, language: $language) {\n    shop {\n      privacyPolicy {\n        ...PolicyItem\n      }\n      shippingPolicy {\n        ...PolicyItem\n      }\n      termsOfService {\n        ...PolicyItem\n      }\n      refundPolicy {\n        ...PolicyItem\n      }\n      subscriptionPolicy {\n        id\n        title\n        handle\n      }\n    }\n  }\n': {
    return: PoliciesQuery;
    variables: PoliciesQueryVariables;
  };
  '#graphql\n  query Product(\n    $country: CountryCode\n    $handle: String!\n    $language: LanguageCode\n    $selectedOptions: [SelectedOptionInput!]!\n  ) @inContext(country: $country, language: $language) {\n    product(handle: $handle) {\n      ...Product\n    }\n  }\n  #graphql\n  fragment Product on Product {\n    id\n    title\n    vendor\n    handle\n    productType\n    descriptionHtml\n    description\n    encodedVariantExistence\n    encodedVariantAvailability\n    images(first: 12) {\n      nodes { id url altText width height }\n    }\n    bespoke: metafield(namespace: "custom", key: "bespoke") { value }\n    sizeType: metafield(namespace: "custom", key: "size_type") { value }\n    composition: metafield(namespace: "custom", key: "composition") { value }\n    care: metafield(namespace: "custom", key: "care_instructions") { value }\n    measurementFields: metafield(namespace: "custom", key: "measurement_fields") { value }\n    productionTime: metafield(namespace: "custom", key: "production_time") { value }\n    edition: metafield(namespace: "custom", key: "edition") { value }\n    options {\n      name\n      optionValues {\n        name\n        firstSelectableVariant { ...ProductVariant }\n        swatch {\n          color\n          image { previewImage { url } }\n        }\n      }\n    }\n    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {\n      ...ProductVariant\n    }\n    adjacentVariants(selectedOptions: $selectedOptions) {\n      ...ProductVariant\n    }\n    seo { description title }\n  }\n  #graphql\n  fragment ProductVariant on ProductVariant {\n    availableForSale\n    compareAtPrice { amount currencyCode }\n    id\n    image { __typename id url altText width height }\n    price { amount currencyCode }\n    product { title handle }\n    selectedOptions { name value }\n    sku\n    title\n    unitPrice { amount currencyCode }\n  }\n\n\n': {
    return: ProductQuery;
    variables: ProductQueryVariables;
  };
  '#graphql\n  query ShopCollection($handle: String!, $country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    collection(handle: $handle) {\n      handle\n      title\n      description\n      tagline: metafield(namespace: "custom", key: "tagline") { value }\n      videos: metafield(namespace: "custom", key: "promo_videos") {\n        references(first: 20) {\n          nodes {\n            ...VideoMedia\n          }\n        }\n      }\n      products(first: 250) {\n        nodes { ...ProductCard }\n      }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    handle\n    title\n    productType\n    description\n    availableForSale\n    options {\n      name\n      optionValues {\n        name\n      }\n    }\n    bespoke: metafield(namespace: "custom", key: "bespoke") {\n      value\n    }\n    edition: metafield(namespace: "custom", key: "edition") {\n      value\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    images(first: 2) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n  }\n\n  #graphql\n  fragment VideoMedia on Video {\n    id\n    alt\n    sources {\n      url\n      mimeType\n      width\n      height\n    }\n    previewImage {\n      url\n      width\n      height\n      altText\n    }\n  }\n\n': {
    return: ShopCollectionQuery;
    variables: ShopCollectionQueryVariables;
  };
  '#graphql\n  query ShopAll($country: CountryCode, $language: LanguageCode)\n  @inContext(country: $country, language: $language) {\n    products(first: 250, sortKey: CREATED_AT, reverse: true) {\n      nodes { ...ProductCard }\n    }\n  }\n  #graphql\n  fragment ProductCard on Product {\n    id\n    handle\n    title\n    productType\n    description\n    availableForSale\n    options {\n      name\n      optionValues {\n        name\n      }\n    }\n    bespoke: metafield(namespace: "custom", key: "bespoke") {\n      value\n    }\n    edition: metafield(namespace: "custom", key: "edition") {\n      value\n    }\n    priceRange {\n      minVariantPrice {\n        amount\n        currencyCode\n      }\n      maxVariantPrice {\n        amount\n        currencyCode\n      }\n    }\n    images(first: 2) {\n      nodes {\n        id\n        url\n        altText\n        width\n        height\n      }\n    }\n  }\n\n': {
    return: ShopAllQuery;
    variables: ShopAllQueryVariables;
  };
}

interface GeneratedMutationTypes {}

declare module '@shopify/hydrogen' {
  interface StorefrontQueries extends GeneratedQueryTypes {}
  interface StorefrontMutations extends GeneratedMutationTypes {}
}
