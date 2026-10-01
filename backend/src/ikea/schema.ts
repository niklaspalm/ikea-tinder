import { z } from "zod";

const priceParts = z.object({
  prefix: z.string(),
  wholeNumber: z.string(),
  separator: z.string(),
  decimals: z.string(),
  suffix: z.string(),
});

/**
 * Only the parts of IKEA's search response we consume. Zod strips everything
 * else, so upstream additions never leak into our API.
 *
 * Core fields must be valid or the product is skipped. Supplementary fields use
 * `.catch()`: if IKEA sends something odd there, we lose that detail, not the product.
 */
export const upstreamProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  typeName: z.string(),
  validDesignText: z.string().optional(),
  mainImageUrl: z.url(),
  mainImageAlt: z.string().optional(),
  contextualImageUrl: z.url().optional(),
  pipUrl: z.url(),
  ratingValue: z.number().optional(),
  ratingCount: z.number().optional(),
  salesPrice: z
    .object({
      currencyCode: z.string(),
      numeral: z.number(),
      current: priceParts,
      previous: priceParts.optional().catch(undefined),
      prevPriceLabel: z.string().optional().catch(undefined),
    })
    .optional(),
  itemMeasureReferenceText: z.string().optional().catch(undefined),
  badge: z.object({ text: z.string() }).optional().catch(undefined),
  colors: z.array(z.object({ name: z.string(), hex: z.string().optional() })).catch([]),
  categoryPath: z.array(z.object({ name: z.string() })).catch([]),
  gprDescription: z.object({ numberOfVariants: z.number() }).optional().catch(undefined),
  allProductImage: z.array(z.object({ url: z.url(), altText: z.string().optional() })).catch([]),
});

export type UpstreamProduct = z.infer<typeof upstreamProductSchema>;
export type UpstreamPriceParts = z.infer<typeof priceParts>;

/** Items stay `unknown` here so one malformed product can be skipped instead of failing the whole page. */
export const searchResponseSchema = z.object({
  results: z.array(
    z.object({
      component: z.string(),
      items: z.array(z.unknown()).default([]),
    }),
  ),
});

export const productItemSchema = z.object({
  type: z.literal("PRODUCT"),
  product: upstreamProductSchema,
});
