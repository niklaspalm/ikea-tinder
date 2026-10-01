import { createContext } from 'svelte';
import type { Product } from 'ikea-tinder-backend/server';

/**
 * What the user decided per product, saved in localStorage per market (products,
 * prices and names differ between markets). Likes keep a product snapshot so the
 * Matches page works without refetching; dislikes only need the ID.
 */
export type Decision =
	| { kind: 'like'; product: Product; decidedAt: number }
	| { kind: 'dislike'; decidedAt: number };

export type DecisionKind = Decision['kind'];

const STORAGE_PREFIX = 'ikea-tinder:decisions:';
const storageKey = (market: string) => `${STORAGE_PREFIX}v1:${market}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

/** Storage is outside our control (old versions, manual edits), so keep only well-formed entries. */
const isDecision = (value: unknown): value is Decision => {
	if (!isRecord(value) || typeof value.decidedAt !== 'number') return false;
	if (value.kind === 'dislike') return true;
	return value.kind === 'like' && isRecord(value.product) && typeof value.product.id === 'string';
};

const readDecisions = (market: string): Record<string, Decision> => {
	try {
		const parsed: unknown = JSON.parse(localStorage.getItem(storageKey(market)) ?? '{}');
		if (!isRecord(parsed)) return {};
		return Object.fromEntries(Object.entries(parsed).filter(([, decision]) => isDecision(decision))) as Record<
			string,
			Decision
		>;
	} catch {
		return {};
	}
};

/**
 * One store per app instance, shared through context rather than a module-level
 * singleton: module state on the server would be shared between all visitors.
 * It only loads in the browser (from the layout), so it stays empty during SSR.
 */
export const createDecisionStore = () => {
	let market = $state<string | null>(null);
	let decisions = $state<Record<string, Decision>>({});

	const matches = $derived(
		Object.values(decisions)
			.filter((decision) => decision.kind === 'like')
			.sort((a, b) => b.decidedAt - a.decidedAt)
			.map((decision) => decision.product)
	);

	const persist = () => {
		if (!market) return;
		try {
			localStorage.setItem(storageKey(market), JSON.stringify(decisions));
		} catch {
			// Storage full or blocked: decisions still apply for this visit.
		}
	};

	return {
		/** False until the browser has read storage; render placeholders until then to avoid a flash. */
		get loaded() {
			return market !== null;
		},
		get matches() {
			return matches;
		},
		load(marketKey: string) {
			market = marketKey;
			decisions = readDecisions(marketKey);
		},
		kindOf(productId: string): DecisionKind | undefined {
			return decisions[productId]?.kind;
		},
		decide(product: Product, kind: DecisionKind) {
			decisions[product.id] =
				kind === 'like'
					? { kind, product: $state.snapshot(product), decidedAt: Date.now() }
					: { kind, decidedAt: Date.now() };
			persist();
		},
		/** Forgets every like and dislike, in every market, on this device. */
		resetAll() {
			try {
				// Collect first: removing while iterating shifts localStorage indexes.
				const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index));
				for (const key of keys) if (key?.startsWith(STORAGE_PREFIX)) localStorage.removeItem(key);
			} catch {
				// Storage blocked: clearing the in-memory state below is all we can do.
			}
			decisions = {};
		},
		/** Puts every disliked product back in the swipe deck. */
		clearDislikes() {
			decisions = Object.fromEntries(Object.entries(decisions).filter(([, decision]) => decision.kind === 'like'));
			persist();
		}
	};
};

export type DecisionStore = ReturnType<typeof createDecisionStore>;

export const [getDecisionStore, setDecisionStore] = createContext<DecisionStore>();
