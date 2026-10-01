import { z } from "zod";
import { createApp } from "./app.ts";
import { createIkeaClient } from "./ikea/client.ts";
import { createImageStore } from "./images.ts";

const envSchema = z.object({
  CORS_ORIGIN: z.string().default("*"),
  IMAGE_DIR: z.string().default("data/images"),
});

/** Wires the API with real dependencies. Shared by the standalone server and the SvelteKit host. */
export const createApiFromEnv = (env: Record<string, string | undefined> = process.env) => {
  const { CORS_ORIGIN, IMAGE_DIR } = envSchema.parse(env);
  return createApp({
    ikea: createIkeaClient(),
    images: createImageStore({ dir: IMAGE_DIR }),
    corsOrigin: CORS_ORIGIN,
  });
};

export type { ApiError, AppType, ProductsResponse } from "./app.ts";
export type { Product } from "./ikea/product.ts";
export type { Market, MarketCountry, MarketLanguage } from "./markets.ts";

// Used by tooling such as frontend/scripts/generate-product-fixture.ts.
export { createIkeaClient } from "./ikea/client.ts";
export { isSupportedMarket } from "./markets.ts";
