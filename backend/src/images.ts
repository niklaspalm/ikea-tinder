import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { err, ok, type Result } from "./result.ts";

export const IMAGE_ROUTE_PREFIX = "/api/images/";

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const CONTENT_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
} as const;

type Extension = keyof typeof CONTENT_TYPES;

const isExtension = (value: string): value is Extension => Object.hasOwn(CONTENT_TYPES, value);

/** Whitelist for names coming in on the image route; also rules out path traversal. */
const FILE_NAME_PATTERN = /^[a-z0-9_]{1,80}\.(jpg|jpeg|png|webp|avif)$/;

/**
 * IKEA image URLs are localised per market (`/se/sv/.../konstrunda-pall-furu__1479802_pe1000090_s5.jpg`
 * vs `/us/en/.../konstrunda-stool-pine__1479802_pe1000090_s5.jpg`) but the suffix after `__`
 * identifies the same bytes, so keying on it stores each image once for every market.
 */
const IKEA_IMAGE_ID_PATTERN = /__(\d+_p[a-z]\d+(?:_s\d+)?)\.(jpg|jpeg|png|webp|avif)$/i;

const isIkeaHost = (hostname: string) => hostname === "ikea.com" || hostname.endsWith(".ikea.com");

const fileNameFor = (source: URL): string => {
  const match = IKEA_IMAGE_ID_PATTERN.exec(source.pathname);
  if (match?.[1] && match[2]) return `${match[1]}.${match[2]}`.toLowerCase();

  const extension = path.extname(source.pathname).slice(1).toLowerCase();
  const hash = createHash("sha256").update(source.href).digest("hex").slice(0, 40);
  return `${hash}.${isExtension(extension) ? extension : "jpg"}`;
};

export type StoredImage = { body: Uint8Array<ArrayBuffer>; contentType: string };

export type ImageError =
  | { kind: "unknown_image" }
  | { kind: "download_failed"; sourceUrl: string; message: string };

export type ImageStore = {
  /** Records an upstream image and returns the URL our server serves it from. Non-IKEA URLs pass through. */
  localize: (sourceUrl: string) => string;
  /** Downloads registered images that aren't on disk yet, in the background. */
  prefetch: (localUrls: readonly string[]) => void;
  read: (fileName: string) => Promise<Result<StoredImage, ImageError>>;
  sourceUrlOf: (fileName: string) => string | undefined;
};

type ImageStoreOptions = {
  dir: string;
  fetch?: typeof globalThis.fetch;
  prefetchConcurrency?: number;
};

export const createImageStore = ({
  dir,
  fetch = globalThis.fetch,
  prefetchConcurrency = 4,
}: ImageStoreOptions): ImageStore => {
  const sources = new Map<string, string>();
  const inFlight = new Map<string, Promise<Result<void, ImageError>>>();
  const queue: string[] = [];
  let activePrefetches = 0;

  /** Files already on disk, loaded once so "is it downloaded?" never touches the filesystem. */
  const stored = mkdir(dir, { recursive: true })
    .then(() => readdir(dir))
    .then((entries) => new Set(entries.filter((entry) => FILE_NAME_PATTERN.test(entry))));

  const download = async (fileName: string, sourceUrl: string): Promise<Result<void, ImageError>> => {
    const failed = (message: string) => err({ kind: "download_failed" as const, sourceUrl, message });

    let response: Response;
    try {
      response = await fetch(sourceUrl, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    } catch (cause) {
      return failed(cause instanceof Error ? cause.message : String(cause));
    }

    if (!response.ok) return failed(`status ${response.status}`);
    if (!response.headers.get("content-type")?.startsWith("image/")) return failed("response is not an image");

    const body = new Uint8Array(await response.arrayBuffer());
    if (body.byteLength === 0 || body.byteLength > MAX_IMAGE_BYTES) return failed(`unexpected size ${body.byteLength}`);

    // Write-then-rename so a crash mid-download never leaves a truncated image to be served later.
    const finalPath = path.join(dir, fileName);
    const tempPath = `${finalPath}.${process.pid}.${Date.now()}.tmp`;
    try {
      await writeFile(tempPath, body);
      await rename(tempPath, finalPath);
    } catch (cause) {
      await rm(tempPath, { force: true });
      return failed(cause instanceof Error ? cause.message : String(cause));
    }

    (await stored).add(fileName);
    return ok(undefined);
  };

  /** Downloads at most once per file, however many callers ask concurrently. */
  const ensure = async (fileName: string): Promise<Result<void, ImageError>> => {
    if ((await stored).has(fileName)) return ok(undefined);

    const pending = inFlight.get(fileName);
    if (pending) return pending;

    const sourceUrl = sources.get(fileName);
    if (!sourceUrl) return err({ kind: "unknown_image" });

    const attempt = download(fileName, sourceUrl).finally(() => inFlight.delete(fileName));
    inFlight.set(fileName, attempt);
    return attempt;
  };

  const pumpQueue = () => {
    while (activePrefetches < prefetchConcurrency) {
      const fileName = queue.shift();
      if (!fileName) return;

      activePrefetches++;
      void ensure(fileName)
        .then((result) => {
          if (!result.ok) console.warn(`[images] prefetch ${fileName} failed`, result.error);
        })
        .finally(() => {
          activePrefetches--;
          pumpQueue();
        });
    }
  };

  const fileNameFromLocalUrl = (localUrl: string) =>
    localUrl.startsWith(IMAGE_ROUTE_PREFIX) ? localUrl.slice(IMAGE_ROUTE_PREFIX.length) : undefined;

  return {
    localize: (sourceUrl) => {
      let source: URL;
      try {
        source = new URL(sourceUrl);
      } catch {
        return sourceUrl;
      }
      if (source.protocol !== "https:" || !isIkeaHost(source.hostname)) return sourceUrl;

      const fileName = fileNameFor(source);
      if (!sources.has(fileName)) sources.set(fileName, source.href);
      return `${IMAGE_ROUTE_PREFIX}${fileName}`;
    },

    prefetch: (localUrls) => {
      void stored.then((onDisk) => {
        for (const localUrl of localUrls) {
          const fileName = fileNameFromLocalUrl(localUrl);
          if (!fileName || onDisk.has(fileName) || inFlight.has(fileName) || queue.includes(fileName)) continue;
          queue.push(fileName);
        }
        pumpQueue();
      });
    },

    read: async (fileName) => {
      if (!FILE_NAME_PATTERN.test(fileName)) return err({ kind: "unknown_image" });

      const ensured = await ensure(fileName);
      if (!ensured.ok) return ensured;

      const extension = path.extname(fileName).slice(1);
      const contentType = isExtension(extension) ? CONTENT_TYPES[extension] : "application/octet-stream";
      return ok({ body: new Uint8Array(await readFile(path.join(dir, fileName))), contentType });
    },

    sourceUrlOf: (fileName) => sources.get(fileName),
  };
};
