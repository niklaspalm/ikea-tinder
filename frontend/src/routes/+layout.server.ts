import { MARKET_COOKIE, parseMarket } from '$lib/markets';
import type { LayoutServerLoad } from './$types';

/** The chosen market comes from a cookie so every page knows it on the very first render. */
export const load: LayoutServerLoad = ({ cookies }) => ({
	market: parseMarket(cookies.get(MARKET_COOKIE))
});
