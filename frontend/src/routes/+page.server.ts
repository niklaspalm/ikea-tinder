import { fail, redirect } from '@sveltejs/kit';
import type { Product, ProductsResponse } from 'ikea-tinder-backend/server';
import { MARKET_COOKIE, marketKey, parseMarket } from '$lib/markets';
import { seededRandom, shuffleWithinGroups } from '$lib/shuffle';
import type { Actions, PageServerLoad } from './$types';

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Seed for the deck order. A session cookie, so the order is stable while browsing
 * (going to Matches and back keeps the same next card) but new in the next session.
 */
const SHUFFLE_COOKIE = 'ikea-tinder-shuffle';
/** The newest products are split into this many groups; order is randomised within each. */
const NEWNESS_GROUPS = 4;

/** What the swipe page receives once IKEA has answered. */
export type DeckResult = { products: Product[]; failed: false } | { products: null; failed: true };

/**
 * Loads the swipe deck for the chosen market. The request goes through SvelteKit's
 * fetch, which hands /api/* straight to the in-process Hono API (hooks.server.ts):
 * no network hop, and image URLs come back already pointing at our own server.
 *
 * The deck is returned as an unawaited promise, so SvelteKit streams it: the page
 * renders right away with a loading screen instead of a blank tab while IKEA is slow.
 */
export const load: PageServerLoad = async ({ parent, fetch, cookies }) => {
	const { market } = await parent();
	if (!market) return { deck: null };

	// Cookies can only be set before the response starts streaming.
	let seed = Number(cookies.get(SHUFFLE_COOKIE));
	if (!Number.isSafeInteger(seed)) {
		seed = crypto.getRandomValues(new Uint32Array(1))[0]!;
		cookies.set(SHUFFLE_COOKIE, String(seed), { path: '/', httpOnly: true, sameSite: 'lax' });
	}

	const loadDeck = async (): Promise<DeckResult> => {
		try {
			const response = await fetch(`/api/markets/${marketKey(market)}/products`);
			if (!response.ok) return { products: null, failed: true };
			const body: ProductsResponse = await response.json();
			const products = shuffleWithinGroups(body.products, NEWNESS_GROUPS, seededRandom(seed));
			return { products, failed: false };
		} catch {
			return { products: null, failed: true };
		}
	};

	return { deck: loadDeck() };
};

export const actions: Actions = {
	/** A plain form post, so choosing a country works before (or without) JavaScript. */
	selectMarket: async ({ request, cookies }) => {
		const market = parseMarket((await request.formData()).get('market')?.toString());
		if (!market) return fail(400, { invalidMarket: true });

		cookies.set(MARKET_COOKIE, marketKey(market), {
			path: '/',
			maxAge: ONE_YEAR,
			httpOnly: true,
			sameSite: 'lax'
		});
		redirect(303, '/');
	}
};
