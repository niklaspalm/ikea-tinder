/**
 * IKEA markets (country → languages) that the product search API serves.
 * IKEA exposes no public market index, so this list was verified by probing
 * https://sik.search.blue.cdtapps.com/{country}/{language}/search on 2026-10-01.
 */
const SUPPORTED_MARKETS = {
  ae: ["en", "ar"],
  at: ["de", "en"],
  au: ["en"],
  be: ["nl", "fr", "en"],
  bh: ["en", "ar"],
  ca: ["en", "fr"],
  ch: ["de", "fr", "it", "en"],
  cl: ["es"],
  cn: ["zh"],
  co: ["es"],
  cz: ["cs", "en"],
  de: ["de", "en"],
  dk: ["da"],
  ee: ["et", "en"],
  eg: ["en", "ar"],
  es: ["es", "ca", "eu", "gl", "en"],
  fi: ["fi", "sv", "en"],
  fr: ["fr"],
  gb: ["en"],
  hr: ["hr"],
  hu: ["hu"],
  ie: ["en"],
  il: ["he"],
  in: ["en"],
  it: ["it"],
  jo: ["en", "ar"],
  jp: ["ja", "en"],
  kr: ["ko", "en"],
  kw: ["en", "ar"],
  lt: ["lt", "en"],
  lv: ["lv", "en"],
  ma: ["fr", "ar"],
  mx: ["es"],
  my: ["en", "ms"],
  nl: ["nl", "en"],
  no: ["no", "en"],
  nz: ["en"],
  om: ["en", "ar"],
  ph: ["en"],
  pl: ["pl"],
  pt: ["pt", "en"],
  qa: ["en", "ar"],
  ro: ["ro"],
  rs: ["sr"],
  sa: ["ar", "en"],
  se: ["sv", "en"],
  sg: ["en"],
  si: ["sl"],
  sk: ["sk"],
  th: ["th", "en"],
  ua: ["uk"],
  us: ["en", "es"],
} as const satisfies Record<string, readonly [string, ...string[]]>;

export type CountryCode = keyof typeof SUPPORTED_MARKETS;
export type Market = { country: CountryCode; language: string };

export type MarketLanguage = { code: string; name: string };
export type MarketCountry = {
  code: CountryCode;
  name: string;
  languages: MarketLanguage[];
};

export const isSupportedMarket = (country: string, language: string): country is CountryCode =>
  Object.hasOwn(SUPPORTED_MARKETS, country) &&
  (SUPPORTED_MARKETS[country as CountryCode] as readonly string[]).includes(language);

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

/** Language names are endonyms ("svenska", "Deutsch") so users recognise their own. */
const languageEndonym = (code: string): string =>
  new Intl.DisplayNames([code], { type: "language" }).of(code) ?? code;

export const listMarkets = (): MarketCountry[] =>
  (Object.entries(SUPPORTED_MARKETS) as [CountryCode, readonly string[]][])
    .map(([code, languages]) => ({
      code,
      name: regionNames.of(code.toUpperCase()) ?? code,
      languages: languages.map((language) => ({ code: language, name: languageEndonym(language) })),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
