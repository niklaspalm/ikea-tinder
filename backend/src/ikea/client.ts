import type { Market } from "../markets.ts";
import { err, ok, type Result } from "../result.ts";
import { toProduct, type Product } from "./product.ts";
import { productItemSchema, searchResponseSchema } from "./schema.ts";

const SEARCH_BASE_URL = "https://sik.search.blue.cdtapps.com";
const SEARCH_VERSION = "20250507";
const PRODUCT_LIMIT = 200;
const REQUEST_TIMEOUT_MS = 10_000;

export type IkeaError =
  | { kind: "upstream_unreachable"; message: string }
  | { kind: "upstream_status"; status: number }
  | { kind: "upstream_invalid_response"; message: string };

export type IkeaClient = {
  fetchNewProducts: (market: Market) => Promise<Result<Product[], IkeaError>>;
};

type ClientOptions = {
  fetch?: typeof globalThis.fetch;
  /** New products change rarely; caching spares IKEA and makes every swipe session start instantly. */
  cacheTtlMs?: number;
  now?: () => number;
};

const buildSearchBody = () => ({
  searchParameters: { input: "new_product", type: "SPECIAL" },
  isUserLoggedIn: false,
  isB2B: false,
  components: [
    {
      component: "PRIMARY_AREA",
      columns: 4,
      types: { main: "PRODUCT", breakouts: ["PLANNER", "LOGIN_REMINDER", "MATTRESS_WARRANTY"] },
      filterConfig: { "subcategories-style": "tree-navigation", "max-num-filters": 6 },
      sort: "RELEVANCE",
      window: { offset: 0, size: PRODUCT_LIMIT },
      allVariants: false,
    },
  ],
});

export const createIkeaClient = ({
  fetch = globalThis.fetch,
  cacheTtlMs = 10 * 60_000,
  now = Date.now,
}: ClientOptions = {}): IkeaClient => {
  const cache = new Map<string, { expiresAt: number; products: Product[] }>();

  const requestNewProducts = async ({ country, language }: Market): Promise<Result<Product[], IkeaError>> => {
    const url = new URL(`/${country}/${language}/search`, SEARCH_BASE_URL);
    url.searchParams.set("c", "listaf");
    url.searchParams.set("v", SEARCH_VERSION);

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(buildSearchBody()),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (cause) {
      return err({ kind: "upstream_unreachable", message: cause instanceof Error ? cause.message : String(cause) });
    }

    if (!response.ok) return err({ kind: "upstream_status", status: response.status });

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      return err({ kind: "upstream_invalid_response", message: "Response body is not JSON" });
    }

    const parsed = searchResponseSchema.safeParse(json);
    if (!parsed.success) return err({ kind: "upstream_invalid_response", message: parsed.error.message });

    const items = parsed.data.results.find((result) => result.component === "PRIMARY_AREA")?.items ?? [];
    const products = items.flatMap((item) => {
      const product = productItemSchema.safeParse(item);
      return product.success ? [toProduct(product.data.product)] : [];
    });

    return ok(products);
  };

  return {
    fetchNewProducts: async (market) => {
      const key = `${market.country}/${market.language}`;
      const cached = cache.get(key);
      if (cached && cached.expiresAt > now()) return ok(cached.products);

      const result = await requestNewProducts(market);
      if (result.ok) cache.set(key, { expiresAt: now() + cacheTtlMs, products: result.value });
      return result;
    },
  };
};
