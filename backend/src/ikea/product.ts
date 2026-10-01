import type { UpstreamPriceParts, UpstreamProduct } from "./schema.ts";

export type ProductImage = { url: string; alt: string };

/** What the frontend renders: the swipe card uses the first block, the product view all of it. */
export type Product = {
  id: string;
  name: string;
  typeName: string;
  designText: string | null;
  imageUrl: string;
  imageAlt: string;
  contextImageUrl: string | null;
  url: string;
  price: {
    amount: number;
    currency: string;
    formatted: string;
    /** Set when IKEA shows a reduction, e.g. { label: "Tidigare lägsta pris", formatted: "10 340:-" }. */
    previous: { label: string; formatted: string } | null;
  } | null;
  rating: { value: number; count: number } | null;

  /** Main image first, then context, detail and measurement shots. */
  images: ProductImage[];
  measurement: string | null;
  badge: string | null;
  colors: { name: string; hex: string | null }[];
  /** Top-level category first, e.g. ["Dekoration & inredning", "Prydnadssaker"]. */
  categories: string[];
  variantCount: number;
};

export const toProduct = (upstream: UpstreamProduct): Product => {
  const imageAlt = upstream.mainImageAlt ?? `${upstream.name} ${upstream.typeName}`;
  const salesPrice = upstream.salesPrice;

  return {
    id: upstream.id,
    name: upstream.name,
    typeName: upstream.typeName,
    designText: upstream.validDesignText || null,
    imageUrl: upstream.mainImageUrl,
    imageAlt,
    contextImageUrl: upstream.contextualImageUrl ?? null,
    url: upstream.pipUrl,
    price: salesPrice
      ? {
          amount: salesPrice.numeral,
          currency: salesPrice.currencyCode,
          formatted: formatPrice(salesPrice.current),
          previous:
            salesPrice.previous && salesPrice.prevPriceLabel
              ? { label: salesPrice.prevPriceLabel, formatted: formatPrice(salesPrice.previous) }
              : null,
        }
      : null,
    rating:
      upstream.ratingValue !== undefined && upstream.ratingCount
        ? { value: upstream.ratingValue, count: upstream.ratingCount }
        : null,

    images: galleryOf(upstream, imageAlt),
    measurement: upstream.itemMeasureReferenceText || null,
    badge: upstream.badge?.text || null,
    colors: upstream.colors.map(({ name, hex }) => ({ name, hex: hex ? `#${hex}` : null })),
    categories: upstream.categoryPath.map(({ name }) => name),
    variantCount: upstream.gprDescription?.numberOfVariants ?? 0,
  };
};

/** The full gallery, guaranteed to start with the main image and never repeat one. */
const galleryOf = (upstream: UpstreamProduct, mainAlt: string): ProductImage[] => {
  const seen = new Set<string>();
  return [{ url: upstream.mainImageUrl, altText: mainAlt }, ...upstream.allProductImage].flatMap(({ url, altText }) => {
    if (seen.has(url)) return [];
    seen.add(url);
    return [{ url, alt: altText || mainAlt }];
  });
};

/** IKEA already localises price parts per market ("449:-", "€29.99"), so we only join them. */
const formatPrice = ({ prefix, wholeNumber, separator, decimals, suffix }: UpstreamPriceParts): string =>
  `${prefix}${wholeNumber}${decimals ? separator + decimals : ""}${suffix}`.trim();
