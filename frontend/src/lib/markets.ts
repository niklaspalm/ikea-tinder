import type { Market } from 'ikea-tinder-backend/server';
import { getLocale } from '$lib/paraglide/runtime';

/** The markets offered in the UI for now. Each pairs a country with the language IKEA serves it in. */
export const SELECTABLE_MARKETS = [
	{ country: 'dk', language: 'da' },
	{ country: 'gb', language: 'en' },
	{ country: 'se', language: 'sv' },
	{ country: 'de', language: 'de' }
] as const satisfies readonly Market[];

export type SelectableMarket = (typeof SELECTABLE_MARKETS)[number];
export type SelectableCountry = SelectableMarket['country'];

export const marketKey = ({ country, language }: Market) => `${country}/${language}`;

/** Country name in the current UI language ("Sweden", "Schweden"), straight from the platform. */
export const countryName = (country: string): string =>
	new Intl.DisplayNames([getLocale()], { type: 'region' }).of(country.toUpperCase()) ?? country;

/** Cookie holding the chosen market ("se/sv"), so the server can render the right page on first load. */
export const MARKET_COOKIE = 'ikea-tinder-market';

/** Accepts only the markets offered in the UI; anything else (stale or tampered values) reads as "not chosen". */
export const parseMarket = (value: string | null | undefined): SelectableMarket | null =>
	SELECTABLE_MARKETS.find((market) => marketKey(market) === value) ?? null;
