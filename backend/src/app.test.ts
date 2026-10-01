import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "./app.ts";
import { createIkeaClient, PRODUCT_CACHE_TTL_MS } from "./ikea/client.ts";
import { createImageStore } from "./images.ts";

const MAIN_IMAGE_URL = "https://www.ikea.com/se/sv/images/products/konstrunda-pall-furu__1479802_pe1000090_s5.jpg";
const MAIN_IMAGE_LOCAL_URL = "/api/images/1479802_pe1000090_s5.jpg";
const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);

const upstreamProduct = {
  id: "80623716",
  name: "KONSTRUNDA",
  typeName: "Pall",
  validDesignText: "furu",
  mainImageUrl: MAIN_IMAGE_URL,
  mainImageAlt: "A pine stool",
  pipUrl: "https://www.ikea.com/se/sv/p/konstrunda-pall-furu-80623716/",
  ratingValue: 4,
  ratingCount: 1,
  salesPrice: {
    currencyCode: "SEK",
    numeral: 449,
    current: { prefix: "", wholeNumber: "449", separator: "", decimals: "", suffix: ":-" },
  },
};

const searchResponse = (items: unknown[]) => ({
  results: [{ component: "PRIMARY_AREA", items }],
});

const productsResponse = (...products: object[]) =>
  Response.json(searchResponse(products.map((product) => ({ type: "PRODUCT", product }))));

const jpegResponse = () => new Response(JPEG_BYTES, { headers: { "content-type": "image/jpeg" } });

const imageDirs: string[] = [];
afterEach(async () => {
  await Promise.all(imageDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

const createTempImageDir = async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "ikea-tinder-images-"));
  imageDirs.push(dir);
  return dir;
};

type SetupOptions = {
  respondImage?: () => Response | Promise<Response>;
  imageDir?: string;
  /** Off by default so background downloads don't race the temp dir cleanup. */
  prefetch?: boolean;
};

const appWithUpstream = async (
  respond: () => Response | Promise<Response>,
  { respondImage = jpegResponse, imageDir, prefetch = false }: SetupOptions = {},
) => {
  const fetch = vi.fn<typeof globalThis.fetch>(async () => respond());
  const imageFetch = vi.fn<typeof globalThis.fetch>(async () => respondImage());
  const dir = imageDir ?? (await createTempImageDir());
  const images = createImageStore({ dir, fetch: imageFetch, prefetchConcurrency: prefetch ? 4 : 0 });
  return { fetch, imageFetch, dir, app: createApp({ ikea: createIkeaClient({ fetch }), images }) };
};

describe("GET /api/markets", () => {
  it("lists countries with their languages", async () => {
    const { app } = await appWithUpstream(() => Response.json({}));
    const res = await app.request("/api/markets");
    const markets: unknown = await res.json();

    expect(res.status).toBe(200);
    expect(markets).toContainEqual({
      code: "se",
      name: "Sweden",
      languages: [
        { code: "sv", name: "svenska" },
        { code: "en", name: "English" },
      ],
    });
  });
});

