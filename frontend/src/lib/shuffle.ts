/** Mulberry32: a tiny, fast PRNG, so a shuffle can be reproduced from its seed. */
export const seededRandom = (seed: number): (() => number) => {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

/** Fisher–Yates on a copy. */
const shuffle = <T>(items: readonly T[], random: () => number): T[] => {
	const result = [...items];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[result[i], result[j]] = [result[j]!, result[i]!];
	}
	return result;
};

/**
 * Splits ranked items into `groupCount` consecutive groups (newest quarter, next quarter, …),
 * shuffles inside each group and keeps the groups in order. Every item stays, newer items
 * still come earlier overall, but the exact order differs per seed.
 */
export const shuffleWithinGroups = <T>(items: readonly T[], groupCount: number, random: () => number): T[] => {
	const groupSize = Math.ceil(items.length / Math.max(1, groupCount));
	if (groupSize === 0) return [];

	const result: T[] = [];
	for (let start = 0; start < items.length; start += groupSize) {
		result.push(...shuffle(items.slice(start, start + groupSize), random));
	}
	return result;
};
