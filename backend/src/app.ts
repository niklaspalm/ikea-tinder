import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod";
import { PRODUCT_CACHE_TTL_MS, type IkeaClient, type IkeaError } from "./ikea/client.ts";
import type { Product } from "./ikea/product.ts";
import type { ImageStore } from "./images.ts";
import { isSupportedMarket, listMarkets, type Market } from "./markets.ts";

export type ApiError = { error: { code: string; message: string } };

/** Body of GET /api/markets/:country/:language/products. */
export type ProductsResponse = { market: Market; count: number; products: Product[] };

const apiError = (code: string, message: string): ApiError => ({ error: { code, message } });

const marketParamsSchema = z.object({
  country: z.string().regex(/^[a-z]{2}$/, "Expected a lowercase ISO 3166 country code, e.g. 'se'"),
  language: z.string().regex(/^[a-z]{2}$/, "Expected a lowercase ISO 639 language code, e.g. 'sv'"),
});

const ikeaErrorResponse = (error: IkeaError): [ApiError, ContentfulStatusCode] => {
  switch (error.kind) {
    case "upstream_unreachable":
      return [apiError(error.kind, "Could not reach IKEA. Try again shortly."), 504];
    case "upstream_status":
      return [apiError(error.kind, `IKEA responded with status ${error.status}.`), 502];
    case "upstream_invalid_response":
      return [apiError(error.kind, "IKEA returned an unexpected response."), 502];
  }
};

const imageParamsSchema = z.object({ file: z.string() });

type AppDeps = { ikea: IkeaClient; images: ImageStore; corsOrigin?: string };

export const createApp = ({ ikea, images, corsOrigin = "*" }: AppDeps) => {
  const markets = listMarkets();

  const withLocalImages = (product: Product): Product => ({
    ...product,
    imageUrl: images.localize(product.imageUrl),
    contextImageUrl: product.contextImageUrl && images.localize(product.contextImageUrl),
    // Gallery images are served locally too, but only downloaded on first request (see prefetch below).
    images: product.images.map((image) => ({ ...image, url: images.localize(image.url) })),
  });

  return new Hono()
    .use("/api/*", cors({ origin: corsOrigin }))
    .get("/api/health", (c) => c.json({ status: "ok" }))
    .get("/api/markets", (c) => {
      c.header("cache-control", "public, max-age=86400");
      return c.json(markets);
    })
    .get(
      "/api/markets/:country/:language/products",
      zValidator("param", marketParamsSchema, (result, c) => {
        if (!result.success) {
          return c.json(apiError("invalid_market", result.error.issues.map((issue) => issue.message).join("; ")), 400);
        }
      }),
      async (c) => {
        const { country, language } = c.req.valid("param");
        if (!isSupportedMarket(country, language)) {
          return c.json(apiError("unknown_market", `IKEA has no '${country}/${language}' market.`), 404);
        }

        const result = await ikea.fetchNewProducts({ country, language });
        if (!result.ok) {
          console.error(`[ikea] ${country}/${language}`, result.error);
          const [body, status] = ikeaErrorResponse(result.error);
          return c.json(body, status);
        }

        const products = result.value.map(withLocalImages);
        // Main images first: they're what the swipe deck shows before anything else.
        images.prefetch([
          ...products.map((product) => product.imageUrl),
          ...products.flatMap((product) => (product.contextImageUrl ? [product.contextImageUrl] : [])),
        ]);

        c.header("cache-control", `public, max-age=${PRODUCT_CACHE_TTL_MS / 1000}`);
        return c.json({ market: { country, language }, count: products.length, products } satisfies ProductsResponse);
      },
    )
    .get("/api/images/:file", zValidator("param", imageParamsSchema), async (c) => {
      const { file } = c.req.valid("param");
      const result = await images.read(file);

      if (!result.ok) {
        if (result.error.kind === "unknown_image") return c.json(apiError("unknown_image", "Image not found."), 404);
        // Degrade gracefully: the card still renders straight from IKEA, and the next request retries the download.
        console.warn(`[images] serving ${file} from IKEA`, result.error);
        return c.redirect(result.error.sourceUrl, 302);
      }

      return c.body(result.value.body, 200, {
        "content-type": result.value.contentType,
        // File names are derived from IKEA's image IDs, so the bytes behind a name never change.
        "cache-control": "public, max-age=31536000, immutable",
      });
    })
    .notFound((c) => c.json(apiError("not_found", "Route not found."), 404))
    .onError((error, c) => {
      console.error("[app] unhandled", error);
      return c.json(apiError("internal_error", "Something went wrong."), 500);
    });
};

/** Exported so a frontend can use Hono's typed RPC client (`hc<AppType>`) for end-to-end types. */
export type AppType = ReturnType<typeof createApp>;