describe("GET /api/markets/:country/:language/products", () => {
  it("returns normalised products and skips non-product items", async () => {
    const { app, fetch } = await appWithUpstream(() =>
      Response.json(searchResponse([{ type: "PRODUCT", product: upstreamProduct }, { type: "PLANNER" }])),
    );

    const res = await app.request("/api/markets/se/sv/products");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      market: { country: "se", language: "sv" },
      count: 1,
      products: [
        {
          id: "80623716",
          name: "KONSTRUNDA",
          typeName: "Pall",
          designText: "furu",
          imageUrl: MAIN_IMAGE_LOCAL_URL,
          imageAlt: "A pine stool",
          contextImageUrl: null,
          url: upstreamProduct.pipUrl,
          price: { amount: 449, currency: "SEK", formatted: "449:-", previous: null },
          rating: { value: 4, count: 1 },
          images: [{ url: MAIN_IMAGE_LOCAL_URL, alt: "A pine stool" }],
          measurement: null,
          badge: null,
          colors: [],
          categories: [],
          variantCount: 0,
        },
      ],
    });

    const [url, init] = fetch.mock.calls[0] ?? [];
    expect(String(url)).toBe("https://sik.search.blue.cdtapps.com/se/sv/search?c=listaf&v=20250507");
    expect(JSON.parse(String(init?.body)).components[0].window).toEqual({ offset: 0, size: 200 });
  });


  it("maps product details for the product view", async () => {
    const richProduct = {
      ...upstreamProduct,
      salesPrice: {
        ...upstreamProduct.salesPrice,
        previous: { prefix: "", wholeNumber: "549", separator: "", decimals: "", suffix: ":-" },
        prevPriceLabel: "Tidigare lägsta pris",
      },
      itemMeasureReferenceText: "45x45 cm",
      badge: { type: "TOP_SELLER", text: "Bästsäljare" },
      colors: [{ name: "vit", id: "10156", hex: "ffffff" }, { name: "flerfärgad", id: "10583" }],
      categoryPath: [{ name: "Bord & stolar", key: "fu002" }, { name: "Pallar", key: "22659" }],
      gprDescription: { numberOfVariants: 3, variants: [] },
      allProductImage: [
        { type: "MAIN_PRODUCT_IMAGE", url: MAIN_IMAGE_URL, altText: "A pine stool" },
        {
          type: "CONTEXT_PRODUCT_IMAGE",
          url: "https://www.ikea.com/se/sv/images/products/konstrunda-pall-furu__1552497_pe1023319_s5.jpg",
        },
      ],
    };
    const { app } = await appWithUpstream(() => productsResponse(richProduct));

    const res = await app.request("/api/markets/se/sv/products");
    expect(await res.json()).toMatchObject({
      products: [
        {
          price: { formatted: "449:-", previous: { label: "Tidigare lägsta pris", formatted: "549:-" } },
          images: [
            { url: MAIN_IMAGE_LOCAL_URL, alt: "A pine stool" },
            { url: "/api/images/1552497_pe1023319_s5.jpg", alt: "A pine stool" },
          ],
          measurement: "45x45 cm",
          badge: "Bästsäljare",
          colors: [
            { name: "vit", hex: "#ffffff" },
            { name: "flerfärgad", hex: null },
          ],
          categories: ["Bord & stolar", "Pallar"],
          variantCount: 3,
        },
      ],
    });
  });

  it("keeps a product when only its supplementary details are malformed", async () => {
    const { app } = await appWithUpstream(() =>
      productsResponse({ ...upstreamProduct, colors: "red", badge: 42, allProductImage: [{ url: 1 }] }),
    );

    const res = await app.request("/api/markets/se/sv/products");
    expect(await res.json()).toMatchObject({
      count: 1,
      products: [{ colors: [], badge: null, images: [{ url: MAIN_IMAGE_LOCAL_URL }] }],
    });
  });

  it("caches upstream results per market", async () => {
    const { app, fetch } = await appWithUpstream(() => Response.json(searchResponse([])));
    await app.request("/api/markets/se/sv/products");
    await app.request("/api/markets/se/sv/products");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("rejects malformed market codes with 400", async () => {
    const { app, fetch } = await appWithUpstream(() => Response.json({}));
    const res = await app.request("/api/markets/SWE/sv/products");
    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects unsupported markets with 404 without calling IKEA", async () => {
    const { app, fetch } = await appWithUpstream(() => Response.json({}));
    const res = await app.request("/api/markets/se/de/products");
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: { code: "unknown_market" } });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("maps upstream failures to 502", async () => {
    const { app } = await appWithUpstream(() => new Response("nope", { status: 503 }));
    const res = await app.request("/api/markets/se/sv/products");
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({ error: { code: "upstream_status" } });
  });

  it("maps network failures to 504", async () => {
    const { app } = await appWithUpstream(() => {
      throw new TypeError("fetch failed");
    });
    const res = await app.request("/api/markets/se/sv/products");
    expect(res.status).toBe(504);
  });
});

describe("IKEA product cache", () => {
  const SE = { country: "se", language: "sv" } as const;
  const MINUTE = 60_000;

  const clientWithClock = (respond: () => Response | Promise<Response>) => {
    let time = 0;
    const fetch = vi.fn<typeof globalThis.fetch>(async () => respond());
    const client = createIkeaClient({ fetch, now: () => time });
    return { client, fetch, advance: (ms: number) => (time += ms) };
  };

  it("keeps IKEA responses for 30 minutes", () => {
    expect(PRODUCT_CACHE_TTL_MS).toBe(30 * MINUTE);
  });

  it("reuses a response until the 30 minutes are up, then asks IKEA again", async () => {
    const { client, fetch, advance } = clientWithClock(() => productsResponse(upstreamProduct));

    await client.fetchNewProducts(SE);
    advance(30 * MINUTE - 1);
    await client.fetchNewProducts(SE);
    expect(fetch).toHaveBeenCalledTimes(1);

    advance(1);
    await client.fetchNewProducts(SE);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("caches each market separately", async () => {
    const { client, fetch } = clientWithClock(() => productsResponse(upstreamProduct));
    await client.fetchNewProducts(SE);
    await client.fetchNewProducts({ country: "de", language: "de" });
    await client.fetchNewProducts(SE);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("shares one IKEA call between visitors arriving at the same time", async () => {
    const { client, fetch } = clientWithClock(
      () => new Promise<Response>((resolve) => setTimeout(() => resolve(productsResponse(upstreamProduct)), 20)),
    );
    const results = await Promise.all([1, 2, 3].map(() => client.fetchNewProducts(SE)));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(results.every((result) => result.ok && result.value.length === 1)).toBe(true);
  });

  it("does not cache failures, so the next visitor retries IKEA", async () => {
    let fail = true;
    const { client, fetch } = clientWithClock(() =>
      fail ? new Response("busy", { status: 503 }) : productsResponse(upstreamProduct),
    );
    expect((await client.fetchNewProducts(SE)).ok).toBe(false);
    fail = false;
    expect((await client.fetchNewProducts(SE)).ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("tells HTTP clients to cache products for the same 30 minutes", async () => {
    const { app } = await appWithUpstream(() => productsResponse(upstreamProduct));
    const res = await app.request("/api/markets/se/sv/products");
    expect(res.headers.get("cache-control")).toBe("public, max-age=1800");
  });
});

describe("GET /api/images/:file", () => {
  it("downloads an image on first request and serves it from disk afterwards", async () => {
    const { app, imageFetch, dir } = await appWithUpstream(() => productsResponse(upstreamProduct));
    await app.request("/api/markets/se/sv/products");

    for (let i = 0; i < 2; i++) {
      const res = await app.request(MAIN_IMAGE_LOCAL_URL);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toBe("image/jpeg");
      expect(new Uint8Array(await res.arrayBuffer())).toEqual(JPEG_BYTES);
    }

    expect(imageFetch).toHaveBeenCalledTimes(1);
    expect(String(imageFetch.mock.calls[0]?.[0])).toBe(MAIN_IMAGE_URL);
    expect(await readdir(dir)).toEqual(["1479802_pe1000090_s5.jpg"]);
  });

  it("prefetches product images in the background", async () => {
    const { app, imageFetch, dir } = await appWithUpstream(() => productsResponse(upstreamProduct), { prefetch: true });
    await app.request("/api/markets/se/sv/products");

    await vi.waitFor(async () => expect(await readdir(dir)).toEqual(["1479802_pe1000090_s5.jpg"]));
    await app.request(MAIN_IMAGE_LOCAL_URL);
    expect(imageFetch).toHaveBeenCalledTimes(1);
  });

  it("stores an image once even when markets use localised URLs for it", async () => {
    const usProduct = {
      ...upstreamProduct,
      mainImageUrl: "https://www.ikea.com/us/en/images/products/konstrunda-stool-pine__1479802_pe1000090_s5.jpg",
    };
    const { app } = await appWithUpstream(() => productsResponse(usProduct));
    const res = await app.request("/api/markets/us/en/products");
    expect(await res.json()).toMatchObject({ products: [{ imageUrl: MAIN_IMAGE_LOCAL_URL }] });
  });

  it("serves images downloaded by a previous server run without refetching", async () => {
    const imageDir = await createTempImageDir();
    const first = await appWithUpstream(() => productsResponse(upstreamProduct), { imageDir });
    await first.app.request("/api/markets/se/sv/products");
    await first.app.request(MAIN_IMAGE_LOCAL_URL);

    const second = await appWithUpstream(() => productsResponse(upstreamProduct), { imageDir });
    const res = await second.app.request(MAIN_IMAGE_LOCAL_URL);
    expect(res.status).toBe(200);
    expect(second.imageFetch).not.toHaveBeenCalled();
  });

  it("leaves non-IKEA image URLs untouched", async () => {
    const { app } = await appWithUpstream(() =>
      productsResponse({ ...upstreamProduct, mainImageUrl: "https://example.com/stool.jpg" }),
    );
    const res = await app.request("/api/markets/se/sv/products");
    expect(await res.json()).toMatchObject({ products: [{ imageUrl: "https://example.com/stool.jpg" }] });
  });

  it("redirects to IKEA when the download fails", async () => {
    const { app } = await appWithUpstream(() => productsResponse(upstreamProduct), {
      respondImage: () => new Response("gone", { status: 500 }),
    });
    await app.request("/api/markets/se/sv/products");

    const res = await app.request(MAIN_IMAGE_LOCAL_URL);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(MAIN_IMAGE_URL);
  });

  it("returns 404 for images it has never seen, including path traversal attempts", async () => {
    const { app, imageFetch } = await appWithUpstream(() => productsResponse(upstreamProduct));
    for (const file of ["999_pe1_s5.jpg", "..%2F..%2Fpackage.json", "..%5Cpackage.json"]) {
      const res = await app.request(`/api/images/${file}`);
      expect(res.status).toBe(404);
    }
    expect(imageFetch).not.toHaveBeenCalled();
  });
});
